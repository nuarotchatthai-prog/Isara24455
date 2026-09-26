import React from 'react';
import { Home, Store as StoreIcon, ShoppingCart, User, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'feed' | 'shop' | 'tryon' | 'cart' | 'profile';
  onTabChange: (tab: 'feed' | 'shop' | 'tryon' | 'cart' | 'profile') => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070809]/95 backdrop-blur-lg border-t border-[#1f2429] px-2 py-1.5 transition-all">
      <div className="max-w-md mx-auto flex items-end justify-between relative">
        
        {/* 1. หน้าแรก */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'feed' ? 'text-white' : 'text-[#848a90] hover:text-[#cbb592]'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeTab === 'feed' ? 'scale-110 text-[#d4b588]' : ''}`} />
          <span className="text-[11px] mt-1 font-medium tracking-wide">หน้าแรก</span>
        </button>

        {/* 2. ร้านค้า */}
        <button
          onClick={() => onTabChange('shop')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'shop' ? 'text-white' : 'text-[#848a90] hover:text-[#cbb592]'
          }`}
        >
          <StoreIcon className={`w-5 h-5 transition-transform ${activeTab === 'shop' ? 'scale-110 text-[#d4b588]' : ''}`} />
          <span className="text-[11px] mt-1 font-medium tracking-wide">ร้านค้า</span>
        </button>

        {/* 3. ลองชุด (Uniformly sized with other icons, standout emerald & gold theme styling) */}
        <button
          onClick={() => onTabChange('tryon')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'tryon' ? 'text-white' : 'text-[#848a90] hover:text-[#cbb592]'
          }`}
          title="ลองชุดเสมือนจริงด้วย AI"
        >
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm ${
            activeTab === 'tryon'
              ? 'bg-gradient-to-tr from-[#1b3f2f] to-[#122b20] border-[#f5ebd9] text-[#f5ebd9] scale-105 shadow-[0_0_10px_rgba(203,181,146,0.5)]'
              : 'bg-gradient-to-tr from-[#142e22] to-[#0c1f17] border-[#cbb592]/80 text-[#d4b588] hover:border-[#cbb592]'
          }`}>
            {/* Custom Coat Hanger SVG */}
            <svg
              className={`w-4 h-4 transition-transform ${activeTab === 'tryon' ? 'scale-110 drop-shadow-[0_0_4px_rgba(247,230,201,0.8)]' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2 14v2h20v-2l-7.8-6.9c.5-.6.8-1.3.8-2.1a3 3 0 0 0-3-3z" />
              <path d="M2 16h20" />
            </svg>
          </div>
          <span className={`text-[11px] mt-0.5 font-semibold tracking-wide transition-colors ${
            activeTab === 'tryon' ? 'text-[#dfa24b]' : 'text-[#cbb592]'
          }`}>
            ลองชุด
          </span>
        </button>

        {/* 4. ตะกร้า */}
        <button
          onClick={() => onTabChange('cart')}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all ${
            activeTab === 'cart' ? 'text-white' : 'text-[#848a90] hover:text-[#cbb592]'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 transition-transform ${activeTab === 'cart' ? 'scale-110 text-[#d4b588]' : ''}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#e50914] text-white text-[10px] font-bold flex items-center justify-center border border-[#070809]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 font-medium tracking-wide">ตะกร้า</span>
        </button>

        {/* 5. โปรไฟล์ */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all ${
            activeTab === 'profile' ? 'text-white' : 'text-[#848a90] hover:text-[#cbb592]'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 text-[#d4b588]' : ''}`} />
            <Sparkles className="w-2.5 h-2.5 text-[#dfa24b] absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="text-[11px] mt-1 font-medium tracking-wide">โปรไฟล์</span>
        </button>

      </div>
    </nav>
  );
};
