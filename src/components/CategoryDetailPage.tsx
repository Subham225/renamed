import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Star,
  Zap,
  ShoppingBag,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Package,
  Check,
  Sparkles,
  PhoneCall,
  Share2,
} from "lucide-react";
import {
  Product,
  StoreConfig,
  getWeightPrice,
  getStartingWeight,
  CategoryID,
} from "../types";

interface CategoryDetailPageProps {
  categoryId: string;
  categoryName: string;
  categoryImage?: string;
  products: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory?: (id: CategoryID) => void;
  storeConfig?: StoreConfig;
  isRichLayout?: boolean;
}

export default function CategoryDetailPage({
  categoryId,
  categoryName,
  categoryImage,
  products,
  onBack,
  onSelectProduct,
  onSelectCategory,
  storeConfig,
  isRichLayout = false,
}: CategoryDetailPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "default" | "priceAsc" | "priceDesc" | "rating" | "reviews"
  >("default");
  
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("category", categoryId);
    const shareData = {
      title: `${categoryName} - Rocx Cakes`,
      text: `Explore ${categoryName} from Rocx Cakes in Kharagpur & Midnapore!`,
      url: url.toString(),
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url.toString()).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const pageData = useMemo(() => {
    const data: Record<string, { banner: string; text: string; bgStyle: string; textColor: string; buttonColor: string }> = {
      cakes: {
        banner: "https://images.unsplash.com/photo-1557308536-ee471ef2c390?auto=format&fit=crop&w=1200&q=80",
        text: "Celebrate your special moments with our freshly baked, handcrafted cakes. From classic flavors to custom designs, every slice is a piece of joy.",
        bgStyle: "from-slate-950/90 via-slate-900/60 to-transparent",
        textColor: "text-pink-100",
        buttonColor: "bg-pink-600 hover:bg-pink-700",
      },
      flowers: {
        banner: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80",
        text: "Express your feelings with our premium floral arrangements. Freshly cut, elegantly arranged, and delivered with love.",
        bgStyle: "from-slate-950/90 via-slate-900/60 to-transparent",
        textColor: "text-rose-100",
        buttonColor: "bg-rose-600 hover:bg-rose-700",
      },
      plants: {
        banner: "https://images.unsplash.com/photo-1466692476877-3dfa6406e409?auto=format&fit=crop&w=1200&q=80",
        text: "Bring nature indoors with our eco-conscious decorative plants. Perfect for gifting or purifying your living space.",
        bgStyle: "from-slate-950/90 via-slate-900/60 to-transparent",
        textColor: "text-emerald-100",
        buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      },
      gifts: {
        banner: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=80",
        text: "Find the perfect present for every occasion. Our curated gift hampers are designed to make your loved ones feel truly special.",
        bgStyle: "from-slate-950/90 via-slate-900/60 to-transparent",
        textColor: "text-purple-100",
        buttonColor: "bg-purple-600 hover:bg-purple-700",
      },
      chocolates: {
        banner: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80",
        text: "Indulge in exquisite handcrafted rich cocoa delicacies and truffles. A sweet treat for the sweet tooth.",
        bgStyle: "from-slate-950/90 via-slate-900/60 to-transparent",
        textColor: "text-amber-100",
        buttonColor: "bg-amber-600 hover:bg-amber-700",
      }
    };
    return data[categoryId] || {
      banner: categoryImage || "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80",
      text: `Discover our premium collection of ${categoryName.toLowerCase()}. Crafted with perfection and delivered with care.`,
      bgStyle: "from-slate-950/90 via-slate-900/60 to-transparent",
      textColor: "text-slate-100",
      buttonColor: "bg-slate-800 hover:bg-slate-900",
    };
  }, [categoryId, categoryImage, categoryName]);

  const getSubcategories = (catId: string) => {
    switch (catId) {
      case 'cakes': return storeConfig?.cakeSubcategories || [];
      case 'gifts': 
      case 'personalized_gifts': return storeConfig?.giftSubcategories || [];
      case 'dewali': return storeConfig?.dewaliSubcategories || [];
      case 'rakhi': return storeConfig?.rakhiSubcategories || [];
      case 'photo_to_art': return storeConfig?.photoToArtSubcategories || [];
      case 'hand_crafts': return storeConfig?.handCraftSubcategories || [];
      case 'new_year': return storeConfig?.newYearSubcategories || [];
      default: return [];
    }
  };

  const subs = getSubcategories(categoryId);

  useEffect(() => {
    if (categoryName) {
      document.title = `${categoryName} Delivery in Kharagpur | Rocx Cakes`;
    }
  }, [categoryName, categoryId]);

  // Curated lists
  const cakesWithFlowers = useMemo(() => products.filter(p => p.categories?.includes("cakes_with_flowers") || p.category === "cakes_with_flowers"), [products]);
  const cakesForHim = useMemo(() => products.filter(p => p.categories?.includes("cakes_for_him") || p.category === "cakes_for_him"), [products]);
  const cakesForHer = useMemo(() => products.filter(p => p.categories?.includes("cakes_for_her") || p.category === "cakes_for_her"), [products]);
  
  const flowersWithCakes = useMemo(() => products.filter(p => p.categories?.includes("flowers_with_cakes") || p.category === "flowers_with_cakes"), [products]);
  const flowersWithChocolates = useMemo(() => products.filter(p => p.categories?.includes("flowers_with_chocolates") || p.category === "flowers_with_chocolates"), [products]);


  // Filtering products
  const processedProducts = useMemo(() => {
    // 1. Matches Category
    let list = products.filter((prod) => {
      if (categoryId === "two_hours_delivery") {
        return !!prod.isTwoHourDelivery;
      }
      const directMatch = prod.category === categoryId;
      const secMatch = prod.categories && prod.categories.includes(categoryId);
      return directMatch || secMatch;
    });

    // 2. Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    // 3. Sorting
    if (sortBy !== "default") {
      list.sort((a, b) => {
        const getPrice = (p: Product) =>
          p.options?.hasWeightOptions
            ? getWeightPrice(p, getStartingWeight(p))
            : p.price;

        if (sortBy === "priceAsc") return getPrice(a) - getPrice(b);
        if (sortBy === "priceDesc") return getPrice(b) - getPrice(a);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "reviews")
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        return 0;
      });
    }

    return list;
  }, [products, categoryId, searchQuery, sortBy]);

  const displayedProducts = processedProducts;

  const ProductCard = ({ prod }: { prod: Product; key?: string | number }) => {
    const discount = prod.originalPrice
      ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
      : 0;

    return (
      <div
        id={`product-card-${prod.id}`}
        key={prod.id}
        onClick={() => onSelectProduct(prod)}
        className="bg-white rounded-2xl overflow-hidden border border-slate-100/90 hover:border-slate-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between cursor-pointer text-left h-full"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50 shrink-0">
          <img
            src={prod.image}
            alt={prod.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px] sm:text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase shadow-sm">
              {discount}% OFF
            </span>
          )}
          {prod.adminNote && (
            <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-0.5 shadow-sm uppercase">
              <Zap className="w-2.5 h-2.5 fill-current" /> {prod.adminNote}
            </span>
          )}
        </div>
        
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 t-9 font-semibold text-amber-500">
              <div className="flex items-center bg-amber-50 rounded px-1 sm:px-1.5 py-0.5 border border-amber-100 gap-0.5 text-[9px] sm:text-xs">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>{prod.rating}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-normal">
                ({prod.reviewsCount})
              </span>
            </div>
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-pink-600 transition-colors">
              {prod.name}
            </h4>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1 sm:gap-1.5">
                <span className="text-sm sm:text-base font-black text-slate-950">
                  ₹
                  {prod.options?.hasWeightOptions
                    ? getWeightPrice(prod, getStartingWeight(prod))
                    : prod.price}
                </span>
                {prod.originalPrice && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                    ₹{prod.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-[7.5px] sm:text-[10px] text-pink-500 font-extrabold tracking-wide uppercase mt-0.5">
                Incl. taxes
              </span>
            </div>
            <div className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg sm:rounded-xl transition-all shadow-sm group-hover:shadow-md shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCuratedRow = (title: string, subtitle: string, items: Product[]) => {
    if (items.length === 0) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 w-full border-b border-slate-100 last:border-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>
        <div className="overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 min-w-max sm:min-w-0">
            {items.slice(0, 8).map(prod => (
              <div key={prod.id} className="w-[200px] sm:w-auto h-full">
                <ProductCard prod={prod} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCuratedBanner = (title: string, subtitle: string, items: Product[], bannerImage: string, fallbackBg: string) => {
    if (items.length === 0) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 w-full border-b border-slate-100 last:border-0">
        {/* Banner */}
        <div className="relative w-full h-40 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden mb-8 group shadow-sm">
          {bannerImage ? (
            <img 
              src={bannerImage} 
              alt={title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${fallbackBg}`} />
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 text-white">
            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-md mb-2">{title}</h3>
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white/90 uppercase">{subtitle}</p>
          </div>
        </div>

        {/* Products */}
        <div className="overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 min-w-max sm:min-w-0">
            {items.slice(0, 8).map(prod => (
              <div key={prod.id} className="w-[200px] sm:w-auto h-full">
                <ProductCard prod={prod} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const isMainCategory = isRichLayout && ["cakes", "flowers", "plants", "gifts", "personalized_gifts", "chocolates", "combos", "anniversary"].includes(categoryId);

  return (
    <div className="w-full bg-slate-50 min-h-screen flex flex-col">
      <Helmet>
        <title>{categoryName} - Rocx Cakes</title>
      </Helmet>

      {isMainCategory ? (
        <>
          {/* Hero Banner Section */}
          <div className="relative w-full h-[250px] sm:h-[350px] overflow-hidden">
            <img src={pageData.banner} alt={categoryName} className="w-full h-full object-cover object-center" />
            <div className={`absolute inset-0 bg-gradient-to-t ${pageData.bgStyle}`} />
            
            {/* Navigation Over Banner */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-black text-white hover:text-white/80 transition-colors uppercase tracking-wider bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-black text-white hover:text-white/80 transition-colors uppercase tracking-wider bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm border border-white/10"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" /> Share
                  </>
                )}
              </button>
            </div>

            {/* Banner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 mt-8">
              <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight mb-4 drop-shadow-sm">
                {categoryName}
              </h1>
              <p className={`text-sm sm:text-base font-bold ${pageData.textColor} max-w-2xl drop-shadow-sm`}>
                {pageData.text}
              </p>
            </div>
          </div>

          {/* Subcategories Grid */}
          {subs.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 py-10 w-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Types of {categoryName}</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Explore Collections</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subs.map((sub, i) => (
                  <div 
                    key={sub.id || i}
                    onClick={() => onSelectCategory?.(sub.id as CategoryID)}
                    className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 relative">
                      {sub.image ? (
                        <img 
                          src={sub.image} 
                          alt={sub.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <Sparkles className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>
                    <h4 className="text-center font-extrabold text-xs sm:text-sm text-slate-800 leading-tight group-hover:text-pink-600 transition-colors">
                      {sub.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPECIAL CURATED SECTIONS FOR CAKES */}
          {categoryId === 'cakes' && (
            <div className="w-full bg-white">
              {renderCuratedRow("Cakes with Flowers", "Perfect Combos", cakesWithFlowers)}
              {renderCuratedBanner(
                "Cakes For Him", 
                "The finest selections for him", 
                cakesForHim, 
                storeConfig?.cakesForHimBannerImage || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
                "from-slate-800 to-slate-900"
              )}
              {renderCuratedBanner(
                "Cakes For Her", 
                "Elegant and sweet just like her", 
                cakesForHer, 
                storeConfig?.cakesForHerBannerImage || "https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?auto=format&fit=crop&w=1200&q=80",
                "from-pink-500 to-pink-700"
              )}
            </div>
          )}

          {/* SPECIAL CURATED SECTIONS FOR FLOWERS */}
          {categoryId === 'flowers' && (
            <div className="w-full bg-white">
              {renderCuratedRow("Flowers with Cakes", "A Complete Surprise", flowersWithCakes)}
              {renderCuratedRow("Flowers with Chocolates", "Sweet & Romantic", flowersWithChocolates)}
            </div>
          )}
        </>
      ) : null}

      {/* Products Section Header & Filters */}
      <div className={`max-w-7xl mx-auto px-4 w-full ${isMainCategory ? 'pt-8' : 'pt-4'}`}>
        {!isMainCategory && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-pink-600 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-pink-600 transition-colors uppercase tracking-wider"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" /> Copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Share
                </>
              )}
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              All {categoryName}
              <span className="text-[10px] bg-slate-200 text-slate-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {processedProducts.length} Items
              </span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="default">Sort: Recommended</option>
                <option value="priceAsc">Price Tags: Low to High (₹)</option>
                <option value="priceDesc">Price Tags: High to Low (₹)</option>
                <option value="rating">User Ratings: Stars ⭐</option>
                <option value="reviews">Popular Choice: Reviews Count</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Products Listing */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full flex-1">
        {processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-3">
            <Package className="w-12 h-12 text-slate-300 animate-pulse" />
            <div>
              <h5 className="font-black text-slate-800 text-sm uppercase">
                No Products Match Filters
              </h5>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                We couldn't locate any products in {categoryName} matching your active terms.
              </p>
            </div>
            {(searchQuery || sortBy !== "default") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("default");
                }}
                className="px-4 py-2 bg-slate-900 text-white font-extrabold text-[10px] uppercase rounded-full tracking-wide"
              >
                Clear Active Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((prod) => (
                <ProductCard key={prod.id} prod={prod} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trust Bullet banner explicitly customized to the separate view to preserve brand depth */}
      <section className="bg-slate-900 text-white py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">🌱</span>
            <h6 className="font-black text-xs uppercase text-slate-100">
              Pure Veg Options
            </h6>
            <p className="text-[10px] text-slate-400">
              100% Certified pure eggless bakes available
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">🚙</span>
            <h6 className="font-black text-xs uppercase text-slate-100">
              Sanitized Delivery
            </h6>
            <p className="text-[10px] text-slate-400">
              Trained riders execute drop-offs safely
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">💖</span>
            <h6 className="font-black text-xs uppercase text-slate-100">
              Quality Assured
            </h6>
            <p className="text-[10px] text-slate-400">
              Premium materials and fresh ingredients guaranteed
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl">⚡</span>
            <h6 className="font-black text-xs uppercase text-slate-100">
              Timely Delivery
            </h6>
            <p className="text-[10px] text-slate-400">
              We ensure your gifts reach on time, every time
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
