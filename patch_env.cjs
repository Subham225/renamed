const fs = require('fs');

let code = fs.readFileSync('.env.example', 'utf8');

const phonepeBlock = `# PhonePe Live / Sandbox Payment Gateway Credentials
# For Sandbox Testing, you can use Merchant ID: PGOMT, Salt Key: 099eb0cd-02cf-4e2a-8aca-3e6c6aff0399, Salt Index: 1
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=
PHONEPE_ENV=sandbox`;

const razorpayBlock = `# Razorpay Live / Test Payment Gateway Credentials
# Find these on your Razorpay Dashboard (dashboard.razorpay.com)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=`;

code = code.replace(phonepeBlock, razorpayBlock);
fs.writeFileSync('.env.example', code);
console.log("Patched .env.example");
