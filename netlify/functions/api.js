import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

function generateSHA256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// 🌟 FIX: Use catch-all paths (*/...) so it matches regardless of Netlify's internal routing prefix
app.post('*/create-phonepe-payment', async (req, res) => {
  try {
    const { order, successUrl, cancelUrl } = req.body;
    
    const envMerchantId = process.env.PHONEPE_MERCHANT_ID || '';
    // If explicitly sandbox, force it. Otherwise infer from environment or keys.
    const isProd = process.env.PHONEPE_ENV === 'sandbox' || process.env.PHONEPE_ENV === 'test' 
      ? false 
      : (process.env.PHONEPE_ENV === 'production' || (envMerchantId.length > 5 && !envMerchantId.includes('PGTEST')));
    
    const merchantId = isProd ? (envMerchantId || 'M22E1O78XXTHQ') : 'PGTESTPAYUAT86';
    const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = isProd ? (process.env.PHONEPE_SALT_INDEX || '1') : '1';
    
    const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    const endpoint = '/pg/v1/pay';

    const rawTotalStr = String(order.total).replace(/[^0-9.]/g, '');
    const totalAmountFloat = parseFloat(rawTotalStr) || 0;
    const totalAmountPaise = Math.round(totalAmountFloat * 100);
    
    const cleanOrderId = String(order.id).replace(/[^0-9a-zA-Z]/g, '');
    const transactionId = `TX${cleanOrderId}T${Date.now()}`.slice(0, 35);
    
    const payload = {
      merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: `MUID${String(order.customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10)}`,
      amount: totalAmountPaise,
      redirectUrl: `${successUrl}?order_id=${order.id}&transaction_id=${transactionId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: 'https://rocxcakes.in/api/phonepe-webhook',
      mobileNumber: String(order.customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10),
      paymentInstrument: { type: 'PAY_PAGE' }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signatureToSign = base64Payload + endpoint + saltKey;
    const sha256Sig = generateSHA256(signatureToSign);
    const xVerify = `${sha256Sig}###${saltIndex}`;

    console.log(`[PhonePe] Initiating Payment - Env: ${isProd ? 'PROD' : 'SANDBOX'}, Merchant: ${merchantId}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': merchantId
      },
      body: JSON.stringify({ request: base64Payload })
    });
    
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch(e) {
      console.error('Invalid JSON from PhonePe:', responseText);
      return res.status(500).json({ success: false, error: 'Invalid response from PhonePe', details: responseText });
    }
    
    console.log('[PhonePe] API Response:', JSON.stringify(data));
    
    if (response.ok && data.success && data.data?.instrumentResponse?.redirectInfo) {
      res.json({ success: true, url: data.data.instrumentResponse.redirectInfo.url, transactionId, merchantId });
    } else {
      const humanError = response.status === 404 ? "Merchant ID Not Found. Please check your production PHONEPE_MERCHANT_ID." : `PhonePe gateway returned HTTP ${response.status}`;
      res.status(response.status || 400).json({ success: false, error: humanError, details: data });
    }
  } catch (err) {
    console.error('[PhonePe] API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('*/check-phonepe-status', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    const envMerchantId = process.env.PHONEPE_MERCHANT_ID || '';
    const isProd = process.env.PHONEPE_ENV === 'sandbox' || process.env.PHONEPE_ENV === 'test' 
      ? false 
      : (process.env.PHONEPE_ENV === 'production' || (envMerchantId.length > 5 && !envMerchantId.includes('PGTEST')));
    const merchantId = isProd ? (envMerchantId || 'M22E1O78XXTHQ') : 'PGTESTPAYUAT86';
    const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = isProd ? (process.env.PHONEPE_SALT_INDEX || '1') : '1';
    
    const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    const checkUrl = `/pg/v1/status/${merchantId}/${transactionId}`;
    
    const signatureToSign = checkUrl + saltKey;
    const sha256Sig = generateSHA256(signatureToSign);
    const xVerify = `${sha256Sig}###${saltIndex}`;
    
    const response = await fetch(`${baseUrl}${checkUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': merchantId
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback handlers
app.post('*/send-email', (req, res) => { res.json({ success: true }); });
app.post('*/send-otp', (req, res) => { res.json({ success: true }); });
app.get('*/test-api', (req, res) => { res.json({ success: true, message: "Netlify API is fully operational!" }); });

// Export the serverless handler
export const handler = serverless(app);
