import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Database,
  ShoppingBag,
  PlusCircle,
  Trash2,
  Edit3,
  DollarSign,
  Layers,
  Plus,
  Check,
  Lock,
  ArrowRight,
  Table,
  Ticket,
  Tag,
  Search,
  ChevronUp,
  ChevronDown,
  Store,
} from "lucide-react";
import {
  Product,
  CategoryID,
  Coupon,
  Category,
  Slide,
  compressImageFile,
  GalleryItem,
  StoreConfig,
  StoreConfigItem,
  DELIVERY_AGENTS,
  DeliveryAgent,
} from "../types";
import { ACCESSORY_ADDONS } from "../data";
import SubcategoryEditor from "./SubcategoryEditor";
import DeliveryConfigEditor from "./DeliveryConfigEditor";
import {
  subscribeToSellersFromFirestore,
  saveSellerToFirestore,
  deleteSellerFromFirestore,
} from "../services/dbService";

interface OrderItem {
  name: string;
  quantity: number;
  options?: string;
  photoUrl?: string;
  productImage?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  pincode?: string;
  city?: string;
  landmark?: string;
  paymentMode: string;
  paymentStatus?: "pending" | "completed";
  total: number;
  status: string;
  estimatedDelivery?: string;
  date: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  assignedRiderId?: string;
  assignedRiderName?: string;
  deliveryAgentPicked?: boolean;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (
    orderId: string,
    status: string,
    estimatedDelivery?: string,
  ) => void;
  onUpdateOrderPaymentStatus: (
    orderId: string,
    paymentStatus: "pending" | "completed",
  ) => void;
  onAssignRider?: (orderId: string, riderId: string, riderName: string) => void;
  riders?: DeliveryAgent[];
  products: Product[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (product: Product) => void;
  onRestoreProducts?: () => Promise<void>;
  coupons: Coupon[];
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onUpdateCoupon?: (coupon: Coupon) => void;
  firebaseSyncError?: string | null;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateCategory?: (category: Category | Category[]) => void;
  slides?: Slide[];
  onUpdateSlide?: (slide: Slide) => void;
  onDeleteSlide?: (slideId: string) => void;
  galleryItems?: GalleryItem[];
  onAddGalleryItem?: (item: GalleryItem) => void;
  onDeleteGalleryItem?: (itemId: string) => void;
  storeConfig?: StoreConfig;
  onUpdateStoreConfig?: (config: StoreConfig) => void;
  onDeleteRider?: (id: string) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  onUpdateOrderPaymentStatus,
  onAssignRider,
  riders = DELIVERY_AGENTS,
  products,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
  onRestoreProducts,
  coupons,
  onAddCoupon,
  onDeleteCoupon,
  onUpdateCoupon,
  firebaseSyncError = null,
  categories,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
  slides = [],
  onUpdateSlide,
  onDeleteSlide,
  galleryItems = [],
  onAddGalleryItem,
  onDeleteGalleryItem,
  storeConfig,
  onUpdateStoreConfig,
  onDeleteRider,
}: AdminPanelProps) {
  // Security Lock state - 2622 required
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem("rocx_admin_unlocked") === "true";
  });
  const [securityError, setSecurityError] = useState("");

  const handleVerifyPasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode === "2622") {
      setIsUnlocked(true);
      sessionStorage.setItem("rocx_admin_unlocked", "true");
      setSecurityError("");
    } else {
      setSecurityError("Incorrect administrator passcode. Please try again.");
      setPasscode("");
    }
  };

  const handleKeyPress = (num: string) => {
    if (passcode.length < 4) {
      const nextPass = passcode + num;
      setPasscode(nextPass);
      if (nextPass === "2622") {
        setTimeout(() => {
          setIsUnlocked(true);
          sessionStorage.setItem("rocx_admin_unlocked", "true");
          setSecurityError("");
        }, 150);
      }
    }
  };

  const handleClearPin = () => {
    setPasscode("");
    setSecurityError("");
  };

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<
    | "orders"
    | "catalog"
    | "purchases"
    | "coupons"
    | "categories"
    | "slider"
    | "gallery"
    | "settings"
    | "bestsellers"
    | "riders"
    | "reviews"
    | "sellers"
    | "gifts_curation"
    | "cakes_curation"
    | "flowers_curation"
    | "delivery"
  >("orders");

  const [reviewSelectedCategory, setReviewSelectedCategory] =
    useState<string>("default");

  const [sellers, setSellers] = useState<any[]>([]);
  const [sellerSearchPincode, setSellerSearchPincode] = useState("");

  useEffect(() => {
    if (!isOpen || !isUnlocked) return;
    const unsubSellers = subscribeToSellersFromFirestore((data) => {
      setSellers(data);
    });
    return () => unsubSellers();
  }, [isOpen, isUnlocked]);

  // Custom confirm dialog state to bypass iframe window.confirm restriction
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // New Product parameters setup
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState("");
  const [newProdRating, setNewProdRating] = useState("5.0");
  const [newProdPhotoUpload, setNewProdPhotoUpload] = useState(false);
  const [newProdNameCustomization, setNewProdNameCustomization] =
    useState(false);
  const [newProdIsPersonalisedBestSeller, setNewProdIsPersonalisedBestSeller] =
    useState(false);
  const [newProdCategory, setNewProdCategory] = useState<CategoryID>("");
  const [newProdCategories, setNewProdCategories] = useState<string[]>([]);
  const [newProdWeightPrices, setNewProdWeightPrices] = useState<
    Record<string, number>
  >({});
  const [newCustomWeightInput, setNewCustomWeightInput] = useState("");
  const [newProdCustomWeights, setNewProdCustomWeights] = useState<string[]>(
    [],
  );
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdAboutProduct, setNewProdAboutProduct] = useState("");
  const [newProdDeliveryCare, setNewProdDeliveryCare] = useState("");
  const [newProdAdminNote, setNewProdAdminNote] = useState("");
  const [newProdDeliveryFee, setNewProdDeliveryFee] = useState("");
  const [newProdTwoHourDelivery, setNewProdTwoHourDelivery] = useState(false);
  const [newProdImgUrl, setNewProdImgUrl] = useState("");
  const [newProdGalleryUrls, setNewProdGalleryUrls] = useState("");
  const [newProdGalleryImages, setNewProdGalleryImages] = useState<string[]>(
    [],
  );
  const [newProdAllowedWeights, setNewProdAllowedWeights] = useState<string[]>(
    [],
  );
  const [newProdAddonIds, setNewProdAddonIds] = useState<string[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [editCustomWeightInput, setEditCustomWeightInput] = useState("");

  // Order search states and computed list
  const [orderSearch, setOrderSearch] = useState("");
  const [appliedOrderSearch, setAppliedOrderSearch] = useState("");

  // Order status tabs filter & date verification picker
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "active" | "delivered" | "cancelled"
  >("active");
  const [filterDate, setFilterDate] = useState<string>("");

  // Category creation states
  const [newCatName, setNewCatName] = useState("");
  const [newCatImgUrl, setNewCatImgUrl] = useState("");
  const [newCatId, setNewCatId] = useState("");
  const [newCatOrder, setNewCatOrder] = useState<string>("");
  const [newCatAddonIds, setNewCatAddonIds] = useState<string[]>([]);

  // Category editing states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingCatImgUrl, setEditingCatImgUrl] = useState("");
  const [editingCatOrder, setEditingCatOrder] = useState<number>(0);
  const [editingCatAddonIds, setEditingCatAddonIds] = useState<string[]>([]);

  // Banner slide editing states
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editingSlideTitle, setEditingSlideTitle] = useState("");
  const [editingSlideBadge, setEditingSlideBadge] = useState("");
  const [editingSlideSubtitle, setEditingSlideSubtitle] = useState("");
  const [editingSlideImage, setEditingSlideImage] = useState("");
  const [isUploadingSlideImage, setIsUploadingSlideImage] = useState(false);

  // New slide creation states
  const [newSlideTitle, setNewSlideTitle] = useState("");
  const [newSlideBadge, setNewSlideBadge] = useState("");
  const [newSlideSubtitle, setNewSlideSubtitle] = useState("");
  const [newSlideImage, setNewSlideImage] = useState("");
  const [isUploadingNewSlideImage, setIsUploadingNewSlideImage] =
    useState(false);

  // Lookbook Gallery creation states
  const [newGalleryImage, setNewGalleryImage] = useState("");
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);

  // Full product edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [localConfig, setLocalConfig] = useState<StoreConfig | null>(null);

  useEffect(() => {
    if (storeConfig) {
      setLocalConfig(storeConfig);
    }
  }, [storeConfig]);

  // Coupon creation states
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"percentage" | "flat">(
    "flat",
  );
  const [newCouponValue, setNewCouponValue] = useState("");
  const [newCouponMinOrder, setNewCouponMinOrder] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponShowInCart, setNewCouponShowInCart] = useState(true);

  // Aggregated metric numbers for administrative dashboard
  const metrics = useMemo(() => {
    const totalSales = orders
      .filter((o) => o.status === "Delivered")
      .reduce((acc, order) => acc + order.total, 0);
    const activeOrders = orders.filter(
      (o) =>
        o.status !== "Delivered" &&
        o.status !== "Cancelled Due to InAppropriate Reasons",
    ).length;
    return {
      totalSales,
      activeOrders,
      totalOrders: orders.length,
      itemCount: products.length,
    };
  }, [orders, products]);

  const allPossibleSecondaryCategories = useMemo(() => {
    const defaultSubs = [
      { id: "photo_cake", name: "Photo Cakes (Cake Subcategory)" },
      { id: "bento_cake", name: "Bento Cakes (Cake Subcategory)" },
      { id: "pinata_cake", name: "Pinata Cakes (Cake Subcategory)" },
      { id: "kids_cake", name: "Kids Cakes (Cake Subcategory)" },
      { id: "flower_combos", name: "Flower Combos (Combo Subcategory)" },
      { id: "cake_combos", name: "Cake Combos (Combo Subcategory)" },
      {
        id: "chocolate_flower",
        name: "Chocolate & Flower (Combo Subcategory)",
      },
      {
        id: "personalised_combos",
        name: "Personalised Combos (Combo Subcategory)",
      },
      { id: "valentine_day", name: "Valentine's Day Special" },
      { id: "mothers_day", name: "Mother's Day Special" },
      { id: "fathers_day", name: "Father's Day Special" },
      { id: "teachers_day", name: "Teacher's Day Special" },
      { id: "xmas", name: "Christmas Special" },
      { id: "special_chocolate", name: "Special Chocolate (Dewali)" },
      { id: "sweets", name: "Sweets (Dewali)" },
      { id: "dryfruits", name: "Dry Fruits (Dewali)" },
      { id: "diya_candle", name: "Diya & Candles (Dewali)" },
      { id: "rakhi_dryfruits", name: "Rakhi & Dryfruits (Rakhi)" },
      { id: "bhai_vhabi_rakhi", name: "Bhai & Vhabi Rakhi (Rakhi)" },
      { id: "rakhi_sweets", name: "Rakhi With Sweets (Rakhi)" },
      { id: "rakhi_chocolate", name: "Rakhi With Chocolate (Rakhi)" },
      { id: "water_colour", name: "Water Colour (Photo to Art)" },
      { id: "oil_painting", name: "Oil Painting (Photo to Art)" },
      { id: "sketch", name: "Sketch (Photo to Art)" },
      { id: "acrylic", name: "Acrylic (Photo to Art)" },
      { id: "key_ring", name: "Key Ring (Hand Crafts)" },
      { id: "jewellery", name: "Jewellery (Hand Crafts)" },
      { id: "clay_art", name: "Clay Art (Hand Crafts)" },
      { id: "resin_art", name: "Resin Art (Hand Crafts)" },
      { id: "gifts_for_him", name: "Gifts for Him" },
      { id: "gifts_for_her", name: "Gifts for Her" },
      { id: "cakes_for_him", name: "Cakes for Him" },
      { id: "cakes_for_her", name: "Cakes for Her" },
      { id: "cakes_with_flowers", name: "Cakes with Flowers" },
      { id: "flowers_with_cakes", name: "Flowers with Cakes" },
      { id: "flowers_with_chocolates", name: "Flowers with Chocolates" },
    ];

    // Retrieve custom titles from database configuration if present
    const dynamicSubs = (storeConfig?.cakeSubcategories || []).map((sc) => ({
      id: sc.id,
      name: `${sc.name} (Cake Subcategory)`,
    }));

    const finalSubs = defaultSubs.map((ds) => {
      const match = dynamicSubs.find((ds2) => ds2.id === ds.id);
      return match || ds;
    });

    const combined = [
      ...categories.map((c) => ({ id: c.id, name: c.name })),
      ...finalSubs,
      ...dynamicSubs.filter((ds) => !finalSubs.some((fs) => fs.id === ds.id)),
    ];

    const uniqueMap = new Map();
    combined.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [categories, storeConfig]);

  // Catalog filtered view
  const filteredCatalog = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(catalogSearch.toLowerCase()),
    );
  }, [products, catalogSearch]);

  // Dynamic accessories selected/modified by the admin loaded directly from stock, including those with no main category
  const liveAccessories = useMemo(() => {
    const list = products.filter(
      (p) => p.category === "accessories" || !p.category || p.category === "",
    );
    return list.length > 0 ? list : ACCESSORY_ADDONS;
  }, [products]);

  // Dynamic personalized best sellers selected by admin (merged with live modifications)
  const personalisedBestSellers = useMemo(() => {
    const resultList = products.filter(
      (p) => p.isPersonalisedBestSeller === true,
    );

    // Sort by sequence orders
    return resultList.sort((a, b) => {
      const orderA = a.personalisedBestSellerOrder ?? 9999;
      const orderB = b.personalisedBestSellerOrder ?? 9999;
      return orderA - orderB;
    });
  }, [products]);

  // Memoized sorted filtered orders where matching search order IDs come FIRST
  const displayedActiveOrders = useMemo(() => {
    let filteredList = orders;

    // 1. Status Filter
    if (orderStatusFilter === "active") {
      filteredList = orders.filter(
        (o) =>
          o.status !== "Delivered" &&
          !o.status.toLowerCase().includes("cancel"),
      );
    } else if (orderStatusFilter === "delivered") {
      filteredList = orders.filter((o) => o.status === "Delivered");
    } else if (orderStatusFilter === "cancelled") {
      filteredList = orders.filter(
        (o) =>
          o.status.toLowerCase().includes("cancel") ||
          o.status === "Cancelled Due to InAppropriate Reasons",
      );
    } // 'all' includes everyone

    // 2. Date Filter (strictly matches the requested delivery date from the customer)
    if (filterDate) {
      filteredList = filteredList.filter((o) => {
        if (!o.deliveryDate) return false;
        if (o.deliveryDate === filterDate) return true;

        const dDate = new Date(o.deliveryDate);
        const fDate = new Date(filterDate);
        if (!isNaN(dDate.getTime()) && !isNaN(fDate.getTime())) {
          return (
            dDate.getFullYear() === fDate.getFullYear() &&
            dDate.getMonth() === fDate.getMonth() &&
            dDate.getDate() === fDate.getDate()
          );
        }
        return false;
      });
    }

    const trimmed = appliedOrderSearch.trim().toLowerCase();
    if (!trimmed) return filteredList;

    const matched = filteredList.filter((o) =>
      o.id.toLowerCase().includes(trimmed),
    );
    const nonMatchedActive = filteredList.filter(
      (o) => !matched.some((m) => m.id === o.id),
    );

    return [...matched, ...nonMatchedActive];
  }, [orders, appliedOrderSearch, orderStatusFilter, filterDate]);

  // Memoized sorted full audit purchases where matching search order IDs come FIRST
  const displayedPurchases = useMemo(() => {
    const trimmed = appliedOrderSearch.trim().toLowerCase();
    if (!trimmed) return orders;

    const matched = orders.filter((o) => o.id.toLowerCase().includes(trimmed));
    const nonMatched = orders.filter(
      (o) => !matched.some((m) => m.id === o.id),
    );

    return [...matched, ...nonMatched];
  }, [orders, appliedOrderSearch]);

  if (!isOpen) return null;

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert("Provide at least a name and price for the new product.");
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Enter a valid numeric price.");
      return;
    }

    const originalPriceNum = newProdOriginalPrice
      ? parseFloat(newProdOriginalPrice)
      : undefined;

    const generatedId = `custom_cake_${Date.now()}`;
    const isPersonalisedCategory =
      newProdCategory === "personalized_gifts" ||
      newProdCategories.includes("personalized_gifts");
    const hasWeightOptions =
      newProdCategory === "cakes" || newProdCategories.includes("cakes");
    const newProduct: Product = {
      id: generatedId,
      name: newProdName,
      price: priceNum,
      originalPrice: isNaN(originalPriceNum as any)
        ? undefined
        : originalPriceNum,
      category: newProdCategory,
      categories: newProdCategories,
      description:
        newProdDescription || "Fresh premium curated item newly introduced.",
      aboutProduct: newProdAboutProduct || undefined,
      deliveryCare: newProdDeliveryCare || undefined,
      adminNote: newProdAdminNote || undefined,
      deliveryFee: newProdDeliveryFee
        ? parseFloat(newProdDeliveryFee)
        : undefined,
      isTwoHourDelivery: newProdTwoHourDelivery,
      image: newProdImgUrl || "",
      images:
        newProdGalleryUrls || newProdGalleryImages.length > 0
          ? [
              ...(newProdGalleryUrls
                ? newProdGalleryUrls
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : []),
              ...newProdGalleryImages,
            ]
          : undefined,
      rating: parseFloat(newProdRating) || 5.0,
      reviewsCount: Math.floor(Math.random() * 20) + 15, // set a random authentic reviews count like other products
      isPersonalisedBestSeller: newProdIsPersonalisedBestSeller,
      features: ["Freshly Baked", "100% Quality Choice"],
      options: {
        hasWeightOptions: hasWeightOptions,
        hasEgglessOption: hasWeightOptions,
        hasMessageOption: true,
        hasPhotoUpload: newProdPhotoUpload || isPersonalisedCategory,
        hasNameCustomization: newProdNameCustomization,
      },
      weightPrices:
        hasWeightOptions && Object.keys(newProdWeightPrices).length > 0
          ? newProdWeightPrices
          : undefined,
      allowedWeights:
        hasWeightOptions && newProdAllowedWeights.length > 0
          ? newProdAllowedWeights
          : undefined,
      addonProductIds: newProdAddonIds.length > 0 ? newProdAddonIds : undefined,
    };

    onAddProduct(newProduct);

    // Reset parameters
    setNewProdName("");
    setNewProdPrice("");
    setNewProdOriginalPrice("");
    setNewProdRating("5.0");
    setNewProdPhotoUpload(false);
    setNewProdNameCustomization(false);
    setNewProdIsPersonalisedBestSeller(false);
    setNewProdCategories([]);
    setNewProdWeightPrices({});
    setNewCustomWeightInput("");
    setNewProdCustomWeights([]);
    setNewProdAllowedWeights([]);
    setNewProdDescription("");
    setNewProdAboutProduct("");
    setNewProdDeliveryCare("");
    setNewProdAdminNote("");
    setNewProdAddonIds([]);
    setNewProdDeliveryFee("");
    setNewProdTwoHourDelivery(false);
    setNewProdImgUrl("");
    setNewProdGalleryUrls("");
    setNewProdGalleryImages([]);
    alert("Product successfully added!");
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponValue) {
      alert("Provide at least a coupon code and discount value.");
      return;
    }
    const valRatio = parseFloat(newCouponValue);
    if (isNaN(valRatio) || valRatio <= 0) {
      alert("Valid value is required.");
      return;
    }
    const capCode = newCouponCode.trim().toUpperCase();
    const newCoup: Coupon = {
      code: capCode,
      discountType: newCouponType,
      discountValue: valRatio,
      minOrderAmount: newCouponMinOrder
        ? parseFloat(newCouponMinOrder)
        : undefined,
      description: newCouponDesc || undefined,
      isActive: true,
      showInCart: newCouponShowInCart,
    };
    onAddCoupon(newCoup);
    setNewCouponCode("");
    setNewCouponValue("");
    setNewCouponMinOrder("");
    setNewCouponDesc("");
    setNewCouponShowInCart(true);
    alert(`Coupon code ${capCode} is now active and synchronized!`);
  };

  const orderStatuses = [
    "Waiting For Approval From Admin",
    "Order Confirmed",
    "Ready To Shift",
    "Out For Delivery Get Delivery Notification Through Whatsapp or Phone Number",
    "Rider is Nearby",
    "Delivered",
    "Cancelled Due to InAppropriate Reasons",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col items-center justify-end p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Outer wrapper: full height/width on all devices */}
      <div className="bg-white shadow-2xl w-full h-[100dvh] flex flex-col z-10 overflow-hidden">
        {/* SECURE PASSCODE SCREEN (2622 CHECKSTAGE) */}
        {!isUnlocked ? (
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-slate-900 text-slate-100 overflow-y-auto">
            <div className="w-full max-w-sm space-y-8 text-center">
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 bg-pink-600/10 text-pink-500 rounded-full flex items-center justify-center border border-pink-500/20 shadow-md">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                  ROCX SECURITY PORTAL
                </h2>
                <p className="text-xs text-slate-400">
                  Please enter the 4-digit administrator passcode to unlock the
                  terminal database.
                </p>
              </div>

              {/* Security error msg */}
              {securityError && (
                <div className="p-3 bg-red-600/15 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold leading-relaxed">
                  {securityError}
                </div>
              )}

              {/* PIN Code Circles Display */}
              <div className="flex justify-center gap-4 py-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-100 ${
                      passcode.length > i
                        ? "bg-pink-500 border-pink-400 scale-110 shadow-lg shadow-pink-500/50"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              {/* Interactive Pin Touchscreen Keypad (Enhanced for Mobile fingers) */}
              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto pt-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyPress(num)}
                    className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-pink-600 active:text-white rounded-2xl font-mono text-xl font-black text-slate-100 transition shadow-sm border border-slate-700/50 flex items-center justify-center cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="h-14 bg-slate-800/50 text-red-400 hover:text-red-300 font-bold rounded-2xl text-xs transition border border-slate-800 flex items-center justify-center cursor-pointer uppercase select-none"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress("0")}
                  className="h-14 bg-slate-800 hover:bg-slate-700 active:bg-pink-600 active:text-white rounded-2xl font-mono text-xl font-black text-slate-100 transition shadow-sm border border-slate-700/50 flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPasscode}
                  className="h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer uppercase select-none shadow-md"
                >
                  Enter
                </button>
              </div>

              <div className="pt-4 flex items-center justify-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                  Secure Core Verification
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white underline font-medium block mx-auto cursor-pointer"
              >
                Cancel and return to store
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE EXCLUSIVE DATABASE DASHBOARD PANEL (DESIGNED FOR MOBILE & DESKTOP) */
          <>
            {/* Header section (Compact on mobile) */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="bg-pink-600 p-2 rounded-xl text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">
                      ROCX Control Center
                    </h2>
                    {firebaseSyncError ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] font-black tracking-widest bg-rose-500/15 text-rose-400 border border-rose-500/20 uppercase whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>{" "}
                        Error
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[7px] font-black tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase whitespace-nowrap">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>{" "}
                        Live Sync
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-pink-400 font-extrabold tracking-widest uppercase block mt-1">
                    Administrative Command Room
                  </span>
                </div>
              </div>
              <button
                id="close-admin-unlocked-btn"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {firebaseSyncError && (
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-5 py-3.5 flex flex-col gap-1 text-left shrink-0">
                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-[10px] tracking-wider uppercase">
                  <Database className="w-4 h-4 animate-pulse shrink-0" />
                  Firebase Database Syncing Error!
                </div>
                <p className="text-slate-300 text-xs">
                  Bhai check kor details, database sync fail hoche. Nicher main
                  reason direct error copy-te page report korbe:
                </p>
                <code className="bg-slate-950 p-2 rounded-lg font-mono text-[9px] text-rose-300 border border-rose-500/15 overflow-x-auto whitespace-pre-wrap mt-1">
                  {firebaseSyncError}
                </code>
                <p className="text-slate-400 text-[10px] mt-1.5">
                  💡 <strong>How to fix:</strong>
                  <br />• 1. Google <strong>Firebase Console</strong> portal
                  checking-e dynamic authentication list test query active set
                  korun.
                  <br />• 2. <strong>Firestore Database</strong> screen open
                  kore check updates key setup complete block active thakba
                  standard <strong>Test Mode</strong> pattern-e (
                  <code className="text-pink-400 font-mono">
                    allow read, write: if true;
                  </code>
                  ).
                </p>
              </div>
            )}

            {/* Performance metrics banner - Responsive scroll grid */}
            <div className="flex sm:grid sm:grid-cols-4 bg-slate-950 p-3 gap-3 overflow-x-auto shrink-0 select-none scrollbar-thin text-left border-b border-slate-800">
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-3 shrink-0 w-[160px] sm:w-auto">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">
                    Total Turnover
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                    ₹{metrics.totalSales}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-3 shrink-0 w-[140px] sm:w-auto">
                <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">
                    Active Orders
                  </span>
                  <span className="text-sm sm:text-base font-black text-pink-400 font-mono">
                    {metrics.activeOrders}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-3 shrink-0 w-[140px] sm:w-auto">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">
                    Sales Registers
                  </span>
                  <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                    {metrics.totalOrders}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-3 shrink-0 w-[140px] sm:w-auto">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-black block">
                    Catalog Items
                  </span>
                  <span className="text-sm sm:text-base font-black text-indigo-400 font-mono">
                    {metrics.itemCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Administration responsive tabs bar */}
            <div className="flex bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-black tracking-wider uppercase px-2 py-0.5 shrink-0 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>📦 Orders ({orders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "catalog"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🎂 Stock & Prices</span>
              </button>
              <button
                onClick={() => setActiveTab("bestsellers")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "bestsellers"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>💖 Best Sellers</span>
              </button>
              <button
                onClick={() => setActiveTab("gifts_curation")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "gifts_curation"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>👫 Gifts Curation</span>
              </button>
              <button
                onClick={() => setActiveTab("cakes_curation")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "cakes_curation"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🎂 Cakes Curation</span>
              </button>
              <button
                onClick={() => setActiveTab("flowers_curation")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "flowers_curation"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🌸 Flowers Curation</span>
              </button>
              <button
                onClick={() => setActiveTab("purchases")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "purchases"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>📊 Audit Register</span>
              </button>
              <button
                onClick={() => setActiveTab("coupons")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "coupons"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🎟 Coupons Room ({coupons.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "categories"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>📁 Categories ({categories?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("slider")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "slider"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🖼 Slider Banners ({slides?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "gallery"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>✨ Lookbook Gallery ({galleryItems?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🛠 Store Customizer</span>
              </button>
              <button
                onClick={() => setActiveTab("delivery")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "delivery"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🚚 Delivery & Pricing</span>
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "reviews"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>⭐ Reviews</span>
              </button>
              <button
                onClick={() => setActiveTab("riders")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "riders"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🛵 Riders Panel ({riders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("sellers")}
                className={`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer ${
                  activeTab === "sellers"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <span>🏬 Sellers ({sellers.length})</span>
              </button>
            </div>

            {/* Scrolling panel dashboard content - WITH GENERATIVE MOBILE SIZE PRECAUTIONS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 text-left">
              {/* TAB 1: LIVE ORDERS MANAGER */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
                      Active Transacting Orders
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Manage real-time dispatch progress. Status upgrades
                      trigger live client timeline visuals.
                    </p>
                  </div>

                  {/* Status Filters and Date Picker Row */}
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-3.5 rounded-2.5xl border border-slate-150 shadow-sm font-sans">
                    {/* Status filter tabs */}
                    <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      {[
                        {
                          id: "active",
                          label: "Active Orders",
                          count: orders.filter(
                            (o) =>
                              o.status !== "Delivered" &&
                              !o.status.toLowerCase().includes("cancel"),
                          ).length,
                        },
                        {
                          id: "delivered",
                          label: "Delivered",
                          count: orders.filter((o) => o.status === "Delivered")
                            .length,
                        },
                        {
                          id: "cancelled",
                          label: "Cancelled Orders",
                          count: orders.filter(
                            (o) =>
                              o.status.toLowerCase().includes("cancel") ||
                              o.status ===
                                "Cancelled Due to InAppropriate Reasons",
                          ).length,
                        },
                        {
                          id: "all",
                          label: "All Orders",
                          count: orders.length,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setOrderStatusFilter(tab.id as any)}
                          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            orderStatusFilter === tab.id
                              ? "bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>

                    {/* Date picker filter */}
                    <div className="flex items-center gap-2 w-full md:w-auto font-sans">
                      <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 block text-left">
                        Filter by Date:
                      </span>
                      <div className="relative flex items-center gap-1.5 w-full md:w-auto">
                        <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer w-full md:w-44"
                        />
                        {filterDate && (
                          <button
                            type="button"
                            onClick={() => setFilterDate("")}
                            className="p-1 px-2.5 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg shrink-0 cursor-pointer"
                            title="Clear Date"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEARCH ORDER ID BAR */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAppliedOrderSearch(orderSearch);
                    }}
                    className="flex gap-2 max-w-md bg-white p-1 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <div className="relative flex-1 flex items-center pl-3">
                      <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={orderSearch}
                        onChange={(e) => {
                          setOrderSearch(e.target.value);
                          if (!e.target.value.trim()) {
                            setAppliedOrderSearch("");
                          }
                        }}
                        className="w-full text-xs font-bold text-slate-700 placeholder-slate-400 bg-transparent py-2 focus:outline-none border-none"
                      />
                      {orderSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrderSearch("");
                            setAppliedOrderSearch("");
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer mr-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition duration-150 cursor-pointer shrink-0"
                    >
                      Search
                    </button>
                  </form>

                  {appliedOrderSearch.trim() && (
                    <div className="flex items-center gap-2 text-xs text-pink-700 bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-xl w-fit font-black uppercase">
                      <span>Showing results for: "{appliedOrderSearch}"</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderSearch("");
                          setAppliedOrderSearch("");
                        }}
                        className="p-0.5 bg-pink-100 hover:bg-pink-200 rounded-full transition duration-150"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {displayedActiveOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                      <ShoppingBag className="w-10.5 h-10.5 text-slate-300 mx-auto mb-2" />
                      <h4 className="font-extrabold text-slate-600 text-xs">
                        No active orders yet
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Book an order from the front cart and view it register
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:gap-4">
                      {displayedActiveOrders.map((order) => {
                        const isSearchResult =
                          appliedOrderSearch.trim() &&
                          order.id
                            .toLowerCase()
                            .includes(appliedOrderSearch.trim().toLowerCase());
                        return (
                          <div
                            key={order.id}
                            className={`bg-white rounded-2.5xl p-4.5 sm:p-5 shadow-sm flex flex-col md:flex-row justify-between gap-4 transition-all duration-300 ${
                              isSearchResult
                                ? "border-2 border-pink-500 ring-4 ring-pink-50"
                                : "border border-slate-200"
                            }`}
                          >
                            <div className="space-y-3 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-slate-900 text-white font-mono text-[11px] font-black py-0.5 px-2 rounded-lg">
                                  {order.id}
                                </span>
                                {isSearchResult && (
                                  <span className="bg-pink-600 text-white text-[9px] font-black uppercase py-0.5 px-2 rounded-md flex items-center gap-1 animate-pulse">
                                    🔍 Search Match
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {order.date}
                                </span>
                                <span className="bg-pink-50 text-pink-700 text-[9px] font-black uppercase py-0.5 px-2.5 rounded-full border border-pink-100">
                                  {order.status}
                                </span>
                                {order.assignedRiderName ? (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase py-0.5 px-2.5 rounded-full border border-amber-200 flex items-center gap-1">
                                    🛵 {order.assignedRiderName}
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase py-0.5 px-2.5 rounded-full border border-slate-200">
                                    No Rider Assigned
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                <div>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                    Customer Name
                                  </span>
                                  <strong className="text-slate-800 font-extrabold block mt-0.5">
                                    {order.customerName || "N/A"}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                    Customer Phone
                                  </span>
                                  <span className="text-slate-800 font-mono font-bold block mt-0.5">
                                    {order.customerPhone || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                    Consignee Name
                                  </span>
                                  <strong className="text-slate-800 font-extrabold block mt-0.5">
                                    {order.recipientName}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                    Consignee Phone
                                  </span>
                                  <span className="text-slate-800 font-mono font-bold block mt-0.5">
                                    {order.recipientPhone}
                                  </span>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                    Payment Mode
                                  </span>
                                  <span className="text-slate-700 font-semibold block mt-0.5">
                                    {order.paymentMode === "cash"
                                      ? "Cash on Delivery (COD)"
                                      : order.paymentMode === "upi"
                                        ? "UPI (Google Pay/PhonePe)"
                                        : order.paymentMode}
                                  </span>
                                </div>
                                <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="sm:col-span-2">
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                      Shipping Street Address
                                    </span>
                                    <span className="text-slate-700 font-semibold text-[11px] leading-relaxed block mt-0.5">
                                      {order.streetAddress}
                                    </span>
                                  </div>
                                  {order.city && (
                                    <div>
                                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                        City
                                      </span>
                                      <span className="text-slate-700 font-semibold block mt-0.5">
                                        {order.city}
                                      </span>
                                    </div>
                                  )}
                                  {order.pincode && (
                                    <div>
                                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                        Pincode
                                      </span>
                                      <span className="text-slate-700 font-semibold block mt-0.5">
                                        {order.pincode}
                                      </span>
                                    </div>
                                  )}
                                  {order.deliveryDate && (
                                    <div>
                                      <span className="text-[9px] text-pink-500 uppercase font-bold block">
                                        Requested Delivery Date
                                      </span>
                                      <span className="text-pink-700 font-black text-[12px] block mt-0.5">
                                        📅 {order.deliveryDate}
                                      </span>
                                    </div>
                                  )}
                                  {order.deliveryTimeSlot && (
                                    <div>
                                      <span className="text-[9px] text-violet-500 uppercase font-bold block">
                                        Requested Time Slot
                                      </span>
                                      <span className="text-violet-700 font-black text-[12px] block mt-0.5">
                                        🕒 {order.deliveryTimeSlot}
                                      </span>
                                    </div>
                                  )}
                                  {order.landmark && (
                                    <div className="sm:col-span-2">
                                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                                        Landmark
                                      </span>
                                      <span className="text-slate-700 font-semibold block mt-0.5">
                                        {order.landmark}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100">
                                <span className="text-[9px] text-slate-450 uppercase font-black block mb-1.5">
                                  Purchased Cake / Combo Products
                                </span>
                                <div className="space-y-2">
                                  {order.items.map((it, i) => (
                                    <div
                                      key={i}
                                      className="bg-slate-50 border border-slate-150 p-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-800 leading-snug"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {/* Catalog original picture */}
                                        <img
                                          src={
                                            it.productImage ||
                                            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80"
                                          }
                                          alt={it.name}
                                          className="w-9 h-9 object-cover rounded-lg border border-slate-200 bg-white shrink-0 shadow-3xs"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80";
                                          }}
                                        />
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-[10px] bg-slate-900 text-white font-extrabold px-1.5 py-0.5 rounded">
                                              x{it.quantity}
                                            </span>
                                            <strong className="text-slate-850 font-black truncate">
                                              {it.name}
                                            </strong>
                                          </div>
                                          {it.options && (
                                            <p className="text-[9.5px] text-slate-500 font-mono mt-0.5 truncate max-w-sm">
                                              ({it.options})
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Customer custom photo attachment preview */}
                                      {it.photoUrl && (
                                        <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 p-1.5 rounded-lg shrink-0 font-sans ml-1 sm:ml-0 self-start sm:self-auto">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[8px] font-black uppercase text-pink-700 tracking-wider">
                                              Customer Photo:
                                            </span>
                                            <img
                                              src={it.photoUrl}
                                              alt="Customer uploaded"
                                              className="w-8 h-8 object-cover rounded-md border border-pink-200 bg-white shrink-0 shadow-3xs"
                                              onError={(e) => {
                                                (
                                                  e.target as HTMLImageElement
                                                ).src =
                                                  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&q=80";
                                              }}
                                            />
                                          </div>
                                          <a
                                            href={it.photoUrl}
                                            download={`order_${order.id}_photo.jpg`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const a =
                                                document.createElement("a");
                                              a.href = it.photoUrl as string;
                                              a.download = `order_${order.id}_photo.jpg`;
                                              document.body.appendChild(a);
                                              a.click();
                                              document.body.removeChild(a);
                                            }}
                                            className="bg-white hover:bg-pink-100 text-pink-700 px-2 py-1 border border-pink-200 rounded text-[9px] font-black tracking-wide uppercase transition-colors shrink-0 shadow-xs"
                                          >
                                            Download
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 sm:pt-0 md:w-[220px] border-t md:border-t-0 md:border-l border-slate-100 pl-0 md:pl-4 flex flex-col justify-between gap-3">
                              <div className="flex flex-col gap-2">
                                <div>
                                  <span className="text-[9px] text-slate-400 uppercase font-black block">
                                    Bill Payment ({order.paymentMode})
                                  </span>
                                  <div className="flex flex-col gap-1 mt-1 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                      <span>Product Price:</span>
                                      <span className="font-semibold">₹{order.itemsSubtotal || (order.total - (order.deliveryFee || 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                      <span>Delivery Fee:</span>
                                      <span className="font-semibold">₹{order.deliveryFee || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-900 border-t border-slate-100 pt-1 mt-1">
                                      <span className="font-black">Total Price:</span>
                                      <span className="font-black text-base">₹{order.total}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center mt-1">
                                  <span className="text-[10px] font-black text-emerald-805 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                    Paid &amp; Verified
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] text-slate-400 uppercase font-black block">
                                  Update Dispatch State
                                </label>
                                <select
                                  id={`status-update-combobox-${order.id}`}
                                  value={order.status}
                                  onChange={(e) =>
                                    onUpdateOrderStatus(
                                      order.id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full text-xs font-black py-3 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer text-slate-800"
                                >
                                  {orderStatuses.map((os) => (
                                    <option key={os} value={os}>
                                      {os}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] text-amber-600 uppercase font-black block flex items-center gap-1">
                                  🛵 Assign Delivery Rider
                                </label>
                                <select
                                  value={order.assignedRiderId || ""}
                                  onChange={(e) => {
                                    const riderId = e.target.value;
                                    const matchingRider = riders.find(
                                      (r) => r.id === riderId,
                                    );
                                    const riderName = matchingRider
                                      ? matchingRider.name
                                      : "";
                                    if (onAssignRider) {
                                      onAssignRider(
                                        order.id,
                                        riderId,
                                        riderName,
                                      );
                                    }
                                  }}
                                  className="w-full text-xs font-black py-3 px-3 bg-amber-50/70 border border-amber-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer text-amber-900"
                                >
                                  <option
                                    value=""
                                    className="text-slate-400 font-bold"
                                  >
                                    Unassigned (Click to Assign)
                                  </option>
                                  {riders.map((rider) => (
                                    <option
                                      key={rider.id}
                                      value={rider.id}
                                      className="text-slate-800 font-bold"
                                    >
                                      {rider.name}{" "}
                                      {rider.email ? `(${rider.email})` : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB ORG: PERSONALIZED BEST SELLERS MANAGER */}
              {activeTab === "bestsellers" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm text-left">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-tight">
                      <span>💖</span> Personalized Best Sellers Sequence
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Arrange products and feature new ones at the beginning of
                      the slider. Left-to-right carousel display strictly
                      follows the ascending sequence numbering below.
                    </p>

                    <div className="mt-5 space-y-3">
                      {personalisedBestSellers.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl">
                          No products promoted to Best Sellers list yet. Choose
                          catalog items to showcase.
                        </div>
                      ) : (
                        personalisedBestSellers.map((prod, idx) => {
                          const originalSeq =
                            prod.personalisedBestSellerOrder ?? idx + 1;
                          return (
                            <div
                              key={prod.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                                  <img
                                    src={prod.image}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    alt=""
                                  />
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-800 line-clamp-1">
                                    {prod.name}
                                  </h4>
                                  <span className="text-[10px] text-pink-700 font-bold bg-pink-50 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                                    {prod.category}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
                                    Sequence Order:
                                  </span>
                                  <input
                                    type="number"
                                    min="1"
                                    className="w-14 p-1.5 text-center text-xs font-black font-mono bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-pink-500"
                                    value={originalSeq}
                                    onChange={(e) => {
                                      const newOrder =
                                        parseInt(e.target.value) || 1;
                                      onUpdateProduct({
                                        ...prod,
                                        personalisedBestSellerOrder: newOrder,
                                        isPersonalisedBestSeller: true,
                                      });
                                    }}
                                  />
                                </div>

                                <button
                                  onClick={() => {
                                    onUpdateProduct({
                                      ...prod,
                                      isPersonalisedBestSeller: false,
                                    });
                                    alert(
                                      "Removed from Personalized Best Sellers list.",
                                    );
                                  }}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition duration-150 cursor-pointer"
                                  title="Remove Best Seller"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm text-left">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-tight">
                      <span>➕</span> Promote Store Products
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Search any library product in the active catalog and
                      instantly promote them to exhibit in the Best Sellers
                      collection.
                    </p>

                    <div className="mt-4">
                      {(() => {
                        const activeBestsellerIds = new Set(
                          personalisedBestSellers.map((p) => p.id),
                        );
                        const remainderProducts = products.filter(
                          (p) => !activeBestsellerIds.has(p.id),
                        );

                        if (remainderProducts.length === 0) {
                          return (
                            <p className="text-xs text-center py-4 text-slate-400 font-mono">
                              All products are already featured!
                            </p>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {remainderProducts.map((prod) => (
                              <div
                                key={prod.id}
                                className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-slate-250 shrink-0">
                                    <img
                                      src={prod.image}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      alt=""
                                    />
                                  </div>
                                  <div className="truncate text-left text-xs">
                                    <h5
                                      className="font-bold text-slate-800 truncate"
                                      title={prod.name}
                                    >
                                      {prod.name}
                                    </h5>
                                    <span className="text-[9px] text-slate-400 font-mono uppercase">
                                      {prod.category}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    onUpdateProduct({
                                      ...prod,
                                      isPersonalisedBestSeller: true,
                                      personalisedBestSellerOrder: 1, // default at the front list!
                                    });
                                    alert(
                                      `"${prod.name}" successfully promoted! Featured at the beginning.`,
                                    );
                                  }}
                                  className="px-2.5 py-1.5 text-[9.5px] font-black uppercase text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg shrink-0 cursor-pointer transition"
                                >
                                  Feature
                                </button>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "gifts_curation" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm text-left">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-tight mb-4">
                      <span>👫</span> Gifts for Him & Her Curation
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 font-semibold">Select products to feature under the Gifts for Him and Gifts for Her banners on the homepage.</p>

                    <div className="relative mb-6">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          const items = document.querySelectorAll(".gifts-curation-item");
                          items.forEach((item) => {
                            const title = item.getAttribute("data-name")?.toLowerCase() || "";
                            if (title.includes(val)) {
                              (item as HTMLElement).style.display = "flex";
                            } else {
                              (item as HTMLElement).style.display = "none";
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {products.map((prod) => {
                        const isHim = prod.categories?.includes("gifts_for_him") || prod.category === "gifts_for_him";
                        const isHer = prod.categories?.includes("gifts_for_her") || prod.category === "gifts_for_her";
                        return (
                          <div
                            key={prod.id}
                            data-name={prod.name}
                            className="gifts-curation-item flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl"
                          >
                            <div className="flex items-center gap-3 w-1/2">
                              <img src={prod.image} className="w-12 h-12 object-cover rounded-xl" alt={prod.name} />
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{prod.name}</h4>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{prod.category}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const cats = prod.categories ? [...prod.categories] : [];
                                  if (isHim) {
                                    const idx = cats.indexOf("gifts_for_him");
                                    if (idx > -1) cats.splice(idx, 1);
                                  } else {
                                    if (!cats.includes("gifts_for_him")) cats.push("gifts_for_him");
                                  }
                                  onUpdateProduct({ ...prod, categories: cats });
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border ${isHim ? "bg-sky-500 text-white border-sky-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isHim ? "✓ In Him" : "+ Him"}
                              </button>
                              <button
                                onClick={() => {
                                  const cats = prod.categories ? [...prod.categories] : [];
                                  if (isHer) {
                                    const idx = cats.indexOf("gifts_for_her");
                                    if (idx > -1) cats.splice(idx, 1);
                                  } else {
                                    if (!cats.includes("gifts_for_her")) cats.push("gifts_for_her");
                                  }
                                  onUpdateProduct({ ...prod, categories: cats });
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border ${isHer ? "bg-pink-500 text-white border-pink-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isHer ? "✓ In Her" : "+ Her"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "cakes_curation" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm text-left">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-tight mb-4">
                      <span>🎂</span> Cakes Curation
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 font-semibold">Select products to feature under Cakes for Him, Cakes for Her, and Cakes with Flowers sections.</p>

                    <div className="relative mb-6">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          const items = document.querySelectorAll(".cakes-curation-item");
                          items.forEach((item) => {
                            const title = item.getAttribute("data-name")?.toLowerCase() || "";
                            if (title.includes(val)) {
                              (item as HTMLElement).style.display = "flex";
                            } else {
                              (item as HTMLElement).style.display = "none";
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {products.map((prod) => {
                        const isHim = prod.categories?.includes("cakes_for_him") || prod.category === "cakes_for_him";
                        const isHer = prod.categories?.includes("cakes_for_her") || prod.category === "cakes_for_her";
                        const isFlowers = prod.categories?.includes("cakes_with_flowers") || prod.category === "cakes_with_flowers";
                        return (
                          <div
                            key={prod.id}
                            data-name={prod.name}
                            className="cakes-curation-item flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl flex-wrap gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-[150px]">
                              <img src={prod.image} className="w-12 h-12 object-cover rounded-xl" alt={prod.name} />
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1 max-w-[150px]">{prod.name}</h4>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{prod.category}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => {
                                  const cats = prod.categories ? [...prod.categories] : [];
                                  if (isHim) {
                                    const idx = cats.indexOf("cakes_for_him");
                                    if (idx > -1) cats.splice(idx, 1);
                                  } else {
                                    if (!cats.includes("cakes_for_him")) cats.push("cakes_for_him");
                                  }
                                  onUpdateProduct({ ...prod, categories: cats });
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border ${isHim ? "bg-sky-500 text-white border-sky-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isHim ? "✓ In Him" : "+ Him"}
                              </button>
                              <button
                                onClick={() => {
                                  const cats = prod.categories ? [...prod.categories] : [];
                                  if (isHer) {
                                    const idx = cats.indexOf("cakes_for_her");
                                    if (idx > -1) cats.splice(idx, 1);
                                  } else {
                                    if (!cats.includes("cakes_for_her")) cats.push("cakes_for_her");
                                  }
                                  onUpdateProduct({ ...prod, categories: cats });
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border ${isHer ? "bg-pink-500 text-white border-pink-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isHer ? "✓ In Her" : "+ Her"}
                              </button>
                              <button
                                onClick={() => {
                                  const cats = prod.categories ? [...prod.categories] : [];
                                  if (isFlowers) {
                                    const idx = cats.indexOf("cakes_with_flowers");
                                    if (idx > -1) cats.splice(idx, 1);
                                  } else {
                                    if (!cats.includes("cakes_with_flowers")) cats.push("cakes_with_flowers");
                                  }
                                  onUpdateProduct({ ...prod, categories: cats });
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border ${isFlowers ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isFlowers ? "✓ With Flowers" : "+ With Flowers"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "flowers_curation" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm text-left">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-tight mb-4">
                      <span>🌸</span> Flowers Curation
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 font-semibold">Select products to feature under Flowers with Cakes and Flowers with Chocolates sections.</p>

                    <div className="relative mb-6">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          const items = document.querySelectorAll(".flowers-curation-item");
                          items.forEach((item) => {
                            const title = item.getAttribute("data-name")?.toLowerCase() || "";
                            if (title.includes(val)) {
                              (item as HTMLElement).style.display = "flex";
                            } else {
                              (item as HTMLElement).style.display = "none";
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {products.map((prod) => {
                        const isCakes = prod.categories?.includes("flowers_with_cakes") || prod.category === "flowers_with_cakes";
                        const isChocolates = prod.categories?.includes("flowers_with_chocolates") || prod.category === "flowers_with_chocolates";
                        return (
                          <div
                            key={prod.id}
                            data-name={prod.name}
                            className="flowers-curation-item flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl flex-wrap gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-[150px]">
                              <img src={prod.image} className="w-12 h-12 object-cover rounded-xl" alt={prod.name} />
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1 max-w-[150px]">{prod.name}</h4>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{prod.category}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => {
                                  const cats = prod.categories ? [...prod.categories] : [];
                                  if (isCakes) {
                                    const idx = cats.indexOf("flowers_with_cakes");
                                    if (idx > -1) cats.splice(idx, 1);
                                  } else {
                                    if (!cats.includes("flowers_with_cakes")) cats.push("flowers_with_cakes");
                                  }
                                  onUpdateProduct({ ...prod, categories: cats });
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border ${isCakes ? "bg-amber-500 text-white border-amber-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isCakes ? "✓ With Cakes" : "+ With Cakes"}
                              </button>
                              <button
                                onClick={() => {
                                  const cats = prod.categories ? [...prod.categories] : [];
                                  if (isChocolates) {
                                    const idx = cats.indexOf("flowers_with_chocolates");
                                    if (idx > -1) cats.splice(idx, 1);
                                  } else {
                                    if (!cats.includes("flowers_with_chocolates")) cats.push("flowers_with_chocolates");
                                  }
                                  onUpdateProduct({ ...prod, categories: cats });
                                }}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border ${isChocolates ? "bg-purple-500 text-white border-purple-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                              >
                                {isChocolates ? "✓ With Chocolates" : "+ With Chocolates"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* TAB 2: CATALOG STOCK MANAGER */}
              {activeTab === "catalog" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Register Item form card */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 p-4.5 sm:p-5 rounded-2.5xl space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
                      <PlusCircle className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs sm:text-xs font-black uppercase tracking-wider">
                        Add Item To Catalog Database
                      </h4>
                    </div>

                    <form
                      onSubmit={handleAddNewProduct}
                      className="space-y-4 text-xs"
                    >
                      <div className="space-y-1">
                        <label className="font-extrabold text-slate-700 block">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          placeholder="E.g. Strawberry Velvet Cream Cake"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-700 block">
                            Base Price (₹) *
                          </label>
                          <input
                            type="number"
                            placeholder="649"
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-705 block">
                            Old Price (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 799"
                            value={newProdOriginalPrice}
                            onChange={(e) =>
                              setNewProdOriginalPrice(e.target.value)
                            }
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-700 block">
                            Primary Category (Optional)
                          </label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => {
                              const selected = e.target.value as CategoryID;
                              setNewProdCategory(selected);
                              if (selected) {
                                // clear if primary changes to prevent conflicts
                                setNewProdCategories((prev) =>
                                  prev.filter((c) => c !== selected),
                                );
                              }
                            }}
                            className="w-full text-xs font-bold p-3 bg-white border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                          >
                            <option value="">None (Subcategory only)</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-extrabold text-slate-700 block">
                          Product Rating (1.0 - 5.0) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          placeholder="5.0"
                          value={newProdRating}
                          onChange={(e) => setNewProdRating(e.target.value)}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                          required
                        />
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                        <div>
                          <label className="font-extrabold text-slate-705 block text-[10px] uppercase">
                            Enable Customize Photo Upload
                          </label>
                          <span className="text-[9px] text-slate-400 font-bold block">
                            Allow upload of customer photos
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={newProdPhotoUpload}
                          onChange={(e) =>
                            setNewProdPhotoUpload(e.target.checked)
                          }
                          className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                        <div>
                          <label className="font-extrabold text-slate-705 block text-[10px] uppercase">
                            Enable Name Customization (Write on Cake)
                          </label>
                          <span className="text-[9px] text-slate-400 font-bold block">
                            Allow customers to enter a name to print/write in
                            checkout
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={newProdNameCustomization}
                          onChange={(e) =>
                            setNewProdNameCustomization(e.target.checked)
                          }
                          className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                        <div>
                          <label className="font-extrabold text-[#111827] block text-[10px] uppercase">
                            💖 Show in Personalised Best Sellers
                          </label>
                          <span className="text-[9px] text-slate-400 font-bold block">
                            Display in Personalised Best Sellers slider on
                            homepage
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={newProdIsPersonalisedBestSeller}
                          onChange={(e) =>
                            setNewProdIsPersonalisedBestSeller(e.target.checked)
                          }
                          className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                        <label className="font-extrabold text-slate-700 block mb-0.5">
                          Show in other categories too (Multi-select)
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                          {allPossibleSecondaryCategories.map((cat) => {
                            if (cat.id === newProdCategory) return null;
                            const isChecked = newProdCategories.includes(
                              cat.id,
                            );
                            return (
                              <label
                                key={cat.id}
                                className="flex items-center gap-2 cursor-pointer select-none p-1.5 hover:bg-slate-200/50 rounded-lg"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setNewProdCategories(
                                        newProdCategories.filter(
                                          (c) => c !== cat.id,
                                        ),
                                      );
                                    } else {
                                      setNewProdCategories([
                                        ...newProdCategories,
                                        cat.id,
                                      ]);
                                    }
                                  }}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="font-semibold text-slate-700 text-[10.5px]">
                                  {cat.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {(newProdCategory === "cakes" ||
                        newProdCategories.includes("cakes")) && (
                        <div className="border border-pink-100 bg-pink-50/20 rounded-2xl p-4 space-y-3 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-pink-950 font-black uppercase tracking-wider block">
                              🎂 Cake Weight Prices Grid (Optional)
                            </span>
                            <span className="text-[8px] bg-pink-100 text-pink-700 font-extrabold px-1.5 py-0.5 rounded tracking-widest block font-mono">
                              CUSTOM PRICE FOR EACH WEIGHT
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                            Specify individual custom prices for different
                            weights. If left blank, the app will auto-calculate
                            them using the base price multiplier!
                          </p>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            {Array.from(
                              new Set([
                                "0.5 Kg",
                                "1.0 Kg",
                                "1.5 Kg",
                                "2.0 Kg",
                                "2.5 Kg",
                                "3.0 Kg",
                                ...newProdCustomWeights,
                              ]),
                            ).map((wt) => {
                              const currentVal =
                                newProdWeightPrices[wt] !== undefined
                                  ? newProdWeightPrices[wt]
                                  : "";
                              return (
                                <div key={wt} className="space-y-1">
                                  <label className="text-[9px] text-slate-550 font-extrabold block uppercase tracking-wide">
                                    {wt} Price (₹)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Auto-calculated"
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val =
                                        e.target.value === ""
                                          ? undefined
                                          : parseFloat(e.target.value);
                                      const nextPrices = {
                                        ...newProdWeightPrices,
                                      };
                                      if (val === undefined) {
                                        delete nextPrices[wt];
                                      } else {
                                        nextPrices[wt] = val;
                                      }
                                      setNewProdWeightPrices(nextPrices);
                                    }}
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black font-mono focus:ring-1 focus:ring-pink-500"
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div className="space-y-2 border-t border-pink-100/30 pt-3 mt-3">
                            <span className="text-[10px] text-pink-950 font-black uppercase tracking-wider block">
                              🎂 Visible Weight Options Config (Optional)
                            </span>
                            <p className="text-[9.5px] text-pink-800 font-semibold leading-none">
                              Select which weights will be shown. If empty, all
                              standard options (0.5 Kg to 3.0 Kg) will show.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-1">
                              {Array.from(
                                new Set([
                                  "0.5 Kg",
                                  "1.0 Kg",
                                  "1.5 Kg",
                                  "2.0 Kg",
                                  "2.5 Kg",
                                  "3.0 Kg",
                                  ...newProdCustomWeights,
                                ]),
                              ).map((wt) => {
                                const isChecked =
                                  newProdAllowedWeights.includes(wt);
                                return (
                                  <label
                                    key={wt}
                                    className="flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setNewProdAllowedWeights(
                                            newProdAllowedWeights.filter(
                                              (w) => w !== wt,
                                            ),
                                          );
                                        } else {
                                          setNewProdAllowedWeights([
                                            ...newProdAllowedWeights,
                                            wt,
                                          ]);
                                        }
                                      }}
                                      className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 w-3.5 h-3.5"
                                    />
                                    <span className="text-[10.5px] font-bold text-slate-700">
                                      {wt}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1">
                              Add Custom Weight/Size (e.g. "4.0 Kg", "Tiered
                              5kg")
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="..."
                                value={newCustomWeightInput}
                                onChange={(e) =>
                                  setNewCustomWeightInput(e.target.value)
                                }
                                className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    newCustomWeightInput.trim() &&
                                    !newProdCustomWeights.includes(
                                      newCustomWeightInput.trim(),
                                    )
                                  ) {
                                    setNewProdCustomWeights([
                                      ...newProdCustomWeights,
                                      newCustomWeightInput.trim(),
                                    ]);
                                    setNewCustomWeightInput("");
                                  }
                                }}
                                className="px-3 py-2 bg-pink-50 text-pink-700 font-bold text-xs rounded-lg hover:bg-pink-100"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="font-extrabold text-slate-700 block">
                          Product Picture *
                        </label>
                        <div className="flex flex-col gap-2">
                          <input
                            id="admin-product-file"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                try {
                                  const base64 = await compressImageFile(
                                    file,
                                    800,
                                    0.6,
                                  );
                                  setNewProdImgUrl(base64);
                                } catch (err) {
                                  console.error(
                                    "Product image compression failed:",
                                    err,
                                  );
                                  alert(
                                    "Image upload failed. The photo might be too large or unsupported (HEIC). Please try another photo.",
                                  );
                                }
                              }
                            }}
                            className="text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                          />
                          {newProdImgUrl && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white">
                              <img
                                src={newProdImgUrl}
                                className="w-full h-full object-cover"
                                alt="Uploaded preview"
                              />
                              <button
                                type="button"
                                onClick={() => setNewProdImgUrl("")}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 cursor-pointer hover:bg-red-600"
                                aria-label="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <input
                            type="text"
                            placeholder="Or paste web image URL instead"
                            value={
                              (newProdImgUrl || "").startsWith("data:")
                                ? ""
                                : newProdImgUrl || ""
                            }
                            onChange={(e) => setNewProdImgUrl(e.target.value)}
                            className="w-full text-[10px] p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-1 mt-3 flex flex-col gap-2">
                          <label className="font-extrabold text-slate-700 block text-xs">
                            Additional Gallery Images
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={async (e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                try {
                                  const newBase64s = await Promise.all(
                                    Array.from(e.target.files).map(
                                      (file: any) =>
                                        compressImageFile(file, 800, 0.6),
                                    ),
                                  );
                                  setNewProdGalleryImages([
                                    ...newProdGalleryImages,
                                    ...newBase64s,
                                  ]);
                                } catch (err) {
                                  console.error("Gallery compress fail:", err);
                                }
                              }
                            }}
                            className="text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                          />
                          {newProdGalleryImages &&
                            newProdGalleryImages.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {newProdGalleryImages.map((img, idx) => (
                                  <div
                                    key={idx}
                                    className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200"
                                  >
                                    <img
                                      src={img}
                                      className="w-full h-full object-cover"
                                      alt="Gallery preview"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = [
                                          ...newProdGalleryImages,
                                        ];
                                        newImages.splice(idx, 1);
                                        setNewProdGalleryImages(newImages);
                                      }}
                                      className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[8px]"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          <input
                            type="text"
                            placeholder="Comma separated image URLs (optional)"
                            value={newProdGalleryUrls}
                            onChange={(e) =>
                              setNewProdGalleryUrls(e.target.value)
                            }
                            className="w-full text-[10px] p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-700 block text-[11px] uppercase tracking-wide">
                            About Product (Tab 1)
                          </label>
                          <textarea
                            placeholder="General information about the item..."
                            value={newProdAboutProduct}
                            onChange={(e) =>
                              setNewProdAboutProduct(e.target.value)
                            }
                            rows={2}
                            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-700 block text-[11px] uppercase tracking-wide">
                            Delivery & Care (Tab 2)
                          </label>
                          <textarea
                            placeholder="Delivery info, handling instructions..."
                            value={newProdDeliveryCare}
                            onChange={(e) =>
                              setNewProdDeliveryCare(e.target.value)
                            }
                            rows={2}
                            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-700 block text-[11px] uppercase tracking-wide">
                            Detailed Description (Tab 3)
                          </label>
                          <textarea
                            placeholder="E.g. Fresh milk butter premium quality chocolate garnish..."
                            value={newProdDescription}
                            onChange={(e) =>
                              setNewProdDescription(e.target.value)
                            }
                            rows={2}
                            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-extrabold text-pink-600 block text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                          Admin Delivery/Checkout Note (Optional)
                        </label>
                        <textarea
                          placeholder="E.g. Prep time: 3 hours. Order by 4 PM for same-day delivery."
                          value={newProdAdminNote}
                          onChange={(e) => setNewProdAdminNote(e.target.value)}
                          rows={2}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-400 bg-pink-50/10 text-pink-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-extrabold text-slate-705 block text-[10px] uppercase">
                            Unique Delivery Fee (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="Optional (e.g. 50)"
                            value={newProdDeliveryFee}
                            onChange={(e) =>
                              setNewProdDeliveryFee(e.target.value)
                            }
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                          />
                        </div>

                        <div className="flex flex-col justify-center items-center p-3 border border-slate-200 rounded-xl bg-slate-50 gap-2">
                          <div className="flex items-center gap-2">
                            <label className="font-extrabold text-slate-705 text-[10px] uppercase cursor-pointer">
                              2 Hours Delivery
                            </label>
                            <input
                              type="checkbox"
                              checked={newProdTwoHourDelivery}
                              onChange={(e) =>
                                setNewProdTwoHourDelivery(e.target.checked)
                              }
                              className="w-4 h-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-150 cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Item To Storefront
                      </button>
                    </form>
                  </div>

                  {/* Stock listings with pricing manager */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 p-4.5 sm:p-5 rounded-2.5xl space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between border-b border-slate-105 pb-3">
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-pink-600" />
                        Stock Catalog Database ({filteredCatalog.length})
                      </h4>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Search stock list..."
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                          className="p-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 w-full sm:max-w-[180px]"
                        />
                      </div>
                    </div>

                    {/* Stock items scrolling container with beautiful visible scroll targets */}
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {filteredCatalog.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 border border-slate-100 rounded-xl flex items-center justify-between gap-3 bg-slate-50/50"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover object-center border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 text-left">
                              <h5
                                className="text-xs font-bold text-slate-805 truncate"
                                title={prod.name}
                              >
                                {prod.name}
                              </h5>
                              <span className="text-[8.5px] bg-slate-100 text-slate-700 font-extrabold uppercase px-1.5 py-0.5 rounded block w-fit mt-0.5">
                                {prod.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-xs font-black text-slate-950">
                              ₹{prod.price}
                            </span>

                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-1 px-1.5 border border-indigo-100 text-indigo-650 hover:bg-indigo-50/60 rounded-lg transition duration-150 cursor-pointer text-[10px] font-black uppercase flex items-center gap-1 shrink-0"
                              title="Full Edit Database Config"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Full Edit
                            </button>

                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: "Delete Product",
                                  message: `Are you absolutely sure you want to delete "${prod.name}" from the storefront database?`,
                                  onConfirm: () => onDeleteProduct(prod.id),
                                });
                              }}
                              className="p-1.5 border border-red-105 text-red-500 hover:bg-red-50 hover:text-red-650 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT PURCHASE REGISTER */}
              {activeTab === "purchases" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
                      Transactional Customer Register
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Archived register history of verified customer checkouts.
                      Keep track of payouts and daily margins.
                    </p>
                  </div>

                  {/* Interactive responsive grid replacement over HTML tables for absolute mobile dream scrolling */}
                  <div className="bg-white border border-slate-200 rounded-2.5xl overflow-hidden shadow-xs">
                    {/* Header line */}
                    <div className="hidden md:grid md:grid-cols-5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider py-4.5 px-5">
                      <span>Order ID</span>
                      <span>Recipient Name</span>
                      <span>Date Ordered</span>
                      <span>Delivery Address</span>
                      <span className="text-right">Settled Amount</span>
                    </div>

                    <div className="divide-y divide-slate-105">
                      {displayedPurchases.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 font-mono text-[10.5px]">
                          No registered invoice logs present matching the
                          criteria.
                        </div>
                      ) : (
                        displayedPurchases.map((order) => {
                          const isSearchResult =
                            appliedOrderSearch.trim() &&
                            order.id
                              .toLowerCase()
                              .includes(
                                appliedOrderSearch.trim().toLowerCase(),
                              );
                          return (
                            <div
                              key={order.id}
                              className={`grid grid-cols-1 md:grid-cols-5 p-4.5 items-center gap-2 md:gap-0 transition-all duration-300 ${
                                isSearchResult
                                  ? "bg-pink-50/75 hover:bg-pink-100/80 font-bold border-l-4 border-l-pink-600"
                                  : "hover:bg-slate-50/70 bg-white"
                              }`}
                            >
                              <div className="flex justify-between md:block">
                                <span className="md:hidden text-[9px] text-slate-400 uppercase font-black">
                                  Order ID
                                </span>
                                <span
                                  className={`font-mono font-black text-[12px] tracking-wider ${isSearchResult ? "text-pink-700" : "text-slate-900"}`}
                                >
                                  {order.id}
                                </span>
                              </div>

                              <div className="flex justify-between md:block">
                                <span className="md:hidden text-[9px] text-slate-400 uppercase font-black">
                                  Recipient
                                </span>
                                <div className="text-left font-extrabold text-slate-850">
                                  {order.recipientName}
                                  <span className="block font-mono text-[9px] text-slate-450 mt-0.5 font-bold">
                                    ({order.recipientPhone})
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between md:block">
                                <span className="md:hidden text-[9px] text-slate-400 uppercase font-black">
                                  Settled Date
                                </span>
                                <div>
                                  <span className="text-slate-505 font-bold block text-left">
                                    {order.date}
                                  </span>
                                  {order.deliveryDate && (
                                    <div className="flex flex-col gap-1 mt-1 font-sans">
                                      <span className="bg-pink-50 text-pink-700 border border-pink-100 text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block w-fit">
                                        📅 {order.deliveryDate}
                                      </span>
                                      {order.deliveryTimeSlot && (
                                        <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[9px] font-black uppercase px-2 py-0.5 rounded-md inline-block w-fit">
                                          🕒 {order.deliveryTimeSlot}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-between md:block">
                                <span className="md:hidden text-[9px] text-slate-400 uppercase font-black">
                                  Destination
                                </span>
                                <span
                                  className="text-slate-500 font-bold max-w-[220px] truncate block text-left"
                                  title={order.streetAddress}
                                >
                                  {order.streetAddress}
                                </span>
                              </div>

                              <div className="flex justify-between md:block text-right">
                                <span className="md:hidden text-[9px] text-slate-400 uppercase font-black">
                                  Settled Amount
                                </span>
                                <span className="text-sm font-black text-pink-600 font-mono tracking-wider">
                                  ₹{order.total}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ENTERPRISE COUPON ROOM */}
              {activeTab === "coupons" && (
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
                      Enterprise Coupon Room
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Create, delete, and configure active promotional discount
                      vouchers that synchronize live across all client screens.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Add new coupon module */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 p-4.5 sm:p-5 rounded-2.5xl space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                        <Tag className="w-4 h-4 text-pink-650" />
                        <h4 className="text-[10.5px] font-black uppercase text-slate-800 tracking-wider">
                          Create Promo Coupon
                        </h4>
                      </div>

                      <form
                        onSubmit={handleCreateCouponSubmit}
                        className="space-y-3 text-xs"
                      >
                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            Coupon Code
                          </label>
                          <input
                            type="text"
                            placeholder="E.g. ROCX200"
                            value={newCouponCode}
                            onChange={(e) =>
                              setNewCouponCode(e.target.value.toUpperCase())
                            }
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase font-mono text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                              Discount Type
                            </label>
                            <select
                              value={newCouponType}
                              onChange={(e) =>
                                setNewCouponType(
                                  e.target.value as "percentage" | "flat",
                                )
                              }
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none"
                            >
                              <option value="flat">Fixed Payout (₹)</option>
                              <option value="percentage">Percentage (%)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                              Discount Value
                            </label>
                            <input
                              type="number"
                              placeholder="E.g. 15"
                              value={newCouponValue}
                              onChange={(e) =>
                                setNewCouponValue(e.target.value)
                              }
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            Minimum Order Amount (₹) - Optional
                          </label>
                          <input
                            type="number"
                            placeholder="E.g. 500 (Optional)"
                            value={newCouponMinOrder}
                            onChange={(e) =>
                              setNewCouponMinOrder(e.target.value)
                            }
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            Coupon Description
                          </label>
                          <textarea
                            placeholder="Write a sweet banner desc like 'Flat ₹150 off on customized premium order values'"
                            value={newCouponDesc}
                            onChange={(e) => setNewCouponDesc(e.target.value)}
                            rows={2}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold text-slate-800 uppercase block">
                              Show in Cart Popup?
                            </span>
                            <span className="text-[8px] font-semibold text-slate-400 block uppercase">
                              Whether to feature this in the user's available
                              offers strip
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setNewCouponShowInCart(!newCouponShowInCart)
                            }
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                              newCouponShowInCart
                                ? "bg-pink-600"
                                : "bg-slate-350"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                newCouponShowInCart
                                  ? "translate-x-4"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-150 cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                        >
                          <Ticket className="w-4 h-4" /> Activate Coupon Code
                        </button>
                      </form>
                    </div>

                    {/* Active coupons storefront register */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 p-4.5 sm:p-5 rounded-2.5xl space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                        <Ticket className="w-4 h-4 text-pink-600" />
                        <h4 className="text-[10.5px] font-black uppercase text-slate-800 tracking-wider">
                          Active Promo Codes ({coupons.length})
                        </h4>
                      </div>

                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                        {coupons.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 font-mono text-[10.5px]">
                            No promotional coupon codes present. Use the panel
                            on the left to activate one!
                          </div>
                        ) : (
                          coupons.map((coup) => (
                            <div
                              key={coup.code}
                              className="p-3 border border-slate-105 rounded-xl bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-900 text-white font-mono text-[9px] font-black tracking-widest py-0.5 px-2 rounded uppercase leading-none">
                                    {coup.code}
                                  </span>
                                  <span className="font-extrabold text-slate-850">
                                    {coup.discountType === "flat"
                                      ? `Flat ₹${coup.discountValue} Off`
                                      : `${coup.discountValue}% Off`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-450 font-semibold mt-1">
                                  {coup.description ||
                                    `Applicable storefront discount voucher.`}
                                  {coup.minOrderAmount && (
                                    <span className="block text-[9.5px] text-slate-400 font-extrabold mt-0.5 font-mono">
                                      * Min order threshold required: ₹
                                      {coup.minOrderAmount}
                                    </span>
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateCoupon) {
                                      onUpdateCoupon({
                                        ...coup,
                                        showInCart:
                                          coup.showInCart === false
                                            ? true
                                            : false,
                                      });
                                    }
                                  }}
                                  className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase transition shrink-0 flex items-center gap-1 cursor-pointer select-none ${
                                    coup.showInCart !== false
                                      ? "bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100"
                                      : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-150"
                                  }`}
                                  title={
                                    coup.showInCart !== false
                                      ? "Click to hide from Cart available list"
                                      : "Click to show in Cart available list"
                                  }
                                >
                                  {coup.showInCart !== false
                                    ? "👁️ Shown"
                                    : "🙈 Hidden"}
                                </button>

                                <button
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "Delete Coupon",
                                      message: `Do you want to permanently delete code "${coup.code}"?`,
                                      onConfirm: () =>
                                        onDeleteCoupon(coup.code),
                                    });
                                  }}
                                  className="p-1 px-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-lg transition"
                                  title="Delete Coupon"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CATEGORIES CONTROL PANEL */}
              {activeTab === "categories" && (
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
                      Enterprise Category Manager
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Create, customize, and remove cake/gift catalog groupings
                      instantly. Newly updated entries are propagated across
                      client menus.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Add new category form */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 p-4.5 sm:p-5 rounded-2.5xl space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                        <Layers className="w-4 h-4 text-pink-600" />
                        <h4 className="text-[10.5px] font-black uppercase text-slate-800 tracking-wider">
                          Create Custom Category
                        </h4>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newCatName.trim()) return;
                          const generatedId =
                            newCatId.trim() ||
                            newCatName
                              .toLowerCase()
                              .replace(/[^a-z0-9_]+/g, "_");
                          const rank = newCatOrder.trim()
                            ? Number(newCatOrder)
                            : categories.length + 1;
                          onAddCategory({
                            id: generatedId,
                            name: newCatName.trim(),
                            image: newCatImgUrl.trim(),
                            displayOrder: rank,
                            addonProductIds: newCatAddonIds,
                            isVisible: true,
                            showInGrid: false,
                          });
                          setNewCatName("");
                          setNewCatImgUrl("");
                          setNewCatId("");
                          setNewCatOrder("");
                          setNewCatAddonIds([]);
                        }}
                        className="space-y-3 text-xs"
                      >
                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            Category Name *
                          </label>
                          <input
                            type="text"
                            placeholder="E.g. Chocolates, Father's Day, Anniversary"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            Category Display ID (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="E.g. custom_chocolates (autogenerated if empty)"
                            value={newCatId}
                            onChange={(e) =>
                              setNewCatId(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9_]+/g, ""),
                              )
                            }
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            Display/Serial Rank (Optional)
                          </label>
                          <input
                            type="number"
                            placeholder={`E.g. ${categories.length + 1} (Lower rolls first)`}
                            value={newCatOrder}
                            onChange={(e) => setNewCatOrder(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                            Display Cover Image
                          </label>
                          <input
                            type="text"
                            placeholder="Paste CDN image link or Unsplash URL"
                            value={newCatImgUrl}
                            onChange={(e) => setNewCatImgUrl(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                          />
                          <div className="flex items-center gap-2 pt-0.5">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  try {
                                    const base64 = await compressImageFile(
                                      file,
                                      800,
                                      0.6,
                                    );
                                    setNewCatImgUrl(base64);
                                  } catch (err) {
                                    console.error(
                                      "Category image upload failed:",
                                      err,
                                    );
                                    alert(
                                      "Image upload failed. The photo might be too large or unsupported (HEIC). Please try another photo.",
                                    );
                                  }
                                }
                              }}
                              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9.5px] file:font-black file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer max-w-full"
                            />
                            {newCatImgUrl && (
                              <img
                                src={newCatImgUrl}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                alt="Preview"
                              />
                            )}
                          </div>
                        </div>

                        <div className="border border-slate-100 bg-slate-50/55 rounded-2xl p-3.5 space-y-2 text-left">
                          <span className="text-[9px] text-slate-850 font-black uppercase tracking-wider block">
                            🎁 Recommend Category Add-ons (Optional)
                          </span>
                          <p className="text-[8.5px] text-slate-500 font-semibold leading-relaxed">
                            Select specific accessories to recommend with
                            products in this category. If none are selected,
                            accessories default to show.
                          </p>
                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {liveAccessories.map((addon) => {
                              const isChecked = newCatAddonIds.includes(
                                addon.id,
                              );
                              return (
                                <label
                                  key={addon.id}
                                  className="flex items-center gap-1.5 cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setNewCatAddonIds(
                                          newCatAddonIds.filter(
                                            (id) => id !== addon.id,
                                          ),
                                        );
                                      } else {
                                        setNewCatAddonIds([
                                          ...newCatAddonIds,
                                          addon.id,
                                        ]);
                                      }
                                    }}
                                    className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 w-3.5 h-3.5"
                                  />
                                  <span
                                    className="text-[10px] font-semibold text-slate-700 truncate"
                                    title={addon.name}
                                  >
                                    {addon.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition duration-150 cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Add Dynamic Category
                        </button>
                      </form>
                    </div>

                    {/* Active categories directory */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 p-4.5 sm:p-5 rounded-2.5xl space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                        <Layers className="w-4 h-4 text-pink-600" />
                        <h4 className="text-[10.5px] font-black uppercase text-slate-800 tracking-wider">
                          Active Category Directories ({categories?.length || 0}
                          )
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
                        {!categories || categories.length === 0 ? (
                          <div className="col-span-2 py-8 text-center text-slate-400 font-mono text-[10.5px]">
                            No category directory loaded yet. Run creator to
                            configure active indices.
                          </div>
                        ) : (
                          categories.map((cat) => {
                            const isEditing = editingCatId === cat.id;
                            if (isEditing) {
                              return (
                                <div
                                  key={cat.id}
                                  className="col-span-1 sm:col-span-2 p-4 border-2 border-pink-500 rounded-xl bg-pink-50/20 space-y-3 text-xs"
                                >
                                  <div className="flex items-center justify-between border-b border-pink-100 pb-1.5">
                                    <span className="font-extrabold text-pink-700 tracking-wide uppercase text-[10px]">
                                      Editing: {cat.id}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCatId(null)}
                                      className="p-1 hover:bg-pink-105 rounded text-slate-400 hover:text-slate-600"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5 font-sans">
                                        Category Name
                                      </label>
                                      <input
                                        type="text"
                                        value={editingCatName}
                                        onChange={(e) =>
                                          setEditingCatName(e.target.value)
                                        }
                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                                        required
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5 font-sans">
                                        Serial Display Order / Sequence
                                      </label>
                                      <input
                                        type="number"
                                        value={editingCatOrder}
                                        onChange={(e) =>
                                          setEditingCatOrder(
                                            Number(e.target.value),
                                          )
                                        }
                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                                        required
                                      />
                                    </div>

                                    <div className="space-y-1.5">
                                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block font-sans">
                                        Cover Image URL
                                      </label>
                                      <input
                                        type="text"
                                        value={editingCatImgUrl}
                                        onChange={(e) =>
                                          setEditingCatImgUrl(e.target.value)
                                        }
                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                                      />
                                      <div className="flex items-center gap-2 pt-0.5">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={async (e) => {
                                            if (
                                              e.target.files &&
                                              e.target.files[0]
                                            ) {
                                              const file = e.target.files[0];
                                              try {
                                                const base64 =
                                                  await compressImageFile(
                                                    file,
                                                    800,
                                                    0.6,
                                                  );
                                                setEditingCatImgUrl(base64);
                                              } catch (err) {
                                                console.error(
                                                  "Editing category image upload failed:",
                                                  err,
                                                );
                                                alert(
                                                  "Image upload failed. The photo might be too large or unsupported (HEIC). Please try another photo.",
                                                );
                                              }
                                            }
                                          }}
                                          className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer max-w-full"
                                        />
                                        {editingCatImgUrl && (
                                          <img
                                            src={editingCatImgUrl}
                                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                            alt="Preview"
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <div className="border border-slate-100 bg-white rounded-xl p-3.5 space-y-2 text-left">
                                      <span className="text-[9px] text-slate-850 font-black uppercase tracking-wider block">
                                        🎁 Recommend Category Add-ons (Optional)
                                      </span>
                                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                                        {liveAccessories.map((addon) => {
                                          const isChecked =
                                            editingCatAddonIds.includes(
                                              addon.id,
                                            );
                                          return (
                                            <label
                                              key={addon.id}
                                              className="flex items-center gap-1.5 cursor-pointer select-none"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                  if (isChecked) {
                                                    setEditingCatAddonIds(
                                                      editingCatAddonIds.filter(
                                                        (id) => id !== addon.id,
                                                      ),
                                                    );
                                                  } else {
                                                    setEditingCatAddonIds([
                                                      ...editingCatAddonIds,
                                                      addon.id,
                                                    ]);
                                                  }
                                                }}
                                                className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 w-3.5 h-3.5"
                                              />
                                              <span
                                                className="text-[10px] font-semibold text-slate-705 truncate"
                                                title={addon.name}
                                              >
                                                {addon.name}
                                              </span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-1 font-sans">
                                    <button
                                      type="button"
                                      onClick={() => setEditingCatId(null)}
                                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-black uppercase text-[9px] tracking-wider rounded-lg transition"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!editingCatName.trim()) return;
                                        if (onUpdateCategory) {
                                          onUpdateCategory({
                                            id: cat.id,
                                            name: editingCatName.trim(),
                                            image:
                                              editingCatImgUrl.trim() ||
                                              "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80",
                                            displayOrder:
                                              Number(editingCatOrder),
                                            addonProductIds: editingCatAddonIds,
                                          });
                                        }
                                        setEditingCatId(null);
                                      }}
                                      className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-[9px] tracking-wider rounded-lg transition flex items-center gap-1 shrink-0"
                                    >
                                      <Check className="w-3 h-3" /> Save Changes
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            const index = categories.findIndex(
                              (c) => c.id === cat.id,
                            );
                            const hasPrevious = index > 0;
                            const hasNext = index < categories.length - 1;

                            const handleMoveUp = () => {
                              if (!hasPrevious) return;
                              const prevCat = categories[index - 1];
                              const nextList = categories.map((c, idx) => {
                                let order = idx + 1;
                                if (idx === index) order = index;
                                if (idx === index - 1) order = index + 1;
                                return { ...c, displayOrder: order };
                              });
                              const updatedCurrent = nextList.find(
                                (c) => c.id === cat.id,
                              );
                              const updatedPrev = nextList.find(
                                (c) => c.id === prevCat.id,
                              );
                              if (
                                updatedCurrent &&
                                updatedPrev &&
                                onUpdateCategory
                              ) {
                                onUpdateCategory([updatedCurrent, updatedPrev]);
                              }
                            };

                            const handleMoveDown = () => {
                              if (!hasNext) return;
                              const nextCat = categories[index + 1];
                              const nextList = categories.map((c, idx) => {
                                let order = idx + 1;
                                if (idx === index) order = index + 2;
                                if (idx === index + 1) order = index + 1;
                                return { ...c, displayOrder: order };
                              });
                              const updatedCurrent = nextList.find(
                                (c) => c.id === cat.id,
                              );
                              const updatedNext = nextList.find(
                                (c) => c.id === nextCat.id,
                              );
                              if (
                                updatedCurrent &&
                                updatedNext &&
                                onUpdateCategory
                              ) {
                                onUpdateCategory([updatedCurrent, updatedNext]);
                              }
                            };

                            return (
                              <div
                                key={cat.id}
                                className="p-3 border border-slate-200 rounded-xl bg-slate-50/55 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="flex flex-col items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={handleMoveUp}
                                      disabled={!hasPrevious}
                                      className={`p-0.5 rounded hover:bg-slate-200 text-slate-600 active:scale-95 transition ${!hasPrevious ? "opacity-25 cursor-not-allowed" : "cursor-pointer"}`}
                                      title="Move Category Up/Earlier"
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <span
                                      className="text-[9px] font-black w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-800 rounded-full select-none"
                                      title={`Display Index sequence: #${cat.displayOrder ?? index + 1}`}
                                    >
                                      {cat.displayOrder ?? index + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleMoveDown}
                                      disabled={!hasNext}
                                      className={`p-0.5 rounded hover:bg-slate-200 text-slate-600 active:scale-95 transition ${!hasNext ? "opacity-25 cursor-not-allowed" : "cursor-pointer"}`}
                                      title="Move Category Down/Later"
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80";
                                    }}
                                  />
                                  <div className="min-w-0 flex-1 text-left">
                                    <h5 className="font-extrabold text-slate-800 leading-tight truncate">
                                      {cat.name}
                                    </h5>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded uppercase inline-block">
                                        ID: {cat.id}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onUpdateCategory) {
                                            onUpdateCategory({
                                              ...cat,
                                              isVisible:
                                                cat.isVisible !== false
                                                  ? false
                                                  : true,
                                            });
                                          }
                                        }}
                                        className={`px-1.5 py-0.5 text-[8.5px] font-black rounded uppercase tracking-wider transition ${
                                          cat.isVisible !== false
                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                                        }`}
                                        title={
                                          cat.isVisible !== false
                                            ? "Click to set category as hidden"
                                            : "Click to set category as visible"
                                        }
                                      >
                                        {cat.isVisible !== false
                                          ? "● Visible"
                                          : "○ Hidden"}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      setEditingCatId(cat.id);
                                      setEditingCatName(cat.name);
                                      setEditingCatImgUrl(cat.image);
                                      setEditingCatOrder(
                                        cat.displayOrder ?? index + 1,
                                      );
                                      setEditingCatAddonIds(
                                        cat.addonProductIds || [],
                                      );
                                    }}
                                    className="p-1.5 border border-slate-200 hover:bg-slate-200/50 text-slate-500 rounded-lg transition"
                                    title="Edit Category"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onUpdateCategory) {
                                        onUpdateCategory({
                                          ...cat,
                                          hidden: !cat.hidden,
                                        });
                                      }
                                    }}
                                    className={`p-1.5 border rounded-lg transition ${cat.hidden ? "border-slate-200 text-slate-400 hover:bg-slate-50" : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"}`}
                                    title={
                                      cat.hidden
                                        ? "Show Category"
                                        : "Hide Category"
                                    }
                                  >
                                    <div className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px]">
                                      {cat.hidden ? "👁️‍🗨️" : "👁️"}
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: "Delete Category",
                                        message: `Do you want to permanently delete category "${cat.name}"? (Warning: products filed under this category will no longer display under this group until reclassified)`,
                                        onConfirm: () =>
                                          onDeleteCategory(cat.id),
                                      });
                                    }}
                                    className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Delete Category"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SLIDER BANNERS CAROUSEL MANAGER */}
              {activeTab === "slider" && (
                <div className="space-y-6 text-left">
                  <div className="space-y-1 pb-3 border-b border-slate-100">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight font-sans">
                      Front Page Carousel Banners Manager
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Create new slider banners, edit existing advertisements,
                      or delete slide posts. Supports local device file uploads
                      and images directly from the web.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Part A: Create custom promotions banner */}
                    <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-3xl space-y-4 font-sans">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                        <PlusCircle className="w-4.5 h-4.5 text-pink-600" />
                        <h4 className="text-[10.5px] font-black uppercase text-slate-800 tracking-wider">
                          Create Promo Slide
                        </h4>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                            Slide Badge / Tag label
                          </label>
                          <input
                            type="text"
                            value={newSlideBadge}
                            onChange={(e) => setNewSlideBadge(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-700"
                            placeholder="e.g. Signature Collection"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                            Banner Heading Title
                          </label>
                          <input
                            type="text"
                            value={newSlideTitle}
                            onChange={(e) => setNewSlideTitle(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-700"
                            required
                            placeholder="Perfect Gifts for Every Birthday"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                            Banner Subtitle Details
                          </label>
                          <textarea
                            value={newSlideSubtitle}
                            onChange={(e) =>
                              setNewSlideSubtitle(e.target.value)
                            }
                            rows={3}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none font-medium text-slate-700"
                            required
                            placeholder="Describe layout messaging or promotion highlights..."
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                            Image Location URL
                          </label>
                          <input
                            type="text"
                            value={newSlideImage}
                            onChange={(e) => setNewSlideImage(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-700"
                            placeholder="https://images.unsplash.com..."
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-indigo-500 font-extrabold uppercase block mb-1">
                            Or Upload from Local Device
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingNewSlideImage(true);
                              try {
                                const base64 = await compressImageFile(
                                  file,
                                  800,
                                  0.6,
                                );
                                setNewSlideImage(base64);
                              } catch (err) {
                                console.error(
                                  "Local slide upload failure:",
                                  err,
                                );
                              } finally {
                                setIsUploadingNewSlideImage(false);
                              }
                            }}
                            className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer animate-pulse"
                          />
                          {isUploadingNewSlideImage && (
                            <span className="text-[9px] text-pink-600 animate-pulse block mt-1">
                              Compressing local image...
                            </span>
                          )}
                        </div>

                        {newSlideImage && (
                          <div className="pt-1.5">
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">
                              Upload Preview:
                            </span>
                            <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                              <img
                                src={newSlideImage}
                                alt="Local preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setNewSlideImage("")}
                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={
                            isUploadingNewSlideImage ||
                            !newSlideTitle.trim() ||
                            !newSlideSubtitle.trim()
                          }
                          onClick={() => {
                            if (!newSlideImage) {
                              alert(
                                "Please add a photo url or upload from your device first!",
                              );
                              return;
                            }
                            if (onUpdateSlide) {
                              const uniqueId = `slide_${Date.now()}`;
                              onUpdateSlide({
                                id: uniqueId,
                                title: newSlideTitle.trim(),
                                badge: newSlideBadge.trim() || undefined,
                                subtitle: newSlideSubtitle.trim(),
                                image: newSlideImage.trim(),
                              });
                              // Clear states
                              setNewSlideTitle("");
                              setNewSlideBadge("");
                              setNewSlideSubtitle("");
                              setNewSlideImage("");
                            }
                          }}
                          className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-black uppercase text-[10.5px] tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Add custom banner
                        </button>
                      </div>
                    </div>

                    {/* Part B: Managed Slide grids */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">
                          Active Carousel Banner Lists ({slides.length})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slides.map((slide, index) => {
                          const isEditing = editingSlideId === slide.id;
                          return (
                            <div
                              key={slide.id}
                              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col h-full font-sans relative"
                            >
                              {/* Slide numbering badge, top-left corner */}
                              <div className="absolute top-2 left-2 z-15 bg-slate-900/80 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold">
                                Banner #{index + 1}
                              </div>

                              {/* Absolute Delete Button top-right corner if not editing */}
                              {!isEditing && onDeleteSlide && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "Delete Slide Banner",
                                      message:
                                        "Do you want to delete this custom slide banner?",
                                      onConfirm: () => onDeleteSlide(slide.id),
                                    });
                                  }}
                                  className="absolute top-2 right-2 z-15 bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white p-1.5 rounded-full shadow-md transition cursor-pointer"
                                  title="Delete this banner slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Image Preview Window */}
                              <div className="relative h-32 bg-slate-150 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={
                                    isEditing
                                      ? editingSlideImage || slide.image
                                      : slide.image
                                  }
                                  alt="Slide preview"
                                  className="w-full h-full object-cover object-center animate-fade-in"
                                  referrerPolicy="no-referrer"
                                />
                                {(isEditing
                                  ? editingSlideBadge
                                  : slide.badge) &&
                                  !isEditing && (
                                    <div className="absolute bottom-2 right-2 bg-rose-600 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
                                      {slide.badge}
                                    </div>
                                  )}
                              </div>

                              {/* Slide Info & Editing details */}
                              <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                                {!isEditing ? (
                                  <div className="space-y-1.5 flex-grow">
                                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase leading-snug">
                                      {slide.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight">
                                      {slide.subtitle}
                                    </p>
                                    {slide.badge && (
                                      <span className="inline-block mt-1 text-[8.5px] bg-slate-100 text-slate-600 font-extrabold uppercase px-1.5 py-0.5 rounded-md">
                                        Badge: {slide.badge}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-2.5 flex-grow text-xs">
                                    <div>
                                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                                        Slide Badge
                                      </label>
                                      <input
                                        type="text"
                                        value={editingSlideBadge}
                                        onChange={(e) =>
                                          setEditingSlideBadge(e.target.value)
                                        }
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                                        placeholder="e.g. Signature Collection"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                                        Banner Title
                                      </label>
                                      <input
                                        type="text"
                                        value={editingSlideTitle}
                                        onChange={(e) =>
                                          setEditingSlideTitle(e.target.value)
                                        }
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                                        required
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                                        Banner Subtitle Details
                                      </label>
                                      <textarea
                                        value={editingSlideSubtitle}
                                        onChange={(e) =>
                                          setEditingSlideSubtitle(
                                            e.target.value,
                                          )
                                        }
                                        rows={2}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none"
                                        required
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                                        Image Location URL
                                      </label>
                                      <input
                                        type="text"
                                        value={editingSlideImage}
                                        onChange={(e) =>
                                          setEditingSlideImage(e.target.value)
                                        }
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[9px] text-indigo-500 font-extrabold uppercase block mb-1">
                                        Or Upload from Local Device
                                      </label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          setIsUploadingSlideImage(true);
                                          try {
                                            const base64 =
                                              await compressImageFile(
                                                file,
                                                800,
                                                0.6,
                                              );
                                            setEditingSlideImage(base64);
                                          } catch (err) {
                                            console.error(
                                              "Local slide upload failure:",
                                              err,
                                            );
                                          } finally {
                                            setIsUploadingSlideImage(false);
                                          }
                                        }}
                                        className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                                      />
                                      {isUploadingSlideImage && (
                                        <span className="text-[9px] text-pink-600 animate-pulse block mt-1">
                                          Compressing local image...
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5 font-sans">
                                  {!isEditing ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSlideId(slide.id);
                                        setEditingSlideTitle(slide.title);
                                        setEditingSlideBadge(slide.badge || "");
                                        setEditingSlideSubtitle(slide.subtitle);
                                        setEditingSlideImage(slide.image);
                                      }}
                                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 hover:text-slate-905 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" /> Edit
                                      Slide Info
                                    </button>
                                  ) : (
                                    <div className="flex w-full gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingSlideId(null)}
                                        className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        disabled={isUploadingSlideImage}
                                        onClick={() => {
                                          if (
                                            !editingSlideTitle.trim() ||
                                            !editingSlideSubtitle.trim()
                                          )
                                            return;
                                          if (onUpdateSlide) {
                                            onUpdateSlide({
                                              id: slide.id,
                                              title: editingSlideTitle.trim(),
                                              badge: editingSlideBadge.trim(),
                                              subtitle:
                                                editingSlideSubtitle.trim(),
                                              image:
                                                editingSlideImage.trim() ||
                                                slide.image,
                                            });
                                          }
                                          setEditingSlideId(null);
                                        }}
                                        className="flex-1 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                      >
                                        <Check className="w-3 h-3" /> Save
                                      </button>
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
                </div>
              )}

              {/* TAB 7: LOOKBOOK GALLERY IMAGES CAROUSEL MANAGER */}
              {activeTab === "gallery" && (
                <div className="space-y-6 text-left font-sans">
                  <div className="space-y-1 pb-3 border-b border-slate-100">
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
                      Lookbook Gallery Manager
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Introduce new lookbook pictures, upload direct snap shots
                      of real kitchen baked orders, or delete stale records.
                      These sync in real-time on the main landing page.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Part A: Create Lookbook picture */}
                    <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                        <PlusCircle className="w-4.5 h-4.5 text-pink-600" />
                        <h4 className="text-[10.5px] font-black uppercase text-slate-800 tracking-wider">
                          Add Lookbook Pic
                        </h4>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase block mb-0.5">
                            Image Location URL
                          </label>
                          <input
                            type="text"
                            value={newGalleryImage}
                            onChange={(e) => setNewGalleryImage(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-700"
                            placeholder="https://images.unsplash.com..."
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-indigo-500 font-extrabold uppercase block mb-1">
                            Or Upload from Local Device
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingGalleryImage(true);
                              try {
                                const base64 = await compressImageFile(
                                  file,
                                  800,
                                  0.6,
                                );
                                setNewGalleryImage(base64);
                              } catch (err) {
                                console.error(
                                  "Local lookbook upload failure:",
                                  err,
                                );
                              } finally {
                                setIsUploadingGalleryImage(false);
                              }
                            }}
                            className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                          />
                          {isUploadingGalleryImage && (
                            <span className="text-[9px] text-pink-600 animate-pulse block mt-1">
                              Compressing local image...
                            </span>
                          )}
                        </div>

                        {newGalleryImage && (
                          <div className="pt-1.5">
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">
                              Upload Preview:
                            </span>
                            <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                              <img
                                src={newGalleryImage}
                                alt="Local preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setNewGalleryImage("")}
                                className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={!newGalleryImage || isUploadingGalleryImage}
                          onClick={() => {
                            if (!newGalleryImage) return;
                            if (onAddGalleryItem) {
                              onAddGalleryItem({
                                id: "gal_" + Date.now().toString(),
                                image: newGalleryImage.trim(),
                              });
                            }
                            setNewGalleryImage("");
                          }}
                          className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-2xl shadow-md shadow-pink-500/10 hover:shadow-lg hover:shadow-pink-500/15 transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" /> Add to Lookbook
                        </button>
                      </div>
                    </div>

                    {/* Part B: Active Lookbook Images database */}
                    <div className="lg:col-span-8 bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4.5 h-4.5 text-slate-500" />
                          <h4 className="text-[10.5px] font-black uppercase text-slate-800 tracking-wider">
                            Active lookbook images ({galleryItems.length})
                          </h4>
                        </div>
                      </div>

                      {galleryItems.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-xs text-slate-400 font-medium">
                            No custom lookbook pictures loaded in database!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {galleryItems.map((item) => {
                            return (
                              <div
                                key={item.id}
                                className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square shadow-sm flex flex-col justify-between"
                              >
                                <img
                                  src={item.image}
                                  alt="Gallery Item"
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                />

                                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: "Delete Lookbook Image",
                                        message:
                                          "Do you want to delete this lookbook gallery image?",
                                        onConfirm: () => {
                                          if (onDeleteGalleryItem)
                                            onDeleteGalleryItem(item.id);
                                        },
                                      });
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition cursor-pointer"
                                    title="Delete lookbook image"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DELIVERY ENGINE */}
              {activeTab === "delivery" && (
                <DeliveryConfigEditor
                  localConfig={localConfig}
                  onUpdateStoreConfig={(config) => {
                    setLocalConfig(config);
                    if (onUpdateStoreConfig) onUpdateStoreConfig(config);
                  }}
                />
              )}

              {/* TAB 8: STORE CUSTOMIZER SETTINGS PANEL */}
              {activeTab === "settings" && (
                <div className="space-y-6 max-w-5xl">
                  {/* Header Intro Banner */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-slate-900/10">
                    <div className="relative z-10 space-y-1.5 p-1">
                      <span className="text-[9px] bg-pink-600 font-extrabold px-2 py-0.5 rounded tracking-widest block w-fit">
                        PREMIUM CUSTOMIZER
                      </span>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        Homepage Visual Layout Guardroom
                      </h3>
                      <p className="text-[10.5px] text-slate-350 leading-relaxed font-semibold">
                        Regulate the content of your storefront "About" segment
                        or alter the custom cake lookbook sub-collection cards.
                        All revisions publish immediately in real-time.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT PANEL: ABOUT SECTION CONTROLLERS */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                        <span className="text-lg">📢</span>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                            Section: About segment points
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold">
                            Write up to 3 gorgeous points to express store
                            specialty
                          </span>
                        </div>
                      </div>

                      {[0, 1, 2].map((idx) => {
                        const val = localConfig?.aboutPoints?.[idx] || "";
                        return (
                          <div key={idx} className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-extrabold block">
                              Specialty Point #{idx + 1}
                            </label>
                            <input
                              type="text"
                              value={val}
                              placeholder={`Point #${idx + 1}`}
                              onChange={(e) => {
                                const temp = [
                                  ...(localConfig?.aboutPoints || ["", "", ""]),
                                ];
                                temp[idx] = e.target.value;
                                if (localConfig) {
                                  setLocalConfig({
                                    ...localConfig,
                                    aboutPoints: temp,
                                  });
                                }
                              }}
                              className="w-full text-xs font-semibold p-2.5 bg-slate-5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                            />
                          </div>
                        );
                      })}

                      {/* About background URL */}
                      <div className="space-y-2 border-t border-slate-50 pt-3">
                        <label className="text-[10px] text-slate-500 font-extrabold block">
                          About Section Background Backdrop
                        </label>

                        <div className="flex items-center gap-3">
                          {/* Image preview box */}
                          <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                            <img
                              src={
                                localConfig?.aboutBgImage ||
                                "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80"
                              }
                              alt="Backdrop preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              value={localConfig?.aboutBgImage || ""}
                              placeholder="Paste visual backdrop photo URL"
                              onChange={(e) => {
                                if (localConfig) {
                                  setLocalConfig({
                                    ...localConfig,
                                    aboutBgImage: e.target.value,
                                  });
                                }
                              }}
                              className="w-full text-[10.5px] font-mono p-2 bg-slate-5 border border-slate-200 rounded-lg focus:outline-none"
                            />

                            <div className="mt-2">
                              <label className="text-[9px] text-slate-500 font-bold block mb-1">
                                Upload Local Image
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    try {
                                      const base64 = await compressImageFile(
                                        file,
                                        800,
                                        0.6,
                                      );
                                      if (localConfig) {
                                        setLocalConfig({
                                          ...localConfig,
                                          aboutBgImage: base64,
                                        });
                                      }
                                    } catch (err) {
                                      console.error(
                                        "About image upload failed to compress:",
                                        err,
                                      );
                                      alert(
                                        "Image upload failed. The photo might be too large or unsupported (HEIC). Please try another photo.",
                                      );
                                    }
                                  }
                                }}
                                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM PANEL: CUSTOM BANNERS */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4 shadow-sm lg:col-span-3">
                      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                        <span className="text-lg">🖼️</span>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                            Custom Banners
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold">
                            Modify top offer banner and personalized gifts banner
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Offer Banner */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-[10px] text-slate-700 font-extrabold uppercase block tracking-wider">
                            Top Offer Banner (Above Best Sellers)
                          </label>
                          <input
                            type="text"
                            placeholder="Banner Text / Offer (optional)"
                            value={localConfig?.topOfferBannerText || ""}
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({ ...localConfig, topOfferBannerText: e.target.value });
                              }
                            }}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <input
                            type="text"
                            placeholder="Banner Image URL (optional)"
                            value={localConfig?.topOfferBannerImage || ""}
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({ ...localConfig, topOfferBannerImage: e.target.value });
                              }
                            }}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold block mb-1">
                              Upload Local Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const base64 = await compressImageFile(e.target.files[0], 800, 0.6);
                                    if (localConfig) {
                                      setLocalConfig({ ...localConfig, topOfferBannerImage: base64 });
                                    }
                                  } catch (err) {
                                    alert("Image upload failed.");
                                  }
                                }
                              }}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Personalized Gifts Banner */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-[10px] text-slate-700 font-extrabold uppercase block tracking-wider">
                            Personalized Gifts Banner
                          </label>
                          <input
                            type="text"
                            placeholder="Banner Image URL (optional)"
                            value={localConfig?.personalizedGiftsBannerImage || ""}
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({ ...localConfig, personalizedGiftsBannerImage: e.target.value });
                              }
                            }}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold block mb-1">
                              Upload Local Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const base64 = await compressImageFile(e.target.files[0], 800, 0.6);
                                    if (localConfig) {
                                      setLocalConfig({ ...localConfig, personalizedGiftsBannerImage: base64 });
                                    }
                                  } catch (err) {
                                    alert("Image upload failed.");
                                  }
                                }
                              }}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Gifts for Him Banner */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-[10px] text-slate-700 font-extrabold uppercase block tracking-wider">
                            Gifts for Him Banner
                          </label>
                          <input
                            type="text"
                            placeholder="Banner Image URL (optional)"
                            value={localConfig?.giftsForHimBannerImage || ""}
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({ ...localConfig, giftsForHimBannerImage: e.target.value });
                              }
                            }}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold block mb-1">
                              Upload Local Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const base64 = await compressImageFile(e.target.files[0], 800, 0.6);
                                    if (localConfig) {
                                      setLocalConfig({ ...localConfig, giftsForHimBannerImage: base64 });
                                    }
                                  } catch (err) {
                                    alert("Image upload failed.");
                                  }
                                }
                              }}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Gifts for Her Banner */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-[10px] text-slate-700 font-extrabold uppercase block tracking-wider">
                            Gifts for Her Banner
                          </label>
                          <input
                            type="text"
                            placeholder="Banner Image URL (optional)"
                            value={localConfig?.giftsForHerBannerImage || ""}
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({ ...localConfig, giftsForHerBannerImage: e.target.value });
                              }
                            }}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold block mb-1">
                              Upload Local Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const base64 = await compressImageFile(e.target.files[0], 800, 0.6);
                                    if (localConfig) {
                                      setLocalConfig({ ...localConfig, giftsForHerBannerImage: base64 });
                                    }
                                  } catch (err) {
                                    alert("Image upload failed.");
                                  }
                                }
                              }}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Cakes for Him Banner */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-[10px] text-slate-700 font-extrabold uppercase block tracking-wider">
                            Cakes for Him Banner
                          </label>
                          <input
                            type="text"
                            placeholder="Banner Image URL (optional)"
                            value={localConfig?.cakesForHimBannerImage || ""}
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({ ...localConfig, cakesForHimBannerImage: e.target.value });
                              }
                            }}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold block mb-1">
                              Upload Local Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const base64 = await compressImageFile(e.target.files[0], 800, 0.6);
                                    if (localConfig) {
                                      setLocalConfig({ ...localConfig, cakesForHimBannerImage: base64 });
                                    }
                                  } catch (err) {
                                    alert("Image upload failed.");
                                  }
                                }
                              }}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Cakes for Her Banner */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-[10px] text-slate-700 font-extrabold uppercase block tracking-wider">
                            Cakes for Her Banner
                          </label>
                          <input
                            type="text"
                            placeholder="Banner Image URL (optional)"
                            value={localConfig?.cakesForHerBannerImage || ""}
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({ ...localConfig, cakesForHerBannerImage: e.target.value });
                              }
                            }}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <div>
                            <label className="text-[9px] text-slate-500 font-bold block mb-1">
                              Upload Local Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  try {
                                    const base64 = await compressImageFile(e.target.files[0], 800, 0.6);
                                    if (localConfig) {
                                      setLocalConfig({ ...localConfig, cakesForHerBannerImage: base64 });
                                    }
                                  } catch (err) {
                                    alert("Image upload failed.");
                                  }
                                }
                              }}
                              className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-pink-50 file:text-pink-700 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: CAKE CATEGORY DIRECT CUSTOMIZABILITY */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                        <span className="text-lg">🎂</span>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                            4 Main Cake Category Cards
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold">
                            Customize name tags & backdrop banners for the 4
                            core columns
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                        {[0, 1, 2, 3].map((index) => {
                          // Get dynamic values
                          const defaultIds = [
                            "photo_cake",
                            "bento_cake",
                            "pinata_cake",
                            "kids_cake",
                          ];
                          const defaultNames = [
                            "Photo Cake",
                            "Bento Cake",
                            "Pinata Cake",
                            "Kids Cake",
                          ];
                          const defaultTags = [
                            "Custom Edible Print",
                            "Mini Aesthetic",
                            "Hammer Surprise",
                            "Fun Theme Designs",
                          ];

                          const list = [
                            ...(localConfig?.cakeSubcategories || []),
                          ];
                          const item = list[index] || {
                            id: defaultIds[index],
                            name: defaultNames[index],
                            image: "",
                            tag: defaultTags[index],
                          };

                          return (
                            <div
                              key={index}
                              className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5"
                            >
                              <div className="flex items-center justify-between border-b border-slate-100/50 pb-1.5 mb-1 bg-white/70 p-1 px-2 rounded-lg">
                                <span className="text-[9.5px] text-indigo-755 font-black uppercase tracking-wider font-mono">
                                  Category Card #{index + 1}
                                </span>
                                <span className="text-[8px] bg-indigo-50 text-indigo-700 font-black px-1.5 py-0.5 rounded tracking-wide">
                                  ID: {item.id}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 font-bold block">
                                    Display Name
                                  </label>
                                  <input
                                    type="text"
                                    value={item.name}
                                    placeholder={defaultNames[index]}
                                    onChange={(e) => {
                                      const nextList = [...list];
                                      nextList[index] = {
                                        ...item,
                                        name: e.target.value,
                                      };
                                      if (localConfig) {
                                        setLocalConfig({
                                          ...localConfig,
                                          cakeSubcategories: nextList,
                                        });
                                      }
                                    }}
                                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-150 rounded-lg"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 font-bold block">
                                    Sub-badge Label
                                  </label>
                                  <input
                                    type="text"
                                    value={item.tag}
                                    placeholder={defaultTags[index]}
                                    onChange={(e) => {
                                      const nextList = [...list];
                                      nextList[index] = {
                                        ...item,
                                        tag: e.target.value,
                                      };
                                      if (localConfig) {
                                        setLocalConfig({
                                          ...localConfig,
                                          cakeSubcategories: nextList,
                                        });
                                      }
                                    }}
                                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-150 rounded-lg"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-500 font-bold block">
                                  Card visual image backdrop source
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-slate-100 overflow-hidden shrink-0">
                                    <img
                                      src={
                                        item.image ||
                                        "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=400&q=80"
                                      }
                                      className="w-full h-full object-cover"
                                      alt="Sub category preview"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <input
                                      type="text"
                                      value={item.image}
                                      placeholder="https://images.unsplash.com/..."
                                      onChange={(e) => {
                                        const nextList = [...list];
                                        nextList[index] = {
                                          ...item,
                                          image: e.target.value,
                                        };
                                        if (localConfig) {
                                          setLocalConfig({
                                            ...localConfig,
                                            cakeSubcategories: nextList,
                                          });
                                        }
                                      }}
                                      className="w-full text-[9px] font-mono p-1.5 bg-white border border-slate-155 rounded-md"
                                    />
                                    <div className="pt-1">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          if (
                                            e.target.files &&
                                            e.target.files[0]
                                          ) {
                                            const file = e.target.files[0];
                                            try {
                                              const base64 =
                                                await compressImageFile(
                                                  file,
                                                  800,
                                                  0.6,
                                                );
                                              const nextList = [...list];
                                              nextList[index] = {
                                                ...item,
                                                image: base64,
                                              };
                                              if (localConfig) {
                                                setLocalConfig({
                                                  ...localConfig,
                                                  cakeSubcategories: nextList,
                                                });
                                              }
                                            } catch (err) {
                                              console.error(
                                                "Subcategory image compression failed:",
                                                err,
                                              );
                                              alert(
                                                "Image upload failed. The photo might be too large or unsupported (HEIC). Please try another photo.",
                                              );
                                            }
                                          }
                                        }}
                                        className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[9px] file:font-extrabold file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* THIRD PANEL: GIFTS & COMBOS CATEGORY CARDS */}
                    <SubcategoryEditor
                      title="4 Main Gift & Combo cards"
                      icon="🎁"
                      description="Customize name tags & backdrop banners for the 4 gift columns"
                      configKey="giftSubcategories"
                      defaultIds={["flower_combos", "cake_combos", "chocolate_flower", "personalised_combos"]}
                      defaultNames={["Flower Combos", "Cake Combos", "Chocolate & Flower", "Personalised Combos"]}
                      defaultTags={["Blooms & Chocolates", "Dessert & Toy Kits", "Sweetest Greetings", "Memories & Decor"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="pink"
                    />

                    {/* FOURTH PANEL: DIWALI CARDS */}
                    <SubcategoryEditor
                      title="4 Diwali Special cards"
                      icon="🪔"
                      description="Customize name tags & backdrop banners for the 4 Diwali columns"
                      configKey="dewaliSubcategories"
                      defaultIds={["special_chocolate", "sweets", "dryfruits", "diya_candle"]}
                      defaultNames={["Special Chocolate", "Sweets", "Dry Fruits", "Diya & Candles"]}
                      defaultTags={["Festive Treats", "Traditional Joy", "Healthy Gifting", "Light & Prosperity"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1599598425947-33004a43b248?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1593955610816-568377e8ea69?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1533088034057-0ae6b90de25f?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="rose"
                    />

                    {/* FIFTH PANEL: RAKHI CARDS */}
                    <SubcategoryEditor
                      title="4 Rakhi Special cards"
                      icon="🧵"
                      description="Customize name tags & backdrop banners for the 4 Rakhi columns"
                      configKey="rakhiSubcategories"
                      defaultIds={["rakhi_dryfruits", "bhai_vhabi_rakhi", "rakhi_sweets", "rakhi_chocolate"]}
                      defaultNames={["Rakhi & Dryfruits", "Bhai & Vhabi Rakhi", "Rakhi With Sweets", "Rakhi With Chocolate"]}
                      defaultTags={["Healthy Assortment", "Couple Pairings", "Sweet Bonding", "Choco Delight"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1593955610816-568377e8ea69?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1599598425947-33004a43b248?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="teal"
                    />

                    {/* SIXTH PANEL: PHOTO TO ART CARDS */}
                    <SubcategoryEditor
                      title="4 Photo to Art cards"
                      icon="🎨"
                      description="Customize name tags & backdrop banners for the Photo to Art columns"
                      configKey="photoToArtSubcategories"
                      defaultIds={["water_colour", "oil_painting", "sketch", "acrylic"]}
                      defaultNames={["Water Colour", "Oil Painting", "Sketch", "Acrylic"]}
                      defaultTags={["Vibrant Splashes", "Classic Strokes", "Pencil Masters", "Bold Textures"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1510912196160-58c03dc80a6b?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1581452695505-1a87e596bb5d?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="indigo"
                    />

                    {/* SEVENTH PANEL: HAND CRAFT CARDS */}
                    <SubcategoryEditor
                      title="4 Hand Craft cards"
                      icon="🧸"
                      description="Customize name tags & backdrop banners for the Hand Craft columns"
                      configKey="handCraftSubcategories"
                      defaultIds={["key_ring", "jewellery", "clay_art", "resin_art"]}
                      defaultNames={["Key Ring", "Jewellery", "Clay Art", "Resin Art"]}
                      defaultTags={["Custom Charms", "Handmade Elegance", "Molded Decor", "Glossy Keepsakes"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1620002167195-d2274b5952f4?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="blue"
                    />

                    {/* EIGHTH PANEL: NEW YEAR CARDS */}
                    <SubcategoryEditor
                      title="4 New Year Special cards"
                      icon="🎆"
                      description="Customize name tags & backdrop banners for the 4 New Year columns"
                      configKey="newYearSubcategories"
                      defaultIds={["new_year_cakes", "new_year_flowers", "new_year_combos", "new_year_gifts"]}
                      defaultNames={["New Year Cakes", "Festive Flowers", "Party Combos", "Special Gifts"]}
                      defaultTags={["Midnight Surprises", "Fresh Starts", "Joyful Kits", "Memorable Presents"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1546272989-40c92939c6c2?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1482355348030-c3d6232d3bfa?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1512413914619-2166eb8ce429?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1511268559489-34b624eaf815?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="indigo"
                    />
                  </div>

                  {/* CENTRAL POWER CONTROL: HOMEPAGE SECTION TOGGLES */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-rose-50 pb-3 text-left">
                      <span className="text-xl">🛠️</span>
                      <div>
                        <h4 className="text-[11.5px] font-black uppercase tracking-wider text-slate-850">
                          Homepage Sections Display Configuration
                        </h4>
                        <span className="text-[9.5px] text-slate-400 font-bold">
                          Instantly show or hide any segment of the landing page
                          feed
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                      {[
                        {
                          flag: "showNewYear" as const,
                          label: "New Year Special",
                          icon: "🎆",
                        },
                        {
                          flag: "showRakhi" as const,
                          label: "Rakhi Special",
                          icon: "🪢",
                        },
                        {
                          flag: "showDewali" as const,
                          label: "Dewali Special",
                          icon: "🪔",
                        },
                        {
                          flag: "showHandCrafts" as const,
                          label: "Customise Hand Crafts",
                          icon: "✂️",
                        },
                        {
                          flag: "showPhotoToArt" as const,
                          label: "Photo to Art",
                          icon: "🎨",
                        },
                        {
                          flag: "showValentineDay" as const,
                          label: "Valentine Day Special",
                          icon: "💝",
                        },
                        {
                          flag: "showTeachersDay" as const,
                          label: "Teachers Day Special",
                          icon: "📝",
                        },
                        {
                          flag: "showMothersDay" as const,
                          label: "Mothers Day Special",
                          icon: "👩‍👧",
                        },
                        {
                          flag: "showFathersDay" as const,
                          label: "Fathers Day Special",
                          icon: "👨‍👦",
                        },
                        {
                          flag: "showXmasDay" as const,
                          label: "Christmas Special",
                          icon: "🎄",
                        },
                        {
                          flag: "showPremiumBestSellers" as const,
                          label: "Premium Best Sellers",
                          icon: "⚡",
                        },
                        {
                          flag: "showCustomCakeCategories" as const,
                          label: "Custom Cake Categories",
                          icon: "🍰",
                        },
                        {
                          flag: "showPersonalisedBestSellers" as const,
                          label: "Personalised Best Sellers",
                          icon: "💖",
                        },
                        {
                          flag: "showCakesSection" as const,
                          label: "Cakes Products Feed",
                          icon: "🎂",
                        },
                        {
                          flag: "showCakeGallery" as const,
                          label: "Cake Gallery (Lookbook)",
                          icon: "🖼️",
                        },
                        {
                          flag: "showFlowersSection" as const,
                          label: "Flowers Feed",
                          icon: "🌸",
                        },
                        {
                          flag: "showGiftsSection" as const,
                          label: "Gifts & Combos Feed",
                          icon: "🎁",
                        },
                        {
                          flag: "showPlantsSection" as const,
                          label: "Plants Feed",
                          icon: "🌿",
                        },
                        {
                          flag: "showGiftsForHimHer" as const,
                          label: "Gifts for Him & Her Banners",
                          icon: "👫",
                        },
                        {
                          flag: "showAboutSection" as const,
                          label: "About Us Section",
                          icon: "📢",
                        },
                      ].map(({ flag, label, icon }) => {
                        const isVisible = localConfig?.[flag] !== false;
                        return (
                          <div
                            key={flag}
                            onClick={() => {
                              if (localConfig) {
                                const newConfig = {
                                  ...localConfig,
                                  [flag]: !isVisible,
                                };
                                setLocalConfig(newConfig);
                                if (onUpdateStoreConfig)
                                  onUpdateStoreConfig(newConfig);
                              }
                            }}
                            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between select-none ${
                              isVisible
                                ? "bg-pink-50/25 border-pink-200 shadow-xs"
                                : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-90 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm">{icon}</span>
                              <span className="text-[11px] font-extrabold text-slate-700">
                                {label}
                              </span>
                            </div>
                            <div
                              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${isVisible ? "bg-pink-600 justify-end" : "bg-slate-300 justify-start"}`}
                            >
                              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Special Events Layout Setup */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-rose-50 pb-3 text-left">
                      <span className="text-xl">🔲</span>
                      <div>
                        <h4 className="text-[11.5px] font-black uppercase tracking-wider text-slate-850">
                          Special Events Layout Setup
                        </h4>
                        <span className="text-[9.5px] text-slate-400 font-bold">
                          Choose between Grid (multi-column) or Slider
                          (horizontal scroll) for special sections
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                      {[
                        {
                          layoutConf: "valentineDayLayout",
                          flag: "showValentineDay",
                          label: "Valentine Day Special",
                          icon: "💝",
                        },
                        {
                          layoutConf: "teachersDayLayout",
                          flag: "showTeachersDay",
                          label: "Teachers Day Special",
                          icon: "📝",
                        },
                        {
                          layoutConf: "mothersDayLayout",
                          flag: "showMothersDay",
                          label: "Mothers Day Special",
                          icon: "👩‍👧",
                        },
                        {
                          layoutConf: "fathersDayLayout",
                          flag: "showFathersDay",
                          label: "Fathers Day Special",
                          icon: "👨‍👦",
                        },
                        {
                          layoutConf: "xmasDayLayout",
                          flag: "showXmasDay",
                          label: "Christmas Special",
                          icon: "🎄",
                        },
                      ].map(({ layoutConf, flag, label, icon }) => {
                        const currentLayout =
                          localConfig?.[layoutConf as keyof StoreConfig] ||
                          "grid";
                        const isVisible =
                          localConfig?.[flag as keyof StoreConfig] !== false;

                        if (!isVisible) return null;

                        return (
                          <div
                            key={layoutConf}
                            className="p-3 rounded-2xl border border-slate-200 flex flex-col gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{icon}</span>
                              <span className="text-[10px] font-extrabold text-slate-700">
                                {label}
                              </span>
                            </div>
                            <div className="flex items-center bg-slate-100 rounded-lg p-1 mt-1 shrink-0">
                              <button
                                onClick={() => {
                                  if (localConfig) {
                                    const newConfig = {
                                      ...localConfig,
                                      [layoutConf]: "grid",
                                    };
                                    setLocalConfig(newConfig);
                                    if (onUpdateStoreConfig)
                                      onUpdateStoreConfig(newConfig);
                                  }
                                }}
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded-md transition-all ${currentLayout === "grid" ? "bg-white shadow-sm text-pink-600" : "text-slate-500 hover:bg-white/50"}`}
                              >
                                Grid
                              </button>
                              <button
                                onClick={() => {
                                  if (localConfig) {
                                    const newConfig = {
                                      ...localConfig,
                                      [layoutConf]: "slider",
                                    };
                                    setLocalConfig(newConfig);
                                    if (onUpdateStoreConfig)
                                      onUpdateStoreConfig(newConfig);
                                  }
                                }}
                                className={`flex-1 py-1.5 text-[9px] font-bold rounded-md transition-all ${currentLayout === "slider" ? "bg-white shadow-sm text-pink-600" : "text-slate-500 hover:bg-white/50"}`}
                              >
                                Slider
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reordering Sections Container */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2.5 border-b border-rose-50 pb-3">
                      <span className="text-xl">↕️</span>
                      <div>
                        <h4 className="text-[11.5px] font-black uppercase tracking-wider text-slate-850">
                          Homepage Sections Serial-Wise Ordering
                        </h4>
                        <span className="text-[9.5px] text-slate-400 font-bold">
                          Rearrange sections to change their appearance order on
                          the website. Use Up/Down buttons.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-xl text-left">
                      {(() => {
                        const defaultSectionListOrder = [
                          {
                            id: "new_year",
                            label: "New Year Special",
                            icon: "🎆",
                          },
                          {
                            id: "rakhi",
                            label: "Rakhi Categories",
                            icon: "🪢",
                          },
                          {
                            id: "dewali",
                            label: "Dewali Categories",
                            icon: "🪔",
                          },
                          {
                            id: "hand_crafts",
                            label: "Hand Crafts Categories",
                            icon: "✂️",
                          },
                          {
                            id: "photo_to_art",
                            label: "Photo to Art Categories",
                            icon: "🎨",
                          },
                          {
                            id: "valentine_day",
                            label: "Valentine Day Special",
                            icon: "💝",
                          },
                          {
                            id: "teachers_day",
                            label: "Teachers Day Special",
                            icon: "📝",
                          },
                          {
                            id: "mothers_day",
                            label: "Mothers Day Special",
                            icon: "👩‍👧",
                          },
                          {
                            id: "fathers_day",
                            label: "Fathers Day Special",
                            icon: "👨‍👦",
                          },
                          {
                            id: "xmas",
                            label: "Christmas Special",
                            icon: "🎄",
                          },
                          {
                            id: "premium_bestsellers",
                            label: "Premium Best Sellers",
                            icon: "⚡",
                          },
                          {
                            id: "custom_cake_categories",
                            label: "Custom Cake Categories",
                            icon: "🍰",
                          },
                          {
                            id: "personalised_bestsellers",
                            label: "Personalised Best Sellers",
                            icon: "💖",
                          },
                          { id: "cakes", label: "Cakes Feed", icon: "🎂" },
                          {
                            id: "gallery",
                            label: "Cake Gallery (Lookbook)",
                            icon: "🖼️",
                          },
                          { id: "flowers", label: "Flowers Feed", icon: "🌸" },
                          {
                            id: "gifts",
                            label: "Gifts & Combos Feed",
                            icon: "🎁",
                          },
                          { id: "plants", label: "Table Plants", icon: "🌿" },
                          {
                            id: "gifts_for_him_her",
                            label: "Gifts for Him & Her Banners",
                            icon: "👫",
                          },
                          {
                            id: "about",
                            label: "About Us Section",
                            icon: "📢",
                          },
                        ];

                        const savedOrder =
                          localConfig?.homepageSectionsOrder || [];
                        const sortedDisplayList = Array.from(
                          new Set([
                            ...savedOrder.filter((id) =>
                              defaultSectionListOrder.some((d) => d.id === id),
                            ),
                            ...defaultSectionListOrder
                              .map((d) => d.id)
                              .filter((id) => !savedOrder.includes(id)),
                          ]),
                        ).map(
                          (id) =>
                            defaultSectionListOrder.find((d) => d.id === id)!,
                        );

                        const handleMoveSection = (
                          index: number,
                          direction: "up" | "down",
                        ) => {
                          if (!localConfig) return;
                          const nextList = sortedDisplayList.map(
                            (item) => item.id,
                          );
                          const temp = nextList[index];
                          if (direction === "up" && index > 0) {
                            nextList[index] = nextList[index - 1];
                            nextList[index - 1] = temp;
                          } else if (
                            direction === "down" &&
                            index < nextList.length - 1
                          ) {
                            nextList[index] = nextList[index + 1];
                            nextList[index + 1] = temp;
                          }
                          const newConfig = {
                            ...localConfig,
                            homepageSectionsOrder: nextList,
                          };
                          setLocalConfig(newConfig);
                          if (onUpdateStoreConfig)
                            onUpdateStoreConfig(newConfig);
                        };

                        return (
                          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden">
                            {sortedDisplayList.map((item, index) => {
                              const isVisible =
                                localConfig?.[
                                  `show${item.id === "cakes" ? "CakesSection" : item.id === "gallery" ? "CakeGallery" : item.id === "flowers" ? "FlowersSection" : item.id === "premium_bestsellers" ? "PremiumBestSellers" : item.id === "custom_cake_categories" ? "CustomCakeCategories" : item.id === "personalised_bestsellers" ? "PersonalisedBestSellers" : item.id === "gifts" ? "GiftsSection" : item.id === "plants" ? "PlantsSection" : item.id === "gifts_for_him_her" ? "GiftsForHimHer" : item.id === "new_year" ? "NewYear" : item.id === "rakhi" ? "Rakhi" : item.id === "dewali" ? "Dewali" : item.id === "hand_crafts" ? "HandCrafts" : item.id === "photo_to_art" ? "PhotoToArt" : item.id === "valentine_day" ? "ValentineDay" : item.id === "teachers_day" ? "TeachersDay" : item.id === "mothers_day" ? "MothersDay" : item.id === "fathers_day" ? "FathersDay" : item.id === "xmas" ? "XmasDay" : "AboutSection"}` as keyof StoreConfig
                                ] !== false;
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 bg-white/85 hover:bg-white transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black font-mono text-slate-350 w-4 block text-center">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm select-none">
                                      {item.icon}
                                    </span>
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-slate-800">
                                        {item.label}
                                      </span>
                                      <span
                                        className={`text-[8.5px] font-bold uppercase ${isVisible ? "text-pink-600" : "text-slate-400"}`}
                                      >
                                        {isVisible
                                          ? "Active & Visible"
                                          : "Disabled / Hidden"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={index === 0}
                                      onClick={() =>
                                        handleMoveSection(index, "up")
                                      }
                                      className={`p-1 rounded-lg border border-slate-150 transition-colors cursor-pointer select-none ${
                                        index === 0
                                          ? "text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed"
                                          : "text-slate-600 hover:bg-rose-50 bg-white border-slate-200"
                                      }`}
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={
                                        index === sortedDisplayList.length - 1
                                      }
                                      onClick={() =>
                                        handleMoveSection(index, "down")
                                      }
                                      className={`p-1 rounded-lg border border-slate-150 transition-colors cursor-pointer select-none ${
                                        index === sortedDisplayList.length - 1
                                          ? "text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed"
                                          : "text-slate-600 hover:bg-rose-50 bg-white border-slate-200"
                                      }`}
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Social Media Config Container */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2.5 border-b border-rose-50 pb-3">
                      <span className="text-xl">🌐</span>
                      <div>
                        <h4 className="text-[11.5px] font-black uppercase tracking-wider text-slate-850">
                          Social Media & Links Integration
                        </h4>
                        <span className="text-[9.5px] text-slate-400 font-bold">
                          Configure external links that will appear in the
                          footer. Empty fields will be hidden.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          key: "instagram",
                          label: "Instagram URL",
                          placeholder: "https://instagram.com/...",
                        },
                        {
                          key: "facebook",
                          label: "Facebook URL",
                          placeholder: "https://facebook.com/...",
                        },
                        {
                          key: "youtube",
                          label: "YouTube URL",
                          placeholder: "https://youtube.com/...",
                        },
                        {
                          key: "twitter",
                          label: "Twitter (X) URL",
                          placeholder: "https://twitter.com/...",
                        },
                        {
                          key: "linkedin",
                          label: "LinkedIn URL",
                          placeholder: "https://linkedin.com/in/...",
                        },
                        {
                          key: "whatsapp",
                          label: "WhatsApp URL",
                          placeholder: "https://wa.me/...",
                        },
                        {
                          key: "pinterest",
                          label: "Pinterest URL",
                          placeholder: "https://pinterest.com/...",
                        },
                      ].map((item) => (
                        <div key={item.key} className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase block">
                            {item.label}
                          </label>
                          <input
                            type="text"
                            placeholder={item.placeholder}
                            value={
                              localConfig?.socialLinks?.[
                                item.key as keyof typeof localConfig.socialLinks
                              ] || ""
                            }
                            onChange={(e) => {
                              if (localConfig) {
                                setLocalConfig({
                                  ...localConfig,
                                  socialLinks: {
                                    ...(localConfig.socialLinks || {}),
                                    [item.key]: e.target.value,
                                  },
                                });
                              }
                            }}
                            className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-slate-50 placeholder-slate-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-white border border-slate-150 rounded-3xl p-4 flex items-center justify-between shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold leading-snug">
                      Validate that your revisions are fully intact. Revisions
                      rewrite layout arrays permanently in Firestore.
                    </p>
                    <button
                      onClick={() => {
                        if (localConfig && onUpdateStoreConfig) {
                          onUpdateStoreConfig(localConfig);
                          alert(
                            "Homepage visuals updated successfully! Head back to the front page.",
                          );
                        }
                      }}
                      className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black uppercase rounded-2xl tracking-wide cursor-pointer shadow-lg shadow-pink-600/20 duration-200 transition-all active:scale-98 shrink-0"
                    >
                      Save Configuration Database
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 10: REVIEWS MANAGER PANEL */}
              {activeTab === "reviews" && (
                <div className="space-y-6 max-w-5xl">
                  {/* Header Intro Banner */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-slate-900/10">
                    <div className="relative z-10 space-y-1.5 p-1">
                      <span className="text-[9px] bg-pink-600 font-extrabold px-2 py-0.5 rounded tracking-widest block w-fit">
                        CATEGORY REVIEWS
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                        Client Testimonials
                      </h2>
                      <p className="text-slate-300 text-xs max-w-lg leading-relaxed font-semibold">
                        Edit the default 4 reviews shown under each product. You
                        can update names, star ratings, and the text of the
                        reviews per category.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-800 uppercase">
                          Select Category to Edit Reviews
                        </label>
                        <select
                          value={reviewSelectedCategory}
                          onChange={(e) =>
                            setReviewSelectedCategory(e.target.value)
                          }
                          className="w-full sm:w-1/2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="default">
                            ⭐ Default Reviews (Fallback)
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              📁 {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-6">
                        {(
                          storeConfig?.categoryReviews?.[
                            reviewSelectedCategory
                          ] ||
                          storeConfig?.categoryReviews?.["default"] ||
                          []
                        ).map((rev, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 relative"
                          >
                            <h4 className="text-xs font-black text-slate-800">
                              Review {idx + 1}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={rev.name}
                                onChange={(e) => {
                                  const newConfig = { ...storeConfig! };
                                  if (!newConfig.categoryReviews)
                                    newConfig.categoryReviews = { default: [] };

                                  // Clone reviews if modifying a new category for the first time
                                  if (
                                    !newConfig.categoryReviews[
                                      reviewSelectedCategory
                                    ]
                                  ) {
                                    newConfig.categoryReviews[
                                      reviewSelectedCategory
                                    ] = JSON.parse(
                                      JSON.stringify(
                                        newConfig.categoryReviews["default"],
                                      ),
                                    );
                                  }

                                  newConfig.categoryReviews[
                                    reviewSelectedCategory
                                  ][idx].name = e.target.value;
                                  if (onUpdateStoreConfig)
                                    onUpdateStoreConfig(newConfig);
                                }}
                                className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 w-full"
                                placeholder="Reviewer Name"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">
                                  Rating:
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={rev.rating}
                                  onChange={(e) => {
                                    let val = parseInt(e.target.value) || 5;
                                    val = Math.max(1, Math.min(5, val));
                                    const newConfig = { ...storeConfig! };
                                    if (!newConfig.categoryReviews)
                                      newConfig.categoryReviews = {
                                        default: [],
                                      };

                                    // Clone reviews if modifying a new category for the first time
                                    if (
                                      !newConfig.categoryReviews[
                                        reviewSelectedCategory
                                      ]
                                    ) {
                                      newConfig.categoryReviews[
                                        reviewSelectedCategory
                                      ] = JSON.parse(
                                        JSON.stringify(
                                          newConfig.categoryReviews["default"],
                                        ),
                                      );
                                    }

                                    newConfig.categoryReviews[
                                      reviewSelectedCategory
                                    ][idx].rating = val;
                                    if (onUpdateStoreConfig)
                                      onUpdateStoreConfig(newConfig);
                                  }}
                                  className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 w-20"
                                />
                              </div>
                            </div>
                            <textarea
                              value={rev.text}
                              onChange={(e) => {
                                const newConfig = { ...storeConfig! };
                                if (!newConfig.categoryReviews)
                                  newConfig.categoryReviews = { default: [] };

                                // Clone reviews if modifying a new category for the first time
                                if (
                                  !newConfig.categoryReviews[
                                    reviewSelectedCategory
                                  ]
                                ) {
                                  newConfig.categoryReviews[
                                    reviewSelectedCategory
                                  ] = JSON.parse(
                                    JSON.stringify(
                                      newConfig.categoryReviews["default"],
                                    ),
                                  );
                                }

                                newConfig.categoryReviews[
                                  reviewSelectedCategory
                                ][idx].text = e.target.value;
                                if (onUpdateStoreConfig)
                                  onUpdateStoreConfig(newConfig);
                              }}
                              className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 w-full resize-none h-20"
                              placeholder="Review Text"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: RIDERS / DELIVERY PARTNERS PANEL */}
              {activeTab === "riders" && (
                <div className="space-y-6 max-w-5xl">
                  {/* Header Intro Banner */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-slate-900/10">
                    <div className="relative z-10 space-y-1.5 p-1">
                      <span className="text-[9px] bg-pink-600 font-extrabold px-2 py-0.5 rounded tracking-widest block w-fit">
                        RIDERS REGISTRY
                      </span>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        Manage Delivery Partners
                      </h3>
                      <p className="text-[10.5px] text-slate-350 leading-relaxed font-semibold">
                        View current registered delivery agents who can receive
                        orders. You can delete or clean up obsolete accounts or
                        incorrect entries immediately.
                      </p>
                    </div>
                  </div>

                  {/* Riders List Card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                      <span className="text-lg">🛵</span>
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                          Rider Access List ({riders.length})
                        </h4>
                        <span className="text-[9px] text-slate-400 font-bold">
                          Agents who login inside Delivery Module appear here
                          and can be assigned orders
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                      {riders.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-mono text-[10.5px]">
                          No delivery partners registered yet. Let riders
                          register via the Delivery Panel module.
                        </div>
                      ) : (
                        riders.map((rider) => (
                          <div
                            key={rider.id}
                            className="p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-between gap-4 hover:border-slate-200 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-950 text-white font-black text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                  {rider.type || "DEFAULT"}
                                </span>
                                <span className="text-xs font-black text-slate-850">
                                  {rider.name}
                                </span>
                              </div>
                              <div className="text-[10px] space-y-0.5 text-slate-450 font-semibold font-mono">
                                {rider.email && (
                                  <div>
                                    <span className="text-slate-400">
                                      Gmail:
                                    </span>{" "}
                                    {rider.email}
                                  </div>
                                )}
                                <div>
                                  <span className="text-slate-400">
                                    Rider ID:
                                  </span>{" "}
                                  {rider.id}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (onDeleteRider) {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: "Delete Delivery Agent Access",
                                    message: `Are you sure you want to permanently revoke delivery partner status for "${rider.name}"? They will no longer see assigned orders.`,
                                    onConfirm: () => onDeleteRider(rider.id),
                                  });
                                } else {
                                  alert("Deletion not configured.");
                                }
                              }}
                              className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition cursor-pointer shrink-0"
                              title="Delete Delivery Partner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: SELLERS / MERCHANTS APPROVAL PANEL */}
              {activeTab === "sellers" && (
                <div className="space-y-6 max-w-5xl">
                  {/* Header Intro Banner */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-slate-900/10">
                    <div className="relative z-10 space-y-1.5 p-1">
                      <span className="text-[9px] bg-pink-600 font-extrabold px-2 py-0.5 rounded tracking-widest block w-fit">
                        🏢 SELLER REGISTRATIONS
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-none pt-1">
                        Merchant Network Access
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold max-w-2xl">
                        Review, approve, or reject third-party seller
                        applications.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4.5 sm:p-5 rounded-2.5xl flex flex-col items-stretch space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-900 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-pink-600" />
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                          Submitted Applications
                        </h3>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by Pincode..."
                          value={sellerSearchPincode}
                          onChange={(e) =>
                            setSellerSearchPincode(e.target.value)
                          }
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {sellers.filter(
                        (s) =>
                          !sellerSearchPincode ||
                          s.pincode?.includes(sellerSearchPincode),
                      ).length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 border border-slate-100 border-dashed rounded-xl">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            No applications found in the database.
                          </p>
                        </div>
                      ) : (
                        sellers
                          .filter(
                            (s) =>
                              !sellerSearchPincode ||
                              s.pincode?.includes(sellerSearchPincode),
                          )
                          .map((seller) => {
                            const dt = seller.createdAt?.toDate
                              ? seller.createdAt.toDate()
                              : seller.createdAt
                                ? new Date(seller.createdAt)
                                : new Date();
                            return (
                              <div
                                key={seller.id}
                                className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between transition hover:border-slate-300"
                              >
                                <div className="space-y-4 flex-1 p-2">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span
                                      className={`font-black text-[10px] sm:text-xs font-mono px-3 py-1 rounded-full uppercase tracking-widest leading-none border-2 shadow-sm ${seller.status === "Approved" ? "bg-green-100 text-green-800 border-green-300" : seller.status === "Rejected" ? "bg-red-100 text-red-800 border-red-300" : "bg-yellow-100 text-yellow-800 border-yellow-400 font-bold"}`}
                                    >
                                      {seller.status || "Pending"}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                      {seller.businessName}
                                    </h3>
                                  </div>

                                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                                      Selected Business Types
                                    </h4>
                                    {seller.businessTypes &&
                                    seller.businessTypes.length > 0 ? (
                                      <ul className="list-inside space-y-1.5 ml-1">
                                        {seller.businessTypes.map(
                                          (type: string, i: number) => (
                                            <li
                                              key={i}
                                              className="text-[13px] sm:text-sm font-black text-rose-600"
                                            >
                                              {seller.businessTypes.length >
                                              1 ? (
                                                <span className="text-slate-400 mr-2 font-bold">
                                                  {i + 1}.
                                                </span>
                                              ) : (
                                                ""
                                              )}
                                              {type}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    ) : (
                                      <div className="text-[13px] sm:text-sm font-black text-rose-600 ml-1">
                                        {seller.businessType || "Not Specified"}
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                                        Owner Name
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        {seller.ownerName}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                                        Contact Phone
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        {seller.phone}{" "}
                                        {seller.altPhone && (
                                          <span className="text-slate-400 font-normal">
                                            | {seller.altPhone}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                                        Email Address
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        {seller.email}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                                        Location
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        {seller.city} - {seller.pincode}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-sm text-slate-800 bg-white p-4 rounded-xl border-2 border-slate-50 shadow-sm mt-4">
                                    <div className="flex flex-col mb-3">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                        Full Address
                                      </span>
                                      <span className="font-semibold text-slate-700 leading-relaxed">
                                        {seller.address}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-50 pt-3">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                          PAN
                                        </span>
                                        <span className="font-mono font-bold text-slate-600 mt-0.5">
                                          {seller.panNumber || "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                          Aadhar
                                        </span>
                                        <span className="font-mono font-bold text-slate-600 mt-0.5">
                                          {seller.aadharNumber || "N/A"}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                          FSSAI License
                                        </span>
                                        <span className="font-mono font-bold text-slate-600 mt-0.5">
                                          {seller.fssaiLicense || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {(seller.bankAccountName ||
                                    seller.bankAccountNumber ||
                                    seller.ifscCode) && (
                                    <div className="text-sm text-slate-800 bg-white p-4 rounded-xl border-2 border-slate-50 shadow-sm mt-4">
                                      <div className="flex flex-col mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                          Bank Details
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-x-8 gap-y-3">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Account Name
                                          </span>
                                          <span className="font-bold text-slate-700 mt-0.5">
                                            {seller.bankAccountName || "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Account Number
                                          </span>
                                          <span className="font-mono font-bold text-slate-700 mt-0.5">
                                            {seller.bankAccountNumber || "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            IFSC Code
                                          </span>
                                          <span className="font-mono font-bold text-slate-700 mt-0.5">
                                            {seller.ifscCode || "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex gap-4 items-center text-[11px] text-slate-400 font-mono mt-4 ml-1">
                                    <span>
                                      Applied:{" "}
                                      <strong className="text-slate-500">
                                        {dt.toLocaleDateString()}
                                      </strong>
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span>ID: {seller.id}</span>
                                  </div>
                                </div>

                                <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                                  {seller.status === "Pending" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          saveSellerToFirestore({
                                            ...seller,
                                            status: "Approved",
                                          });
                                        }}
                                        className="p-2 border border-emerald-100 hover:bg-emerald-50 text-emerald-600 rounded-xl transition cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm flex-1 sm:flex-none text-center"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          setConfirmModal({
                                            isOpen: true,
                                            title: "Reject Seller",
                                            message: `Are you sure you want to reject the application for ${seller.businessName}?`,
                                            onConfirm: () => {
                                              saveSellerToFirestore({
                                                ...seller,
                                                status: "Rejected",
                                              });
                                            },
                                          });
                                        }}
                                        className="p-2 border border-orange-100 hover:bg-orange-50 text-orange-600 rounded-xl transition cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm flex-1 sm:flex-none text-center"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: "Delete Application",
                                        message: `Are you sure you want to permanently delete the application for "${seller.businessName}"?`,
                                        onConfirm: () =>
                                          deleteSellerFromFirestore(seller.id),
                                      });
                                    }}
                                    className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition cursor-pointer shrink-0 mt-auto"
                                    title="Delete Seller Application"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bottom Bar (Keeps layout structure clean) */}
            <div className="bg-slate-100 px-5 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[9.5px] font-black text-rose-600 uppercase tracking-widest font-mono">
                Rocx Cakes
              </span>
              <button
                onClick={onClose}
                className="py-2.5 px-6 bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-wider rounded-xl cursor-pointer"
              >
                Close Control Center
              </button>
            </div>
          </>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setEditingProduct(null)}
          />
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 relative z-10 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Edit Product Stock: {editingProduct.name}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-405 hover:text-slate-650 p-1 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                  Product Picture
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        try {
                          const base64 = await compressImageFile(
                            file,
                            800,
                            0.6,
                          );
                          if (editingProduct) {
                            setEditingProduct({
                              ...editingProduct,
                              image: base64,
                            });
                          }
                        } catch (err) {
                          console.error(
                            "Product edit image compression failed:",
                            err,
                          );
                          alert(
                            "Image upload failed. The photo might be too large or unsupported (HEIC). Please try another photo.",
                          );
                        }
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                  />
                  {editingProduct.image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <img
                        src={editingProduct.image}
                        className="w-full h-full object-cover"
                        alt="Image preview"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Or paste web image URL instead"
                    value={
                      (editingProduct.image || "").startsWith("data:")
                        ? ""
                        : editingProduct.image || ""
                    }
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        image: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />

                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mt-3 mb-1">
                    Additional Gallery Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        try {
                          const newBase64s = await Promise.all(
                            Array.from(e.target.files).map((file: any) =>
                              compressImageFile(file, 800, 0.6),
                            ),
                          );
                          if (editingProduct) {
                            setEditingProduct({
                              ...editingProduct,
                              images: [
                                ...(editingProduct.images || []),
                                ...newBase64s,
                              ],
                            });
                          }
                        } catch (err) {
                          console.error("Gallery compress fail:", err);
                        }
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                  />
                  {editingProduct.images &&
                    editingProduct.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {editingProduct.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200"
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                              alt="Gallery preview"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [
                                  ...(editingProduct.images || []),
                                ];
                                newImages.splice(idx, 1);
                                setEditingProduct({
                                  ...editingProduct,
                                  images:
                                    newImages.length > 0
                                      ? newImages
                                      : undefined,
                                });
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[8px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                    Original Old Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 799"
                    value={editingProduct.originalPrice || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                    Unique Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 50)"
                    value={editingProduct.deliveryFee ?? ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        deliveryFee: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 mt-4 ml-1">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isTwoHourDelivery}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isTwoHourDelivery: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label className="text-[10px] text-slate-600 font-extrabold uppercase cursor-pointer">
                    2 Hours Delivery
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                    Rating (1.0 to 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="5.0"
                    value={editingProduct.rating || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        rating: parseFloat(e.target.value) || 5.0,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                  Description (Preserves line-breaks exactly)
                </label>
                <textarea
                  placeholder="Enter detailed description, flavor notes, etc..."
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                  About Product (Optional)
                </label>
                <textarea
                  placeholder="Enter About Product details..."
                  value={editingProduct.aboutProduct || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      aboutProduct: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                  Delivery & Care (Optional)
                </label>
                <textarea
                  placeholder="Enter Delivery and care instructions..."
                  value={editingProduct.deliveryCare || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      deliveryCare: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-pink-600 font-extrabold uppercase block mb-1">
                  Admin Note / Delivery Message (Shows in Product Detail &
                  Checkout)
                </label>
                <textarea
                  placeholder="E.g. Delivery of this specific cake takes 3-4 hours of baking time."
                  value={editingProduct.adminNote || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      adminNote: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl text-xs font-semibold text-pink-950 placeholder-pink-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                <div>
                  <label className="text-[10px] text-slate-700 font-extrabold uppercase block mb-0.5">
                    Enable Customize Photo Upload
                  </label>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    Let customers upload photos on details view
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!editingProduct.options?.hasPhotoUpload}
                  onChange={(e) => {
                    setEditingProduct({
                      ...editingProduct,
                      options: {
                        ...(editingProduct.options || {}),
                        hasPhotoUpload: e.target.checked,
                      },
                    });
                  }}
                  className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                <div>
                  <label className="text-[10px] text-slate-750 font-extrabold uppercase block mb-0.5">
                    Enable Name Customization (Write on Cake)
                  </label>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    Allow customers to enter a name to print/write in checkout
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!editingProduct.options?.hasNameCustomization}
                  onChange={(e) => {
                    setEditingProduct({
                      ...editingProduct,
                      options: {
                        ...(editingProduct.options || {}),
                        hasNameCustomization: e.target.checked,
                      },
                    });
                  }}
                  className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                <div>
                  <label className="text-[10px] text-[#111827] font-extrabold uppercase block mb-0.5">
                    💖 Show in Personalised Best Sellers
                  </label>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    Display in Personalised Best Sellers slider on homepage
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!editingProduct.isPersonalisedBestSeller}
                  onChange={(e) => {
                    setEditingProduct({
                      ...editingProduct,
                      isPersonalisedBestSeller: e.target.checked,
                    });
                  }}
                  className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                  Primary Category (Optional)
                </label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => {
                    const selected = e.target.value as CategoryID;
                    const updatedCategories = (
                      editingProduct.categories || []
                    ).filter((c) => c !== selected);
                    const isCakeNow =
                      selected === "cakes" ||
                      updatedCategories.includes("cakes");
                    const isPersonalisedNow =
                      selected === "personalized_gifts" ||
                      updatedCategories.includes("personalized_gifts");
                    setEditingProduct({
                      ...editingProduct,
                      category: selected,
                      categories: updatedCategories,
                      options: {
                        ...(editingProduct.options || {}),
                        hasWeightOptions: isCakeNow,
                        hasEgglessOption: isCakeNow,
                        hasMessageOption: true,
                        hasPhotoUpload: isPersonalisedNow,
                      },
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-850 focus:outline-none cursor-pointer"
                >
                  <option value="">None (Subcategory only)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                  Also Show in Secondary Categories (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {allPossibleSecondaryCategories.map((cat) => {
                    if (cat.id === editingProduct.category) return null;
                    const secondaryList = editingProduct.categories || [];
                    const isChecked = secondaryList.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer select-none p-1 hover:bg-slate-200/40 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            let nextList = [...secondaryList];
                            if (isChecked) {
                              nextList = nextList.filter((c) => c !== cat.id);
                            } else {
                              if (!nextList.includes(cat.id)) {
                                nextList.push(cat.id);
                              }
                            }
                            const isCakeNow =
                              editingProduct.category === "cakes" ||
                              nextList.includes("cakes");
                            const isPersonalisedNow =
                              editingProduct.category ===
                                "personalized_gifts" ||
                              nextList.includes("personalized_gifts");
                            setEditingProduct({
                              ...editingProduct,
                              categories: nextList,
                              options: {
                                ...(editingProduct.options || {}),
                                hasWeightOptions: isCakeNow,
                                hasEgglessOption: isCakeNow,
                                hasMessageOption: true,
                                // photo upload for custom printed photo cakes or personalized gifts
                                hasPhotoUpload:
                                  isPersonalisedNow ||
                                  nextList.includes("photo_cake"),
                              },
                            });
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-700 text-[10.5px]">
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {editingProduct.options?.hasWeightOptions && (
                <div className="border border-indigo-100 bg-indigo-50/20 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-950 font-black uppercase tracking-wider block">
                      🎂 Custom Weight Prices Grid
                    </span>
                    <span className="text-[8px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded tracking-widest block font-mono">
                      OVERWRITES MULTIPLIERS
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-normal font-semibold">
                    Define manual prices for each cake size individually. If
                    left empty, default weight multiplier calculations will
                    apply.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {Array.from(
                      new Set([
                        "0.5 Kg",
                        "1.0 Kg",
                        "1.5 Kg",
                        "2.0 Kg",
                        "2.5 Kg",
                        "3.0 Kg",
                        ...(editingProduct.allowedWeights || []),
                        ...Object.keys(editingProduct.weightPrices || {}),
                      ]),
                    ).map((wt) => {
                      // Get current manual price if exists, otherwise display empty (which triggers autocalculation fallback)
                      const currentVal =
                        editingProduct.weightPrices?.[wt] !== undefined
                          ? editingProduct.weightPrices[wt]
                          : "";

                      return (
                        <div key={wt} className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-black font-mono block">
                            {wt} Price (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="Autocalculated"
                            value={currentVal}
                            onChange={(e) => {
                              const val =
                                e.target.value === ""
                                  ? undefined
                                  : parseFloat(e.target.value);
                              const nextPrices = {
                                ...(editingProduct.weightPrices || {}),
                              };
                              if (val === undefined) {
                                delete nextPrices[wt];
                              } else {
                                nextPrices[wt] = val;
                              }
                              setEditingProduct({
                                ...editingProduct,
                                weightPrices: nextPrices,
                              });
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-black font-mono"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 border-t border-indigo-100/30 pt-3.5 mt-2">
                    <span className="text-[10px] text-indigo-950 font-black uppercase tracking-wider block">
                      🎂 Visible Weights Selection (Optional)
                    </span>
                    <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                      Select which weights will be shown for this cake product.
                      If left empty, all standard options (0.5 Kg to 3.0 Kg)
                      will be shown.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {Array.from(
                        new Set([
                          "0.5 Kg",
                          "1.0 Kg",
                          "1.5 Kg",
                          "2.0 Kg",
                          "2.5 Kg",
                          "3.0 Kg",
                          ...(editingProduct.allowedWeights || []),
                          ...Object.keys(editingProduct.weightPrices || {}),
                        ]),
                      ).map((wt) => {
                        const currentWeights =
                          editingProduct.allowedWeights || [];
                        const isChecked = currentWeights.includes(wt);
                        return (
                          <label
                            key={wt}
                            className="flex items-center gap-1.5 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const nextWeights = isChecked
                                  ? currentWeights.filter((w) => w !== wt)
                                  : [...currentWeights, wt];
                                setEditingProduct({
                                  ...editingProduct,
                                  allowedWeights:
                                    nextWeights.length > 0
                                      ? nextWeights
                                      : undefined,
                                });
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <span className="text-[10.5px] font-bold text-slate-700">
                              {wt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1 pt-3 mt-3 border-t border-indigo-100/30">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1">
                      Add Additional Weight Size
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 5.0 Kg"
                        value={editCustomWeightInput}
                        onChange={(e) =>
                          setEditCustomWeightInput(e.target.value)
                        }
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = editCustomWeightInput.trim();
                          if (val) {
                            const newWs = editingProduct.allowedWeights
                              ? [...editingProduct.allowedWeights]
                              : [];
                            if (!newWs.includes(val)) {
                              newWs.push(val);
                            }
                            setEditingProduct({
                              ...editingProduct,
                              allowedWeights: newWs,
                            });
                            setEditCustomWeightInput("");
                          }
                        }}
                        className="px-3 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-2.5 text-slate-600 hover:bg-slate-50 bg-slate-105 text-xs font-black uppercase rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateProduct(editingProduct);
                  setEditingProduct(null);
                  alert("Product catalog successfully updated everywhere!");
                }}
                className="flex-1 py-2.5 text-white bg-pink-600 hover:bg-pink-700 text-xs font-black uppercase rounded-xl cursor-pointer shadow-lg shadow-pink-600/20"
              >
                Save Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC CONFIRM MODAL TO PREVENT IFRAME WINDOW.CONFIRM BLOCKS */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl space-y-4 animate-scaleUp">
            <div className="text-center space-y-2">
              <span className="text-3xl text-pink-500 block">⚠️</span>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 leading-none">
                {confirmModal.title}
              </h4>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-slate-55 hover:bg-slate-100 text-slate-650 text-xs font-black uppercase rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
