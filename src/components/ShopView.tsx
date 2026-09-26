import React, { useState } from 'react';
import { Search, Star, Heart, ShoppingBag, Sparkles, ChevronRight, Lock, Key, Flame, TrendingUp, Clock, RotateCw } from 'lucide-react';
import { Product, Store } from '../types';

interface ShopViewProps {
  products: Product[];
  stores: Store[];
  onSelectProduct: (product: Product) => void;
  onSelectStore: (store: Store) => void;
  onAddToCart: (product: Product) => void;
  onDirectTryOn: (product: Product) => void;
  onOpenPrivateSaleVoucher: (code: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  stores,
  onSelectProduct,
  onSelectStore,
  onAddToCart,
  onDirectTryOn,
  onOpenPrivateSaleVoucher
}) => {
  const [activeTab, setActiveTab] = useState<'stores' | 'products' | 'private_sale'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<'all' | 'women' | 'men' | 'kids' | 'mature'>('women');
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'new'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['prod-1', 'prod-3']));
  const [flippedProductIds, setFlippedProductIds] = useState<Record<string, boolean>>({});

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  // Filtered Products with Popular & New Arrivals logic
  let filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSub = selectedSubCategory === 'all' || p.subCategory === selectedSubCategory;

    // Filter by 'ได้รับความนิยม' (Popular: soldCount > 600 or 'ขายดี'/'ฮิต' tag)
    const matchesPopular = filterType !== 'popular' || 
      (p.soldCount && p.soldCount >= 600) || 
      p.tags?.some(t => t.includes('ขายดี') || t.includes('ฮิต') || t.includes('นิยม'));

    // Filter by 'สินค้ามาใหม่' (New Arrivals: 'ใหม่' tag or recent items)
    const matchesNew = filterType !== 'new' || 
      p.tags?.some(t => t.includes('ใหม่') || t.includes('2024') || t.includes('ลักชัวรี')) ||
      parseInt(p.id.replace(/\D/g, '') || '0') >= 5;

    return matchesSearch && matchesCat && matchesSub && matchesPopular && matchesNew;
  });

  // Sort results if Popular or New is selected
  if (filterType === 'popular') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  } else if (filterType === 'new') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const aIsNew = a.tags?.some(t => t.includes('ใหม่')) ? 1 : 0;
      const bIsNew = b.tags?.some(t => t.includes('ใหม่')) ? 1 : 0;
      if (bIsNew !== aIsNew) return bIsNew - aIsNew;
      return parseInt(b.id.replace(/\D/g, '') || '0') - parseInt(a.id.replace(/\D/g, '') || '0');
    });
  }

  return (
    <div className="w-full pb-28 max-w-md mx-auto px-3.5 pt-2">
      
      {/* Search Input Bar */}
      <div className="relative mb-3">
        <div className="flex items-center gap-2.5 bg-[#121619] border border-[#a68c63]/50 focus-within:border-[#cbb592] rounded-full px-4 py-2.5 shadow-inner">
          <Search className="w-4 h-4 text-[#cbb592]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'stores' ? 'ค้นหาร้านค้า...' : 'ค้นหาเสื้อผ้า, แบรนด์, สไตล์...'}
            className="bg-transparent text-xs w-full text-white placeholder-[#788189] outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Top Main Navigation Tabs: [ร้านค้า] [สินค้า] [PRIVATE SALE] */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Tab 1: ร้านค้า */}
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'stores'
              ? 'bg-[#f4eee4] text-[#0b0d0e] shadow-md font-bold'
              : 'bg-[#15191d] text-[#b0b8c0] border border-[#2b333a] hover:border-[#cbb592]/50'
          }`}
        >
          ร้านค้า
        </button>

        {/* Tab 2: สินค้า */}
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'products'
              ? 'bg-[#f4eee4] text-[#0b0d0e] shadow-md font-bold'
              : 'bg-[#15191d] text-[#b0b8c0] border border-[#2b333a] hover:border-[#cbb592]/50'
          }`}
        >
          สินค้า
        </button>

        {/* Tab 3: PRIVATE SALE */}
        <button
          onClick={() => setActiveTab('private_sale')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'private_sale'
              ? 'bg-gradient-to-r from-[#dfa24b] to-[#b88235] text-black font-bold shadow-md'
              : 'bg-[#15191d] text-[#dfa24b] border border-[#dfa24b]/40 hover:border-[#dfa24b]'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-[#dfa24b]" />
          <span>PRIVATE SALE</span>
        </button>
      </div>

      {/* 2 Interactive Clickable Icons: [🔥 ได้รับความนิยม] [✨ สินค้ามาใหม่] */}
      <div className="flex items-center gap-2 mb-3.5">
        <button
          onClick={() => {
            setActiveTab('products');
            setFilterType(prev => prev === 'popular' ? 'all' : 'popular');
          }}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
            filterType === 'popular' && activeTab === 'products'
              ? 'bg-gradient-to-r from-[#e50914] via-[#f44336] to-[#ff5722] text-white border border-red-300 shadow-lg shadow-red-900/40 scale-[1.02]'
              : 'bg-[#14181b] text-[#e0a96d] border border-[#2d3741] hover:border-[#dfa24b] hover:text-white'
          }`}
        >
          <Flame className={`w-4 h-4 ${filterType === 'popular' && activeTab === 'products' ? 'fill-white text-white animate-pulse' : 'text-orange-400'}`} />
          <span>ได้รับความนิยม</span>
          {filterType === 'popular' && activeTab === 'products' && (
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('products');
            setFilterType(prev => prev === 'new' ? 'all' : 'new');
          }}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
            filterType === 'new' && activeTab === 'products'
              ? 'bg-gradient-to-r from-[#1b3d2e] via-[#142e22] to-[#0c1f17] text-[#f5ebd9] border border-[#cbb592] shadow-lg shadow-emerald-950/50 scale-[1.02]'
              : 'bg-[#14181b] text-[#cbb592] border border-[#2d3741] hover:border-[#cbb592] hover:text-white'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${filterType === 'new' && activeTab === 'products' ? 'text-[#dfa24b] animate-spin' : 'text-[#cbb592]'}`} />
          <span>สินค้ามาใหม่</span>
          {filterType === 'new' && activeTab === 'products' && (
            <span className="w-2 h-2 rounded-full bg-[#dfa24b] animate-ping" />
          )}
        </button>
      </div>

      {/* Hero Banner: Couple in Beige Trench Coats (Matching Screenshots 3 & 4) */}
      <div 
        onClick={() => {
          setSelectedCategory('outerwear');
          setActiveTab('products');
        }}
        className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-5 border border-[#cbb592]/30 group cursor-pointer shadow-2xl"
      >
        <img
          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80"
          alt="NEW COLLECTION 2024"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-[#dfa24b] text-black text-[10px] font-black tracking-wider uppercase">
              NEW COLLECTION
            </span>
            <span className="text-[11px] font-semibold text-white drop-shadow">
              คอลเลกชันใหม่ 2024
            </span>
          </div>
          <p className="text-sm font-bold text-[#f7f2ea] mt-1 drop-shadow">
            สไตล์เรียบหรู ใส่ได้ทุกช่วงเวลา
          </p>
        </div>
      </div>

      {/* TAB 1: ร้านค้า (Screenshot 3 View) */}
      {activeTab === 'stores' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">
                ร้านค้าแนะนำ
              </h3>
              <span className="text-[#dfa24b] text-xs">⭐ ติดดาว</span>
            </div>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-[#a99980] hover:text-[#f4eee4] flex items-center"
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* 2x2 Grid of Official Stores (Cream/Ivory Cards matching Screenshot 3) */}
          <div className="grid grid-cols-2 gap-3.5">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="bg-[#f4efe6] text-[#111417] rounded-3xl p-4 flex flex-col items-center justify-between text-center cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[190px] border border-[#e2d5c0]"
              >
                {/* Brand Logo in Circle */}
                <div className="w-16 h-16 rounded-full bg-white shadow-md border border-[#dfd5c4] flex items-center justify-center p-2 mb-2">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Brand Name */}
                <h4 className="font-bold text-sm tracking-wider uppercase text-[#111417]">
                  {store.name}
                </h4>

                {/* Star Rating */}
                <div className="flex items-center gap-1 my-1">
                  <div className="flex text-[#dfa24b]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold font-mono text-[#2c3238]">
                    {store.rating.toFixed(1)}
                  </span>
                </div>

                {/* Brand Motto / Highlight */}
                <p className="text-[11px] text-[#555d66] font-medium leading-tight">
                  {store.highlight}
                </p>
              </div>
            ))}
          </div>

          {/* Featured Brand Banner */}
          <div className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-[#173024] to-[#0c1f17] border border-[#cbb592]/40 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#dfa24b] font-semibold tracking-wider">OFFICIAL ATELIER</span>
              <h4 className="text-sm font-bold text-[#f5ebd9]">ISARA Flagship Store</h4>
              <p className="text-xs text-[#a49b8a] mt-0.5">รวมคอลเลกชันสั่งตัดและบริการ AI ฟิตติ้ง</p>
            </div>
            <button 
              onClick={() => onSelectStore(stores[4] || stores[0])}
              className="px-3.5 py-1.5 rounded-full bg-[#f4efe6] text-black text-xs font-bold hover:bg-white"
            >
              เข้าชมร้าน
            </button>
          </div>
        </section>
      )}

      {/* TAB 2: สินค้า (Screenshot 4 View) */}
      {activeTab === 'products' && (
        <section className="space-y-4">
          
          {/* Horizontally Scrollable Category Badges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#a49b8a] font-medium">หมวดหมู่สินค้า ({products.length} ชิ้น)</span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] text-[#cbb592] hover:underline"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'ทั้งหมด', icon: '✦' },
                { id: 'hats', label: 'หมวก', icon: '👒' },
                { id: 'eyewear', label: 'แว่นตา', icon: '🕶️' },
                { id: 'jewelry', label: 'เครื่องประดับ', icon: '💎' },
                { id: 'dresses', label: 'ชุดเดรส', icon: '👗' },
                { id: 'tops', label: 'เสื้อ', icon: '👔' },
                { id: 'belts', label: 'เข็มขัด', icon: '🎗️' },
                { id: 'pants', label: 'กางเกง', icon: '👖' },
                { id: 'skirts', label: 'กระโปรง', icon: '🩳' },
                { id: 'outerwear', label: 'สูท/โค้ท', icon: '🧥' },
                { id: 'socks', label: 'ถุงเท้า', icon: '🧦' },
                { id: 'shoes', label: 'รองเท้า', icon: '👞' },
                { id: 'underwear', label: 'ชุดชั้นใน', icon: '👙' },
                { id: 'bags', label: 'กระเป๋า', icon: '👜' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border whitespace-nowrap text-xs transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#1b382b] border-[#cbb592] text-[#f5ebd9] font-bold shadow-md'
                        : 'bg-[#14181b] border-[#29323a] text-[#8e97a0] hover:border-[#cbb592]/50 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: สินค้าขายดี & Subcategory Filters (เด็ก, ผู้หญิง, ผู้ชาย, วัยสูงอายุ) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>
                  {filterType === 'popular' ? 'สินค้าได้รับความนิยม' : filterType === 'new' ? 'สินค้ามาใหม่ล่าสุด' : 'สินค้าคุณภาพ'}
                </span>
                {filterType === 'popular' ? (
                  <Flame className="w-4 h-4 text-orange-400 fill-current animate-pulse" />
                ) : filterType === 'new' ? (
                  <Sparkles className="w-4 h-4 text-[#dfa24b] animate-bounce" />
                ) : (
                  <Flame className="w-4 h-4 text-[#e50914] fill-red-500" />
                )}
                <span className="text-[11px] font-normal text-[#8e97a0]">
                  ({filteredProducts.length} รายการ)
                </span>
              </h3>
              {filterType !== 'all' ? (
                <button 
                  onClick={() => setFilterType('all')}
                  className="text-xs text-[#cbb592] hover:underline flex items-center gap-1 font-semibold"
                >
                  ✕ แสดงทั้งหมด
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                    setFilterType('all');
                  }}
                  className="text-xs text-[#a99980] hover:text-[#f4eee4] flex items-center"
                >
                  ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </div>

            {/* Sub-category Demographic Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'ทั้งหมดทุกวัย' },
                { id: 'women', label: 'ผู้หญิง' },
                { id: 'men', label: 'ผู้ชาย' },
                { id: 'kids', label: 'เด็ก' },
                { id: 'mature', label: 'วัยสูงอายุ / วัยสง่า' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                    selectedSubCategory === sub.id
                      ? 'bg-[#cbb592] text-black font-bold shadow-md'
                      : 'bg-[#15191d] text-[#a0a8b0] border border-[#262d34] hover:border-[#cbb592]/50'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Product Grid (Matching Screenshot 4) */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            {filteredProducts.map((product) => {
              const isFav = favorites.has(product.id);
              const isPopular = (product.soldCount && product.soldCount >= 800) || product.tags?.some(t => t.includes('ขายดี') || t.includes('ฮิต'));
              const isNewItem = product.tags?.some(t => t.includes('ใหม่') || t.includes('2024'));

              const isFlipped = Boolean(flippedProductIds[product.id]);
              const hasBack = Boolean(product.backImage || product.angles?.back);
              const displayImage = isFlipped && hasBack ? (product.backImage || product.angles?.back || product.image) : product.image;

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group rounded-3xl bg-[#121619] border border-[#21262d] overflow-hidden flex flex-col justify-between hover:border-[#cbb592]/50 hover:shadow-xl transition-all cursor-pointer relative"
                >
                  {/* Image Container with Heart Wishlist overlay */}
                  <div className="relative aspect-[3/4] bg-black overflow-hidden">
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Front / Back Flip Button if available */}
                    {hasBack && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlippedProductIds(prev => ({
                            ...prev,
                            [product.id]: !prev[product.id]
                          }));
                        }}
                        className="absolute bottom-11 left-2.5 z-10 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-[#cbb592]/60 text-[9px] font-bold text-[#f5ebd9] flex items-center gap-1 hover:border-[#cbb592] active:scale-95 shadow"
                      >
                        <RotateCw className="w-2.5 h-2.5 text-[#cbb592]" />
                        <span>{isFlipped ? 'ดูด้านหน้า' : 'ดูด้านหลัง'}</span>
                      </button>
                    )}

                    {/* Popular / New Badge */}
                    {isPopular && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-bold backdrop-blur-md shadow flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        <span>ฮิต</span>
                      </span>
                    )}
                    {!isPopular && isNewItem && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#18392b]/95 text-[#f5ebd9] border border-[#cbb592]/70 text-[9px] font-bold backdrop-blur-md shadow flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-[#dfa24b]" />
                        <span>มาใหม่</span>
                      </span>
                    )}

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all active:scale-90 hover:bg-black/60 shadow"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Quick Try-On Overlay button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDirectTryOn(product);
                      }}
                      className="absolute bottom-2 inset-x-2 py-1.5 rounded-full bg-[#1b382b]/90 backdrop-blur-md text-[#f5ebd9] border border-[#cbb592]/70 text-[11px] font-semibold flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 shadow-lg active:scale-95 transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-[#cbb592]" />
                      <span>ลองชุดนี้</span>
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] text-[#8e969e] uppercase tracking-wider block font-medium">
                      {product.brand}
                    </span>
                    <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-[#cbb592] transition-colors">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-extrabold text-[#d4b588]">
                        ฿{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-[#6e7780] line-through">
                          ฿{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Quick Add To Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="w-full mt-2 py-1.5 rounded-xl bg-[#172025] hover:bg-[#1b382b] text-[#cbb592] hover:text-white border border-[#2b353e] hover:border-[#cbb592]/60 text-[11px] font-medium flex items-center justify-center gap-1 transition-all"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>ใส่ตะกร้า</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </section>
      )}

      {/* TAB 3: PRIVATE SALE (VIP Exclusive) */}
      {activeTab === 'private_sale' && (
        <section className="space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1c1811] via-[#120f0a] to-[#0a0805] border border-[#dfa24b]/50 shadow-2xl text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#dfa24b]/20 text-[#dfa24b] flex items-center justify-center mx-auto mb-3 border border-[#dfa24b]/40">
              <Key className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold gold-gradient-text tracking-wider">
              ISARA PRIVATE SALE
            </h3>
            <p className="text-xs text-[#d6c4a8] mt-1 max-w-xs mx-auto">
              ห้องรับรองและสิทธิพิเศษช้อปสินค้าลิมิเต็ดก่อนใคร สำหรับสมาชิกระดับ VIP เท่านั้น
            </p>

            {/* Countdown timer */}
            <div className="flex justify-center gap-3 my-4">
              <div className="bg-[#241e15] px-3 py-2 rounded-xl border border-[#dfa24b]/30">
                <span className="text-lg font-bold text-white font-mono">05</span>
                <span className="text-[9px] text-[#a49b8a] block">ชั่วโมง</span>
              </div>
              <span className="text-lg font-bold text-[#dfa24b] self-center">:</span>
              <div className="bg-[#241e15] px-3 py-2 rounded-xl border border-[#dfa24b]/30">
                <span className="text-lg font-bold text-white font-mono">42</span>
                <span className="text-[9px] text-[#a49b8a] block">นาที</span>
              </div>
              <span className="text-lg font-bold text-[#dfa24b] self-center">:</span>
              <div className="bg-[#241e15] px-3 py-2 rounded-xl border border-[#dfa24b]/30">
                <span className="text-lg font-bold text-white font-mono">19</span>
                <span className="text-[9px] text-[#a49b8a] block">วินาที</span>
              </div>
            </div>

            {/* Vouchers */}
            <div className="space-y-2 text-left">
              <div className="p-3 bg-[#17140e] rounded-2xl border border-[#dfa24b]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#dfa24b] font-bold">โค้ดส่วนลดพิเศษ VIP</span>
                  <h5 className="text-xs font-bold text-white">ลดทันที 20% ไม่มีขั้นต่ำ (ISARAVIP)</h5>
                </div>
                <button
                  onClick={() => onOpenPrivateSaleVoucher('ISARAVIP')}
                  className="px-3 py-1.5 rounded-full bg-[#dfa24b] text-black text-xs font-bold hover:bg-[#f0b764]"
                >
                  เก็บโค้ด
                </button>
              </div>

              <div className="p-3 bg-[#17140e] rounded-2xl border border-[#dfa24b]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#dfa24b] font-bold">สิทธิ์ลองชุด AI VIP</span>
                  <h5 className="text-xs font-bold text-white">ลองชุด AI ไม่จำกัด + รับส่วนลด ฿100 (TRYONFREE)</h5>
                </div>
                <button
                  onClick={() => onOpenPrivateSaleVoucher('TRYONFREE')}
                  className="px-3 py-1.5 rounded-full bg-[#dfa24b] text-black text-xs font-bold hover:bg-[#f0b764]"
                >
                  เก็บโค้ด
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
