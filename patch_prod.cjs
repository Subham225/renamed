const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement1 = `
      // PROD keys
      const isProd = true;
      const merchantId = 'M22E1O78XXTHQ';
      const saltKey = '504e73ba-71d3-4e00-83dd-37afb14609a0';
      const saltIndex = '1';
      const baseUrl = 'https://api.phonepe.com/apis/hermes';
`;

code = code.replace(
      /const isProd = false;\s*const merchantId = 'PGTESTPAYUAT86';\s*const saltKey = '96434309-7796-489d-8924-ab56988a6076';\s*const saltIndex = '1';\s*const baseUrl = 'https:\/\/api-preprod\.phonepe\.com\/apis\/pg-sandbox';/g,
      replacement1.trim()
);

fs.writeFileSync('server.ts', code);
console.log('patched to prod');
