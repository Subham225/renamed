const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

code = code.replace(/<>\n                  <button/g, '<button');
code = code.replace(/<>\n                <div className="space-y-4">/g, '<div className="space-y-4">');

code = code.replace(/\{step === "checkout_payment" && \(\n                  <>/g, '{step === "checkout_payment" && (');

fs.writeFileSync('src/components/CartDrawer.tsx', code);
