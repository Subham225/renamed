const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /const razorpayKeyId = process\.env\.RAZORPAY_KEY_ID;/g,
    "const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_THdeE5ebRzZMNG';"
  );
  
  code = code.replace(
    /const razorpayKeySecret = process\.env\.RAZORPAY_KEY_SECRET;/g,
    "const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'vOobX8Ah1qnFPLI41V0sEOlb';"
  );
  
  fs.writeFileSync(file, code);
}

patchFile('server.ts');
patchFile('netlify/functions/api.js');
console.log("Patched server.ts and netlify/functions/api.js with live keys");
