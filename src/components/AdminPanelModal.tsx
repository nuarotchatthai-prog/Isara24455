import React, { useState, useEffect } from 'react';
import { X, Shield, Plus, Package, ShoppingCart, Sparkles, TrendingUp, Radio, Check, Edit, Trash2, ArrowUpRight, BarChart2, RefreshCw, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { Product, Order, TryOnResult } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddOrUpdateProduct: (product: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddOrUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'tryon_logs' | 'broadcast'>('overview');
  
  // Product Form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('1290');
  const [pOriginalPrice, setPOriginalPrice] = useState('1590');
  const [pDescription, setPDescription] = useState('');
  const [pCategory, setPCategory] = useState<Product['category']>('tops');
  const [pSubCategory, setPSubCategory] = useState<Product['subCategory']>('women');
  const [pBrand, setPBrand] = useState('ISARA Atelier');
  const [pStock, setPStock] = useState('50');

  // Multi-angle Template state (หน้า, หลัง, ข้าง, ซูมเนื้อผ้า)
  const [pImageFront, setPImageFront] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
  const [pImageBack, setPImageBack] = useState('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80');
  const [pImageSide, setPImageSide] = useState('');
  const [pImageDetail, setPImageDetail] = useState('');
  const [activeFormAngle, setActiveFormAngle] = useState<'front' | 'back' | 'side' | 'detail'>('front');

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  const handleOpenAddForm = (productToEdit?: Product) => {
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setPName(productToEdit.name);
      setPPrice(productToEdit.price.toString());
      setPOriginalPrice(productToEdit.originalPrice ? productToEdit.originalPrice.toString() : '');
      setPDescription(productToEdit.description);
      setPCategory(productToEdit.category);
      setPSubCategory(productToEdit.subCategory);
      setPBrand(productToEdit.brand);
      setPImageFront(productToEdit.image || productToEdit.angles?.front || '');
      setPImageBack(productToEdit.backImage || productToEdit.angles?.back || '');
      setPImageSide(productToEdit.sideImage || productToEdit.angles?.side || '');
      setPImageDetail(productToEdit.detailImage || productToEdit.angles?.detail || '');
      setPStock(productToEdit.stockCount.toString());
      setActiveFormAngle('front');
    } else {
      setEditingProduct(null);
      setPName('');
      setPPrice('1290');
      setPOriginalPrice('');
      setPDescription('สินค้าแฟชั่นดีไซน์พรีเมียมจากคอลเลกชันใหม่ คัตติ้งประณีต พร้อมรองรับการลองชุด AI');
      setPCategory('tops');
      setPSubCategory('women');
      setPBrand('ISARA Atelier');
      setPImageFront('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
      setPImageBack('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80');
      setPImageSide('');
      setPImageDetail('');
      setPStock('50');
      setActiveFormAngle('front');
    }
    setShowProductForm(true);
  };

  const handleImageFileUpload = (angle: 'front' | 'back' | 'side' | 'detail', file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (angle === 'front') setPImageFront(dataUrl);
      else if (angle === 'back') setPImageBack(dataUrl);
      else if (angle === 'side') setPImageSide(dataUrl);
      else if (angle === 'detail') setPImageDetail(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const mainImg = pImageFront || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
    const anglesObj = {
      front: mainImg,
      back: pImageBack || undefined,
      side: pImageSide || undefined,
      detail: pImageDetail || undefined
    };
    const detailList = [mainImg, pImageBack, pImageSide, pImageDetail].filter(Boolean) as string[];

    onAddOrUpdateProduct({
      id: editingProduct?.id,
      name: pName || 'สินค้าใหม่ ISARA',
      price: Number(pPrice) || 990,
      originalPrice: pOriginalPrice ? Number(pOriginalPrice) : undefined,
      description: pDescription,
      category: pCategory,
      subCategory: pSubCategory,
      brand: pBrand,
      image: mainImg,
      backImage: pImageBack || undefined,
      sideImage: pImageSide || undefined,
      detailImage: pImageDetail || undefined,
      angles: anglesObj,
      detailImages: detailList,
      stockCount: Number(pStock) || 50,
      inStock: true
    });
    setShowProductForm(false);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[92vh] bg-[#0c0f11] border border-[#2b333a] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#121619] border-b border-[#242b31] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#18392b] text-[#cbb592] border border-[#cbb592]/50 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="font-serif-luxury text-sm font-bold text-white tracking-wide">
                ISARA MANAGEMENT BACKEND (ระบบหลังบ้าน)
              </h3>
              <p className="text-[10px] text-[#a49b8a]">
                แผงควบคุมระบบร้านค้า แฟชั่นแคตตาล็อก คำสั่งซื้อ และ AI ลองชุด
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-[#242b31] bg-[#0e1214] px-4 pt-2">
          {[
            { id: 'overview', label: 'ภาพรวมระบบ', icon: BarChart2 },
            { id: 'products', label: `จัดการสินค้า (${products.length})`, icon: Package },
            { id: 'orders', label: `คำสั่งซื้อ (${orders.length})`, icon: ShoppingCart },
            { id: 'tryon_logs', label: 'สถิติ AI ลองชุด', icon: Sparkles },
            { id: 'broadcast', label: 'ควบคุมไลฟ์สด', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 text-xs font-semibold rounded-t-xl flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-[#cbb592] text-[#cbb592] bg-[#171d22]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#14191d] border border-[#27323a] text-left">
                  <span className="text-[10px] text-[#8e969e] uppercase font-bold block">ยอดขายรวม</span>
                  <div className="text-lg font-extrabold text-[#dfa24b] font-mono mt-1">
                    ฿{totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-green-400 flex items-center gap-0.5 mt-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +18.4% จากสัปดาห์ก่อน
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#14191d] border border-[#27323a] text-left">
                  <span className="text-[10px] text-[#8e969e] uppercase font-bold block">คำสั่งซื้อทั้งหมด</span>
                  <div className="text-lg font-extrabold text-white font-mono mt-1">
                    {totalOrdersCount} รายการ
                  </div>
                  <span className="text-[10px] text-[#cbb592] mt-0.5 block">
                    รอจัดส่ง: {pendingOrders} รายการ
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#14191d] border border-[#27323a] text-left">
                  <span className="text-[10px] text-[#8e969e] uppercase font-bold block">สินค้าพร้อมขาย</span>
                  <div className="text-lg font-extrabold text-white font-mono mt-1">
                    {products.length} แบบ
                  </div>
                  <span className="text-[10px] text-[#8e969e] mt-0.5 block">5 แบรนด์พันธมิตร</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#14191d] border border-[#27323a] text-left">
                  <span className="text-[10px] text-[#8e969e] uppercase font-bold block">AI ลองชุดเสมือนจริง</span>
                  <div className="text-lg font-extrabold text-[#dfa24b] font-mono mt-1">
                    1,280 ครั้ง
                  </div>
                  <span className="text-[10px] text-green-400 mt-0.5 block">ความพึงพอใจ 98%</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#173024] to-[#0d1e16] border border-[#cbb592]/40 text-left flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">ต้องการลงสินค้าใหม่ในแคตตาล็อกหน้าร้าน?</h4>
                  <p className="text-[11px] text-[#cbb592] mt-0.5">เพิ่มรูปภาพ, กำหนดราคา, และเปิดให้ลูกค้ากดลองชุด AI ได้ทันที</p>
                </div>
                <button
                  onClick={() => handleOpenAddForm()}
                  className="px-3 py-1.5 rounded-xl bg-[#cbb592] text-black font-bold text-xs hover:bg-[#dfc8a5] flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มสินค้า</span>
                </button>
              </div>

              {/* Live Status Tracker */}
              <div className="p-3.5 rounded-2xl bg-[#13171b] border border-[#232c33] text-left space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  สถานะการทำงานของระบบ (API & Services)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <div className="p-2 rounded bg-[#0b0e10] border border-[#242d34]">
                    Gemini AI Vision Studio: <span className="text-green-400 font-bold">Online 100%</span>
                  </div>
                  <div className="p-2 rounded bg-[#0b0e10] border border-[#242d34]">
                    Payment Gateway (PromptPay): <span className="text-green-400 font-bold">Connected</span>
                  </div>
                  <div className="p-2 rounded bg-[#0b0e10] border border-[#242d34]">
                    Logistics (Flash Express API): <span className="text-green-400 font-bold">Synced</span>
                  </div>
                  <div className="p-2 rounded bg-[#0b0e10] border border-[#242d34]">
                    TikTok Live Broadcast Room: <span className="text-[#dfa24b] font-bold">Broadcasting</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">คลังสินค้าแฟชั่น ({products.length} รายการ)</span>
                <button
                  onClick={() => handleOpenAddForm()}
                  className="px-3 py-1.5 rounded-xl bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] text-xs font-bold hover:bg-[#204b38] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#cbb592]" />
                  <span>เพิ่มสินค้าใหม่</span>
                </button>
              </div>

              {/* Products Table/List */}
              <div className="space-y-2.5">
                {products.map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-[#14191d] border border-[#27323a] flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-[#3b4752]" />
                      <div>
                        <span className="text-[10px] text-[#cbb592] uppercase font-bold">{p.brand} • {p.category}</span>
                        <h5 className="text-xs font-bold text-white line-clamp-1">{p.name}</h5>
                        <p className="text-[11px] text-gray-300">
                          ฿{p.price.toLocaleString()} • สต็อก: {p.stockCount} ชิ้น
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenAddForm(p)}
                        className="p-1.5 rounded-lg bg-[#1c242a] text-[#cbb592] hover:text-white border border-[#2f3942]"
                        title="แก้ไข"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-[#241717] text-red-400 hover:text-red-300 border border-red-900/50"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4 text-left">
              <span className="text-xs font-bold text-white">รายการคำสั่งซื้อของลูกค้า</span>
              
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-3.5 rounded-2xl bg-[#14191d] border border-[#27323a] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#242c33] pb-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#cbb592]">{ord.orderNumber}</span>
                        <span className="text-[11px] text-gray-400 block">{ord.customerName} ({ord.customerPhone})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#dfa24b]">฿{ord.finalAmount.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 block">{ord.paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-300">
                      <strong>ที่อยู่จัดส่ง:</strong> {ord.shippingAddress}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-400 font-mono">
                        Tracking: {ord.trackingNumber || 'ยังไม่ออกเลข'}
                      </span>

                      {/* Status Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400">สถานะ:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                          className="bg-[#1b2228] text-xs font-bold text-[#cbb592] border border-[#374450] rounded-lg px-2 py-1 outline-none"
                        >
                          <option value="pending">รอชำระเงิน</option>
                          <option value="preparing">กำลังเตรียมจัดส่ง</option>
                          <option value="shipping">อยู่ระหว่างจัดส่ง</option>
                          <option value="delivered">จัดส่งเรียบร้อย</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TRY-ON LOGS */}
          {activeTab === 'tryon_logs' && (
            <div className="space-y-4 text-left">
              <span className="text-xs font-bold text-white">บันทึกการเจนชุดเสมือนจริง (AI Virtual Try-On Logs)</span>
              
              <div className="p-3.5 rounded-2xl bg-[#14191d] border border-[#27323a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#cbb592]">Session #TRY-8921 • นางแบบ: ณิชา (สาวชิคโมเดิร์น)</span>
                  <span className="text-[10px] text-green-400 font-bold">เข้ากันได้ 97%</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  ชุดที่ลอง: กางเกงขาสั้นเอวสูง ผ้าลินิน + เสื้อครอปไหมพรมแขนพอง
                </p>
                <div className="p-2 rounded-xl bg-[#0e1215] text-[10px] text-gray-400 border border-[#222a31]">
                  AI Stylist: "สัดส่วนเอวสูงของกางเกงลินินช่วยขับช่วงลำตัวให้เพรียว แมตช์กับเสื้อครอปโทนสีตัดกันได้อย่างสมบูรณ์แบบ"
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#14191d] border border-[#27323a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#cbb592]">Session #TRY-8920 • ลูกค้าอัปโหลดรูปภาพส่วนตัว</span>
                  <span className="text-[10px] text-green-400 font-bold">เข้ากันได้ 95%</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  ชุดที่ลอง: เสื้อโค้ตเทรนช์ คอลเลกชันใหม่ 2024
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: BROADCAST MANAGER */}
          {activeTab === 'broadcast' && (
            <div className="space-y-4 text-left">
              <span className="text-xs font-bold text-white">แผงควบคุมการถ่ายทอดสด (ISARA LIVE Room)</span>
              
              <div className="p-4 rounded-2xl bg-[#14191d] border border-[#27323a] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-bold text-white">ห้องไลฟ์สดกำลังทำงาน (2,450 ผู้ชม)</span>
                  </div>
                  <span className="text-[11px] text-[#cbb592] font-mono">Nana Studio Host</span>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">ปักหมุดสินค้าโปรโมชันในไลฟ์</label>
                  <select
                    className="w-full bg-[#1b2228] text-xs text-white p-2.5 rounded-xl border border-[#34404a] outline-none"
                    defaultValue={products[0]?.id}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (฿{p.price.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => alert('ปักหมุดสินค้าในไลฟ์เรียบร้อยแล้ว!')}
                  className="w-full py-2.5 rounded-xl bg-[#18392b] text-white text-xs font-bold border border-[#cbb592] hover:bg-[#204b38]"
                >
                  อัปเดตสินค้าปักหมุดในหน้าไลฟ์ทันที
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Product Add/Edit Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form onSubmit={handleSaveProduct} className="w-full max-w-md bg-[#121619] border border-[#2d3741] rounded-3xl p-5 shadow-2xl space-y-3 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#242c33]">
              <h4 className="text-sm font-bold text-white">
                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h4>
              <button type="button" onClick={() => setShowProductForm(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1">ชื่อสินค้า</label>
              <input
                type="text"
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="เช่น กางเกงขาสั้นเอวสูง ผ้าลินิน"
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#34404c] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1">ราคาขาย (บาท)</label>
                <input
                  type="number"
                  required
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#34404c] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">ราคาเดิม (บาท)</label>
                <input
                  type="number"
                  value={pOriginalPrice}
                  onChange={(e) => setPOriginalPrice(e.target.value)}
                  placeholder="ไม่ระบุก็ได้"
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#34404c] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1">หมวดหมู่</label>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value as any)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#34404c] outline-none"
                >
                  <option value="tops">เสื้อ</option>
                  <option value="pants">กางเกง</option>
                  <option value="outerwear">เสื้อคลุม/สูท</option>
                  <option value="shoes">รองเท้า</option>
                  <option value="bags">กระเป๋า</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1">กลุ่มเป้าหมาย</label>
                <select
                  value={pSubCategory}
                  onChange={(e) => setPSubCategory(e.target.value as any)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#34404c] outline-none"
                >
                  <option value="women">ผู้หญิง</option>
                  <option value="men">ผู้ชาย</option>
                  <option value="kids">เด็ก</option>
                  <option value="mature">วัยสง่า</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1">แบรนด์</label>
              <input
                type="text"
                value={pBrand}
                onChange={(e) => setPBrand(e.target.value)}
                placeholder="ISARA Atelier, ZARA, H&M, Levi's"
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#34404c] outline-none"
              />
            </div>

            {/* Multi-angle Templates Section (แบ่งเทมเพลต ด้านหน้า, ด้านหลัง, ด้านข้าง, ซูมเนื้อผ้า) */}
            <div className="p-3.5 rounded-2xl bg-[#0f1316] border border-[#2b3642] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-bold text-[#cbb592] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#dfa24b]" />
                    <span>รูปภาพสินค้าหลายมุม (แบ่งเทมเพลตหน้า-หลัง)</span>
                  </label>
                  <p className="text-[10px] text-gray-400">อัปโหลดรูปภาพแต่ละมุม หรือใส่ลิงก์รูปภาพ</p>
                </div>

                <div className="flex items-center gap-1 bg-[#182026] p-1 rounded-xl border border-[#2c3743]">
                  {(['front', 'back', 'side', 'detail'] as const).map((ang) => (
                    <button
                      key={ang}
                      type="button"
                      onClick={() => setActiveFormAngle(ang)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                        activeFormAngle === ang
                          ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {ang === 'front' ? 'หน้า' : ang === 'back' ? 'หลัง' : ang === 'side' ? 'ข้าง' : 'ซูมผ้า'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Preview Canvas */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-[#27323b] flex items-center justify-center">
                {(() => {
                  const currentPreview = activeFormAngle === 'front' ? pImageFront : activeFormAngle === 'back' ? pImageBack : activeFormAngle === 'side' ? pImageSide : pImageDetail;
                  return currentPreview ? (
                    <img src={currentPreview} alt="Angle Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-3 text-gray-500 space-y-1">
                      <Camera className="w-6 h-6 mx-auto opacity-50" />
                      <span className="text-[10px] block">ยังไม่มีภาพในมุมนี้</span>
                    </div>
                  );
                })()}

                {/* Badge on Preview */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#cbb592] border border-[#cbb592]/50 text-[10px] font-bold">
                  มุมที่กำลังดู: {activeFormAngle === 'front' ? '📸 ด้านหน้า (Front)' : activeFormAngle === 'back' ? '🔄 ด้านหลัง (Back)' : activeFormAngle === 'side' ? '📐 ด้านข้าง (Side)' : '🔍 ซูมเนื้อผ้า (Detail)'}
                </div>
              </div>

              {/* 4 Template Upload Slots */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* 1. ด้านหน้า (Front - Required) */}
                <div className={`p-2 rounded-xl border transition-all text-left ${activeFormAngle === 'front' ? 'border-[#cbb592] bg-[#172026]' : 'border-[#26313b] bg-[#13181c]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-1">
                      <span>📸 ด้านหน้า</span>
                      <span className="text-red-400">*</span>
                    </span>
                    {pImageFront && <span className="text-[9px] text-green-400 font-bold">✓ พร้อม</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="flex-1 py-1.5 px-2 rounded-lg bg-[#1e272e] hover:bg-[#25323c] border border-[#374552] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลดรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload('front', e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveFormAngle('front')}
                      className="px-2 py-1.5 rounded-lg bg-[#1a2228] text-gray-300 text-[10px] hover:text-white"
                    >
                      ดู
                    </button>
                  </div>
                  <input
                    type="url"
                    value={pImageFront}
                    onChange={(e) => setPImageFront(e.target.value)}
                    placeholder="หรือใส่ URL ภาพหน้า..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[10px] text-white p-1.5 rounded-lg border border-[#2b3642] outline-none"
                  />
                </div>

                {/* 2. ด้านหลัง (Back) */}
                <div className={`p-2 rounded-xl border transition-all text-left ${activeFormAngle === 'back' ? 'border-[#cbb592] bg-[#172026]' : 'border-[#26313b] bg-[#13181c]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-1">
                      <span>🔄 ด้านหลัง</span>
                    </span>
                    {pImageBack && <span className="text-[9px] text-green-400 font-bold">✓ พร้อม</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="flex-1 py-1.5 px-2 rounded-lg bg-[#1e272e] hover:bg-[#25323c] border border-[#374552] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลดรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload('back', e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveFormAngle('back')}
                      className="px-2 py-1.5 rounded-lg bg-[#1a2228] text-gray-300 text-[10px] hover:text-white"
                    >
                      ดู
                    </button>
                  </div>
                  <input
                    type="url"
                    value={pImageBack}
                    onChange={(e) => setPImageBack(e.target.value)}
                    placeholder="หรือใส่ URL ภาพหลัง..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[10px] text-white p-1.5 rounded-lg border border-[#2b3642] outline-none"
                  />
                </div>

                {/* 3. ด้านข้าง (Side) */}
                <div className={`p-2 rounded-xl border transition-all text-left ${activeFormAngle === 'side' ? 'border-[#cbb592] bg-[#172026]' : 'border-[#26313b] bg-[#13181c]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-1">
                      <span>📐 มุมข้าง</span>
                    </span>
                    {pImageSide && <span className="text-[9px] text-green-400 font-bold">✓ พร้อม</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="flex-1 py-1.5 px-2 rounded-lg bg-[#1e272e] hover:bg-[#25323c] border border-[#374552] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลด</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload('side', e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveFormAngle('side')}
                      className="px-2 py-1.5 rounded-lg bg-[#1a2228] text-gray-300 text-[10px] hover:text-white"
                    >
                      ดู
                    </button>
                  </div>
                  <input
                    type="url"
                    value={pImageSide}
                    onChange={(e) => setPImageSide(e.target.value)}
                    placeholder="ใส่ URL มุมข้าง (ถ้ามี)..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[10px] text-white p-1.5 rounded-lg border border-[#2b3642] outline-none"
                  />
                </div>

                {/* 4. ซูมเนื้อผ้า (Detail) */}
                <div className={`p-2 rounded-xl border transition-all text-left ${activeFormAngle === 'detail' ? 'border-[#cbb592] bg-[#172026]' : 'border-[#26313b] bg-[#13181c]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-1">
                      <span>🔍 ซูมเนื้อผ้า</span>
                    </span>
                    {pImageDetail && <span className="text-[9px] text-green-400 font-bold">✓ พร้อม</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="flex-1 py-1.5 px-2 rounded-lg bg-[#1e272e] hover:bg-[#25323c] border border-[#374552] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลด</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload('detail', e.target.files?.[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveFormAngle('detail')}
                      className="px-2 py-1.5 rounded-lg bg-[#1a2228] text-gray-300 text-[10px] hover:text-white"
                    >
                      ดู
                    </button>
                  </div>
                  <input
                    type="url"
                    value={pImageDetail}
                    onChange={(e) => setPImageDetail(e.target.value)}
                    placeholder="ใส่ URL ซูมเนื้อผ้า (ถ้ามี)..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[10px] text-white p-1.5 rounded-lg border border-[#2b3642] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1">รายละเอียดสินค้า</label>
              <textarea
                rows={2}
                value={pDescription}
                onChange={(e) => setPDescription(e.target.value)}
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#34404c] outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProductForm(false)}
                className="flex-1 py-2.5 rounded-xl bg-transparent border border-gray-600 text-gray-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#18392b] text-white text-xs font-bold border border-[#cbb592] hover:bg-[#204b38]"
              >
                บันทึกสินค้า
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
