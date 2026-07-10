import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-phonepe-payment', async (req, res) => {
  try {
    const { order, successUrl, cancelUrl } = req.body;
    const isProd = process.env.PHONEPE_ENV !== 'sandbox';
    const merchantId = isProd ? (process.env.PHONEPE_MERCHANT_ID || 'M22E1O78XXTHQ') : 'PGTESTPAYUAT86';
    const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = isProd ? '1' : '1';
    const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const rawTotalStr = String(order.total).replace(/[^0-9.]/g, '');
    const totalAmountFloat = parseFloat(rawTotalStr) || 0;
    const totalAmountPaise = Math.round(totalAmountFloat * 100);

    const transactionId = `MT${Date.now()}`;

    const payload = {
      merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: order.customerPhone || 'MUID123',
      amount: totalAmountPaise,
      redirectUrl: `${successUrl}?phonepe=success&tid=${transactionId}&oid=${order.id}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${successUrl}?phonepe=callback&tid=${transactionId}`,
      mobileNumber: order.customerPhone || '9999999999',
      paymentInstrument: { type: 'PAY_PAGE' }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const endpoint = '/pg/v1/pay';
    const signatureToSign = base64Payload + endpoint + saltKey;
    const sha255Sig = crypto.createHash('sha256').update(signatureToSign).digest('hex');
    const xVerify = `${sha255Sig}###${saltIndex}`;

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': merchantId
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();
    if (data.success && data.data && data.data.instrumentResponse && data.data.instrumentResponse.redirectInfo) {
      res.json({ success: true, url: data.data.instrumentResponse.redirectInfo.url });
    } else {
      res.status(400).json({ success: false, error: data.message || 'Payment initiation failed' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/check-phonepe-status', async (req, res) => {
  try {
    const { transactionId } = req.body;
    const isProd = process.env.PHONEPE_ENV !== 'sandbox';
    const merchantId = isProd ? (process.env.PHONEPE_MERCHANT_ID || 'M22E1O78XXTHQ') : 'PGTESTPAYUAT86';
    const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = isProd ? '1' : '1';
    const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const checkUrl = `/pg/v1/status/${merchantId}/${transactionId}`;
    const signatureToSign = checkUrl + saltKey;
    const sha255Sig = crypto.createHash('sha256').update(signatureToSign).digest('hex');
    const xVerify = `${sha255Sig}###${saltIndex}`;

    const response = await fetch(`${baseUrl}${checkUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': merchantId
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/send-email', (req, res) => { res.json({ success: true }); });
app.post('/api/send-otp', (req, res) => { res.json({ success: true }); });

export default app;
