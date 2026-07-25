const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement1 = `
      let isProd = process.env.PHONEPE_ENV === 'production';
      const envMerchantId = process.env.PHONEPE_MERCHANT_ID;
      if (envMerchantId && !envMerchantId.includes('TEST') && !envMerchantId.includes('UAT')) {
         isProd = true;
      }
      const merchantId = (envMerchantId || (isProd ? '' : 'PGTESTPAYUAT86')).trim();
      const saltKey = (process.env.PHONEPE_SALT_KEY || (isProd ? '' : '96434309-7796-489d-8924-ab56988a6076')).trim();
      const saltIndex = (process.env.PHONEPE_SALT_INDEX || '1').trim();
      const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
`;

code = code.replace(
      /const isProd = process\.env\.PHONEPE_ENV === 'production';\s*const merchantId = \(process\.env\.PHONEPE_MERCHANT_ID \|\| \(isProd \? '' : 'PGTESTPAYUAT86'\)\)\.trim\(\);\s*const saltKey = \(process\.env\.PHONEPE_SALT_KEY \|\| \(isProd \? '' : '96434309-7796-489d-8924-ab56988a6076'\)\)\.trim\(\);\s*const saltIndex = \(process\.env\.PHONEPE_SALT_INDEX \|\| '1'\)\.trim\(\);\s*const baseUrl = isProd \? 'https:\/\/api\.phonepe\.com\/apis\/hermes' : 'https:\/\/api-preprod\.phonepe\.com\/apis\/pg-sandbox';/g,
      replacement1.trim()
);

fs.writeFileSync('server.ts', code);
console.log('patched');
