import { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Circle, Clock, Gift, MapPin, Star } from 'lucide-react';

interface TrackOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allOrders: any[];
  initialOrderId?: string;
}

export default function TrackOrderDrawer({ isOpen, onClose, allOrders, initialOrderId }: TrackOrderDrawerProps) {
  const [orderId, setOrderId] = useState(() => {
    return initialOrderId || localStorage.getItem('rocx_last_placed_id') || '';
  });
  const [tracked, setTracked] = useState(() => {
    return !!(initialOrderId || localStorage.getItem('rocx_last_placed_id'));
  });
  const [deviceOrderIds, setDeviceOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('rocx_device_order_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const lastPlaced = localStorage.getItem('rocx_last_placed_id');
    return lastPlaced ? [lastPlaced] : [];
  });

  // Synchronously update tracked order ID and device-specific orders whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('rocx_device_order_ids');
      let ids: string[] = [];
      if (saved) {
        try {
          ids = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      const lastPlaced = localStorage.getItem('rocx_last_placed_id');
      if (lastPlaced && !ids.includes(lastPlaced)) {
        ids.push(lastPlaced);
        try {
          localStorage.setItem('rocx_device_order_ids', JSON.stringify(ids));
        } catch (e) {
          console.error(e);
        }
      }
      setDeviceOrderIds(ids);

      const storedLastOrderId = initialOrderId || lastPlaced || '';
      if (storedLastOrderId) {
        setOrderId(storedLastOrderId);
        setTracked(true);
      }
    }
  }, [isOpen, initialOrderId]);

  // Search in database securely with trimmed, case-insensitive logic
  const searchVal = orderId?.trim()?.toLowerCase();
  const matchedOrder = searchVal ? allOrders.find((o) => {
    const oId = o?.id?.trim()?.toLowerCase();
    const oRecip = o?.recipientPhone?.trim();
    const oCust = o?.customerPhone?.trim();
    return (oId && oId === searchVal) ||
           (oRecip && oRecip === orderId.trim()) ||
           (oCust && oCust === orderId.trim());
  }) : undefined;

  // Automatically trigger background email notification if it hasn't been successfully dispatched yet
  useEffect(() => {
    if (matchedOrder && matchedOrder.id) {
      const orderIdKey = `rocx_email_sent_for_${matchedOrder.id}`;
      const isAlreadySent = localStorage.getItem(orderIdKey) === 'true';

      if (!isAlreadySent) {
        console.log(`[TrackOrderDrawer] Automatically triggering background email dispatch for order ${matchedOrder.id}...`);
        
        // Optimistically set the flag to 'true' to prevent multiple duplicate parallel requests
        localStorage.setItem(orderIdKey, 'true');

        import('../services/notificationService')
          .then(({ sendOrderEmailNotification }) => {
            sendOrderEmailNotification(matchedOrder)
              .then((res) => {
                if (res.success) {
                  console.log(`[TrackOrderDrawer] Dynamic background email notification sent successfully for ${matchedOrder.id}`);
                } else {
                  console.warn(`[TrackOrderDrawer] Background email dispatch returned failure for ${matchedOrder.id}:`, res.error);
                  setTimeout(() => {
                    localStorage.removeItem(orderIdKey);
                  }, 15000);
                }
              })
              .catch((err) => {
                console.error(`[TrackOrderDrawer] Background email dispatch exception for ${matchedOrder.id}:`, err);
                setTimeout(() => {
                  localStorage.removeItem(orderIdKey);
                }, 15000);
              });
          })
          .catch((err) => {
            console.error("Failed to load notificationService dynamically inside TrackOrderDrawer:", err);
            localStorage.removeItem(orderIdKey);
          });
      }
    }
  }, [matchedOrder]);

  if (!isOpen) return null;

  const deviceOrders = allOrders.filter((o) => deviceOrderIds.includes(o.id));

  const statusHierarchy = [
    'Waiting For Approval From Admin',
    'Order Confirmed',
    'Ready To Shift',
    'Out For Delivery Get Delivery Notification Through Whatsapp or Phone Number',
    'Rider is Nearby',
    'Delivered',
    'Cancelled Due to InAppropriate Reasons'
  ];

  const currentStatusIndex = matchedOrder ? Math.max(0, statusHierarchy.indexOf(matchedOrder.status)) : 0;

  // Standard step statuses dynamically computed
  const steps = [
    { title: 'Waiting For Approval From Admin', desc: 'Secure database verification pending from admin' },
    { title: 'Order Confirmed', desc: 'Rocx system received purchase parameters' },
    { title: 'Ready To Shift', desc: 'Order is packed and ready to be shipped out' },
    { title: 'Out For Delivery Get Delivery Notification Through Whatsapp or Phone Number', desc: 'Assigned to fast-transit logistics partner' },
    { title: 'Rider is Nearby', desc: 'Fast-transit rider has arrived near your location surroundings' },
    { title: 'Delivered', desc: 'Shared joyful delivery courier confirmation receipt' },
    { title: 'Cancelled Due to InAppropriate Reasons', desc: 'Order cancelled by administration' },
  ].map((step, idx) => {
    let status: 'done' | 'current' | 'pending' = 'pending';
    if (idx < currentStatusIndex) status = 'done';
    else if (idx === currentStatusIndex) status = 'current';
    return { ...step, status };
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-left">
                <Search className="w-5 h-5 text-emerald-500" />
                Track Celebration Order
              </h2>
              <button
                id="close-track-btn"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 p-1 bg-white hover:bg-slate-100 border border-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              
              {/* Order input bar */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Enter Your Order ID</span>
                <div className="flex gap-2">
                  <input
                    id="track-order-input"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="E.g. ROCX-109822 or ROCX-78322"
                    className="flex-1 text-xs font-black p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tracking-wider"
                  />
                  <button
                    id="track-order-submit-btn"
                    onClick={() => {
                      if (orderId.trim()) setTracked(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-5 rounded-xl cursor-pointer"
                  >
                    Track
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">Order IDs are printed on purchase receipts or SMS notifications.</span>
              </div>

              {/* Status Timeline rendering */}
              {matchedOrder ? (
                <div className="space-y-5 animate-fade-in text-left">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Tracking ID</span>
                        <strong className="text-sm font-black text-emerald-950 font-mono">{matchedOrder.id}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-emerald-600 font-black uppercase block tracking-wider">Status Ready</span>
                        <span className="text-xs font-extrabold text-slate-850 px-2 py-0.5 rounded-md bg-white border border-emerald-200">
                          {matchedOrder.status === 'Order Registered' ? 'Waiting For Approval From Admin' : matchedOrder.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Customer notification notice or Rate/Review section */}
                    {matchedOrder.status === 'Delivered' ? (
                      <div className="bg-gradient-to-r from-amber-500/10 to-pink-500/10 border-2 border-dashed border-amber-300 p-4 rounded-xl text-[10.5px] text-slate-900 font-semibold leading-relaxed flex flex-col gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                          <span className="text-xs font-black text-amber-900 uppercase tracking-wide">Help Us Improve rocxcakes!</span>
                        </div>
                        <p className="text-[10.5px] text-slate-800 leading-relaxed font-bold">
                          🎉 Your order has been delivered successfully! If you enjoyed our custom fresh bakes, please take a moment to drop a lovely review on Google.
                        </p>
                        <a
                          href="https://g.page/r/CXhLveRLwq1SEBE/review"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-white font-black text-center text-xs py-2.5 px-4 rounded-xl tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer uppercase border border-amber-400/30"
                        >
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          Add Review
                        </a>
                      </div>
                    ) : null}
                  </div>

                  {(matchedOrder.deliveryDate || matchedOrder.deliveryTimeSlot) && (
                    <div className="bg-pink-50/40 border border-pink-100 p-3.5 rounded-2xl flex flex-wrap gap-x-4 gap-y-2 text-xs">
                      {matchedOrder.deliveryDate && (
                        <div>
                          <span className="text-[9px] text-pink-500 font-bold uppercase block tracking-wider">Scheduled Date</span>
                          <span className="font-extrabold text-slate-800">📅 {matchedOrder.deliveryDate}</span>
                        </div>
                      )}
                      {matchedOrder.deliveryTimeSlot && (
                        <div>
                          <span className="text-[9px] text-violet-500 font-bold uppercase block tracking-wider">Delivery Option Slot</span>
                          <span className="font-extrabold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">🕒 {matchedOrder.deliveryTimeSlot}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order-specific Delivery Verification Notice */}
                  {matchedOrder.status !== 'Delivered' && matchedOrder.status !== 'Cancelled Due to InAppropriate Reasons' && (
                    <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] text-sky-600 font-black uppercase tracking-wider block">🔑 Delivery Verification OTP</span>
                        <p className="text-[10px] text-sky-950 font-semibold leading-relaxed">
                          For security, an OTP will be sent to your registered WhatsApp/Phone number when the rider is nearby. Provide this to the rider only after receiving your package.
                        </p>
                      </div>
                      <div className="text-2xl select-none bg-sky-100/50 p-2.5 rounded-xl border border-sky-100 shrink-0">
                        🎁
                      </div>
                    </div>
                  )}

                  {/* Vertically stacked progress steps */}
                  <div className="relative pl-6 space-y-6">
                    {/* Visual left-border timeline line */}
                    <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-100" />

                    {steps.map((s, idx) => {
                      const isDone = s.status === 'done';
                      const isCurrent = s.status === 'current';
                      return (
                        <div key={idx} className="relative flex gap-3 text-left">
                          {/* Dot indicator matching the status */}
                          <div className="absolute -left-[22px] top-0.5 bg-white rounded-full">
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                            ) : isCurrent ? (
                              s.title === 'Waiting For Approval From Admin' ? (
                                <Clock className="w-5 h-5 text-slate-800 bg-slate-100 rounded-full p-0.5 border border-slate-300" />
                              ) : (
                                <Clock className="w-5 h-5 text-red-600 bg-red-50 rounded-full p-0.5 border border-red-200 animate-spin" />
                              )
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 bg-white" />
                            )}
                          </div>

                          <div className="pl-3">
                            <h5 className={`text-xs font-black ${isDone ? 'text-slate-800' : isCurrent ? (s.title === 'Waiting For Approval From Admin' ? 'text-slate-900' : 'text-red-600') : 'text-slate-400'}`}>
                              {s.title}
                            </h5>
                            <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">{s.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary of purchased item details along with custom photo thumbnails */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2.5xl space-y-2.5 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">Itemized Summary</span>
                    <div className="space-y-3">
                       {matchedOrder.items?.map((it: any, i: number) => {
                         const mainImage = it.productImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80';
                         return (
                           <div key={i} className="flex gap-3 items-start justify-between border-b last:border-0 border-slate-100 pb-3 last:pb-0">
                             <div className="flex gap-3 items-start w-full">
                               <div className="relative group shrink-0">
                                 <img
                                   src={mainImage}
                                   alt={it.name}
                                   className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white shadow-xs hover:scale-105 transition-all duration-200"
                                   onError={(e) => {
                                     (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80';
                                   }}
                                 />
                               </div>
                               <div className="flex-1">
                                 <strong className="text-slate-800 font-extrabold text-[12px] block leading-tight">{it.name}</strong>
                                 <span className="text-slate-500 font-bold block text-[10.5px] mt-0.5">Quantity: <span className="text-pink-600 font-black">{it.quantity}x</span></span>
                                 {it.options && <p className="text-[9.5px] text-slate-400 font-mono mt-1 max-w-full bg-white border border-slate-100 py-0.5 px-1.5 rounded leading-tight">({it.options})</p>}
                                 
                                 {it.photoUrl && (
                                   <div style={{ contentVisibility: 'auto' }} className="mt-2.5 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-2 max-w-[240px] text-left">
                                     <span className="text-[9px] text-emerald-800 font-black block uppercase tracking-wider mb-1">📸 Uploaded Customer Photo</span>
                                     <div className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-200 bg-white">
                                       <img
                                         src={it.photoUrl}
                                         alt="Attached User Custom Visual"
                                         className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                         onError={(e) => {
                                           (e.target as HTMLImageElement).style.display = 'none';
                                         }}
                                       />
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>

                  {(!matchedOrder.paymentStatus || matchedOrder.paymentStatus === 'pending') && (matchedOrder.status === 'Waiting For Approval From Admin' || matchedOrder.status === 'Order Registered') && (
                    <div className="mt-8 bg-indigo-50 border border-indigo-100 p-5 rounded-2.5xl flex flex-col items-center justify-center gap-3 animate-fade-in text-center">
                      <h4 className="text-sm font-black text-indigo-950 uppercase tracking-wide">Advance Payment Pending</h4>
                      <p className="text-[10.5px] text-indigo-800 font-medium max-w-[250px] leading-relaxed">
                        Secure your delivery schedule by completing the advance payment using the dynamic QR code below.
                      </p>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 mt-2">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=Q838753599@ybl&pn=ROCX Cakes&am=${matchedOrder.total}&cu=INR`)}`} 
                          alt="Pay Now QR" 
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      <span className="text-lg font-black text-indigo-900 mt-1 block">Pay ₹{matchedOrder.total}</span>
                      
                      {/* Deep Pay buttons for Instant Mobile UPI payments */}
                      <div className="w-full space-y-2 mt-2">
                        <a
                          href={`upi://pay?pa=Q838753599@ybl&pn=ROCX%20Cakes&am=${matchedOrder.total}&cu=INR`}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10.5px] tracking-wider py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          ⚡ Pay via Any UPI App
                        </a>
                        
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase">
                          <a
                            href={`upi://pay?pa=Q838753599@ybl&pn=ROCX%20Cakes&am=${matchedOrder.total}&cu=INR`}
                            className="bg-[#5f259f] text-white py-2.5 px-3 rounded-lg flex items-center justify-center gap-1 hover:brightness-110 transition-all shadow-2xs"
                          >
                            💜 PhonePe Pay
                          </a>
                          <a
                            href={`upi://pay?pa=Q838753599@ybl&pn=ROCX%20Cakes&am=${matchedOrder.total}&cu=INR`}
                            className="bg-white text-slate-800 border border-slate-200 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-50 transition-all shadow-2xs font-sans"
                          >
                            <span className="text-[#00baf2] font-black">pay</span><span className="text-[#002f6c] font-black">tm</span>
                          </a>
                        </div>
                        <p className="text-[8px] text-indigo-500 font-black italic">Desktop users: Scan the QR above with GPay/PhonePe to complete order. Mobile users: Tap any button above to direct load banking apps.</p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (tracked && !matchedOrder) ? (
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2.5xl space-y-2.5 text-left animate-fade-in">
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-tight">Order Identifier Not Found</h4>
                  <p className="text-[10.5px] text-amber-950 font-medium leading-relaxed">
                    No active transaction matches <strong className="font-mono">{orderId}</strong> during this session.
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    🔍 Try placing an order first, copying its generated ID from the success screen, and searching it here. We will dynamically change steps!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="py-8 text-center border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 bg-slate-50/50">
                    <div className="bg-white p-3 rounded-full text-slate-300 shadow-2xs">
                      <Gift className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs text-center">No order tracked yet</h5>
                      <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-0.5 leading-normal">
                        Type your active reservation identifier above or select an order below to preview cooking & dispatch progress in real time.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show list of device orders for quick selection */}
              {deviceOrders && deviceOrders.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    📋 Recent Device Orders ({deviceOrders.length})
                  </h4>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {deviceOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setOrderId(o.id);
                          setTracked(true);
                          localStorage.setItem('rocx_last_placed_id', o.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                          searchVal === o.id.toLowerCase()
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                            : 'border-slate-150 hover:bg-slate-50 hover:border-slate-350'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-black text-slate-900">#{o.id}</span>
                            <span className="text-[8px] font-black uppercase bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full border border-pink-200">
                              {o.status === 'Order Registered' ? 'Waiting For Approval From Admin' : o.status}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 block">{o.date}</span>
                        </div>
                        <div className="text-right">
                          <strong className="text-xs font-black text-slate-900 block">₹{o.total}</strong>
                          <span className="text-[9.5px] font-bold text-emerald-600 flex items-center justify-end mt-1">
                            Track Now →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Quick Track Hints */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-left text-xs text-slate-400 space-y-1.5 font-medium">
              <p>🎁 Receiver details are kept confidential. Live location sharing initiates upon dispatch.</p>
              <p>☎ For direct driver contact, open the customer care support tab at page footer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
