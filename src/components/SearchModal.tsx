import React, { useState } from 'react';
import { X, Search, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, Store } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  stores: Store[];
  onSelectProduct: (product: Product) => void;
  onSelectStore: (store: Store) => void;
  onDirectTryOn: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  stores,
  onSelectProduct,
  onSelectStore,
  onDirectTryOn,
  onAddToCart
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const trendingTags = ['กางเกงลินิน', 'เสื้อครอปไหมพรม', 'Trench Coat 2024', 'ZARA', 'H&M', 'ยีนส์ 501', 'สูทวัยสง่า'];

  const matchedProducts = query.trim() === '' ? [] : products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.brand.toLowerCase().includes(query.toLowerCase())
  );

  const matchedStores = query.trim() === '' ? [] : stores.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0f1215] border border-[#2b333a] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Search Bar Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#232a31]">
          <div className="flex-1 flex items-center gap-2.5 bg-[#171c20] border border-[#303a43] focus-within:border-[#cbb592] rounded-full px-4 py-2.5 shadow-inner">
            <Search className="w-4 h-4 text-[#cbb592]" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาเสื้อผ้า, แบรนด์, หรือสไตล์..."
              className="bg-transparent text-xs w-full text-white placeholder-gray-400 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          
          {/* Trending Tags */}
          {query.trim() === '' && (
            <div className="space-y-2 text-left">
              <span className="text-[11px] font-bold text-[#cbb592] block">คำค้นหายอดนิยม 🔥</span>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full bg-[#182025] text-xs text-gray-300 border border-[#2d3842] hover:border-[#cbb592] hover:text-white"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {query.trim() !== '' && (
            <div className="space-y-3 text-left">
              
              {/* Stores Matches */}
              {matchedStores.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#cbb592] block mb-1">ร้านค้าแบรนด์</span>
                  <div className="space-y-1.5">
                    {matchedStores.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectStore(s);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-[#171d22] border border-[#28323a] flex items-center justify-between cursor-pointer hover:border-[#cbb592]"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={s.logo} alt={s.name} className="w-8 h-8 rounded-full bg-white object-contain p-1" />
                          <span className="text-xs font-bold text-white uppercase">{s.name}</span>
                        </div>
                        <span className="text-[10px] text-[#cbb592]">ดูร้านค้า &rarr;</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Matches */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[#cbb592] block mb-1">สินค้าที่พบ ({matchedProducts.length})</span>
                {matchedProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">ไม่พบสินค้าที่ตรงกับคำค้นหา</p>
                ) : (
                  <div className="space-y-2">
                    {matchedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-2xl bg-[#151a1e] border border-[#263038] flex items-center justify-between"
                      >
                        <div
                          onClick={() => {
                            onSelectProduct(p);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 cursor-pointer flex-1"
                        >
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase">{p.brand}</span>
                            <h5 className="text-xs font-bold text-white line-clamp-1">{p.name}</h5>
                            <span className="text-xs font-extrabold text-[#dfa24b]">฿{p.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pl-2">
                          <button
                            onClick={() => {
                              onDirectTryOn(p);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] text-[10px] font-bold flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-[#cbb592]" />
                            <span>ลอง</span>
                          </button>
                          <button
                            onClick={() => onAddToCart(p)}
                            className="p-1 rounded-lg bg-[#1e252a] text-[#cbb592] hover:text-white border border-[#34404a]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
