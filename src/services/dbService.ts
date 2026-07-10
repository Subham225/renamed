import { 
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Coupon, Slide, GalleryItem, StoreConfig, StoreConfigItem } from '../types';
import { PRODUCTS } from '../data';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Firebase Connection on boot
export async function testFirebaseConnection() {
  const pathForConnection = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or networks.");
    }
  }
}

// Helper to remove 'undefined' fields so that Firestore setDoc / updateDoc does not crash
export function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  const cleanObj: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      cleanObj[key] = cleanUndefined(val);
    }
  }
  return cleanObj as T;
}

// 1. PRODUCTS DB METHODS
export async function getProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    const list: Product[] = [];
    
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Product);
    });

    if (list.length === 0) {
      console.log("No products found in Firestore. Seeding default products catalog...");
      for (const prod of PRODUCTS) {
        await setDoc(doc(db, path, prod.id), prod);
      }
      return PRODUCTS;
    }
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return PRODUCTS;
  }
}

export function subscribeToProductsFromFirestore(onUpdate: (products: Product[]) => void): () => void {
  const path = 'products';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: Product[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Product);
    });
    
    // Always call onUpdate so that additions, edits, and deletions (even to 0 items) are processed
    onUpdate(list);
  }, (err) => {
    console.error("Error listening to products collection:", err);
  });
  return unsubscribe;
}

export async function ensureDefaultProducts(): Promise<void> {
  const path = 'products';
  try {
    const metaRef = doc(db, 'store_config', 'products_meta');
    const metaSnap = await getDocFromServer(metaRef).catch(() => null);
    
    // Check if we have already seeded version 2 (which includes SEASONAL_PRODUCTS)
    if (metaSnap && metaSnap.exists() && metaSnap.data()?.version >= 2) {
      console.log("Products catalog already up to date. Skipping auto-seeding.");
      return;
    }

    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    
    const existingIds = new Set<string>();
    snapshot.forEach((docSnap) => {
      existingIds.add(docSnap.id);
    });

    let seededCount = 0;
    for (const prod of PRODUCTS) {
      if (!existingIds.has(prod.id)) {
        await setDoc(doc(db, path, prod.id), cleanUndefined(prod));
        seededCount++;
      }
    }

    await setDoc(metaRef, { seeded: true, version: 2 }, { merge: true });

    if (seededCount > 0) {
      console.log(`Seeded ${seededCount} missing products to Firestore successfully (v2 update)!`);
    } else {
      console.log("All default products already exist in Firestore (v2).");
    }
  } catch (err) {
    console.error("Error ensuring default products:", err);
  }
}

export function subscribeToCouponsFromFirestore(onUpdate: (coupons: Coupon[]) => void): () => void {
  const path = 'coupons';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: Coupon[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Coupon);
    });
    onUpdate(list);
  }, (err) => {
    console.error("Error listening to coupons collection:", err);
  });
  return unsubscribe;
}

export async function ensureDefaultCoupons(): Promise<void> {
  const path = 'coupons';
  try {
    const metaRef = doc(db, 'store_config', 'coupons_meta');
    const metaSnap = await getDocFromServer(metaRef).catch(() => null);
    if (metaSnap && metaSnap.exists() && metaSnap.data()?.seeded) {
      console.log("Coupons already seeded in the past. Skipping auto-seeding.");
      return;
    }

    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    
    const existingCodes = new Set<string>();
    snapshot.forEach((docSnap) => {
      existingCodes.add(docSnap.id);
    });

    const defaultCoupons: Coupon[] = [
      { code: 'ROCX100', discountType: 'flat', discountValue: 100, minOrderAmount: 599, description: 'FLAT ₹100 Off on orders above ₹599!', isActive: true, showInCart: true },
      { code: 'CAKE20', discountType: 'percentage', discountValue: 20, minOrderAmount: 999, description: '20% OFF on all gourmet cakes! Max ₹250', isActive: true, showInCart: true },
      { code: 'WELCOME50', discountType: 'flat', discountValue: 50, minOrderAmount: 399, description: 'FLAT ₹50 OFF on your inaugural order!', isActive: true, showInCart: true },
    ];

    let seededCount = 0;
    for (const c of defaultCoupons) {
      if (!existingCodes.has(c.code)) {
        await setDoc(doc(db, path, c.code), cleanUndefined(c));
        seededCount++;
      }
    }

    await setDoc(metaRef, { seeded: true }, { merge: true });

    if (seededCount > 0) {
      console.log(`Seeded ${seededCount} missing coupons successfully!`);
    } else {
      console.log("All default coupons already exist in Firestore.");
    }
  } catch (err) {
    console.error("Error ensuring default coupons:", err);
  }
}

export async function addProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), cleanUndefined(product));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateProductPriceInFirestore(productId: string, newPrice: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), { price: newPrice });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateProductInFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), cleanUndefined(product));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function restoreDefaultProducts(): Promise<void> {
  const path = 'products';
  try {
    for (const prod of PRODUCTS) {
      await setDoc(doc(db, path, prod.id), prod);
    }
    console.log("Default products restored successfully");
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 2. ORDERS DB METHODS
export async function getOrdersFromFirestore(): Promise<any[]> {
  const path = 'orders';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    // Sort by order creation date or standard numeric order ID
    list.sort((a, b) => b.id.localeCompare(a.id));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function getOrderFromFirestore(orderId: string): Promise<any | null> {
  const path = `orders/${orderId}`;
  try {
    const docSnap = await getDocFromServer(doc(db, 'orders', orderId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return null;
  }
}

export function subscribeToOrdersFromFirestore(onUpdate: (orders: any[]) => void, onError?: (error: any) => void): () => void {
  const path = 'orders';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    list.sort((a, b) => b.id.localeCompare(a.id));
    onUpdate(list);
  }, (error) => {
    console.error("Firestore Orders Subscription Error:", error);
    if (onError) {
      onError(error);
    }
  });
  return unsubscribe;
}

export async function addOrderToFirestore(order: any): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), cleanUndefined(order));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: string, estimatedDelivery?: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const updateData: any = { status };
    if (estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = estimatedDelivery;
    }
    await updateDoc(doc(db, 'orders', orderId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateOrderOtpInFirestore(orderId: string, deliveryOtp: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), { deliveryOtp });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateOrderPaymentStatusInFirestore(orderId: string, paymentStatus: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), { paymentStatus });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateOrderPickupInFirestore(orderId: string, deliveryAgentPicked: boolean): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), { deliveryAgentPicked });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function assignOrderRiderInFirestore(orderId: string, assignedRiderId: string, assignedRiderName: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), { assignedRiderId, assignedRiderName });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 3. COUPONS DB METHODS
export async function getCouponsFromFirestore(): Promise<Coupon[]> {
  const path = 'coupons';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: Coupon[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Coupon);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function addCouponToFirestore(coupon: Coupon): Promise<void> {
  const path = `coupons/${coupon.code}`;
  try {
    await setDoc(doc(db, 'coupons', coupon.code), coupon);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCouponFromFirestore(code: string): Promise<void> {
  const path = `coupons/${code}`;
  try {
    await deleteDoc(doc(db, 'coupons', code));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. SLIDES DB METHODS
export const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'slide_1',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    title: 'Perfect Gifts for Every Birthday',
    badge: 'Signature Collection',
    subtitle: 'Bespoke strawberry chocolate layers baked fresh on delivery day.'
  },
  {
    id: 'slide_2',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    title: 'Celebrate Life with Exquisite Petals',
    badge: 'Fresh Daily',
    subtitle: 'Handcrafted premium floral arrangements delivered straight from the hub.'
  },
  {
    id: 'slide_3',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    title: 'Gilded Combos & Premium Bundles',
    badge: 'Curated Joys',
    subtitle: 'Sophisticated dynamic gifting packages designed to impress.'
  }
];

export function subscribeToSlidesFromFirestore(onUpdate: (slides: Slide[]) => void): () => void {
  const path = 'slides';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: Slide[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Slide);
    });
    
    if (list.length > 0) {
      list.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(list);
    }
  }, (err) => {
    console.error("Error subscribing to slides collection:", err);
  });
  return unsubscribe;
}

export async function ensureDefaultSlides(): Promise<void> {
  const path = 'slides';
  try {
    const metaRef = doc(db, 'store_config', 'slides_meta');
    const metaSnap = await getDocFromServer(metaRef).catch(() => null);
    if (metaSnap && metaSnap.exists() && metaSnap.data()?.seeded) {
      console.log("Slides already seeded in the past. Skipping auto-seeding.");
      return;
    }

    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log("Seeding default slides to Firestore...");
      for (const slide of DEFAULT_SLIDES) {
        await setDoc(doc(db, path, slide.id), slide);
      }
      console.log("Slides seeding finalized successfully!");
    }

    await setDoc(metaRef, { seeded: true }, { merge: true });
  } catch (err) {
    console.error("Error ensuring default slides:", err);
  }
}

export async function addSlideToFirestore(slide: Slide): Promise<void> {
  const path = `slides/${slide.id}`;
  try {
    await setDoc(doc(db, 'slides', slide.id), slide);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSlideFromFirestore(slideId: string): Promise<void> {
  const path = `slides/${slideId}`;
  try {
    await deleteDoc(doc(db, 'slides', slideId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. GALLERY DB METHODS
export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal_1',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gal_2',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gal_3',
    image: 'https://images.unsplash.com/photo-1533782654613-826a072dd6f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gal_4',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gal_5',
    image: 'https://images.unsplash.com/photo-1562266649-147a622a61d5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gal_6',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gal_7',
    image: 'https://images.unsplash.com/photo-1518047601542-79f18c655718?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'gal_8',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80'
  }
];

export function subscribeToGalleryFromFirestore(onUpdate: (gallery: GalleryItem[]) => void): () => void {
  const path = 'gallery';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: GalleryItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as GalleryItem);
    });
    
    if (list.length > 0) {
      list.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(list);
    }
  }, (err) => {
    console.error("Error subscribing to gallery collection:", err);
  });
  return unsubscribe;
}

export async function ensureDefaultGallery(): Promise<void> {
  const path = 'gallery';
  try {
    const metaRef = doc(db, 'store_config', 'gallery_meta');
    const metaSnap = await getDocFromServer(metaRef).catch(() => null);
    if (metaSnap && metaSnap.exists() && metaSnap.data()?.seeded) {
      console.log("Gallery already seeded in the past. Skipping auto-seeding.");
      return;
    }

    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log("Seeding default gallery pictures to Firestore...");
      for (const item of DEFAULT_GALLERY) {
        await setDoc(doc(db, path, item.id), item);
      }
      console.log("Gallery pictures seeding finalized successfully!");
    }

    await setDoc(metaRef, { seeded: true }, { merge: true });
  } catch (err) {
    console.error("Error ensuring default gallery slides:", err);
  }
}

export async function addGalleryItemToFirestore(item: GalleryItem): Promise<void> {
  const path = `gallery/${item.id}`;
  try {
    await setDoc(doc(db, 'gallery', item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGalleryItemFromFirestore(itemId: string): Promise<void> {
  const path = `gallery/${itemId}`;
  try {
    await deleteDoc(doc(db, 'gallery', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 6. STORE SETTINGS CONFIGURATION DB METHODS
export const DEFAULT_STORE_CONFIG: StoreConfig = {
  aboutPoints: [
    'Freshly baked and hand-delivered with care.',
    'Personalized gifts, flowers, plants, cakes, and combo boxes in one place.',
    'Easy admin control for categories, sections, and homepage banners.'
  ],
  aboutBgImage: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80',
  cakeSubcategories: [
    {
      id: 'photo_cake',
      name: 'Photo Cake',
      image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=400&q=80',
      tag: 'Custom Edible Print'
    },
    {
      id: 'bento_cake',
      name: 'Bento Cake',
      image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=400&q=80',
      tag: 'Mini Aesthetic'
    },
    {
      id: 'pinata_cake',
      name: 'Pinata Cake',
      image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80',
      tag: 'Hammer Surprise'
    },
    {
      id: 'kids_cake',
      name: 'Kids Cake',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80',
      tag: 'Fun Theme Designs'
    }
  ],
  giftSubcategories: [
    {
      id: 'flower_combos',
      name: 'Flower Combos',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
      tag: 'Blooms & Chocolates'
    },
    {
      id: 'cake_combos',
      name: 'Cake Combos',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
      tag: 'Dessert & Toy Kits'
    },
    {
      id: 'chocolate_flower',
      name: 'Chocolate & Flower',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
      tag: 'Sweetest Greetings'
    },
    {
      id: 'personalised_combos',
      name: 'Personalised Combos',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      tag: 'Memories & Decor'
    }
  ],
  categoryReviews: {
    default: [
      { id: '1', name: 'Amit Sharma', rating: 5, text: 'Absolutely wonderful experience. The cake was fresh and delivered right on time!' },
      { id: '2', name: 'Priya Das', rating: 5, text: 'Amazing taste and presentation. Highly recommended for any celebration.' },
      { id: '3', name: 'Rahul Verma', rating: 4, text: 'Very good quality, the packaging was also very premium. Loved it.' },
      { id: '4', name: 'Sneha Gupta', rating: 5, text: 'Best customized gift I have ordered online. Great value and service.' }
    ]
  },
  showPremiumBestSellers: true,
  showCustomCakeCategories: true,
  showPersonalisedBestSellers: true,
  showCakesSection: true,
  showCakeGallery: true,
  showFlowersSection: true,
  showGiftsSection: true,
  showPlantsSection: true,
  showAboutSection: true
};

export function subscribeToStoreConfigFromFirestore(onUpdate: (config: StoreConfig) => void): () => void {
  const path = 'store_config/settings';
  const docRef = doc(db, 'store_config', 'settings');
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as StoreConfig);
    } else {
      console.log("No store configs found in Firestore. Seeding default settings...");
      setDoc(docRef, DEFAULT_STORE_CONFIG);
      onUpdate(DEFAULT_STORE_CONFIG);
    }
  }, (err) => {
    console.error("Error subscribing to store config:", err);
    onUpdate(DEFAULT_STORE_CONFIG);
  });
  return unsubscribe;
}

export async function updateStoreConfigInFirestore(config: StoreConfig): Promise<void> {
  const path = 'store_config/settings';
  const docRef = doc(db, 'store_config', 'settings');
  try {
    await setDoc(docRef, config);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 4. DELIVERY RIDERS AUTHENTICATED DB METHODS
export function subscribeToRidersFromFirestore(onUpdate: (riders: any[]) => void): () => void {
  const path = 'delivery_riders';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({ id: docSnap.id, ...data });
    });
    onUpdate(list);
  }, (error) => {
    console.error("Firestore Riders Subscription Error:", error);
  });
  return unsubscribe;
}

export async function saveRiderToFirestore(rider: any): Promise<void> {
  const path = `delivery_riders/${rider.id}`;
  try {
    await setDoc(doc(db, 'delivery_riders', rider.id), cleanUndefined(rider));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRiderFromFirestore(id: string): Promise<void> {
  const path = `delivery_riders/${id}`;
  try {
    await deleteDoc(doc(db, 'delivery_riders', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. SELLER APPLICATIONS AUTHENTICATED DB METHODS
export function subscribeToSellersFromFirestore(onUpdate: (sellers: any[]) => void): () => void {
  const path = 'seller_applications';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({ id: docSnap.id, ...data });
    });
    // Sort newly created first visually
    list.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return tB - tA;
    });
    onUpdate(list);
  }, (error) => {
    console.error("Firestore Sellers Subscription Error:", error);
  });
  return unsubscribe;
}

export async function saveSellerToFirestore(seller: any): Promise<void> {
  const path = `seller_applications/${seller.id}`;
  try {
    await setDoc(doc(db, 'seller_applications', seller.id), cleanUndefined(seller));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSellerFromFirestore(id: string): Promise<void> {
  const path = `seller_applications/${id}`;
  try {
    await deleteDoc(doc(db, 'seller_applications', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. DELIVERY RUN AUDIT LOG RECORDS METHODS
export async function registerOrderAuditInFirestore(audit: any): Promise<void> {
  const path = `delivery_audits/${audit.id || audit.orderId}`;
  try {
    await setDoc(doc(db, 'delivery_audits', audit.id || audit.orderId), cleanUndefined(audit));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToDeliveryAudits(onUpdate: (audits: any[]) => void): () => void {
  const path = 'delivery_audits';
  const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({ id: docSnap.id, ...data });
    });
    // Sort audits by timestamp descending
    list.sort((a, b) => {
      const tsA = typeof a.timestamp === 'number' ? a.timestamp : Number(a.timestamp) || 0;
      const tsB = typeof b.timestamp === 'number' ? b.timestamp : Number(b.timestamp) || 0;
      return tsB - tsA;
    });
    onUpdate(list);
  }, (error) => {
    console.error("Firestore Delivery Audits Subscription Error:", error);
  });
  return unsubscribe;
}



