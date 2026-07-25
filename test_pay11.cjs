const crypto = require('crypto');
const merchantId = 'PGOMT';
const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
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

const cmd = `curl -s -X POST https://api.phonepe.com/apis/hermes/pg/v1/pay -H 'Content-Type: application/json' -H 'X-VERIFY: ${sig}' -d '{"request":"${base64Payload}"}' -w "\n%{http_code}"`;
const { execSync } = require('child_process');
console.log(execSync(cmd).toString());
