import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GENERATED_IMAGES } from '../data';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80',
    title: 'EXCLUSIVE COLLECTION',
    subtitle: 'Perfect Gifts for Every Celebration',
    buttonText: 'Order Now',
    accentColor: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    title: 'FRESHLY BAKED DAILY',
    subtitle: 'Delicious Designer Cakes',
    buttonText: 'Explore Cakes',
    accentColor: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    title: 'HANDPICKED FRESH FLOWERS',
    subtitle: 'Express Bouquets & Blooms',
    buttonText: 'Send Flowers',
    accentColor: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    title: 'CRAFTED WITH PRECISION',
    subtitle: 'Unique Personalized Gifts',
    buttonText: 'Customize Now',
    accentColor: 'bg-pink-600 hover:bg-pink-700 text-white',
  },
];

interface PromoSliderProps {
  onCtaClick: () => void;
}

export default function PromoSlider({ onCtaClick }: PromoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="relative h-[140px] sm:h-[180px] md:h-[220px] rounded-2.5xl overflow-hidden shadow-md bg-rose-50 border border-slate-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 120 }}
            transition={{ type: "spring", stiffness: 110, damping: 20 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <img
              src={SLIDES[currentIndex].image}
              alt={SLIDES[currentIndex].subtitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Gradient Overlay for professional reading contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent md:from-black/70" />

            {/* Content Overlay */}
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-5 sm:px-8 md:px-12 max-w-[220px] sm:max-w-md md:max-w-xl z-10">
              <span className="text-pink-300 text-[9px] sm:text-xs md:text-sm font-black tracking-widest uppercase mb-0.5 md:mb-1">
                {SLIDES[currentIndex].title}
              </span>
              <h2 className="text-sm sm:text-2xl md:text-3xl font-black text-white leading-tight mb-2 md:mb-4 drop-shadow-sm">
                {SLIDES[currentIndex].subtitle}
              </h2>
              
              <button
                id={`slider-cta-btn-${SLIDES[currentIndex].id}`}
                onClick={onCtaClick}
                className={`py-1 px-3.5 sm:py-1.5 sm:px-5 md:py-2.5 md:px-6 rounded-lg sm:rounded-xl text-[9px] sm:text-xs md:text-sm font-black tracking-wide w-fit transition-all duration-300 hover:scale-105 active:scale-95 shadow-md cursor-pointer ${SLIDES[currentIndex].accentColor}`}
              >
                {SLIDES[currentIndex].buttonText}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel indicator dots modeled exactly like the screenshot */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {SLIDES.map((_, index) => (
            <button
              id={`slider-indicator-dot-${index}`}
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? 'w-6 bg-red-500' : 'w-2 bg-slate-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
