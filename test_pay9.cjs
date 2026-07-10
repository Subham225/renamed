const crypto = require('crypto');
const payload = {
  merchantId: "WRONG_MERCHANT",
  merchantTransactionId: 'MT' + Date.now(),
  merchantUserId: 'MUID123',
  amount: 10000,
  redirectUrl: 'https://webhook.site/redirect-url',
  redirectMode: 'REDIRECT',
  callbackUrl: 'https://webhook.site/callback-url',
  mobileNumber: '9999999999',
  paymentInstrument: {
    type: 'PAY_PAGE'
  }
};
const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
const sig = crypto.createHash('sha256').update(base64Payload + '/pg/v1/pay' + "123").digest('hex') + '###1';

fetch('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-VERIFY': sig },
  body: JSON.stringify({ request: base64Payload })
}).then(res => res.text().then(text => console.log('PROD', res.status, text)));
