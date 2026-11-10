import React from 'react';
import { isStoreOpenNow } from '../services/storeSettings';
import { Clock } from 'lucide-react';

export default function StoreClosedBanner() {
  const storeCheck = isStoreOpenNow();
  if (storeCheck.isOpen) return null;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-rose-950 to-slate-950 py-4 px-4 text-white shadow-md border-b border-rose-500/30 relative z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl shadow-md uppercase tracking-wider rotate-[-2deg] border border-white/20 shrink-0">
            Be right BACK!
          </div>
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-amber-100 leading-snug">
              Lots of orders, bakers are busy, ROCX Cakes & Gifts will be back soon, don't you worry :)
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5 text-[10px] text-rose-300 font-bold">
              <Clock className="w-3 h-3" />
              <span>Active Ordering Hours: 12:00 AM to 8:00 PM</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-extrabold text-amber-200">
          🔒 Store Paused
        </div>
      </div>
    </div>
  );
}
