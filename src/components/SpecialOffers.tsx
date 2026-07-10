import { Gift, Zap, Percent, Star, ChevronRight, User } from 'lucide-react';
import { Product } from '../types';

interface SpecialOffersProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onApplyPromoCode?: (code: string) => void;
}

export default function SpecialOffers({ products, onSelectProduct, onApplyPromoCode }: SpecialOffersProps) {
  // Get all Father's Day products
  const fathersDayProducts = products.filter((p) => p.category === 'fathers_day');

  const offers = [
    {
      code: 'ROCXFIRST',
      title: 'Flat 10% Off',
      desc: 'Save 10% instantly on all gourmet bakes & premium flower bouquets.',
      bg: 'from-pink-500 to-rose-600',
    },
    {
      code: 'BESTDAD',
      title: 'Father\'s Day Special (15% Off)',
      desc: 'Enjoy extra 15% discount on all Father\'s Day items above ₹999.',
      bg: 'from-blue-600 to-indigo-700',
    },
    {
      code: 'FREEDEL',
      title: 'Midnight Surprise Free',
      desc: 'Midnight Delivery free on select cakes & premium hampers above ₹1200.',
      bg: 'from-amber-500 to-orange-600',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-8 text-left">
      
      {/* 🎟️ ACTIVE OFFERS SLIDER ROW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-pink-600 animate-pulse" />
            Active Gifting Offers & Promo Codes
          </h3>
          <span className="text-[10px] text-pink-600 font-extrabold tracking-wider uppercase">Swipe Left</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 snap-x no-scrollbar">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className={`flex-shrink-0 w-[290px] sm:w-[320px] bg-gradient-to-r ${offer.bg} text-white p-4.5 rounded-2xl shadow-sm snap-start relative overflow-hidden flex flex-col justify-between`}
            >
              {/* Abs decoration circles */}
              <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-28 h-28 bg-white/10 rounded-full" />
              
              <div className="space-y-1 z-10">
                <span className="bg-white/20 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest w-fit block">
                  Promo Code: {offer.code}
                </span>
                <h4 className="text-sm font-black tracking-tight">{offer.title}</h4>
                <p className="text-[10px] text-white/80 leading-snug">{offer.desc}</p>
              </div>

              <div className="mt-4 flex items-center justify-between z-10 border-t border-white/10 pt-2.5">
                <span className="text-[9px] font-bold text-white/70">Tap code to copy</span>
                <button
                  id={`copy-code-${offer.code}`}
                  onClick={() => {
                    navigator.clipboard.writeText(offer.code);
                    alert(`Copied code "${offer.code}" to clipboard!`);
                    if (onApplyPromoCode) onApplyPromoCode(offer.code);
                  }}
                  className="bg-white text-slate-900 hover:bg-slate-100 text-[10px] font-black uppercase py-1 px-3.5 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  Copy & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎂 FATHER'S DAY CAKES & COMBOS CAROUSEL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              Live Celebration Event
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5 mt-1">
              <Gift className="w-5 h-5 text-indigo-600 animate-bounce" />
              FATHER'S DAY HIGHLIGHTS
            </h3>
          </div>
          <span className="text-[10px] font-extrabold text-indigo-600 flex items-center gap-0.5">
            View All <ChevronRight className="w-4 h-4" />
          </span>
        </div>

        {/* Scroll cards container */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
          {fathersDayProducts.map((p) => (
            <div
              id={`fathers-day-item-${p.id}`}
              key={p.id}
              className="flex-shrink-0 w-[210px] sm:w-[245px] bg-white border border-slate-100 rounded-2.5xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 snap-start text-left flex flex-col justify-between"
            >
              {/* Product Visual wrapper */}
              <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                <span className="absolute top-2.5 left-2.5 z-10 bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                  Father's Day Special
                </span>
                
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                />

                {/* Rating overlay */}
                <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] text-white font-extrabold">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {p.rating}
                </div>
              </div>

              {/* Product specifications and pricing details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 line-clamp-2 leading-snug">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Prices */}
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                    {p.originalPrice && (
                      <span className="text-[10px] text-slate-400 font-bold line-through">
                        ₹{p.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    id={`fathers-day-btn-${p.id}`}
                    onClick={() => onSelectProduct(p)}
                    className="w-full py-1.5 bg-indigo-900 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all hover:scale-102 active:scale-98 shadow-sm cursor-pointer text-center"
                  >
                    Personalise & Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
