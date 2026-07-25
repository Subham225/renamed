const fs = require('fs');

let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

const target = `          if (data.keyId === 'TEST_MODE') {
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

const replacement = `          if (data.keyId === 'TEST_MODE') {
            // Use the client-side test mode UI using a dummy key
            const testKey = import.meta.env.VITE_RAZORPAY_TEST_KEY || 'rzp_test_dummy1234567890';
            const options = {
              key: testKey,
              amount: data.amount,
              currency: data.currency,
              name: "Rocx Cakes (TEST MODE)",
              description: "Test Payment",
              handler: async function (response: any) {
                // In test mode, we just assume success since there's no backend signature verification for a dummy key
                setIsLoading(false);
                setStep("success");
              },
              prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone
              },
              theme: {
                color: "#3399cc"
              }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: any) {
               setIsLoading(false);
               setPaymentError(response.error.description || "Test payment failed");
            });
            paymentObject.open();
            return;
          }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/CartDrawer.tsx', code);
console.log("Patched CartDrawer.tsx to use real Razorpay UI for test mode");
