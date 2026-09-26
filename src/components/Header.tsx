import React, { useState } from 'react';
import { Search, Bell, Radio, Shield, Sparkles, X, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  activeTab: 'feed' | 'shop' | 'tryon' | 'cart' | 'profile';
  shopSubTab?: 'stores' | 'products' | 'private_sale';
  onSearchClick: () => void;
  onLiveClick: () => void;
  onNotificationClick: () => void;
  onAdminClick: () => void;
  notificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  shopSubTab,
  onSearchClick,
  onLiveClick,
  onNotificationClick,
  onAdminClick,
  notificationCount
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0b0d0e]/95 backdrop-blur-md border-b border-[#22272b] px-4 py-2 transition-all">
      <div className="relative max-w-md mx-auto h-12 flex items-center justify-between">
        
        {/* Left Action / Search or Admin */}
        <div className="flex items-center gap-1.5 z-10 min-w-[70px]">
          {activeTab === 'feed' ? (
            <button
              onClick={onSearchClick}
              className="p-2 text-[#d4b588] hover:text-white transition-colors rounded-full hover:bg-white/5 active:scale-95"
              title="ค้นหาสินค้าและร้านค้า"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#142e22] text-[#cbb592] border border-[#cbb592]/30 hover:border-[#cbb592] transition-all active:scale-95 shadow-sm"
              title="ระบบจัดการหลังบ้าน"
            >
              <Shield className="w-3.5 h-3.5 text-[#cbb592]" />
              <span>หลังบ้าน</span>
            </button>
          )}
        </div>

        {/* Center Logo: ISARA - Strictly Mathematically & Visually Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-auto select-none">
          <h1 className="font-serif-luxury text-2xl sm:text-[26px] font-bold tracking-[0.22em] pl-[0.22em] gold-gradient-text drop-shadow leading-none">
            ISARA
          </h1>
          <span className="text-[8px] tracking-[0.26em] pl-[0.26em] text-[#a49b8a] uppercase mt-1 font-medium leading-none">
            Style For Every You
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-1.5 z-10 min-w-[70px]">
          {/* Live Button */}
          <button
            onClick={onLiveClick}
            className="group flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e50914] text-white font-semibold text-xs shadow-lg shadow-red-950/40 hover:bg-red-600 transition-all active:scale-95 animate-pulse"
            title="รับชม ISARA Fashion LIVE"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="tracking-wider text-[11px] font-bold">LIVE</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-[#cbb592] hover:text-white transition-colors rounded-full hover:bg-white/5 active:scale-95"
            title="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#dfa24b] border border-[#0b0d0e]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
