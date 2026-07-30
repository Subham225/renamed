import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Lock, Compass, CheckCircle2, Phone, AlertCircle, Sparkles, Key, 
  MapPin, Clock, ArrowRight, UserCheck, Check, CornerDownRight 
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  updateOrderStatusInFirestore, 
  saveRiderToFirestore, 
  registerOrderAuditInFirestore, 
  subscribeToDeliveryAudits 
} from '../services/dbService';
import { DELIVERY_AGENTS, DeliveryAgent } from '../types';

interface DeliveryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  onUpdateOrderStatus: (orderId: string, status: string, estimatedDelivery?: string) => void;
  onUpdateOrderPickup: (orderId: string, picked: boolean) => void;
  onUpdateOrderOtp?: (orderId: string, otp: string) => void;
  riders?: DeliveryAgent[];
}

export default function DeliveryPanel({ 
  isOpen, 
  onClose, 
  orders, 
  onUpdateOrderStatus,
  onUpdateOrderPickup,
  onUpdateOrderOtp,
  riders = DELIVERY_AGENTS
}: DeliveryPanelProps) {
  // Login flow
  const [currentRiderId, setCurrentRiderId] = useState<string | null>(() => {
    return localStorage.getItem('rocx_delivery_rider_id');
  });
  const [isAuthorized, setIsAuthorized] = useState(() => {
    const authorized = localStorage.getItem('rocx_delivery_authorized') === 'true';
    const riderId = localStorage.getItem('rocx_delivery_rider_id');
    return authorized && !!riderId;
  });
  const [loginError, setLoginError] = useState('');

  // Lock state: Once an order is "picked", delivery agent cannot go back or close the screen!
  const [pickedOrderId, setPickedOrderId] = useState<string | null>(() => {
    return localStorage.getItem('rocx_delivery_picked_order_id');
  });

  // Delivery status verification states
  const [typedOtp, setTypedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Manual verification bypass
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualRelation, setManualRelation] = useState<'Self' | 'Other'>('Self');
  const [manualCustomRelation, setManualCustomRelation] = useState('');
  const [manualVerificationError, setManualVerificationError] = useState('');

  // Success states
  const [successMessage, setSuccessMessage] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [sentOtpSuccess, setSentOtpSuccess] = useState('');

  // Filter state for delivery runs ('today' by default)
  const [filterType, setFilterType] = useState<'today' | 'all'>('today');

  // Audit log registry state & view toggler
  const [viewMode, setViewMode] = useState<'assigned' | 'audit_register'>('assigned');
  const [audits, setAudits] = useState<any[]>([]);

  // Subscribe to delivery audit list for the authenticated rider and this device session
  useEffect(() => {
    if (isAuthorized && currentRiderId) {
      // Setup or retrieve device unique identifier
      let currentDeviceId = localStorage.getItem('rocx_delivery_device_id');
      if (!currentDeviceId) {
        currentDeviceId = `DEV-${Math.floor(100000 + Math.random() * 900000)}`;
        localStorage.setItem('rocx_delivery_device_id', currentDeviceId);
      }

      const unsub = subscribeToDeliveryAudits((allAudits) => {
        // Fetch current list of orders audited locally by this device to catch offline/fallback actions
        const savedLocalAudits = localStorage.getItem('rocx_delivery_device_audited_orders');
        let localAuditedIds: string[] = [];
        if (savedLocalAudits) {
          try {
            localAuditedIds = JSON.parse(savedLocalAudits);
          } catch (e) {}
        }

        const filtered = allAudits.filter(a => {
          const matchesRider = a.riderId === currentRiderId;
          const matchesDevice = a.deviceId === currentDeviceId || localAuditedIds.includes(a.orderId);
          return matchesRider && matchesDevice;
        });
        setAudits(filtered);
      });
      return unsub;
    }
  }, [isAuthorized, currentRiderId, successMessage]);

  // Auditor helper to save trace records
  const triggerOrderDeliveryAudit = async (
    order: any,
    verificationMode: 'OTP' | 'Manual Bypass',
    bypassDetails?: {
      recipientName: string;
      recipientPhone: string;
      relation: string;
      customRelation: string;
    }
  ) => {
    try {
      const formattedDate = new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Get or initialize device ID
      let currentDeviceId = localStorage.getItem('rocx_delivery_device_id');
      if (!currentDeviceId) {
        currentDeviceId = `DEV-${Math.floor(100000 + Math.random() * 900000)}`;
        localStorage.setItem('rocx_delivery_device_id', currentDeviceId);
      }

      // Record this order ID in the local list of audited orders for this device
      const savedLocalAudits = localStorage.getItem('rocx_delivery_device_audited_orders');
      let localAuditedIds: string[] = [];
      if (savedLocalAudits) {
        try {
          localAuditedIds = JSON.parse(savedLocalAudits);
        } catch (e) {}
      }
      if (!localAuditedIds.includes(order.id)) {
        localAuditedIds.push(order.id);
        localStorage.setItem('rocx_delivery_device_audited_orders', JSON.stringify(localAuditedIds));
      }

      const auditRecord = {
        id: `${order.id}-${Date.now()}`,
        orderId: order.id,
        riderId: currentRiderId || 'unknown_rider',
        riderName: currentRider?.name || 'Rocx Rider',
        deviceId: currentDeviceId,
        date: formattedDate,
        timestamp: Date.now(),
        deliveredAt: `${formattedDate}, ${formattedTime}`,
        customerName: order.customerName || 'N/A',
        customerPhone: order.customerPhone || 'N/A',
        recipientName: order.recipientName || order.customerName || 'N/A',
        recipientPhone: order.recipientPhone || order.customerPhone || 'N/A',
        streetAddress: order.streetAddress || 'N/A',
        landmark: order.landmark || 'N/A',
        total: order.total || 0,
        deliveryFee: order.deliveryFee !== undefined ? order.deliveryFee : 100,
        items: order.items || [],
        verificationMode,
        bypassDetails: bypassDetails || null,
        status: 'Delivered'
      };

      await registerOrderAuditInFirestore(auditRecord);
      console.log("Successfully stored delivery audit tracing record in Firestore:", auditRecord);
    } catch (auditErr) {
      console.error("Critical error in triggerOrderDeliveryAudit:", auditErr);
    }
  };

  const currentRider = useMemo(() => {
    if (!currentRiderId) return null;
    return riders.find(r => r.id === currentRiderId) || null;
  }, [currentRiderId, riders]);

  // Helper to match order delivery date with today's date
  const isTodayOrder = (order: any) => {
    if (!order.deliveryDate) return false;
    
    // Expressed as YYYY-MM-DD (standard browser input format)
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const parts = order.deliveryDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return year === todayYear && month === todayMonth && day === todayDate;
    }

    try {
      const d = new Date(order.deliveryDate);
      return d.getFullYear() === todayYear && d.getMonth() === todayMonth && d.getDate() === todayDate;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setCurrentRiderId(null);
    setPickedOrderId(null);
    localStorage.removeItem('rocx_delivery_authorized');
    localStorage.removeItem('rocx_delivery_rider_id');
    localStorage.removeItem('rocx_delivery_picked_order_id');
  };

  // Synchronously monitor if the currently inspected active order is cancelled or completed elsewhere, then release focus
  useEffect(() => {
    if (isAuthorized && orders && pickedOrderId) {
      const currentPickedOrder = orders.find(o => o.id === pickedOrderId);
      if (!currentPickedOrder || currentPickedOrder.status === 'Delivered' || (currentPickedOrder.status || '').toLowerCase().includes('cancel')) {
        setPickedOrderId(null);
        localStorage.removeItem('rocx_delivery_picked_order_id');
      }
    }
  }, [isAuthorized, orders, pickedOrderId]);

  const handleGoogleSignIn = async () => {
    try {
      setLoginError('');
      const provider = new GoogleAuthProvider();
      // Enforce custom Google Popups aligned with the sandbox iframe permissions
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const riderObj: DeliveryAgent = {
          id: user.uid,
          name: user.displayName || user.email || 'Google Rider',
          email: user.email || undefined,
          type: 'google'
        };
        await saveRiderToFirestore(riderObj);
        
        setIsAuthorized(true);
        setCurrentRiderId(user.uid);
        localStorage.setItem('rocx_delivery_authorized', 'true');
        localStorage.setItem('rocx_delivery_rider_id', user.uid);
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err?.code === 'auth/unauthorized-domain') {
        setLoginError('Firebase a ei notun Netlify domain ti add kora nei. Firebase Console -> Authentication -> Settings -> Authorized domains e giye apnar notun domain ti add korun.');
      } else {
        setLoginError(err?.message || "Failed to sign in with Google. Please try again.");
      }
    }
  };

  // List only "active/live" and completed orders for Today's Run
  const activeOrders = useMemo(() => {
    return orders.filter(o => {
      // Must be assigned to this logged-in rider!
      if (o.assignedRiderId !== currentRiderId) return false;

      const s = (o.status || '').toLowerCase();
      if (s.includes('cancel')) return false;

      // Filter modes
      if (filterType === 'today') {
        // Must be today's order
        if (!isTodayOrder(o)) return false;

        // Either it is delivered (completed), or it is currently active ("out for delivery" or "nearby")
        const isDelivered = o.status === 'Delivered';
        const isOutForDelivery = s.includes('out for delivery') || s.includes('nearby');
        
        return isDelivered || isOutForDelivery;
      } else {
        // filterType === 'all'
        // Outstanding only (excludes delivered), must be "out for delivery/nearby" onwards
        const isOutForDelivery = s.includes('out for delivery') || s.includes('nearby');
        return o.status !== 'Delivered' && isOutForDelivery;
      }
    });
  }, [orders, filterType, currentRiderId]);

  // Find the currently locked order
  const pickedOrder = useMemo(() => {
    if (!pickedOrderId) return null;
    return orders.find(o => o.id === pickedOrderId) || null;
  }, [pickedOrderId, orders]);

  // Handle picking an order (Locked mode)
  const handlePickOrder = (orderId: string) => {
    setPickedOrderId(orderId);
    localStorage.setItem('rocx_delivery_picked_order_id', orderId);
    setTypedOtp('');
    setOtpError('');
    setManualName('');
    setManualPhone('');
    setManualRelation('Self');
    setManualCustomRelation('');
    setManualVerificationError('');

    if (onUpdateOrderPickup) {
      onUpdateOrderPickup(orderId, true);
    }
  };

  // Helper values for OTP check
  const getExpectedOtp = (order: any): string => {
    if (order.deliveryOtp) return order.deliveryOtp;
    // Fallback based on order ID numbers
    const digitsOnly = order.id ? order.id.replace(/\D/g, '') : '5829';
    const fill = digitsOnly.slice(-4);
    return fill.padEnd(4, '0');
  };

  // Generate & dispatch randomized 4-digit OTP via WhatsApp pre-filled link
  const handleSendWhatsAppOtp = async () => {
    if (!pickedOrder || !onUpdateOrderOtp) return;
    setIsSendingOtp(true);
    setSentOtpSuccess('');

    // 1. Generate randomized 4-digit OTP
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      // 2. Save to state & database
      await onUpdateOrderOtp(pickedOrder.id, randomOtp);

      // 3. WhatsApp messages
      const message = `🍰 *ROCX CAKES DELIVERY OTP*\n\nYour verification code is *${randomOtp}*.\nPlease share this code with our delivery agent to identify and securely collect your scrumptious custom cake order #${pickedOrder.id}.\n\nSupport Line: +91 6297337735`;

      const custPhone = (pickedOrder.customerPhone || '').replace(/\D/g, '');
      const rcptPhone = (pickedOrder.recipientPhone || '').replace(/\D/g, '');

      const formatPhone = (ph: string) => {
        const cleaned = ph.replace(/\D/g, '');
        if (cleaned.length === 10) return '91' + cleaned;
        return cleaned;
      };

      const finalCustPhone = formatPhone(custPhone);
      const finalRcptPhone = formatPhone(rcptPhone);

      // Launch customer dispatch silently via Backend API
      if (finalCustPhone) {
        await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: finalCustPhone, otp: randomOtp })
        });
      }

      // If receiver is a different phone number, trigger theirs too
      if (finalRcptPhone && finalRcptPhone !== finalCustPhone) {
        await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: finalRcptPhone, otp: randomOtp })
        });
      }

      setSentOtpSuccess(`✅ OTP successfully dispatched to the customer automatically!`);
      setTimeout(() => setSentOtpSuccess(''), 6000);
    } catch (err) {
      console.error("Error setting custom delivering OTP:", err);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Complete delivery via OTP
  const handleVerifyOtpDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedOrder) return;

    const expected = getExpectedOtp(pickedOrder);
    if (typedOtp.trim() === expected) {
      // Register delivery audit details permanently
      await triggerOrderDeliveryAudit(pickedOrder, 'OTP');

      // Success! Update status to Delivered
      onUpdateOrderStatus(pickedOrder.id, 'Delivered');
      
      setSuccessMessage(`🎉 Order ${pickedOrder.id} Delivered Successfully via OTP!`);
      // Unlock order
      setPickedOrderId(null);
      localStorage.removeItem('rocx_delivery_picked_order_id');
      
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setOtpError('Invalid OTP Code. Please verify with customer!');
    }
  };

  // Complete delivery via Manual verification bypass
  const handleVerifyManualDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedOrder) return;

    if (!manualName.trim() || !manualPhone.trim()) {
      setManualVerificationError('Please enter both recipient name and phone number.');
      return;
    }

    if (manualRelation === 'Other' && !manualCustomRelation.trim()) {
      setManualVerificationError('Please specify the relation (e.g. Brother, Neighbor, Security).');
      return;
    }

    if (manualRelation === 'Self') {
      const orderCustName = (pickedOrder.customerName || '').toLowerCase().trim();
      const orderCustPhone = (pickedOrder.customerPhone || '').replace(/\D/g, '').trim();
      const orderRcptName = (pickedOrder.recipientName || '').toLowerCase().trim();
      const orderRcptPhone = (pickedOrder.recipientPhone || '').replace(/\D/g, '').trim();

      const inputName = manualName.toLowerCase().trim();
      const inputPhone = manualPhone.replace(/\D/g, '').trim();

      // Soft comparison to bypass - matches either billing customer or the recipient credentials of the order
      const nameMatches = 
        (orderCustName && (orderCustName.includes(inputName) || inputName.includes(orderCustName))) ||
        (orderRcptName && (orderRcptName.includes(inputName) || inputName.includes(orderRcptName)));

      const phoneMatches = 
        (orderCustPhone && (orderCustPhone.includes(inputPhone) || inputPhone.includes(orderCustPhone))) ||
        (orderRcptPhone && (orderRcptPhone.includes(inputPhone) || inputPhone.includes(orderRcptPhone)));

      if (nameMatches && phoneMatches) {
        // Register delivery audit details permanently
        await triggerOrderDeliveryAudit(pickedOrder, 'Manual Bypass', {
          recipientName: manualName,
          recipientPhone: manualPhone,
          relation: 'Self',
          customRelation: ''
        });

        // Success! Update status to Delivered
        onUpdateOrderStatus(pickedOrder.id, 'Delivered');
        
        setSuccessMessage(`📦 Manual Dispatch Approved for Order ${pickedOrder.id}!`);
        setPickedOrderId(null);
        localStorage.removeItem('rocx_delivery_picked_order_id');
        
        // Reset states
        setManualName('');
        setManualPhone('');
        setManualRelation('Self');
        setManualCustomRelation('');
        setManualVerificationError('');
        
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setManualVerificationError('Credentials mismatched! For Self delivery, Name and Phone must match customer records.');
      }
    } else {
      // Handed over to other relation
      await triggerOrderDeliveryAudit(pickedOrder, 'Manual Bypass', {
        recipientName: manualName,
        recipientPhone: manualPhone,
        relation: 'Other',
        customRelation: manualCustomRelation
      });

      onUpdateOrderStatus(pickedOrder.id, 'Delivered');
      
      setSuccessMessage(`📦 Handed over to ${manualCustomRelation} (${manualName})!`);
      setPickedOrderId(null);
      localStorage.removeItem('rocx_delivery_picked_order_id');
      
      // Reset states
      setManualName('');
      setManualPhone('');
      setManualRelation('Self');
      setManualCustomRelation('');
      setManualVerificationError('');
      
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950 flex flex-col font-sans text-slate-100">
      {/* Dynamic Action Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛵</span>
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-1.5 leading-none">
              ROCX Delivery Gateway
            </h2>
            <span className="text-[8.5px] font-black tracking-widest uppercase text-emerald-500">Live Agent Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {pickedOrderId && (
            <button 
              onClick={() => {
                setPickedOrderId(null);
                localStorage.removeItem('rocx_delivery_picked_order_id');
              }}
              className="text-[9px] bg-indigo-955/80 border border-indigo-500/20 hover:bg-indigo-900 text-indigo-350 font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer flex items-center gap-1"
            >
              ⬅️ All Runs
            </button>
          )}
          {isAuthorized && (
            <button 
              onClick={handleLogout}
              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer"
            >
              Log Out
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Screen Router Body */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col justify-start">
        {successMessage && (
          <div className="bg-emerald-950 border border-emerald-500/30 text-emerald-200 p-4 rounded-xl text-center font-bold text-xs mb-5 animate-bounce space-y-1">
            <div>{successMessage}</div>
            <div className="text-[8.5px] text-emerald-400 font-black uppercase tracking-widest">Database updated on Cloud-Run</div>
          </div>
        )}

        {/* SCREEN 1: Code Verification Entry Keypad */}
        {!isAuthorized ? (
          <div className="flex-1 flex flex-col justify-center items-center py-10">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner text-emerald-500">
              <Compass className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2 mb-8">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Rider Partner Portal</h3>
              <p className="text-[10px] text-slate-500 font-extrabold max-w-xs uppercase leading-relaxed tracking-wider">
                Authorized Delivery Partner Gateway. Please authenticate using your registered Gmail address to view your assigned routing runs.
              </p>
            </div>

            {loginError && (
              <div className="text-[10px] text-red-400 font-black tracking-wider uppercase mb-5 flex items-center gap-1 bg-red-950/20 border border-red-950/40 px-3 py-1.5 rounded-lg max-w-[320px] w-full text-center justify-center">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{loginError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="max-w-[320px] w-full bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-850 text-white rounded-2xl py-4 px-4 font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-md shadow-black/20"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#ea4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.79 5.79 0 0 1 8.2 12.725a5.79 5.79 0 0 1 5.791-5.789c1.554 0 2.964.604 4.025 1.585l3.078-3.078C19.23 3.655 16.74 2.5 13.99 2.5a9.72 9.72 0 0 0-9.715 9.715 9.72 9.72 0 0 0 9.715 9.715c5.38 0 9.61-3.793 9.61-9.715 0-.41-.035-.815-.1-1.215z"
                />
              </svg>
              <span>Login with Google</span>
            </button>
          </div>
        ) : pickedOrder ? (
          /* SCREEN 3: Active picked order details */
          <div className="space-y-6 animate-fade-in text-left pb-16">
            {/* Manual toggle back to list to allow running multiple orders simultaneously */}
            <button
              onClick={() => {
                setPickedOrderId(null);
                localStorage.removeItem('rocx_delivery_picked_order_id');
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-black/25 font-sans"
            >
              ⬅️ All Assigned Orders
            </button>

            <div className="bg-emerald-950/50 border border-emerald-500/20 p-4 rounded-3xl space-y-1 relative overflow-hidden">
              <span className="text-[8px] bg-indigo-500 text-white font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Active Delivery Run</span>
              <h3 className="text-lg font-black text-white font-mono mt-1">{pickedOrder.id}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase font-sans">Assigned Delivery Address & Navigation</p>
              
              <div className="absolute right-3 top-3 text-3xl select-none opacity-20">🛵</div>
            </div>

            {/* Quick call & Live navigation tools optimized for mobile riders */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${pickedOrder.customerPhone || '6297337735'}`}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800/80 p-3 flex items-center gap-2.5 text-xs font-bold text-slate-200 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[48px]"
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[8px] text-slate-500 font-black block uppercase tracking-wider leading-none mb-0.5">Registered Client</span>
                    Call Customer
                  </div>
                </a>
                <a
                  href={`tel:${pickedOrder.recipientPhone || pickedOrder.customerPhone || '6297337735'}`}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800/80 p-3 flex items-center gap-2.5 text-xs font-bold text-slate-200 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[48px]"
                >
                  <Phone className="w-4 h-4 text-pink-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[8px] text-slate-500 block uppercase tracking-wider leading-none mb-0.5">Receiving Point</span>
                    Call Receiver
                  </div>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`https://wa.me/${(() => {
                    const digits = (pickedOrder.recipientPhone || pickedOrder.customerPhone || '').replace(/\D/g, '');
                    return digits.length === 10 ? `91${digits}` : digits;
                  })()}?text=${encodeURIComponent(`Hi ${pickedOrder.recipientName || pickedOrder.customerName || 'Customer'}, I am your Rocx Cakes & Gifts delivery rider in Kharagpur & Midnapore. I have picked up your order ${pickedOrder.id} and I am on my way to dispatch it. Please keep your 4-digit verification code ready!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-950/45 hover:bg-emerald-950/70 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-black text-emerald-300 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[48px]"
                  referrerPolicy="no-referrer"
                >
                  <span className="text-base leading-none shrink-0 text-emerald-400">💬</span>
                  <div className="text-left leading-tight">
                    <span className="text-[7.5px] text-emerald-500 font-black block uppercase tracking-wider mb-0.5 leading-none">WhatsApp Chat</span>
                    Message Rider
                  </div>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pickedOrder.streetAddress || ''} ${pickedOrder.landmark || ''} Kharagpur West Bengal`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-950/30 hover:bg-sky-950/50 border border-sky-500/20 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-black text-sky-300 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer min-h-[48px]"
                  referrerPolicy="no-referrer"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="text-left leading-tight">
                    <span className="text-[7.5px] text-cyan-400 font-black block uppercase tracking-wider mb-0.5 leading-none">Google Maps GPS</span>
                    Open Route
                  </div>
                </a>
              </div>
            </div>

            {/* Delivery address card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3.5">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block font-mono">Customer (Sender)</span>
                    <p className="text-xs font-black text-white mt-1">{pickedOrder.customerName || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Phone: <span className="text-slate-205 font-mono">{pickedOrder.customerPhone || 'N/A'}</span></p>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block font-mono">Recipient (Consignee)</span>
                    <p className="text-xs font-black text-white mt-1">{pickedOrder.recipientName || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Phone: <span className="text-slate-205 font-mono">{pickedOrder.recipientPhone || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 space-y-1 flex gap-2">
                <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[8.5px] font-black text-indigo-400 uppercase tracking-widest block font-mono">Destination Address</span>
                  <p className="text-xs leading-relaxed font-semibold text-slate-250">{pickedOrder.streetAddress}</p>
                  {pickedOrder.landmark && (
                    <p className="text-[10.5px] font-black text-amber-500 mt-1 uppercase">📍 Landmark: {pickedOrder.landmark}</p>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 space-y-1 flex gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-widest block font-mono">Schedule & Slates</span>
                  <p className="text-xs leading-relaxed font-bold text-slate-200">Date: {pickedOrder.deliveryDate || pickedOrder.date}</p>
                  {pickedOrder.deliveryTimeSlot && (
                    <p className="text-xs leading-relaxed font-black text-pink-400">Time Slot Slot: {pickedOrder.deliveryTimeSlot}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cake items list */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <span className="text-[8.5px] font-black text-pink-500 uppercase tracking-widest block font-mono">Consignment items ({pickedOrder.items?.length || 0})</span>
              <div className="space-y-2">
                {pickedOrder.items?.map((it: any, index: number) => (
                  <div key={index} className="flex gap-2.5 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                    {it.productImage && (
                      <img 
                        src={it.productImage} 
                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-800" 
                        alt="Cake thumb" 
                      />
                    )}
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-white">{it.name} <span className="text-pink-400 font-mono text-[10px]">x{it.quantity}</span></p>
                      {it.options && (
                        <p className="text-[9.5px] font-medium text-slate-400 leading-tight">{it.options}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Details Invoice Card */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Payment Method:</span>
                  <span className="text-white font-mono font-bold bg-slate-800/60 px-2.5 py-0.5 rounded border border-slate-750">
                    {pickedOrder.paymentMode || 'COD'} ({pickedOrder.paymentStatus || 'Paid'})
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Delivery fee:</span>
                  <span className="text-pink-400 font-mono font-black text-[11px]">
                    ₹{pickedOrder.deliveryFee !== undefined ? pickedOrder.deliveryFee : 100}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/50">
                  <span className="text-white font-black uppercase text-[10px]">Total payment:</span>
                  <span className="text-emerald-400 font-mono font-black text-sm">
                    ₹{pickedOrder.total || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER STATUS UPDATE BUTTONS */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl space-y-3">
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-black text-indigo-400 uppercase tracking-widest block font-mono">Action Phase</span>
                <h4 className="text-[11.5px] font-black uppercase text-white tracking-wide">Change Order Logistics Status In Real-Time</h4>
                <p className="text-[9.5px] text-slate-400">Update current phase before delivering</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'Out For Delivery Get Delivery Notification Through Whatsapp or Phone Number', label: '🛵 Set: Out for Delivery' },
                  { value: 'Rider is Nearby', label: '📍 Rider is Nearby' }
                ].map((item) => {
                  const isActive = pickedOrder.status === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => onUpdateOrderStatus(pickedOrder.id, item.value)}
                      className={`py-2 px-3 rounded-xl text-[9.5px] font-black uppercase tracking-wide transition-all ${
                        isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/10 ring-2 ring-violet-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DELIVER CONFIRMATION WITH TWO MODES */}
            <div className="bg-slate-900 border-2 border-emerald-500/20 shadow-md shadow-emerald-950/20 p-4 rounded-3xl space-y-5">
              <div className="text-center space-y-1">
                <span className="text-2xl">🟢</span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Final Deliver Gate</h4>
                <p className="text-[10px] text-slate-400 font-extrabold max-w-xs mx-auto uppercase tracking-wide leading-relaxed">
                  Generate OTP code below and verify it with the recipient of the sweet packages.
                </p>
              </div>

              {/* Generate & Dispatch SMS OTP Block */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 text-center">
                <div>
                  <span className="text-[8.5px] font-black text-rose-450 uppercase tracking-widest block font-mono">1. DISPATCH OTP CODE</span>
                  <h5 className="text-[10px] font-black uppercase text-white tracking-wide">Instant SMS Dispatch</h5>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsAppOtp}
                  disabled={isSendingOtp}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  💬 Send OTP Code
                </button>
                <div className="text-[8px] text-slate-400 font-extrabold uppercase flex flex-col gap-0.5">
                  <span>Sends directly to customer number</span>
                </div>
                {sentOtpSuccess && (
                  <p className="text-[9px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-1.5 rounded-lg leading-tight animate-fade-in text-center">
                    {sentOtpSuccess}
                  </p>
                )}
              </div>

              {/* Mode A: OTP verification Form */}
              <form onSubmit={handleVerifyOtpDelivery} className="space-y-3.5 pt-2 border-t border-slate-800/80">
                <div className="flex flex-col items-center gap-1.5">
                  <label htmlFor="delivery-otp-input" className="text-[8.5px] font-black tracking-widest text-emerald-400 uppercase">
                    2. ENTER VERIFICATION OTP / PIN CODE
                  </label>
                  <input
                    id="delivery-otp-input"
                    type="text"
                    maxLength={4}
                    value={typedOtp}
                    onChange={(e) => {
                      setTypedOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    placeholder="e.g. 5829"
                    className="max-w-[130px] font-mono text-center text-xl font-black bg-slate-950 text-white placeholder-slate-800 border-2 border-slate-800 focus:border-emerald-500 rounded-xl py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 tracking-widest"
                  />
                </div>

                {otpError && (
                  <p className="text-[9.5px] font-black uppercase text-red-400 text-center flex items-center justify-center gap-1">
                    ⚠️ {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={typedOtp.length !== 4}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/10"
                >
                  <Check className="w-4 h-4 text-slate-950" /> Confirm Delivered (With OTP)
                </button>
              </form>

              {/* Mode B: Manual Verification Fallback Form - Rendered directly underneath */}
              <div className="pt-4 border-t border-slate-850 space-y-4">
                <div className="text-center space-y-0.5">
                  <h5 className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest font-mono">Manual Handover Fallback Form</h5>
                  <p className="text-[8.5px] text-slate-500 font-bold uppercase leading-none">Fill recipient details if customer cannot provide OTP</p>
                </div>

                <form onSubmit={handleVerifyManualDelivery} className="space-y-3.5 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-1">
                    <span className="text-xs">📋</span>
                    <div>
                      <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest font-mono">Delivery Handover Details</h5>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40 text-[9px] text-slate-400 font-semibold space-y-1">
                    <span className="font-extrabold text-amber-500 uppercase tracking-widest block text-[8px]">Expected Match Reference:</span>
                    <div>• Name: <span className="text-white font-black">{pickedOrder.recipientName || pickedOrder.customerName}</span> (or Billing client name)</div>
                    <div>• Phone: <span className="text-white font-mono font-black">{pickedOrder.recipientPhone || pickedOrder.customerPhone || 'N/A'}</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="manual-cust-name" className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Recipient Name</label>
                      <input
                        id="manual-cust-name"
                        type="text"
                        required
                        value={manualName}
                        onChange={(e) => {
                          setManualName(e.target.value);
                          setManualVerificationError('');
                        }}
                        placeholder="e.g. Subham Patra"
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] px-3 py-1.5 rounded-xl focus:border-indigo-500 focus:outline-none text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="manual-cust-phone" className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Phone Number</label>
                      <input
                        id="manual-cust-phone"
                        type="text"
                        required
                        value={manualPhone}
                        onChange={(e) => {
                          setManualPhone(e.target.value);
                          setManualVerificationError('');
                        }}
                        placeholder="e.g. 6297337735"
                        className="w-full bg-slate-900 border border-slate-800 text-[11px] px-3 py-1.5 rounded-xl focus:border-indigo-500 focus:outline-none text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="manual-relation-select" className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Delivery Handover Code / Relation</label>
                    <select
                      id="manual-relation-select"
                      value={manualRelation}
                      onChange={(e) => {
                        setManualRelation(e.target.value as 'Self' | 'Other');
                        setManualVerificationError('');
                      }}
                      className="w-full bg-slate-900 border border-slate-850 text-[11px] px-3 py-2 rounded-xl focus:border-indigo-500 focus:outline-none text-white font-semibold cursor-pointer"
                    >
                      <option value="Self">Self (Customer directly)</option>
                      <option value="Other">Other Handover</option>
                    </select>
                  </div>

                  {manualRelation === 'Other' && (
                    <div className="space-y-1 animate-slide-up">
                      <label htmlFor="manual-custom-relation" className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Specify Other Relationship</label>
                      <input
                        id="manual-custom-relation"
                        type="text"
                        required
                        value={manualCustomRelation}
                        onChange={(e) => {
                          setManualCustomRelation(e.target.value);
                          setManualVerificationError('');
                        }}
                        placeholder="e.g. Neighbor, Brother, Security Guard"
                        className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl focus:border-indigo-500 focus:outline-none text-white font-semibold"
                      />
                    </div>
                  )}

                  {manualVerificationError && (
                    <p className="text-[9.5px] font-black text-red-400 bg-red-950/20 border border-red-950/30 p-2 rounded-lg leading-tight flex items-center gap-1">
                      ⚠️ {manualVerificationError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4 text-slate-950 shrink-0" /> Approve Handover & Deliver
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* SCREEN 2: List of active live orders */
          <div className="space-y-5 text-left pb-12">
            <div className="flex flex-col gap-3">
              {/* Rider Profile details */}
              <div className="flex bg-slate-900 border border-slate-800/85 p-3.5 rounded-3xl items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0 select-none animate-pulse">
                  🛵
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[7.5px] text-amber-500 font-black uppercase tracking-widest block leading-none mb-1">Rider Station Profile</span>
                  <strong className="text-xs font-black text-white block uppercase tracking-wide truncate">
                    {currentRider?.name || 'Rocx Special Rider'}
                  </strong>
                  {currentRider?.type === 'google' ? (
                    <span className="text-[9px] font-extrabold text-teal-400 mt-1 block leading-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block"></span>
                      Google Active: <span className="font-mono text-teal-300">{currentRider?.email}</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold text-slate-400 mt-1 block leading-none">
                      Security Passcode: <span className="font-mono text-amber-400">{currentRider?.passcode || '2666'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Premium Dual Tab Selector - Assigned Runs vs Audit Register */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-850/80 mt-1 mb-2.5">
                <button
                  type="button"
                  onClick={() => setViewMode('assigned')}
                  className={`py-2 px-3 rounded-xl text-[10.5px] font-black uppercase tracking-wide transition-all cursor-pointer text-center ${
                    viewMode === 'assigned'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  My Runs ({activeOrders.filter(o => o.status !== 'Delivered').length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('audit_register')}
                  className={`py-2 px-3 rounded-xl text-[10.5px] font-black uppercase tracking-wide transition-all cursor-pointer text-center ${
                    viewMode === 'audit_register'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  Audit Journal ({audits.length})
                </button>
              </div>

              {viewMode === 'assigned' ? (
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">My Assigned Runs</h3>
                    <p className="text-[9.5px] text-slate-400 uppercase leading-none mt-0.5">Awaiting delivery dispatch</p>
                  </div>
                  <span className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black py-1 px-3 rounded-xl">
                    🟢 {activeOrders.filter(o => o.status !== 'Delivered').length} live
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">📜 Audit History</h3>
                    <p className="text-[9.5px] text-slate-400 uppercase leading-none mt-0.5 font-sans">Approved delivery runs journal</p>
                  </div>
                  <span className="bg-indigo-950 border border-indigo-500/20 text-indigo-400 font-mono text-[10px] font-black py-1 px-3 rounded-xl font-mono">
                    📁 {audits.length} records
                  </span>
                </div>
              )}

              {/* High-contrast premium filter toggles */}
              {viewMode === 'assigned' && (
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 max-w-max gap-1">
                  <button
                    type="button"
                    onClick={() => setFilterType('today')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      filterType === 'today'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                  >
                    📅 Today's Run
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                  >
                    📋 All Outstanding ({orders.filter(o => o.status !== 'Delivered' && !(o.status || '').toLowerCase().includes('cancel')).length})
                  </button>
                </div>
              )}
            </div>

            {viewMode === 'assigned' ? (
              activeOrders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
                  <span className="text-3xl select-none">🏖️</span>
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">All Clear! No active delivery orders</h4>
                  <p className="text-[10px] text-slate-500 font-extrabold max-w-xs mx-auto uppercase leading-relaxed tracking-wider">
                    Check back later. As soon as a client triggers a payment checkout, the order will load here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                {activeOrders.map((order) => {
                  const expectedOtp = getExpectedOtp(order);
                  const cleanPhoneNum = (order.recipientPhone || order.customerPhone || '').replace(/\D/g, '');
                  const waNumber = cleanPhoneNum.length === 10 ? `91${cleanPhoneNum}` : cleanPhoneNum;
                  
                  return (
                    <div 
                      key={order.id} 
                      className="bg-slate-900 border border-slate-850 hover:border-slate-800 p-4 rounded-3xl transition duration-150 flex flex-col gap-3.5 shadow-md hover:shadow-lg active:border-slate-700/80"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-xs font-black text-white font-mono tracking-wider">{order.id}</strong>
                          <div className="text-[9.5px] font-semibold text-slate-500 tracking-tight mt-0.5">
                            Placed: {order.date}
                          </div>
                        </div>
                        {order.status === 'Delivered' ? (
                          <span className="text-[9.5px] bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-black px-2.5 py-1 rounded-lg uppercase leading-none font-sans flex items-center gap-1">
                            🎉 Delivered
                          </span>
                        ) : order.deliveryAgentPicked ? (
                          <span className="text-[8px] bg-amber-950/80 border border-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded uppercase leading-none font-sans flex items-center gap-1 animate-pulse">
                            🛵 Already Picked Up
                          </span>
                        ) : (
                          <span className="text-[9px] bg-purple-950/30 border border-purple-500/20 text-purple-450 font-black px-2 py-0.5 rounded uppercase leading-none font-sans">
                            {order.status}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex gap-1.5 items-start">
                          <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                          <div className="text-slate-300 w-full space-y-2">
                            <div>
                              <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-wider block font-mono">Consignee & Order Contacts</span>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850/50">
                                  <span className="text-[7.5px] text-pink-400 uppercase font-extrabold block">Customer</span>
                                  <p className="font-extrabold text-white text-[11px] truncate leading-tight mt-0.5">{order.customerName || 'N/A'}</p>
                                  <p className="text-[9px] font-mono text-slate-400 leading-none mt-1">{order.customerPhone || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850/50">
                                  <span className="text-[7.5px] text-indigo-400 uppercase font-extrabold block">Recipient</span>
                                  <p className="font-extrabold text-white text-[11px] truncate leading-tight mt-0.5">{order.recipientName || 'N/A'}</p>
                                  <p className="text-[9px] font-mono text-slate-400 leading-none mt-1">{order.recipientPhone || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-400 leading-tight mt-1">{order.streetAddress}</p>
                            {order.landmark && (
                              <p className="text-[10px] text-pink-400 font-bold leading-none mt-1">📍 Landmark: {order.landmark}</p>
                            )}
                          </div>
                        </div>

                        {order.deliveryTimeSlot && (
                          <div className="flex gap-1.5 items-center bg-slate-950/50 p-2 rounded-xl border border-slate-850 max-w-max">
                            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="text-[9.5px] font-extrabold text-indigo-300">
                              🕒 Slate Slot: {order.deliveryTimeSlot}
                            </span>
                          </div>
                        )}

                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="flex gap-1.5 items-start bg-slate-950/40 p-2 rounded-2xl border border-slate-850/60 mt-1">
                            <span className="text-xs shrink-0 mt-0.5">🍰</span>
                            <div className="w-full">
                              <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-widest block font-mono">Items to Deliver</span>
                              <div className="space-y-1 text-slate-300 font-bold text-[11px] mt-0.5 w-full">
                                {order.items.map((it: any, idx: number) => (
                                  <div key={idx} className="flex flex-col border-b border-slate-800/30 pb-1 last:border-0 last:pb-0">
                                    <div className="flex gap-1">
                                      <span>🍰 {it.name}</span>
                                      <span className="text-pink-400 font-mono text-[10px]">x{it.quantity}</span>
                                    </div>
                                    {it.options && (
                                      <p className="text-[9px] font-medium text-slate-450 leading-tight pl-4 italic">({it.options})</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Touch-Friendly Navigation & Communication Hot links */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-850/60 pb-1">
                        <a
                          href={`tel:${order.recipientPhone || order.customerPhone || '6297337735'}`}
                          className="bg-slate-950 hover:bg-slate-850 border border-slate-800/80 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold text-slate-300 transition-all active:scale-95 cursor-pointer min-h-[38px]"
                        >
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" /> Call
                        </a>
                        <a
                          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${order.recipientName || order.customerName || 'Customer'}, I am your Rocx Cakes delivery rider. I am calling to confirm your location for dispatch. Please keep your 4-digit security code ready!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-950 hover:bg-slate-850 border border-slate-800/80 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold text-slate-300 transition-all active:scale-95 cursor-pointer min-h-[38px]"
                          referrerPolicy="no-referrer"
                        >
                          <span className="text-xs leading-none">💬</span> Chat
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.streetAddress || ''} ${order.landmark || ''} Kharagpur West Bengal`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-950 hover:bg-slate-850 border border-slate-800/80 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[9.5px] font-extrabold text-slate-300 transition-all active:scale-95 cursor-pointer min-h-[38px]"
                          referrerPolicy="no-referrer"
                        >
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> Map GPS
                        </a>
                      </div>

                      <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-2">
                        <div className="text-xs flex flex-col gap-0.5">
                          <div>
                            <span className="text-[7px] text-slate-500 uppercase font-black font-mono inline-block mr-1">Total:</span>
                            <span className="text-white font-black font-mono text-xs">₹{order.total}</span>
                          </div>
                          <div>
                            <span className="text-[7px] text-slate-500 uppercase font-black font-mono inline-block mr-1">Rider Fee:</span>
                            <span className="text-pink-400 font-neutral-black font-black font-mono text-[10px]">₹{order.deliveryFee !== undefined ? order.deliveryFee : 100}</span>
                          </div>
                        </div>

                        {order.status === 'Delivered' ? (
                          <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-extrabold text-[9.5px] uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                            ✅ Delivered & Settled
                          </div>
                        ) : order.deliveryAgentPicked ? (
                          <button
                            onClick={() => {
                              setPickedOrderId(order.id);
                              localStorage.setItem('rocx_delivery_picked_order_id', order.id);
                            }}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-[0.95] text-slate-950 font-black text-[9.5px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1 cursor-pointer shadow-md shadow-orange-500/10 font-sans"
                          >
                            Deliver & Manage Run <ArrowRight className="w-3 h-3 text-slate-950 shrink-0" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePickOrder(order.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.95] text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/5 hover:shadow-emerald-500/20 font-sans"
                          >
                            Pick Order <ArrowRight className="w-3 h-3 text-slate-950" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )) : (
              <div className="space-y-4 text-left">
                {audits.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
                    <span className="text-3xl select-none">📭</span>
                    <h4 className="text-xs font-black text-slate-350 uppercase tracking-wider font-sans">No Audited Runs Found</h4>
                    <p className="text-[10px] text-slate-500 font-extrabold max-w-xs mx-auto uppercase leading-relaxed tracking-wider">
                      Completed orders will appear here as soon as they are scanned or bypassed with an audit ledger stamp.
                    </p>
                  </div>
                ) : (
                  audits.map((audit) => (
                    <div 
                      key={audit.id} 
                      className="bg-slate-900 border border-slate-850 p-4 rounded-3xl flex flex-col gap-3 shadow-md border-t-4 border-t-indigo-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-xs font-black text-white font-mono tracking-wider">{audit.orderId}</strong>
                          <div className="text-[9.5px] font-semibold text-slate-500 mt-1 leading-none">
                            Settled: {audit.deliveredAt || audit.date}
                          </div>
                        </div>
                        <span className="text-[9.5px] bg-emerald-950 border border-emerald-500/20 text-emerald-400 font-black px-2 py-0.5 rounded-xl uppercase leading-none font-mono">
                          ✅ Audit Logged
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs py-2 border-y border-slate-850/60 font-semibold">
                        <div className="flex gap-1.5 items-start">
                          <MapPin className="w-3.5 h-3.5 text-pink-500 mt-0.5 shrink-0" />
                          <div className="text-slate-300 leading-relaxed w-full space-y-1.5">
                            <div>
                              <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-wider block font-mono">Consignee & Order Contact</span>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850/50">
                                  <span className="text-[7.5px] text-pink-400 uppercase font-extrabold block">Customer</span>
                                  <p className="font-extrabold text-white text-[11px] truncate mt-0.5">{audit.customerName || 'N/A'}</p>
                                  <p className="text-[9px] font-mono text-slate-400 leading-none mt-0.5">{audit.customerPhone || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-850/50">
                                  <span className="text-[7.5px] text-indigo-400 uppercase font-extrabold block">Recipient</span>
                                  <p className="font-extrabold text-white text-[11px] truncate mt-0.5">{audit.recipientName || 'N/A'}</p>
                                  <p className="text-[9px] font-mono text-slate-400 leading-none mt-0.5">{audit.recipientPhone || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-slate-450 mt-1">{audit.streetAddress}</p>
                            {audit.landmark && (
                              <p className="text-[9.5px] text-amber-500 font-bold mt-1">📍 Landmark: {audit.landmark}</p>
                            )}
                          </div>
                        </div>

                        {Array.isArray(audit.items) && audit.items.length > 0 && (
                          <div className="flex gap-1.5 items-start">
                            <span className="text-xs shrink-0 mt-0.5">🍰</span>
                            <div>
                              <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-widest block font-mono">Consignment Items</span>
                              <div className="space-y-0.5 text-slate-305 font-bold text-[11px] mt-0.5">
                                {audit.items.map((it: any, idx: number) => (
                                  <div key={idx} className="flex gap-1">
                                    <span>🍰 {it.name}</span>
                                    <span className="text-pink-400 font-mono text-[10px]">x{it.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl text-[10px]">
                        <span className="text-[7.5px] text-indigo-400 uppercase font-black tracking-widest block font-mono mb-1">Handover Clearance Trace</span>
                        <p className="font-semibold text-slate-400 font-sans">Gate Mode: <span className="text-white font-black">{audit.verificationMode}</span></p>
                        {audit.verificationMode === 'Manual Bypass' && audit.bypassDetails && (
                          <div className="pl-2 border-l border-indigo-500/20 mt-1 space-y-0.5 text-slate-400">
                            <p>Relation: <span className="text-slate-200 font-bold">{audit.bypassDetails.relation}</span></p>
                            {audit.bypassDetails.customRelation && (
                              <p>Custom: <span className="text-slate-200 font-bold">{audit.bypassDetails.customRelation}</span></p>
                            )}
                            <p>Client Name: <span className="text-slate-250 font-bold">{audit.bypassDetails.recipientName}</span></p>
                            <p>Client Phone: <span className="text-slate-250 font-mono">{audit.bypassDetails.recipientPhone}</span></p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-[7px] text-slate-500 uppercase font-black font-mono block leading-none">Total Payment</span>
                          <span className="text-white font-black font-mono text-xs">₹{audit.total}</span>
                        </div>
                        <span className="text-[9.5px] bg-slate-950 border border-slate-800 text-pink-400 font-mono px-2.5 py-1 rounded-xl font-black">
                          Rider Fee: ₹{audit.deliveryFee !== undefined ? audit.deliveryFee : 100}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
