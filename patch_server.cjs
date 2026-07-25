const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const startIdx = code.indexOf('  // --- PHONEPE GATEWAY SECURE ENDPOINTS ---');
const endIdx = code.indexOf('  // Helper to lazily initialize Stripe Client');

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `  // --- RAZORPAY GATEWAY SECURE ENDPOINTS ---
  app.post('/api/create-razorpay-order', async (req, res) => {
    try {
      const { order } = req.body;
      if (!order) {
        return res.status(400).json({ success: false, error: 'Order details are missing.' });
      }

      console.log(\`[Razorpay Gateway] Requesting payment payload for Order ID: \${order.id}\`);

      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!razorpayKeyId || !razorpayKeySecret) {
        return res.status(500).json({ success: false, error: 'Razorpay keys are missing from environment variables.' });
      }

      const Razorpay = (await import('razorpay')).default;
      const rzp = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

      const rawTotalStr = String(order.total).replace(/[^0-9.]/g, '');
      const totalAmountFloat = parseFloat(rawTotalStr) || 0;
      const totalAmountPaise = Math.round(totalAmountFloat * 100);

      if (totalAmountPaise <= 0) {
        return res.status(400).json({ success: false, error: 'Payment amount must be greater than zero.' });
      }

      const cleanOrderId = String(order.id).replace(/[^0-9a-zA-Z]/g, '');
      const receipt = \`RCPT\${cleanOrderId}\`.slice(0, 40);

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
    } catch (err: any) {
      console.error('[Razorpay Gateway] Create payment error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Error occurred connecting to Razorpay API.' });
    }
  });

  app.post('/api/verify-razorpay-payment', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!razorpayKeySecret) {
        return res.status(500).json({ success: false, error: 'Razorpay secret key is missing from environment variables.' });
      }

      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', razorpayKeySecret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature === razorpay_signature) {
        return res.json({ success: true, status: 'paid' });
      } else {
        return res.status(400).json({ success: false, status: 'failed', error: 'Payment verification failed' });
      }
    } catch (err: any) {
      console.error('[Razorpay Gateway Status] Exception:', err);
      return res.status(500).json({ success: false, error: err.message || 'Error occurred checking transaction status.' });
    }
  });

`;

  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts successfully");
} else {
  console.log("Could not find PhonePe endpoints in server.ts");
}
