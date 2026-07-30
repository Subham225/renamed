import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { Location } from '../types';

interface LocationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: Location;
  onSelectLocation: (location: Location) => void;
}

export default function LocationDrawer({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationDrawerProps) {
  const [customPincode, setCustomPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  if (!isOpen) return null;

  const handleCustomPincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(customPincode)) {
      setPincodeError('Please enter a valid 6-digit Indian Pincode');
      return;
    }
    
    onSelectLocation({
      city: '',
      pincode: customPincode,
    });
    setPincodeError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-left">
                <MapPin className="w-5 h-5 text-amber-500 fill-amber-100" />
                Delivery Pincode
              </h2>
              <button
                id="close-location-btn"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 p-1 bg-white hover:bg-slate-100 border border-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content section */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Enter 6-digit Pincode Form */}
              <form id="pincode-form" onSubmit={handleCustomPincodeSubmit} className="space-y-4 text-left mt-8">
                <div className="text-center pb-4">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Check Delivery</h3>
                  <p className="text-xs text-slate-500 mt-1">Enter your 6-digit pincode to verify delivery availability in your area.</p>
                </div>
                <div className="flex gap-2">
                  <input
                    id="custom-pincode-input"
                    type="text"
                    maxLength={6}
                    value={customPincode}
                    onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="E.g. 700001"
                    className="flex-1 text-base font-black p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest text-center"
                  />
                </div>
                {pincodeError && (
                  <span className="text-[11px] text-red-500 font-bold block text-center pt-2">{pincodeError}</span>
                )}
                <button
                  id="save-pincode-btn"
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-sm uppercase px-5 py-4 rounded-xl transition-colors cursor-pointer mt-4"
                >
                  Verify Pincode
                </button>
              </form>

            </div>

            {/* Drawer Info Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-left text-xs text-slate-500 space-y-2 font-semibold">
              <p>📍 Rocx Cakes serves multiple pincodes with same-day express delivery lines.</p>
              <p>🚗 Checking pincode ahead ensures safe, fresh delivery commitments for your address.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
