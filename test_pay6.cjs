const crypto = require('crypto');
const merchantId = 'WRONG_MERCHANT';
const saltKey = '504e73ba-71d3-4e00-83dd-37afb14609a0';
const payload = {
  merchantId,
  merchantTransactionId: 'MT7850590068188104',
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
const sig = crypto.createHash('sha256').update(base64Payload + '/pg/v1/pay' + saltKey).digest('hex') + '###1';

fetch('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-VERIFY': sig },
  body: JSON.stringify({ request: base64Payload })
}).then(res => res.text().then(text => console.log('PROD', res.status, text)));
