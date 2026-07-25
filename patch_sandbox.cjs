const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement1 = `
      // Always use sandbox keys for now since Prod keys are returning 404
      const isProd = false;
      const merchantId = 'PGTESTPAYUAT86';
      const saltKey = '96434309-7796-489d-8924-ab56988a6076';
      const saltIndex = '1';
      const baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
`;

code = code.replace(
      /let isProd = process\.env\.PHONEPE_ENV === 'production';[\s\S]*?const baseUrl = isProd \? 'https:\/\/api\.phonepe\.com\/apis\/hermes' : 'https:\/\/api-preprod\.phonepe\.com\/apis\/pg-sandbox';/g,
      replacement1.trim()
);

fs.writeFileSync('server.ts', code);
console.log('patched to sandbox');
