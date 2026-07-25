const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// Replace alerts with state errors
code = code.replace(
  /alert\('Failed to initialize PhonePe payment: ' \+ \(data\.error \|\| 'Unknown error'\)\);/g,
  `alert('Failed to initialize PhonePe payment: ' + (data.error || 'Unknown error')); setPaymentError('Failed to initialize PhonePe payment: ' + (data.error || 'Unknown error'));`
);

code = code.replace(
  /alert\('Network error connecting to PhonePe gateway'\);/g,
  `alert('Network error connecting to PhonePe gateway'); setPaymentError('Network error connecting to PhonePe gateway');`
);

code = code.replace(
  /const \[emailError, setEmailError\] = useState\(""\);/g,
  `const [emailError, setEmailError] = useState("");\n  const [paymentError, setPaymentError] = useState("");`
);

code = code.replace(
  /\{step === "checkout_payment" && \(/g,
  `{step === "checkout_payment" && (\n                  <>`
);

code = code.replace(
  /Confirm Payment & Place Order\s*<\/button>\s*\)\}/g,
  `Confirm Payment & Place Order\n                  </button>\n                  {paymentError && <div className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 p-2 rounded-lg border border-red-100">{paymentError}</div>}\n                  </>\n                )}`
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
