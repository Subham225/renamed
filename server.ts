import crypto from 'crypto';
import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';

dotenv.config({ override: true });

// Dynamic OG tag injection helper
async function getDynamicOgTags(req: express.Request): Promise<{ title?: string, description?: string, image?: string }> {
  // Try extracting from query params (e.g. ?product=cake_rainbow_wonder)
  const productId = req.query.product as string;
  const categoryId = req.query.category as string;
  
  const hostUrl = `${req.protocol}://${req.get('host')}`;
  
  if (productId) {
    try {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'rocxcakes-9fb4b';
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${productId}`;
      
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.fields) {
          const name = data.fields.name?.stringValue || '';
          const description = data.fields.description?.stringValue || 'Premium customized cakes from Rocx Cakes';
          const imageStr = data.fields.image?.stringValue || '';
          
          if (name) {
            let imageUrl;
            if (imageStr.startsWith('http')) {
              imageUrl = imageStr;
            } else if (imageStr.startsWith('data:image/')) {
              imageUrl = `${hostUrl}/api/og-image?product=${productId}`;
            }

            return {
              title: `${name} | Rocx Cakes`,
              description,
              image: imageUrl
            };
          }
        }
      }
    } catch (e) {
      console.warn("[OG Tag Injector] Failed to fetch product from firestore", e);
    }
  }
  
  if (categoryId) {
    try {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'rocxcakes-9fb4b';
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/categories/${categoryId}`;
      
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.fields) {
          const name = data.fields.name?.stringValue || '';
          const imageStr = data.fields.image?.stringValue || '';
          
          if (name) {
            let imageUrl;
            if (imageStr.startsWith('http')) {
              imageUrl = imageStr;
            } else if (imageStr.startsWith('data:image/')) {
              imageUrl = `${hostUrl}/api/og-image?category=${categoryId}`;
            }

            return {
              title: `${name} Collection | Rocx Cakes`,
              description: `Explore our premium collection of ${name} at Rocx Cakes.`,
              image: imageUrl
            };
          }
        }
      }
    } catch (e) {
      console.warn("[OG Tag Injector] Failed to fetch category from firestore", e);
    }
  }
  
  return {};
}

function injectOgTags(template: string, ogTags: { title?: string, description?: string, image?: string }) {
  let modified = template;
  if (ogTags.title) {
    modified = modified.replace(/<title>.*?<\/title>/i, `<title>${ogTags.title}</title>`);
    modified = modified.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/>/i, `<meta property="og:title" content="${ogTags.title}" />`);
    modified = modified.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/>/i, `<meta name="twitter:title" content="${ogTags.title}" />`);
  }
  if (ogTags.image) {
    modified = modified.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/>/i, `<meta property="og:image" content="${ogTags.image}" />`);
    modified = modified.replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/>/i, `<meta name="twitter:image" content="${ogTags.image}" />`);
    modified = modified.replace(/"image":\s*"https:\/\/rocxcakes\.in\/logo\.png"/i, `"image": "${ogTags.image}"`);
  }
  if (ogTags.description) {
    modified = modified.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/>/i, `<meta property="og:description" content="${ogTags.description}" />`);
    modified = modified.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/>/i, `<meta name="twitter:description" content="${ogTags.description}" />`);
  }
  return modified;
}

async function startServer() {
  const app = express();
  
  // Custom CORS middleware to gracefully accept API requests from Netlify or other static hosts
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const PORT = 3000;

  // ==========================================
  // 🌟 ADMIN CONFIGURATION GATEWAY (HARDCODED FALLBACKS)
  // You can set these directly here in the code or configure them as environment variables on your host.
  // ==========================================
  let rawGmailUser = process.env.VITE_GMAIL_USER || process.env.GMAIL_USER || '';
  if (!rawGmailUser || rawGmailUser.trim() === '' || rawGmailUser === 'undefined') {
    rawGmailUser = 'rocxcakes@gmail.com';
  }
  let GMAIL_USER = rawGmailUser.replace(/["']/g, '').trim(); 
  
  // Clean up any common developer configuration typos and prepend standard email domain if missing
  const checkLower = GMAIL_USER.toLowerCase();
  if (checkLower === 'rocxcake' || checkLower === 'rocxcakes') {
    GMAIL_USER = 'rocxcakes@gmail.com';
  } else if (!GMAIL_USER.includes('@')) {
    GMAIL_USER = `${GMAIL_USER}@gmail.com`;
  }
  
  // 👉 PASTE YOUR 16-CHARACTER GOOGLE APP PASSWORD HERE:
  let rawGmailPass = process.env.VITE_GMAIL_APP_PASS || process.env.GMAIL_APP_PASS || '';
  if (!rawGmailPass || rawGmailPass.trim() === '' || rawGmailPass === 'undefined') {
    if (GMAIL_USER === 'rocxcakes@gmail.com') {
      rawGmailPass = 'pzht xgaf pxqq sxtn';
    } else {
      rawGmailPass = '';
    }
  }
  const GMAIL_APP_PASS = rawGmailPass.replace(/["'\s]/g, '').trim();
  
  console.log(`[SMTP Config] Loaded GMAIL_USER: "${GMAIL_USER}", App Pass Length: ${GMAIL_APP_PASS.length} chars (Obfuscated: ${GMAIL_APP_PASS.slice(0, 3)}...${GMAIL_APP_PASS.slice(-3)})`);
  // ==========================================
  // No global transporter; initialized dynamically inside the route handler


  // API route to securely dispatch order placement notifications
  app.post('/api/send-email', async (req, res) => {
    try {
      const { order } = req.body;
      if (!order) {
        return res.status(400).json({ success: false, error: 'Order details are missing.' });
      }

      console.log(`[SMTP Backend] Received delivery request for order #${order.id}`);

      // High-quality error routing check to catch misaligned custom variables (common rookie mistakes on Netlify/Render)
      if (GMAIL_USER !== 'rocxcakes@gmail.com' && (!GMAIL_APP_PASS || GMAIL_APP_PASS === 'pzhtxgafpxqqsxtn')) {
        const errMessage = `Custom GMAIL_USER ("${GMAIL_USER}") setup kora hoyeche, kinu custom GMAIL_APP_PASS (Gmail App Password) configure kora hoyni! Please set GMAIL_APP_PASS environment variable under Settings -> Secrets or Netlify UI.`;
        console.error(`[SMTP Backend Alignment Error]: ${errMessage}`);
        return res.status(400).json({ success: false, error: errMessage });
      }

      const subject = `New order ${order.id} - INR ${order.total}`;

      // Extract Cake Card Message if any
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

      // Extract attachments & rewrite photo urls to inline CIDs if they are base64 or remote URLs
      const attachments: any[] = [];
      const processedItems = await Promise.all(order.items.map(async (it: any, index: number) => {
        const itemCopy = { ...it };

        // 1. Convert customer-uploaded reference design photos (if base64)
        if (itemCopy.photoUrl && itemCopy.photoUrl.startsWith('data:')) {
          const commaIndex = itemCopy.photoUrl.indexOf(',');
          if (commaIndex !== -1) {
            const mimePart = itemCopy.photoUrl.slice(0, commaIndex);
            const base64Data = itemCopy.photoUrl.slice(commaIndex + 1).replace(/\s/g, ''); // strip any newlines or spaces safely
            const mimeMatch = mimePart.match(/data:image\/([a-zA-Z0-9\-_+]+);base64/);
            if (mimeMatch) {
              const mimeType = mimePart.replace('data:', '').split(';')[0];
              const ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
              const cid = `uploaded_photo_${index}_${Date.now()}`;
              
              // 1. Inline version for HTML body display
              attachments.push({
                filename: `customer_uploaded_photo_${index + 1}.${ext}`,
                content: Buffer.from(base64Data, 'base64'),
                cid: cid,
                contentType: mimeType,
                disposition: 'inline'
              });

              // 2. Separate downloadable attachment file for Gmail tray
              attachments.push({
                filename: `customer_uploaded_photo_${index + 1}.${ext}`,
                content: Buffer.from(base64Data, 'base64'),
                contentType: mimeType,
                disposition: 'attachment'
              });

              itemCopy.emailCid = cid;
            }
          }
        }

        // 2. Convert admin-uploaded product catalog pictures (if base64)
        if (itemCopy.productImage && itemCopy.productImage.startsWith('data:')) {
          const commaIndex = itemCopy.productImage.indexOf(',');
          if (commaIndex !== -1) {
            const mimePart = itemCopy.productImage.slice(0, commaIndex);
            const base64Data = itemCopy.productImage.slice(commaIndex + 1).replace(/\s/g, '');
            const mimeMatch = mimePart.match(/data:image\/([a-zA-Z0-9\-_+]+);base64/);
            if (mimeMatch) {
              const mimeType = mimePart.replace('data:', '').split(';')[0];
              const ext = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];
              const cid = `product_image_${index}_${Date.now()}`;
              
              attachments.push({
                filename: `product_catalog_image_${index + 1}.${ext}`,
                content: Buffer.from(base64Data, 'base64'),
                cid: cid,
                contentType: mimeType,
                disposition: 'inline'
              });

              itemCopy.productImageCid = cid;
            }
          }
        }
        // 3. Convert external product images (HTTP/HTTPS URL) to inline attachments
        else if (itemCopy.productImage && itemCopy.productImage.startsWith('http')) {
          try {
            console.log(`[SMTP Backend] Downloading product catalog image to attach inline: ${itemCopy.productImage}`);
            const imgRes = await fetch(itemCopy.productImage);
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const cid = `product_image_${index}_${Date.now()}`;
              const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
              const ext = contentType.split('/')[1] || 'jpg';

              attachments.push({
                filename: `product_catalog_image_${index + 1}.${ext}`,
                content: buffer,
                cid: cid,
                contentType: contentType,
                disposition: 'inline'
              });

              itemCopy.productImageCid = cid;
            } else {
              console.warn(`[SMTP] External product fetch failed with status: ${imgRes.status}`);
            }
          } catch (e) {
            console.error("[SMTP] Error loading product image for email attachment:", e);
          }
        }
        // 4. Convert relative local product images to inline attachments (read from dist/ folder)
        else if (
          itemCopy.productImage &&
          !itemCopy.productImage.startsWith('data:') &&
          !itemCopy.productImage.startsWith('cid:')
        ) {
          try {
            const urlPath = itemCopy.productImage.startsWith('/')
              ? itemCopy.productImage
              : `/${itemCopy.productImage}`;
            const absolutePath = path.join(process.cwd(), 'dist', urlPath);
            console.log(`[SMTP Backend] Reading local product catalog image for inline attachment: ${absolutePath}`);

            if (fs.existsSync(absolutePath)) {
              const buffer = fs.readFileSync(absolutePath);
              const cid = `product_image_${index}_${Date.now()}`;
              const ext = path.extname(absolutePath).toLowerCase().replace('.', '') || 'jpg';
              let contentType = 'image/jpeg';
              if (ext === 'png') contentType = 'image/png';
              else if (ext === 'webp') contentType = 'image/webp';
              else if (ext === 'gif') contentType = 'image/gif';

              attachments.push({
                filename: `product_catalog_image_${index + 1}.${ext}`,
                content: buffer,
                cid: cid,
                contentType: contentType,
                disposition: 'inline'
              });

              itemCopy.productImageCid = cid;
            } else {
              console.warn(`[SMTP] Local product image not found on filesystem at: ${absolutePath}`);
            }
          } catch (e) {
            console.error("[SMTP] Error processing local asset file for inline email attachment:", e);
          }
        }

        return itemCopy;
      }));

      // Generate items markup
      const itemsHtml = processedItems.map((it: any) => {
        let cakeSize = 'N/A';
        let cakeType = 'standard';
        let customName = 'N/A';
        let customMsg = 'N/A';
        let deliveryType = 'standard';

        if (it.options) {
          const weightMatch = it.options.match(/(\d+(\.\d+)?\s*Kg)/i);
          if (weightMatch) {
            cakeSize = weightMatch[1];
          }
          if (it.options.toLowerCase().includes('eggless')) {
            cakeType = 'eggless';
          }
          const nameMatch = it.options.match(/Name:\s*([^\[\n\r\t]+)/i);
          if (nameMatch && nameMatch[1]) {
            customName = nameMatch[1].trim();
          }
          const msgMatch = it.options.match(/Msg:\s*([^\[\n\r\t]+)/i);
          if (msgMatch && msgMatch[1]) {
            customMsg = msgMatch[1].trim();
          }
          if (it.options.toLowerCase().includes('express')) {
            deliveryType = 'express';
          } else if (it.options.toLowerCase().includes('midnight')) {
            deliveryType = 'midnight';
          }
        }

        const summaryLine = `Cake size: ${cakeSize} | Cake type: ${cakeType} | Delivery Time Slot: ${order.deliveryTimeSlot || 'Any Time On Specified Date'}`;
        let displayedProductImage = it.productImageCid ? `cid:${it.productImageCid}` : it.productImage;
        const cakeFallback = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
        if (!displayedProductImage) {
          displayedProductImage = cakeFallback;
        } else if (displayedProductImage.startsWith('http://') || displayedProductImage.startsWith('https://')) {
          if (displayedProductImage.includes('localhost') || displayedProductImage.includes('127.0.0.1')) {
            displayedProductImage = cakeFallback;
          }
        } else if (!displayedProductImage.startsWith('data:') && !displayedProductImage.startsWith('cid:')) {
          displayedProductImage = cakeFallback;
        }

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

            <div style="font-size: 12px; color: #cbd5e1; font-weight: 700; line-height: 1.6; margin-top: 16px; border-top: 1px solid #1f2937; padding-top: 16px; text-align: left;">
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Qty:</strong> <span style="color: #ffffff;">${it.quantity}</span></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Price:</strong> <span style="color: #ffffff;">INR ${it.price !== undefined ? it.price : 'N/A'}</span></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Cake size:</strong> <span style="color: #ffffff;">${cakeSize}</span></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Cake type:</strong> <span style="color: #ffffff; font-weight: 900; ${cakeType === 'eggless' ? 'color: #10b981;' : ''}">${cakeType.toUpperCase()} ${cakeType === 'eggless' ? '🟢 (100% VEG)' : ''}</span></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Custom name:</strong> <span style="color: #ffffff;">${customName}</span></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Custom message:</strong> <span style="color: #ffffff;">${customMsg}</span></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Delivery type / speed:</strong> <span style="color: #ffffff;">${deliveryType}</span></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Delivery time slot:</strong> <strong style="color: #f472b6;">${order.deliveryTimeSlot || 'Any Time On Specified Date'}</strong></div>
              <div style="margin-bottom: 4px;"><strong style="color: #9ca3af;">Admin note:</strong> <span style="color: #9ca3af;">N/A</span></div>
            </div>

            <!-- PRODUCT ORIGINAL IMAGE SLOT -->
            ${displayedProductImage ? `
              <div style="margin-top: 16px; background-color: #0f172a; border: 1px solid #1f2937; border-radius: 12px; padding: 12px; text-align: center;">
                <span style="font-size: 9px; font-weight: 950; text-transform: uppercase; color: #f472b6; display: block; margin-bottom: 6px; text-align: left; letter-spacing: 0.1em;">Product Image</span>
                <div style="position: relative; display: inline-block;">
                  <img src="${displayedProductImage}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 8px; border: 1px solid #334155;" alt="Product Catalog Visual" />
                  ${cakeType === 'eggless' ? `
                    <div style="position: absolute; top: 8px; right: 8px; background-color: #15803d; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 9px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; border: 1.5px solid #22c55e; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
                      <span style="display: inline-block; width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></span>
                      100% PURE EGGLESS
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            <!-- UPLOADED CUSTOM PHOTO SLOT -->
            ${it.photoUrl ? `
              <div style="margin-top: 12px; background-color: #064e3b; border: 1px solid #047857; border-radius: 12px; padding: 12px;">
                <span style="font-size: 9px; font-weight: 950; text-transform: uppercase; color: #10b981; display: block; margin-bottom: 6px; letter-spacing: 0.1em;">Uploaded Customer Photo</span>
                <img src="${it.emailCid ? `cid:${it.emailCid}` : it.photoUrl}" style="max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 8px; border: 1px solid #059669;" alt="Customer Attached Custom Visual" />
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="background-color: #0a0f1d; color: #cbd5e1; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; text-align: left;">
            
            <!-- HEADER CONTAINER -->
            <div style="background: linear-gradient(135deg, #111827 0%, #9d174d 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 20px; color: #ffffff;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #f1f5f9; display: block;">ROCX CAKES & GIFTS</span>
              <h2 style="font-size: 24px; font-weight: 900; margin: 8px 0; color: #ffffff; text-transform: uppercase; letter-spacing: -0.02em;">New Order ${order.id}</h2>
              <p style="font-size: 12px; font-weight: 700; margin: 0; color: #f8fafc;">Recipient: ${order.recipientName} | Total: INR ${order.total}</p>
            </div>

            <!-- ORDER SUMMARY & DELIVERY METADATA OVERVIEW -->
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

              <!-- CAKE CARD MESSAGE SUB CONTAINER -->
              ${cardMessage ? `
                <div style="margin-top: 16px; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: left;">
                  <span style="font-size: 9px; font-weight: 950; letter-spacing: 0.08em; color: #f472b6; display: block; margin-bottom: 4px; text-transform: uppercase;">CAKE CARD MESSAGE</span>
                  <div style="font-size: 13px; font-weight: 800; color: #ffffff; line-height: 1.4;">${cardMessage}</div>
                </div>
              ` : ''}
            </div>

            <!-- DELIVERY DETAILS OVERVIEW -->
            <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
              <span style="font-size: 10px; font-weight: 900; letter-spacing: 0.08em; color: #cbd5e1; display: block; margin-bottom: 12px; text-transform: uppercase;">DELIVERY DETAILS</span>
              
              <div style="font-size: 12px; font-weight: 900; color: #f8fafc; margin-bottom: 12px; line-height: 1.4; border-bottom: 1px solid #1f2937; padding-bottom: 10px;">
                ${order.streetAddress}
              </div>

              <div style="font-size: 11px; color: #cbd5e1; font-weight: 700; line-height: 1.6;">
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Pincode:</span> <span style="color: #ffffff;">${order.pincode || 'N/A'}</span></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">City:</span> <span style="color: #ffffff;">${order.city || 'N/A'}</span></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Landmark:</span> <span style="color: #ffffff;">${order.landmark || 'None'}</span></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Recipient phone:</span> <span style="color: #ffffff;">${order.recipientPhone}</span></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Payment mode:</span> <span style="color: #ffffff;">${order.paymentMode}</span></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Customer name:</span> <span style="color: #ffffff;">${order.customerName || 'N/A'}</span></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Customer phone:</span> <span style="color: #ffffff;">${order.customerPhone || 'N/A'}</span></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Delivery Date:</span> <strong style="color: #ffffff;">${order.deliveryDate || 'N/A'}</strong></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Delivery Time:</span> <strong style="color: #f472b6;">${order.deliveryTimeSlot || 'Any Time On Specified Date'}</strong></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Product Price (Without Delivery):</span> <strong style="color: #ffffff;">INR ${order.itemsSubtotal || (order.total - (order.deliveryFee || 0))}</strong></div>
                <div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Delivery Fee:</span> <strong style="color: #ffffff;">INR ${order.deliveryFee || 0}</strong></div>
                <div style="margin-bottom: 4px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #1f2937;"><span style="color: #f472b6; font-size: 14px;">Final Total Amount:</span> <strong style="color: #ffffff; font-size: 14px;">INR ${order.total}</strong></div>
              </div>
            </div>

            <!-- PRODUCTS COMPONENT HEADING -->
            <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.1em; color: #cbd5e1; display: block; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase;">PRODUCTS</span>

            ${itemsHtml}

            <!-- FOOTER INFO -->
            <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #1f2937; font-size: 10px; color: #6b7280; font-weight: bold;">
              ROCX Cakes & Gifts Order Management Portal. Automatically dispatched via Secure API.
            </div>

          </div>
        </body>
        </html>
      `;

      const plainTextFallback = `
New order received: ${order.id}
Customer: ${order.customerName || 'N/A'} (${order.customerPhone || 'N/A'})
Product Price: INR ${order.itemsSubtotal || (order.total - (order.deliveryFee || 0))}
Delivery Fee: INR ${order.deliveryFee || 0}
Total Amount: INR ${order.total}
Address: ${order.streetAddress}
Delivery: ${order.deliveryDate || 'N/A'} (${order.deliveryTimeSlot || 'N/A'})
      `.trim();

      let recipientList = 'rocxcakes@gmail.com';
      if (GMAIL_USER && GMAIL_USER !== 'rocxcakes@gmail.com') {
        recipientList += `, ${GMAIL_USER}`;
      }

      const mailOptions = {
        from: `"Rocx Cakes & Gifts" <${GMAIL_USER}>`,
        to: recipientList,
        subject: subject,
        text: plainTextFallback,
        html: emailHtml,
        attachments: attachments
      };

      let mailSent = false;
      let lastMailError: any = null;

      // 🚀 Strategy 1: Use Nodemailer's built-in 'gmail' service pool (best on sandboxed runtimes)
      try {
        console.log(`[SMTP Backend] Attempting Strategy 1 (service: gmail)...`);
        const transporterInner = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASS,
          }
        });
        await transporterInner.sendMail(mailOptions);
        mailSent = true;
        console.log(`[SMTP Backend] Strategy 1 succeeded! Email sent.`);
      } catch (err1: any) {
        lastMailError = err1;
        console.warn(`[SMTP Backend] Strategy 1 (gmail service) failed:`, err1.message || err1);
      }

      // 🚀 Strategy 2: Fallback to SMTP Port 587 (STARTTLS - standard port, almost never blocked by Lambdas/Firewalls)
      if (!mailSent) {
        try {
          console.log(`[SMTP Backend] Attempting Strategy 2 (smtp.gmail.com:587 with STARTTLS)...`);
          const transporterInner = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // false for STARTTLS
            auth: {
              user: GMAIL_USER,
              pass: GMAIL_APP_PASS,
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          await transporterInner.sendMail(mailOptions);
          mailSent = true;
          console.log(`[SMTP Backend] Strategy 2 succeeded! Email sent.`);
        } catch (err2: any) {
          lastMailError = err2;
          console.warn(`[SMTP Backend] Strategy 2 (port 587) failed:`, err2.message || err2);
        }
      }

      // 🚀 Strategy 3: Fallback to direct SMTP Port 465 (SSL/TLS - strict)
      if (!mailSent) {
        try {
          console.log(`[SMTP Backend] Attempting Strategy 3 (smtp.gmail.com:465 with direct SSL)...`);
          const transporterInner = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: GMAIL_USER,
              pass: GMAIL_APP_PASS,
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          await transporterInner.sendMail(mailOptions);
          mailSent = true;
          console.log(`[SMTP Backend] Strategy 3 succeeded! Email sent.`);
        } catch (err3: any) {
          lastMailError = err3;
          console.warn(`[SMTP Backend] Strategy 3 (port 465) failed:`, err3.message || err3);
        }
      }

      if (!mailSent) {
        throw new Error(`Soyam SMTP connection target block khayche host settings validation e. Last error was: ${lastMailError?.message || lastMailError || 'Unknown SMTP error'}`);
      }

      console.log(`[SMTP Backend] Notification email HTML dispatched successfully to ${GMAIL_USER} for order ${order.id}`);
      return res.json({ success: true });

    } catch (error: any) {
      console.error('[SMTP Backend] Failed to send email via SMTP transporter:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error executing SMTP sendMail' });
    }
  });

  // API route to securely send SMS OTP using Fast2SMS Dev BulkV2 API
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
      }

      // Read API key from environment, with hardcoded fallback provided by client
      let apiKey = process.env.VITE_FAST2SMS_API_KEY || process.env.FAST2SMS_API_KEY || '';
      if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
        apiKey = 'gF1kuBFGNPefmjPFJ7DVb7ALslFZLcNSCLkfYALnYgRhKUYQEOFCl6qZZ72u';
      }
      apiKey = apiKey.trim();

      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.length > 10) {
        formattedPhone = formattedPhone.slice(-10);
      }

      console.log(`[Fast2SMS Backend] Dispatched OTP requested. Code: ${otp}, Phone: ${formattedPhone}`);

      let result: any = null;

      // STEP 1: Attempt the OPTIMAL & PRE-APPROVED Official 'otp' Route (Best for bypassing DLT verification blockers)
      try {
        console.log(`[Fast2SMS Route 1] Dispatching via POST 'otp' route with variables_values...`);
        const apiResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            variables_values: otp,
            route: 'otp',
            numbers: formattedPhone
          })
        });
        result = await apiResponse.json();
        console.log('[Fast2SMS Route 1 Response]:', result);
      } catch (err: any) {
        console.warn('[Fast2SMS Route 1 POST Failed]:', err.message);
      }

      // STEP 2: GET Fallback for Official 'otp' Route
      if (!result || result.return !== true) {
        try {
          console.log(`[Fast2SMS Route 2] Dispatching via GET 'otp' route fallback...`);
          const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${encodeURIComponent(otp)}&numbers=${encodeURIComponent(formattedPhone)}`;
          const getResponse = await fetch(getUrl, { method: 'GET' });
          result = await getResponse.json();
          console.log('[Fast2SMS Route 2 Response]:', result);
        } catch (err: any) {
          console.warn('[Fast2SMS Route 2 GET Failed]:', err.message);
        }
      }

      // STEP 3: Fallback POST to Quick 'q' Route (traditional custom message)
      if (!result || result.return !== true) {
        try {
          console.log(`[Fast2SMS Route 3] Dispatching via POST 'q' route with custom text...`);
          const apiResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
              'authorization': apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Your ROCX OTP is ${otp}. Please do not share it with anyone.`,
              language: 'english',
              route: 'q',
              numbers: formattedPhone
            })
          });
          result = await apiResponse.json();
          console.log('[Fast2SMS Route 3 Response]:', result);
        } catch (err: any) {
          console.warn('[Fast2SMS Route 3 POST Failed]:', err.message);
        }
      }

      // STEP 4: Fallback GET to Quick 'q' Route
      if (!result || result.return !== true) {
        try {
          console.log(`[Fast2SMS Route 4] Dispatching via GET 'q' route with custom text...`);
          const msgUrl = encodeURIComponent(`Your ROCX OTP is ${otp}. Please do not share it with anyone.`);
          const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${msgUrl}&language=english&flash=0&numbers=${encodeURIComponent(formattedPhone)}`;
          const getResponse = await fetch(getUrl, { method: 'GET' });
          result = await getResponse.json();
          console.log('[Fast2SMS Route 4 Response]:', result);
        } catch (err: any) {
          console.error('[Fast2SMS Route 4 GET Failed]:', err.message);
        }
      }

      // Analyze final result from whichever route succeeded
      if (result && result.return === true) {
        const successMsg = Array.isArray(result.message) ? result.message[0] : (typeof result.message === 'string' ? result.message : 'OTP sent successfully!');
        return res.json({ success: true, message: successMsg });
      } else {
        // Construct clear explanation from error codes
        let finalError = 'Fast2SMS returned failure across all routing paths';
        if (result) {
          if (Array.isArray(result.message)) {
            finalError = result.message.join(', ');
          } else if (typeof result.message === 'string') {
            finalError = result.message;
          } else if (result.return === false) {
            finalError = 'Status is false. This can mean: API key invalid, inactive route permissions, or empty wallet balance on Fast2SMS.';
          }
        }
        console.error('[Fast2SMS Final Dispatch Failure]:', finalError, result);
        return res.status(400).json({ success: false, error: finalError });
      }
    } catch (err: any) {
      console.error('[Fast2SMS Backend App Exception]:', err);
      return res.status(500).json({ success: false, error: err.message || 'Fatal error routing core SMS request' });
    }
  });

  // Helper to generate SHA256 hashes for PhonePe payment signatures
  function generateSHA256(str: string): string {
        return crypto.createHash('sha256').update(str).digest('hex');
  }

  // --- PHONEPE GATEWAY SECURE ENDPOINTS ---
  app.post('/api/create-phonepe-payment', async (req, res) => {
    try {
      const { order, successUrl, cancelUrl } = req.body;
      if (!order) {
        return res.status(400).json({ success: false, error: 'Order details are missing.' });
      }

      console.log(`[PhonePe Gateway] Requesting payment payload for Order ID: ${order.id}`);

      // Read PhonePe settings or default to official pre-prod sandbox credentials for offline-first testing
      // Always use sandbox keys for now since Prod keys are returning 404
      // PROD keys
      const isProd = process.env.PHONEPE_ENV === 'production';
      const merchantId = isProd ? (process.env.PHONEPE_MERCHANT_ID || 'M22E1O78XXTHQ') : 'PGTESTPAYUAT86';
      const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
      const saltIndex = isProd ? (process.env.PHONEPE_SALT_INDEX || '1') : '1';
      const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

      // Parse absolute payment total to paise (INR * 100)
      const rawTotalStr = String(order.total).replace(/[^0-9.]/g, '');
      const totalAmountFloat = parseFloat(rawTotalStr) || 0;
      const totalAmountPaise = Math.round(totalAmountFloat * 100);

      if (totalAmountPaise <= 0) {
        return res.status(400).json({ success: false, error: 'Payment amount must be greater than zero.' });
      }

      // Max 35 alphanumeric characters for merchantTransactionId
      const cleanOrderId = String(order.id).replace(/[^0-9a-zA-Z]/g, '');
      const transactionId = `TX${cleanOrderId}T${Date.now()}`.slice(0, 35);

      // standard PhonePe API parameters
      const payload = {
        merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: `MUID${String(order.customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10)}`,
        amount: totalAmountPaise,
        redirectUrl: `${successUrl}?order_id=${order.id}&transaction_id=${transactionId}`,
        redirectMode: 'REDIRECT',
        callbackUrl: 'https://rocxcakes.in/api/phonepe-webhook',
        mobileNumber: String(order.customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10),
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const signatureToSign = base64Payload + '/pg/v1/pay' + saltKey;
      const sha255Sig = generateSHA256(signatureToSign);
      const xVerify = `${sha255Sig}###${saltIndex}`;

      console.log(`[PhonePe Gateway] Calling API ${baseUrl}/pg/v1/pay for transId: ${transactionId} via ${merchantId}`);

      const response = await fetch(`${baseUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId
        },
        body: JSON.stringify({ request: base64Payload })
      });

      if (!response.ok) {
        const textPayload = await response.text();
        console.error(`[PhonePe Gateway] HTTP Error ${response.status}:`, textPayload);
        return res.status(response.status).json({ success: false, error: `PhonePe gateway returned HTTP ${response.status}: ${textPayload}`, details: textPayload });
      }

      const responseData: any = await response.json();
      console.log('[PhonePe Gateway] Response acquired:', JSON.stringify(responseData));

      if (responseData.success && responseData.data?.instrumentResponse?.redirectInfo?.url) {
        const redirectUrl = responseData.data.instrumentResponse.redirectInfo.url;
        return res.json({
          success: true,
          url: redirectUrl,
          transactionId: transactionId,
          merchantId: merchantId
        });
      } else {
        return res.status(400).json({
          success: false,
          error: responseData.message || 'PhonePe failed to initialize payment instrument.',
          raw: responseData
        });
      }
    } catch (err: any) {
      console.error('[PhonePe Gateway] Create payment error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Error occurred connecting to PhonePe API.' });
    }
  });

  app.post('/api/verify-phonepe-payment', async (req, res) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'Merchant Transaction ID is required.' });
      }

      // Always use sandbox keys for now since Prod keys are returning 404
      // PROD keys
      const isProd = process.env.PHONEPE_ENV === 'production';
      const merchantId = isProd ? (process.env.PHONEPE_MERCHANT_ID || 'M22E1O78XXTHQ') : 'PGTESTPAYUAT86';
      const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
      const saltIndex = isProd ? (process.env.PHONEPE_SALT_INDEX || '1') : '1';
      const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

      const checkUrl = `/pg/v1/status/${merchantId}/${transactionId}`;
      const signatureToSign = checkUrl + saltKey;
      const sha255Sig = generateSHA256(signatureToSign);
      const xVerify = `${sha255Sig}###${saltIndex}`;

      console.log(`[PhonePe Gateway] Checking status of transaction: ${transactionId} via ${merchantId}`);

      const response = await fetch(`${baseUrl}${checkUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId
        }
      });

      if (!response.ok) {
        const textPayload = await response.text();
        console.error(`[PhonePe Gateway Status] HTTP Error ${response.status}:`, textPayload);
        return res.status(response.status).json({ success: false, error: `Status verification returned HTTP ${response.status}` });
      }

      const responseData: any = await response.json();
      console.log('[PhonePe Gateway Status] Response acquired:', JSON.stringify(responseData));

      if (responseData.success && (responseData.code === 'PAYMENT_SUCCESS' || responseData.data?.responseCode === 'SUCCESS')) {
        return res.json({ success: true, status: 'paid', code: responseData.code, payload: responseData.data });
      } else {
        return res.json({
          success: false,
          status: responseData.data?.state || 'failed',
          code: responseData.code,
          message: responseData.message || 'Payment status is pending/failed'
        });
      }
    } catch (err: any) {
      console.error('[PhonePe Gateway Status] Exception:', err);
      return res.status(500).json({ success: false, error: err.message || 'Error occurred checking transaction status.' });
    }
  });

  // Helper to lazily initialize Stripe Client
  let stripeClient: Stripe | null = null;
  function getStripeClient(): Stripe {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key || key.trim() === '' || key === 'undefined') {
        throw new Error('STRIPE_SECRET_KEY is not configured on the server. Please ask the administrator to set the Stripe Secret Key in AI Studio secrets to enable real checkout payments.');
      }
      stripeClient = new Stripe(key.trim(), {
        apiVersion: '2025-01-27.acacia' as any
      });
    }
    return stripeClient;
  }

  // API template to securely initialize Stripe credit/debit/UPI payments
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { order, successUrl, cancelUrl } = req.body;
      if (!order) {
        return res.status(400).json({ success: false, error: 'Order details are missing.' });
      }

      console.log(`[Stripe Backend] Creating checkout session for Order ID: ${order.id}, total: INR ${order.total}`);

      const stripe = getStripeClient();

      // Ensure clean parse of total amount
      const rawTotalStr = String(order.total).replace(/[^0-9.]/g, '');
      const totalAmountFloat = parseFloat(rawTotalStr) || 0;
      const totalAmountCent = Math.round(totalAmountFloat * 100);

      if (totalAmountCent <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid order amount.' });
      }

      // Format description listing items beautifully
      const itemsList = order.items && Array.isArray(order.items)
        ? order.items.map((it: any) => `${it.name} (Qty: ${it.quantity})`).join(', ')
        : 'Delicious Bakery Delights';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `ROCX Cakes Order #${order.id}`,
                description: `Items: ${itemsList}. Deliver to: ${order.recipientName}`,
              },
              unit_amount: totalAmountCent,
            },
            quantity: 1,
          }
        ],
        mode: 'payment',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${cancelUrl}?order_id=${order.id}`,
        metadata: {
          orderId: order.id,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
        }
      });

      console.log(`[Stripe Backend] Session created: ${session.id}. URL: ${session.url}`);
      return res.json({ success: true, url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error('[Stripe Backend] Session creation failed:', err.message);
      return res.status(500).json({ success: false, error: err.message || 'Stripe configuration error' });
    }
  });

  // API template to verify if a session is fully completed (paid)
  app.post('/api/verify-payment', async (req, res) => {
    try {
      const { sessionId, orderId } = req.body;
      if (!sessionId || !orderId) {
        return res.status(400).json({ success: false, error: 'Session ID and Order ID are required for live validation.' });
      }

      console.log(`[Stripe Backend] Verifying payment for Session: ${sessionId}, Order ID: ${orderId}`);

      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        console.log(`[Stripe Backend] Secure check verified and PAID for Session: ${sessionId}`);
        return res.json({ success: true, status: 'paid' });
      } else {
        console.warn(`[Stripe Backend] Payment state failed: ${session.payment_status}`);
        return res.json({ success: false, status: session.payment_status, error: 'Payment unpaid' });
      }
    } catch (err: any) {
      console.error('[Stripe Backend] Payment verification check exception:', err.message);
      return res.status(500).json({ success: false, error: err.message || 'Error occurred calling Stripe API' });
    }
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ROCX Core Notification Gateway' });
  });

  // Dynamic OG image serving API
  app.get('/api/og-image', async (req, res) => {
    const { product, category } = req.query;
    try {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'rocxcakes-9fb4b';
      let url = '';
      if (product) url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${product}`;
      else if (category) url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/categories/${category}`;
      else return res.status(400).send('Missing product or category param');
      
      const response = await fetch(url);
      if (!response.ok) return res.status(404).send('Not found');
      const data = await response.json();
      const imageString = data?.fields?.image?.stringValue;
      if (!imageString) return res.status(404).send('No image set');
      
      if (imageString.startsWith('data:image/')) {
        const parts = imageString.split(',');
        const header = parts[0];
        const base64Data = parts[1];
        const mimeMatch = header.match(/data:(image\/[a-zA-Z0-9\-_+]+);base64/);
        if (mimeMatch && base64Data) {
          const mimeType = mimeMatch[1];
          const buffer = Buffer.from(base64Data, 'base64');
          return res.status(200).set({
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=86400'
          }).send(buffer);
        }
      } else if (imageString.startsWith('http')) {
        return res.redirect(imageString);
      }
      
      return res.status(404).send('Invalid image format');
    } catch (err) {
      return res.status(500).send('Error');
    }
  });

  // Vite middleware for development or Static Assets for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        const ogTags = await getDynamicOgTags(req);
        template = injectOgTags(template, ogTags);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      try {
        let template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        const ogTags = await getDynamicOgTags(req);
        template = injectOgTags(template, ogTags);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch(e: any) {
         res.status(500).end(e.message);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal: Failed to startup core express server:', error);
});
