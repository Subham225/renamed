const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('await import(\'razorpay\')')) {
    code = code.replace(/const Razorpay = \(await import\('razorpay'\)\)\.default;/g, 'const rzp = new Razorpay({');
    code = code.replace(/const rzp = new Razorpay\(\{/, 'const Razorpay = require("razorpay");\n    const rzp = new Razorpay({');
  }

  // But since the file is ES module, we should use import. Wait, netlify functions api.js has type: module, but it's esbuild so require is fine inside function, OR static import at top.
  // Actually, replacing with top-level import is better.
  fs.writeFileSync(file, code);
}

patchFile('netlify/functions/api.js');
console.log("Patched dynamic import in api.js");
