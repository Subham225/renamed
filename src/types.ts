import heic2any from "heic2any";

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

export function cleanImageUrl(inputUrl: string): string {
  if (!inputUrl) return "";
  let trimmed = inputUrl.trim();

  // Handle Google Image search URLs or Google redirect links (extract direct imgurl or url parameter)
  if (trimmed.includes("google.") && (trimmed.includes("imgurl=") || trimmed.includes("url="))) {
    try {
      const urlObj = new URL(trimmed);
      const imgUrl = urlObj.searchParams.get("imgurl") || urlObj.searchParams.get("url");
      if (imgUrl) {
        trimmed = decodeURIComponent(imgUrl);
      }
    } catch (e) {
      const match = trimmed.match(/(?:imgurl|url)=([^&]+)/i);
      if (match && match[1]) {
        trimmed = decodeURIComponent(match[1]);
      }
    }
  }

  // Handle Google Drive file view links -> direct image stream
  if (trimmed.includes("drive.google.com/file/d/")) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      trimmed = `https://lh3.googleusercontent.com/u/0/d/${fileIdMatch[1]}`;
    }
  }

  return trimmed;
}

export function compressBase64String(
  dataUrl: string,
  maxDim: number = 350,
  quality: number = 0.45
): Promise<string> {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return Promise.resolve(dataUrl || "");
  }
  // If image base64 data URL is already short (< 15,000 characters ~ 15KB), no need to re-compress
  if (dataUrl.length < 15000) {
    return Promise.resolve(dataUrl);
  }
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let scale = 1;
        const maxSide = Math.max(img.width, img.height);
        if (maxSide > maxDim) {
          scale = maxDim / maxSide;
        }
        const targetWidth = Math.max(1, Math.floor(img.width * scale));
        const targetHeight = Math.max(1, Math.floor(img.height * scale));

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          if (compressed && compressed.length < dataUrl.length) {
            resolve(compressed);
            return;
          }
        }
      } catch (err) {
        console.warn("compressBase64String error:", err);
      }
      resolve(dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function compressStoreConfigImages(
  obj: any,
  maxDim: number = 350,
  quality: number = 0.45
): Promise<any> {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === "string") {
    if (obj.startsWith("data:image/")) {
      return await compressBase64String(obj, maxDim, quality);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return await Promise.all(
      obj.map((item) => compressStoreConfigImages(item, maxDim, quality))
    );
  }
  if (typeof obj === "object") {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = await compressStoreConfigImages(obj[key], maxDim, quality);
    }
    return result;
  }
  return obj;
}

export function compressImageFile(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.6,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let activeFile: Blob = file;

      // Handle HEIC/HEIF files from iOS devices using heic2any
      const fileNameLower = (file.name || "").toLowerCase();
      const fileTypeLower = (file.type || "").toLowerCase();
      if (
        fileNameLower.endsWith(".heic") ||
        fileNameLower.endsWith(".heif") ||
        fileTypeLower.includes("heic") ||
        fileTypeLower.includes("heif")
      ) {
        try {
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });
          activeFile = Array.isArray(converted) ? converted[0] : converted;
        } catch (heicErr) {
          console.warn("heic2any conversion failed:", heicErr);
        }
      }

      // Check file size boundary (30MB max)
      if (activeFile.size > 30 * 1024 * 1024) {
        reject(new Error("File size exceeds 30MB limit"));
        return;
      }

      const fallbackToFileReader = () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const res = e.target?.result as string;
          if (res) {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                let scale = 1;
                if (img.width > maxWidth) scale = maxWidth / img.width;
                const targetWidth = Math.max(1, Math.floor(img.width * scale));
                const targetHeight = Math.max(1, Math.floor(img.height * scale));
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.fillStyle = "#FFFFFF";
                  ctx.fillRect(0, 0, targetWidth, targetHeight);
                  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                  const dataUrl = canvas.toDataURL("image/jpeg", quality);
                  if (dataUrl && dataUrl.startsWith("data:image/")) {
                    resolve(dataUrl);
                    return;
                  }
                }
              } catch (canvasErr) {
                console.warn("Fallback canvas compression error:", canvasErr);
              }
              resolve(res);
            };
            img.onerror = () => resolve(res);
            img.src = res;
          } else {
            reject(new Error("Empty FileReader output"));
          }
        };
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(activeFile);
      };

      // Try ObjectURL canvas compression first for high speed & low memory footprint
      let objectUrl: string | null = null;
      try {
        objectUrl = URL.createObjectURL(activeFile);
      } catch (err) {
        fallbackToFileReader();
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          const canvas = document.createElement("canvas");
          let scale = 1;

          if (img.width > maxWidth) {
            scale = maxWidth / img.width;
          }

          if (img.height * scale > maxWidth * 2) {
            scale = (maxWidth * 2) / img.height;
          }

          const targetWidth = Math.max(1, Math.floor(img.width * scale));
          const targetHeight = Math.max(1, Math.floor(img.height * scale));

          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            fallbackToFileReader();
            return;
          }

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (dataUrl && dataUrl.startsWith("data:image/")) {
            resolve(dataUrl);
          } else {
            fallbackToFileReader();
          }
        } catch (err) {
          console.warn("Canvas compression error, falling back to FileReader:", err);
          fallbackToFileReader();
        }
      };

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        fallbackToFileReader();
      };

      img.src = objectUrl;
    } catch (err) {
      console.warn("compressImageFile top-level error:", err);
      // Ultimate fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || "");
      };
      reader.onerror = () => reject(err);
      reader.readAsDataURL(file);
    }
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
  tag?: string;
  productIds?: string[];
}

export interface TastePickItem {
  id: string;
  name: string;
  image: string;
  productIds?: string[];
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

export interface FlowerCurationConfig {
  heroBannerImage?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  trendingCategories?: StoreConfigItem[];
  byTypeCategories?: StoreConfigItem[];
  byColorCategories?: StoreConfigItem[];
  byCollectionCategories?: StoreConfigItem[];
  premiumFlowersCategories?: StoreConfigItem[];
  luxuryPairings?: StoreConfigItem[];
  byOccasionCategories?: StoreConfigItem[];
  luxuryBloomsBannerImage?: string;
  luxuryBloomsBannerTitle?: string;
  plantsPromoBannerImage?: string;
  plantsPromoBannerTitle?: string;
}

export interface BirthdayCurationConfig {
  heroBannerImage?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  quickCategories?: StoreConfigItem[];
  giftsForHerBannerImage?: string;
  giftsForHerBannerTitle?: string;
  giftsForHimBannerImage?: string;
  giftsForHimBannerTitle?: string;
  premiumCategories?: StoreConfigItem[];
  flowersByTypeCategories?: StoreConfigItem[];
  kidsCakesBannerImage?: string;
  kidsCakesBannerTitle?: string;
  digitalGiftsBannerImage?: string;
  digitalGiftsBannerTitle?: string;
  exploreGiftsCategories?: StoreConfigItem[];
}

export interface PlantCurationConfig {
  heroBannerImage?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  quickCategories?: StoreConfigItem[];
  airPurifyingBannerImage?: string;
  airPurifyingBannerTitle?: string;
  luckyPlantsBannerImage?: string;
  luckyPlantsBannerTitle?: string;
  plantsByTypeCategories?: StoreConfigItem[];
  plantsByLocationCategories?: StoreConfigItem[];
  explorePlantersCategories?: StoreConfigItem[];
}

export interface StoreConfig {
  deliveryZones?: DeliveryZone[];
  deliveryTimeSlots?: DeliveryTimeSlot[];
  aboutPoints: string[];
  aboutBgImage: string;
  cakeSubcategories: StoreConfigItem[];
  quickCakeCategories?: StoreConfigItem[];
  iconicFlavors?: StoreConfigItem[];
  photoCakesBannerItems?: StoreConfigItem[];
  tastePickCategories?: TastePickItem[];
  tastePickSubcategories?: StoreConfigItem[];
  flowerCuration?: FlowerCurationConfig;
  birthdayCuration?: BirthdayCurationConfig;
  plantCuration?: PlantCurationConfig;
  flowerSubcategories?: StoreConfigItem[];
  plantSubcategories?: StoreConfigItem[];
  chocolateSubcategories?: StoreConfigItem[];
  anniversarySubcategories?: StoreConfigItem[];
  personalizedSubcategories?: StoreConfigItem[];
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
