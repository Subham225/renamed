import { safeSetStorage } from "./types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Gift,
  Sparkles,
  Smile,
  Star,
  ShoppingCart,
  ArrowUp,
  CheckCircle,
  Zap,
  AlertTriangle,
  Database,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  Product,
  CartItem,
  CategoryID,
  Location,
  Coupon,
  Category,
  Slide,
  GalleryItem,
  StoreConfig,
  isBentoCakeProduct,
  DeliveryAgent,
  DELIVERY_AGENTS,
} from "./types";
import { CATEGORIES, PRODUCTS, CITIES } from "./data";

import Header from "./components/Header";
import CategoryNav from "./components/CategoryNav";
import TopCategoryBar from "./components/TopCategoryBar";
import CakeTypewriterSlider from "./components/CakeTypewriterSlider";
import CategoryGrid from "./components/CategoryGrid";
import CategoryExplorePage from "./components/CategoryExplorePage";
import ProductList from "./components/ProductList";
import ProductDetailPage from "./components/ProductDetailPage";
import CategoryDetailPage from "./components/CategoryDetailPage";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import LocationDrawer from "./components/LocationDrawer";
import ProfileDrawer from "./components/ProfileDrawer";
import TrackOrderDrawer from "./components/TrackOrderDrawer";
import CustomerCareDrawer from "./components/CustomerCareDrawer";
import BottomNavBar from "./components/BottomNavBar";
import SidebarMenuDrawer from "./components/SidebarMenuDrawer";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";
import DeliveryPanel from "./components/DeliveryPanel";
import SellerPanel from "./components/SellerPanel";
import { TermsAndConditions, PrivacyPolicy, RefundPolicy, ShippingPolicy, ReturnPolicy } from "./components/Policies";

import {
  getProductsFromFirestore,
  getOrdersFromFirestore,
  getOrderFromFirestore,
  subscribeToOrdersFromFirestore,
  subscribeToProductsFromFirestore,
  subscribeToCouponsFromFirestore,
  subscribeToRidersFromFirestore,
  saveRiderToFirestore,
  addProductToFirestore,
  deleteProductFromFirestore,
  updateProductInFirestore,
  addOrderToFirestore,
  updateOrderStatusInFirestore,
  updateOrderOtpInFirestore,
  updateOrderPickupInFirestore,
  assignOrderRiderInFirestore,
  updateOrderPaymentStatusInFirestore,
  getCouponsFromFirestore,
  addCouponToFirestore,
  deleteCouponFromFirestore,
  ensureDefaultProducts,
  ensureDefaultCoupons,
  subscribeToSlidesFromFirestore,
  addSlideToFirestore,
  deleteSlideFromFirestore,
  subscribeToGalleryFromFirestore,
  subscribeToStoreConfigFromFirestore,
  updateStoreConfigInFirestore,
  deleteRiderFromFirestore,
  DEFAULT_STORE_CONFIG,
  DEFAULT_SLIDES,
  DEFAULT_GALLERY,
} from "./services/dbService";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export default function App() {
  // --- STATE ---
  const [currentLocation, setCurrentLocation] = useState<Location>({
    city: "",
    pincode: "",
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryID | null>(
    null,
  );
  const [categorySource, setCategorySource] = useState<'top' | 'grid' | 'nav'>('top');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appRandomOrderMap] = useState(() => new Map<string, number>());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Drawer visibility states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState<string>("");

  // Custom states
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("rocx_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleWishlist = (productId: string) => {
    setWishlistProductIds((prev) => {
      const isWishlisted = prev.includes(productId);
      const next = isWishlisted
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      safeSetStorage("rocx_wishlist", JSON.stringify(next));
      return next;
    });
  };

  // Admin Panel Visibility State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(() => {
    return window.location.hash === "#admin";
  });

  // Seller Panel Visibility State
  const [isSellerPanelOpen, setIsSellerPanelOpen] = useState(() => {
    return window.location.hash === "#seller";
  });

  // Delivery panel open status (force-opens if a picked order exists in active run lock)
  const [isDeliveryPanelOpen, setIsDeliveryPanelOpen] = useState(() => {
    return (
      !!localStorage.getItem("rocx_delivery_picked_order_id") ||
      window.location.hash === "#delivery"
    );
  });

  const [activePolicy, setActivePolicy] = useState<'terms' | 'privacy' | 'refund' | 'return' | 'shipping' | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#admin") setIsAdminPanelOpen(true);
      if (hash === "#delivery") setIsDeliveryPanelOpen(true);
      if (hash === "#seller") setIsSellerPanelOpen(true);
      
      // Handle policy links
      if (hash === "#terms") { setActivePolicy('terms'); window.scrollTo(0, 0); }
      else if (hash === "#privacy") { setActivePolicy('privacy'); window.scrollTo(0, 0); }
      else if (hash === "#shipping") { setActivePolicy('shipping'); window.scrollTo(0, 0); }
      else if (hash === "#return") { setActivePolicy('return'); window.scrollTo(0, 0); }
      else if (hash === "#refund") { setActivePolicy('refund'); window.scrollTo(0, 0); }
      else setActivePolicy(null); // Clear policy if no matching hash
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Dynamic Gifting Offers promo code callback helper
  const handleApplyPromoFromOffer = (code: string) => {
    // Open cart drawer immediately to allow automatic application
    setIsCartOpen(true);
  };

  // --- LOCAL USER AUTHENTICATION STATE ---
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("rocx_user_email") || "";
  });
  const [userPhone, setUserPhone] = useState<string>(() => {
    return localStorage.getItem("rocx_user_phone") || "";
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!(
      localStorage.getItem("rocx_user_email") ||
      localStorage.getItem("rocx_user_phone")
    );
  });
  const [loginType, setLoginType] = useState<"google" | "phone" | null>(() => {
    if (localStorage.getItem("rocx_user_email")) return "google";
    if (localStorage.getItem("rocx_user_phone")) return "phone";
    return null;
  });

  const handleLogin = (emailOrPhone: string, type: "google" | "phone") => {
    setIsLoggedIn(true);
    setLoginType(type);
    if (type === "google") {
      setUserEmail(emailOrPhone);
      safeSetStorage("rocx_user_email", emailOrPhone);
    } else {
      setUserPhone(emailOrPhone);
      safeSetStorage("rocx_user_phone", emailOrPhone);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut from Firebase Auth warning:", e);
    }
    setIsLoggedIn(false);
    setLoginType(null);
    setUserEmail("");
    setUserPhone("");
    localStorage.removeItem("rocx_user_email");
    localStorage.removeItem("rocx_user_phone");
    localStorage.removeItem("rocx_user_name");
  };

  // --- DURABLE PRODUCTS CATALOG STATE ---
  const [productsCatalog, setProductsCatalog] = useState<Product[]>(() => {
    const saved = localStorage.getItem("rocx_products");
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        const mappedLoaded = loaded.map((prod: Product) => {
          if (isBentoCakeProduct(prod)) {
            return { ...prod, price: 299 };
          }
          return prod;
        });

        return mappedLoaded;
      } catch (e) {
        console.error(e);
      }
    }
    return PRODUCTS.map((prod) => {
      if (isBentoCakeProduct(prod)) {
        return { ...prod, price: 299 };
      }
      return prod;
    });
  });

  // Handle browser back/forward and initial load
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const urlProductId = params.get("product");
      const urlCategory = params.get("category") as CategoryID;

      if (urlProductId) {
        const foundProd = productsCatalog.find((p) => p.id === urlProductId);
        if (foundProd) setSelectedProduct(foundProd);
      } else {
        setSelectedProduct(null);
      }

      if (urlCategory) {
        setSelectedCategory(urlCategory);
      } else {
        setSelectedCategory(null);
      }
    };

    // Run on mount or when catalog changes
    if (productsCatalog.length > 0) {
      // Only run once on mount for deep linking, after that the existing popstate handles it
      handleLocationChange();
    }
  }, [productsCatalog]);

  const handleAddProduct = async (newProd: Product) => {
    const updated = [newProd, ...productsCatalog];
    setProductsCatalog(updated);
    safeSetStorage("rocx_products", JSON.stringify(updated));
    try {
      await addProductToFirestore(newProd);
    } catch (err) {
      console.error("Firestore saving product error:", err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const updated = productsCatalog.filter((p) => p.id !== productId);
    setProductsCatalog(updated);
    safeSetStorage("rocx_products", JSON.stringify(updated));
    try {
      await deleteProductFromFirestore(productId);
    } catch (err) {
      console.error("Firestore deleting product error:", err);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    setProductsCatalog((prev) => {
      const updated = prev.map((p) => (p.id === product.id ? product : p));
      safeSetStorage("rocx_products", JSON.stringify(updated));
      return updated;
    });
    try {
      await updateProductInFirestore(product);
    } catch (err) {
      console.error("Firestore updating product error:", err);
    }
  };

  // --- DURABLE STORE SETTINGS STATE ---
  // Dynamic sanitizer to correct any broken Unsplash image references in users static configuration
  const sanitizeStoreConfig = (config: StoreConfig): StoreConfig => {
    if (!config || !config.cakeSubcategories) return config;
    let converted = false;
    const cleanSubcategories = config.cakeSubcategories.map((item) => {
      if (item.image && item.image.includes("photo-1557925923-33b251d59293")) {
        converted = true;
        return {
          ...item,
          image: item.image.replace(
            "photo-1557925923-33b251d59293",
            "photo-1621303837174-89787a7d4729",
          ),
        };
      }
      return item;
    });

    let newConfig = { ...config };
    if (converted) {
      newConfig.cakeSubcategories = cleanSubcategories;
    }

    if (!newConfig.deliveryZones) {
      newConfig.deliveryZones = DEFAULT_STORE_CONFIG.deliveryZones;
      converted = true;
    }

    if (!newConfig.deliveryTimeSlots) {
      newConfig.deliveryTimeSlots = DEFAULT_STORE_CONFIG.deliveryTimeSlots;
      converted = true;
    }

    if (
      !newConfig.categoryReviews ||
      !newConfig.categoryReviews["default"] ||
      newConfig.categoryReviews["default"].length === 0
    ) {
      newConfig.categoryReviews = {
        ...newConfig.categoryReviews,
        default: DEFAULT_STORE_CONFIG.categoryReviews?.["default"] || [
          {
            id: "1",
            name: "Amit Sharma",
            rating: 5,
            text: "Absolutely wonderful experience. The cake was fresh and delivered right on time!",
          },
          {
            id: "2",
            name: "Priya Das",
            rating: 5,
            text: "Amazing taste and presentation. Highly recommended for any celebration.",
          },
          {
            id: "3",
            name: "Rahul Verma",
            rating: 4,
            text: "Very good quality, the packaging was also very premium. Loved it.",
          },
          {
            id: "4",
            name: "Sneha Gupta",
            rating: 5,
            text: "Best customized gift I have ordered online. Great value and service.",
          },
        ],
      };
      converted = true;
    }

    return converted ? newConfig : config;
  };

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem("rocx_store_config");
    if (saved) {
      try {
        return sanitizeStoreConfig(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    return sanitizeStoreConfig(DEFAULT_STORE_CONFIG);
  });

  const handleUpdateStoreConfig = async (newConfig: StoreConfig) => {
    setStoreConfig(newConfig);
    safeSetStorage("rocx_store_config", JSON.stringify(newConfig));
    try {
      await updateStoreConfigInFirestore(newConfig);
    } catch (err) {
      console.error("Firestore updating store config error:", err);
    }
  };

  // --- DURABLE CATEGORIES CATALOG STATE ---
  const [categoriesCatalog, setCategoriesCatalog] = useState<Category[]>(() => {
    const saved = localStorage.getItem("rocx_categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Category[];
        // Merge missing default categories like xmas, fathers_day, etc.
        CATEGORIES.forEach((defaultCat) => {
          if (!parsed.find((p) => p.id === defaultCat.id)) {
            parsed.push(defaultCat);
          }
        });
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES;
  });

  const sortedCategoriesCatalog = useMemo(() => {
    return [...categoriesCatalog].sort((a, b) => {
      const orderA =
        a.displayOrder !== undefined &&
        a.displayOrder !== null &&
        !isNaN(Number(a.displayOrder))
          ? Number(a.displayOrder)
          : 999;
      const orderB =
        b.displayOrder !== undefined &&
        b.displayOrder !== null &&
        !isNaN(Number(b.displayOrder))
          ? Number(b.displayOrder)
          : 999;
      return orderA - orderB;
    });
  }, [categoriesCatalog]);

  const visibleCategories = useMemo(() => {
    return sortedCategoriesCatalog.filter(
      (cat) => cat.isVisible !== false && cat.hidden !== true,
    );
  }, [sortedCategoriesCatalog]);

  const handleAddCategory = async (newCat: any) => {
    const updated = [...categoriesCatalog, newCat];
    setCategoriesCatalog(updated);
    safeSetStorage("rocx_categories", JSON.stringify(updated));
    try {
      await setDoc(doc(db, "categories", newCat.id), newCat);
    } catch (err) {
      console.error("Firestore saving category error:", err);
    }
  };

  const handleUpdateCategory = async (updatedCat: any) => {
    const items = Array.isArray(updatedCat) ? updatedCat : [updatedCat];
    setCategoriesCatalog((prev) => {
      let updated = [...prev];
      items.forEach((item) => {
        updated = updated.map((c) => (c.id === item.id ? item : c));
      });
      safeSetStorage("rocx_categories", JSON.stringify(updated));
      return updated;
    });
    try {
      for (const item of items) {
        await setDoc(doc(db, "categories", item.id), item);
      }
    } catch (err) {
      console.error("Firestore updating category error:", err);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const updated = categoriesCatalog.filter((c) => c.id !== categoryId);
    setCategoriesCatalog(updated);
    safeSetStorage("rocx_categories", JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, "categories", categoryId));
    } catch (err) {
      console.error("Firestore deleting category error:", err);
    }
  };

  // --- COUPON CODES ENTERPRISE DATABASE STATE ---
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const handleAddCoupon = async (newCoupon: Coupon) => {
    const nextCoups = [...coupons, newCoupon];
    setCoupons(nextCoups);
    try {
      await addCouponToFirestore(newCoupon);
    } catch (err) {
      console.error("Firestore saving coupon error:", err);
    }
  };

  const handleUpdateCoupon = async (updatedCoupon: Coupon) => {
    const nextCoups = coupons.map((c) =>
      c.code === updatedCoupon.code ? updatedCoupon : c,
    );
    setCoupons(nextCoups);
    try {
      await addCouponToFirestore(updatedCoupon);
    } catch (err) {
      console.error("Firestore updating coupon error:", err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    const nextCoups = coupons.filter((c) => c.code !== code);
    setCoupons(nextCoups);
    try {
      await deleteCouponFromFirestore(code);
    } catch (err) {
      console.error("Firestore deleting coupon error:", err);
    }
  };

  // --- DURABLE FRONT HOME PAGE CAROUSEL SLIDES STATE ---
  const [slides, setSlides] = useState<Slide[]>(() => {
    return DEFAULT_SLIDES;
  });

  const handleUpdateSlide = async (updatedSlide: Slide) => {
    try {
      await addSlideToFirestore(updatedSlide);
    } catch (err) {
      console.error("Firestore updating banner slide error:", err);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    try {
      await deleteSlideFromFirestore(slideId);
    } catch (err) {
      console.error("Firestore deleting banner slide error:", err);
    }
  };

  // --- DURABLE FRONT HOME PAGE GALLERY STATE ---
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    return DEFAULT_GALLERY;
  });

  const handleAddGalleryItem = async (newItem: GalleryItem) => {
    try {
      const { addGalleryItemToFirestore } =
        await import("./services/dbService");
      await addGalleryItemToFirestore(newItem);
    } catch (err) {
      console.error("Firestore adding gallery lookbook picture error:", err);
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    try {
      const { deleteGalleryItemFromFirestore } =
        await import("./services/dbService");
      await deleteGalleryItemFromFirestore(itemId);
    } catch (err) {
      console.error("Firestore deleting gallery lookbook picture error:", err);
    }
  };

  // --- DURABLE DELIVERY RIDERS STATE ---
  const [dbRiders, setDbRiders] = useState<DeliveryAgent[]>([]);
  const allRiders = useMemo(() => {
    // Only return registered dynamic riders whose type is 'google' or are authenticated via Google/Gmail
    return dbRiders.filter((r) => r.type === "google" || !!r.email);
  }, [dbRiders]);

  const handleDeleteRider = async (riderId: string) => {
    // Optimistic UI update: remove the rider immediately from the local state
    setDbRiders((prev) => prev.filter((r) => r.id !== riderId));
    try {
      await deleteRiderFromFirestore(riderId);
    } catch (err) {
      console.error("Firestore deleting rider error:", err);
    }
  };

  // --- DURABLE ORDERS TRANSACTIONAL DATABASE STATE ---
  const [firebaseSyncError, setFirebaseSyncError] = useState<string | null>(
    null,
  );
  const [dismissSyncBanner, setDismissSyncBanner] = useState(false);
  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem("rocx_orders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // No secure gateway logic anymore

  const handleOrderPlaced = async (newOrder: any) => {
    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    safeSetStorage("rocx_orders", JSON.stringify(nextOrders));

    // Save this order ID into the device-specific order list in localStorage
    try {
      const savedDeviceOrderIds = localStorage.getItem("rocx_device_order_ids");
      let deviceOrderIds: string[] = [];
      if (savedDeviceOrderIds) {
        deviceOrderIds = JSON.parse(savedDeviceOrderIds);
      }
      if (!deviceOrderIds.includes(newOrder.id)) {
        deviceOrderIds.push(newOrder.id);
        safeSetStorage("rocx_device_order_ids", JSON.stringify(deviceOrderIds));
      }
    } catch (e) {
      console.error("Error setting rocx_device_order_ids on checkout:", e);
    }

    try {
      setFirebaseSyncError(null);
      await addOrderToFirestore(newOrder);
    } catch (err: any) {
      console.error("Firestore order saved error:", err);
      const parsedErr =
        err && typeof err === "object"
          ? err.message || String(err)
          : String(err);
      setFirebaseSyncError(parsedErr);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: string,
    estimatedDelivery?: string,
  ) => {
    const nextOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          ...(estimatedDelivery !== undefined ? { estimatedDelivery } : {}),
        };
      }
      return o;
    });
    setOrders(nextOrders);
    safeSetStorage("rocx_orders", JSON.stringify(nextOrders));
    try {
      await updateOrderStatusInFirestore(orderId, status, estimatedDelivery);
    } catch (err) {
      console.error("Firestore order update error:", err);
    }
  };

  const handleUpdateOrderPickup = async (
    orderId: string,
    deliveryAgentPicked: boolean,
  ) => {
    const nextOrders = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, deliveryAgentPicked };
      }
      return o;
    });
    setOrders(nextOrders);
    safeSetStorage("rocx_orders", JSON.stringify(nextOrders));
    try {
      await updateOrderPickupInFirestore(orderId, deliveryAgentPicked);
    } catch (err) {
      console.error("Firestore order pickup update error:", err);
    }
  };

  const handleUpdateOrderOtp = async (orderId: string, deliveryOtp: string) => {
    const nextOrders = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, deliveryOtp };
      }
      return o;
    });
    setOrders(nextOrders);
    safeSetStorage("rocx_orders", JSON.stringify(nextOrders));
    try {
      await updateOrderOtpInFirestore(orderId, deliveryOtp);
    } catch (err) {
      console.error("Firestore order OTP update error:", err);
    }
  };

  const handleAssignOrderRider = async (
    orderId: string,
    assignedRiderId: string,
    assignedRiderName: string,
  ) => {
    const nextOrders = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, assignedRiderId, assignedRiderName };
      }
      return o;
    });
    setOrders(nextOrders);
    safeSetStorage("rocx_orders", JSON.stringify(nextOrders));
    try {
      await assignOrderRiderInFirestore(
        orderId,
        assignedRiderId,
        assignedRiderName,
      );
    } catch (err) {
      console.error("Firestore rider assignment update error:", err);
    }
  };

  const handleUpdateOrderPaymentStatus = async (
    orderId: string,
    paymentStatus: "pending" | "completed",
  ) => {
    const nextOrders = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, paymentStatus };
      }
      return o;
    });
    setOrders(nextOrders);
    safeSetStorage("rocx_orders", JSON.stringify(nextOrders));
    try {
      await updateOrderPaymentStatusInFirestore(orderId, paymentStatus);
    } catch (err) {
      console.error("Firestore order payment update error:", err);
    }
  };

  // Active bottom navigation tab
  const [activeTab, setActiveTab] = useState<string>("home");

  const handleClosePolicy = () => {
    setActivePolicy(null);
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      setSelectedProduct(null);
      setSelectedCategory(null);
      setSearchQuery("");
      setIsCartOpen(false);
      setIsLocationOpen(false);
      setIsProfileOpen(false);
      setIsTrackOpen(false);
      setIsCustomerOpen(false);
      setIsAdminPanelOpen(false);
      setIsDeliveryPanelOpen(false);
      setIsSellerPanelOpen(false);
      setActivePolicy(null);
      window.scrollTo({ top: 0, behavior: "instant" });
      // Reset the URL immediately
      window.history.pushState({ appState: "home" }, "", "/");
    }
  };
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Monitor manual scroll threshold (e.g., scrolled past 35px) to reveal products under the fold
  useEffect(() => {
    const handleScrollReveal = () => {
      if (window.scrollY > 35) {
        setHasInteracted(true);
      }
    };

    window.addEventListener("scroll", handleScrollReveal, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollReveal);
    };
  }, []);

  // --- INITIALIZE HOME STATE ---
  useEffect(() => {
    if (!window.history.state || !window.history.state.appState) {
      window.history.replaceState({ appState: "home" }, "");
    }
  }, []);

  // --- PERSISTENCE & FIRESTORE SYNCHRONIZATION ---
  useEffect(() => {
    // 0. Ensure default catalog and coupons are seeded in background in Firestore
    // ensureDefaultProducts();
    // ensureDefaultCoupons();

    // 1. Load initial cart and city if present
    const savedCart = localStorage.getItem("rocx_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed loading cart session", e);
      }
    }
    const savedLoc = localStorage.getItem("rocx_location");
    if (savedLoc) {
      try {
        setCurrentLocation(JSON.parse(savedLoc));
      } catch (e) {
        console.error("Failed loading location session", e);
      }
    }

    // 2. Setup real-time listener for products catalog
    const unsubscribeProducts = subscribeToProductsFromFirestore((list) => {
      const sanitized = list.map((prod) => {
        if (isBentoCakeProduct(prod)) {
          return { ...prod, price: 299 };
        }
        return prod;
      });

      setProductsCatalog(sanitized);
      safeSetStorage("rocx_products", JSON.stringify(sanitized));
    });

    // 3. Setup real-time listener for orders database
    const unsubscribeOrders = subscribeToOrdersFromFirestore(
      (list) => {
        setOrders(list);
        setFirebaseSyncError(null);
        safeSetStorage("rocx_orders", JSON.stringify(list));
      },
      (error) => {
        setFirebaseSyncError(
          error && typeof error === "object"
            ? error.message || String(error)
            : String(error),
        );
      },
    );

    // 3.5 Setup real-time listener for coupons database
    const unsubscribeCoupons = subscribeToCouponsFromFirestore((list) => {
      setCoupons(list);
    });

    // 3.6 Setup real-time listener for categories database with fallback for initial seed
    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const list: Category[] = [];
        const keys = new Set<string>();
        snapshot.forEach((docSnap) => {
          const docData = docSnap.data() as Category;
          list.push(docData);
          keys.add(docData.id);
        });

        // Auto-merge missing default categories into local state so they are editable in Admin
        // We do NOT call setDoc here automatically, to prevent overwriting user changes if the snapshot is initially empty from cache.
        CATEGORIES.forEach((cat) => {
          if (!keys.has(cat.id)) {
            list.push(cat);
          }
        });

        const sorted = list.sort((a, b) => {
          const orderA =
            a.displayOrder !== undefined && a.displayOrder !== null
              ? Number(a.displayOrder)
              : 999;
          const orderB =
            b.displayOrder !== undefined && b.displayOrder !== null
              ? Number(b.displayOrder)
              : 999;
          return orderA - orderB;
        });
        setCategoriesCatalog(sorted);
        safeSetStorage("rocx_categories", JSON.stringify(sorted));
      },
      (err) => {
        console.warn(
          "Firestore categories load error, utilizing local fallbacks: ",
          err,
        );
        setCategoriesCatalog(CATEGORIES);
      },
    );

    // 3.7 Setup real-time listener for home promo slides carousel
    const unsubscribeSlides = subscribeToSlidesFromFirestore((list) => {
      setSlides(list);
    });

    // 3.8 Setup real-time listener for lookbook gallery pictures
    const unsubscribeGallery = subscribeToGalleryFromFirestore((list) => {
      setGalleryItems(list);
    });

    // 3.9 Setup real-time listener for dynamic store config (About section points, subcategories)
    const unsubscribeStoreConfig = subscribeToStoreConfigFromFirestore(
      (config) => {
        const sanitized = sanitizeStoreConfig(config);
        setStoreConfig(sanitized);
        safeSetStorage("rocx_store_config", JSON.stringify(sanitized));
      },
    );

    // 3.10 Setup real-time listener for dynamic delivery riders (Google / code registered)
    const unsubscribeRiders = subscribeToRidersFromFirestore((list) => {
      setDbRiders(list);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeCoupons();
      unsubscribeCategories();
      unsubscribeSlides();
      unsubscribeGallery();
      unsubscribeStoreConfig();
      unsubscribeRiders();
    };
  }, []);

  useEffect(() => {
    // Listen to Firebase authentication state in real time to sync login identity across reloads
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email) {
          setIsLoggedIn(true);
          setLoginType("google");
          setUserEmail(user.email);
          safeSetStorage("rocx_user_email", user.email);
          if (user.displayName) {
            safeSetStorage("rocx_user_name", user.displayName);
          }
          if (user.photoURL) {
            safeSetStorage("rocx_user_avatar", user.photoURL);
          }
        }
      }
      // Skip the automatic else loop logout so we never trigger forced sign-outs during redeploys/session re-indexing.
    });

    return () => unsubscribeAuth();
  }, []);

  // Save cart changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    safeSetStorage("rocx_cart", JSON.stringify(items));
  };

  
  // Verify PhonePe Live Payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id');
    const orderId = params.get('order_id');
    const isSim = params.get('phonepe_simulation') === 'true';
    
    if (transactionId && orderId && !isSim && !window.location.hash.includes('verified')) {
      fetch('/api/verify-phonepe-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      }).then(res => res.json()).then(data => {
        if (data.success && data.status === 'paid') {
          updateOrderPaymentStatusInFirestore(orderId, 'paid');
          // Clear Cart
          setCartItems([]);
          localStorage.removeItem('rocx_cart');
          alert('Payment Successful! Order ID: ' + orderId);
        } else {
          alert('Payment was not completed. Please try again.');
        }
        window.history.replaceState({}, '', window.location.pathname + '#verified');
      }).catch(err => console.error('Verification error:', err));
    }
  }, []);

// Scroll to top indicator visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Synchronize React state to browser history (pushing states)
  useEffect(() => {
    const isAnySubviewActive = !!(
      selectedCategory ||
      selectedProduct ||
      isCartOpen ||
      isLocationOpen ||
      isProfileOpen ||
      isTrackOpen ||
      isCustomerOpen ||
      isAdminPanelOpen ||
      isDeliveryPanelOpen ||
      isSellerPanelOpen
    );

    const currentHistoryState = window.history.state;

    // Define what the state *should* be in history based on our React state
    let targetState: any = null;

    if (isCartOpen) {
      targetState = {
        appState: "drawer",
        drawer: "cart",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (isLocationOpen) {
      targetState = {
        appState: "drawer",
        drawer: "location",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (isProfileOpen) {
      targetState = {
        appState: "drawer",
        drawer: "profile",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (isTrackOpen) {
      targetState = {
        appState: "drawer",
        drawer: "track",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (isCustomerOpen) {
      targetState = {
        appState: "drawer",
        drawer: "customer",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (isAdminPanelOpen) {
      targetState = {
        appState: "drawer",
        drawer: "admin",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (isDeliveryPanelOpen) {
      targetState = {
        appState: "drawer",
        drawer: "delivery",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (isSellerPanelOpen) {
      targetState = {
        appState: "drawer",
        drawer: "seller",
        categoryId: selectedCategory,
        productId: selectedProduct?.id,
      };
    } else if (selectedProduct) {
      targetState = {
        appState: "product",
        productId: selectedProduct.id,
        categoryId: selectedCategory,
      };
    } else if (selectedCategory) {
      targetState = { appState: "category", categoryId: selectedCategory };
    } else {
      targetState = { appState: "home" };
    }

    const constructUrl = (state: any) => {
      const url = new URL(window.location.href);
      if (state.categoryId) url.searchParams.set("category", state.categoryId);
      else url.searchParams.delete("category");

      if (state.productId) url.searchParams.set("product", state.productId);
      else url.searchParams.delete("product");

      if (state.drawer) url.hash = state.drawer;
      else url.hash = "";

      return url.toString();
    };

    // Now, let's compare with currentHistoryState to avoid redundant pushes
    if (!currentHistoryState) {
      if (targetState.appState !== "home") {
        window.history.pushState(targetState, "", constructUrl(targetState));
      } else {
        window.history.replaceState(targetState, "", constructUrl(targetState));
      }
    } else {
      const stateMatch =
        currentHistoryState.appState === targetState.appState &&
        currentHistoryState.categoryId === targetState.categoryId &&
        currentHistoryState.productId === targetState.productId &&
        currentHistoryState.drawer === targetState.drawer;

      if (!stateMatch) {
        // Find depths to decide push vs back
        const getDepth = (state: any) => {
          if (!state || state.appState === "home") return 0;
          if (state.appState === "category") return 1;
          if (state.appState === "product") return 2;
          if (state.appState === "drawer") return 3;
          return 0;
        };

        const currentDepth = getDepth(currentHistoryState);
        const targetDepth = getDepth(targetState);

        if (targetDepth < currentDepth) {
          // Going back on state change
          window.history.back();
        } else {
          // Opening a deeper view
          window.history.pushState(targetState, "", constructUrl(targetState));
        }
      }
    }
  }, [
    selectedCategory,
    selectedProduct,
    isCartOpen,
    isLocationOpen,
    isProfileOpen,
    isTrackOpen,
    isCustomerOpen,
    isAdminPanelOpen,
    isDeliveryPanelOpen,
    isSellerPanelOpen,
  ]);

  // Instantly teleport to top when category or product is selected (simulates next-page load)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedCategory, selectedProduct]);

  // Intercept browser back button action to return cleanly to previous views
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Safety locked-run override: if delivery run is locked, block returning to other views
      if (localStorage.getItem("rocx_delivery_picked_order_id")) {
        setIsDeliveryPanelOpen(true);
        window.history.pushState(
          { appState: "drawer", drawer: "delivery" },
          "",
        );
        return;
      }

      const state = event.state;
      if (state) {
        if (state.appState === "product") {
          setSelectedCategory(state.categoryId);
          const found = productsCatalog.find((p) => p.id === state.productId);
          if (found) {
            setSelectedProduct(found);
          }
          // Close other drawers
          setIsCartOpen(false);
          setIsLocationOpen(false);
          setIsProfileOpen(false);
          setIsTrackOpen(false);
          setIsCustomerOpen(false);
          setIsAdminPanelOpen(false);
          setIsDeliveryPanelOpen(false);
          setIsSellerPanelOpen(false);
        } else if (state.appState === "category") {
          setSelectedCategory(state.categoryId);
          setSelectedProduct(null);
          // Close other drawers
          setIsCartOpen(false);
          setIsLocationOpen(false);
          setIsProfileOpen(false);
          setIsTrackOpen(false);
          setIsCustomerOpen(false);
          setIsAdminPanelOpen(false);
          setIsDeliveryPanelOpen(false);
          setIsSellerPanelOpen(false);
        } else if (state.appState === "drawer") {
          setSelectedCategory(state.categoryId || null);
          const found = state.productId
            ? productsCatalog.find((p) => p.id === state.productId)
            : null;
          setSelectedProduct(found);
          setIsCartOpen(state.drawer === "cart");
          setIsLocationOpen(state.drawer === "location");
          setIsProfileOpen(state.drawer === "profile");
          setIsTrackOpen(state.drawer === "track");
          setIsCustomerOpen(state.drawer === "customer");
          setIsAdminPanelOpen(state.drawer === "admin");
          setIsDeliveryPanelOpen(state.drawer === "delivery");
          setIsSellerPanelOpen(state.drawer === "seller");
        } else {
          // Home state or other
          setSelectedCategory(null);
          setSelectedProduct(null);
          setIsCartOpen(false);
          setIsLocationOpen(false);
          setIsProfileOpen(false);
          setIsTrackOpen(false);
          setIsCustomerOpen(false);
          setIsAdminPanelOpen(false);
          setIsDeliveryPanelOpen(false);
          setIsSellerPanelOpen(false);
        }
      } else {
        // Fallback when state is null (initial load/home)
        setSelectedCategory(null);
        setSelectedProduct(null);
        setIsCartOpen(false);
        setIsLocationOpen(false);
        setIsProfileOpen(false);
        setIsTrackOpen(false);
        setIsCustomerOpen(false);
        setIsAdminPanelOpen(false);
        setIsDeliveryPanelOpen(false);
        setIsSellerPanelOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [productsCatalog]);

  // --- VISIBLE PRODUCTS CATALOG ---
  const visibleProductsCatalog = useMemo(() => {
    const hiddenCategoryIds = new Set(
      categoriesCatalog
        .filter((cat) => cat.isVisible === false || cat.hidden === true)
        .map((cat) => cat.id)
    );
    return productsCatalog.filter((prod) => {
      if (hiddenCategoryIds.has(prod.category)) return false;
      if (prod.categories && prod.categories.some(c => hiddenCategoryIds.has(c))) return false;
      return true;
    });
  }, [productsCatalog, categoriesCatalog]);

  // --- FILTERED PRODUCTS ---
  const filteredProducts = useMemo(() => {
    let list = visibleProductsCatalog.filter((prod) => {
      // Exclude add-ons / no category products from main product grids
      if (!prod.category || prod.category === "accessories") {
        return false;
      }

      // 1. Category Filter
      if (selectedCategory) {
        let belongsToCat = false;
        if (selectedCategory === "two_hours_delivery") {
          belongsToCat = !!prod.isTwoHourDelivery;
        } else if (
          prod.category === selectedCategory ||
          (prod.categories && prod.categories.includes(selectedCategory))
        ) {
          // Direct category or secondary category match has priority (manually set in Admin Panel)
          belongsToCat = true;
        } else if (selectedCategory === "photo_cake") {
          // Fallback matching logic for sub-categories
          const matched =
            prod.id.toLowerCase().includes("photo") ||
            prod.name.toLowerCase().includes("photo") ||
            !!prod.options?.hasPhotoUpload;
          belongsToCat = matched && prod.category === "cakes";
        } else if (selectedCategory === "bento_cake") {
          const matched =
            prod.id.toLowerCase().includes("bento") ||
            prod.name.toLowerCase().includes("bento") ||
            prod.id.toLowerCase().includes("strawberry") ||
            prod.id.toLowerCase().includes("butterscotch");
          belongsToCat = matched && prod.category === "cakes";
        } else if (selectedCategory === "pinata_cake") {
          const matched =
            prod.id.toLowerCase().includes("pinata") ||
            prod.name.toLowerCase().includes("pinata") ||
            prod.id.toLowerCase().includes("ganache") ||
            prod.id.toLowerCase().includes("golden");
          belongsToCat = matched && prod.category === "cakes";
        } else if (selectedCategory === "kids_cake") {
          const matched =
            prod.id.toLowerCase().includes("kids") ||
            prod.name.toLowerCase().includes("kids") ||
            prod.name.toLowerCase().includes("rainbow") ||
            prod.id.toLowerCase().includes("forest") ||
            prod.id.toLowerCase().includes("velvet");
          belongsToCat = matched && prod.category === "cakes";
        } else if (selectedCategory === "flower_combos") {
          // Combos Sub-categories matchers
          belongsToCat =
            prod.category === "combos" &&
            (prod.name.toLowerCase().includes("flower") ||
              prod.name.toLowerCase().includes("rose") ||
              prod.id.toLowerCase().includes("rose"));
        } else if (selectedCategory === "cake_combos") {
          belongsToCat =
            prod.category === "combos" &&
            (prod.name.toLowerCase().includes("cake") ||
              prod.id.toLowerCase().includes("cake"));
        } else if (selectedCategory === "chocolate_flower") {
          belongsToCat =
            prod.category === "chocolates" ||
            prod.category === "flowers" ||
            prod.id.includes("choc") ||
            prod.id.includes("flower");
        } else if (selectedCategory === "personalised_combos") {
          belongsToCat =
            prod.category === "personalized_gifts" ||
            prod.category === "combos" ||
            !!prod.options?.hasPhotoUpload;
        } else if (
          ["special_chocolate", "sweets", "dryfruits", "diya_candle"].includes(
            selectedCategory,
          )
        ) {
          belongsToCat =
            prod.category === "dewali" &&
            (prod.categories?.includes(selectedCategory) ||
              prod.name.toLowerCase().includes(selectedCategory.split("_")[0]));
        } else if (
          [
            "rakhi_dryfruits",
            "bhai_vhabi_rakhi",
            "rakhi_sweets",
            "rakhi_chocolate",
          ].includes(selectedCategory)
        ) {
          belongsToCat =
            prod.category === "rakhi" &&
            (prod.categories?.includes(selectedCategory) ||
              prod.name.toLowerCase().includes(selectedCategory.split("_")[0]));
        } else if (
          ["water_colour", "oil_painting", "sketch", "acrylic"].includes(
            selectedCategory,
          )
        ) {
          belongsToCat =
            prod.category === "photo_to_art" &&
            (prod.categories?.includes(selectedCategory) ||
              prod.name.toLowerCase().includes(selectedCategory.split("_")[0]));
        } else if (
          ["key_ring", "jewellery", "clay_art", "resin_art"].includes(
            selectedCategory,
          )
        ) {
          belongsToCat =
            prod.category === "hand_crafts" &&
            (prod.categories?.includes(selectedCategory) ||
              prod.name.toLowerCase().includes(selectedCategory.split("_")[0]));
        }

        if (!belongsToCat) return false;
      }

      // 2. Search Text Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          prod.name.toLowerCase().includes(query) ||
          prod.description.toLowerCase().includes(query) ||
          prod.category.toLowerCase().includes(query) ||
          (prod.features &&
            prod.features.some((f) => f.toLowerCase().includes(query)))
        );
      }

      return true;
    });

    if (!searchQuery.trim()) {
      list.sort((a, b) => {
        if (!appRandomOrderMap.has(a.id)) appRandomOrderMap.set(a.id, Math.random());
        if (!appRandomOrderMap.has(b.id)) appRandomOrderMap.set(b.id, Math.random());
        return appRandomOrderMap.get(a.id)! - appRandomOrderMap.get(b.id)!;
      });
    }
    return list;
  }, [selectedCategory, searchQuery, productsCatalog, appRandomOrderMap]);

  const selectedCategoryName = useMemo(() => {
    if (searchQuery.trim()) return `Search Results for "${searchQuery}"`;
    if (!selectedCategory) return "⚡ Premium Best Sellers";
    if (selectedCategory === "two_hours_delivery")
      return "🚀 2 Hours Delivery Collection";
    const cat = categoriesCatalog.find((c) => c.id === selectedCategory);
    if (cat) return `${cat.name} Collection`;

    // Sub-categories fallback names
    const subNames: Record<string, string> = {
      photo_cake: "Photo Cakes",
      bento_cake: "Bento Cakes",
      pinata_cake: "Pinata Cakes",
      kids_cake: "Kids Cakes",
      flower_combos: "Flower Combos",
      cake_combos: "Cake Combos",
      chocolate_flower: "Chocolate & Flower Combos",
      personalised_combos: "Personalised Combos",
      special_chocolate: "Special Chocolate",
      sweets: "Sweets",
      dryfruits: "Dry Fruits",
      diya_candle: "Diya & Candles",
      rakhi_dryfruits: "Rakhi & Dryfruits",
      bhai_vhabi_rakhi: "Bhai & Vhabi Rakhi",
      rakhi_sweets: "Rakhi With Sweets",
      rakhi_chocolate: "Rakhi With Chocolate",
      water_colour: "Water Colour",
      oil_painting: "Oil Painting",
      sketch: "Sketch",
      acrylic: "Acrylic",
      key_ring: "Key Ring",
      jewellery: "Jewellery",
      clay_art: "Clay Art",
      resin_art: "Resin Art",
    };

    const allConfiguredSubs = [
      ...(storeConfig?.cakeSubcategories || []),
      ...(storeConfig?.giftSubcategories || []),
      ...(storeConfig?.dewaliSubcategories || []),
      ...(storeConfig?.rakhiSubcategories || []),
      ...(storeConfig?.photoToArtSubcategories || []),
      ...(storeConfig?.handCraftSubcategories || []),
    ];
    allConfiguredSubs.forEach((sub) => {
      if (sub && sub.id && sub.name) {
        subNames[sub.id] = sub.name;
      }
    });

    return subNames[selectedCategory]
      ? `${subNames[selectedCategory]} Collection`
      : "Collection";
  }, [selectedCategory, searchQuery, categoriesCatalog, storeConfig]);

  // --- HANDLERS ---
  const handleAddToCart = (newCartItem: CartItem) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.id === newCartItem.id,
    );
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += newCartItem.quantity;
      saveCart(updated);
    } else {
      saveCart([...cartItems, newCartItem]);
    }
    // Automatically trigger cart pullout for prompt visual feedback delight
    setIsCartOpen(true);
    return true;
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    saveCart(updated);
  };

  const handleUpdateItemCustomization = (
    id: string,
    field: "uploadedPhotoUrl" | "customName",
    value: string,
  ) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handleSelectLocation = (loc: Location) => {
    setCurrentLocation(loc);
    safeSetStorage("rocx_location", JSON.stringify(loc));
  };

  const handleSelectCategoryFromGrid = (catId: CategoryID | null, source: 'top' | 'grid' | 'nav' = 'grid') => {
    setHasInteracted(true);
    setCategorySource(source);
    
    setSelectedCategory(catId);
    setSearchQuery(""); // reset search to prioritize category browsing
    setSelectedProduct(null); // Return to home grid when category is clicked
    
    // Teleport direct to front screen top for clean next page transition
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Aggregate quantity for header bubble badge
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // --- PHONEPE CLIENT-SIDE SANDBOX SIMULATOR INTERACTION VIEW ---
  const urlParams = new URL(window.location.href).searchParams;
  const isPhonePeSimulation = urlParams.get("phonepe_simulation") === "true";
  if (isPhonePeSimulation) {
    const simOrderId = urlParams.get("order_id") || "ROCX-DEMO";
    const simAmount = urlParams.get("amount") || "1349";
    const simTransactionId = urlParams.get("transaction_id") || "TXMOCK99999ST";

    const handleSimulateSuccess = () => {
      // Clear address details from pending redirect loopback
      const targetUrl = `${window.location.origin}${window.location.pathname}?order_id=${simOrderId}&transaction_id=${simTransactionId}`;
      window.location.href = targetUrl;
    };

    const handleSimulateCancel = () => {
      const targetUrl = `${window.location.origin}${window.location.pathname}?order_id=${simOrderId}&phonepe_failed=true`;
      window.location.href = targetUrl;
    };

    return (
      <div className="min-h-screen bg-[#f3f4f6] text-[#333333] flex flex-col justify-between font-sans selection:bg-[#5f259f]/10 selection:text-[#5f259f]">
        {/* Header */}
        <header className="bg-[#5f259f] text-white py-4 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter">
              Phone<span className="text-[#00c853]">Pe</span>
            </span>
            <span className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-mono">
              Sandbox Simulator
            </span>
          </div>
          <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider font-mono">
            Demo Server Connection: Safe & Local
          </div>
        </header>

        {/* Content */}
        <main className="max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/50">
            {/* Top Brand Slid */}
            <div className="bg-[#5f259f]/5 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[8.5px] text-[#5f259f] uppercase font-black tracking-widest block font-mono">
                  MERCHANT / RECEIVER
                </span>
                <h2 className="text-sm font-black text-[#1e1e1e] uppercase tracking-wide">
                  ROCX CAKES & GIFTS DEPT
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-wider block font-mono">
                  PAYMENT DUE
                </span>
                <div className="text-xl font-black text-[#5f259f] font-mono">
                  ₹{simAmount}
                </div>
              </div>
            </div>

            {/* Simulated Session parameters block */}
            <div className="p-6 space-y-5">
              <div className="bg-slate-55/65 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left space-y-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                  Handshake Attributes
                </h3>
                <div className="grid grid-cols-2 gap-y-1 text-[11px] leading-relaxed">
                  <span className="text-slate-500 font-bold">Order ID:</span>
                  <strong className="text-slate-800 font-mono text-right font-semibold">
                    {simOrderId}
                  </strong>

                  <span className="text-slate-500 font-bold">
                    Transaction Code:
                  </span>
                  <strong className="text-slate-800 font-mono text-right text-[10px] font-semibold text-ellipsis overflow-hidden">
                    {simTransactionId}
                  </strong>

                  <span className="text-slate-500 font-bold">
                    Host / Environment:
                  </span>
                  <strong className="text-[#5f259f] text-right font-black uppercase font-mono tracking-wide text-[9px]">
                    NETLIFY SERVERLESS
                  </strong>
                </div>
              </div>

              {/* Simulation instructions */}
              <div className="text-center space-y-2 py-2">
                <p className="text-[11.5px] text-slate-505 text-slate-600 font-semibold leading-relaxed font-sans">
                  This secure gateway is simulated client-side to allow offline
                  testing on live static hosts like Netlify or Vercel. Select an
                  outcome below to test the full purchase pipeline.
                </p>
                <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest font-mono">
                  🍰 Simulated Order will write directly to Firestore!
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSimulateSuccess}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🟢 Simulate Successful Payment (₹{simAmount})
                </button>

                <button
                  type="button"
                  onClick={handleSimulateCancel}
                  className="w-full py-3.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 font-black text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🔴 Simulate Failed / Aborted Payment
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>🛡️ Secure PhonePe SSL Session</span>
              <span>100% Client-Side Sandbox</span>
            </div>
          </div>
        </main>

        {/* Outer footer */}
        <footer className="py-4 text-center text-[10px] text-slate-400 font-medium font-mono">
          Powered by ROCX Cakes Offline Sandbox Service Layer API.
        </footer>
      </div>
    );
  }

  if (isSellerPanelOpen) {
    return (
      <SellerPanel
        isOpen={isSellerPanelOpen}
        onClose={() => {
          setIsSellerPanelOpen(false);
          if (window.location.hash === "#seller") {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-24 selection:bg-pink-100 selection:text-pink-800">
      <Helmet>
        <title>
          {selectedProduct ? `${selectedProduct.name} | Rocx Cakes & Gifts` : (selectedCategoryName && selectedCategoryName !== "⚡ Premium Best Sellers" ? `${selectedCategoryName} | Rocx Cakes & Gifts` : "Rocx Cakes & Gifts | Premium Customized Cakes and Gifts in Kharagpur & Midnapore")}
        </title>
        <meta property="og:title" content={selectedProduct ? `${selectedProduct.name} | Rocx Cakes & Gifts` : "Rocx Cakes & Gifts"} />
        <meta
          property="og:description"
          content={selectedProduct ? selectedProduct.description : "Best cake shop in Kharagpur & Midnapore. Order premium customized fondant cakes, fresh flower bouquets, personalized bento cakes, photo cakes, and gift combos online."}
        />
        <meta
          property="og:image"
          content={selectedProduct?.image || "https://rocxcakes.in/logo.png"}
        />
        <meta
          property="twitter:image"
          content={selectedProduct?.image || "https://rocxcakes.in/logo.png"}
        />
      </Helmet>
      <h1 className="sr-only">
        Rocx Cakes & Gifts - Best cake shop in Kharagpur & Midnapore. Order
        premium customized fondant cakes, fresh flower bouquets, personalized
        bento cakes, photo cakes, and gift combos online. Same day cake delivery
        near IIT Kharagpur.
      </h1>

      {/* HEADER SECTION (Sticky Search, Location, Cart logo) */}
      <Header
        location={currentLocation}
        onOpenLocation={() => setIsLocationOpen(true)}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) {
            // Scroll to catalog when user types in search
            const el = document.getElementById("product-catalog-anchor");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        wishlistCount={wishlistProductIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onGoHome={() => handleTabChange("home")}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {firebaseSyncError && !dismissSyncBanner && (
        <div className="bg-rose-50 border-b border-rose-200 text-slate-800 px-4 py-3.5 sm:px-6 relative shadow-sm z-40 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div className="text-left">
                <span className="font-black text-rose-700 uppercase tracking-wider text-[10px] bg-rose-100 px-2 py-0.5 rounded-full inline-block mb-1">
                  Firebase Sync Error Detected!
                </span>
                <h4 className="font-black text-[#1e1e1e] text-sm leading-snug">
                  Mobile standard order updates sync fail hoyeche direct custom
                  rules constraint optimization-e!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Bhai details track koro, database sync blocked. Database empty
                  error checking details check koro. Nicher actual response
                  visual system code report koreche:
                </p>
                <div className="bg-slate-950 text-rose-300 p-2.5 rounded-lg border border-rose-500/10 font-mono text-[10px] mt-2 overflow-x-auto select-all max-h-[120px]">
                  {firebaseSyncError}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  💡 <strong>Keno sync hocche na r kivabe thik korbe:</strong>
                  <br />
                  1. Project database created, kintu standard security rules
                  active hoye check validation query execute korte deyni.
                  <br />
                  2. Google <strong>Firebase Console</strong> checking portal
                  search korun, click set match on{" "}
                  <strong>Firestore Database</strong>.
                  <br />
                  3. **"Rules"** tab select korun r set rule matching test mode
                  config edit template update syntax:
                  <code className="text-pink-600 font-mono mx-1">
                    allow read, write: if true;
                  </code>{" "}
                  layout compile koro r top-e click <strong>"Publish"</strong>{" "}
                  screen settings.
                </div>
              </div>
            </div>
            <div className="flex md:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
              <button
                onClick={() => setDismissSyncBanner(true)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-bold text-slate-600 shadow-sm text-center cursor-pointer w-full whitespace-nowrap"
              >
                Dismiss Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP CATEGORY INSTANT SCROLL BAR MATCHING SCREENSHOT */}
      {!activePolicy && (
        <TopCategoryBar
          categories={visibleCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => handleSelectCategoryFromGrid(id, 'top')}
        />
      )}

      {/* MAIN CONTENT BLOCK: CONDITIONAL RENDER PRODUCT DETAIL PAGE, SEPARATE CATEGORY DETAIL PAGE, OR HOME FEED */}
      {activePolicy === 'terms' ? (
        <TermsAndConditions onBack={handleClosePolicy} />
      ) : activePolicy === 'privacy' ? (
        <PrivacyPolicy onBack={handleClosePolicy} />
      ) : activePolicy === 'shipping' ? (
        <ShippingPolicy onBack={handleClosePolicy} />
      ) : activePolicy === 'return' ? (
        <ReturnPolicy onBack={handleClosePolicy} />
      ) : activePolicy === 'refund' ? (
        <RefundPolicy onBack={handleClosePolicy} />
      ) : selectedProduct ? (
        <ProductDetailPage
          product={selectedProduct}
          allProducts={productsCatalog}
          storeConfig={storeConfig}
          onBack={() => {
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCart}
          wishlistIds={wishlistProductIds}
          onToggleWishlist={toggleWishlist}
          onBuyNow={(item) => {
            const added = handleAddToCart(item);
            if (added) {
              setIsCartOpen(true);
            }
          }}
          onSelectProduct={setSelectedProduct}
        />
      ) : selectedCategory ? (
        <CategoryDetailPage
          categoryId={selectedCategory}
          isRichLayout={categorySource === 'top'}
          categoryName={
            categoriesCatalog.find((c) => c.id === selectedCategory)?.name ||
            {
              two_hours_delivery: "2 Hours Express Delivery",
              photo_cake: "Photo Cakes",
              bento_cake: "Bento Cakes",
              pinata_cake: "Pinata Cakes",
              kids_cake: "Kids Cakes",
              flower_combos: "Flower Combos",
              cake_combos: "Cake Combos",
              chocolate_flower: "Chocolate & Florals",
              personalised_combos: "Personalised Gift Combos",
              special_chocolate: "Special Chocolate",
              sweets: "Sweets",
              dryfruits: "Dry Fruits",
              diya_candle: "Diya & Candles",
              rakhi_dryfruits: "Rakhi & Dryfruits",
              bhai_vhabi_rakhi: "Bhai & Vhabi Rakhi",
              rakhi_sweets: "Rakhi With Sweets",
              rakhi_chocolate: "Rakhi With Chocolate",
              water_colour: "Water Colour",
              oil_painting: "Oil Painting",
              sketch: "Sketch",
              acrylic: "Acrylic",
              key_ring: "Key Ring",
              jewellery: "Jewellery",
              clay_art: "Clay Art",
              resin_art: "Resin Art",
            }[selectedCategory] ||
            "Premium Catalog Selection"
          }
          categoryImage={
            categoriesCatalog.find((c) => c.id === selectedCategory)?.image
          }
          products={visibleProductsCatalog}
          storeConfig={storeConfig}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onBack={() => {
            setSelectedCategory(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSelectProduct={setSelectedProduct}
        />
      ) : activeTab === 'categories' ? (
        <div className="w-full bg-slate-50 min-h-[60vh]">
          <CategoryExplorePage
            categories={visibleCategories}
            storeConfig={storeConfig}
            products={productsCatalog}
            onSelectCategory={handleSelectCategoryFromGrid}
            onSelectProduct={setSelectedProduct}
          />
        </div>
      ) : (
        <>
          {/* COMPACT CAKE TYPEWRITER SLIDER ROTATING CAROUSEL BANNER */}
          <CakeTypewriterSlider slides={slides} />

          {/* BENTO 8-GRID EXPLORER PORTALS LINKED TO THE SCREENSHOT */}
          <div id="category-grid-anchor">
            <CategoryGrid
              categories={visibleCategories}
              onSelectCategory={handleSelectCategoryFromGrid}
            />
          </div>

          {/* PRODUCT LISTINGS */}
          <div className="w-full">
            {/* PRODUCT LISTINGS SCENE GRID BAR WITH CATEGORY NAV TABS */}
            <div id="product-catalog-anchor" className="scroll-mt-24 font-sans">
              <CategoryNav
                categories={visibleCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => {
                  setCategorySource('nav');
                  setSelectedCategory(id);
                  setSearchQuery("");
                }}
              />
              <ProductList
                products={filteredProducts}
                onSelectProduct={setSelectedProduct}
                selectedCategoryName={selectedCategoryName}
                storeConfig={storeConfig}
                wishlistIds={wishlistProductIds}
                onToggleWishlist={toggleWishlist}
                onSelectCategory={(id) => {
                  setCategorySource('nav');
                  setSelectedCategory(id);
                  setSearchQuery("");
                  // Smooth scroll to product catalog anchor
                  const anchor = document.getElementById(
                    "product-catalog-anchor",
                  );
                  if (anchor) {
                    anchor.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              />
            </div>

            {/* MID-BANNER TRUST BULLETS */}
            <section className="bg-white border-y border-slate-100 py-6 mb-8 mt-6 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-1 p-2 border-r border-slate-100 last:border-0">
                  <span className="text-xl animate-bounce">🎂</span>
                  <h5 className="font-extrabold text-slate-800 text-xs text-center">
                    Freshly Baked
                  </h5>
                  <p className="text-[10px] text-slate-400 text-center">
                    Prepared fresh post-order
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 border-r border-slate-100 last:border-0">
                  <span className="text-xl animate-pulse">📍</span>
                  <h5 className="font-extrabold text-slate-800 text-xs text-center">
                    All India Delivery
                  </h5>
                  <p className="text-[10px] text-slate-400 text-center">
                    Delivered anywhere
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 border-r border-slate-100 last:border-0">
                  <span className="text-xl rotate-12">✨</span>
                  <h5 className="font-extrabold text-slate-800 text-xs text-center">
                    100% Curated
                  </h5>
                  <p className="text-[10px] text-slate-400 text-center">
                    Handpicked premium floristry
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 last:border-0">
                  <span className="text-xl animate-spin-slow">🌙</span>
                  <h5 className="font-extrabold text-slate-800 text-xs text-center">
                    Midnight Joy
                  </h5>
                  <p className="text-[10px] text-slate-400 text-center">
                    Surprise right at 12:00 AM
                  </p>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

      {/* --- DRAWERS AND DIALOGS OVERLAY SYSTEMS --- */}

      {/* Checking out drawer items list */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateItemCustomization={handleUpdateItemCustomization}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        deliveryCity={currentLocation.city}
        deliveryPincode={currentLocation.pincode}
        onOrderPlaced={handleOrderPlaced}
        isLoggedIn={isLoggedIn}
        onOpenProfile={() => setIsProfileOpen(true)}
        coupons={coupons}
        onAddToCart={handleAddToCart}
        categories={categoriesCatalog}
        products={visibleProductsCatalog}
        onTrackOrder={(orderId) => {
          setSelectedTrackOrderId(orderId);
          setIsTrackOpen(true);
        }}
        storeConfig={storeConfig}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        products={visibleProductsCatalog}
        wishlistIds={wishlistProductIds}
        onRemove={toggleWishlist}
        onSelect={(p) => {
          setSelectedProduct(p);
          setIsWishlistOpen(false);
        }}
      />

      {/* Delivering Location Pincodes update drawer */}
      <LocationDrawer
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />

      {/* User profile drawer with interactive Google / SMS login */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        userEmail={userEmail}
        userPhone={userPhone}
        loginType={loginType}
        orders={orders}
        onTrackOrder={(orderId) => {
          setSelectedTrackOrderId(orderId);
          setIsProfileOpen(false);
          setIsTrackOpen(true);
        }}
      />

      {/* Website Footer element with absolute contact details & admin login switch */}
      <Footer storeConfig={storeConfig} />

      {/* Tracking order progress bar meters checking dynamic orders */}
      <TrackOrderDrawer
        isOpen={isTrackOpen}
        onClose={() => {
          setIsTrackOpen(false);
          setSelectedTrackOrderId("");
        }}
        allOrders={orders}
        initialOrderId={selectedTrackOrderId}
      />

      {/* Customer care support helplines desk */}
      <CustomerCareDrawer
        isOpen={isCustomerOpen}
        onClose={() => setIsCustomerOpen(false)}
      />

      {/* ENTERPRISE COMMERCE CONTROL ROOM ADMIN PANEL */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          if (window.location.hash === "#admin") {
            history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
          }
        }}
        firebaseSyncError={firebaseSyncError}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderPaymentStatus={handleUpdateOrderPaymentStatus}
        onAssignRider={handleAssignOrderRider}
        riders={allRiders}
        products={productsCatalog}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateProduct={handleUpdateProduct}
        storeConfig={storeConfig}
        onUpdateStoreConfig={handleUpdateStoreConfig}
        onRestoreProducts={async () => {
          const { restoreDefaultProducts } =
            await import("./services/dbService");
          await restoreDefaultProducts();
        }}
        coupons={coupons}
        onAddCoupon={handleAddCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        onUpdateCoupon={handleUpdateCoupon}
        categories={sortedCategoriesCatalog}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onUpdateCategory={handleUpdateCategory}
        slides={slides}
        onUpdateSlide={handleUpdateSlide}
        onDeleteSlide={handleDeleteSlide}
        galleryItems={galleryItems}
        onAddGalleryItem={handleAddGalleryItem}
        onDeleteGalleryItem={handleDeleteGalleryItem}
        onDeleteRider={handleDeleteRider}
      />

      {/* DETAILED DELIVERY INSTANT CONTROL OVERLAY */}
      <DeliveryPanel
        isOpen={isDeliveryPanelOpen}
        onClose={() => {
          setIsDeliveryPanelOpen(false);
          if (window.location.hash === "#delivery") {
            history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search,
            );
          }
        }}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrderPickup={handleUpdateOrderPickup}
        onUpdateOrderOtp={handleUpdateOrderOtp}
        riders={allRiders}
      />

      {/* --- FLOATING CONTROLS --- */}
      {/* Scroll to Top button float */}
      {showScrollTop && (
        <button
          id="scroll-to-top-float-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-30 bg-slate-900 border border-slate-800 hover:bg-pink-600 hover:border-pink-500 text-white p-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar Menu */}
      <SidebarMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleTabChange}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenCustomer={() => setIsCustomerOpen(true)}
        onSelectCategory={(id) => {
          setCategorySource('nav');
          setSelectedCategory(id);
          setSearchQuery("");
          setActiveTab("home");
          setSelectedProduct(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* --- STICKY FOOTER NAVIGATION HOTBAR FROM THE SCREENSHOT --- */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenCustomer={() => setIsCustomerOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
    </div>
  );
}
export { App };
