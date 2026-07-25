import { Gift, Cake, Flower, Leaf, Smile, Sparkles, Heart, Star, Award } from 'lucide-react';
import { Category, CategoryID } from '../types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: CategoryID | null;
  onSelectCategory: (id: CategoryID | null) => void;
}

// Icon mapper to display clean vector icons matching standard styles
const getCategoryIcon = (id: CategoryID, sizeClass = "w-5 h-5") => {
  switch (id) {
    case 'fathers_day':
      return <Heart className={`${sizeClass} text-indigo-500 fill-indigo-100`} />;
    case 'mothers_day':
      return <Heart className={`${sizeClass} text-pink-500 fill-pink-100`} />;
    case 'teachers_day':
      return <Award className={`${sizeClass} text-amber-500 fill-amber-100`} />;
    case 'xmas':
      return <Star className={`${sizeClass} text-emerald-500 fill-emerald-100`} />;
    case 'cakes':
      return <Cake className={`${sizeClass} text-amber-500`} />;
    case 'flowers':
      return <Flower className={`${sizeClass} text-pink-500`} />;
    case 'plants':
      return <Leaf className={`${sizeClass} text-emerald-500`} />;
    case 'gifts':
      return <Gift className={`${sizeClass} text-blue-500`} />;
    case 'personalized_gifts':
      return <Sparkles className={`${sizeClass} text-indigo-500`} />;
    case 'chocolates':
      return <Smile className={`${sizeClass} text-amber-900`} />;
    case 'combos':
      return <Gift className={`${sizeClass} text-fuchsia-500`} />;
    case 'anniversary':
      return <Heart className={`${sizeClass} text-red-500`} />;
    default:
      return <Gift className={sizeClass} />;
  }
};

export default function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <div className="bg-white py-3.5 border-b border-slate-100 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 md:justify-center min-w-max">
        {/* All Products Tab */}
        <button
          id="category-tab-all"
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer ${
            selectedCategory === null
              ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-100'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>✨ All Offers</span>
        </button>

        {/* 2 Hours Delivery Virtual Tab */}
        <button
          id="category-tab-two-hours"
          onClick={() => onSelectCategory('two_hours_delivery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer ${
            selectedCategory === 'two_hours_delivery'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>🚀 2 Hours Delivery</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              id={`category-tab-${cat.id}`}
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
