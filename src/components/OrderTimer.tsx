import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function OrderTimer() {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateTimer = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Open from 12 AM (0) to 8 PM (20)
      const isOpenNow = currentHour >= 0 && currentHour < 20;
      setIsOpen(isOpenNow);

      const targetHour = isOpenNow ? 20 : 24; // 20:00 today or 00:00 tomorrow
      
      const targetDate = new Date(now);
      targetDate.setHours(targetHour, 0, 0, 0);
      
      const diffMs = targetDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
         setTimeLeft("00h 00m 00s");
         return;
      }

      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`mt-6 mb-2 border rounded-2xl p-5 flex flex-col items-center justify-center gap-2 shadow-sm transition-colors ${isOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
      <div className="flex items-center gap-2">
         <Clock className={`w-5 h-5 ${isOpen ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
         <h4 className={`text-sm md:text-base font-black uppercase tracking-wider ${isOpen ? 'text-emerald-800' : 'text-rose-800'}`}>
            {isOpen ? 'Order Window Closes In' : 'Order Window Opens In'}
         </h4>
      </div>
      <div className={`text-3xl md:text-4xl font-black tabular-nums tracking-tight ${isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
        {timeLeft}
      </div>
      <p className={`text-xs sm:text-sm font-bold text-center mt-1 ${isOpen ? 'text-emerald-700/70' : 'text-rose-700/70'}`}>
        We accept orders from 12:00 AM to 8:00 PM Daily
      </p>
    </div>
  );
}
