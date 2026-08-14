import React, { useState } from "react";
import {
  Star,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Leaf,
} from "lucide-react";
import { Product, StoreConfig, CategoryID, StoreConfigItem } from "../types";

interface PlantCategoryLandingProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory?: (id: CategoryID) => void;
  storeConfig?: StoreConfig;
}

export default function PlantCategoryLanding({
  products,
  onSelectProduct,
  onSelectCategory,
  storeConfig,
}: PlantCategoryLandingProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const pc = storeConfig?.plantCuration;

  // Defaults matching top nursery / gift app plant layouts
  const heroBanner = {
    image:
      pc?.heroBannerImage ||
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80",
    title: pc?.heroBannerTitle || "Green Plants & Planters",
    subtitle: pc?.heroBannerSubtitle || "Breathe Fresh & Gift Good Luck",
  };

  const quickCategories: StoreConfigItem[] = (pc?.quickCategories && pc.quickCategories.length > 0)
    ? pc.quickCategories
    : [
        { id: "indoor", name: "Indoor Plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
        { id: "lucky_bamboo", name: "Lucky Bamboo", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80" },
        { id: "air_purifying", name: "Air Purifying", image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80" },
        { id: "flowering", name: "Flowering Plants", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "money_plant", name: "Money Plants", image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=400&q=80" },
        { id: "bonsai", name: "Bonsai Trees", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80" },
        { id: "succulents", name: "Succulents & Cacti", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&q=80" },
        { id: "planters", name: "Ceramic Planters", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
      ];

  const airPurifyingBanner = {
    image: pc?.airPurifyingBannerImage || "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80",
    title: pc?.airPurifyingBannerTitle || "Air Purifying Plants",
  };

  const luckyPlantsBanner = {
    image: pc?.luckyPlantsBannerImage || "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
    title: pc?.luckyPlantsBannerTitle || "Good Luck & Feng Shui",
  };

  const plantsByTypeCategories: StoreConfigItem[] = (pc?.plantsByTypeCategories && pc.plantsByTypeCategories.length > 0)
    ? pc.plantsByTypeCategories
    : [
        { id: "snake", name: "Snake Plant", image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80" },
        { id: "jade", name: "Jade Plant", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&q=80" },
        { id: "peace_lily", name: "Peace Lily", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "money", name: "Money Plant", image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=400&q=80" },
        { id: "syngonium", name: "Syngonium", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
        { id: "aloe", name: "Aloe Vera", image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80" },
        { id: "ferns", name: "Boston Fern", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80" },
        { id: "bamboo", name: "Lucky Bamboo", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80" },
      ];

  const plantsByLocationCategories: StoreConfigItem[] = (pc?.plantsByLocationCategories && pc.plantsByLocationCategories.length > 0)
    ? pc.plantsByLocationCategories
    : [
        { id: "indoor_loc", name: "Indoor Living", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
        { id: "desk", name: "Desk & Office", image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=400&q=80" },
        { id: "balcony", name: "Balcony & Sun", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "bedroom", name: "Bedroom Sleep", image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80" },
      ];

  const explorePlantersCategories: StoreConfigItem[] = (pc?.explorePlantersCategories && pc.explorePlantersCategories.length > 0)
    ? pc.explorePlantersCategories
    : [
        { id: "ceramic", name: "Ceramic Pots", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
        { id: "metal", name: "Metal Stands", image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=400&q=80" },
        { id: "self_watering", name: "Self-Watering", image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80" },
        { id: "hanging", name: "Hanging Pots", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "fertilizer", name: "Plant Care", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&q=80" },
        { id: "plant_hampers", name: "Plant Combos", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80" },
      ];

  // Filter products for Plants
  const plantProducts = products.filter((p) => {
    const isPlantCat =
      p.category === "plants" ||
      (p.categories && p.categories.includes("plants")) ||
      p.name.toLowerCase().includes("plant") ||
      p.name.toLowerCase().includes("bamboo") ||
      p.name.toLowerCase().includes("bonsai") ||
      p.name.toLowerCase().includes("succulent") ||
      p.name.toLowerCase().includes("planter") ||
      p.name.toLowerCase().includes("syngonium") ||
      p.name.toLowerCase().includes("jade") ||
      p.name.toLowerCase().includes("snake");

    if (!isPlantCat) return false;

    if (searchQuery.trim()) {
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      const allCurationItems = [
        ...quickCategories,
        ...plantsByTypeCategories,
        ...plantsByLocationCategories,
        ...explorePlantersCategories,
      ];
      const activeItem = allCurationItems.find((i) => i.id === selectedFilter);
      if (activeItem && activeItem.productIds && activeItem.productIds.length > 0) {
        return activeItem.productIds.includes(p.id);
      }

      const filterKey = selectedFilter.toLowerCase();
      return (
        p.name.toLowerCase().includes(filterKey) ||
        p.category.toLowerCase().includes(filterKey) ||
        (p.categories && p.categories.some((c) => c.toLowerCase().includes(filterKey)))
      );
    }

    return true;
  });

  const handleCategoryClick = (catId: string) => {
    setSelectedFilter(catId);
    const el = document.getElementById("best-picks-plants");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-emerald-50/30 pb-20 text-left">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white text-[11px] font-black py-2 px-4 flex items-center justify-between shadow-xs">
        <span className="flex items-center gap-1.5 truncate">
          <Leaf className="w-3.5 h-3.5 animate-pulse shrink-0 text-emerald-200" />
          <span>Order Green Plants & Get 20% OFF! Use code: <strong className="underline decoration-wavy text-amber-200">ROCXPLANTS</strong></span>
        </span>
        <button
          onClick={() => alert("Code ROCXPLANTS copied!")}
          className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase shrink-0 ml-2"
        >
          Claim
        </button>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-4 py-3 bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-2xs">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Indoor Plants, Lucky Bamboo, Air Purifying, Planters..."
            className="w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. HERO PROMO BANNER */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="relative rounded-3xl overflow-hidden shadow-md group bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-100 border border-emerald-200/80 h-48 sm:h-60 md:h-64 flex items-center justify-between px-6 sm:px-12">
          <div className="max-w-md space-y-2 z-10 text-slate-900">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3 text-emerald-600" /> ECO FRIENDLY GIFTS
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight text-emerald-900 drop-shadow-2xs">
              {heroBanner.title}
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-emerald-700">
              {heroBanner.subtitle}
            </p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="mt-3 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md w-fit flex items-center gap-1.5 transition-all group-hover:px-7"
            >
              Explore Plants <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-1/2 h-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/90 via-transparent to-transparent z-10" />
            <img
              src={heroBanner.image}
              alt={heroBanner.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* 4. QUICK CATEGORIES GRID (2-Column Grid Cards) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {quickCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer text-center group flex flex-col justify-between"
            >
              <div className="w-full aspect-4/3 overflow-hidden bg-emerald-50/30 p-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 bg-white border-t border-slate-100">
                <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. AIR PURIFYING & LUCKY PLANTS PROMO BANNERS */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Air Purifying Plants */}
        <div
          onClick={() => handleCategoryClick("air_purifying")}
          className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer bg-teal-100 border border-teal-200 h-44 sm:h-52 flex items-center justify-between px-6"
        >
          <div className="space-y-1 z-10">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {airPurifyingBanner.title}
            </h3>
            <p className="text-xs font-semibold text-slate-600">Breathe clean oxygen naturally</p>
            <button className="mt-3 px-4 py-1.5 bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs uppercase tracking-wider">
              Shop Now
            </button>
          </div>
          <div className="h-full w-1/2 relative shrink-0">
            <img
              src={airPurifyingBanner.image}
              alt={airPurifyingBanner.title}
              className="w-full h-full object-contain object-right group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Lucky Plants */}
        <div
          onClick={() => handleCategoryClick("lucky")}
          className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer bg-amber-100/90 border border-amber-200 h-44 sm:h-52 flex items-center justify-between px-6"
        >
          <div className="space-y-1 z-10">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {luckyPlantsBanner.title}
            </h3>
            <p className="text-xs font-semibold text-slate-600">Bring good fortune & positive vibes</p>
            <button className="mt-3 px-4 py-1.5 bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs uppercase tracking-wider">
              Shop Now
            </button>
          </div>
          <div className="h-full w-1/2 relative shrink-0">
            <img
              src={luckyPlantsBanner.image}
              alt={luckyPlantsBanner.title}
              className="w-full h-full object-contain object-right group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* 6. PLANTS BY TYPE (Circular Grid) */}
      <div className="max-w-7xl mx-auto px-4 py-8 bg-white/70 border-y border-emerald-100 my-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">
          Popular Plant Varieties
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {plantsByTypeCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="flex flex-col items-center text-center cursor-pointer group bg-white p-3 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-emerald-500 transition-colors shadow-2xs bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-800 mt-2.5 group-hover:text-emerald-700">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. PLANTS BY LOCATION */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 text-center">
          Plants By Ideal Location
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {plantsByLocationCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer text-center group flex flex-col justify-between"
            >
              <div className="w-full aspect-4/3 overflow-hidden bg-slate-50 p-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <div className="p-3 bg-white border-t border-slate-100">
                <span className="text-xs sm:text-base font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. EXPLORE PLANTERS & ACCESSORIES */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">
          Pots, Planters & Care
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {explorePlantersCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-200 p-1 group-hover:border-emerald-500 transition-colors bg-white shadow-2xs">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-extrabold text-slate-800 mt-2 group-hover:text-emerald-700 transition-colors">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 9. BEST PICKS FOR PLANTS PRODUCT GRID */}
      <div id="best-picks-plants" className="max-w-7xl mx-auto px-4 py-6 scroll-mt-20">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Best Picks For Plants
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Showing {plantProducts.length} items for green gifting
            </span>
          </div>

          {selectedFilter !== "all" && (
            <button
              onClick={() => setSelectedFilter("all")}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
            >
              Clear Filter ({selectedFilter}) ✕
            </button>
          )}
        </div>

        {plantProducts.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2">
            <p className="text-slate-500 font-bold text-sm">No plant products found matching your filter.</p>
            <button
              onClick={() => { setSelectedFilter("all"); setSearchQuery(""); }}
              className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Show All Plants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5">
            {plantProducts.map((prod) => {
              const discount = prod.originalPrice
                ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between cursor-pointer text-left"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {prod.name}
                      </h4>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-sm sm:text-base font-black text-slate-950">
                          ₹{prod.price}
                        </span>
                        {prod.originalPrice && (
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                            ₹{prod.originalPrice}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            ({discount}% Off)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold pt-0.5">
                        <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Earliest Delivery: <strong className="text-emerald-700">Today</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center bg-emerald-700 text-white font-extrabold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded gap-0.5">
                        <span>{prod.rating || 4.8}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {prod.reviewsCount || 18} Reviews
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
