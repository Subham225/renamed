const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

code = code.replace(
  /\{step === "checkout_payment" && \(\n                  <button([\s\S]*?)<\/button>\n                  \{paymentError && <div className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 p-2 rounded-lg border border-red-100">\{paymentError\}<\/div>\}\n                \)\}/g,
  `{step === "checkout_payment" && (
                  <div className="flex flex-col w-full gap-2">
                  <button$1</button>
                  {paymentError && <div className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 p-2 rounded-lg border border-red-100">{paymentError}</div>}
                  </div>
                )}`
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
