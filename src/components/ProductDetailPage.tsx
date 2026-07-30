import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  ArrowRight,
  Star,
  Heart,
  CheckCircle,
  ArrowLeft,
  Truck,
  Zap,
  Moon,
  Upload,
  MessageSquare,
  ShoppingBag,
  Share2,
  Check,
} from "lucide-react";
import {
  Product,
  CartItem,
  getWeightPrice,
  getEgglessOffset,
  compressImageFile,
  isBentoCakeProduct,
  StoreConfig,
  sortWeights,
} from "../types";
import { CATEGORIES } from "../data";

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  storeConfig: StoreConfig;
  onBack: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  onBuyNow: (cartItem: CartItem) => void;
  onSelectProduct: (prod: Product) => void;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
}

// Custom curated fake Indian names list for Google Reviews matching user mandate
const FAKE_INDIAN_REVIEWS = [
  {
    author: "Amit Sharma",
    city: "Kharagpur",
    rating: 5,
    date: "Yesterday",
    text: "Darun tasty! Ordered the chocolate ganache cake. The strawberry glaze was extremely fresh and glossy, and the layers were incredibly moist. Delivered extremely fast as promised.",
    avatarColor: "bg-emerald-100 text-emerald-800",
  },
  {
    author: "Priyanka Patel",
    city: "Mumbai",
    rating: 5,
    date: "4 days ago",
    text: "Baked with pure care. The eggless customization is 100% genuine. My kids loved the rich butter cream and the classy packaging. Definitely placing my next orders here!",
    avatarColor: "bg-pink-100 text-pink-800",
  },
  {
    author: "Anirban Mukhopadhyay",
    city: "Kharagpur",
    rating: 5,
    date: "1 week ago",
    text: "Ordered the Red Velvet heart base. Absolutely beautiful velvet crumbs and super rich premium cream cheese. High quality same day delivery experience.",
    avatarColor: "bg-indigo-100 text-indigo-800",
  },
  {
    author: "Shreya Iyer",
    city: "Bangalore",
    rating: 5,
    date: "2 weeks ago",
    text: "Extremely fresh quality! Best English butterscotch dessert ever! The caramelized praline crunch was so sweet. Highly satisfied with ROCX service.",
    avatarColor: "bg-amber-100 text-amber-800",
  },
  {
    author: "Vikram Malhotra",
    city: "Delhi",
    rating: 4,
    date: "3 weeks ago",
    text: "Excellent fast shipping options, and great presentation. The message scroll card looked beautiful and handwritten. Will recommend to all my relatives.",
    avatarColor: "bg-purple-100 text-purple-800",
  },
];

export default function ProductDetailPage({
  product,
  allProducts,
  storeConfig,
  onBack,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  wishlistIds = [],
  onToggleWishlist,
}: ProductDetailPageProps) {
  // Custom states for configuration
  const currentWeights = React.useMemo(() => {
    const baseWeights =
      product.allowedWeights && product.allowedWeights.length > 0
        ? product.allowedWeights
        : isBentoCakeProduct(product)
          ? ["250g"]
          : product.id.includes("photo") ||
              product.name.toLowerCase().includes("photo")
            ? ["0.5 Kg", "1.0 Kg"]
            : ["0.5 Kg", "1.0 Kg", "1.5 Kg", "2.0 Kg", "2.5 Kg", "3.0 Kg"];
    return sortWeights(baseWeights);
  }, [product]);

  const [weight, setWeight] = useState<string>(
    () => currentWeights[0] || "1.0 Kg",
  );
  const [isEggless, setIsEggless] = useState<boolean>(false);
  const [selectedPot, setSelectedPot] = useState<string>("Mint Ceramic");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeDescTab, setActiveDescTab] = useState<
    "about" | "delivery" | "description"
  >("about");
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("product", product.id);
    const shareData = {
      title: `${product.name} - Rocx Cakes`,
      text: `Order ${product.name} from Rocx Cakes in Kharagpur & Midnapore!`,
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

  // Reset local states when active details product switches
  useEffect(() => {
    setWeight(currentWeights[0] || "1.0 Kg");
    setIsEggless(false);
    setSelectedPot("Mint Ceramic");
    setCustomMessage("");
    setPhotoUrl("");
    setActiveImageIndex(0);
    setActiveDescTab("about");
    setIsDescExpanded(false);
    // Scroll page to top to read comfortably
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [product, currentWeights]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPosition = target.scrollLeft;
    const itemWidth = target.clientWidth;
    const newIndex = Math.round(scrollPosition / itemWidth);
    if (newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
    }
  };

  // Calculate customized final dynamic price
  let finalPrice = product.price;
  if (isBentoCakeProduct(product)) {
    finalPrice = isEggless ? 350 : 299;
  } else {
    if (product.options?.hasWeightOptions) {
      finalPrice = getWeightPrice(product, weight);
    }
    if (product.options?.hasEgglessOption && isEggless) {
      finalPrice += getEgglessOffset(weight, product);
    }
  }

  // Handle local picture uploads with compression for database safety
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Rocx Cakes Kharagpur & Midnapore`;
    }
    return () => {
      document.title =
        "Rocx Cakes & Gifts | Premium Cakes & Customized Bouquets in Kharagpur & Midnapore";
    };
  }, [product]);

  const handlePhotoLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      compressImageFile(file)
        .then((compressedDataUrl) => {
          setPhotoUrl(compressedDataUrl);
        })
        .catch((err) => {
          console.error("Photo compression failed:", err);
        });
    }
  };

  const createConfiguredItem = (): CartItem => {
    const configId = `${product.id}_w:${weight}_e:${isEggless}_p:${selectedPot}_msg:${customMessage.substring(0, 8)}_img:${photoUrl ? "yes" : "no"}`;
    return {
      id: configId,
      product,
      quantity: 1,
      selectedWeight: product.options?.hasWeightOptions ? weight : undefined,
      isEggless: product.options?.hasEgglessOption ? isEggless : undefined,
      selectedPot: product.options?.hasPotOptions ? selectedPot : undefined,
      customMessage: product.options?.hasMessageOption
        ? customMessage
        : undefined,
      uploadedPhotoUrl: photoUrl || undefined,
      deliveryType:
        product.isTwoHourDelivery ||
        product.category === "two_hours_delivery" ||
        product.categories?.includes("two_hours_delivery")
          ? "express"
          : "standard",
    };
  };

  const handleAddClick = () => {
    onAddToCart(createConfiguredItem());
  };

  const handleBuyNowClick = () => {
    onBuyNow(createConfiguredItem());
  };

  // Find related "More Addons" (all other cakes or items in current selection category)
  const relatedAddons = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 6); // Limit to 6 addons per instruction

  const isFlower =
    product.category === "flowers" || product.category.includes("flower");
  const isPlant =
    product.category === "plants" || product.category.includes("plant");

  // Calculate categoryReviews
  const categoryReviewsList = (
    storeConfig?.categoryReviews?.[product.category] ||
    storeConfig?.categoryReviews?.["default"] ||
    FAKE_INDIAN_REVIEWS
  ).slice(0, 4);

  const colorsList = [
    "bg-amber-100 text-amber-800",
    "bg-blue-100 text-blue-800",
    "bg-emerald-100 text-emerald-800",
    "bg-purple-100 text-purple-800",
  ];

  const categoryObj = CATEGORIES.find((c) => c.id === product.category);
  const derivedCategoryName = categoryObj
    ? categoryObj.name
    : product.category
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

  const headerLabel =
    product.category.toLowerCase() === "flowers" ||
    product.category.toLowerCase().includes("flower")
      ? "Premium Fresh Blooms Boutique"
      : `${derivedCategoryName} Collection`;

  const headerEmoji =
    product.category.toLowerCase() === "cakes" ||
    product.category.toLowerCase().includes("cake")
      ? "🎂"
      : product.category.toLowerCase() === "flowers" ||
          product.category.toLowerCase().includes("flower")
        ? "🌸"
        : product.category.toLowerCase() === "plants" ||
            product.category.toLowerCase().includes("plant")
          ? "🌿"
          : "🎁";

  const ogImageUrl = product.image.startsWith('data:image/') 
    ? `${window.location.origin}/api/og-image?product=${product.id}` 
    : product.image;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 select-none animate-fadeIn">
      <Helmet>
        <title>{product.name} | Rocx Cakes</title>
        <meta property="og:title" content={product.name} />
        <meta
          property="og:description"
          content={
            product.description ||
            "Order premium customized cakes and gifts from Rocx Cakes."
          }
        />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="twitter:image" content={ogImageUrl} />
      </Helmet>
      {/* Top sticky action navbar matching screenshot styling */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-pink-600 cursor-pointer p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </button>

          <span className="text-[10px] font-black tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full uppercase">
            {headerLabel}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1 w-8 h-8 md:w-auto md:px-3 md:py-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
            >
              {isCopied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">
                {isCopied ? "Copied" : "Share"}
              </span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black">
              {headerEmoji}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {/* Detail overview panel */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2">
          {/* Column 1: Image container */}
          <div className="relative bg-slate-100/40 p-3 sm:p-4 md:p-6 flex flex-col gap-3 md:gap-4 border-b md:border-b-0 md:border-r border-slate-100">
            {/* Main Image Slider */}
            <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-inner border border-slate-200/60 bg-white relative group">
              <div
                className="w-full h-full flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const slideWidth = target.offsetWidth;
                  const index = Math.round(target.scrollLeft / slideWidth);
                  if (activeImageIndex !== index) setActiveImageIndex(index);
                }}
              >
                {[product.image, ...(product.images || [])].map((imgUrl, i) => (
                  <div
                    key={i}
                    className="min-w-full min-h-full snap-start snap-always shrink-0"
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} - slide ${i + 1}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/logo.png";
                      }}
                      className="w-full h-full object-contain bg-white object-center"
                    />
                  </div>
                ))}
              </div>

              {/* Dot Indicators */}
              {product.images && product.images.length > 0 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                  {[product.image, ...product.images].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${activeImageIndex === i ? "w-4 bg-pink-500" : "w-1.5 bg-white/80"}`}
                    />
                  ))}
                </div>
              )}

              {/* Floating rating badge */}
              <div className="absolute top-3 left-3 bg-slate-900/90 text-white font-extrabold text-[10px] py-1 px-2.5 rounded-lg flex items-center gap-1 backdrop-blur-xs z-10 pointer-events-none">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{product.rating} Star</span>
              </div>

              {/* Wishlist Button On Image */}
              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-slate-800 rounded-full shadow-md backdrop-blur transition-all z-10"
                >
                  <Heart
                    className={`w-5 h-5 ${wishlistIds.includes(product.id) ? "fill-pink-500 text-pink-500" : "text-slate-400 hover:text-pink-500"}`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Column 2: Customizer Details */}
          <div className="p-4 sm:p-6 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-pink-600 uppercase bg-pink-50 px-2 py-1 rounded-lg">
                  {product.category.replace("_", " ")}
                </span>
                {product.options?.hasEgglessOption && (
                  <div
                    className={`flex items-center gap-1 border px-2 py-0.5 rounded-full select-none shrink-0 ${isEggless ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                  >
                    <div
                      className={`w-2.5 h-2.5 border flex items-center justify-center rounded-xs bg-white shrink-0 ${isEggless ? "border-emerald-600" : "border-rose-600"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${isEggless ? "bg-emerald-600" : "bg-rose-600"}`}
                      ></div>
                    </div>
                    <span
                      className={`text-[9px] font-black tracking-wide uppercase leading-none ${isEggless ? "text-emerald-800" : "text-rose-800"}`}
                    >
                      {isEggless
                        ? "Eggless Variant Selected"
                        : "Eggless Variant Available"}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-black text-slate-950 mt-2.5 mb-1 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-1">
                <span className="text-amber-500 flex items-center">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline mr-0.5" />
                  {product.rating}
                </span>
                <span>•</span>
                <span className="underline">
                  {product.reviewsCount} verified reviews
                </span>
              </div>

              {/* Enhanced Elegant Dynamic Price Tag below rating */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-950">
                  ₹{finalPrice}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-450 line-through font-semibold">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-[9.5px] font-black text-pink-600 bg-pink-50/80 border border-pink-100 py-0.5 px-2.5 rounded-md uppercase">
                  Incl. Taxes
                </span>
              </div>
            </div>

            {product.adminNote && (
              <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-3.5 flex gap-2.5 items-start text-left">
                <span className="text-base select-none shrink-0 mt-0.5">
                  📢
                </span>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black tracking-widest text-pink-600 uppercase block">
                    Special Delivery Note
                  </span>
                  <p className="text-xs font-semibold text-pink-950 leading-relaxed whitespace-pre-wrap">
                    {product.adminNote}
                  </p>
                </div>
              </div>
            )}

            {/* Sizes selector */}
            {product.options?.hasWeightOptions && (
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-slate-800 block">
                  Select Cake Weight/Size
                </span>
                <div className="grid grid-cols-3 gap-1.5 font-sans">
                  {currentWeights.map((w) => (
                    <button
                      id={`page-weight-option-${w.replace(" ", "")}`}
                      key={w}
                      onClick={() => setWeight(w)}
                      className={`py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                        weight === w
                          ? "bg-pink-50 border-pink-500 text-pink-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-extrabold">{w}</div>
                      <span className="text-[8.5px] font-black text-pink-600 block -mt-0.5">
                        ₹
                        {isBentoCakeProduct(product)
                          ? isEggless
                            ? 350
                            : 299
                          : getWeightPrice(product, w)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Eggless options */}
            {product.options?.hasEgglessOption && (
              <div>
                <label className="flex items-center gap-3 bg-amber-50/20 border border-amber-100/40 rounded-xl p-3 cursor-pointer hover:bg-amber-50/40 transition-colors select-none">
                  <input
                    id="page-eggless-checkbox"
                    type="checkbox"
                    checked={isEggless}
                    onChange={(e) => setIsEggless(e.target.checked)}
                    className="w-4 h-4 text-pink-600 bg-gray-150 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <div className="text-left font-sans">
                    <span className="text-xs font-bold text-slate-800 block">
                      Eggless Variant (+ ₹
                      {isBentoCakeProduct(product)
                        ? 51
                        : getEgglessOffset(weight, product)}
                      )
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Pure separate ovens guaranteed for {weight} size
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* MESSAGE SCROLL BOX */}
            {product.options?.hasMessageOption && (
              <div className="space-y-1 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    Custom Greeting Message on Cake/Card
                  </span>
                  <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Free Card
                  </span>
                </div>
                <textarea
                  id="page-message-textarea"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="E.g. Wish you a very Blessed Birthday Dipankar! Live long."
                  rows={2}
                  maxLength={180}
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-pink-500 focus:outline-none"
                />
              </div>
            )}

            {/* PHOTO UPLOADING FOR PERSONALIZED OR PHOTO PRODUCTS */}
            {(product.options?.hasPhotoUpload ||
              product.id.toLowerCase().includes("photo") ||
              product.name.toLowerCase().includes("photo")) && (
              <div className="space-y-2 font-sans text-left">
                <span className="text-xs font-extrabold text-slate-800 block">
                  Upload Photo for Personalization
                </span>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoLoad}
                  accept="image/*"
                  className="hidden"
                />

                {!photoUrl ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        compressImageFile(file)
                          .then((compressedDataUrl) => {
                            setPhotoUrl(compressedDataUrl);
                          })
                          .catch((err) => {
                            console.error("Photo compression failed:", err);
                          });
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-pink-500 bg-pink-50/50"
                        : "border-slate-200 bg-slate-50/30 hover:bg-slate-50/80 hover:border-pink-300"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Upload className="w-5 h-5 text-pink-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-700">
                        Click to upload or drag picture here
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-medium">
                        JPEG, PNG accepted (Max 15MB)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-250 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wide block leading-none mb-1">
                          ✓ Photo Uploaded Successfully!
                        </span>
                        <span className="text-[9.5px] text-emerald-750 font-bold leading-normal block">
                          Your physical photograph is uploaded & securely
                          attached. It will show up on review at checkout!
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl("");
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-[10px] font-bold text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors uppercase shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Buy Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100 font-sans">
              <button
                id="add-to-cart-page-button"
                onClick={handleAddClick}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-black py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-pink-500" />
                <span>Add To Cart</span>
              </button>

              <button
                id="buy-now-page-button"
                onClick={handleBuyNowClick}
                className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-pink-100 active:scale-95 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Product Tabs Container */}
            <div className="pt-3 border-t border-slate-50">
              <div className="flex bg-slate-100/60 p-1 rounded-xl mb-3">
                <button
                  onClick={() => {
                    setActiveDescTab("about");
                    setIsDescExpanded(false);
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    activeDescTab === "about"
                      ? "bg-white shadow-sm text-pink-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => {
                    setActiveDescTab("delivery");
                    setIsDescExpanded(false);
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    activeDescTab === "delivery"
                      ? "bg-white shadow-sm text-pink-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Delivery & Care
                </button>
                <button
                  onClick={() => {
                    setActiveDescTab("description");
                    setIsDescExpanded(false);
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                    activeDescTab === "description"
                      ? "bg-white shadow-sm text-pink-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Description
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/50 relative">
                {(() => {
                  let content = "";
                  if (activeDescTab === "about") {
                    content =
                      product.aboutProduct ||
                      "Discover our premium quality and exquisite craftsmanship carefully prepared for you.";
                  } else if (activeDescTab === "delivery") {
                    content =
                      product.deliveryCare ||
                      "Store in a cool, dry place. Hand-delivered with utmost care to maintain freshness and presentation.";
                  } else {
                    content =
                      product.description || "No description available.";
                  }

                  const isLong =
                    content.split("\n").length > 12 || content.length > 250;

                  return (
                    <>
                      <div
                        className={`whitespace-pre-wrap ${!isDescExpanded && isLong ? "line-clamp-[12]" : ""}`}
                      >
                        {content}
                      </div>
                      {isLong && (
                        <button
                          onClick={() => setIsDescExpanded(!isDescExpanded)}
                          className="text-[10px] uppercase font-black text-pink-500 hover:text-pink-600 mt-2 tracking-wider inline-flex items-center gap-1"
                        >
                          {isDescExpanded ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* MORE ADDONS section containing other relateable products */}
        {relatedAddons.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-wide flex items-center gap-1">
                <span>➕ More Delicious Addons</span>
                <span className="text-[9.5px] bg-pink-100 text-pink-700 py-0.5 px-2 rounded-full uppercase">
                  Recommend
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedAddons.map((addon) => (
                <div
                  key={addon.id}
                  onClick={() => onSelectProduct(addon)}
                  className="bg-white rounded-2xl p-2.5 border border-slate-100 hover:border-pink-300 hover:shadow-xs transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-95 select-none"
                >
                  <div className="space-y-1.5">
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-50 relative border border-slate-200/50">
                      <img
                        src={addon.image}
                        alt={addon.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/logo.png";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1 right-1 bg-slate-900/85 text-[8.5px] font-black text-amber-500 px-1.5 py-0.5 rounded-md flex items-center">
                        ★ {addon.rating}
                      </span>
                    </div>

                    <h4 className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">
                      {addon.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-50">
                    <span className="text-xs font-extrabold text-slate-950">
                      ₹{addon.price}
                    </span>
                    <span className="text-[9px] font-bold text-pink-500 border border-pink-100 group-hover:bg-pink-500 group-hover:text-white px-1.5 py-0.5 rounded transition-colors uppercase">
                      Select
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GOOGLE FAKE INDIAN REVIEWS SECTION */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center gap-2.5">
              {/* Multicolor Authentic Google Logo SVG */}
              <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.77-.07-1.54-.2-2.27H12v4.51h6.6c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.68-5.17 3.68-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A11.97 11.97 0 0 0 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29A7.18 7.18 0 0 1 4.9 12c0-.8.14-1.58.37-2.29V6.6H1.29A11.95 11.95 0 0 0 0 12c0 1.92.45 3.74 1.29 5.4l3.98-3.11z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.35 2.65 1.29 6.6l3.98 3.11c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight flex items-center gap-1">
                  Google Client Reviews
                </h3>
                <p className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 mt-0.5">
                  <span>Rating: 4.9 / 5.0</span>
                  <span className="text-[#F4B400] font-sans">★★★★★</span>
                </p>
              </div>
            </div>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50/50 border border-blue-100 px-2 py-0.5 rounded">
              Google Business Profile
            </span>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {categoryReviewsList.map((rev: any, idx: number) => (
              <div
                key={idx}
                className={`pt-4 ${idx === 0 ? "pt-0" : ""} space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${rev.avatarColor || colorsList[idx % colorsList.length]}`}
                    >
                      {rev.name
                        ? rev.name.charAt(0)
                        : rev.author
                          ? rev.author.charAt(0)
                          : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-slate-800">
                          {rev.name || rev.author}
                        </span>
                        <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-50 shrink-0" />
                      </div>
                      <span className="text-[9px] text-[#F4B400] font-bold uppercase tracking-widest flex items-center gap-1">
                        ★ Local Guide
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[#F4B400] font-extrabold text-[10px] block font-sans tracking-xs">
                      {"★".repeat(rev.rating)}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {rev.date || "Recent"}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed font-semibold pl-9 italic">
                  "{rev.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
