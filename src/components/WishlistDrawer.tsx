import React from 'react';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { Product, getWeightPrice, getStartingWeight } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  wishlistIds: string[];
  onRemove: (id: string) => void;
  onSelect: (product: Product) => void;
}

export default function WishlistDrawer({ isOpen, onClose, products, wishlistIds, onRemove, onSelect }: WishlistDrawerProps) {
  if (!isOpen) return null;

  const wishlistedProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full sm:w-[400px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
            <h2 className="text-xl font-black text-slate-800 tracking-tight">My Wishlist</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {wishlistedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-pink-300 fill-pink-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Your wishlist is empty</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Save your favorite cakes, flowers and gifts for special occasions later!</p>
              <button 
                onClick={onClose}
                className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-700 active:scale-[0.98] transition-all shadow-md shadow-pink-600/30"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistedProducts.map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl p-3 flex gap-4 border border-slate-100 shadow-sm relative">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img src={prod.image} className="w-full h-full object-cover" alt={prod.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{prod.name}</h4>
                      <p className="text-xs text-slate-400 font-medium capitalize mt-0.5">{prod.category.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">₹{prod.options?.hasWeightOptions ? getWeightPrice(prod, getStartingWeight(prod)) : prod.price}</span>
                      <button 
                        onClick={() => {
                          onSelect(prod);
                          onClose();
                        }}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase flex items-center gap-1 transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" /> View
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(prod.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white shrink-0 shadow border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
