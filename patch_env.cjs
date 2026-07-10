const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement1 = `
      const isProd = process.env.PHONEPE_ENV !== 'sandbox';
      const merchantId = isProd ? (process.env.PHONEPE_MERCHANT_ID || 'M22E1O78XXTHQ') : 'PGTESTPAYUAT86';
      const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
      const saltIndex = isProd ? '1' : '1';
      const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
`;

code = code.replace(
      /const isProd = true;\s*const merchantId = 'M22E1O78XXTHQ';\s*const saltKey = '504e73ba-71d3-4e00-83dd-37afb14609a0';\s*const saltIndex = '1';\s*const baseUrl = 'https:\/\/api\.phonepe\.com\/apis\/hermes';/g,
      replacement1.trim()
);

fs.writeFileSync('server.ts', code);
console.log('patched to env');
