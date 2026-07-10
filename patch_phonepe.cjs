const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the PhonePe constants in /api/create-phonepe-payment
code = code.replace(
  /const merchantId = \(process\.env\.PHONEPE_MERCHANT_ID \|\| 'M22E1O78XXTHQ'\)\.trim\(\);\s*const saltKey = \(process\.env\.PHONEPE_SALT_KEY \|\| '504e73ba-71d3-4e00-83dd-37afb14609a0'\)\.trim\(\);\s*const saltIndex = \(process\.env\.PHONEPE_SALT_INDEX \|\| '1'\)\.trim\(\);\s*const isProd = process\.env\.PHONEPE_ENV !== 'sandbox';/g,
  `const isProd = process.env.PHONEPE_ENV === 'production';\n      const merchantId = (process.env.PHONEPE_MERCHANT_ID || (isProd ? 'M22E1O78XXTHQ' : 'PGTESTPAYUAT')).trim();\n      const saltKey = (process.env.PHONEPE_SALT_KEY || (isProd ? '504e73ba-71d3-4e00-83dd-37afb14609a0' : '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399')).trim();\n      const saltIndex = (process.env.PHONEPE_SALT_INDEX || '1').trim();`
);

// Do the same for /api/verify-phonepe-payment
code = code.replace(
  /const merchantId = \(process\.env\.PHONEPE_MERCHANT_ID \|\| 'M22E1O78XXTHQ'\)\.trim\(\);\s*const saltKey = \(process\.env\.PHONEPE_SALT_KEY \|\| '504e73ba-71d3-4e00-83dd-37afb14609a0'\)\.trim\(\);\s*const saltIndex = \(process\.env\.PHONEPE_SALT_INDEX \|\| '1'\)\.trim\(\);\s*const isProd = process\.env\.PHONEPE_ENV !== 'sandbox';/g,
  `const isProd = process.env.PHONEPE_ENV === 'production';\n      const merchantId = (process.env.PHONEPE_MERCHANT_ID || (isProd ? 'M22E1O78XXTHQ' : 'PGTESTPAYUAT')).trim();\n      const saltKey = (process.env.PHONEPE_SALT_KEY || (isProd ? '504e73ba-71d3-4e00-83dd-37afb14609a0' : '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399')).trim();\n      const saltIndex = (process.env.PHONEPE_SALT_INDEX || '1').trim();`
);

fs.writeFileSync('server.ts', code);
