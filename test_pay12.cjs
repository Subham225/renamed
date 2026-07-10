const crypto = require('crypto');
const merchantId = 'M22E1O78XXTHQ';
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

const cmd = `curl -s -X POST https://api.phonepe.com/apis/pg/v1/pay -H 'Content-Type: application/json' -H 'X-VERIFY: ${sig}' -d '{"request":"${base64Payload}"}' -w "\n%{http_code}"`;
const { execSync } = require('child_process');
console.log(execSync(cmd).toString());
