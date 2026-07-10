import React from 'react';
import { Gift, Cake, Flower, Leaf, Smile, Sparkles, Heart, Star, Award } from 'lucide-react';
import { Category, CategoryID } from '../types';

interface TopCategoryBarProps {
  categories: Category[];
  selectedCategory: CategoryID | null;
  onSelectCategory: (id: CategoryID | null) => void;
}

const getCategoryIcon = (id: CategoryID, sizeClass = "w-3.5 h-3.5") => {
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
      return <Smile className={`${sizeClass} text-amber-800`} />;
    case 'combos':
      return <Gift className={`${sizeClass} text-fuchsia-500`} />;
    case 'anniversary':
      return <Heart className={`${sizeClass} text-red-500`} />;
    default:
      return <Gift className={sizeClass} />;
  }
};

export default function TopCategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: TopCategoryBarProps) {
  // Display all visible categories dynamically
  const barCategories = categories;

  return (
    <div className="bg-pink-50/40 border-b border-pink-100/30 py-1.5 overflow-x-auto scrollbar-none select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 md:justify-center min-w-max">
        {barCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          
          return (
            <button
              id={`top-category-item-${cat.id}`}
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer transition-all active:scale-95 group"
            >
              <div className={`p-1.5 rounded-full transition-all duration-200 ${
                isSelected 
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-200 scale-105' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100/80 group-hover:shadow-sm'
              }`}>
                {getCategoryIcon(cat.id, "w-3.5 h-3.5")}
              </div>
              
              <span className={`text-[9px] font-extrabold tracking-tight transition-colors ${
                isSelected 
                  ? 'text-pink-600' 
                  : cat.id === 'fathers_day' ? 'text-indigo-600 font-extrabold' 
                  : cat.id === 'mothers_day' ? 'text-pink-600 font-extrabold' 
                  : cat.id === 'teachers_day' ? 'text-amber-600 font-extrabold'
                  : cat.id === 'xmas' ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-600 group-hover:text-pink-600'
              }`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
