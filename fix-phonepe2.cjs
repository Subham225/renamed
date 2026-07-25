const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Create payment endpoint
  code = code.replace(
    /const isProd = process\.env\.PHONEPE_ENV === 'production';\s*const merchantId = isProd \? \(process\.env\.PHONEPE_MERCHANT_ID \|\| 'M22E1O78XXTHQ'\) : 'PGTESTPAYUAT86';\s*const saltKey = isProd \? \(process\.env\.PHONEPE_SALT_KEY \|\| '504e73ba-71d3-4e00-83dd-37afb14609a0'\) : '96434309-7796-489d-8924-ab56988a6076';\s*const saltIndex = isProd \? \(process\.env\.PHONEPE_SALT_INDEX \|\| '1'\) : '1';\s*const baseUrl = isProd \? 'https:\/\/api\.phonepe\.com\/apis\/hermes' : 'https:\/\/api-preprod\.phonepe\.com\/apis\/pg-sandbox';/g,
    `const envEnv = String(process.env.PHONEPE_ENV || '').trim().toLowerCase();
      const envMerchant = (process.env.PHONEPE_MERCHANT_ID || '').trim();
      
      const isProd = envEnv === 'production' && envMerchant.length > 5 && envMerchant !== 'M22E1O78XXTHQ';
      
      const merchantId = isProd ? envMerchant : 'PGTESTPAYUAT86';
      const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
      const saltIndex = isProd ? (process.env.PHONEPE_SALT_INDEX || '1') : '1';
      const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';`
  );
  
  // Status checking endpoint
  code = code.replace(
    /const isProd = process\.env\.PHONEPE_ENV === 'production';\s*const merchantId = isProd \? \(process\.env\.PHONEPE_MERCHANT_ID \|\| 'M22E1O78XXTHQ'\) : 'PGTESTPAYUAT86';\s*const saltKey = isProd \? \(process\.env\.PHONEPE_SALT_KEY \|\| '504e73ba-71d3-4e00-83dd-37afb14609a0'\) : '96434309-7796-489d-8924-ab56988a6076';\s*const saltIndex = isProd \? \(process\.env\.PHONEPE_SALT_INDEX \|\| '1'\) : '1';\s*const baseUrl = isProd \? 'https:\/\/api\.phonepe\.com\/apis\/hermes' : 'https:\/\/api-preprod\.phonepe\.com\/apis\/pg-sandbox';/g,
    `const envEnv = String(process.env.PHONEPE_ENV || '').trim().toLowerCase();
      const envMerchant = (process.env.PHONEPE_MERCHANT_ID || '').trim();
      
      const isProd = envEnv === 'production' && envMerchant.length > 5 && envMerchant !== 'M22E1O78XXTHQ';
      
      const merchantId = isProd ? envMerchant : 'PGTESTPAYUAT86';
      const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
      const saltIndex = isProd ? (process.env.PHONEPE_SALT_INDEX || '1') : '1';
      const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';`
  );
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
console.log("Patched server.ts completely");
