export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  categories?: string[]; // Optional extra categories for multi-category support
  image: string;
  images?: string[]; // Array of additional images for the product gallery
  description: string;
  aboutProduct?: string;
  deliveryCare?: string;
  rating: number;
  reviewsCount: number;
  isPersonalisedBestSeller?: boolean;
  personalisedBestSellerOrder?: number;
  isTwoHourDelivery?: boolean; // Marks product for the new 2 Hours Delivery section
  deliveryFee?: number; // Custom delivery fee
  features?: string[];
  options?: {
    hasWeightOptions?: boolean; // For Cakes: 0.5kg, 1kg, 2kg
    hasEgglessOption?: boolean; // For Cakes
    hasPotOptions?: boolean; // For Plants: Mint, Grey, Terracotta
    hasMessageOption?: boolean; // For Flowers/Gifts
    hasPhotoUpload?: boolean; // For Personalized
    hasNameCustomization?: boolean;
    hasGiftCustomization?: boolean;
  };
  weightPrices?: {
    [weight: string]: number;
  };
  allowedWeights?: string[]; // E.g. ["0.5 Kg", "1.0 Kg"]
  addonProductIds?: string[]; // IDs of specific coupons or accessory items to recommend
  adminNote?: string; // Admin delivery note displayed in product catalog and checkout
}

export interface CartItem {
  id: string; // unique ID representing this specific configurations
  product: Product;
  quantity: number;
  selectedWeight?: string; // e.g. "0.5 Kg", "1.0 Kg", "2.0 Kg"
  isEggless?: boolean;
  selectedPot?: string; // e.g. "Mint Ceramic", "Classic Clay", "Eco Pulp"
  customMessage?: string;
  uploadedPhotoUrl?: string; // Simulated photo upload
  customName?: string;
  deliveryType: "standard" | "express" | "midnight";
}

export type CategoryID = string;

export interface Category {
  id: CategoryID;
  name: string;
  image: string;
  count?: number;
  displayOrder?: number; // Higher value or smaller value determines sorting
  isVisible?: boolean; // Active or hidden toggle
  hidden?: boolean; // Explicit hidden flag
  showInGrid?: boolean; // Show in 8-items main grid
  addonProductIds?: string[]; // Accessories IDs recommended for this category
}

export interface Location {
  city: string;
  pincode: string;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount?: number;
  description?: string;
  isActive: boolean;
  showInCart?: boolean; // Control whether coupon is displayed in cart popup list
}

export function isBentoCakeProduct(product: Product): boolean {
  if (!product) return false;
  const name = (product.name || "").toLowerCase();
  const id = (product.id || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();
  const cats = (product.categories || []).map((c) => c.toLowerCase());
  return (
    cat === "bento_cake" ||
    cats.includes("bento_cake") ||
    id.includes("bento") ||
    name.includes("bento")
  );
}

export function sortWeights(weights: string[]): string[] {
  return [...weights].sort((a, b) => {
    const numA = parseFloat(a.replace(/[^\d.]/g, "")) || 0;
    const numB = parseFloat(b.replace(/[^\d.]/g, "")) || 0;
    return numA - numB;
  });
}

export function getStartingWeight(product: Product): string {
  if (product.allowedWeights && product.allowedWeights.length > 0) {
    return sortWeights(product.allowedWeights)[0];
  }
  if (isBentoCakeProduct(product)) return "250g";
  if (
    product.id.includes("photo") ||
    product.name.toLowerCase().includes("photo")
  )
    return "0.5 Kg";

  if (product.weightPrices) {
    const keys = Object.keys(product.weightPrices);
    if (keys.length > 0) return sortWeights(keys)[0];
  }

  return "0.5 Kg";
}

export function getWeightPrice(product: Product, weight: string): number {
  if (isBentoCakeProduct(product)) {
    return 299;
  }
  if (product.weightPrices && product.weightPrices[weight] !== undefined) {
    return product.weightPrices[weight];
  }
  const basePrice = product.price;
  if (weight === "0.5 Kg") return basePrice - 150;
  if (weight === "1.0 Kg") return basePrice;
  if (weight === "1.5 Kg") return basePrice + 250;
  if (weight === "2.0 Kg") return basePrice + 500;
  if (weight === "2.5 Kg") return basePrice + 750;
  if (weight === "3.0 Kg") return basePrice + 1000;
  return basePrice;
}

export function getEgglessOffset(weight: string, product?: Product): number {
  if (product && isBentoCakeProduct(product)) {
    return 51; // 299 + 51 = 350
  }

  const w = weight.toLowerCase().trim();
  let kg = 1;

  if (w.includes("kg")) {
    kg = parseFloat(w.replace("kg", "").trim()) || 1;
  } else if (w.includes("g")) {
    // grams
    kg = (parseFloat(w.replace("g", "").trim()) || 1000) / 1000;
  } else if (w.includes("pound") || w.includes("lb")) {
    const lb = parseFloat(w.replace(/pound|lbs|lb/g, "").trim()) || 2;
    kg = lb * 0.5;
  } else {
    kg = parseFloat(w) || 1;
  }

  // Base is 100 per 0.5kg
  return Math.max(100, Math.round(kg * 2) * 100);
}

export interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge?: string;
  buttonText?: string;
  accentColor?: string;
}

export interface GalleryItem {
  id: string;
  image: string;
}

export function compressImageFile(
  file: File,
  maxWidth: number = 500,
  quality: number = 0.6,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check file size to avoid memory overflow on very large images (e.g. over 20MB)
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error("File is too large"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let scale = 1;

          if (img.width > maxWidth) {
            scale = maxWidth / img.width;
          }

          // Max height boundary to prevent huge memory spikes
          if (img.height * scale > maxWidth * 2) {
            scale = (maxWidth * 2) / img.height;
          }

          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => {
        reject(
          new Error(
            "Failed to load image into element (possibly unsupported format like HEIC without translation). Please use JPEG or PNG.",
          ),
        );
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

export interface CategoryReview {
  id: string;
  name: string;
  rating: number;
  text: string;
}

export interface StoreConfigItem {
  id: string;
  name: string;
  image: string;
  tag: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  pincodes: string;
  basePrice: number;
  allowExpress: boolean;
}

export interface DeliveryTimeSlot {
  id: string;
  label: string;
  surcharge: number;
  type: "standard" | "fixed" | "midnight" | "express";
}

export interface StoreConfig {
  deliveryZones?: DeliveryZone[];
  deliveryTimeSlots?: DeliveryTimeSlot[];
  aboutPoints: string[];
  aboutBgImage: string;
  cakeSubcategories: StoreConfigItem[];
  giftSubcategories?: StoreConfigItem[];
  dewaliSubcategories?: StoreConfigItem[];
  rakhiSubcategories?: StoreConfigItem[];
  photoToArtSubcategories?: StoreConfigItem[];
  handCraftSubcategories?: StoreConfigItem[];
  newYearSubcategories?: StoreConfigItem[];
  categoryReviews?: Record<string, CategoryReview[]>;
  topOfferBannerImage?: string;
  topOfferBannerText?: string;
  topOfferBannerLink?: string;
  personalizedGiftsBannerImage?: string;
  giftsForHimBannerImage?: string;
  giftsForHerBannerImage?: string;
  cakesForHimBannerImage?: string;
  cakesForHerBannerImage?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    whatsapp?: string;
    pinterest?: string;
  };
  showPremiumBestSellers?: boolean;
  showCustomCakeCategories?: boolean;
  showPersonalisedBestSellers?: boolean;
  showCakesSection?: boolean;
  showCakeGallery?: boolean;
  showFlowersSection?: boolean;
  showGiftsSection?: boolean;
  showPlantsSection?: boolean;
  showAboutSection?: boolean;
  showGiftsForHimHer?: boolean;
  showValentineDay?: boolean;
  showTeachersDay?: boolean;
  showMothersDay?: boolean;
  showFathersDay?: boolean;
  showXmasDay?: boolean;
  showNewYear?: boolean;
  showRakhi?: boolean;
  showDewali?: boolean;
  showHandCrafts?: boolean;
  showPhotoToArt?: boolean;
  valentineDayLayout?: "grid" | "slider";
  teachersDayLayout?: "grid" | "slider";
  mothersDayLayout?: "grid" | "slider";
  fathersDayLayout?: "grid" | "slider";
  xmasDayLayout?: "grid" | "slider";
  homepageSectionsOrder?: string[];
}

export interface DeliveryAgent {
  id: string;
  name: string;
  email?: string;
  type: "passcode" | "google";
  passcode?: string;
}

export const DELIVERY_AGENTS: DeliveryAgent[] = [
  {
    id: "agent_subham",
    name: "Subham (Rider 1)",
    type: "passcode",
    passcode: "1001",
  },
  {
    id: "agent_rahul",
    name: "Rahul (Rider 2)",
    type: "passcode",
    passcode: "1002",
  },
  {
    id: "agent_amit",
    name: "Amit (Rider 3)",
    type: "passcode",
    passcode: "1003",
  },
  {
    id: "agent_rocx",
    name: "Rocx Special (Rider 4)",
    type: "passcode",
    passcode: "2666",
  },
];

export function safeSetStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(
      `Local storage full or error for ${key}. Failed to cache locally, but cloud sync might still work.`,
    );
    return false;
  }
}
