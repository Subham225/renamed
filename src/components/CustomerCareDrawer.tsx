import { X, PhoneCall, Mail, MessageCircle, MapPin } from 'lucide-react';

interface CustomerCareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerCareDrawer({ isOpen, onClose }: CustomerCareDrawerProps) {
  if (!isOpen) return null;

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
                <PhoneCall className="w-5 h-5 text-blue-500" />
                Rocx Help Representative
              </h2>
              <button
                id="close-customer-btn"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 p-1 bg-white hover:bg-slate-100 border border-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              
              {/* Owner Info Block */}
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5 text-center shadow-sm">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-sm mb-3">
                  <span className="text-2xl font-black">R</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Rajibul Ali Khan</h3>
                <p className="text-xs font-bold text-pink-600 tracking-wider uppercase mt-1">Founder & Owner</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">Always at your service to ensure a delightful experience.</p>
              </div>
              
              {/* Helplines widget */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                  Quick Connect Help Desks
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {/* WhatsApp Support */}
                  <a
                    id="connect-whatsapp"
                    href="https://wa.me/916297337735"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100/75 border border-emerald-100 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500 text-white p-2.5 rounded-xl">
                        <MessageCircle className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-emerald-950 block">WhatsApp Cooking Helpline</span>
                        <span className="text-[10px] text-emerald-600 block">Available 24/7</span>
                      </div>
                    </div>
                  </a>

                  {/* Hot Phone Call */}
                  <a
                    id="connect-phone"
                    href="tel:+916297337735"
                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100/75 border border-blue-100 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 text-white p-2.5 rounded-xl">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-blue-950 block">Support Direct Line</span>
                        <span className="text-[10px] text-blue-600 block">Rajibul Ali Khan: +91 6297337735 (9 AM - 11:30 PM)</span>
                      </div>
                    </div>
                  </a>

                  {/* Mail Help desk */}
                  <a
                    id="connect-email"
                    href="mailto:rocxcakes@gmail.com"
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/75 border border-slate-200/50 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-800 text-white p-2.5 rounded-xl">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Enterprise Mail Center</span>
                        <span className="text-[10px] text-slate-500 block">rocxcakes@gmail.com for custom billing</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Physical Address Section */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                  ROCX Cakes & Gifts
                </span>
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex gap-3 text-left">
                  <div className="bg-slate-900 text-white p-2.5 rounded-xl shrink-0 h-fit">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase">Kharagpur Express Delivery Hub</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-bold mt-1">
                      Cake Varieties, Custom Types of Cakes,<br />
                      Bouquets & Flowers, 2-Hours Express Delivery
                    </p>
                    <span className="inline-block mt-2 text-[9px] font-black text-pink-600 uppercase bg-pink-50 border border-pink-100 py-0.5 px-2 rounded-lg">
                      📍 Kharagpur & Midnapore Covered
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Support guarantee footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-left text-[11px] text-slate-400 font-medium">
              🛡 All customer communication is monitored by certified quality assurance supervisors to guarantee standard compliance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
