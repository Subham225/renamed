import { useState } from "react";
import { Star, ArrowRight, ShieldCheck, Clock, Cake as CakeIcon, Heart, Sparkles, Gift, Flame } from "lucide-react";
import { Product, StoreConfig, CategoryID, getWeightPrice, getStartingWeight } from "../types";

interface CakeCategoryLandingProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory?: (id: CategoryID) => void;
  storeConfig?: StoreConfig;
}

export default function CakeCategoryLanding({
  products,
  onSelectProduct,
  onSelectCategory,
  storeConfig,
}: CakeCategoryLandingProps) {
  // Tabs states
  const [collectionTab, setCollectionTab] = useState<"bestsellers" | "signature">("bestsellers");
  const [sliceTab, setSliceTab] = useState<"birthday" | "anniversary">("birthday");
  const [celebrationTab, setCelebrationTab] = useState<"photo" | "designer">("photo");

  // Filter products by helper
  const cakeProducts = products.filter(
    (p) =>
      p.category === "cakes" ||
      (p.categories && p.categories.includes("cakes")) ||
      p.name.toLowerCase().includes("cake")
  );

  // Helper product arrays
  const bestSellers = cakeProducts.filter((p) => (p.rating && p.rating >= 4.7) || p.isPersonalisedBestSeller).slice(0, 10);
  const signatureCakes = cakeProducts
    .filter((p) => p.price >= 599 || p.name.toLowerCase().includes("truffle") || p.name.toLowerCase().includes("belgian") || p.name.toLowerCase().includes("velvet") || p.name.toLowerCase().includes("designer") || p.name.toLowerCase().includes("bento"))
    .filter((p) => !bestSellers.slice(0, 3).some((b) => b.id === p.id))
    .concat(cakeProducts.filter((p) => !bestSellers.some((b) => b.id === p.id)))
    .slice(0, 10);
  
  const birthdayCakes = cakeProducts.filter((p) => p.name.toLowerCase().includes("birthday") || p.category === "birthday" || (p.categories && p.categories.includes("birthday"))).concat(cakeProducts.slice(0, 6)).slice(0, 8);
  const anniversaryCakes = cakeProducts.filter((p) => p.name.toLowerCase().includes("anniversary") || p.name.toLowerCase().includes("heart") || p.name.toLowerCase().includes("rose")).concat(cakeProducts.slice(2, 8)).slice(0, 8);

  const photoCakes = cakeProducts.filter((p) => p.name.toLowerCase().includes("photo") || (p.categories && p.categories.includes("photo_cake"))).concat(cakeProducts.slice(1, 6)).slice(0, 8);
  const designerCakes = cakeProducts.filter((p) => p.name.toLowerCase().includes("designer") || p.name.toLowerCase().includes("pinata") || p.name.toLowerCase().includes("bento")).concat(cakeProducts.slice(3, 9)).slice(0, 8);

  // Quick Circular Categories
  const defaultQuickCategories = [
    { id: "cakes", name: "All Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
    { id: "birthday", name: "Birthday Cakes", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80" },
    { id: "anniversary", name: "Anniversary Cakes", image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80" },
    { id: "photo_cake", name: "Photo Cakes", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80" },
    { id: "heart_shape", name: "Heart Shape Cakes", image: "https://images.unsplash.com/photo-1586788224331-947f68671caf?auto=format&fit=crop&w=400&q=80" },
    { id: "kids_cake", name: "Kids Cakes", image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=400&q=80" },
  ];

  const quickCategories = (storeConfig?.quickCakeCategories && storeConfig.quickCakeCategories.length > 0)
    ? storeConfig.quickCakeCategories
    : defaultQuickCategories;

  // Iconic Bake Flavors - Card format with text over photo
  const iconicFlavors = [
    { id: "taste_chocolate", name: "Chocolate Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_butterscotch", name: "Butterscotch Cakes", image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_blackforest", name: "Black Forest Cakes", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_vanilla", name: "Vanilla Cakes", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_truffle", name: "Truffle Cakes", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_pineapple", name: "Pineapple Cakes", image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=400&q=80" },
  ];

  // Your Taste Your Pick Grid - Dynamic or default 9 Working Unsplash URLs
  const defaultTastePickItems = [
    { id: "taste_redvelvet", name: "Red Velvet", image: "https://images.unsplash.com/photo-1586788224331-947f68671caf?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_whiteforest", name: "White Forest", image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_strawberry", name: "Strawberry", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_blueberry", name: "Blueberry", image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_rasmalai", name: "Rasmalai", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_fruit", name: "Fresh Fruit", image: "https://images.unsplash.com/photo-1599818815187-578500249870?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_mango", name: "Mango Delight", image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_butterscotch", name: "Butterscotch Crunch", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=400&q=80" },
    { id: "taste_kitkat", name: "Kitkat & Gems", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80" },
  ];

  const tastePickItems = storeConfig?.tastePickCategories && storeConfig.tastePickCategories.length > 0
    ? storeConfig.tastePickCategories
    : defaultTastePickItems;

  // Cakes + Surprises = Smiles Combos
  const comboGrid = [
    { name: "Cake Combos", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80" },
    { name: "Cake with Flowers", image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=500&q=80" },
    { name: "Cake with Chocolates", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=500&q=80" },
    { name: "Cake with Teddies", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=500&q=80" },
  ];

  // Render product horizontal card
  const renderProductCard = (p: Product) => {
    const price = p.options?.hasWeightOptions ? getWeightPrice(p, getStartingWeight(p)) : p.price;
    const orig = p.originalPrice || Math.round(price * 1.25);
    const discount = Math.round(((orig - price) / orig) * 100);

    return (
      <div
        key={p.id}
        onClick={() => onSelectProduct(p)}
        className="shrink-0 w-44 bg-white rounded-2xl border border-slate-100/90 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group"
      >
        <div className="relative h-36 w-full overflow-hidden bg-slate-50">
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {p.isTwoHourDelivery && (
            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
              🚀 2 HOURS
            </span>
          )}
        </div>
        <div className="p-2.5">
          <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
            {p.name}
          </h4>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-slate-900">₹{price}</span>
              {orig > price && (
                <span className="text-[10px] text-slate-400 line-through">₹{orig}</span>
              )}
            </div>
            {p.rating && (
              <div className="flex items-center gap-0.5 bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                <span>{p.rating.toFixed(1)}</span>
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
          </div>
          {discount > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
              {discount}% off
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#fff9f6] min-h-screen pb-20 font-sans text-slate-800">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-100 rounded-2xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80"
              alt="Freshly Baked Cakes"
              className="w-12 h-12 rounded-xl object-cover shadow-sm"
            />
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">
                Freshly Baked Cakes
              </p>
              <p className="text-[11px] font-bold text-pink-600">
                Same Day Express Delivery
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById("best-picks-anchor");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* 2. CIRCULAR QUICK SUBCATEGORY ICONS */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory && onSelectCategory(cat.id as CategoryID)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-pink-200 group-hover:border-pink-600 shadow-sm transition-all p-0.5 bg-white">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
                  }}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-[11px] font-extrabold text-slate-700 mt-1.5 text-center leading-tight group-hover:text-pink-600 transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. HERO INDULGENCE BANNER */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-md">
          <img
            src="https://images.unsplash.com/photo-1557308536-ee471ef2c390?auto=format&fit=crop&w=1200&q=80"
            alt="A Gourmet Indulgence"
            className="w-full h-44 sm:h-56 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-transparent p-5 sm:p-8 flex flex-col justify-center max-w-lg">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-pink-400 mb-1">
              ROCX CAKES SPECIAL
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              A Gourmet Indulgence, <span className="text-pink-400">Redefined.</span>
            </h2>
            <p className="text-xs text-slate-200 mt-1 line-clamp-2">
              Where premium flavors create timeless memories with every slice.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById("best-picks-anchor");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-full w-fit shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* 4. MORE THAN A PROMISE PILLARS */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h3 className="text-sm font-black text-slate-900 mb-2.5">
          More Than <span className="text-pink-600">A Promise</span>
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-3 flex flex-col items-center text-center">
            <CakeIcon className="w-5 h-5 text-amber-600 mb-1" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
              FRESH BAKED
            </span>
          </div>
          <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-3 flex flex-col items-center text-center">
            <Sparkles className="w-5 h-5 text-rose-600 mb-1" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
              500+ CHOICES
            </span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-3 flex flex-col items-center text-center">
            <Clock className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
              ANYTIME, ON TIME
            </span>
          </div>
        </div>
      </div>

      {/* 5. EXPLORE OUR CAKE COLLECTION (Tabs: Best Sellers vs Signature) */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-lg font-black text-slate-900 mb-3">
          Explore Our <span className="text-pink-600">Cake Collection</span>
        </h2>
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setCollectionTab("bestsellers")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              collectionTab === "bestsellers"
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Best Sellers Cakes
          </button>
          <button
            onClick={() => setCollectionTab("signature")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              collectionTab === "signature"
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Signature Cakes
          </button>
        </div>

        {/* Carousel */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-1">
          {(collectionTab === "bestsellers" ? bestSellers : signatureCakes).map(renderProductCard)}
        </div>
      </div>

      {/* 6. EXPERIENCE OUR ICONIC BAKE (Flavors Grid - Card style with label on photo) */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <h2 className="text-lg font-black text-slate-900 mb-3">
          Experience Our <span className="text-pink-600">Iconic Bake</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {iconicFlavors.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCategory && onSelectCategory(item.id as CategoryID)}
              className="relative h-36 sm:h-40 rounded-2xl overflow-hidden shadow-sm border border-amber-100 cursor-pointer group hover:shadow-md transition-all"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent p-2.5 flex items-end justify-center text-center">
                <span className="text-xs font-black text-white leading-tight drop-shadow-sm group-hover:text-pink-300 transition-colors">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. DUAL PROMO BANNERS (Birthday Bliss & Anniversary - Redesigned) */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Birthday Bliss */}
          <div className="bg-gradient-to-br from-purple-700 via-indigo-600 to-violet-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[170px] border border-purple-400/30">
            <div className="relative z-10 max-w-[210px]">
              <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-sm mb-2 inline-block">
                ✨ Birthday Special
              </span>
              <h3 className="text-xl font-black tracking-tight text-white leading-tight">
                Birthday Bliss
              </h3>
              <p className="text-[11px] text-purple-100 mt-1 font-medium leading-snug">
                Freshly baked cakes designed to make every birthday celebration sweeter.
              </p>
            </div>
            <button
              onClick={() => onSelectCategory && onSelectCategory("birthday")}
              className="mt-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4.5 py-2 rounded-full w-fit shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Explore Birthday Cakes <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="absolute -right-3 -bottom-3 w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-xl transform rotate-6">
              <img
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80"
                alt="Birthday Cake"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Anniversary */}
          <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-amber-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[170px] border border-rose-400/30">
            <div className="relative z-10 max-w-[210px]">
              <span className="text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-950 px-2 py-0.5 rounded-md shadow-sm mb-2 inline-block">
                💖 Pure Love & Romance
              </span>
              <h3 className="text-xl font-black tracking-tight text-white leading-tight">
                Anniversary Specials
              </h3>
              <p className="text-[11px] text-rose-100 mt-1 font-medium leading-snug">
                Celebrate your beautiful journey together with an unforgettable cake.
              </p>
            </div>
            <button
              onClick={() => onSelectCategory && onSelectCategory("anniversary")}
              className="mt-4 bg-white hover:bg-rose-50 text-rose-700 text-xs font-black px-4.5 py-2 rounded-full w-fit shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Shop Anniversary <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="absolute -right-3 -bottom-3 w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-xl transform -rotate-6">
              <img
                src="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80"
                alt="Anniversary Cake"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 8. EVERY SLICE, A CELEBRATION (Tabs: Birthday vs Anniversary) */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-lg font-black text-slate-900 mb-3">
          Every Slice, <span className="text-pink-600">A Celebration</span>
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setSliceTab("birthday")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sliceTab === "birthday"
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Birthday Cakes
          </button>
          <button
            onClick={() => setSliceTab("anniversary")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              sliceTab === "anniversary"
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Anniversary Cakes
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-1">
          {(sliceTab === "birthday" ? birthdayCakes : anniversaryCakes).map(renderProductCard)}
        </div>
      </div>

      {/* 9. YOUR TASTE, YOUR PICK GRID */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full inline-block mb-1">
              CURATED FLAVORS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              Your Taste, <span className="text-pink-600">Your Pick</span>
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-bold hidden sm:inline-block">
            Handcrafted for every craving ✨
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3.5 sm:gap-4">
          {tastePickItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCategory && onSelectCategory(item.id as CategoryID)}
              className="group relative h-36 sm:h-44 md:h-48 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 bg-slate-900"
            >
              {/* Background Image with Zoom */}
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />

              {/* Top Accent Badge */}
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-black/40 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border border-white/20 shadow-xs uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>FLAVOR</span>
                </span>
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3.5 flex flex-col justify-end">
                <p className="text-xs sm:text-sm md:text-base font-black text-white group-hover:text-pink-300 transition-colors line-clamp-1 drop-shadow-sm">
                  {item.name}
                </p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/20 text-[9px] sm:text-[10px] font-extrabold text-pink-200">
                  <span className="tracking-wide uppercase">Explore Cakes</span>
                  <div className="w-5 h-5 rounded-full bg-pink-600/80 group-hover:bg-pink-600 text-white flex items-center justify-center transition-all group-hover:scale-110">
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 11. BENTO CAKE SWEET LITTLE TREATS BANNER */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-100 rounded-3xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=300&q=80"
              alt="Bento Cake"
              className="w-16 h-16 rounded-2xl object-cover shadow-sm"
            />
            <div>
              <span className="text-xs font-black text-pink-600 block">
                Sweet Little Treats
              </span>
              <p className="text-xs font-extrabold text-slate-800 leading-tight">
                Discover Our Lovely Bento Cake Collection
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectCategory && onSelectCategory("bento_cake")}
            className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* 12. YOUR CELEBRATION, YOUR CAKE (Tabs: Photo vs Designer) */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-lg font-black text-slate-900 mb-3">
          Your Celebration, <span className="text-pink-600">Your Cake</span>
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setCelebrationTab("photo")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              celebrationTab === "photo"
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Photo Cakes
          </button>
          <button
            onClick={() => setCelebrationTab("designer")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              celebrationTab === "designer"
                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Designer Cakes
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-1">
          {(celebrationTab === "photo" ? photoCakes : designerCakes).map(renderProductCard)}
        </div>
      </div>

      {/* 13. BEST PICKS FOR CAKES (2-Column Product Grid) */}
      <div id="best-picks-anchor" className="max-w-7xl mx-auto px-4 py-5 scroll-mt-20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-slate-900">
            Best Picks <span className="text-pink-600">For Cakes</span>
          </h2>
          <span className="text-xs font-extrabold text-slate-500">
            {cakeProducts.length} Cakes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cakeProducts.map((p) => {
            const price = p.options?.hasWeightOptions ? getWeightPrice(p, getStartingWeight(p)) : p.price;
            const orig = p.originalPrice || Math.round(price * 1.25);
            const discount = Math.round(((orig - price) / orig) * 100);

            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-2xl border border-slate-100/90 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-50">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-emerald-700/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      Earliest Delivery: Today
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-pink-600 transition-colors">
                      {p.name}
                    </h4>

                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-sm font-black text-slate-900">₹{price}</span>
                      {orig > price && (
                        <span className="text-xs text-slate-400 line-through">₹{orig}</span>
                      )}
                      {discount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ({discount}% Off)
                        </span>
                      )}
                    </div>

                    {p.rating && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center gap-0.5 bg-emerald-700 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          <span>{p.rating.toFixed(1)}</span>
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {p.reviewsCount || 120} Reviews
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
