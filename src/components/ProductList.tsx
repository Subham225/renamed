import { useMemo, useState } from "react";
import {
  Star,
  Zap,
  ShoppingBag,
  Leaf,
  Heart,
  Sparkles,
  Check,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  Product,
  StoreConfig,
  getWeightPrice,
  getStartingWeight,
} from "../types";
import CakeGallery from "./CakeGallery";
import ScrollReveal from "./ScrollReveal";
import OrderTimer from "./OrderTimer";

interface ProductListProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  selectedCategoryName: string;
  onSelectCategory?: (id: string | null) => void;
  storeConfig?: StoreConfig;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
}

// 4 Cake Sub-categories
const CAKE_SUBCATEGORIES = [
  {
    id: "photo_cake",
    name: "Photo Cake",
    image:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=400&q=80",
    tag: "Custom Edible Print",
  },
  {
    id: "bento_cake",
    name: "Bento Cake",
    image:
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=400&q=80",
    tag: "Mini Aesthetic",
  },
  {
    id: "pinata_cake",
    name: "Pinata Cake",
    image:
      "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80",
    tag: "Hammer Surprise",
  },
  {
    id: "kids_cake",
    name: "Kids Cake",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80",
    tag: "Fun Theme Designs",
  },
];

// 4 Gifts & Combos Sub-categories
const GIFT_SUBCATEGORIES = [
  {
    id: "flower_combos",
    name: "Flower Combos",
    image:
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80",
    tag: "Blooms & Chocolates",
  },
  {
    id: "cake_combos",
    name: "Cake Combos",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
    tag: "Dessert & Toy Kits",
  },
  {
    id: "chocolate_flower",
    name: "Chocolate & Flower",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80",
    tag: "Sweetest Greetings",
  },
  {
    id: "personalised_combos",
    name: "Personalised Combos",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=400&q=80",
    tag: "Custom Photo Gifts",
  },
];

const DEWALI_SUBCATEGORIES = [
  {
    id: "special_chocolate",
    name: "Special Chocolate",
    image:
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80",
    tag: "Festive Treats",
  },
  {
    id: "sweets",
    name: "Sweets",
    image:
      "https://images.unsplash.com/photo-1599598425947-33004a43b248?auto=format&fit=crop&w=400&q=80",
    tag: "Traditional Joy",
  },
  {
    id: "dryfruits",
    name: "Dry Fruits",
    image:
      "https://images.unsplash.com/photo-1593955610816-568377e8ea69?auto=format&fit=crop&w=400&q=80",
    tag: "Healthy Gifting",
  },
  {
    id: "diya_candle",
    name: "Diya & Candles",
    image:
      "https://images.unsplash.com/photo-1533088034057-0ae6b90de25f?auto=format&fit=crop&w=400&q=80",
    tag: "Light & Prosperity",
  },
];

const RAKHI_SUBCATEGORIES = [
  {
    id: "rakhi_dryfruits",
    name: "Rakhi & Dryfruits",
    image:
      "https://images.unsplash.com/photo-1593955610816-568377e8ea69?auto=format&fit=crop&w=400&q=80",
    tag: "Healthy Assortment",
  },
  {
    id: "bhai_vhabi_rakhi",
    name: "Bhai & Vhabi Rakhi",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=400&q=80",
    tag: "Couple Pairings",
  },
  {
    id: "rakhi_sweets",
    name: "Rakhi With Sweets",
    image:
      "https://images.unsplash.com/photo-1599598425947-33004a43b248?auto=format&fit=crop&w=400&q=80",
    tag: "Sweet Bonding",
  },
  {
    id: "rakhi_chocolate",
    name: "Rakhi With Chocolate",
    image:
      "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80",
    tag: "Choco Delight",
  },
];

const PHOTO_TO_ART_SUBCATEGORIES = [
  {
    id: "water_colour",
    name: "Water Colour",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80",
    tag: "Vibrant Splashes",
  },
  {
    id: "oil_painting",
    name: "Oil Painting",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80",
    tag: "Classic Strokes",
  },
  {
    id: "sketch",
    name: "Sketch",
    image:
      "https://images.unsplash.com/photo-1510912196160-58c03dc80a6b?auto=format&fit=crop&w=400&q=80",
    tag: "Pencil Masters",
  },
  {
    id: "acrylic",
    name: "Acrylic",
    image:
      "https://images.unsplash.com/photo-1581452695505-1a87e596bb5d?auto=format&fit=crop&w=400&q=80",
    tag: "Bold Textures",
  },
];

const HAND_CRAFT_SUBCATEGORIES = [
  {
    id: "key_ring",
    name: "Key Ring",
    image:
      "https://images.unsplash.com/photo-1620002167195-d2274b5952f4?auto=format&fit=crop&w=400&q=80",
    tag: "Custom Charms",
  },
  {
    id: "jewellery",
    name: "Jewellery",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80",
    tag: "Handmade Elegance",
  },
  {
    id: "clay_art",
    name: "Clay Art",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
    tag: "Molded Decor",
  },
  {
    id: "resin_art",
    name: "Resin Art",
    image:
      "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=400&q=80",
    tag: "Glossy Keepsakes",
  },
];

// Static catalogs now imported directly from src/data.ts above

export default function ProductList({
  products,
  onSelectProduct,
  selectedCategoryName,
  onSelectCategory,
  storeConfig,
  wishlistIds = [],
  onToggleWishlist,
}: ProductListProps) {
  // Check if we are showing the default multi-section landing view
  const isDefaultLanding =
    selectedCategoryName === "⚡ Premium Best Sellers" ||
    selectedCategoryName === "All" ||
    !selectedCategoryName;

  const displayedCakeSubcategories =
    storeConfig?.cakeSubcategories || CAKE_SUBCATEGORIES;
  const displayedGiftSubcategories =
    storeConfig?.giftSubcategories || GIFT_SUBCATEGORIES;
  const displayedDewaliSubcategories =
    storeConfig?.dewaliSubcategories || DEWALI_SUBCATEGORIES;
  const displayedRakhiSubcategories =
    storeConfig?.rakhiSubcategories || RAKHI_SUBCATEGORIES;
  const displayedPhotoToArtSubcategories =
    storeConfig?.photoToArtSubcategories || PHOTO_TO_ART_SUBCATEGORIES;
  const displayedHandCraftSubcategories =
    storeConfig?.handCraftSubcategories || HAND_CRAFT_SUBCATEGORIES;
  const displayedNewYearSubcategories =
    storeConfig?.newYearSubcategories || [
      { id: "new_year_cakes", name: "New Year Cakes", image: "https://images.unsplash.com/photo-1546272989-40c92939c6c2?auto=format&fit=crop&w=400&q=80", tag: "Midnight Surprises" },
      { id: "new_year_flowers", name: "Festive Flowers", image: "https://images.unsplash.com/photo-1482355348030-c3d6232d3bfa?auto=format&fit=crop&w=400&q=80", tag: "Fresh Starts" },
      { id: "new_year_combos", name: "Party Combos", image: "https://images.unsplash.com/photo-1512413914619-2166eb8ce429?auto=format&fit=crop&w=400&q=80", tag: "Joyful Kits" },
      { id: "new_year_gifts", name: "Special Gifts", image: "https://images.unsplash.com/photo-1511268559489-34b624eaf815?auto=format&fit=crop&w=400&q=80", tag: "Memorable Presents" }
    ];

  const [randomOrderMap] = useState(() => new Map<string, number>());

  // Shuffle general products so it changes on every reload
  const sortedProductsToDisplay = useMemo(() => {
    return [...products].sort((a, b) => {
      if (!randomOrderMap.has(a.id)) randomOrderMap.set(a.id, Math.random());
      if (!randomOrderMap.has(b.id)) randomOrderMap.set(b.id, Math.random());
      return randomOrderMap.get(a.id)! - randomOrderMap.get(b.id)!;
    });
  }, [products, randomOrderMap]);

  // Filter cakes (8) and flowers (8) from sorted active catalog
  const cakes = useMemo(() => {
    return sortedProductsToDisplay
      .filter((p) => p.category === "cakes")
      .slice(0, 8);
  }, [sortedProductsToDisplay]);

  const flowers = useMemo(() => {
    return sortedProductsToDisplay
      .filter((p) => p.category === "flowers")
      .slice(0, 8);
  }, [sortedProductsToDisplay]);

  const renderProductCard = (prod: Product) => {
    // Calculate discount percentage if originalPrice exists
    const discount = prod.originalPrice
      ? Math.round(
          ((prod.originalPrice - prod.price) / prod.originalPrice) * 100,
        )
      : 0;

    return (
      <div
        id={`product-card-${prod.id}`}
        key={prod.id}
        onClick={() => onSelectProduct(prod)}
        className="bg-white rounded-2xl overflow-hidden border border-slate-100/80 hover:border-slate-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between cursor-pointer text-left"
      >
        {/* Image Section */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
          <img
            src={prod.image}
            alt={prod.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";
            }}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          />
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-600 text-white text-[8px] sm:text-[10px] font-black tracking-wider px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md uppercase">
              {discount}% OFF
            </span>
          )}
          {/* Admin Note Badge (Replaced Same Day Delivery) */}
          {prod.adminNote && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 bg-emerald-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-0.5 sm:gap-1 shadow-sm uppercase">
              <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" />{" "}
              {prod.adminNote}
            </span>
          )}
          {/* Wishlist Heart */}
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(prod.id);
              }}
              className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 p-1.5 bg-white/60 hover:bg-white backdrop-blur-sm shadow-sm rounded-full transition-all"
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 transition-colors ${wishlistIds.includes(prod.id) ? "fill-pink-500 text-pink-500" : "text-slate-400 hover:text-pink-500"}`}
              />
            </button>
          )}
        </div>

        {/* Info Section */}
        <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between gap-2 sm:gap-3">
          <div className="space-y-1">
            {/* Rating and Reviews */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs text-amber-500 font-semibold">
              <div className="flex items-center bg-amber-50 rounded px-1 sm:px-1.5 py-0.5 border border-amber-100 gap-0.5">
                <Star className="w-2.5 h-2.5 sm:w-1.5 sm:h-1.5 fill-current" />
                <span>{prod.rating}</span>
              </div>
              <span className="text-slate-400 font-normal">
                ({prod.reviewsCount})
              </span>
            </div>

            {/* Product Name */}
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">
              {prod.name}
            </h4>
          </div>

          <div className="flex items-end justify-between mt-0.5 sm:mt-1">
            {/* Price Tag */}
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

            {/* Quick Add Button */}
            <button
              id={`product-order-btn-${prod.id}`}
              className="bg-pink-600 hover:bg-pink-700 text-white p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all shadow-sm group-hover:shadow-md cursor-pointer"
              aria-label="Order Product"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Curated best sellers (randomized by reload)
  const bestSellers = useMemo(() => {
    const sortedProds = [...products].sort((a, b) => {
      if (!randomOrderMap.has(a.id)) randomOrderMap.set(a.id, Math.random());
      if (!randomOrderMap.has(b.id)) randomOrderMap.set(b.id, Math.random());
      return randomOrderMap.get(a.id)! - randomOrderMap.get(b.id)!;
    });

    const bestSellerCakes = sortedProds
      .filter((p) => p.category === "cakes")
      .slice(0, 3);
    const bestSellerFlowers = sortedProds
      .filter((p) => p.category === "flowers")
      .slice(0, 3);
    const bestSellerGifts = sortedProds
      .filter((p) => p.category === "personalized_gifts")
      .slice(0, 2);

    const combined = [
      ...bestSellerCakes,
      ...bestSellerFlowers,
      ...bestSellerGifts,
    ];

    // Pad with any remaining items if total is less than 8
    const remainingNeeded = 8 - combined.length;
    if (remainingNeeded > 0) {
      const existingIds = new Set(combined.map((p) => p.id));
      const fillers = sortedProds
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remainingNeeded);
      combined.push(...fillers);
    }

    // Sort combined elements to ensure complete randomization
    return combined
      .sort((a, b) => {
        if (!randomOrderMap.has(a.id)) randomOrderMap.set(a.id, Math.random());
        if (!randomOrderMap.has(b.id)) randomOrderMap.set(b.id, Math.random());
        return randomOrderMap.get(a.id)! - randomOrderMap.get(b.id)!;
      })
      .slice(0, 8);
  }, [products, randomOrderMap]);

  // Dynamic personalized best sellers selected by admin (merged with live modifications)
  const personalisedBestSellers = useMemo(() => {
    const resultList = products.filter(
      (p) => p.isPersonalisedBestSeller === true,
    );

    // Sort by personalisedBestSellerOrder
    return resultList.sort((a, b) => {
      const orderA = a.personalisedBestSellerOrder ?? 999;
      const orderB = b.personalisedBestSellerOrder ?? 999;
      return orderA - orderB;
    });
  }, [products]);

  // Dynamic plants list selected by admin (merged with live modifications like image edits)
  const shuffleList = (list: Product[]) => {
    return [...list].sort((a, b) => {
      if (!randomOrderMap.has(a.id)) randomOrderMap.set(a.id, Math.random());
      if (!randomOrderMap.has(b.id)) randomOrderMap.set(b.id, Math.random());
      return randomOrderMap.get(a.id)! - randomOrderMap.get(b.id)!;
    });
  };

  const plantsCatalog = useMemo(() => {
    return shuffleList(
      products.filter(
        (p) => p.category === "plants" || p.categories?.includes("plants"),
      ),
    );
  }, [products, randomOrderMap]);

  const valentineProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) =>
            p.category === "valentine_day" ||
            p.categories?.includes("valentine_day"),
        ),
      ),
    [products, randomOrderMap],
  );
  const teachersDayProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) =>
            p.category === "teachers_day" ||
            p.categories?.includes("teachers_day"),
        ),
      ),
    [products, randomOrderMap],
  );
  const mothersDayProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) =>
            p.category === "mothers_day" ||
            p.categories?.includes("mothers_day"),
        ),
      ),
    [products, randomOrderMap],
  );
  const fathersDayProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) =>
            p.category === "fathers_day" ||
            p.categories?.includes("fathers_day"),
        ),
      ),
    [products, randomOrderMap],
  );
  const xmasProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) => p.category === "xmas" || p.categories?.includes("xmas"),
        ),
      ),
    [products, randomOrderMap],
  );

  const newYearProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) =>
            p.category === "new_year" || p.categories?.includes("new_year"),
        ),
      ),
    [products, randomOrderMap],
  );
  const rakhiProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) => p.category === "rakhi" || p.categories?.includes("rakhi"),
        ),
      ),
    [products, randomOrderMap],
  );
  const dewaliProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) => p.category === "dewali" || p.categories?.includes("dewali"),
        ),
      ),
    [products, randomOrderMap],
  );
  const handCraftsProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) =>
            p.category === "hand_crafts" ||
            p.categories?.includes("hand_crafts"),
        ),
      ),
    [products, randomOrderMap],
  );
  const photoToArtProducts = useMemo(
    () =>
      shuffleList(
        products.filter(
          (p) =>
            p.category === "photo_to_art" ||
            p.categories?.includes("photo_to_art"),
        ),
      ),
    [products, randomOrderMap],
  );

  // Multiple categories section styling for the best sellers tab view
  const parsedSectionsOrder = useMemo(() => {
    const defaultList = [
      "new_year",
      "rakhi",
      "dewali",
      "hand_crafts",
      "photo_to_art",
      "valentine_day",
      "teachers_day",
      "mothers_day",
      "fathers_day",
      "xmas",
      "premium_bestsellers",
      "custom_cake_categories",
      "personalised_bestsellers",
      "gifts_for_him_her",
      "cakes",
      "gallery",
      "flowers",
      "gifts",
      "plants",
      "about",
    ];
    const saved = storeConfig?.homepageSectionsOrder || [];
    const ordered = saved.filter((s) => defaultList.includes(s));
    const missing = defaultList.filter((s) => !ordered.includes(s));
    return Array.from(new Set([...ordered, ...missing]));
  }, [storeConfig?.homepageSectionsOrder]);

  const renderSectionLayout = (
    productsList: Product[],
    layoutMode?: "grid" | "slider",
  ) => {
    if (layoutMode === "slider") {
      return (
        <div className="flex overflow-x-auto gap-4 pb-4 px-1 select-none scrollbar-hide snap-x">
          {productsList.map((prod) => (
            <div
              key={prod.id}
              className="flex-none w-[180px] sm:w-[240px] snap-start"
            >
              {renderProductCard(prod)}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {productsList.map((prod) => renderProductCard(prod))}
      </div>
    );
  };

  if (isDefaultLanding) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-20 space-y-6 overflow-hidden">
        {parsedSectionsOrder.map((sectionId) => {
          const content = (() => {
            switch (sectionId) {
              case "new_year":
                return (
                  storeConfig?.showNewYear !== false && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-50 pb-2">
                          <h2 className="text-xl font-black text-amber-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🎆</span> New Year Categories
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {displayedNewYearSubcategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => onSelectCategory?.(cat.id)}
                              className="group relative h-[140px] xs:h-[160px] sm:h-[185px] rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-amber-200 duration-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-end"
                            >
                              <div className="absolute inset-0">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent group-hover:from-amber-950/80 transition-colors duration-300" />
                              </div>
                              <div className="relative z-10 p-3 sm:p-4 text-left space-y-0.5">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/10 inline-block">
                                  {cat.tag}
                                </span>
                                <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1">
                                  {cat.name}{" "}
                                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition duration-300 -translate-x-2 group-hover:translate-x-0" />
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );
              case "rakhi":
                return (
                  storeConfig?.showRakhi !== false && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-orange-50 pb-2">
                          <h2 className="text-xl font-black text-orange-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🪢</span> Rakhi Categories
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {displayedRakhiSubcategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => onSelectCategory?.(cat.id)}
                              className="group relative h-[140px] xs:h-[160px] sm:h-[185px] rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-orange-200 duration-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-end"
                            >
                              <div className="absolute inset-0">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent group-hover:from-orange-950/80 transition-colors duration-300" />
                              </div>
                              <div className="relative z-10 p-3 sm:p-4 text-left space-y-0.5">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-orange-300 bg-orange-950/50 px-2 py-0.5 rounded border border-orange-500/10 inline-block">
                                  {cat.tag}
                                </span>
                                <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1">
                                  {cat.name}{" "}
                                  <ChevronRight className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-1 duration-200 transition-transform" />
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );
              case "dewali":
                return (
                  storeConfig?.showDewali !== false && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-50 pb-2">
                          <h2 className="text-xl font-black text-amber-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🪔</span> Dewali Categories
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {displayedDewaliSubcategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => onSelectCategory?.(cat.id)}
                              className="group relative h-[140px] xs:h-[160px] sm:h-[185px] rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-amber-200 duration-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-end"
                            >
                              <div className="absolute inset-0">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent group-hover:from-amber-950/80 transition-colors duration-300" />
                              </div>
                              <div className="relative z-10 p-3 sm:p-4 text-left space-y-0.5">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/10 inline-block">
                                  {cat.tag}
                                </span>
                                <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1">
                                  {cat.name}{" "}
                                  <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 duration-200 transition-transform" />
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );
              case "hand_crafts":
                return (
                  storeConfig?.showHandCrafts !== false && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-rose-50 pb-2">
                          <h2 className="text-xl font-black text-rose-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>✂️</span> Hand Crafts Categories
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {displayedHandCraftSubcategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => onSelectCategory?.(cat.id)}
                              className="group relative h-[140px] xs:h-[160px] sm:h-[185px] rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-rose-200 duration-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-end"
                            >
                              <div className="absolute inset-0">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent group-hover:from-rose-950/80 transition-colors duration-300" />
                              </div>
                              <div className="relative z-10 p-3 sm:p-4 text-left space-y-0.5">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-rose-300 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/10 inline-block">
                                  {cat.tag}
                                </span>
                                <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1">
                                  {cat.name}{" "}
                                  <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 duration-200 transition-transform" />
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );
              case "photo_to_art":
                return (
                  storeConfig?.showPhotoToArt !== false && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-sky-50 pb-2">
                          <h2 className="text-xl font-black text-sky-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🎨</span> Photo to Art Categories
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {displayedPhotoToArtSubcategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => onSelectCategory?.(cat.id)}
                              className="group relative h-[140px] xs:h-[160px] sm:h-[185px] rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-sky-200 duration-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-end"
                            >
                              <div className="absolute inset-0">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent group-hover:from-sky-950/80 transition-colors duration-300" />
                              </div>
                              <div className="relative z-10 p-3 sm:p-4 text-left space-y-0.5">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-sky-300 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-500/10 inline-block">
                                  {cat.tag}
                                </span>
                                <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1">
                                  {cat.name}{" "}
                                  <ChevronRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 duration-200 transition-transform" />
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );
              case "valentine_day":
                return (
                  storeConfig?.showValentineDay !== false &&
                  valentineProducts.length > 0 && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-rose-50 pb-2">
                          <h2 className="text-xl font-black text-rose-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>💝</span> Valentine Day Special
                          </h2>
                        </div>
                        {renderSectionLayout(
                          valentineProducts,
                          storeConfig?.valentineDayLayout,
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );
              case "teachers_day":
                return (
                  storeConfig?.showTeachersDay !== false &&
                  teachersDayProducts.length > 0 && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-50 pb-2">
                          <h2 className="text-xl font-black text-amber-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>📝</span> Teachers Day Special
                          </h2>
                        </div>
                        {renderSectionLayout(
                          teachersDayProducts,
                          storeConfig?.teachersDayLayout,
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );
              case "mothers_day":
                return (
                  storeConfig?.showMothersDay !== false &&
                  mothersDayProducts.length > 0 && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2">
                          <h2 className="text-xl font-black text-pink-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>👩‍👧</span> Mothers Day Special
                          </h2>
                        </div>
                        {renderSectionLayout(
                          mothersDayProducts,
                          storeConfig?.mothersDayLayout,
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );
              case "fathers_day":
                return (
                  storeConfig?.showFathersDay !== false &&
                  fathersDayProducts.length > 0 && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                          <h2 className="text-xl font-black text-indigo-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>👨‍👦</span> Fathers Day Special
                          </h2>
                        </div>
                        {renderSectionLayout(
                          fathersDayProducts,
                          storeConfig?.fathersDayLayout,
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );
              case "xmas":
                return (
                  storeConfig?.showXmasDay !== false &&
                  xmasProducts.length > 0 && (
                    <ScrollReveal variant="slide-up">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-emerald-50 pb-2">
                          <h2 className="text-xl font-black text-emerald-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🎄</span> Christmas Special
                          </h2>
                        </div>
                        {renderSectionLayout(
                          xmasProducts,
                          storeConfig?.xmasDayLayout,
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );
              case "premium_bestsellers":
                return (
                  storeConfig?.showPremiumBestSellers !== false && (
                    <ScrollReveal variant="slide-right">
                      <div className="space-y-4">
                        {(storeConfig?.topOfferBannerImage || storeConfig?.topOfferBannerText) && (
                          <div className="w-full rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 shadow-xs mb-4">
                            {storeConfig.topOfferBannerImage && (
                              <img src={storeConfig.topOfferBannerImage} alt="Special Offer" className="w-full h-16 sm:h-24 object-cover" />
                            )}
                            {storeConfig.topOfferBannerText && (
                              <div className="p-3 text-center text-xs font-black text-pink-800 uppercase tracking-widest">
                                {storeConfig.topOfferBannerText}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>⚡</span> Premium Best Sellers
                          </h2>
                          <span className="text-[10px] font-bold text-pink-700 bg-pink-50 py-1 px-3 rounded-full uppercase tracking-wider animate-bounce">
                            Hot Collection
                          </span>
                        </div>

                        {bestSellers.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400">
                              No products found.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {bestSellers.map((prod) => renderProductCard(prod))}
                          </div>
                        )}
                        <OrderTimer />
                      </div>
                    </ScrollReveal>
                  )
                );

              case "custom_cake_categories":
                return (
                  storeConfig?.showCustomCakeCategories !== false && (
                    <ScrollReveal variant="slide-left">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🍰</span> Custom Cake Categories
                          </h2>
                          <span className="text-[10px] font-bold text-pink-700 bg-pink-50 py-1 px-3 rounded-full uppercase tracking-wider animate-pulse">
                            Click to Explore
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {displayedCakeSubcategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => onSelectCategory?.(cat.id)}
                              className="group relative h-[140px] xs:h-[160px] sm:h-[185px] rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-pink-200 duration-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-end"
                            >
                              <div className="absolute inset-0">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                                />
                                {/* Modern Rich Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent group-hover:from-pink-950/80 transition-colors duration-300" />
                              </div>

                              <div className="relative z-10 p-3 sm:p-4 text-left space-y-0.5">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-pink-300 bg-pink-950/50 px-2 py-0.5 rounded border border-pink-500/10 inline-block">
                                  {cat.tag}
                                </span>
                                <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1">
                                  {cat.name}{" "}
                                  <ChevronRight className="w-3.5 h-3.5 text-pink-400 group-hover:translate-x-1 duration-200 transition-transform" />
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );

              case "personalised_bestsellers":
                return (
                  storeConfig?.showPersonalisedBestSellers !== false && (
                    <ScrollReveal variant="slide-right">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2 mb-4">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>💖</span> Personalised Best Sellers
                          </h2>
                          <span className="text-[9px] font-bold text-pink-700 bg-pink-50 py-1 px-3 rounded-full uppercase tracking-wider">
                            {personalisedBestSellers.length} Items • Scroll
                            Right →
                          </span>
                        </div>
                        {storeConfig?.personalizedGiftsBannerImage && (
                          <div 
                            className="w-full rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 shadow-sm mb-4 cursor-pointer active:scale-95 transition-transform"
                            onClick={() => onSelectCategory?.("personalized_gifts")}
                          >
                            <img src={storeConfig.personalizedGiftsBannerImage} alt="Personalized Best Sellers" className="w-full h-36 sm:h-48 object-cover" />
                          </div>
                        )}

                        {/* Horizontally scrollable row wrapper */}
                        <div className="flex overflow-x-auto gap-4 pb-4 px-1 select-none scrollbar-hide snap-x">
                          {personalisedBestSellers.map((prod) => {
                            const disc = prod.originalPrice
                              ? Math.round(
                                  ((prod.originalPrice - prod.price) /
                                    prod.originalPrice) *
                                    100,
                                )
                              : 0;

                            return (
                              <div
                                key={prod.id}
                                id={`pers-carousel-card-${prod.id}`}
                                onClick={() => onSelectProduct(prod)}
                                className="bg-white rounded-3xl overflow-hidden border border-slate-100 flex-none w-[200px] sm:w-[240px] hover:shadow-lg hover:border-pink-100 duration-300 transition-all cursor-pointer text-left flex flex-col justify-between snap-start relative"
                              >
                                <div className="relative aspect-square overflow-hidden bg-slate-50">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                                    referrerPolicy="no-referrer"
                                  />
                                  {disc > 0 && (
                                    <span className="absolute top-2 left-2 bg-pink-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                                      {disc}% OFF
                                    </span>
                                  )}
                                  {prod.adminNote && (
                                    <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm uppercase">
                                      <Zap className="w-2 h-2 fill-current" />{" "}
                                      {prod.adminNote}
                                    </span>
                                  )}
                                  <span className="absolute bottom-2 left-2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Sparkles className="w-2 h-2 fill-current text-white animate-spin-slow" />{" "}
                                    Customised
                                  </span>
                                </div>

                                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-1.5">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1 text-[9px] text-amber-500 font-bold bg-amber-50 inline-flex px-1 rounded border border-amber-100/50">
                                      <Star className="w-2 h-2 fill-current" />
                                      <span>{prod.rating}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 hover:text-pink-600 duration-150 leading-snug">
                                      {prod.name}
                                    </h4>
                                  </div>

                                  <div className="flex items-end justify-between pt-1">
                                    <div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-xs sm:text-sm font-black text-slate-900">
                                          ₹
                                          {prod.options?.hasWeightOptions
                                            ? getWeightPrice(
                                                prod,
                                                getStartingWeight(prod),
                                              )
                                            : prod.price}
                                        </span>
                                        {prod.originalPrice && (
                                          <span className="text-[9px] text-slate-400 line-through font-medium">
                                            ₹{prod.originalPrice}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[8px] text-pink-500 font-bold block">
                                        Free Customisation
                                      </span>
                                    </div>
                                    <button className="bg-pink-600 hover:bg-pink-700 text-white p-1.5 rounded-lg">
                                      <ShoppingBag className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );

              case "gifts_for_him_her":
                return (
                  storeConfig?.showGiftsForHimHer !== false &&
                  (storeConfig?.giftsForHimBannerImage || storeConfig?.giftsForHerBannerImage) && (
                    <ScrollReveal variant="slide-up">
                      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-6">
                        {storeConfig?.giftsForHimBannerImage && (
                          <div 
                            className="relative w-full rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform"
                            onClick={() => onSelectCategory?.("gifts_for_him")}
                          >
                            <img src={storeConfig.giftsForHimBannerImage} alt="Gifts for Him" className="w-full h-28 sm:h-40 object-cover" />
                          </div>
                        )}
                        {storeConfig?.giftsForHerBannerImage && (
                          <div 
                            className="relative w-full rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-95 transition-transform"
                            onClick={() => onSelectCategory?.("gifts_for_her")}
                          >
                            <img src={storeConfig.giftsForHerBannerImage} alt="Gifts for Her" className="w-full h-28 sm:h-40 object-cover" />
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );
              case "cakes":
                return (
                  storeConfig?.showCakesSection !== false && (
                    <ScrollReveal variant="slide-right">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight text-left">
                            Cakes
                          </h2>
                          <span className="text-[10px] font-bold text-pink-700 bg-pink-50 py-1 px-3 rounded-full uppercase tracking-wider">
                            {cakes.length} Select Flavours
                          </span>
                        </div>

                        {cakes.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400">
                              No cakes found in store.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {cakes.map((prod) => renderProductCard(prod))}
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );

              case "gallery":
                return (
                  storeConfig?.showCakeGallery !== false && (
                    <ScrollReveal variant="scale">
                      <div className="pt-0">
                        <CakeGallery />
                      </div>
                    </ScrollReveal>
                  )
                );

              case "flowers":
                return (
                  storeConfig?.showFlowersSection !== false && (
                    <ScrollReveal variant="slide-left">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight text-left">
                            Flowers
                          </h2>
                          <span className="text-[10px] font-bold text-pink-700 bg-pink-50 py-1 px-3 rounded-full uppercase tracking-wider">
                            {flowers.length} Fresh Designs
                          </span>
                        </div>

                        {flowers.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400">
                              No flowers found in store.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {flowers.map((prod) => renderProductCard(prod))}
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  )
                );

              case "gifts":
                return (
                  storeConfig?.showGiftsSection !== false && (
                    <ScrollReveal variant="slide-left">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🎁</span> Gifts & Combos Portal
                          </h2>
                          <span className="text-[10px] font-bold text-pink-700 bg-pink-50 py-1 px-3 rounded-full uppercase tracking-wider animate-pulse">
                            Separate Views
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          {displayedGiftSubcategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => onSelectCategory?.(cat.id)}
                              className="group relative h-[140px] xs:h-[160px] sm:h-[185px] rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-pink-200 duration-300 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-end"
                            >
                              <div className="absolute inset-0">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                                />
                                {/* Modern Elegant Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-transparent group-hover:from-pink-950/85 transition-colors duration-300" />
                              </div>

                              <div className="relative z-10 p-3 sm:p-4 text-left space-y-0.5">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-pink-300 bg-pink-950/50 px-2 py-0.5 rounded border border-pink-500/10 inline-block">
                                  {cat.tag}
                                </span>
                                <h3 className="text-sm sm:text-base font-black text-white leading-tight flex items-center gap-1">
                                  {cat.name}{" "}
                                  <ChevronRight className="w-3.5 h-3.5 text-pink-400 group-hover:translate-x-1 duration-200 transition-transform" />
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );

              case "plants":
                return (
                  storeConfig?.showPlantsSection !== false && (
                    <ScrollReveal variant="slide-right">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-pink-50 pb-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight text-left flex items-center gap-1.5">
                            <span>🌿</span> Premium Table Plants
                          </h2>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full uppercase tracking-wider">
                            Pasa-Pasi 2 To Grid
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                          {plantsCatalog.map((prod) => renderProductCard(prod))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                );

              case "about":
                return (
                  storeConfig?.showAboutSection !== false && (
                    <div className="space-y-6 sm:space-y-10">
                      <ScrollReveal variant="slide-up">
                        <section className="w-full relative overflow-hidden rounded-3xl bg-white border border-slate-150 shadow-sm p-6 sm:p-8 max-w-7xl mx-auto text-left">
                          <div className="space-y-5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                              <span>→</span> BLOG & UPDATES
                            </div>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                              Our Latest Insights & FAQs
                            </h2>
                            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 lg:gap-6 mt-4 pb-4 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
                              <a
                                href="#"
                                className="flex-none w-[85%] sm:w-[350px] snap-center p-6 bg-slate-50 hover:bg-pink-50/50 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all duration-300 group"
                              >
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500 mb-4 group-hover:-translate-y-1 transition-transform text-lg">
                                  🎂
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                                  How We Craft Premium Designer Cakes in
                                  Kharagpur
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 mt-3 leading-relaxed">
                                  From baking with the freshest ingredients to
                                  hand-crafting intricate fondant designs, our
                                  expert bakers ensure every birthday and
                                  anniversary cake is a masterpiece. We
                                  specialize in 100% eggless options, bento
                                  cakes, and photo cakes customized perfectly
                                  for your special celebrations across Kharagpur
                                  and Midnapore.
                                </p>
                              </a>
                              <a
                                href="#"
                                className="flex-none w-[85%] sm:w-[350px] snap-center p-6 bg-slate-50 hover:bg-pink-50/50 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all duration-300 group"
                              >
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500 mb-4 group-hover:-translate-y-1 transition-transform text-lg">
                                  🎁
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                                  The Best Personalized Gift Combos Delivered in
                                  Midnapore
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 mt-3 leading-relaxed">
                                  Finding the perfect present has never been
                                  easier. Explore our exclusive curated gift
                                  combos featuring fresh multi-layered flower
                                  bouquets, delectable chocolate cakes, cute
                                  teddy bears, and personalized photo frames.
                                  Whether it's Valentine's Day or Mother's Day,
                                  our premium hampers are guaranteed to bring a
                                  smile.
                                </p>
                              </a>
                              <a
                                href="#"
                                className="flex-none w-[85%] sm:w-[350px] snap-center p-6 bg-slate-50 hover:bg-pink-50/50 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all duration-300 group"
                              >
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500 mb-4 group-hover:-translate-y-1 transition-transform text-lg">
                                  🚀
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                                  Our Lightning-Fast 2-Hour Express Delivery
                                  Service
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 mt-3 leading-relaxed">
                                  Forgot a special occasion? Don't worry! Rocx
                                  Cakes & Gifts offers an ultra-reliable 2-hour
                                  express delivery and midnight surprise
                                  delivery service across Kharagpur and local
                                  areas. We ensure your custom delicate fondant
                                  cakes and vibrant floral bouquets arrive
                                  safely, fresh, and exactly on time to make
                                  your moments memorable.
                                </p>
                              </a>
                            </div>
                          </div>
                        </section>
                      </ScrollReveal>

                      <ScrollReveal variant="slide-up">
                        <section className="w-full relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-900 shadow-2xl flex flex-col justify-end text-left min-h-[360px] max-w-7xl mx-auto">
                          {/* Background Image Banner */}
                          <div className="absolute inset-0">
                            <img
                              src={
                                storeConfig?.aboutBgImage ||
                                "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80"
                              }
                              alt="Rocx Cakes Kitchen Backing Craft"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-[center_right] sm:object-right opacity-100"
                            />
                            {/* Visual gradient overlay for beautiful colors on the right & readable text on the left/bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/10 md:bg-gradient-to-r md:from-slate-950/95 md:via-slate-950/70 md:to-transparent" />
                          </div>

                          {/* Interactive branding text and checkmarks points panel overlay */}
                          <div className="relative z-10 p-6 sm:p-10 space-y-5 max-w-4xl">
                            <div className="space-y-3">
                              {/* Pill badge showing About Store */}
                              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/15 text-white rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                                <span>→</span> ABOUT STORE
                              </div>

                              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none font-sans">
                                About ROCX Cakes & Gifts
                              </h2>

                              <p className="text-xs sm:text-base text-slate-200 font-medium leading-relaxed">
                                Every order is crafted to feel personal, fast,
                                and beautifully packed.
                              </p>
                            </div>

                            {/* List with bright golden bullet dots */}
                            <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
                              {(
                                storeConfig?.aboutPoints || [
                                  "Freshly baked and hand-delivered with care.",
                                  "Personalized gifts, flowers, plants, cakes, and combo boxes in one place.",
                                  "Easy admin control for categories, sections, and homepage banners.",
                                ]
                              ).map((point, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-yellow-400 text-sm select-none leading-none mt-1">
                                    ●
                                  </span>
                                  <p className="text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
                                    {point}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      </ScrollReveal>
                    </div>
                  )
                );

              default:
                return null;
            }
          })();

          if (!content) return null;
          return <div key={sectionId} id={`section-${sectionId}`}>{content}</div>;
        })}
      </div>
    );
  }

  // Standard single category rendering for selected nav filters or search pages
  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 font-sans">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight text-left">
          {selectedCategoryName}
        </h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 py-1 px-3 rounded-full">
          {products.length} {products.length === 1 ? "item" : "items"} found
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 font-medium font-mono">
            No matching items found.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try another category or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((prod) => renderProductCard(prod))}
        </div>
      )}
    </div>
  );
}
