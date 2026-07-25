const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effectBlock = `
  // Verify PhonePe Live Payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id');
    const orderId = params.get('order_id');
    const isSim = params.get('phonepe_simulation') === 'true';
    
    if (transactionId && orderId && !isSim && !window.location.hash.includes('verified')) {
      fetch('/api/verify-phonepe-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      }).then(res => res.json()).then(data => {
        if (data.success && data.status === 'paid') {
          updateOrderPaymentStatusInFirestore(orderId, 'paid');
          // Clear Cart
          setCartItems([]);
          localStorage.removeItem('rocx_cart');
          alert('Payment Successful! Order ID: ' + orderId);
        } else {
          alert('Payment was not completed. Please try again.');
        }
        window.history.replaceState({}, '', window.location.pathname + '#verified');
      }).catch(err => console.error('Verification error:', err));
    }
  }, []);

`;

code = code.replace(/(\/\/ Scroll to top indicator visibility)/, effectBlock + "$1");
fs.writeFileSync('src/App.tsx', code);
