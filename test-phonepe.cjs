const crypto = require('crypto');
function generateSHA256(str) { return crypto.createHash('sha256').update(str).digest('hex'); }
const merchantId = 'PGTESTPAYUAT86';
const saltKey = '96434309-7796-489d-8924-ab56988a6076';
const saltIndex = '1';
const baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const endpoint = '/pg/v1/pay';
const transactionId = 'TX123' + Date.now();
const payload = {
  merchantId,
  merchantTransactionId: transactionId,
  merchantUserId: 'MUID123',
  amount: 10000,
  redirectUrl: 'https://example.com',
  redirectMode: 'REDIRECT',
  callbackUrl: 'https://example.com/callback',
  mobileNumber: '9999999999',
  paymentInstrument: { type: 'PAY_PAGE' }
};
const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
const signatureToSign = base64Payload + endpoint + saltKey;
const sha256Sig = generateSHA256(signatureToSign);
const xVerify = `${sha256Sig}###${saltIndex}`;
fetch(`${baseUrl}${endpoint}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
    'X-VERIFY': xVerify,
    'X-MERCHANT-ID': merchantId
  },
  body: JSON.stringify({ request: base64Payload })
}).then(res => res.text()).then(console.log);
