import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Store,
  FileText,
  Landmark,
  MapPin,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface SellerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellerPanel({ isOpen, onClose }: SellerPanelProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phone: "",
    altPhone: "",
    businessName: "",
    businessTypes: ["Bakery"],
    otherBusinessType: "",

    address: "",
    city: "",
    pincode: "",
    state: "West Bengal",

    panNumber: "",
    aadharNumber: "",
    fssaiLicense: "",

    bankAccountName: "",
    bankAccountNumber: "",
    ifscCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset state on open
      setStep(1);
      setIsSuccess(false);
      setFormData({
        ownerName: "",
        email: "",
        phone: "",
        altPhone: "",
        businessName: "",
        businessTypes: ["Bakery"],
        otherBusinessType: "",
        address: "",
        city: "",
        pincode: "",
        state: "West Bengal",
        panNumber: "",
        aadharNumber: "",
        fssaiLicense: "",
        bankAccountName: "",
        bankAccountNumber: "",
        ifscCode: "",
      });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.ownerName) newErrors.ownerName = "Required";
      if (!formData.email) newErrors.email = "Required";
      if (!formData.phone) newErrors.phone = "Required";
      if (!formData.businessName) newErrors.businessName = "Required";
      if (!formData.businessTypes || formData.businessTypes.length === 0)
        newErrors.businessTypes = "Please select at least one type";
      if (
        formData.businessTypes?.includes("Others") &&
        !formData.otherBusinessType
      )
        newErrors.otherBusinessType = "Required";
    } else if (step === 2) {
      if (!formData.address) newErrors.address = "Required";
      if (!formData.city) newErrors.city = "Required";
      if (!formData.pincode) newErrors.pincode = "Required";
    } else if (step === 3) {
      if (!formData.panNumber) newErrors.panNumber = "Required";
      if (!formData.aadharNumber) newErrors.aadharNumber = "Required";
      // fssai optional
    } else if (step === 4) {
      if (!formData.bankAccountName) newErrors.bankAccountName = "Required";
      if (!formData.bankAccountNumber) newErrors.bankAccountNumber = "Required";
      if (!formData.ifscCode) newErrors.ifscCode = "Required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalData: any = { ...formData };
      if (
        finalData.businessTypes.includes("Others") &&
        finalData.otherBusinessType
      ) {
        finalData.businessTypes = finalData.businessTypes.map((type: string) =>
          type === "Others" ? finalData.otherBusinessType : type,
        );
      }
      delete finalData.otherBusinessType;

      await addDoc(collection(db, "seller_applications"), {
        ...finalData,
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting seller form:", error);
      alert("Failed to submit form. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    setFormData({
      ownerName: "",
      email: "",
      phone: "",
      altPhone: "",
      businessName: "",
      businessTypes: ["Bakery"],
      otherBusinessType: "",
      address: "",
      city: "",
      pincode: "",
      state: "West Bengal",
      panNumber: "",
      aadharNumber: "",
      fssaiLicense: "",
      bankAccountName: "",
      bankAccountNumber: "",
      ifscCode: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl min-h-screen sm:min-h-[600px] sm:max-h-[90vh] rounded-none sm:rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-500 hover:text-slate-800 border border-slate-200 shadow-sm transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="w-full flex flex-col items-center justify-center p-10 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              Application Submitted Successfully!
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
              Thank you for registering your interest to sell with Rocx Cakes &
              Gifts. Our onboarding team will review your details and contact
              you shortly.
            </p>
            <button
              onClick={() => {
                setStep(1);
                setIsSuccess(false);
                setFormData({
                  ownerName: "",
                  email: "",
                  phone: "",
                  altPhone: "",
                  businessName: "",
                  businessTypes: ["Bakery"],
                  otherBusinessType: "",
                  address: "",
                  city: "",
                  pincode: "",
                  state: "West Bengal",
                  panNumber: "",
                  aadharNumber: "",
                  fssaiLicense: "",
                  bankAccountName: "",
                  bankAccountNumber: "",
                  ifscCode: "",
                });
                setErrors({});
              }}
              className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition shadow-lg cursor-pointer"
            >
              Fill Another Form
            </button>
          </div>
        ) : (
          <>
            {/* Sidebar Guidelines */}
            <div className="hidden md:flex w-[320px] bg-white border-r border-slate-200 p-6 sm:p-8 flex-col shrink-0">
              <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">
                How It Works
              </h2>

              <div className="relative border-l-2 border-slate-100 ml-3 space-y-10 pl-6 pb-4">
                <div className="relative">
                  <div
                    className={`absolute -left-[35px] w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black tracking-wide shadow-sm border-2 transition-colors ${step >= 1 ? "bg-rose-500 border-white text-white" : "bg-slate-100 border-white text-slate-400"}`}
                  >
                    1
                  </div>
                  <h3
                    className={`font-bold text-sm tracking-wide ${step >= 1 ? "text-slate-900" : "text-slate-400"}`}
                  >
                    Register
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Sign up with your business and contact details on Rocx
                    Cakes.
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[35px] w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black tracking-wide shadow-sm border-2 transition-colors ${step >= 2 ? "bg-rose-500 border-white text-white" : "bg-slate-100 border-white text-slate-400"}`}
                  >
                    2
                  </div>
                  <h3
                    className={`font-bold text-sm tracking-wide ${step >= 2 ? "text-slate-900" : "text-slate-400"}`}
                  >
                    Location Info
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tell us where you fulfill orders and operate from.
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[35px] w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black tracking-wide shadow-sm border-2 transition-colors ${step >= 3 ? "bg-rose-500 border-white text-white" : "bg-slate-100 border-white text-slate-400"}`}
                  >
                    3
                  </div>
                  <h3
                    className={`font-bold text-sm tracking-wide ${step >= 3 ? "text-slate-900" : "text-slate-400"}`}
                  >
                    Store Verification
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Our team reviews your application and verifies your store
                    documents.
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[35px] w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black tracking-wide shadow-sm border-2 transition-colors ${step >= 4 ? "bg-rose-500 border-white text-white" : "bg-slate-100 border-white text-slate-400"}`}
                  >
                    4
                  </div>
                  <h3
                    className={`font-bold text-sm tracking-wide ${step >= 4 ? "text-slate-900" : "text-slate-400"}`}
                  >
                    Start Selling
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    List products, receive orders, and grow with our gifting
                    platform.
                  </p>
                </div>
              </div>

              <div className="mt-auto hidden md:block pt-8 text-center text-slate-400 text-[10px]">
                Powered by Rocx Cakes & Gifts
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 bg-slate-50 flex flex-col h-full relative overflow-y-auto w-full">
              <div className="p-6 sm:p-10 pb-24 md:pb-10 max-w-2xl mx-auto w-full">
                <div className="mb-8 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Seller Registration Form
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Complete all 4 steps to register as a seller
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                  {/* Step 1: Contact & Business */}
                  {step === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                        <Store className="w-5 h-5 text-rose-500" />
                        <h2 className="text-lg font-black text-slate-800">
                          Contact & Business
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Owner/Contact Person Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.ownerName ? "border-red-400" : "border-slate-200"}`}
                            placeholder="Enter owner name"
                            value={formData.ownerName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ownerName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.email ? "border-red-400" : "border-slate-200"}`}
                            placeholder="seller@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.phone ? "border-red-400" : "border-slate-200"}`}
                            placeholder="+91 9876543210"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Alternate Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="+91 9876543210"
                            value={formData.altPhone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                altPhone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Business/Store Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.businessName ? "border-red-400" : "border-slate-200"}`}
                            placeholder="Enter your business name"
                            value={formData.businessName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                businessName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <label className="text-xs font-bold text-slate-700">
                          Business Type(s){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Bakery",
                            "Florist",
                            "Gift Shop",
                            "Handicrafts",
                            "Home Baker",
                            "Cake",
                            "Flower",
                            "Chocolate",
                            "Toys",
                            "Art",
                            "Others",
                          ].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                const current = formData.businessTypes || [];
                                setFormData({
                                  ...formData,
                                  businessTypes: current.includes(type)
                                    ? current.filter((t) => t !== type)
                                    : [...current, type],
                                });
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                (formData.businessTypes || []).includes(type)
                                  ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        {errors.businessTypes && (
                          <p className="text-xs text-red-500">
                            {errors.businessTypes}
                          </p>
                        )}
                      </div>

                      {(formData.businessTypes || []).includes("Others") && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="text-xs font-bold text-slate-700">
                            Specify Other Business Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.otherBusinessType ? "border-red-400" : "border-slate-200"}`}
                            placeholder="Please specify..."
                            value={formData.otherBusinessType || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                otherBusinessType: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Location */}
                  {step === 2 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                        <MapPin className="w-5 h-5 text-rose-500" />
                        <h2 className="text-lg font-black text-slate-800">
                          Store Location
                        </h2>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Complete Address{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white resize-none h-20 ${errors.address ? "border-red-400" : "border-slate-200"}`}
                          placeholder="Shop / House No, Street, Landmark"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.city ? "border-red-400" : "border-slate-200"}`}
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.pincode ? "border-red-400" : "border-slate-200"}`}
                            placeholder="Enter 6-digit pincode"
                            value={formData.pincode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pincode: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Documents */}
                  {step === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                        <FileText className="w-5 h-5 text-rose-500" />
                        <h2 className="text-lg font-black text-slate-800">
                          Verification Details
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            PAN Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition uppercase bg-slate-50 focus:bg-white ${errors.panNumber ? "border-red-400" : "border-slate-200"}`}
                            placeholder="ABCDE1234F"
                            value={formData.panNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                panNumber: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Aadhar Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.aadharNumber ? "border-red-400" : "border-slate-200"}`}
                            placeholder="0000 0000 0000"
                            value={formData.aadharNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                aadharNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          FSSAI / Trade License (Optional)
                        </label>
                        <input
                          type="text"
                          className="w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white border-slate-200"
                          placeholder="Registration Number"
                          value={formData.fssaiLicense}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fssaiLicense: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Bank Details */}
                  {step === 4 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                        <Landmark className="w-5 h-5 text-rose-500" />
                        <h2 className="text-lg font-black text-slate-800">
                          Bank Details
                        </h2>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Account Holder Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.bankAccountName ? "border-red-400" : "border-slate-200"}`}
                          placeholder="Name as per bank record"
                          value={formData.bankAccountName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bankAccountName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Account Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition bg-slate-50 focus:bg-white ${errors.bankAccountNumber ? "border-red-400" : "border-slate-200"}`}
                            placeholder="Enter A/C Number"
                            value={formData.bankAccountNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                bankAccountNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            IFSC Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition uppercase bg-slate-50 focus:bg-white ${errors.ifscCode ? "border-red-400" : "border-slate-200"}`}
                            placeholder="SBIN000XXXX"
                            value={formData.ifscCode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ifscCode: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                    {step > 1 ? (
                      <button
                        onClick={handlePrev}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition disabled:opacity-50"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    ) : (
                      <div></div>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-rose-200 transition active:scale-95 disabled:opacity-70 ml-auto"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : step === 4
                          ? "Submit Application"
                          : "Save and Next"}
                      {!isSubmitting && step < 4 && (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
