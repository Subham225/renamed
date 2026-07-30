import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '../types';
import { subscribeToGalleryFromFirestore, DEFAULT_GALLERY } from '../services/dbService';

export default function CakeGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Load real-time Lookbook Gallery pictures from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToGalleryFromFirestore((loadedList) => {
      setItems(loadedList);
    });
    return () => unsubscribe();
  }, []);

  const galleryList = items.length > 0 ? items : DEFAULT_GALLERY;

  // Ensure we always have at least 8 elements for our precise 8-photo Bento layout
  const gridPics: string[] = [];
  for (let i = 0; i < 8; i++) {
    const item = galleryList[i % galleryList.length];
    gridPics.push(item ? item.image : '');
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev !== null ? (prev + 1) % gridPics.length : null));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev !== null ? (prev - 1 + gridPics.length) % gridPics.length : null));
      } else if (e.key === 'Escape') {
        setSelectedIdx(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, gridPics]);

  const handleNextSlide = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % gridPics.length);
  };

  const handlePrevSlide = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + gridPics.length) % gridPics.length);
  };

  return (
    <section className="w-full pt-0 pb-1 px-1 select-none max-w-7xl mx-auto mt-0 mb-3" id="rocx-curated-gallery">
      <div className="space-y-2.5 sm:space-y-3.5">
        
        {/* ROW 1: 2-COLUMN BIG FEATURED PICTURES (Equal width wide cards - now super compact height) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Card 1 */}
          <motion.div
            whileHover={{ scale: 1.012, y: -1 }}
            onClick={() => setSelectedIdx(0)}
            className="group rounded-2xl border border-slate-100 bg-white p-1.5 cursor-pointer transition-all duration-300 shadow-3xs hover:shadow-sm overflow-hidden flex items-center justify-center"
          >
            <div className="relative h-[125px] xs:h-[160px] sm:h-[195px] md:h-[230px] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100/50">
              <img
                src={gridPics[0]}
                alt="Lookbook 1"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-103 duration-500 transition-transform"
              />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ scale: 1.012, y: -1 }}
            onClick={() => setSelectedIdx(1)}
            className="group rounded-2xl border border-slate-100 bg-white p-1.5 cursor-pointer transition-all duration-300 shadow-3xs hover:shadow-sm overflow-hidden flex items-center justify-center"
          >
            <div className="relative h-[125px] xs:h-[160px] sm:h-[195px] md:h-[230px] w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100/50">
              <img
                src={gridPics[1]}
                alt="Lookbook 2"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-103 duration-500 transition-transform"
              />
            </div>
          </motion.div>
        </div>

        {/* ROW 2: 3-COLUMN MASONRY BENTO GRID FOR THE REMAINING 6 PICTURES (Tight sizes to fit single screen) */}
        <div>
          {/* DESKTOP/TABLET/LARGE SCREEN VIEW (sm and up to keep columns side-by-side) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Picture 3 - Tall (New Arrival style) */}
              <BentoImageCard imageUrl={gridPics[2]} size="tall" onClick={() => setSelectedIdx(2)} />
              {/* Picture 4 - Medium */}
              <BentoImageCard imageUrl={gridPics[3]} size="medium" onClick={() => setSelectedIdx(3)} />
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Picture 5 - Medium */}
              <BentoImageCard imageUrl={gridPics[4]} size="medium" onClick={() => setSelectedIdx(4)} />
              {/* Picture 6 - Tall */}
              <BentoImageCard imageUrl={gridPics[5]} size="tall" onClick={() => setSelectedIdx(5)} />
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Picture 7 - Tall */}
              <BentoImageCard imageUrl={gridPics[6]} size="tall" onClick={() => setSelectedIdx(6)} />
              {/* Picture 8 - Medium */}
              <BentoImageCard imageUrl={gridPics[7]} size="medium" onClick={() => setSelectedIdx(7)} />
            </div>

          </div>
        </div>

      </div>

      {/* --- EXQUISITE LIGHTBOX PREVIEW MODAL — No Text details on images --- */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-150 flex flex-col items-center justify-center p-4"
            onClick={() => setSelectedIdx(null)}
          >
            {/* LIGHTBOX TOPBAR */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setSelectedIdx(null)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIGHTBOX PHOTO DISPLAY VIEWPORT */}
            <div 
              className="relative w-full max-w-4xl flex items-center justify-center my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handlePrevSlide}
                className="absolute left-2 sm:left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer z-10"
                title="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="max-h-[85vh] rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center shadow-2xl">
                <motion.img
                  key={selectedIdx}
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={gridPics[selectedIdx]}
                  alt={`Lookbook Fullscreen ${selectedIdx}`}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>

              <button
                onClick={handleNextSlide}
                className="absolute right-2 sm:right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer z-10"
                title="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface BentoImageCardProps {
  imageUrl: string;
  size: 'medium' | 'tall';
  onClick: () => void;
}

function BentoImageCard({ imageUrl, size, onClick }: BentoImageCardProps) {
  // Ultra-compact and precise aspect ratio height classes matching a single viewport height
  const heightClasses = {
    medium: 'h-[95px] xs:h-[115px] sm:h-[145px] md:h-[175px]',
    tall: 'h-[145px] xs:h-[185px] sm:h-[235px] md:h-[285px]'
  }[size];

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -1 }}
      onClick={onClick}
      className="group rounded-2xl border border-slate-100 bg-white p-1.5 cursor-pointer transition-all duration-300 shadow-3xs hover:shadow-xs flex flex-col items-center justify-center"
    >
      <div className={`relative ${heightClasses} w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100/50`}>
        <img
          src={imageUrl}
          alt="Curated lookbook gallery picture"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533782654613-826a072dd6f3?auto=format&fit=crop&w=600&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-103 duration-500 transition-transform"
        />
      </div>
    </motion.div>
  );
}
