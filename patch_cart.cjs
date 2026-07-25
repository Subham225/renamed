const fs = require('fs');

let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

const oldPaymentCode = `    if (formData.paymentMode === "Online Payment") {
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
          console.error('PhonePe API Error: ' + (JSON.stringify(data.details) || data.error || 'Unknown error')); setPaymentError('PhonePe API Error: ' + (JSON.stringify(data.details) || data.error || 'Unknown error'));
        }
      }).catch(err => {
        setIsLoading(false);
        console.error('Network error connecting to PhonePe gateway'); setPaymentError('Network error connecting to PhonePe gateway');
      });
    } else {
      setIsLoading(false);
      setStep("success");
    }`;

const newPaymentCode = `    if (formData.paymentMode === "Online Payment") {
      const loadScript = (src: string) => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      loadScript("https://checkout.razorpay.com/v1/checkout.js").then(async (res) => {
        if (!res) {
          setIsLoading(false);
          setPaymentError("Razorpay SDK failed to load. Are you offline?");
          return;
        }

        try {
          const response = await fetch('/api/create-razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: finalOrderObject })
          });
          const data = await response.json();

          if (!data.success) {
            setIsLoading(false);
            setPaymentError(data.error || "Failed to create order");
            return;
          }

          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: "Rocx Cakes",
            description: "Cake Order Payment",
            order_id: data.orderId,
            handler: async function (response: any) {
              setIsLoading(true);
              try {
                const verifyRes = await fetch('/api/verify-razorpay-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(response)
                });
                const verifyData = await verifyRes.json();
                
                setIsLoading(false);
                if (verifyData.success) {
                  setStep("success");
                } else {
                  setPaymentError("Payment verification failed. Please try again.");
                }
              } catch (err) {
                setIsLoading(false);
                setPaymentError("Error verifying payment.");
              }
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
             setPaymentError(response.error.description || "Payment failed");
          });
          paymentObject.open();
          setIsLoading(false);

        } catch (err) {
          setIsLoading(false);
          console.error('Network error connecting to Razorpay gateway', err);
          setPaymentError('Network error connecting to Razorpay gateway');
        }
      });
    } else {
      setIsLoading(false);
      setStep("success");
    }`;

code = code.replace(oldPaymentCode, newPaymentCode);
fs.writeFileSync('src/components/CartDrawer.tsx', code);
console.log("Patched src/components/CartDrawer.tsx");
