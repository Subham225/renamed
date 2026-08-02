import React from 'react';
import { Gift, Cake, Flower, Leaf, Sparkles } from 'lucide-react';
import { Category, CategoryID } from '../types';

interface TopCategoryBarProps {
  categories?: Category[];
  selectedCategory: CategoryID | null;
  onSelectCategory: (id: CategoryID | null) => void;
}

export default function TopCategoryBar({
  selectedCategory,
  onSelectCategory,
}: TopCategoryBarProps) {
  // Top bar items strictly as requested:
  // 1. All Gifts (selected by default when selectedCategory is null -> shows front page)
  // 2. Cakes
  // 3. Flowers
  // 4. Birthday
  // 5. Plants

  const topItems: { id: CategoryID | null; name: string; icon: React.ReactNode }[] = [
    {
      id: null,
      name: 'All Gifts',
      icon: <Gift className="w-4 h-4 text-pink-600" />,
    },
    {
      id: 'cakes',
      name: 'Cakes',
      icon: <Cake className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'flowers',
      name: 'Flowers',
      icon: <Flower className="w-4 h-4 text-pink-500" />,
    },
    {
      id: 'birthday',
      name: 'Birthday',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'plants',
      name: 'Plants',
      icon: <Leaf className="w-4 h-4 text-emerald-500" />,
    },
  ];

  return (
    <div className="bg-pink-50/40 border-b border-pink-100/30 py-2 overflow-x-auto scrollbar-none select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 sm:gap-10 min-w-max">
        {topItems.map((item) => {
          const isSelected = item.id === null ? selectedCategory === null : selectedCategory === item.id;
          return (
            <button
              id={`top-category-item-${item.id || 'all'}`}
              key={item.id || 'all'}
              onClick={() => onSelectCategory(item.id)}
              className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer transition-all active:scale-95 group"
            >
              <div
                className={`p-2 rounded-full transition-all duration-200 ${
                  isSelected
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-200 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 group-hover:shadow-sm'
                }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: `w-4 h-4 ${isSelected ? 'text-white' : (item.icon as React.ReactElement).props.className}`,
                })}
              </div>
              <span
                className={`text-[10.5px] font-extrabold tracking-tight transition-colors ${
                  isSelected ? 'text-pink-600 font-black' : 'text-slate-600 group-hover:text-pink-600'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
