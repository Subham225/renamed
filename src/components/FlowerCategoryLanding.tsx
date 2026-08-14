import React, { useState } from "react";
import {
  Star,
  Zap,
  ShoppingBag,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Tag,
  Clock,
  Heart,
} from "lucide-react";
import { Product, StoreConfig, CategoryID, StoreConfigItem } from "../types";

interface FlowerCategoryLandingProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory?: (id: CategoryID) => void;
  storeConfig?: StoreConfig;
}

export default function FlowerCategoryLanding({
  products,
  onSelectProduct,
  onSelectCategory,
  storeConfig,
}: FlowerCategoryLandingProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fc = storeConfig?.flowerCuration;

  // Defaults matching Winni screenshots
  const heroBanner = {
    image:
      fc?.heroBannerImage ||
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80",
    title: fc?.heroBannerTitle || "Experience The Rare",
    subtitle: fc?.heroBannerSubtitle || "Exotic Blooms, Unmatched Elegance",
  };

  const trendingCategories: StoreConfigItem[] = (fc?.trendingCategories && fc.trendingCategories.length > 0)
    ? fc.trendingCategories
    : [
        { id: "new_arrival", name: "New Arrival Flowers", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80" },
        { id: "best_selling", name: "Best Selling Flowers", image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80" },
        { id: "exclusive", name: "Exclusive Flowers", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80" },
        { id: "bouquet", name: "Flowers Bouquet", image: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=400&q=80" },
        { id: "arrangements", name: "Flower Arrangements", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80" },
        { id: "combos", name: "Flower Combos", image: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80" },
      ];

  const byTypeCategories: StoreConfigItem[] = (fc?.byTypeCategories && fc.byTypeCategories.length > 0)
    ? fc.byTypeCategories
    : [
        { id: "roses", name: "Roses", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" },
        { id: "orchids", name: "Orchids", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80" },
        { id: "lilies", name: "Lilies", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "gerberas", name: "Gerberas", image: "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=400&q=80" },
        { id: "carnations", name: "Carnations", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80" },
        { id: "mixed", name: "Mixed Flowers", image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80" },
      ];

  const byColorCategories: StoreConfigItem[] = (fc?.byColorCategories && fc.byColorCategories.length > 0)
    ? fc.byColorCategories
    : [
        { id: "red", name: "Red", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" },
        { id: "pink", name: "Pink", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80" },
        { id: "yellow", name: "Yellow", image: "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=400&q=80" },
        { id: "white", name: "White", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "purple", name: "Purple", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80" },
        { id: "mixed_color", name: "Mixed", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80" },
      ];

  const byCollectionCategories: StoreConfigItem[] = (fc?.byCollectionCategories && fc.byCollectionCategories.length > 0)
    ? fc.byCollectionCategories
    : [
        { id: "premium", name: "Premium Flowers", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80" },
        { id: "basket", name: "Basket Arrangements", image: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=400&q=80" },
        { id: "exotic", name: "Exotic Flowers", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80" },
      ];

  const premiumFlowersCategories: StoreConfigItem[] = (fc?.premiumFlowersCategories && fc.premiumFlowersCategories.length > 0)
    ? fc.premiumFlowersCategories
    : [
        { id: "premium_roses", name: "Luxury Red Roses", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" },
        { id: "exotic_orchids", name: "Exotic Purple Orchids", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80" },
        { id: "grand_lilies", name: "Grand White Lilies", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
      ];

  const luxuryPairings: StoreConfigItem[] = (fc?.luxuryPairings && fc.luxuryPairings.length > 0)
    ? fc.luxuryPairings
    : [
        { id: "flowers_cakes", name: "Flowers & Cakes", image: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80" },
        { id: "flowers_teddies", name: "Flowers & Teddies", image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80" },
        { id: "flowers_chocolates", name: "Flowers & Chocolates", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80" },
        { id: "chocolates_bouquet", name: "Chocolates Bouquet", image: "https://images.unsplash.com/photo-1511389026070-a14ae610a1be?auto=format&fit=crop&w=400&q=80" },
      ];

  const byOccasionCategories: StoreConfigItem[] = (fc?.byOccasionCategories && fc.byOccasionCategories.length > 0)
    ? fc.byOccasionCategories
    : [
        { id: "birthday", name: "Birthday", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80" },
        { id: "anniversary", name: "Anniversary", image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80" },
        { id: "love", name: "Love & Affection", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" },
        { id: "wedding", name: "Wedding", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80" },
        { id: "congrats", name: "Congratulations", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80" },
        { id: "thank_you", name: "Thank you", image: "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=400&q=80" },
        { id: "sympathy", name: "Sympathy", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "sorry", name: "I am sorry", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80" },
      ];

  const luxuryBloomsBanner = {
    image: fc?.luxuryBloomsBannerImage || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80",
    title: fc?.luxuryBloomsBannerTitle || "Luxury Blooms - Exquisite by Nature, Perfected by Hand",
  };

  const plantsPromoBanner = {
    image: fc?.plantsPromoBannerImage || "https://images.unsplash.com/photo-1466692476877-3dfa6406e409?auto=format&fit=crop&w=1200&q=80",
    title: fc?.plantsPromoBannerTitle || "Plants that grow love",
  };

  // Filter flower products
  const flowerProducts = products.filter((p) => {
    const isFlowerCat =
      p.category === "flowers" ||
      (p.categories && p.categories.includes("flowers")) ||
      p.name.toLowerCase().includes("flower") ||
      p.name.toLowerCase().includes("rose") ||
      p.name.toLowerCase().includes("bouquet") ||
      p.name.toLowerCase().includes("orchid") ||
      p.name.toLowerCase().includes("lily") ||
      p.name.toLowerCase().includes("gerbera");
    
    if (!isFlowerCat) return false;

    if (searchQuery.trim()) {
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      const allCurationItems = [
        ...trendingCategories,
        ...byTypeCategories,
        ...byColorCategories,
        ...byCollectionCategories,
        ...premiumFlowersCategories,
        ...luxuryPairings,
        ...byOccasionCategories,
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
    if (onSelectCategory) {
      onSelectCategory(catId as CategoryID);
      return;
    }
    setSelectedFilter(catId);
    const el = document.getElementById("best-picks-flowers");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-slate-50 pb-20 text-left">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-[11px] font-black py-2 px-4 flex items-center justify-between shadow-xs">
        <span className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span>Order on Rocx App & Get 20% OFF! Use code: <strong className="underline decoration-wavy">ROCX20</strong></span>
        </span>
        <button
          onClick={() => alert("Code ROCX20 copied!")}
          className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase shrink-0 ml-2"
        >
          Claim
        </button>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Flowers, Roses, Orchids, Combos..."
            className="w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
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
        <div className="relative rounded-3xl overflow-hidden shadow-md group bg-slate-900 h-44 sm:h-56 md:h-64">
          <img
            src={heroBanner.image}
            alt={heroBanner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent flex flex-col justify-center px-6 sm:px-12 text-white">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-300 bg-rose-950/60 px-3 py-1 rounded-full w-fit mb-2 border border-rose-500/30">
              FRESH & HAND-PICKED
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight drop-shadow-md">
              {heroBanner.title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-rose-100 mt-1 max-w-md drop-shadow-sm">
              {heroBanner.subtitle}
            </p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="mt-4 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md w-fit flex items-center gap-1.5 transition-all group-hover:px-6"
            >
              Shop Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. TRENDING CATEGORIES (6 Grid Cards matching Screenshot 1) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 text-center">
          Trending Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {trendingCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer text-center group flex flex-col items-center justify-between"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-rose-50/50 mb-2 border border-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <p className="text-xs font-black text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-2">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. BY TYPE (Circular Grid matching Screenshot 2) */}
      <div className="max-w-7xl mx-auto px-4 py-6 bg-white/60 border-y border-slate-200/60 my-2">
        <h2 className="text-xl font-black text-slate-900 mb-4 text-center">
          By Type
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {byTypeCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-200 p-1 group-hover:border-rose-500 transition-colors bg-white shadow-2xs">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-extrabold text-slate-800 mt-2 group-hover:text-rose-600 transition-colors">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. BY COLOR (Arch Cards matching Screenshot 2) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 text-center">
          By Color
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {byColorCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="bg-white rounded-3xl border border-slate-200 p-2 shadow-2xs hover:shadow-md transition-all cursor-pointer text-center group flex flex-col items-center"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-rose-50 mb-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-black text-slate-800 pb-1 group-hover:text-rose-600">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. BY COLLECTION (Large Circular Icons matching Screenshot 3) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 text-center">
          By Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {byCollectionCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="flex flex-col items-center text-center cursor-pointer group bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all"
            >
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-rose-500 transition-colors shadow-sm bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-sm font-black text-slate-900 mt-3 group-hover:text-rose-600">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PREMIUM FLOWERS SECTION */}
      {premiumFlowersCategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 bg-gradient-to-r from-rose-50/60 via-pink-50/40 to-rose-50/60 rounded-3xl border border-rose-100 my-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">
                LUXURY SELECTION
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Premium Flowers
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {premiumFlowersCategories.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCategoryClick(item.id)}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center gap-3"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-rose-50 shrink-0 border border-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-xs font-black text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1 mt-0.5">
                    Explore Collection →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. LUXURY PAIRINGS (2x2 Grid with Pink Pill Tags matching Screenshot 3) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 text-center">
          Luxury Pairings
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {luxuryPairings.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative flex flex-col"
            >
              <div className="w-full aspect-square overflow-hidden bg-slate-100 relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
              </div>
              <div className="p-3 text-center bg-white">
                <span className="inline-block bg-pink-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-xs group-hover:bg-pink-600 transition-colors w-full truncate">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. PROMO BANNERS (Luxury Blooms & Plants Promo matching Screenshot 4) */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Luxury Blooms Banner */}
        <div
          onClick={() => handleCategoryClick("exotic")}
          className="relative rounded-3xl overflow-hidden shadow-md group cursor-pointer bg-slate-900 h-40 sm:h-48"
        >
          <img
            src={luxuryBloomsBanner.image}
            alt={luxuryBloomsBanner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/30 to-transparent flex flex-col justify-center px-6 sm:px-10 text-white">
            <h3 className="text-xl sm:text-3xl font-black leading-tight max-w-md">
              {luxuryBloomsBanner.title}
            </h3>
            <button className="mt-3 px-4 py-1.5 bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs w-fit uppercase tracking-wider">
              Shop Now
            </button>
          </div>
        </div>

        {/* Plants Banner */}
        <div
          onClick={() => onSelectCategory?.("plants" as CategoryID)}
          className="relative rounded-3xl overflow-hidden shadow-md group cursor-pointer bg-emerald-950 h-36 sm:h-44"
        >
          <img
            src={plantsPromoBanner.image}
            alt={plantsPromoBanner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/40 to-transparent flex flex-col justify-center px-6 sm:px-10 text-white">
            <span className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">ECO-FRIENDLY GIFTS</span>
            <h3 className="text-xl sm:text-2xl font-black leading-tight mt-0.5">
              {plantsPromoBanner.title}
            </h3>
            <button className="mt-2.5 px-4 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs w-fit uppercase tracking-wider">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* 10. BY OCCASION (8 Cards Grid matching Screenshot 5) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 text-center">
          By Occasion
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {byOccasionCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="w-full aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 text-center">
                <span className="text-xs font-black text-slate-800 group-hover:text-rose-600">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 11. BEST PICKS FOR FLOWERS (Product Grid matching Screenshot 6) */}
      <div id="best-picks-flowers" className="max-w-7xl mx-auto px-4 py-6 scroll-mt-20">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Best Picks For Flowers
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Showing {flowerProducts.length} fresh blooms
            </span>
          </div>

          {selectedFilter !== "all" && (
            <button
              onClick={() => setSelectedFilter("all")}
              className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200"
            >
              Clear Filter ({selectedFilter}) ✕
            </button>
          )}
        </div>

        {flowerProducts.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2">
            <p className="text-slate-500 font-bold text-sm">No flowers found matching your filter.</p>
            <button
              onClick={() => { setSelectedFilter("all"); setSearchQuery(""); }}
              className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
            >
              Show All Flowers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5">
            {flowerProducts.map((prod) => {
              const discount = prod.originalPrice
                ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-rose-300 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between cursor-pointer text-left"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-rose-600 transition-colors">
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
                        {prod.reviewsCount || 12} Reviews
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
