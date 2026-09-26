import React, { useState } from 'react';
import { X, Star, Users, MessageCircle, Tag, ShoppingBag, Sparkles, Heart, Check, Send, Flame } from 'lucide-react';
import { Store, Product } from '../types';

interface BrandStoreModalProps {
  store: Store | null;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onDirectTryOn: (product: Product) => void;
  onToggleFollow: (storeId: string) => void;
}

export const BrandStoreModal: React.FC<BrandStoreModalProps> = ({
  store,
  onClose,
  products,
  onAddToCart,
  onDirectTryOn,
  onToggleFollow
}) => {
  if (!store) return null;

  const [activeTab, setActiveTab] = useState<'products' | 'chat'>('products');
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'new'>('all');
  const [chatMessages, setChatMessages] = useState<string[]>([
    `สวัสดีครับ ยินดีต้อนรับสู่ร้านค้าทางการ ${store.name} บน ISARA สอบถามเรื่องขนาดสินค้าหรือการลองชุด AI ได้เลยครับ!`
  ]);
  const [inputChat, setInputChat] = useState('');
  const [claimedVouchers, setClaimedVouchers] = useState<Set<string>>(new Set());

  let storeProducts = products.filter(p => p.brandId === store.id || p.brand.toLowerCase() === store.name.toLowerCase());

  // Filter by 'ได้รับความนิยม' (Popular) or 'สินค้ามาใหม่' (New Arrivals)
  if (filterType === 'popular') {
    storeProducts = [...storeProducts].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  } else if (filterType === 'new') {
    storeProducts = [...storeProducts].sort((a, b) => {
      const aIsNew = a.tags?.some(t => t.includes('ใหม่')) ? 1 : 0;
      const bIsNew = b.tags?.some(t => t.includes('ใหม่')) ? 1 : 0;
      if (bIsNew !== aIsNew) return bIsNew - aIsNew;
      return parseInt(b.id.replace(/\D/g, '') || '0') - parseInt(a.id.replace(/\D/g, '') || '0');
    });
  }

  const handleClaim = (code: string) => {
    setClaimedVouchers(prev => new Set(prev).add(code));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setChatMessages(prev => [...prev, `ฉัน: ${inputChat.trim()}`]);
    const userQ = inputChat;
    setInputChat('');
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        `${store.name} Support: ขอบคุณที่สนใจครับ! สินค้าชิ้นนี้มีในสต็อกพร้อมส่ง และสามารถกด "ลองชุด" ด้วยระบบ AI ได้ทันทีครับ`
      ]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-[88vh] bg-[#0e1114] border border-[#273038] sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* Cover Image & Close */}
        <div className="relative h-44 bg-black">
          <img src={store.coverImage} alt={store.name} className="w-full h-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1114] via-transparent to-black/60" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Store Logo & Meta */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl border-2 border-[#cbb592] flex items-center justify-center">
                <img src={store.logo} alt={store.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-left text-white">
                <h3 className="font-bold text-base tracking-wider uppercase drop-shadow">
                  {store.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#dcd4c3]">
                  <span className="flex items-center text-[#dfa24b] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                    {store.rating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{store.followersCount.toLocaleString()} ผู้ติดตาม</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onToggleFollow(store.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow ${
                store.isFollowing
                  ? 'bg-[#1b252b] text-[#cbb592] border border-[#38444e]'
                  : 'bg-[#18392b] text-white border border-[#cbb592] hover:bg-[#204a38]'
              }`}
            >
              {store.isFollowing ? 'กำลังติดตาม' : '+ ติดตาม'}
            </button>
          </div>
        </div>

        {/* Store Navigation: [สินค้า] [แชทร้านค้า] */}
        <div className="flex border-b border-[#21272e] bg-[#121619] px-4 pt-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'products' ? 'border-[#cbb592] text-[#cbb592]' : 'border-transparent text-gray-400'
            }`}
          >
            สินค้าทั้งหมด ({storeProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chat' ? 'border-[#cbb592] text-[#cbb592]' : 'border-transparent text-gray-400'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>แชทกับร้านค้า</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {activeTab === 'products' ? (
            <>
              {/* Store Vouchers */}
              {store.vouchers && store.vouchers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#cbb592] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    คูปองส่วนลดพิเศษของร้าน
                  </span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {store.vouchers.map(v => {
                      const isClaimed = claimedVouchers.has(v.code);
                      return (
                        <div key={v.code} className="bg-[#182025] p-2.5 rounded-2xl border border-[#2d3842] min-w-[210px] flex items-center justify-between text-left">
                          <div>
                            <span className="text-xs font-bold text-white block">{v.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">โค้ด: {v.code}</span>
                          </div>
                          <button
                            onClick={() => handleClaim(v.code)}
                            disabled={isClaimed}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              isClaimed 
                                ? 'bg-transparent text-gray-400 border border-gray-600' 
                                : 'bg-[#18392b] text-white border border-[#cbb592]'
                            }`}
                          >
                            {isClaimed ? 'เก็บแล้ว' : 'เก็บโค้ด'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter Tabs: ได้รับความนิยม & สินค้ามาใหม่ */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setFilterType(prev => prev === 'popular' ? 'all' : 'popular')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    filterType === 'popular'
                      ? 'bg-gradient-to-r from-[#e50914] to-[#ff5722] text-white border border-red-300 shadow-md'
                      : 'bg-[#182025] text-[#e0a96d] border border-[#2c3740] hover:border-[#dfa24b]'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${filterType === 'popular' ? 'fill-white text-white' : 'text-orange-400'}`} />
                  <span>ได้รับความนิยม</span>
                </button>

                <button
                  onClick={() => setFilterType(prev => prev === 'new' ? 'all' : 'new')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    filterType === 'new'
                      ? 'bg-gradient-to-r from-[#18392b] to-[#122e22] text-[#f5ebd9] border border-[#cbb592] shadow-md'
                      : 'bg-[#182025] text-[#cbb592] border border-[#2c3740] hover:border-[#cbb592]'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${filterType === 'new' ? 'text-[#dfa24b]' : 'text-[#cbb592]'}`} />
                  <span>สินค้ามาใหม่</span>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {storeProducts.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-[#14191d] border border-[#232b32] overflow-hidden flex flex-col justify-between p-2">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black mb-2">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => onDirectTryOn(p)}
                        className="absolute bottom-2 inset-x-2 py-1 rounded-full bg-[#18392b]/90 text-[#f5ebd9] text-[10px] font-bold flex items-center justify-center gap-1 border border-[#cbb592]/60"
                      >
                        <Sparkles className="w-3 h-3 text-[#cbb592]" />
                        <span>ลองชุด</span>
                      </button>
                    </div>

                    <h5 className="text-xs font-bold text-white truncate text-left">{p.name}</h5>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#d4b588]">฿{p.price.toLocaleString()}</span>
                      <button
                        onClick={() => onAddToCart(p)}
                        className="p-1 rounded-lg bg-[#1c242a] text-[#cbb592] hover:bg-[#18392b] border border-[#2e3a44]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Live Chat with Shop */
            <div className="h-full flex flex-col justify-between space-y-3">
              <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-2xl text-xs max-w-[85%] text-left ${
                    msg.startsWith('ฉัน:') ? 'ml-auto bg-[#18392b] text-white' : 'bg-[#182025] text-gray-200 border border-[#2b353e]'
                  }`}>
                    {msg}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-[#222930]">
                <input
                  type="text"
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  placeholder="พิมพ์ข้อความคุยกับพนักงานร้าน..."
                  className="flex-1 bg-[#151a1e] border border-[#2a343d] rounded-full px-4 py-2.5 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputChat.trim()}
                  className="p-2.5 rounded-full bg-[#18392b] text-[#cbb592] border border-[#cbb592]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
