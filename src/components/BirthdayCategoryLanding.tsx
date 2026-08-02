import React, { useState } from "react";
import {
  Star,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Product, StoreConfig, CategoryID, StoreConfigItem } from "../types";

interface BirthdayCategoryLandingProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory?: (id: CategoryID) => void;
  storeConfig?: StoreConfig;
}

export default function BirthdayCategoryLanding({
  products,
  onSelectProduct,
  onSelectCategory,
  storeConfig,
}: BirthdayCategoryLandingProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const bc = storeConfig?.birthdayCuration;

  // Defaults matching Winni Birthday screenshots
  const heroBanner = {
    image:
      bc?.heroBannerImage ||
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
    title: bc?.heroBannerTitle || "Birthday Gifts",
    subtitle: bc?.heroBannerSubtitle || "For Your Loved Ones",
  };

  const quickCategories: StoreConfigItem[] = (bc?.quickCategories && bc.quickCategories.length > 0)
    ? bc.quickCategories
    : [
        { id: "cakes", name: "Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
        { id: "flowers", name: "Flowers", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80" },
        { id: "personalized", name: "Personalized...", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80" },
        { id: "1st_birthday", name: "1st Birthday ...", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80" },
        { id: "hampers", name: "Hampers", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80" },
        { id: "gift_basket", name: "Gift Basket", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80" },
        { id: "plants", name: "Plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
        { id: "bestsellers", name: "Bestsellers", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80" },
      ];

  const giftsForHerBanner = {
    image: bc?.giftsForHerBannerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    title: bc?.giftsForHerBannerTitle || "Gifts For Her",
  };

  const giftsForHimBanner = {
    image: bc?.giftsForHimBannerImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    title: bc?.giftsForHimBannerTitle || "Gifts For Him",
  };

  const premiumCategories: StoreConfigItem[] = (bc?.premiumCategories && bc.premiumCategories.length > 0)
    ? bc.premiumCategories
    : [
        { id: "premium_flowers", name: "Premium Flowers", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80" },
        { id: "premium_cakes", name: "Premium Cakes", image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80" },
      ];

  const flowersByTypeCategories: StoreConfigItem[] = (bc?.flowersByTypeCategories && bc.flowersByTypeCategories.length > 0)
    ? bc.flowersByTypeCategories
    : [
        { id: "roses", name: "Roses", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" },
        { id: "carnations", name: "Carnations", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80" },
        { id: "exotic", name: "Exotic Flowers", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80" },
        { id: "mixed", name: "Mixed Flowers", image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80" },
        { id: "orchids", name: "Orchids", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80" },
        { id: "gerberas", name: "Gerberas", image: "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&w=400&q=80" },
        { id: "lilies", name: "Lilies", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=80" },
        { id: "bestsellers_flowers", name: "Bestsellers", image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80" },
      ];

  const kidsCakesBanner = {
    image: bc?.kidsCakesBannerImage || "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80",
    title: bc?.kidsCakesBannerTitle || "Cakes For Kids",
  };

  const digitalGiftsBanner = {
    image: bc?.digitalGiftsBannerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    title: bc?.digitalGiftsBannerTitle || "Digital Gifts",
  };

  const exploreGiftsCategories: StoreConfigItem[] = (bc?.exploreGiftsCategories && bc.exploreGiftsCategories.length > 0)
    ? bc.exploreGiftsCategories
    : [
        { id: "gift_basket", name: "Gift Basket", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80" },
        { id: "handbag", name: "Handbag", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80" },
        { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80" },
        { id: "jewellery", name: "Jewellery", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80" },
        { id: "home_decor", name: "Home Decor", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80" },
        { id: "cushion", name: "Cushion", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80" },
      ];

  // Filter products for birthday
  const birthdayProducts = products.filter((p) => {
    const isBirthdayCat =
      p.category === "birthday" ||
      (p.categories && p.categories.includes("birthday")) ||
      p.name.toLowerCase().includes("birthday") ||
      p.name.toLowerCase().includes("cake") ||
      p.name.toLowerCase().includes("gift") ||
      p.name.toLowerCase().includes("flower") ||
      p.name.toLowerCase().includes("hamper") ||
      p.name.toLowerCase().includes("chocolate");

    if (!isBirthdayCat) return false;

    if (searchQuery.trim()) {
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
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
    // If clicking "cakes", "flowers", "plants" etc., check if we should navigate or filter
    if (catId === "cakes" || catId === "flowers" || catId === "plants") {
      onSelectCategory?.(catId as CategoryID);
      return;
    }
    setSelectedFilter(catId);
    const el = document.getElementById("best-picks-birthday");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-amber-50/30 pb-20 text-left">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white text-[11px] font-black py-2 px-4 flex items-center justify-between shadow-xs">
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
      <div className="max-w-7xl mx-auto px-4 py-3 bg-white border-b border-amber-100 sticky top-0 z-30 shadow-2xs">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Birthday Gifts, Cakes, Flowers, Combos..."
            className="w-full text-xs font-medium pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
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

      {/* 3. HERO PROMO BANNER (Cream Background with stacked gifts as in Screenshot 1) */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="relative rounded-3xl overflow-hidden shadow-md group bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border border-amber-200/80 h-48 sm:h-60 md:h-64 flex items-center justify-between px-6 sm:px-12">
          <div className="max-w-md space-y-2 z-10 text-slate-900">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
              SPECIAL CELEBRATION
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight text-rose-600 drop-shadow-2xs">
              {heroBanner.title}
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-slate-700">
              {heroBanner.subtitle}
            </p>
            <button
              onClick={() => handleCategoryClick("all")}
              className="mt-3 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md w-fit flex items-center gap-1.5 transition-all group-hover:px-7"
            >
              Order Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-1/2 h-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/90 via-transparent to-transparent z-10" />
            <img
              src={heroBanner.image}
              alt={heroBanner.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* 4. QUICK CATEGORIES (2-Column Grid Cards matching Screenshot 1 & 4) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {quickCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer text-center group flex flex-col justify-between"
            >
              <div className="w-full aspect-4/3 overflow-hidden bg-amber-50/30 p-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 bg-white border-t border-slate-100">
                <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. GIFTS FOR HER & GIFTS FOR HIM (Promo Banners matching Screenshot 2) */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gifts for Her */}
        <div
          onClick={() => handleCategoryClick("her")}
          className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer bg-pink-100 border border-pink-200 h-44 sm:h-52 flex items-center justify-between px-6"
        >
          <div className="space-y-1 z-10">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {giftsForHerBanner.title}
            </h3>
            <p className="text-xs font-semibold text-slate-600">Surprise her on her special day</p>
            <button className="mt-3 px-4 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs uppercase tracking-wider">
              Send Now
            </button>
          </div>
          <div className="h-full w-1/2 relative shrink-0">
            <img
              src={giftsForHerBanner.image}
              alt={giftsForHerBanner.title}
              className="w-full h-full object-contain object-right group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Gifts for Him */}
        <div
          onClick={() => handleCategoryClick("him")}
          className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer bg-sky-100 border border-sky-200 h-44 sm:h-52 flex items-center justify-between px-6"
        >
          <div className="space-y-1 z-10">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {giftsForHimBanner.title}
            </h3>
            <p className="text-xs font-semibold text-slate-600">Unique gifts he will love</p>
            <button className="mt-3 px-4 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs uppercase tracking-wider">
              Send Now
            </button>
          </div>
          <div className="h-full w-1/2 relative shrink-0">
            <img
              src={giftsForHimBanner.image}
              alt={giftsForHimBanner.title}
              className="w-full h-full object-contain object-right group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* 6. PREMIUM CATEGORIES (Premium Flowers & Premium Cakes matching Screenshot 2) */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {premiumCategories.map((item) => (
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
                <span className="text-xs sm:text-base font-black text-slate-800 group-hover:text-rose-600 transition-colors">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. FLOWERS BY TYPE (Circular Cards matching Screenshot 3) */}
      <div className="max-w-7xl mx-auto px-4 py-8 bg-white/70 border-y border-amber-100 my-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">
          Flowers By Type
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {flowersByTypeCategories.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className="flex flex-col items-center text-center cursor-pointer group bg-white p-3 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-rose-500 transition-colors shadow-2xs bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-800 mt-2.5 group-hover:text-rose-600">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. KIDS CAKES & DIGITAL GIFTS PROMO BANNERS (matching Screenshot 6) */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cakes for Kids */}
        <div
          onClick={() => handleCategoryClick("kids")}
          className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer bg-amber-100/80 border border-amber-200 h-44 sm:h-52 flex items-center justify-between px-6"
        >
          <div className="space-y-1 z-10">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {kidsCakesBanner.title}
            </h3>
            <p className="text-xs font-semibold text-slate-600">Fun character cakes for little ones</p>
            <button className="mt-3 px-4 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs uppercase tracking-wider">
              Send Now
            </button>
          </div>
          <div className="h-full w-1/2 relative shrink-0">
            <img
              src={kidsCakesBanner.image}
              alt={kidsCakesBanner.title}
              className="w-full h-full object-contain object-right group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Digital Gifts */}
        <div
          onClick={() => handleCategoryClick("digital")}
          className="relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer bg-purple-100/80 border border-purple-200 h-44 sm:h-52 flex items-center justify-between px-6"
        >
          <div className="space-y-1 z-10">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              {digitalGiftsBanner.title}
            </h3>
            <p className="text-xs font-semibold text-slate-600">Instant digital gift surprise</p>
            <button className="mt-3 px-4 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs uppercase tracking-wider">
              Send Now
            </button>
          </div>
          <div className="h-full w-1/2 relative shrink-0">
            <img
              src={digitalGiftsBanner.image}
              alt={digitalGiftsBanner.title}
              className="w-full h-full object-contain object-right group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* 9. EXPLORE MORE GIFTS (Circular Grid matching Screenshot 5) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">
          Explore More Gifts
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {exploreGiftsCategories.map((item) => (
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

      {/* 10. BEST PICKS FOR BIRTHDAY (Product Grid matching Screenshot 5 & 6) */}
      <div id="best-picks-birthday" className="max-w-7xl mx-auto px-4 py-6 scroll-mt-20">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Best Picks For Birthday
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Showing {birthdayProducts.length} items for celebration
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

        {birthdayProducts.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-2">
            <p className="text-slate-500 font-bold text-sm">No products found matching your filter.</p>
            <button
              onClick={() => { setSelectedFilter("all"); setSearchQuery(""); }}
              className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
            >
              Show All Birthday Gifts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5">
            {birthdayProducts.map((prod) => {
              const discount = prod.originalPrice
                ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between cursor-pointer text-left"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-50 shrink-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
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
                        {prod.reviewsCount || 22} Reviews
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
