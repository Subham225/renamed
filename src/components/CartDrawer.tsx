import React, { useState, useMemo } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  MapPin,
  User,
  ChevronRight,
  QrCode,
  MessageSquare,
  Mail,
  Tag,
} from "lucide-react";
import {
  CartItem,
  Coupon,
  isBentoCakeProduct,
  Category,
  Product,
  getWeightPrice,
  getEgglessOffset,
} from "../types";
import { sendOrderEmailNotification } from "../services/notificationService";
import { auth } from "../firebase";
import { ACCESSORY_ADDONS } from "../data";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onUpdateItemCustomization?: (
    id: string,
    field: "uploadedPhotoUrl" | "customName",
    value: string,
  ) => void;
  deliveryCity: string;
  deliveryPincode: string;
  onOrderPlaced?: (order: any) => void;
  isLoggedIn: boolean;
  onOpenProfile: () => void;
  coupons?: Coupon[];
  onAddToCart?: (cartItem: CartItem) => void;
  categories?: Category[];
  products?: Product[];
  onTrackOrder?: (orderId: string) => void;
}

type CheckoutStep =
  | "cart"
  | "checkout_profile"
  | "checkout_address"
  | "checkout_payment"
  | "success";

const canUploadPhoto = (product: any) => {
  if (!product) return false;
  return (
    !!product.options?.hasPhotoUpload ||
    (product.name || "").toLowerCase().includes("photo")
  );
};

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onUpdateItemCustomization,
  deliveryCity,
  deliveryPincode,
  onOrderPlaced,
  isLoggedIn,
  onOpenProfile,
  coupons = [],
  onAddToCart,
  categories = [],
  products = [],
  onTrackOrder,
}: CartDrawerProps) {
  // Multi-step checkout states
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [coupon, setCoupon] = useState<string>("");
  const [isCouponApplied, setIsCouponApplied] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [processingImageId, setProcessingImageId] = useState<string | null>(
    null,
  );
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const [emailError, setEmailError] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");

  // Dynamically load accessories from Firestore database if edited, or products added without a primary category ("None (Subcategory only)")
  const liveAccessories = useMemo(() => {
    const list = (products || []).filter(
      (p) => p.category === "accessories" || !p.category || p.category === "",
    );
    return list.length > 0 ? list : ACCESSORY_ADDONS;
  }, [products]);

  // Robust function to handle standard & HEIC image files, compress, and update the cart state
  const processImageFile = async (
    itemId: string,
    file: File,
    callback: (id: string, field: "uploadedPhotoUrl", val: string) => void,
  ) => {
    setProcessingImageId(itemId);
    try {
      let activeFile: Blob = file;
      const fileLower = file.name.toLowerCase();
      const isHeic =
        fileLower.endsWith(".heic") ||
        fileLower.endsWith(".heif") ||
        file.type === "image/heic" ||
        file.type === "image/heif";

      if (isHeic) {
        // Dynamic import heic2any beautifully
        const heic2anyModule = await import("heic2any");
        const conv: any = heic2anyModule.default || heic2anyModule;
        const result = await conv({
          blob: file,
          toType: "image/jpeg",
          quality: 0.6,
        });
        activeFile = Array.isArray(result) ? result[0] : result;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 500;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL("image/jpeg", 0.6);
            callback(itemId, "uploadedPhotoUrl", compressed);
            setProcessingImageId(null);
          } catch (err) {
            callback(itemId, "uploadedPhotoUrl", rawDataUrl);
            setProcessingImageId(null);
          }
        };
        img.onerror = () => {
          callback(itemId, "uploadedPhotoUrl", rawDataUrl);
          setProcessingImageId(null);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(activeFile);
    } catch (err) {
      console.error("Error processing file, falling back directly:", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        callback(itemId, "uploadedPhotoUrl", e.target?.result as string);
        setProcessingImageId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mini summary generator to display items + uploaded pictures through other checkout steps
  const renderMiniCheckoutSummary = () => {
    return (
      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-3 rounded-2xl space-y-2 mt-1">
        <div className="flex justify-between items-center pb-1 border-b border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">
            🎂 Review Items in Order (
            {cartItems.reduce((acc, current) => acc + current.quantity, 0)})
          </span>
          <span className="text-[10px] text-pink-400 font-bold">
            🛒 Running Total: ₹{finalTotalAmount}
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-pink-600">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-slate-955 border border-slate-800 p-1.5 rounded-xl shrink-0 min-w-[170px] max-w-[210px]"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0 relative">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {item.uploadedPhotoUrl && (
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-md overflow-hidden border-t border-l border-pink-500 bg-black/85"
                    title="Custom Photo"
                  >
                    <img
                      src={item.uploadedPhotoUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-bold text-slate-200 truncate leading-tight">
                  {item.product.name}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                  Qty: {item.quantity}{" "}
                  {item.selectedWeight ? `| ${item.selectedWeight}` : ""}
                </p>
                {item.uploadedPhotoUrl ? (
                  <span className="text-[8px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1 py-0.2 rounded font-black inline-block mt-0.5">
                    ✓ Custom Photo Loaded
                  </span>
                ) : (
                  canUploadPhoto(item.product) && (
                    <span className="text-[8px] text-amber-400 bg-amber-950/40 border border-amber-900/50 px-1 py-0.2 rounded font-black inline-block mt-0.5">
                      ⚠️ Photo Missing
                    </span>
                  )
                )}
                {item.customName && (
                  <p className="text-[8px] text-pink-400 truncate mt-0.5 font-black">
                    Name: {item.customName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {cartItems.some((item) => item.product.adminNote) && (
          <div className="bg-pink-950/80 border border-pink-900 p-2.5 rounded-xl space-y-1 mt-1 text-pink-100 text-left">
            <span className="text-[8.5px] font-black uppercase tracking-wider block text-pink-300">
              📢 Important Delivery Notice
            </span>
            {cartItems.map((item) => {
              if (!item.product.adminNote) return null;
              return (
                <div
                  key={item.id}
                  className="text-[9.5px] leading-relaxed font-semibold flex items-start gap-1"
                >
                  <span className="text-pink-400 shrink-0 select-none">•</span>
                  <span>
                    <strong>{item.product.name}</strong>:{" "}
                    {item.product.adminNote}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Enhanced form parameters to segment Customer info from Recipient info
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    recipientName: "",
    recipientPhone: "",
    streetAddress: "",
    pincode: deliveryPincode || "",
    city: deliveryCity || "Kharagpur",
    landmark: "",
    paymentMode: "Online Payment", // Default
    deliveryDate: "",
    deliveryTimeSlot: "Any Time On Specified Date",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const savedName =
        localStorage.getItem("rocx_user_name") ||
        localStorage.getItem("rocx_user_email") ||
        "";
      const savedPhone = localStorage.getItem("rocx_user_phone") || "";
      const isTwoHour = cartItems.some(
        (item) => item.product.isTwoHourDelivery,
      );
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || savedName,
        customerPhone: prev.customerPhone || savedPhone,
        pincode: prev.pincode || deliveryPincode || "",
        city: prev.city || deliveryCity || "Kharagpur",
        deliveryTimeSlot: isTwoHour
          ? "2 Hours Express Delivery"
          : prev.deliveryTimeSlot,
      }));
    }
  }, [isOpen, deliveryCity, deliveryPincode, cartItems]);

  if (!isOpen) return null;

  // Calculations helper
  const getDeliveryCharge = (type: CartItem["deliveryType"]) => {
    if (type === "express") return 150;
    if (type === "midnight") return 250;
    return 0; // standard delivery is free
  };

  const calculateItemPrice = (item: CartItem) => {
    if (isBentoCakeProduct(item.product)) {
      return item.isEggless ? 350 : 299;
    }
    let price = item.product.price;
    if (item.product.options?.hasWeightOptions && item.selectedWeight) {
      price = getWeightPrice(item.product, item.selectedWeight);
    }
    if (item.product.options?.hasEgglessOption && item.isEggless) {
      price += getEgglessOffset(item.selectedWeight || "1.0 Kg", item.product);
    }
    return price;
  };

  const itemsSubtotal = cartItems.reduce((acc, item) => {
    return acc + calculateItemPrice(item) * item.quantity;
  }, 0);

  let deliverySubtotal = 0;
  if (cartItems.length > 0) {
    const isTwoHourSelected =
      formData.deliveryTimeSlot === "2 Hours Express Delivery" ||
      (formData.deliveryTimeSlot === "Any Time On Specified Date" &&
        cartItems.some(
          (item) =>
            item.product.isTwoHourDelivery ||
            item.product.category === "two_hours_delivery" ||
            item.product.categories?.includes("two_hours_delivery"),
        ));

    // As per requirement: "150rs sudhu 2 hours delivery te thakbe baad baki by default 100 hbe"
    deliverySubtotal = isTwoHourSelected ? 150 : 100;
  }

  const activeCouponObject = coupons.find(
    (p) => p.code.trim().toUpperCase() === coupon.trim().toUpperCase(),
  );

  const getDiscountAmount = () => {
    if (!isCouponApplied || !activeCouponObject) return 0;
    if (
      activeCouponObject.minOrderAmount &&
      itemsSubtotal < activeCouponObject.minOrderAmount
    ) {
      return 0;
    }
    if (activeCouponObject.discountType === "flat") {
      return activeCouponObject.discountValue;
    }
    return Math.round(itemsSubtotal * (activeCouponObject.discountValue / 100));
  };

  const discountAmount = getDiscountAmount();
  const taxableAmount = Math.max(0, itemsSubtotal - discountAmount);
  const gstAmount = 0; // GST Removed
  const finalTotalAmount = taxableAmount + deliverySubtotal;

  const handleApplyCoupon = (customCode?: string) => {
    const codeToSearch = (typeof customCode === "string" ? customCode : coupon)
      .trim()
      .toUpperCase();
    const matched = coupons.find(
      (p) => p.code.trim().toUpperCase() === codeToSearch,
    );
    if (matched) {
      if (matched.minOrderAmount && itemsSubtotal < matched.minOrderAmount) {
        setFormErrors((prev) => ({
          ...prev,
          coupon: `This coupon requires a minimum subtotal of ₹${matched.minOrderAmount}. (Current is ₹${itemsSubtotal})`,
        }));
        setIsCouponApplied(false);
      } else {
        setCoupon(codeToSearch);
        setIsCouponApplied(true);
        setFormErrors((prev) => ({ ...prev, coupon: "" }));
      }
    } else {
      setFormErrors((prev) => ({
        ...prev,
        coupon: `Invalid promo coupon code.`,
      }));
      setIsCouponApplied(false);
    }
  };

  // Step 1 validation: Profile (Customer Name/Phone & Recipient Name/Phone)
  const validateAndProceedToAddress = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const isOpenNow = currentHour >= 0 && currentHour < 20;

    if (!isOpenNow) {
      window.alert("Order Placing Time Is Over , Try Again in The mentioned Time");
      return;
    }

    const errors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      errors.customerName = "Customer name is required";
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 10) {
      errors.customerPhone = "Provide a valid 10-digit customer mobile";
    }
    if (!formData.recipientName.trim()) {
      errors.recipientName = "Recipient/Receiver name is required";
    }
    if (
      !formData.recipientPhone.trim() ||
      formData.recipientPhone.length < 10
    ) {
      errors.recipientPhone = "Provide a valid 10-digit recipient mobile";
    }

    const missingPhotoItems = cartItems.filter(
      (item) => canUploadPhoto(item.product) && !item.uploadedPhotoUrl,
    );
    if (missingPhotoItems.length > 0) {
      errors.photoMissing =
        "Please upload your custom photo for all Photo Cake items below before proceeding.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setStep("checkout_address");
  };

  // Step 2 validation: Address Details (Address, Pincode, City)
  const validateAndProceedToPayment = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const isOpenNow = currentHour >= 0 && currentHour < 20;

    if (!isOpenNow) {
      window.alert("Order Placing Time Is Over , Try Again in The mentioned Time");
      return;
    }

    const errors: Record<string, string> = {};

    if (!formData.streetAddress.trim() || formData.streetAddress.length < 6) {
      errors.streetAddress =
        "Provide a detailed delivery address (min 6 chars)";
    }
    if (!formData.landmark.trim()) {
      errors.landmark = "Nearest landmark is required for accurate delivery";
    }
    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      errors.pincode = "Provide a valid 6-digit PIN code";
    }
    if (!formData.city.trim()) {
      errors.city = "Delivery city is required";
    }
    if (!formData.deliveryDate) {
      errors.deliveryDate = "Required Delivery Date is mandatory";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setStep("checkout_payment");
  };

  const isTwoHourDeliveryAvailable = cartItems.some(
    (item) =>
      item.product.isTwoHourDelivery ||
      item.product.category === "two_hours_delivery" ||
      item.product.categories?.includes("two_hours_delivery"),
  );

  const hasCakeInCart = cartItems.some((item) => {
    const cat = (item.product.category || "").toLowerCase();
    const cats = (item.product.categories || []).map((c) => c.toLowerCase());
    const name = (item.product.name || "").toLowerCase();
    return (
      cat.includes("cake") ||
      cats.some((c) => c.includes("cake")) ||
      name.includes("cake") ||
      item.product.isTwoHourDelivery
    );
  });

  // Check if any personalized or photo cake is in the cart
  const hasPersonalizedInCart = cartItems.some((item) => {
    return (
      item.product.options?.hasPhotoUpload ||
      item.uploadedPhotoUrl ||
      item.product.category === "personalized_gifts" ||
      (item.product.category || "").toLowerCase().includes("personalized") ||
      (item.product.name || "").toLowerCase().includes("photo") ||
      (item.product.name || "").toLowerCase().includes("personalised")
    );
  });

  // Step 3 output: Order Submit on successful checkout confirmation page
  const handleOrderSubmit = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const isOpenNow = currentHour >= 0 && currentHour < 20;

    if (!isOpenNow) {
      window.alert("Order Placing Time Is Over , Try Again in The mentioned Time");
      return;
    }

    // Generate order ID
        setIsLoading(true);
    const randomSerial = Math.floor(100000 + Math.random() * 900000);
    const newOrderId = `ROCX-${randomSerial}`;
    setOrderId(newOrderId);

    const randomOtpStr = Math.floor(1000 + Math.random() * 9000).toString();

    // Build the robust complete order details object
    const finalOrderObject = {
      id: newOrderId,
      deliveryOtp: randomOtpStr,
      items: cartItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: calculateItemPrice(item),
        photoUrl: item.uploadedPhotoUrl || undefined,
        productImage: item.product.image || undefined,
        options:
          `${item.selectedWeight ? item.selectedWeight : ""} ${item.isEggless ? "Eggless" : ""} ${item.selectedPot ? item.selectedPot : ""} ${item.customMessage ? "Msg: " + item.customMessage : ""} ${item.customName ? "Name: " + item.customName : ""} ${item.uploadedPhotoUrl ? "[Attached Photo]" : ""}`.trim(),
      })),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail:
        auth.currentUser?.email ||
        localStorage.getItem("rocx_user_email") ||
        "",
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      streetAddress: `${formData.streetAddress}, Pincode: ${formData.pincode}, ${formData.city}`,
      pincode: formData.pincode,
      city: formData.city,
      landmark: formData.landmark || "None",
      paymentMode: formData.paymentMode,
      paymentStatus: "pending",
      itemsSubtotal: itemsSubtotal,
      total: finalTotalAmount,
      deliveryFee: deliverySubtotal,
      status: "Waiting For Approval From Admin",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      deliveryDate: formData.deliveryDate || "",
      deliveryTimeSlot: hasCakeInCart ? formData.deliveryTimeSlot : undefined,
    };

    // Call callback to store order structurally
    onOrderPlaced?.(finalOrderObject);

    // Save newly created order ID to local storage for instant tracking lookup
    localStorage.setItem("rocx_last_placed_id", newOrderId);

    // Call asynchronous notification service to send a real email instantly
    setEmailStatus("sending");
    setEmailError("");
    sendOrderEmailNotification(finalOrderObject)
      .then((res) => {
        if (res.success) {
          setEmailStatus("sent");
        } else {
          setEmailStatus("failed");
          setEmailError(res.error || "Server rejected SMTP email dispatch");
        }
      })
      .catch((err) => {
        setEmailStatus("failed");
        setEmailError(err.message || "SMTP network request failed");
      });

    
    if (formData.paymentMode === "Online Payment") {
      fetch('/api/create-phonepe-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order: finalOrderObject,
          successUrl: window.location.origin + window.location.pathname,
          cancelUrl: window.location.origin + window.location.pathname
        })
      }).then(res => res.json()).then(data => {
        setIsLoading(false);
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          console.error('PhonePe API Error: ' + (JSON.stringify(data.details) || data.error || 'Unknown error')); setPaymentError('PhonePe API Error: ' + (JSON.stringify(data.details) || data.error || 'Unknown error'));
        }
      }).catch(err => {
        setIsLoading(false);
        console.error('Network error connecting to PhonePe gateway'); setPaymentError('Network error connecting to PhonePe gateway');
      });
    } else {
      setIsLoading(false);
      setStep("success");
    }
  };

  const handleCloseAndReset = () => {
    if (step === "success") {
      onClearCart();
      setStep("cart");
      setIsCouponApplied(false);
      setCoupon("");
      setEmailStatus("idle");
      setEmailError("");
      setFormData({
        customerName: "",
        customerPhone: "",
        recipientName: "",
        recipientPhone: "",
        streetAddress: "",
        pincode: deliveryPincode || "",
        city: deliveryCity || "Kharagpur",
        landmark: "",
        paymentMode: "Online Payment",
        deliveryDate: "",
        deliveryTimeSlot: "Any Time On Specified Date",
      });
    }
    onClose();
  };

  // UPI variables structured from query parameters
  const upiId = "Q838753599@ybl";
  const merchantName = "ROCX Cakes";
  const upiIntentUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${finalTotalAmount}&cu=INR&tn=${encodeURIComponent("ROCX Order Payment")}`;
  const qrCodeImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiIntentUri)}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={handleCloseAndReset}
          aria-hidden="true"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-left overflow-hidden">
            {/* Header section with contextual back buttons */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                {step === "checkout_profile" && (
                  <button
                    onClick={() => setStep("cart")}
                    className="p-1 px-2 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-black cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                {step === "checkout_address" && (
                  <button
                    onClick={() => setStep("checkout_profile")}
                    className="p-1 px-2 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-black cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                {step === "checkout_payment" && (
                  <button
                    onClick={() => setStep("checkout_address")}
                    className="p-1 px-2 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-black cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-pink-600" />
                  {step === "success" && "Waiting For Approval From Admin"}
                  {step === "cart" && "Celebration Cart"}
                  {step === "checkout_profile" && "1. Contact Details"}
                  {step === "checkout_address" && "2. Delivery Address"}
                  {step === "checkout_payment" && "3. Pay & Complete"}
                </h2>
              </div>
              <button
                onClick={handleCloseAndReset}
                className="text-slate-500 hover:text-slate-850 p-1 bg-white hover:bg-slate-100 border border-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Scrolling Content segments */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 space-y-4">
              {/* --- SCENE 1: CART LIST --- */}
              {step === "cart" && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-4">
                      <div className="bg-rose-50 p-6 rounded-full text-pink-500 animate-bounce">
                        <ShoppingBag className="w-12 h-12" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">
                          Your cart is empty!
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
                          Choose from our gourmet cakes, lovely flowers or
                          beautiful custom gifts.
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="py-2.5 px-6 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Browse Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="max-h-[220px] sm:max-h-[300px] overflow-y-auto pr-1.5 space-y-3.5 scrollbar-thin">
                        {cartItems.map((item) => {
                          const calculatedBasePrice = calculateItemPrice(item);
                          return (
                            <div
                              id={`cart-item-${item.id}`}
                              key={item.id}
                              className="flex gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl relative"
                            >
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 relative">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover object-center"
                                />
                                {item.uploadedPhotoUrl && (
                                  <div
                                    className="absolute bottom-0 right-0 w-6 h-6 rounded-tl-lg overflow-hidden border-t border-l border-pink-300 bg-white shadow-md"
                                    title="Your uploaded custom photo is attached"
                                  >
                                    <img
                                      src={item.uploadedPhotoUrl}
                                      alt="Uploaded attachment preview"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <h5 className="font-bold text-slate-800 text-xs line-clamp-1 pr-6">
                                    {item.product.name}
                                  </h5>

                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedWeight && (
                                      <span className="text-[8px] bg-amber-50 text-amber-850 border border-amber-100/50 font-black px-1.5 py-0.5 rounded">
                                        {item.selectedWeight}
                                      </span>
                                    )}
                                    {item.isEggless && (
                                      <span className="text-[8px] bg-emerald-50 text-emerald-850 border border-emerald-100/50 font-black px-1.5 py-0.5 rounded">
                                        PURE EGGLESS
                                      </span>
                                    )}
                                    <span className="text-[8px] bg-pink-50 text-pink-850 border border-pink-100/50 font-black px-1.5 py-0.5 rounded">
                                      Slot: {item.deliveryType}
                                    </span>
                                    {item.customMessage && (
                                      <span className="text-[9px] text-slate-500 font-semibold italic block max-w-[200px] truncate">
                                        &ldquo;{item.customMessage}&rdquo;
                                      </span>
                                    )}
                                    {item.product.adminNote && (
                                      <span className="text-[9px] font-bold text-pink-600 bg-pink-100/30 border border-pink-200/40 px-2 py-0.5 rounded-lg block mt-1 max-w-[200px] leading-relaxed">
                                        📢 Note: {item.product.adminNote}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs font-black text-slate-900">
                                    ₹{calculatedBasePrice * item.quantity}
                                  </span>

                                  <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                                    <button
                                      onClick={() =>
                                        onUpdateQuantity(item.id, -1)
                                      }
                                      className="p-1 px-2 hover:bg-slate-50 text-slate-500 cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold text-slate-800 w-5 text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        onUpdateQuantity(item.id, 1)
                                      }
                                      className="p-1 px-2 hover:bg-slate-50 text-slate-500 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* --- SCENE 2: CHECKOUT CONTACT PROFILE PAGE --- */}
              {step === "checkout_profile" && (
                <div className="space-y-4">
                  <div className="bg-pink-50/50 border border-pink-100/50 p-4.5 rounded-2xl flex items-start gap-2.5">
                    <User className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-pink-950 uppercase tracking-wide">
                        1. Booking Profile Contact Details
                      </h4>
                      <p className="text-[10px] text-pink-800 mt-0.5">
                        Please provide original details to process official
                        automated delivery SMS alerts.
                      </p>
                    </div>
                  </div>

                  {renderMiniCheckoutSummary()}

                  {/* Customer Information (Sender) */}
                  <div className="space-y-3.5 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                      Sender credentials
                    </span>

                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-extrabold text-slate-700 block">
                        Customer Name *
                      </label>
                      <input
                        id="checkout-cust-name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                        className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-pink-500"
                      />
                      {formErrors.customerName && (
                        <span className="text-[10px] text-red-500 font-bold block">
                          {formErrors.customerName}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-extrabold text-slate-700 block">
                        Customer Phone / Number *
                      </label>
                      <input
                        id="checkout-cust-phone"
                        type="tel"
                        maxLength={10}
                        placeholder="Your 10-digit mobile number"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPhone: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full text-xs font-semibold p-3 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500"
                      />
                      {formErrors.customerPhone && (
                        <span className="text-[10px] text-red-500 font-bold block">
                          {formErrors.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recipient Information (Receiver of Cake) */}
                  <div className="space-y-3.5 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                    <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest block">
                      Recipient credentials
                    </span>

                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-extrabold text-slate-700 block">
                        Receiver Name *
                      </label>
                      <input
                        id="checkout-rec-name"
                        type="text"
                        placeholder="Receiver's full name"
                        value={formData.recipientName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recipientName: e.target.value,
                          })
                        }
                        className="w-full text-xs font-semibold p-3 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500"
                      />
                      {formErrors.recipientName && (
                        <span className="text-[10px] text-red-500 font-bold block">
                          {formErrors.recipientName}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs font-extrabold text-slate-700 block">
                        Receiver Phone / Number *
                      </label>
                      <input
                        id="checkout-rec-phone"
                        type="tel"
                        maxLength={10}
                        placeholder="Receiver's 10-digit mobile number"
                        value={formData.recipientPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recipientPhone: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full text-xs font-semibold p-3 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500"
                      />
                      {formErrors.recipientPhone && (
                        <span className="text-[10px] text-red-500 font-bold block">
                          {formErrors.recipientPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customization Details (Name / Photo Upload) shifted to checkout details */}
                  {(() => {
                    const customItems = cartItems.filter(
                      (item) =>
                        item.product.options?.hasNameCustomization ||
                        item.product.options?.hasGiftCustomization ||
                        item.product.options?.hasPhotoUpload ||
                        canUploadPhoto(item.product),
                    );
                    if (customItems.length === 0) return null;

                    return (
                      <div className="space-y-3.5 bg-pink-50/30 p-4 border border-pink-100 rounded-2xl">
                        <span className="text-[10px] font-black text-pink-650 uppercase tracking-widest block flex items-center gap-1.5 font-sans">
                          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse shrink-0" />
                          Customization & Photo Details
                        </span>
                        <p className="text-[9.5px] text-slate-500 leading-tight">
                          Please provide the customization text and/or upload
                          photo files for your items below:
                        </p>

                        {formErrors.photoMissing && (
                          <div className="p-2.5 bg-rose-50 border border-rose-250 rounded-xl text-rose-700 text-[10px] font-extrabold text-left leading-normal animate-pulse">
                            ⚠️ {formErrors.photoMissing}
                          </div>
                        )}

                        <div className="space-y-3">
                          {customItems.map((item) => {
                            const needsName =
                              item.product.options?.hasNameCustomization ||
                              item.product.options?.hasGiftCustomization;
                            const needsPhoto =
                              item.product.options?.hasPhotoUpload ||
                              canUploadPhoto(item.product);

                            return (
                              <div
                                key={item.id}
                                className="space-y-3 bg-white p-3 border border-slate-150 rounded-xl text-left shadow-2xs"
                              >
                                <div className="flex gap-2 items-center">
                                  {item.product.image && (
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      referrerPolicy="no-referrer"
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <h5 className="text-[11px] font-black text-slate-800 truncate leading-normal">
                                      {item.product.name}
                                    </h5>
                                    <p className="text-[8.5px] text-pink-550 font-extrabold uppercase tracking-wider font-mono">
                                      {item.product.category.replace("_", " ")}
                                    </p>
                                  </div>
                                </div>

                                {/* Name Customization Field */}
                                {needsName && (
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-600 block uppercase tracking-wide">
                                      Write Name or Message on Cake/Gift
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="E.g. Happy Birthday Subham / Happy Anniversary"
                                      value={item.customName || ""}
                                      onChange={(e) =>
                                        onUpdateItemCustomization?.(
                                          item.id,
                                          "customName",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full text-xs font-semibold p-2.5 border border-pink-200 rounded-xl bg-white focus:ring-1 focus:ring-pink-500 focus:outline-none"
                                    />
                                  </div>
                                )}

                                {/* Photo Upload Field */}
                                {needsPhoto && (
                                  <div className="space-y-1 pt-1 border-t border-slate-101">
                                    <span className="text-[9px] font-black text-slate-650 block uppercase tracking-wide">
                                      Upload Customized Image File{" "}
                                      <span className="text-red-500 font-extrabold">
                                        * (Required)
                                      </span>
                                    </span>
                                    <div
                                      className={`p-2 border rounded-xl flex flex-col gap-1.5 transition-all ${
                                        !item.uploadedPhotoUrl
                                          ? "border-rose-300 bg-rose-50/25"
                                          : "border-emerald-200 bg-emerald-50/15"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="file"
                                          accept="image/*,.heic,.heif"
                                          disabled={
                                            processingImageId === item.id
                                          }
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (
                                              file &&
                                              onUpdateItemCustomization
                                            ) {
                                              processImageFile(
                                                item.id,
                                                file,
                                                onUpdateItemCustomization,
                                              );
                                            }
                                          }}
                                          className="text-[10px] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 w-full disabled:opacity-50"
                                        />
                                        {item.uploadedPhotoUrl && (
                                          <div className="w-8 h-8 rounded shrink-0 overflow-hidden border border-pink-300 shadow-3xs">
                                            <img
                                              src={item.uploadedPhotoUrl}
                                              alt="custom preview"
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                      {processingImageId === item.id ? (
                                        <div className="flex items-center gap-1.5 py-0.5 text-pink-600 font-bold animate-pulse text-[9px] text-left">
                                          <span className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-ping" />
                                          Processing... please standby
                                        </div>
                                      ) : !item.uploadedPhotoUrl ? (
                                        <span className="text-[9px] font-bold text-rose-600 block text-left">
                                          ⚠️ Please choose/upload a physical
                                          picture for this Photo Cake.
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-extrabold text-emerald-600 block text-left flex items-center gap-0.5">
                                          ✓ Custom image uploaded and verified!
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* --- SCENE 3: CHECKOUT ADDRESS PAGE --- */}
              {step === "checkout_address" && (
                <div className="space-y-4 text-left">
                  <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-xl flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                        2. Delivery Address
                      </h4>
                      <p className="text-[10px] text-amber-805 mt-0.5">
                        Please specify a precise street address to avoid
                        logistics navigation delays.
                      </p>
                    </div>
                  </div>

                  {renderMiniCheckoutSummary()}

                  <div className="space-y-4 bg-slate-50 p-4.5 border border-slate-100 rounded-2xl">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 block uppercase">
                        Street Address (House No, Flat, Area) *
                      </label>
                      <textarea
                        id="checkout-street-address"
                        placeholder="e.g., Room 12, Block B, Silver Apartments, Gariahat"
                        rows={3}
                        value={formData.streetAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            streetAddress: e.target.value,
                          })
                        }
                        className="w-full text-xs font-semibold p-3.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500"
                      />
                      {formErrors.streetAddress && (
                        <span className="text-[10px] text-red-500 font-bold block">
                          {formErrors.streetAddress}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-pink-700 block uppercase">
                        Landmark (e.g., Near school, shop, temple) *
                      </label>
                      <input
                        id="checkout-landmark"
                        type="text"
                        placeholder="e.g., Nearest petrol pump, opposite medical store"
                        value={formData.landmark}
                        onChange={(e) =>
                          setFormData({ ...formData, landmark: e.target.value })
                        }
                        className="w-full text-xs font-semibold p-3 border border-pink-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500"
                      />
                      {formErrors.landmark && (
                        <span className="text-[10px] text-red-500 font-bold block">
                          {formErrors.landmark}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-700 block uppercase">
                          Pincode *
                        </label>
                        <input
                          id="checkout-pincode"
                          type="tel"
                          maxLength={6}
                          placeholder="e.g. 700091"
                          value={formData.pincode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pincode: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className="w-full text-xs font-black p-3 border border-slate-200 bg-white rounded-xl font-mono tracking-widest focus:ring-1 focus:ring-pink-500"
                        />
                        {formErrors.pincode && (
                          <span className="text-[10px] text-red-500 font-bold block">
                            {formErrors.pincode}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-700 block uppercase">
                          City *
                        </label>
                        <input
                          id="checkout-city"
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full text-xs font-extrabold p-3 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500"
                        />
                        {formErrors.city && (
                          <span className="text-[10px] text-red-500 font-bold block">
                            {formErrors.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1.5">
                      <label className="text-[11px] font-black text-slate-700 block uppercase">
                        Requested Delivery Date *
                      </label>
                      <input
                        id="checkout-delivery-date"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.deliveryDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryDate: e.target.value,
                          })
                        }
                        placeholder="Select Your prefered Delivery Date"
                        className="w-full text-xs font-black p-3 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500 font-mono"
                      />
                      <p className="text-[9.5px] text-slate-450 font-black uppercase tracking-wider block text-left">
                        Select Your prefered Delivery Date
                      </p>
                      {formErrors.deliveryDate && (
                        <span className="text-[10px] text-red-500 font-bold block">
                          {formErrors.deliveryDate}
                        </span>
                      )}
                      {hasPersonalizedInCart && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[10px] font-bold text-left space-y-0.5 mt-1.5">
                          <span className="text-[8.5px] font-black text-amber-800 uppercase tracking-widest block">
                            ⚠️ Custom Alert:
                          </span>
                          <p>
                            Delivery Can Take longer Time for items with custom
                            uploads or personalization.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 pt-1.5">
                      <label className="text-[11px] font-black text-slate-700 block uppercase text-pink-700">
                        Delivery Time Slot *
                      </label>
                      <select
                        id="checkout-delivery-timeslot"
                        value={formData.deliveryTimeSlot}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryTimeSlot: e.target.value,
                          })
                        }
                        className="w-full text-xs font-black p-3 border border-pink-200 bg-white rounded-xl focus:ring-1 focus:ring-pink-500 cursor-pointer"
                      >
                        {isTwoHourDeliveryAvailable && (
                          <option value="2 Hours Express Delivery">
                            🚀 2 Hours Express Delivery - Only Available in
                            Kharagpur, Midnapore, Salua, Kalaikunda
                          </option>
                        )}
                        <option value="Standard Delivery (Any Time)">
                          Standard Delivery (Any Time)
                        </option>
                        <option value="Fixed Time: 10 AM to 11 AM">
                          Fixed Time: 10 AM to 11 AM
                        </option>
                        <option value="Fixed Time: 11 AM to 12 PM">
                          Fixed Time: 11 AM to 12 PM
                        </option>
                        <option value="Fixed Time: 12 PM to 1 PM">
                          Fixed Time: 12 PM to 1 PM
                        </option>
                        <option value="Fixed Time: 1 PM to 2 PM">
                          Fixed Time: 1 PM to 2 PM
                        </option>
                        <option value="Fixed Time: 2 PM to 3 PM">
                          Fixed Time: 2 PM to 3 PM
                        </option>
                        <option value="Fixed Time: 3 PM to 4 PM">
                          Fixed Time: 3 PM to 4 PM
                        </option>
                          <option value="Fixed Time: 4 PM to 5 PM">
                            Fixed Time: 4 PM to 5 PM
                          </option>
                          <option value="Fixed Time: 5 PM to 6 PM">
                            Fixed Time: 5 PM to 6 PM
                          </option>
                          <option value="Fixed Time: 6 PM to 7 PM">
                            Fixed Time: 6 PM to 7 PM
                          </option>
                          <option value="Fixed Time: 7 PM to 8 PM">
                            Fixed Time: 7 PM to 8 PM
                          </option>
                          <option value="Fixed Time: 8 PM to 9 PM">
                            Fixed Time: 8 PM to 9 PM
                          </option>
                          <option value="Fixed Time: 10 PM to 11 PM">
                            Fixed Time: 10 PM to 11 PM
                          </option>
                          <option value="Midnight Delivery 11 PM to 12 AM">
                            Midnight Delivery (11 PM to 12 AM)
                          </option>
                        </select>
                        <p className="text-[10px] text-pink-600 font-black italic mt-0.5">
                          Selected slot will be baked & shipped according to
                          schedule!
                        </p>
                      </div>
                  </div>
                </div>
              )}

              {/* --- SCENE 4: CHECKOUT PAYMENT WITH PORTAL GATEWAY --- */}
              {step === "checkout_payment" && (
                  <div className="space-y-4">
                  {/* Payment Info */}
                  <div className="bg-slate-50 rounded-2.5xl p-6 text-center space-y-4 shadow-2xs border border-pink-200/50">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-600 animate-bounce shadow-sm">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Secure Online Payment</h4>
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-2">
                        {formData.paymentMode === "Online Payment" 
                          ? "You will be redirected to the secure PhonePe payment gateway to complete your transaction using UPI, Cards, or NetBanking."
                          : "You have selected Cash on Delivery. Please keep the exact amount ready."}
                      </p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-4 mt-4 text-left space-y-2 shadow-sm">
                      <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold">
                        <span>Items Subtotal</span>
                        <span className="text-slate-800">₹{itemsSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold">
                        <span>Delivery Fee</span>
                        <span className="text-slate-800">{deliverySubtotal === 0 ? "Free" : `₹${deliverySubtotal.toFixed(2)}`}</span>
                      </div>
                      <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center mt-2">
                        <span className="text-xs font-black text-slate-800 uppercase">Amount to Pay</span>
                        <span className="text-sm font-black text-pink-600">₹{finalTotalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Urgent helpline box */}
                  <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex flex-col gap-2 Text-left">
                    <span className="text-[10px] text-amber-900 font-black uppercase tracking-wider block">
                      📞 Instant Order Helpline
                    </span>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      Facing trouble paying? Take a screenshot of the QR and
                      WhatsApp details directly to our helpline or use email.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                      <a
                        href="https://wa.me/916297337735"
                        className="flex items-center gap-1.5 text-[10px] font-black py-1.5 px-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 w-fit cursor-pointer text-emerald-700"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp:
                        6297337735
                      </a>
                      <a
                        href="mailto:rocxcakes@gmail.com"
                        className="flex items-center gap-1.5 text-[10px] font-black py-1.5 px-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 w-fit cursor-pointer text-indigo-700"
                      >
                        <Mail className="w-3.5 h-3.5" /> rocxcakes@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SCENE 5: SUCCESS BILLING SCREEN --- */}
              {step === "success" && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 gap-4">
                  <div className="text-emerald-500 bg-emerald-50 p-5 rounded-full animate-bounce">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">
                      Order Complete & Registered!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-[280px] mx-auto leading-relaxed">
                      Thank you! Your order {orderId} for{" "}
                      {formData.recipientName} has been recorded in the
                      database. Baking begins immediately.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 w-full text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-dashed border-slate-200">
                      <span>Verification order ID:</span>
                      <strong className="text-slate-900 font-mono tracking-wider font-extrabold">
                        {orderId}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Deliver to Mobile:</span>
                      <strong className="text-slate-900 font-mono font-bold">
                        {formData.recipientPhone}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Delivery On:</span>
                      <strong className="text-slate-900 font-bold">
                        {formData.deliveryDate || "Not Specified"}
                      </strong>
                    </div>
                    {hasCakeInCart && (
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="text-pink-600 font-extrabold">
                          Delivery Slot:
                        </span>
                        <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded font-black text-[10px]">
                          {formData.deliveryTimeSlot}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-500 font-semibold">
                      <span>Invoice Mode:</span>
                      <strong className="text-pink-600 font-black">
                        {formData.paymentMode}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 pt-1.5 border-t border-slate-100">
                      <span>Recipient:</span>
                      <strong className="text-slate-900 font-extrabold truncate max-w-[170px]">
                        {formData.recipientName}
                      </strong>
                    </div>
                  </div>

                  {/* Real-time Email Dispatch Debug Status Widget */}
                  <div className="w-full text-left bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-550 tracking-wider">
                      <Mail className="w-3.5 h-3.5 text-pink-600" />
                      Email Notification Sync
                    </div>
                    {emailStatus === "sending" && (
                      <div className="flex items-center gap-2 text-blue-600 font-semibold py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        <span>Sending automatic email...</span>
                      </div>
                    )}
                    {emailStatus === "sent" && (
                      <div className="text-emerald-600 font-semibold py-1">
                        ✓ Email sent successfully to your registered email
                        address!
                      </div>
                    )}
                    {emailStatus === "failed" && (
                      <div className="space-y-2 py-1">
                        <div className="text-rose-650 font-bold flex items-center gap-1 text-[11px] uppercase">
                          ⚠️ Email dispatch failed (Bad SMTP Credentials)
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono bg-white p-2.5 rounded-lg border border-slate-150 leading-normal break-all">
                          {emailError}
                        </div>
                        <div className="text-[11px] text-slate-600 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/80 leading-relaxed font-sans space-y-1.5">
                          <p className="font-bold text-rose-700">
                            Google/Gmail login fail hochhe! Ei step gulo follow
                            koro:
                          </p>
                          <ul className="list-decimal pl-4.5 space-y-1 text-[10px] text-slate-500">
                            <li>
                              <strong>2-Step Verification:</strong> Check koro
                              Gmail account settings-e 2FA active thaktei hobe.
                              Ta chara Google <strong>App Password</strong>{" "}
                              block kore dey.
                            </li>
                            <li>
                              <strong>App Password Check:</strong> Gmail
                              Settings &rarr; Security &rarr; App Passwords key
                              ta solid 16 letterner (space chara:{" "}
                              <code className="bg-slate-100 px-1 font-mono text-[9px]">
                                vlgdxltybgosisbv
                              </code>
                              ) copy hoyeche kina check koro.
                            </li>
                            <li>
                              <strong>Correct User Email:</strong> Ensure
                              logged-in user email or recipient configured
                              inside Settings &rarr; Secrets key setup is
                              correct.
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-pink-600 font-black uppercase tracking-widest mt-1">
                    🚀 Dispatch time: Same-Day Delivery
                  </div>

                  <button
                    onClick={handleCloseAndReset}
                    className="w-full mt-2 py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Continue Celebrating
                  </button>
                </div>
              )}
            </div>

            {/* Calculations and persistent actions footer widget */}
            {cartItems.length > 0 && step !== "success" && (
              <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4 shrink-0">
                {/* --- COMPACT REVOLUTIONARY MICRO-ADDONS SECTION --- */}
                {step === "cart" &&
                  (() => {
                    const inCartIds = new Set(
                      cartItems.map((item) => item.product.id),
                    );
                    const cartCategoryIds = Array.from(
                      new Set(cartItems.map((item) => item.product.category)),
                    );

                    let targetAddonIds = new Set<string>();
                    let hasSpecificAddonMapping = false;

                    // 1. Collect product-specific mapped addon IDs for items in the cart
                    cartItems.forEach((item) => {
                      if (
                        item.product.addonProductIds &&
                        item.product.addonProductIds.length > 0
                      ) {
                        hasSpecificAddonMapping = true;
                        item.product.addonProductIds.forEach((id) =>
                          targetAddonIds.add(id),
                        );
                      }
                    });

                    // 2. Collect category-specific mapped addon IDs only for categories represents in the cart
                    categories.forEach((catRecord) => {
                      if (cartCategoryIds.includes(catRecord.id)) {
                        if (catRecord?.addonProductIds !== undefined) {
                          hasSpecificAddonMapping = true;
                          if (
                            catRecord.addonProductIds &&
                            catRecord.addonProductIds.length > 0
                          ) {
                            catRecord.addonProductIds.forEach((id) =>
                              targetAddonIds.add(id),
                            );
                          }
                        }
                      }
                    });

                    // 3. Filter and recommend matching addon accessories
                    let recommendedAddons = liveAccessories.filter((addon) => {
                      if (inCartIds.has(addon.id)) return false;
                      if (hasSpecificAddonMapping) {
                        return targetAddonIds.has(addon.id);
                      }
                      return true;
                    });

                    // 4. If recommended items is sparse and no custom mapped addons apply, fill it up to 6 with general accessories
                    if (
                      !hasSpecificAddonMapping &&
                      recommendedAddons.length < 4
                    ) {
                      const existingIds = new Set(
                        recommendedAddons.map((addon) => addon.id),
                      );
                      const fillers = liveAccessories.filter(
                        (addon) =>
                          !inCartIds.has(addon.id) &&
                          !existingIds.has(addon.id),
                      );
                      const remainingNeeded = 6 - recommendedAddons.length;
                      if (remainingNeeded > 0) {
                        recommendedAddons.push(
                          ...fillers.slice(0, remainingNeeded),
                        );
                      }
                    }

                    if (recommendedAddons.length === 0) return null;

                    return (
                      <div className="space-y-2 text-left pb-4 border-b border-slate-200/50 mb-1 scroll-smooth">
                        <div className="flex items-center justify-between px-0.5">
                          <span className="text-[10px] font-black text-slate-850 uppercase tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse shrink-0" />
                            Add Extras (Choto layout)
                          </span>
                          <span className="text-[8px] text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded font-black uppercase tracking-wide shrink-0 font-sans">
                            Extras
                          </span>
                        </div>

                        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin snap-x snap-mandatory">
                          {recommendedAddons.map((addon) => (
                            <div
                              key={addon.id}
                              className="flex flex-col justify-between p-1 bg-white border border-slate-150 rounded-lg shrink-0 w-[66px] sm:w-[72px] aspect-[0.72] snap-start relative hover:border-pink-300 transition-all text-center group shadow-4xs"
                            >
                              <div>
                                <div className="w-full aspect-square rounded-md overflow-hidden bg-slate-50 border border-slate-100 mb-0.5 relative shrink-0">
                                  <img
                                    src={addon.image}
                                    alt={addon.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <p
                                  className="text-[7.5px] font-black text-slate-800 line-clamp-1 tracking-tight leading-none px-0.5 font-sans"
                                  title={addon.name}
                                >
                                  {addon.name}
                                </p>
                                <p className="text-[8px] font-black text-pink-600 font-mono leading-none mt-0.5">
                                  ₹{addon.price}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onAddToCart) {
                                    onAddToCart({
                                      id: `${addon.id}_addon`,
                                      product: addon,
                                      quantity: 1,
                                      deliveryType: "standard",
                                    });
                                  }
                                }}
                                className="w-full mt-1 py-0.5 h-[16px] bg-pink-50 hover:bg-pink-600 text-pink-750 hover:text-white border border-pink-100 hover:border-pink-600 rounded text-[7.5px] font-black uppercase tracking-wide transition-all shrink-0 active:scale-90 cursor-pointer flex items-center justify-center gap-0.5 font-sans"
                              >
                                <Plus className="w-2 h-2" /> Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                {/* --- COMPACT PROMO COUPON CODE AREA --- */}
                {step === "cart" && (
                  <div className="pt-2.5 border-t border-slate-200/50 space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                        <Tag className="w-3.5 h-3.5 text-pink-600 animate-pulse" />
                        Apply Promo Coupon
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="E.g. ROCX100"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="flex-1 text-[11px] font-bold p-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 uppercase font-mono"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="py-2 px-3.5 bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase rounded-xl transition cursor-pointer font-sans"
                      >
                        Apply
                      </button>
                    </div>

                    {isCouponApplied && activeCouponObject && (
                      <span className="text-[9.5px] text-emerald-700 bg-emerald-55 border border-emerald-100 p-2 rounded-xl font-extrabold block leading-normal text-left">
                        ✓ Coupon{" "}
                        <strong className="font-mono">
                          {activeCouponObject.code}
                        </strong>{" "}
                        successfully applied! Saved{" "}
                        <strong>₹{discountAmount}</strong>!
                      </span>
                    )}

                    {formErrors.coupon && (
                      <span className="text-[9.5px] text-red-650 bg-red-50 border border-red-150 p-2 rounded-xl font-extrabold block text-left leading-normal">
                        {formErrors.coupon}
                      </span>
                    )}

                    {/* Available Coupons tag strip for click-to-apply */}
                    {coupons &&
                      coupons.filter(
                        (c) => c.showInCart !== false && c.isActive !== false,
                      ).length > 0 && (
                        <div className="space-y-1 mt-1">
                          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                            Available Offers
                          </span>
                          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scroll-smooth pr-1">
                            {coupons
                              .filter(
                                (c) =>
                                  c.showInCart !== false &&
                                  c.isActive !== false,
                              )
                              .map((c) => {
                                const cannotApply = c.minOrderAmount
                                  ? itemsSubtotal < c.minOrderAmount
                                  : false;
                                const isApplied =
                                  isCouponApplied &&
                                  coupon.toUpperCase() === c.code.toUpperCase();
                                return (
                                  <button
                                    key={c.code}
                                    type="button"
                                    disabled={cannotApply}
                                    onClick={() => handleApplyCoupon(c.code)}
                                    className={`px-2 py-1 border rounded-lg flex items-center gap-1.5 text-left transition shrink-0 cursor-pointer ${
                                      isApplied
                                        ? "bg-emerald-600 border-emerald-600 text-white font-extrabold"
                                        : cannotApply
                                          ? "bg-slate-100 border-slate-150 text-slate-400 cursor-not-allowed grayscale-[40%]"
                                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span
                                      className={`font-mono text-[8px] font-black px-1 py-0.25 rounded uppercase leading-none border ${
                                        isApplied
                                          ? "bg-emerald-750 text-white border-emerald-500"
                                          : "bg-slate-900 text-white border-slate-900"
                                      }`}
                                    >
                                      {c.code}
                                    </span>
                                    <span className="text-[9px] font-black leading-none">
                                      {c.discountType === "flat"
                                        ? `₹${c.discountValue}`
                                        : `${c.discountValue}%`}{" "}
                                      OFF
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Calculation summaries */}
                <div className="space-y-1.5 text-slate-500 text-xs text-left">
                  <div className="flex justify-between">
                    <span>Items Total:</span>
                    <strong className="text-slate-850">₹{itemsSubtotal}</strong>
                  </div>
                  {isCouponApplied && activeCouponObject && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Savings ({activeCouponObject.code}):</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold">
                    <span>Flat Delivery Fee:</span>
                    <strong className="text-slate-800">
                      {deliverySubtotal === 0 ? "FREE" : `₹${deliverySubtotal}`}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between text-slate-900 font-black">
                    <span className="text-xs uppercase tracking-wider">
                      Final Total Amount:
                    </span>
                    <strong className="text-base font-black text-pink-600">
                      ₹{finalTotalAmount}
                    </strong>
                  </div>
                </div>

                {/* Sticky Flow Progression Button */}
                {step === "cart" &&
                  (!isLoggedIn ? (
                    <div className="bg-pink-50 border border-pink-200 p-4.5 rounded-2.5xl flex flex-col gap-2.5 mb-2 text-left shadow-xs">
                      <div className="flex items-center gap-2 text-pink-700">
                        <User className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          Login Required for Checkout
                        </span>
                      </div>
                      <p className="text-[10.5px] text-pink-905 leading-relaxed font-bold">
                        Please finish logging in using your verified mobile
                        number or Google credentials to complete your
                        reservation.
                      </p>
                      <button
                        onClick={onOpenProfile}
                        className="w-full mt-1 bg-pink-600 hover:bg-pink-700 text-white font-black py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider cursor-pointer shadow-sm"
                      >
                        🔐 Open Secure Login Dashboard
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const now = new Date();
                          const currentHour = now.getHours();
                          const isOpenNow = currentHour >= 0 && currentHour < 20;

                          if (!isOpenNow) {
                            window.alert("Order Placing Time Is Over , Try Again in The mentioned Time");
                            return;
                          }
                          setStep("checkout_profile");
                        }}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" /> Checkout Booking
                        Details
                      </button>
                    </div>
                  ))}

                {step === "checkout_profile" && (
                  <button
                    onClick={validateAndProceedToAddress}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    Proceed To Delivery Address{" "}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {step === "checkout_address" && (
                  <button
                    onClick={validateAndProceedToPayment}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    Proceed To Pay ₹{finalTotalAmount}{" "}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {step === "checkout_payment" && (
                  <div className="flex flex-col w-full gap-2">
                  <button
                    onClick={handleOrderSubmit}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-xl transition duration-150 shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-sans"
                  >
                    <Sparkles className="w-4 h-4 fill-current animate-pulse" />{" "}
                    Confirm Payment & Place Order
                  </button>
                  {paymentError && <div className="text-red-500 text-xs font-bold text-center mt-2 bg-red-50 p-2 rounded-lg border border-red-100">{paymentError}</div>}

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
