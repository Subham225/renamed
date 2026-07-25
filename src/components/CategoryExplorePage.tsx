import React, { useState } from 'react';
import { Category, StoreConfig, CategoryID, Product } from '../types';
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryExplorePageProps {
  categories: Category[];
  storeConfig?: StoreConfig | null;
  products: Product[];
  onSelectCategory: (id: CategoryID) => void;
  onSelectProduct?: (product: Product) => void;
}

export default function CategoryExplorePage({ categories, storeConfig, products, onSelectCategory, onSelectProduct }: CategoryExplorePageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSubcategories = (catId: string) => {
    switch (catId) {
      case 'cakes':
        return storeConfig?.cakeSubcategories || [];
      case 'gifts':
      case 'combos':
        return storeConfig?.giftSubcategories || [];
      case 'dewali':
        return storeConfig?.dewaliSubcategories || [];
      case 'rakhi':
        return storeConfig?.rakhiSubcategories || [];
      case 'photo_to_art':
        return storeConfig?.photoToArtSubcategories || [];
      case 'hand_crafts':
        return storeConfig?.handCraftSubcategories || [];
      case 'new_year':
        return storeConfig?.newYearSubcategories || [];
      default:
        return [];
    }
  };

  const getProductsForCategory = (catId: string) => {
    return products.filter(p => p.category === catId || p.categories?.includes(catId));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[70vh]">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
        <p className="text-sm font-medium text-slate-500 mt-2">Find the perfect gift for every occasion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const subs = getSubcategories(cat.id);
          const catProducts = getProductsForCategory(cat.id);
          const isExpanded = expandedId === cat.id;

          return (
            <div 
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              <div 
                className="flex items-center p-3 cursor-pointer select-none"
                onClick={() => {
                  setExpandedId(isExpanded ? null : cat.id);
                }}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-50">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=120&q=80';
                    }}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{cat.name}</h3>
                  <p className="text-[11px] text-pink-600 font-bold uppercase tracking-wider mt-1">
                    {subs.length > 0 ? `${subs.length} Collections • ` : ''}{catProducts.length} Products
                  </p>
                </div>
                <div className="shrink-0 p-2 text-slate-300">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-pink-500" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-50 bg-slate-50/50"
                  >
                    {subs.length > 0 && (
                      <div className="p-3">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Collections</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {subs.map((sub, i) => (
                            <div 
                              key={sub.id || i}
                              onClick={() => onSelectCategory(sub.id)}
                              className="flex flex-col bg-white rounded-2xl p-2 border border-slate-100 cursor-pointer hover:border-pink-200 hover:shadow-sm transition-all group"
                            >
                              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-50">
                                {sub.image ? (
                                  <img 
                                    src={sub.image} 
                                    alt={sub.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=120&q=80';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                                    <span className="text-2xl">✨</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                                {sub.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {catProducts.length > 0 && (
                      <div className="p-3 pt-1">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Popular Products</h4>
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                          {catProducts.slice(0, 5).map((prod) => (
                            <div 
                              key={prod.id}
                              onClick={() => onSelectProduct?.(prod)}
                              className="flex-none w-[120px] bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:border-pink-200"
                            >
                              <div className="w-full h-[120px] bg-slate-50">
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="p-2">
                                <h5 className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight">{prod.name}</h5>
                                <p className="text-[11px] font-black text-pink-600 mt-1">₹{prod.price}</p>
                              </div>
                            </div>
                          ))}
                          {catProducts.length > 5 && (
                            <div 
                              onClick={() => onSelectCategory(cat.id)}
                              className="flex-none w-[120px] bg-pink-50 rounded-2xl border border-pink-100 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pink-500 mb-2 shadow-sm">
                                <ArrowRight className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-bold text-pink-700">View {catProducts.length - 5} More</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 pt-0 mt-2">
                      <button 
                        onClick={() => onSelectCategory(cat.id)}
                        className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
                      >
                        Explore All in {cat.name}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
