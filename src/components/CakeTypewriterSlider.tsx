import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Slide } from '../types';

interface CakeTypewriterSliderProps {
  slides?: Slide[];
}

const CAKE_SLIDES_FALLBACK = [
  {
    id: 'slide_1',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    title: 'Perfect Gifts for Every Birthday',
    badge: 'Signature Collection',
    subtitle: 'Bespoke strawberry chocolate layers baked fresh on delivery day.'
  },
  {
    id: 'slide_2',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    title: 'Celebrate Life with Exquisite Petals',
    badge: 'Fresh Daily',
    subtitle: 'Handcrafted premium floral arrangements delivered straight from the hub.'
  },
  {
    id: 'slide_3',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    title: 'Gilded Combos & Premium Bundles',
    badge: 'Curated Joys',
    subtitle: 'Sophisticated dynamic gifting packages designed to impress.'
  }
];

export default function CakeTypewriterSlider({ slides }: CakeTypewriterSliderProps) {
  const activeSlides = slides && slides.length > 0 ? slides : CAKE_SLIDES_FALLBACK;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto scroll slides every 4.5 seconds
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const handleCtaClick = () => {
    const catalogEl = document.getElementById('product-catalog-anchor');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to format string titles with matching aesthetic split-word highlights
  const renderTitle = (title: string, index: number) => {
    const colors = ['text-red-500', 'text-pink-500', 'text-amber-500', 'text-rose-500'];
    const colorClass = colors[index % colors.length];

    const words = title.split(' ');
    if (words.length > 2) {
      const highlightWords = words.slice(-2).join(' ');
      const mainTitle = words.slice(0, -2).join(' ');
      return (
        <span>
          {mainTitle} <br />
          <span className={`${colorClass} font-extrabold`}>{highlightWords}</span>
        </span>
      );
    }
    return <span>{title}</span>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto sm:px-4 mt-1 sm:mt-3 mb-3">
      <div className="relative h-[185px] xs:h-[220px] sm:h-[300px] md:h-[355px] lg:h-[400px] sm:rounded-3xl overflow-hidden shadow-md border-b sm:border border-slate-100 bg-slate-950 select-none">
        {activeSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full duration-1000 ease-in-out transition-opacity ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image element with safety referrerPolicy */}
              <img
                src={slide.image}
                alt="Banner Image"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80';
                }}
                className={`w-full h-full object-cover object-center ${
                  isActive ? 'scale-100 transition-transform duration-[4500ms] ease-out' : 'scale-105'
                }`}
              />
              
              {/* Soft vignette gradient for maximum image brightness and details */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent z-10" />

              {/* Float label */}
              {slide.badge && (
                <div className="absolute top-3 left-4 sm:top-4 sm:left-5 z-20 flex items-center gap-1.5 bg-rose-600 text-white font-black text-[8px] sm:text-[10px] tracking-widest uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md animate-pulse">
                  <Sparkles className="w-3 h-3 shrink-0 text-white" />
                  <span>{slide.badge}</span>
                </div>
              )}

              {/* Text elements - formatted beautifully with dark drop-shadows */}
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-5 sm:px-12 md:px-16 max-w-[240px] xs:max-w-xs sm:max-w-xl md:max-w-2xl text-left z-20">
                <h2 className="text-sm xs:text-base sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] uppercase">
                  {renderTitle(slide.title, index)}
                </h2>
                
                <p className="text-slate-100 text-[9px] xs:text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-3 font-bold max-w-[180px] sm:max-w-md line-clamp-2 md:line-clamp-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
                  {slide.subtitle}
                </p>

                <button
                  id={`slide-explore-btn-${slide.id}`}
                  onClick={handleCtaClick}
                  className="mt-3 sm:mt-5 w-fit bg-red-600 hover:bg-red-700 text-white font-extrabold hover:scale-105 active:scale-95 transition-all text-[8px] sm:text-xs uppercase tracking-widest py-1.5 px-3 sm:py-2.5 sm:px-6 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Slide navigation indicators */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-4 right-6 flex items-center gap-2 z-25">
            {activeSlides.map((_, index) => (
              <button
                id={`slide-dot-indicator-${index}`}
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex ? 'w-6 bg-red-500 shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
