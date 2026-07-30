const fs = require('fs');

let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

// 1. Force deliverySubtotal = 0 if cart contains 'free_test_item'
code = code.replace(
  /deliverySubtotal = basePrice \+ surcharge;\n\s*\}/,
  `deliverySubtotal = basePrice + surcharge;\n  }\n  if (cartItems.some(item => item.product.id === 'free_test_item')) {\n    deliverySubtotal = 0;\n  }`
);

// 2. Bypass Razorpay if finalTotalAmount === 0
code = code.replace(
  /if \(formData\.paymentMode === "Online Payment"\) \{/,
  `if (formData.paymentMode === "Online Payment" && finalTotalAmount > 0) {`
);

fs.writeFileSync('src/components/CartDrawer.tsx', code);
console.log("Patched CartDrawer.tsx for free test item");
