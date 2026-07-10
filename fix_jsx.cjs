const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

code = code.replace(
  /\{step === "checkout_payment" && \(\n                  <button\n                    onClick=\{handleOrderSubmit\}\n                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-xl transition duration-150 shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-sans"\n                  >\n                    <Sparkles className="w-4 h-4 fill-current animate-pulse" \/>\{" "\}\n                    Confirm Payment & Place Order\n                  <\/button>\n                  \{paymentError && <div className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 p-2 rounded-lg border border-red-100">\{paymentError\}<\/div>\}\n                \)\}/,
  `{step === "checkout_payment" && (
                  <div className="flex flex-col w-full">
                  <button
                    onClick={handleOrderSubmit}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-xl transition duration-150 shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    <Sparkles className="w-4 h-4 fill-current animate-pulse" />{" "}
                    Confirm Payment & Place Order
                  </button>
                  {paymentError && <div className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 p-2 rounded-lg border border-red-100">{paymentError}</div>}
                  </div>
                )}`
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
