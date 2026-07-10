import { Category, CategoryID } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (id: CategoryID) => void;
}

export default function CategoryGrid({ categories, onSelectCategory }: CategoryGridProps) {
  // Render all visible categories dynamically, limiting to main 8 if they hide some special ones
  const mainGridCategories = categories.filter(c => c.showInGrid !== false).slice(0, 8);

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 sm:py-3 select-none overflow-hidden animate-none">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] sm:text-xs font-black text-slate-400 tracking-widest uppercase">
          Explore Categories
        </h3>
        <span className="text-[9px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
          {mainGridCategories.length} Super Collections
        </span>
      </div>
      
      {/* 4 columns layout containing all 8 elements compactly on the first viewport */}
      <div className="grid grid-cols-4 gap-x-2.5 gap-y-3 sm:gap-x-4 sm:gap-y-5">
        {mainGridCategories.map((cat) => (
          <button
            id={`category-grid-item-${cat.id}`}
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
          >
            {/* Elegant compact circular image container resembling top premium quick comm brands */}
            <div className="w-[58px] h-[58px] xs:w-[68px] xs:h-[68px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden shadow-sm border border-slate-100 bg-white group-hover:shadow-md group-hover:border-pink-300 transition-all duration-300 relative">
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback for any broken images to make sure they always look clean and pretty
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=120&q=80';
                }}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Highly optimized snug text labels */}
            <span className="text-[10px] xs:text-[11px] sm:text-xs font-extrabold text-slate-700 text-center mt-1.5 group-hover:text-pink-600 transition-colors leading-tight line-clamp-2 max-w-[76px]">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
