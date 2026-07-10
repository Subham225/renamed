import { useState } from 'react';
import { Search, ShoppingCart, Heart, MapPin, Menu, Phone, Mail, MapPin as MapPinIcon, X } from 'lucide-react';
import { Location } from '../types';

interface HeaderProps {
  location?: Location;
  onOpenLocation?: () => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  onGoHome?: () => void;
  onOpenMenu?: () => void;
}

export default function Header({
  location,
  onOpenLocation,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  wishlistCount = 0,
  onOpenWishlist,
  onGoHome,
  onOpenMenu,
}: HeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-pink-100 border-b border-pink-200 shadow-sm px-4 py-1.5 pb-2">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
          {/* Top brand line & Cart */}
          <div className="flex items-center justify-between mt-1">
          <button onClick={onGoHome} className="flex items-center gap-1.5 text-left cursor-pointer transition-opacity hover:opacity-80">
            <img
              src="/logo.png"
              alt="ROCX Logo"
              className="w-12 h-12 object-contain hover:scale-105 transition-transform duration-200"
            />
            <div>
              <h1 className="text-xs font-extrabold tracking-tight text-gray-900 leading-none flex flex-col">
                <span className="text-gray-950 font-black text-[13px]">ROCX CAKES & GIFTS</span>
                <span className="text-[7.5px] text-pink-600 font-extrabold tracking-widest mt-0.5">
                  SAME DAY & EXPRESS DELIVERY
                </span>
              </h1>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {onOpenWishlist && (
              <button
                id="wishlist-btn"
                onClick={onOpenWishlist}
                className="relative p-1.5 bg-gray-50 hover:bg-pink-50 rounded-full transition-colors group cursor-pointer"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}
            <button
              id="cart-btn"
              onClick={onOpenCart}
              className="relative p-1.5 bg-gray-50 hover:bg-pink-50 rounded-full transition-colors group cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="relative p-1.5 bg-gray-50 hover:bg-pink-50 rounded-full transition-colors group cursor-pointer ml-1"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Deliver To Selector Bar & Search Bar combined/stacked closely */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          {/* Location Selector */}
          <div
            className="flex items-center gap-1.5 cursor-pointer bg-white/60 px-2.5 py-1 rounded-xl shadow-sm border border-pink-200/50 hover:bg-white w-max select-none transition-all active:scale-95 shrink-0"
            onClick={onOpenLocation}
          >
            <MapPin className="w-4 h-4 text-pink-600" />
            <div className="flex flex-col justify-center translate-y-[-1px]">
              <span className="text-[8px] sm:text-[9px] font-black text-slate-500 tracking-wider uppercase leading-none mt-0.5">
                DELIVERING TO
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">
                {location?.pincode ? location.pincode : 'Enter Pincode'}
              </span>
            </div>
          </div>
          
          {/* Search Bar matching screenshot, rendered with tight sizing */}
          <div className="relative w-full">
            <input
              id="product-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search cakes, flowers, gifts..."
              className="w-full pl-4 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
