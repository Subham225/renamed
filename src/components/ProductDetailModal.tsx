import React, { useState, useRef } from 'react';
import { X, Check, Star, Truck, Zap, Moon, Sparkles, Upload } from 'lucide-react';
import { Product, CartItem, getWeightPrice, getEgglessOffset, compressImageFile, isBentoCakeProduct, sortWeights } from '../types';
import { ACCESSORY_ADDONS } from '../data';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  // Custom configuration states
  const [weight, setWeight] = useState<string>('1.0 Kg');
  const [isEggless, setIsEggless] = useState<boolean>(false);
  const [selectedPot, setSelectedPot] = useState<string>('Mint Ceramic');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<CartItem['deliveryType']>('standard');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (product) {
      const baseWeights = product.allowedWeights && product.allowedWeights.length > 0
        ? product.allowedWeights
        : isBentoCakeProduct(product)
          ? ['250g']
          : (product.id.includes('photo') || product.name.toLowerCase().includes('photo'))
            ? ['0.5 Kg', '1.0 Kg']
            : ['0.5 Kg', '1.0 Kg', '1.5 Kg', '2.0 Kg', '2.5 Kg', '3.0 Kg'];
      const defaultWeights = sortWeights(baseWeights);
      setWeight(defaultWeights[0]);
      setIsEggless(false);
      setSelectedPot('Mint Ceramic');
      setCustomMessage('');
      setPhotoUrl('');
      setDeliveryType('standard');
      setSelectedAddonIds([]);
    }
  }, [product]);

  if (!product) return null;

  // Filter addons based on item definition or default to all 10 accessories
  const availableAddons = React.useMemo(() => {
    if (product.addonProductIds && product.addonProductIds.length > 0) {
      return ACCESSORY_ADDONS.filter(item => product.addonProductIds?.includes(item.id));
    }
    // Only suggest celebration addons if product belongs to cakes or combos
    const isCakeOrCombo = product.category === 'cakes' || isBentoCakeProduct(product) || product.category === 'combos';
    if (isCakeOrCombo) {
      return ACCESSORY_ADDONS;
    }
    return [];
  }, [product, product.addonProductIds]);

  // Determine weight options list
  const baseCurrentWeights = product.allowedWeights && product.allowedWeights.length > 0
    ? product.allowedWeights
    : isBentoCakeProduct(product)
      ? ['250g']
      : (product.id.includes('photo') || product.name.toLowerCase().includes('photo'))
        ? ['0.5 Kg', '1.0 Kg']
        : ['0.5 Kg', '1.0 Kg', '1.5 Kg', '2.0 Kg', '2.5 Kg', '3.0 Kg'];
  const currentWeights = sortWeights(baseCurrentWeights);

  // Calculate dynamic configured price
  let configuredPrice = product.price;
  if (isBentoCakeProduct(product)) {
    configuredPrice = isEggless ? 350 : 299;
  } else {
    if (product.options?.hasWeightOptions) {
      configuredPrice = getWeightPrice(product, weight);
    }
    if (product.options?.hasEgglessOption && isEggless) {
      configuredPrice += getEgglessOffset(weight, product);
    }
  }
  if (deliveryType === 'express') {
    configuredPrice += 150;
  } else if (deliveryType === 'midnight') {
    configuredPrice += 250;
  }

  // Reliable compressed photo load for persistent sharing
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
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
  };

  // Submission
  const handleAddClick = () => {
    // Generate a unique ID for this specific configured variation
    const configId = `${product.id}_w:${weight}_e:${isEggless}_p:${selectedPot}_d:${deliveryType}_msg:${customMessage.substring(0, 10)}_img:${photoUrl ? 'yes' : 'no'}`;
    
    // Add primary product
    onAddToCart({
      id: configId,
      product,
      quantity: 1,
      selectedWeight: product.options?.hasWeightOptions ? weight : undefined,
      isEggless: product.options?.hasEgglessOption ? isEggless : undefined,
      selectedPot: product.options?.hasPotOptions ? selectedPot : undefined,
      customMessage: product.options?.hasMessageOption ? customMessage : undefined,
      uploadedPhotoUrl: photoUrl || undefined,
      deliveryType,
    });

    // Add accessory addons
    selectedAddonIds.forEach((addonId) => {
      const addonProd = ACCESSORY_ADDONS.find(a => a.id === addonId);
      if (addonProd) {
        onAddToCart({
          id: `${addonProd.id}_addon_by_${product.id}`,
          product: addonProd,
          quantity: 1,
          deliveryType: 'standard'
        });
      }
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Centered modal element */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Close Header button */}
          <div className="absolute right-4 top-4 z-10">
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Visual Column */}
            <div className="relative bg-slate-50 p-6 flex flex-col justify-center items-center">
              <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-white object-center"
                />
              </div>
              <div className="w-full mt-4 bg-white/80 border border-slate-100 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Configure Price</span>
                  <p className="text-xl font-black text-slate-950">₹{configuredPrice}</p>
                </div>
                <div className="bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg px-2.5 py-1 uppercase">
                  Available Today
                </div>
              </div>
            </div>

            {/* Customizer form column */}
            <div className="p-6 overflow-y-auto max-h-[85vh] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black tracking-wider text-pink-600 uppercase bg-pink-50 px-2 py-0.5 rounded-md">
                    {product.category.replace('_', ' ')}
                  </span>
                  {product.options?.hasEgglessOption && (
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full select-none shrink-0">
                      <div className="w-2.5 h-2.5 border border-emerald-600 flex items-center justify-center rounded-xs bg-white shrink-0">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                      </div>
                      <span className="text-[9px] font-black tracking-wide text-emerald-800 uppercase leading-none">
                        {isEggless ? 'Certified 100% Eggless' : '100% Eggless Option'}
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mt-2 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mb-4">
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400">({product.reviewsCount} verified clients)</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium whitespace-pre-wrap">
                  {product.description}
                </p>
                {/* --- CAKES CONFIGURATION FORM --- */}
                {product.options?.hasWeightOptions && (
                  <div className="mb-5 space-y-2">
                    <span className="text-xs font-bold text-slate-800">Select Cake Size</span>
                    <div className="grid grid-cols-3 gap-2">
                      {currentWeights.map((w) => (
                        <button
                          id={`weight-option-${w.replace(' ', '')}`}
                          key={w}
                          onClick={() => setWeight(w)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            weight === w
                              ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm shadow-pink-100'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-extrabold">{w}</div>
                          <span className="text-[9.2px] font-black text-pink-600 block">
                            ₹{isBentoCakeProduct(product) ? (isEggless ? 350 : 299) : getWeightPrice(product, w)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.options?.hasEgglessOption && (
                  <div className="mb-5">
                    <label className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-xl p-3 cursor-pointer hover:bg-slate-100/50 transition-colors">
                      <input
                        id="eggless-checkbox"
                        type="checkbox"
                        checked={isEggless}
                        onChange={(e) => setIsEggless(e.target.checked)}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 block">Make it 100% Eggless</span>
                        <span className="text-[10px] text-slate-400">Baked in pure separate veg ovens (+ ₹{isBentoCakeProduct(product) ? 51 : 50} extra)</span>
                      </div>
                    </label>
                  </div>
                )}

                {/* --- POT SELECTION FOR PLANTS --- */}
                {product.options?.hasPotOptions && (
                  <div className="mb-5 space-y-2">
                    <span className="text-xs font-bold text-slate-800">Choose Eco Planter Pot</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['Mint Ceramic', 'Slate Clay', 'Eco Pulp'].map((pot) => (
                        <button
                          id={`pot-option-${pot.replace(' ', '')}`}
                          key={pot}
                          onClick={() => setSelectedPot(pot)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedPot === pot
                              ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm shadow-pink-100'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- GREETING CARD --- */}
                {product.options?.hasMessageOption && (
                  <div className="mb-5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Add Greeting Message Card</span>
                      <span className="text-[10px] text-slate-400">Free Card</span>
                    </div>
                    <textarea
                      id="greeting-textarea"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="E.g. Happy Anniversary Mom & Dad! Much love."
                      rows={2}
                      maxLength={180}
                      className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* --- DELIVERY SPEED SCHEDULING --- */}
                <div className="space-y-2 mb-6">
                  <span className="text-xs font-bold text-slate-800">Choose Delivery Speed</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      id="delivery-type-standard"
                      onClick={() => setDeliveryType('standard')}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer text-left transition-all ${
                        deliveryType === 'standard'
                          ? 'border-pink-500 bg-pink-50/50 text-pink-950'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-800">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">Standard Free Delivery</span>
                          <span className="text-[10px] text-slate-400">Delivered within regular transit slots</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 block">FREE</span>
                    </button>

                    <button
                      id="delivery-type-express"
                      onClick={() => setDeliveryType('express')}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer text-left transition-all ${
                        deliveryType === 'express'
                          ? 'border-pink-500 bg-pink-50/50 text-pink-950'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-800">
                          <Zap className="w-4 h-4 fill-current" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">Same-Day Express Courier</span>
                          <span className="text-[10px] text-slate-400">Fast priority dispatch service slot</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 block">+ ₹150</span>
                    </button>

                    <button
                      id="delivery-type-midnight"
                      onClick={() => setDeliveryType('midnight')}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer text-left transition-all ${
                        deliveryType === 'midnight'
                          ? 'border-pink-500 bg-pink-50/50 text-pink-950'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-800">
                          <Moon className="w-4 h-4 " />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">Spooky Midnight Surprise</span>
                          <span className="text-[10px] text-slate-400">Delivered exactly between 11:30 PM & 12:00 AM</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 block">+ ₹250</span>
                    </button>
                  </div>
                </div>

                {/* --- RECOMMENDED CELEBRATION ADDONS SLIDER --- */}
                {availableAddons.length > 0 && (
                  <div className="mb-6 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-pink-50 pb-1">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                        🎉 Add Extra Celebration Add-ons
                      </span>
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase">
                        Slide ({availableAddons.length})
                      </span>
                    </div>
                    
                    <div className="flex overflow-x-auto gap-3 pb-2 pt-1 -mx-2 px-2 scrollbar-thin snap-x snap-mandatory">
                      {availableAddons.map((addon) => {
                        const isSelected = selectedAddonIds.includes(addon.id);
                        return (
                          <div 
                            key={addon.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedAddonIds(prev => prev.filter(id => id !== addon.id));
                              } else {
                                setSelectedAddonIds(prev => [...prev, addon.id]);
                              }
                            }}
                            className={`flex-none w-[110px] snap-start border rounded-xl p-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-pink-500 bg-pink-50/40 text-pink-950 shadow-sm shadow-pink-100'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 mb-1.5 border border-slate-100">
                              <img 
                                src={addon.image} 
                                alt={addon.name} 
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                                  <div className="bg-pink-600 text-white rounded-full p-1 shadow">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-[9.2px] font-bold text-slate-800 leading-tight line-clamp-2 min-h-[24px]">
                              {addon.name}
                            </p>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-50">
                              <span className="text-[10px] font-black text-slate-900">₹{addon.price}</span>
                              <span className={`text-[8px] font-black uppercase px-1 rounded ${
                                isSelected ? 'bg-pink-600 text-white' : 'text-pink-600 bg-pink-50'
                              }`}>
                                {isSelected ? 'Added' : 'Add'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  id="add-to-cart-drawer-btn"
                  onClick={handleAddClick}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current animate-pulse" /> Add to Celebration Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
