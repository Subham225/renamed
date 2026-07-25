const crypto = require('crypto');
function generateSHA256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}
async function test() {
  const merchantId = 'M22E1O78XXTHQ'; // using the user's merchant id
  const saltKey = '504e73ba-71d3-4e00-83dd-37afb14609a0';
  const saltIndex = '1';
  const baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  
  const payload = {
    merchantId,
    merchantTransactionId: `TX${Date.now()}`,
    merchantUserId: `MUID123456`,
    amount: 10000,
    redirectUrl: `http://localhost/success`,
    redirectMode: 'REDIRECT',
    callbackUrl: `http://localhost/callback`,
    mobileNumber: `9999999999`,
    paymentInstrument: { type: 'PAY_PAGE' }
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signatureToSign = base64Payload + '/pg/v1/pay' + saltKey;
  const xVerify = generateSHA256(signatureToSign) + '###' + saltIndex;
  
  const response = await fetch(`${baseUrl}/pg/v1/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'X-VERIFY': xVerify
    },
    body: JSON.stringify({ request: base64Payload })
  });
  console.log(response.status, await response.text());
}
test();
