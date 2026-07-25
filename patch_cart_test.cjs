const fs = require('fs');

let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

const target = `          if (!data.success) {
            setIsLoading(false);
            setPaymentError(data.error || "Failed to create order");
            return;
          }`;

const replacement = `          if (!data.success) {
            setIsLoading(false);
            setPaymentError(data.error || "Failed to create order");
            return;
          }

          if (data.keyId === 'TEST_MODE') {
            // Simulate Razorpay success popup
            alert("TEST MODE: Razorpay payment simulated successfully.");
            try {
              const verifyRes = await fetch('/api/verify-razorpay-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: data.orderId,
                  razorpay_payment_id: 'pay_test_' + Date.now(),
                  razorpay_signature: 'test_signature'
                })
              });
              const verifyData = await verifyRes.json();
              setIsLoading(false);
              if (verifyData.success) {
                setStep("success");
              } else {
                setPaymentError("Payment verification failed in test mode.");
              }
            } catch (err) {
              setIsLoading(false);
              setPaymentError("Error verifying test payment.");
            }
            return;
          }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/CartDrawer.tsx', code);
console.log("Patched CartDrawer.tsx for test mode");
