import React, { useState } from 'react';
import { X, ChevronDown, Facebook, Instagram, Twitter, Mail } from 'lucide-react';

interface SidebarMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenTrack: () => void;
  onOpenCustomer: () => void;
  onSelectCategory?: (id: string) => void;
}

const MENU_ITEMS = [
  {
    title: 'CAKES',
    id: 'cakes',
    subCategories: [
      { id: 'cakes', name: 'All Cakes' },
      { id: 'photo_cake', name: 'Photo Cakes' },
      { id: 'bento_cake', name: 'Bento Cakes' },
      { id: 'pinata_cake', name: 'Pinata Cakes' },
      { id: 'kids_cake', name: 'Kids Cakes' },
    ]
  },
  {
    title: 'FLOWERS',
    id: 'flowers',
    subCategories: [
      { id: 'flowers', name: 'All Flowers' },
    ]
  },
  {
    title: 'COMBOS',
    id: 'combos',
    subCategories: [
      { id: 'combos', name: 'All Combos' },
      { id: 'flower_combos', name: 'Flower Combos' },
      { id: 'cake_combos', name: 'Cake Combos' },
      { id: 'chocolate_flower', name: 'Chocolate & Flower' },
      { id: 'personalised_combos', name: 'Personalised Combos' },
    ]
  },
  {
    title: 'PLANTS',
    id: 'plants',
  },
  {
    title: 'GIFTS & CHOCOLATES',
    id: 'gifts_chocolates',
    subCategories: [
      { id: 'gifts', name: 'All Gifts' },
      { id: 'personalized_gifts', name: 'Personalized Gifts' },
      { id: 'chocolates', name: 'Chocolates' },
      { id: 'special_chocolate', name: 'Special Chocolate' },
    ]
  },
  {
    title: 'SPECIAL OCCASIONS',
    id: 'occasions',
    subCategories: [
      { id: 'anniversary', name: 'Anniversary' },
      { id: 'fathers_day', name: "Father's Day" },
      { id: 'mothers_day', name: "Mother's Day" },
      { id: 'teachers_day', name: "Teacher's Day" },
      { id: 'valentine_day', name: "Valentine's Day" },
      { id: 'xmas', name: 'Christmas' },
    ]
  },
  {
    title: 'SAME DAY DELIVERY',
    id: 'two_hours_delivery'
  }
];

export default function SidebarMenuDrawer({ isOpen, onClose, onNavigate, onOpenProfile, onOpenTrack, onOpenCustomer, onSelectCategory }: SidebarMenuDrawerProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[100] w-[80%] max-w-sm bg-[#fcf6f6] shadow-2xl flex flex-col animate-slideInRight">
        {/* Header with Close Button only */}
        <div className="flex items-center justify-start p-4 border-b border-[#f5ecec]">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#f0e8e8] rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <div className="flex flex-col">
            
            {MENU_ITEMS.map((item) => (
              <div key={item.id} className="border-b border-[#f5ecec]">
                {item.subCategories ? (
                  <>
                    <button 
                      onClick={() => toggleCategory(item.id)}
                      className="w-full flex items-center justify-between py-4 px-6 hover:bg-[#f8f0f0] transition-colors text-left group"
                    >
                      <span className="font-bold text-[11px] text-[#555] uppercase tracking-widest group-hover:text-pink-600">{item.title}</span>
                      <ChevronDown className={`w-4 h-4 text-[#aaa] group-hover:text-pink-400 transition-transform ${expandedCategories.includes(item.id) ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedCategories.includes(item.id) && (
                      <div className="bg-[#f8f0f0] flex flex-col">
                        {item.subCategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => handleCategoryClick(sub.id)}
                            className="w-full py-3 px-10 text-left hover:bg-[#f0e8e8] transition-colors"
                          >
                            <span className="font-semibold text-[11px] text-[#666] tracking-wide">{sub.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={() => handleCategoryClick(item.id)}
                    className="w-full flex items-center justify-between py-4 px-6 hover:bg-[#f8f0f0] transition-colors text-left group"
                  >
                    <span className="font-bold text-[11px] text-[#555] uppercase tracking-widest group-hover:text-pink-600">{item.title}</span>
                  </button>
                )}
              </div>
            ))}

            <button onClick={() => { onOpenProfile(); onClose(); }} className="w-full flex items-center justify-between py-4 px-6 border-b border-[#f5ecec] hover:bg-[#f8f0f0] transition-colors text-left group">
              <span className="font-bold text-[11px] text-[#555] uppercase tracking-widest group-hover:text-pink-600">LOGIN / PROFILE</span>
            </button>

            <button onClick={() => { onOpenTrack(); onClose(); }} className="w-full flex items-center justify-between py-4 px-6 border-b border-[#f5ecec] hover:bg-[#f8f0f0] transition-colors text-left group">
              <span className="font-bold text-[11px] text-[#555] uppercase tracking-widest group-hover:text-pink-600">TRACK ORDER</span>
            </button>

            <button onClick={() => { onOpenCustomer(); onClose(); }} className="w-full flex items-center justify-between py-4 px-6 border-b border-[#f5ecec] hover:bg-[#f8f0f0] transition-colors text-left group">
              <span className="font-bold text-[11px] text-[#555] uppercase tracking-widest group-hover:text-pink-600">CUSTOMER CARE</span>
            </button>
            
            <div className="py-6 px-6">
              <span className="font-bold text-[11px] text-[#555] uppercase tracking-widest flex items-center gap-2 mb-4"><Mail className="w-4 h-4" /> NEWSLETTER</span>
              <div className="flex items-center gap-4 text-[#888]">
                 <button className="hover:text-pink-600 transition-colors"><Facebook className="w-4 h-4" /></button>
                 <button className="hover:text-pink-600 transition-colors"><Instagram className="w-4 h-4" /></button>
                 <button className="hover:text-pink-600 transition-colors"><Twitter className="w-4 h-4" /></button>
                 <button className="hover:text-pink-600 transition-colors"><Mail className="w-4 h-4" /></button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
