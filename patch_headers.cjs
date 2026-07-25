const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
      /'X-VERIFY': xVerify\s*}/g,
      `'X-VERIFY': xVerify,\n          'X-MERCHANT-ID': merchantId\n        }`
);

fs.writeFileSync('server.ts', code);
console.log('patched headers');
