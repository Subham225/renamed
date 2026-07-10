import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  ShieldCheck,
  Gift,
  Cake,
  Lock,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  X,
} from "lucide-react";
import { StoreConfig } from "../types";

interface FooterProps {
  storeConfig?: StoreConfig;
  onOpenPolicy?: (policy: 'terms' | 'privacy' | 'refund' | 'return' | 'shipping') => void;
}

export default function Footer({ storeConfig, onOpenPolicy }: FooterProps) {
  const [isFssaiModalOpen, setIsFssaiModalOpen] = useState(false);

  const socialLinks = storeConfig?.socialLinks || {};

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 px-4 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Narrative */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="ROCX Logo"
                className="w-16 h-16 object-contain brightness-110"
              />
              <h3 className="text-sm font-black text-white tracking-widest uppercase">
                ROCX CAKES & GIFTS
              </h3>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Leading premium baking & floristry craft in Kharagpur & Midnapore.
              Same-day artisanal designer cakes, fresh floral arrangements, and
              custom personalized gifts dispatched directly to your doorstep.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsFssaiModalOpen(true)}
                className="flex items-center gap-1.5 text-[10px] text-green-400 font-extrabold tracking-widest uppercase hover:text-green-300 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" /> FSSAI APPROVED
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-pink-400 font-bold tracking-wider mb-1"><span className="text-slate-400 font-medium">Owner:</span> Rajibul Ali Khan</p>
              <h4 className="text-white text-xs font-black uppercase tracking-wider">
                Official Contacts
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase font-black">
                    WhatsApp & Call
                  </span>
                  <span className="text-white font-mono hover:text-pink-400 transition-colors">
                    +91 6297337735
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase font-black">
                    Official Email
                  </span>
                  <span className="text-white font-mono hover:text-pink-400 transition-colors">
                    rocxcakes@gmail.com
                  </span>
                </div>
              </li>
            </ul>

            {/* Social Links from Config */}
            <div className="pt-3">
              <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-2">
                Connect With Us
              </h4>
              <div className="flex items-center gap-3">
                {!!socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-pink-500 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {!!socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {!!socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {!!socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {!!socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-sky-500 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {!!socialLinks.whatsapp && (
                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-green-500 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
                {!!socialLinks.pinterest && (
                  <a
                    href={socialLinks.pinterest}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="text-[10px] font-black border border-current rounded px-1">
                      Pin
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Our Offerings Info */}
          <div className="space-y-3 w-full">
            <h4 className="text-white text-xs font-black uppercase tracking-wider">
              Fast Delivery Offerings
            </h4>
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-black block">
                  ROCX Cakes Delivery Hub
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Cake Varieties, Designer & Custom Type of Cakes,
                  <br />
                  Fresh Flower Bouquets, 2-Hour Express Delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer base line */}
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <span>
            &copy; {new Date().getFullYear()} ROCX CAKES & GIFTS. All Rights
            Reserved.
          </span>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <a href="#terms" className="hover:text-slate-200 transition-colors">Terms & Conditions</a>
            <a href="#privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
            <a href="#shipping" className="hover:text-slate-200 transition-colors">Shipping Policy</a>
            <a href="#return" className="hover:text-slate-200 transition-colors">Return Policy</a>
            <a href="#refund" className="hover:text-slate-200 transition-colors">Refund Policy</a>
          </div>

          <span className="flex items-center gap-1">
            Made with{" "}
            <Heart className="w-3 h-3 text-pink-600 fill-pink-600 animate-pulse" />{" "}
            for Joyous Celebrations
          </span>
        </div>
      </footer>

      {/* FSSAI Modal */}
      {isFssaiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsFssaiModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-4 pt-4">
              <h3 className="text-lg font-black text-slate-900 line-clamp-1">
                FSSAI Registration
              </h3>
              <p className="text-xs text-slate-500 font-medium pb-2">
                We are authorized and approved by the Food Safety and Standards
                Authority of India.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-3 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-slate-150 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 w-28 shrink-0">
                    Registration ID
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    22026010000933
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-slate-150 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 w-28 shrink-0">
                    Fee Paid Upto
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    14-06-2027
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-slate-150 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 w-28 shrink-0">
                    Name
                  </span>
                  <span className="text-sm font-bold text-slate-800 leading-snug">
                    RAJIBUL ALI KHAN C/O Rocx Cakes & Gifts
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-slate-150 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 w-28 shrink-0">
                    Address
                  </span>
                  <span className="text-xs font-semibold text-slate-600 leading-relaxed">
                    Kharagpur, panchberia,word 04, mahabubnagar, West Bengal ,
                    Keshapur, Bahanaga, Baleshwar, Orissa - 721305
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 border-b border-slate-150 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 w-28 shrink-0">
                    KOB
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Retailer, Hawker [Itinerant / Mobile food vendor]
                  </span>
                </div>
                <div className="flex flex-row justify-between items-center pt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400">
                      Issuing Authority
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Baleshwar
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black uppercase text-slate-400">
                      Issued On
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      15-06-2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
