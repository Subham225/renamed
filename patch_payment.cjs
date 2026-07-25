const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// 1. Add Payment Mode Selection UI
const checkoutFormPattern = /(<textarea[\s\S]*?name="landmark"[\s\S]*?<\/textarea>\s*<\/div>)/;
const paymentModeUI = `
                  <div className="pt-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                      Payment Mode <span className="text-pink-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={\`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all \${formData.paymentMode === 'Online Payment' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}\`}>
                        <input type="radio" name="paymentMode" value="Online Payment" checked={formData.paymentMode === 'Online Payment'} onChange={handleInputChange} className="hidden" />
                        <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                           <Zap className="w-3.5 h-3.5" />
                           Online (PhonePe)
                        </span>
                      </label>
                      <label className={\`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all \${formData.paymentMode === 'Cash On Delivery' ? 'border-pink-600 bg-pink-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}\`}>
                        <input type="radio" name="paymentMode" value="Cash On Delivery" checked={formData.paymentMode === 'Cash On Delivery'} onChange={handleInputChange} className="hidden" />
                        <span className="text-[10px] font-black uppercase text-pink-700 tracking-wider">
                           Cash On Delivery
                        </span>
                      </label>
                    </div>
                  </div>
`;
code = code.replace(checkoutFormPattern, "$1\n" + paymentModeUI);

// 2. Default to Online Payment
code = code.replace(/paymentMode: "QR Code \/ UPI"/g, 'paymentMode: "Online Payment"');

// 3. Update handleOrderSubmit to actually call the API
const handleOrderSubmitRegex = /(const handleOrderSubmit = \(\) => \{[\s\S]*?)(const randomSerial = Math\.floor\(100000 \+ Math\.random\(\) \* 900000\);)/;

code = code.replace(handleOrderSubmitRegex, (match, p1, p2) => {
  return p1 + `    setIsLoading(true);\n    ` + p2;
});

// We need an isLoading state
code = code.replace(/const \[formErrors, setFormErrors\] = useState<Record<string, string>>\(\{\}\);/, `const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);`);

// Call PhonePe instead of directly showing success if online
const finalizeOrderPattern = /(sendOrderEmailNotification\(finalOrderObject\)[\s\S]*?\.catch\(\(err\) => \{[\s\S]*?\}\);\s*)(setStep\("success"\);\s*\};)/;

const phonePeLogic = `
    if (formData.paymentMode === "Online Payment") {
      fetch('/api/create-phonepe-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order: finalOrderObject,
          successUrl: window.location.origin + window.location.pathname,
          cancelUrl: window.location.origin + window.location.pathname
        })
      }).then(res => res.json()).then(data => {
        setIsLoading(false);
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          alert('Failed to initialize PhonePe payment: ' + (data.error || 'Unknown error'));
        }
      }).catch(err => {
        setIsLoading(false);
        alert('Network error connecting to PhonePe gateway');
      });
    } else {
      setIsLoading(false);
      setStep("success");
    }
  };`;

code = code.replace(finalizeOrderPattern, "$1" + phonePeLogic);

// Add loading to place order button
code = code.replace(/<button\s+onClick=\{handleOrderSubmit\}\s+className="flex-1 bg-slate-900/, `<button\n                      onClick={handleOrderSubmit}\n                      disabled={isLoading}\n                      className="flex-1 bg-slate-900`);

code = code.replace(/Place Order<br \/>\s*<span/g, `{isLoading ? "Processing..." : "Place Order"}<br />\n                        <span`);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
