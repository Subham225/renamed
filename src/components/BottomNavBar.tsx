import { Home, Grid, MapPin, User, Search, PhoneCall } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCustomer: () => void;
  onOpenTrack: () => void;
  onOpenProfile: () => void;
}

export default function BottomNavBar({
  activeTab,
  onTabChange,
  onOpenCustomer,
  onOpenTrack,
  onOpenProfile,
}: BottomNavBarProps) {
  // Tabs and icon mappings from the provided screenshot:
  // 1. Home (active), 2. Categories, 3. City, 4. Profile, 5. Track Order, 6. Customer care
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-center">
        
        {/* Home */}
        <button
          id="bottom-tab-home"
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center gap-1 cursor-pointer py-1 ${
            activeTab === 'home' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-black tracking-tight">Home</span>
        </button>

        {/* Categories */}
        <button
          id="bottom-tab-categories"
          onClick={() => {
            onTabChange('categories');
            const element = document.getElementById('category-grid-anchor');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          className={`flex-1 flex flex-col items-center gap-1 cursor-pointer py-1 ${
            activeTab === 'categories' ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-black tracking-tight">Categories</span>
        </button>

        {/* Profile */}
        <button
          id="bottom-tab-profile"
          onClick={onOpenProfile}
          className="flex-1 flex flex-col items-center gap-1 cursor-pointer py-1 text-slate-400 hover:text-slate-600"
        >
          <User className="w-5 h-5 text-indigo-500" />
          <span className="text-[10px] font-black tracking-tight text-slate-700">Profile</span>
        </button>

        {/* Track Order */}
        <button
          id="bottom-tab-track"
          onClick={onOpenTrack}
          className="flex-1 flex flex-col items-center gap-1 cursor-pointer py-1 text-slate-400 hover:text-slate-600"
        >
          <Search className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-black tracking-tight text-slate-700">Track Order</span>
        </button>

        {/* Customer Care */}
        <button
          id="bottom-tab-customer"
          onClick={onOpenCustomer}
          className="flex-1 flex flex-col items-center gap-1 cursor-pointer py-1 text-slate-400 hover:text-slate-600"
        >
          <PhoneCall className="w-5 h-5 text-blue-500" />
          <span className="text-[10px] font-black tracking-tight text-slate-700">Support</span>
        </button>

      </div>
    </div>
  );
}
