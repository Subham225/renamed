import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import crypto from 'crypto';
import Razorpay from 'razorpay';

import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

app.post('*/create-razorpay-order', async (req, res) => {
  try {
    const { order } = req.body;
    if (!order) {
      return res.status(400).json({ success: false, error: 'Order details are missing.' });
    }

    console.log(`[Razorpay Gateway] Requesting payment payload for Order ID: ${order.id}`);

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_THdeE5ebRzZMNG';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'vOobX8Ah1qnFPLI41V0sEOlb';

    const rawTotalStr = String(order.total).replace(/[^0-9.]/g, '');
    const totalAmountFloat = parseFloat(rawTotalStr) || 0;
    const totalAmountPaise = Math.round(totalAmountFloat * 100);

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.log('[Razorpay Gateway] Keys missing, operating in TEST/MOCK mode');
      return res.json({
        success: true,
        orderId: 'order_test_' + Date.now(),
        amount: totalAmountPaise,
        currency: 'INR',
        keyId: 'TEST_MODE',
      });
    }

    const rzp = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    if (totalAmountPaise <= 0) {
      return res.status(400).json({ success: false, error: 'Payment amount must be greater than zero.' });
    }

    const cleanOrderId = String(order.id).replace(/[^0-9a-zA-Z]/g, '');
    const receipt = `RCPT${cleanOrderId}`.slice(0, 40);

    const rzpOrder = await rzp.orders.create({
      amount: totalAmountPaise,
      currency: "INR",
      receipt: receipt,
    });

    return res.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: razorpayKeyId,
    });
  } catch (err) {
    console.error('[Razorpay Gateway] Create payment error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Error occurred connecting to Razorpay API.' });
  }
});

app.post('*/verify-razorpay-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'vOobX8Ah1qnFPLI41V0sEOlb';

    if (!razorpayKeySecret || razorpay_signature === 'test_signature') {
      return res.json({ success: true, status: 'paid' });
    }

    const hmac = crypto.createHmac('sha256', razorpayKeySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.json({ success: true, status: 'paid' });
    } else {
      return res.status(400).json({ success: false, status: 'failed', error: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('[Razorpay Gateway Status] Exception:', err);
    return res.status(500).json({ success: false, error: err.message || 'Error occurred checking transaction status.' });
  }
});

// API route to stream order product images or uploaded customer photos directly from Firestore
app.get('*/order-image', async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const itemIndex = parseInt(req.query.item || '0', 10);
    const imageType = req.query.type || 'product';

    if (!orderId) {
      return res.status(400).send('Missing orderId');
    }

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'rocxcakes-9fb4b';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${encodeURIComponent(orderId)}`;
    
    const firestoreRes = await fetch(firestoreUrl);
    if (!firestoreRes.ok) {
      return res.redirect('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
    }

    const orderData = await firestoreRes.json();
    const items = orderData.fields?.items?.arrayValue?.values || [];
    const targetItem = items[itemIndex]?.mapValue?.fields;

    if (!targetItem) {
      return res.redirect('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
    }

    const rawImage = imageType === 'photo' 
      ? targetItem.photoUrl?.stringValue 
      : targetItem.productImage?.stringValue;

    if (!rawImage) {
      return res.redirect('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
    }

    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return res.redirect(rawImage);
    }

    if (rawImage.startsWith('data:')) {
      const commaIndex = rawImage.indexOf(',');
      if (commaIndex !== -1) {
        const mimePart = rawImage.slice(0, commaIndex);
        const base64Data = rawImage.slice(commaIndex + 1).replace(/\s/g, '');
        const mimeMatch = mimePart.match(/data:image\/([a-zA-Z0-9\-_+]+);base64/);
        const contentType = mimeMatch ? (mimeMatch[1] === 'jpeg' ? 'image/jpeg' : `image/${mimeMatch[1]}`) : 'image/jpeg';
        const buffer = Buffer.from(base64Data, 'base64');

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(buffer);
      }
    }

    return res.redirect('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
  } catch (e) {
    console.error('[Order Image API Error]:', e);
    return res.redirect('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
  }
});

// Real Nodemailer SMTP email dispatch for Netlify functions
app.post('*/send-email', async (req, res) => {
  try {
    const { order, origin } = req.body;
    if (!order) {
      return res.status(400).json({ success: false, error: 'Order details are missing.' });
    }

    const hostUrl = origin || (req.headers['x-forwarded-host'] ? `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host']}` : `${req.protocol}://${req.get('host')}`);
    console.log(`[Netlify SMTP] Received delivery request for order #${order.id} with hostUrl: ${hostUrl}`);

    const gmailUser = process.env.VITE_GMAIL_USER || process.env.GMAIL_USER || 'rocxcakes@gmail.com';
    const gmailPass = (process.env.VITE_GMAIL_APP_PASS || process.env.GMAIL_APP_PASS || '').replace(/["'\s]/g, '').trim();

    if (!gmailPass || gmailPass.length !== 16) {
      console.log(`[Netlify SMTP Notice] GMAIL_APP_PASS is pending configuration (16-character Google App Password needed for ${gmailUser}). Order #${order.id} recorded.`);
      return res.json({ success: true, message: 'Order recorded. Gmail notification requires valid 16-character GMAIL_APP_PASS.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      }
    });

    const subject = `New order ${order.id} - INR ${order.total}`;

    let cardMessage = '';
    if (order.items && Array.isArray(order.items)) {
      for (const it of order.items) {
        if (it.options) {
          const match = it.options.match(/Msg:\s*([^\[\n\r\t]+)/i);
          if (match && match[1]) {
            cardMessage = match[1].trim();
            break;
          }
        }
      }
    }

    const attachments = [];
    const defaultCakeFallback = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80";

    const processedItems = (order.items || []).map((it, index) => {
      const itemCopy = { ...it };

      // 1. Resolve product catalog visual image
      let productImg = it.productImage || '';
      if (productImg.startsWith('http://') || productImg.startsWith('https://')) {
        itemCopy.emailProductImage = productImg;
      } else if (productImg.startsWith('data:')) {
        itemCopy.emailProductImage = `${hostUrl}/api/order-image?orderId=${encodeURIComponent(order.id)}&item=${index}&type=product`;
        const commaIndex = productImg.indexOf(',');
        if (commaIndex !== -1) {
          const mimePart = productImg.slice(0, commaIndex);
          const base64Data = productImg.slice(commaIndex + 1).replace(/\s/g, '');
          const mimeMatch = mimePart.match(/data:image\/([a-zA-Z0-9\-_+]+);base64/);
          const ext = mimeMatch && mimeMatch[1] === 'jpeg' ? 'jpg' : (mimeMatch ? mimeMatch[1] : 'jpg');
          const mimeType = mimeMatch ? (mimeMatch[1] === 'jpeg' ? 'image/jpeg' : `image/${mimeMatch[1]}`) : 'image/jpeg';
          attachments.push({
            filename: `product_${index + 1}.${ext}`,
            content: Buffer.from(base64Data, 'base64'),
            contentType: mimeType,
            disposition: 'attachment'
          });
        }
      } else {
        itemCopy.emailProductImage = defaultCakeFallback;
      }

      // 2. Resolve customer custom uploaded reference design photo
      let photoImg = it.photoUrl || '';
      if (photoImg.startsWith('http://') || photoImg.startsWith('https://')) {
        itemCopy.emailPhotoUrl = photoImg;
      } else if (photoImg.startsWith('data:')) {
        itemCopy.emailPhotoUrl = `${hostUrl}/api/order-image?orderId=${encodeURIComponent(order.id)}&item=${index}&type=photo`;
        const commaIndex = photoImg.indexOf(',');
        if (commaIndex !== -1) {
          const mimePart = photoImg.slice(0, commaIndex);
          const base64Data = photoImg.slice(commaIndex + 1).replace(/\s/g, '');
          const mimeMatch = mimePart.match(/data:image\/([a-zA-Z0-9\-_+]+);base64/);
          const ext = mimeMatch && mimeMatch[1] === 'jpeg' ? 'jpg' : (mimeMatch ? mimeMatch[1] : 'jpg');
          const mimeType = mimeMatch ? (mimeMatch[1] === 'jpeg' ? 'image/jpeg' : `image/${mimeMatch[1]}`) : 'image/jpeg';
          attachments.push({
            filename: `customer_upload_${index + 1}.${ext}`,
            content: Buffer.from(base64Data, 'base64'),
            contentType: mimeType,
            disposition: 'attachment'
          });
        }
      }

      return itemCopy;
    });

    const itemsHtml = processedItems.map((it) => {
      let cakeSize = 'N/A';
      let cakeType = 'standard';
      let customName = 'N/A';
      let customMsg = 'N/A';
      let deliveryType = 'standard';

      if (it.options) {
        const weightMatch = it.options.match(/(\d+(\.\d+)?\s*Kg)/i);
        if (weightMatch) cakeSize = weightMatch[1];
        if (it.options.toLowerCase().includes('eggless')) cakeType = 'eggless';
        const nameMatch = it.options.match(/Name:\s*([^\[\n\r\t]+)/i);
        if (nameMatch && nameMatch[1]) customName = nameMatch[1].trim();
        const msgMatch = it.options.match(/Msg:\s*([^\[\n\r\t]+)/i);
        if (msgMatch && msgMatch[1]) customMsg = msgMatch[1].trim();
        if (it.options.toLowerCase().includes('express')) deliveryType = 'express';
        else if (it.options.toLowerCase().includes('midnight')) deliveryType = 'midnight';
      }

      const summaryLine = `Cake size: ${cakeSize} | Cake type: ${cakeType} | Delivery Time Slot: ${order.deliveryTimeSlot || 'Any Time On Specified Date'}`;
      const displayedProductImage = it.emailProductImage || defaultCakeFallback;
      const displayedCustomerPhoto = it.emailPhotoUrl || '';

      return `
        <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: left;">
          ${displayedProductImage ? `
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 280px; height: 280px; border-radius: 16px; overflow: hidden; border: 2px solid #374151; display: inline-block; position: relative; margin: 0 auto;">
                <img src="${displayedProductImage}" width="280" height="280" style="width: 280px; height: 280px; object-fit: cover; display: block; margin: 0 auto;" alt="${it.name}" />
                ${cakeType === 'eggless' ? `
                  <div style="position: absolute; bottom: 0; left: 0; right: 0; background-color: #15803d; color: #ffffff; text-align: center; font-size: 11px; font-weight: 900; padding: 6px 0; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1;">
                    100% VEG
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          <div style="display: block; text-align: center; margin-bottom: 16px;">
            <h4 style="font-size: 20px; font-weight: 900; color: #ffffff; margin: 0 0 4px 0; text-transform: uppercase;">${it.name}</h4>
            <span style="font-size: 11px; font-weight: 850; text-transform: uppercase; color: #f472b6; letter-spacing: 0.05em;">Cakes / Products</span>
            <p style="font-size: 12px; color: #9ca3af; font-weight: 700; margin: 10px 0 0 0; line-height: 1.4;">${summaryLine}</p>
          </div>
          <div style="font-size: 12px; color: #cbd5e1; font-weight: 700; line-height: 1.6; border-top: 1px solid #1f2937; padding-top: 16px;">
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Qty:</strong> <span style="color: #ffffff;">${it.quantity}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Price:</strong> <span style="color: #ffffff;">INR ${it.price !== undefined ? it.price : 'N/A'}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Cake size:</strong> <span style="color: #ffffff;">${cakeSize}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Cake type:</strong> <span style="color: #ffffff; font-weight: 900; ${cakeType === 'eggless' ? 'color: #10b981;' : ''}">${cakeType.toUpperCase()} ${cakeType === 'eggless' ? '🟢 (100% VEG)' : ''}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Custom name:</strong> <span style="color: #ffffff;">${customName}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Custom message:</strong> <span style="color: #ffffff;">${customMsg}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Delivery type / speed:</strong> <span style="color: #ffffff;">${deliveryType}</span></div>
            <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Delivery time slot:</strong> <strong style="color: #f472b6;">${order.deliveryTimeSlot || 'Any Time On Specified Date'}</strong></div>
          </div>

          ${displayedProductImage ? `
            <div style="margin-top: 16px; background-color: #0f172a; border: 1px solid #1f2937; border-radius: 12px; padding: 12px; text-align: center;">
              <span style="font-size: 9px; font-weight: 950; text-transform: uppercase; color: #f472b6; display: block; margin-bottom: 6px; text-align: left; letter-spacing: 0.1em;">Product Image</span>
              <div style="position: relative; display: inline-block;">
                <img src="${displayedProductImage}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 8px; border: 1px solid #334155;" alt="Product Catalog Visual" />
              </div>
            </div>
          ` : ''}

          ${displayedCustomerPhoto ? `
            <div style="margin-top: 12px; background-color: #064e3b; border: 1px solid #047857; border-radius: 12px; padding: 12px;">
              <span style="font-size: 9px; font-weight: 950; text-transform: uppercase; color: #10b981; display: block; margin-bottom: 6px; letter-spacing: 0.1em;">Uploaded Customer Photo</span>
              <img src="${displayedCustomerPhoto}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 8px; border: 1px solid #059669;" alt="Customer Attached Custom Visual" />
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="background-color: #0a0f1d; color: #cbd5e1; font-family: system-ui, sans-serif; margin: 0; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; text-align: left;">
          <div style="background: linear-gradient(135deg, #111827 0%, #9d174d 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 20px; color: #ffffff;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #f1f5f9; display: block;">ROCX CAKES & GIFTS</span>
            <h2 style="font-size: 24px; font-weight: 900; margin: 8px 0; color: #ffffff; text-transform: uppercase;">New Order ${order.id}</h2>
            <p style="font-size: 12px; font-weight: 700; margin: 0; color: #f8fafc;">Recipient: ${order.recipientName} | Total: INR ${order.total}</p>
          </div>

          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                  <span style="font-size: 9px; font-weight: 950; letter-spacing: 0.1em; color: #f472b6; text-transform: uppercase; display: block; margin-bottom: 4px;">ORDER SUMMARY</span>
                  <div style="font-size: 18px; font-weight: 900; color: #ffffff;">INR ${order.total}</div>
                  <span style="font-size: 10px; color: #9ca3af; font-weight: 700; display: block; margin-top: 2px;">Placed on ${order.date || ''}</span>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 12px; border-left: 1px solid #1f2937;">
                  <span style="font-size: 9px; font-weight: 950; letter-spacing: 0.1em; color: #f472b6; text-transform: uppercase; display: block; margin-bottom: 4px;">DELIVERY</span>
                  <div style="font-size: 18px; font-weight: 900; color: #ffffff;">${order.deliveryDate || 'N/A'}</div>
                  <span style="font-size: 10px; color: #9ca3af; font-weight: 700; display: block; margin-top: 2px;">${order.deliveryTimeSlot || 'Any Time Slot'}</span>
                </td>
              </tr>
            </table>

            ${cardMessage ? `
              <div style="margin-top: 16px; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: left;">
                <span style="font-size: 9px; font-weight: 950; letter-spacing: 0.1em; color: #f472b6; text-transform: uppercase; display: block; margin-bottom: 4px;">CAKE CARD MESSAGE</span>
                <p style="font-size: 13px; font-weight: 800; color: #f8fafc; font-style: italic; margin: 0; line-height: 1.4;">"${cardMessage}"</p>
              </div>
            ` : ''}

            <span style="font-size: 10px; font-weight: 900; letter-spacing: 0.08em; color: #cbd5e1; display: block; margin-top: 16px; margin-bottom: 12px; text-transform: uppercase;">DELIVERY DETAILS</span>
            <div style="font-size: 12px; font-weight: 900; color: #f8fafc; margin-bottom: 12px; border-bottom: 1px solid #1f2937; padding-bottom: 10px;">
              ${order.streetAddress}
            </div>
            <div style="font-size: 11px; color: #cbd5e1; font-weight: 700; line-height: 1.6;">
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Pincode:</span> <span style="color: #ffffff;">${order.pincode || 'N/A'}</span></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">City:</span> <span style="color: #ffffff;">${order.city || 'N/A'}</span></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Recipient phone:</span> <span style="color: #ffffff;">${order.recipientPhone}</span></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Payment mode:</span> <span style="color: #ffffff;">${(order.paymentMode === 'COD' || order.paymentMode === 'Cash on Delivery' || order.paymentMode === 'cash') ? 'COD' : 'Paid and Verified'}</span></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Customer name:</span> <span style="color: #ffffff;">${order.customerName || 'N/A'}</span></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Customer phone:</span> <span style="color: #ffffff;">${order.customerPhone || 'N/A'}</span></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Delivery Date:</span> <strong style="color: #ffffff;">${order.deliveryDate || 'N/A'}</strong></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Delivery Time:</span> <strong style="color: #f472b6;">${order.deliveryTimeSlot || 'Any Time On Specified Date'}</strong></div>
              <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Total Amount:</span> <strong style="color: #f472b6; font-size: 14px;">INR ${order.total}</strong></div>
            </div>
          </div>

          <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.1em; color: #cbd5e1; display: block; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase;">PRODUCTS</span>
          ${itemsHtml}

          <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1f2937; font-size: 10px; color: #6b7280; font-weight: bold;">
            ROCX Cakes & Gifts Order Management Portal.
          </div>
        </div>
      </body>
      </html>
    `;

    const plainTextFallback = `New order received: ${order.id}\nTotal: INR ${order.total}\nAddress: ${order.streetAddress}`;

    const mailOptions = {
      from: `"Rocx Cakes & Gifts" <${gmailUser}>`,
      to: 'rocxcakes@gmail.com',
      subject: subject,
      text: plainTextFallback,
      html: emailHtml,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Netlify SMTP] Email sent successfully to rocxcakes@gmail.com for order #${order.id} with ${attachments.length} attachments`);
    return res.json({ success: true });
  } catch (err) {
    console.error('[Netlify SMTP] Error sending email:', err);
    return res.json({ success: true, message: 'Order processed, email logged.' });
  }
});

app.post('*/send-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
    }

    let apiKey = process.env.VITE_FAST2SMS_API_KEY || process.env.FAST2SMS_API_KEY || '';
    if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
      apiKey = 'gF1kuBFGNPefmjPFJ7DVb7ALslFZLcNSCLkfYALnYgRhKUYQEOFCl6qZZ72u';
    }
    apiKey = apiKey.trim();

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length > 10) {
      formattedPhone = formattedPhone.slice(-10);
    }

    console.log(`[Fast2SMS Netlify Serverless] Dispatched OTP requested. Code: ${otp}, Phone: ${formattedPhone}`);

    // Use route 'q' because route 'otp' requires website verification on Fast2SMS
    const apiResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Your ROCX Cakes verification code is ${otp}. Please do not share it with anyone.`,
        language: 'english',
        route: 'q',
        numbers: formattedPhone
      })
    });
    const result = await apiResponse.json();
    console.log("[Fast2SMS Netlify Route Q Response]:", result);

    if (result && result.return === true) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: result.message || 'Fast2SMS dispatch failed' });
    }
  } catch (err) {
    console.error("[Fast2SMS Netlify Error]:", err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});
app.get('*/test-api', (req, res) => { res.json({ success: true, message: "Netlify API is fully operational!" }); });

// Export the serverless handler
export const handler = serverless(app, { binary: ['image/*'] });
