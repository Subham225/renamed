const fs = require('fs');

function fixServerTs() {
  let code = fs.readFileSync('server.ts', 'utf8');
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
  fs.writeFileSync('server.ts', code);
}

function fixNetlifyApi() {
  let code = fs.readFileSync('netlify/functions/api.js', 'utf8');
  code = code.replace(
    /const envMerchantId = process\.env\.PHONEPE_MERCHANT_ID \|\| '';\s*\/\/ If explicitly sandbox, force it\. Otherwise infer from environment or keys\.\s*const isProd = process\.env\.PHONEPE_ENV === 'sandbox' \|\| process\.env\.PHONEPE_ENV === 'test'\s*\? false\s*: \(process\.env\.PHONEPE_ENV === 'production' \|\| \(envMerchantId\.length > 5 && !envMerchantId\.includes\('PGTEST'\)\)\);\s*const merchantId = isProd \? \(envMerchantId \|\| 'M22E1O78XXTHQ'\) : 'PGTESTPAYUAT86';\s*const saltKey = isProd \? \(process\.env\.PHONEPE_SALT_KEY \|\| '504e73ba-71d3-4e00-83dd-37afb14609a0'\) : '96434309-7796-489d-8924-ab56988a6076';\s*const saltIndex = isProd \? \(process\.env\.PHONEPE_SALT_INDEX \|\| '1'\) : '1';\s*const baseUrl = isProd \? 'https:\/\/api\.phonepe\.com\/apis\/hermes' : 'https:\/\/api-preprod\.phonepe\.com\/apis\/pg-sandbox';/g,
    `const envEnv = String(process.env.PHONEPE_ENV || '').trim().toLowerCase();
    const envMerchant = (process.env.PHONEPE_MERCHANT_ID || '').trim();
    
    // Only use production if explicitly asked and a real merchant ID is provided
    const isProd = envEnv === 'production' && envMerchant.length > 5 && envMerchant !== 'M22E1O78XXTHQ';
    
    const merchantId = isProd ? envMerchant : 'PGTESTPAYUAT86';
    const saltKey = isProd ? (process.env.PHONEPE_SALT_KEY || '504e73ba-71d3-4e00-83dd-37afb14609a0') : '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = isProd ? (process.env.PHONEPE_SALT_INDEX || '1') : '1';
    
    const baseUrl = isProd ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';`
  );
  fs.writeFileSync('netlify/functions/api.js', code);
}

fixServerTs();
fixNetlifyApi();
console.log("Patched server.ts and netlify/functions/api.js");
