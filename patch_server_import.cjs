const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// replace dynamic import with nothing inside the route, since we will import at top
code = code.replace(/const Razorpay = \(await import\('razorpay'\)\)\.default;/g, '');

// add static import at the top
if (!code.includes("import Razorpay from 'razorpay';")) {
  code = `import Razorpay from 'razorpay';\n` + code;
}

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with static Razorpay import");
