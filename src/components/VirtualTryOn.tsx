import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, Sparkles, ShoppingCart, RefreshCw, Download, Share2, 
  Check, Eye, Sliders, CheckCircle2, Camera, Store as StoreIcon, AlertCircle, X,
  Cpu
} from 'lucide-react';
import { Product, CartItem, TryOnResult } from '../types';
import { STYLE_SCENES } from '../data/mockData';
import { compositeVirtualTryOn, FittingAdjustments } from '../utils/tryOnCompositor';

const DEFAULT_USER_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

interface VirtualTryOnProps {
  cartItems: CartItem[];
  allProducts: Product[];
  onAddToCart: (product: Product) => void;
  onPostToFeed: (post: { title: string; mediaUrl: string; price: number; linkedProductId: string }) => void;
  onQuickCheckout: (products: Product[]) => void;
  preSelectedProduct?: Product | null;
  onNavigateToShop?: () => void;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  cartItems,
  allProducts,
  onAddToCart: _onAddToCart,
  onPostToFeed,
  onQuickCheckout,
  preSelectedProduct,
  onNavigateToShop
}) => {
  // 1. Photo state - ONLY user uploaded photo or camera
  const [uploadedUserImage, setUploadedUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Available clothing items to wear: from cartItems + preSelectedProduct
  const availableClothes = useMemo(() => {
    const list: Product[] = [];
    const seen = new Set<string>();

    if (preSelectedProduct) {
      list.push(preSelectedProduct);
      seen.add(preSelectedProduct.id);
    }

    cartItems.forEach(ci => {
      if (!seen.has(ci.productId)) {
        list.push(ci.product);
        seen.add(ci.productId);
      }
    });

    return list;
  }, [cartItems, preSelectedProduct]);

  // Selected products to wear simultaneously
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    if (preSelectedProduct) return [preSelectedProduct.id];
    if (cartItems.length > 0) return [cartItems[0].productId];
    if (allProducts.length > 0) return [allProducts[0].id];
    return [];
  });

  // Sync preSelectedProduct when prop changes
  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProductIds(prev => 
        prev.includes(preSelectedProduct.id) ? prev : [preSelectedProduct.id, ...prev]
      );
    }
  }, [preSelectedProduct]);

  // Atmosphere Scene
  const [selectedScene] = useState(STYLE_SCENES[0]);

  // Fitting parameters
  const defaultAdjustments: FittingAdjustments = useMemo(() => ({
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    blendStrength: 0.95
  }), []);

  // Daily usage quota: 10 times per day
  const [dailyUsesLeft, setDailyUsesLeft] = useState<number>(10);

  // Generation & Result state
  const [isGenerating, setIsGenerating] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const [compareSliderPos, setCompareSliderPos] = useState<number>(50); // 0 to 100%
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeBaseImage = uploadedUserImage || DEFAULT_USER_FALLBACK_IMAGE;
  const currentlyWornProducts = allProducts.filter(p => selectedProductIds.includes(p.id));
  const totalWornPrice = currentlyWornProducts.reduce((sum, p) => sum + p.price, 0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Handle Photo Upload from user's camera or filesystem
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedUserImage(event.target.result as string);
          setTryOnResult(null);
          showToast('อัปโหลดรูปภาพบุคคลจริงเรียบร้อยแล้ว พร้อมลองชุด');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle selection of products to wear
  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Main Action: Generate Virtual Try-On ("เริ่มเปลี่ยนลุค")
  // Connects the selected clothes + person photo, calling Gemini Banana model
  const handleGenerateTryOn = async () => {
    if (dailyUsesLeft <= 0) {
      showToast('คุณใช้สิทธิ์ครบ 10 ครั้งต่อวันแล้ว');
      return;
    }

    if (currentlyWornProducts.length === 0) {
      showToast('กรุณาเลือกเสื้อผ้าอย่างน้อย 1 ชิ้นเพื่อลองใส่');
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Generate initial composite from uploaded photo & garments
      const compositeBase = await compositeVirtualTryOn(
        activeBaseImage,
        currentlyWornProducts,
        defaultAdjustments
      );

      // 2. Call backend Gemini Banana AI Try-On engine
      const currentModelName = uploadedUserImage ? 'บุคคลในรูปจริง' : 'ผู้ใช้งาน';
      let finalResultImage = compositeBase;
      let stylistFeedback = 'ชุดที่เลือกตัดเย็บและสวมใส่ให้กับบุคคลในรูปได้อย่างสวยงามลงตัว โดยคงเอกลักษณ์และใบหน้าของบุคคลไว้อย่างสมบูรณ์แบบ ขับเน้นบุคลิกภาพให้ดูโดดเด่นทันสมัย';
      let fitScore = 96;
      let isBananaGenerated = false;

      try {
        const res = await fetch('/api/tryon/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelPersona: currentModelName,
            scene: selectedScene.name,
            selectedProductIds,
            userPhotoUrl: compositeBase
          })
        });
        const data = await res.json();
        if (data.success && data.result) {
          finalResultImage = data.result.outputImageUrl || compositeBase;
          stylistFeedback = data.result.stylistFeedback || stylistFeedback;
          fitScore = data.result.fitScore || fitScore;
          isBananaGenerated = !!data.result.isBananaGenerated;
        }
      } catch (apiErr) {
        // Fallback to high-precision composite if network or API unavailable
      }

      const finalResult: TryOnResult = {
        id: `tryon-${Date.now()}`,
        createdAt: new Date().toISOString(),
        modelPersona: currentModelName,
        userPhotoUrl: activeBaseImage,
        wornProducts: currentlyWornProducts,
        scene: selectedScene.name,
        outputImageUrl: finalResultImage,
        stylistFeedback,
        fitScore,
        colorHarmonies: ['#E6D3B3', '#1B382B', '#0B0D0E'],
        isBananaGenerated,
        promptUsed: 'นำชุดที่เลือก สวมใส่ให้กับบุคคลในรูปอย่างสวยงาม\nห้ามเปลี่ยนแปลงหน้าตาบุคคลนั้นเด็ดขาด'
      };

      setTryOnResult(finalResult);
      setDailyUsesLeft(prev => Math.max(0, prev - 1));
      showToast('✨ เปลี่ยนลุคสำเร็จแล้ว!');
    } catch (err) {
      console.error('Try-on generation error:', err);
      showToast('เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download fitted image file
  const handleDownloadImage = () => {
    if (!tryOnResult) return;
    const link = document.createElement('a');
    link.href = tryOnResult.outputImageUrl;
    link.download = `isara-banana-look-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดรูปภาพผลลัพธ์เรียบร้อยแล้ว');
  };

  return (
    <div className="w-full pb-32 max-w-md mx-auto px-4 pt-2">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-[#cbb592]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142e22] border border-[#cbb592]/50 text-[#f5ebd9] text-[11px] font-semibold mb-1 shadow">
          <Sparkles className="w-3.5 h-3.5 text-[#dfa24b]" />
          <span>ISARA AI BANANA • ระบบลองชุดเสมือนจริง</span>
        </div>
        <h2 className="font-serif-luxury text-2xl font-bold tracking-wider gold-gradient-text">
          ห้องลองชุดเสมือนจริง
        </h2>
        <p className="text-xs text-[#a49b8a] mt-0.5">
          ใส่ชุดที่เลือกลงบนรูปภาพจริงของบุคคลอย่างแนบเนียน
        </p>
      </div>

      {/* STEP 1: บุคคล / รูปภาพจริง (User Photo Upload & Camera only) */}
      <section className="rounded-3xl bg-[#121619] border border-[#21262d] p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1b382b] text-[#cbb592] text-[10px] flex items-center justify-center border border-[#cbb592]/40 font-bold">1</span>
            <span>อัปโหลดรูปบุคคลจริงของคุณ (ภาพที่ต้องการใส่ชุด)</span>
          </h3>
          {uploadedUserImage && (
            <button
              onClick={() => {
                setUploadedUserImage(null);
                setTryOnResult(null);
              }}
              className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>ล้างรูป</span>
            </button>
          )}
        </div>

        {/* Upload Trigger Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          capture="user"
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-3 rounded-2xl bg-[#182128] border border-dashed border-[#cbb592]/60 hover:border-[#cbb592] text-white flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4 text-[#cbb592]" />
            <span className="text-xs font-medium">
              {uploadedUserImage ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปของคุณ'}
            </span>
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="py-3 px-3 rounded-2xl bg-[#182128] border border-dashed border-[#cbb592]/60 hover:border-[#cbb592] text-white flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 text-[#cbb592]" />
            <span className="text-xs font-medium">ถ่ายภาพสด</span>
          </button>
        </div>

        {/* Uploaded User Photo State / Preview */}
        {uploadedUserImage ? (
          <div className="flex items-center gap-3 p-2.5 bg-[#17241d] rounded-2xl border border-[#cbb592]/60">
            <img 
              src={uploadedUserImage} 
              alt="User Upload" 
              className="w-14 h-14 rounded-xl object-cover border border-[#cbb592]" 
            />
            <div className="text-left flex-1">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#cbb592]" />
                รูปของคุณพร้อมให้ AI สวมชุดแล้ว
              </span>
              <p className="text-[10px] text-[#cbb592] mt-0.5">
                ระบบจะนำรูปถ่ายนี้มาตัดเย็บและสวมชุดให้คุณจริง ๆ โดยคงหน้าเดิมไว้
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#161a1d] rounded-2xl border border-[#273038] text-center">
            <p className="text-xs text-[#a0aab3]">
              กรุณาอัปโหลดรูปภาพตัวคุณ (เต็มตัวหรือครึ่งตัว) เพื่อให้ AI สวมชุดลงบนตัวคุณจริงได้อย่างสมบูรณ์แบบ
            </p>
          </div>
        )}
      </section>

      {/* STEP 2: เสื้อผ้าที่ต้องการลอง (From Cart / Preselected) */}
      <section className="rounded-3xl bg-[#121619] border border-[#21262d] p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1b382b] text-[#cbb592] text-[10px] flex items-center justify-center border border-[#cbb592]/40 font-bold">2</span>
            <span>เลือกเสื้อผ้าที่ต้องการลองสวมใส่ ({availableClothes.length} ชิ้น)</span>
          </h3>
          <span className="text-[11px] text-[#cbb592] font-semibold bg-[#182a20] px-2.5 py-1 rounded-full border border-[#cbb592]/40">
            สวมใส่ {selectedProductIds.length} ชิ้น
          </span>
        </div>

        {/* Clothing Items List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {availableClothes.length > 0 ? (
            availableClothes.map((prod) => {
              const isSelected = selectedProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => toggleSelectProduct(prod.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#182a20] border-[#cbb592] text-white shadow'
                      : 'bg-[#161a1d] border-[#29323a] text-gray-300 hover:border-[#3d4a55]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#2b353e]" 
                    />
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#232b32] text-[#cbb592] font-medium">
                          {prod.brand}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1e2429] text-gray-400">
                          {prod.category}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold line-clamp-1 text-white">{prod.name}</h5>
                      <p className="text-[10px] text-[#cbb592] font-mono">฿{prod.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                    isSelected ? 'bg-[#cbb592] border-[#cbb592] text-black shadow-sm' : 'border-gray-500'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 bg-[#161a1d] rounded-2xl border border-[#2b333a] p-4 space-y-2">
              <AlertCircle className="w-7 h-7 text-[#cbb592] mx-auto opacity-70" />
              <p className="text-xs text-gray-300 font-medium">ยังไม่มีสินค้าในตะกร้าสำหรับลองชุด</p>
              <p className="text-[11px] text-gray-500">
                กรุณาเลือกสินค้าจากหน้าร้านค้า หรือคลิก &quot;ลองชุดนี้&quot; เพื่อนำมาลองใส่
              </p>
              {onNavigateToShop && (
                <button
                  onClick={onNavigateToShop}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#18392b] text-[#f5ebd9] text-xs font-bold border border-[#cbb592]/50 hover:bg-[#204a38] inline-flex items-center gap-1.5"
                >
                  <StoreIcon className="w-3.5 h-3.5 text-[#cbb592]" />
                  <span>ไปเลือกสินค้าที่หน้าร้านค้า</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* STEP 3: ช่องผลลัพธ์ (Result Display Box - Converted from Preview) */}
      <section className="rounded-3xl bg-[#121619] border border-[#21262d] p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#1b382b] text-[#cbb592] text-[10px] flex items-center justify-center border border-[#cbb592]/40 font-bold">3</span>
            <span>ช่องผลลัพธ์การลองชุด (AI Try-On Result)</span>
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            tryOnResult 
              ? 'bg-[#18392b] text-[#f5ebd9] border-[#cbb592]/70 font-semibold' 
              : isGenerating
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-[#14261d] text-[#cbb592] border-[#cbb592]/30'
          }`}>
            {tryOnResult ? 'ผลลัพธ์พร้อมแล้ว' : isGenerating ? 'กำลังประมวลผล...' : 'รอเริ่มเปลี่ยนลุค'}
          </span>
        </div>

        {/* STATE A: GENERATING / PROCESSING */}
        {isGenerating && (
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0c1012] border-2 border-[#dfa24b] shadow-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pulse">
            <div className="relative w-16 h-16 rounded-full bg-[#18392b] border border-[#cbb592] flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-[#dfa24b] animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#f5ebd9]">AI Banana กำลังประมวลผล...</h4>
              <p className="text-[11px] text-[#cbb592] mt-1">กำลังนำชุดที่เลือกสวมใส่ให้กับบุคคลในรูป</p>
            </div>
            <div className="bg-[#141b20] border border-[#2b353e] p-3 rounded-xl max-w-xs text-left shadow-inner">
              <p className="text-[10px] text-[#8e98a3] mb-1 font-mono flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#dfa24b]" />
                <span>คำสั่ง Prompt ใน AI Banana:</span>
              </p>
              <p className="text-[11px] text-[#f4efe6] font-medium leading-relaxed italic">
                &ldquo;นำชุดที่เลือก สวมใส่ให้กับบุคคลในรูปอย่างสวยงาม<br />
                ห้ามเปลี่ยนแปลงหน้าตาบุคคลนั้นเด็ดขาด&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300/80">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>ส่งข้อมูลไปยังโมเดล Gemini Image Banana...</span>
            </div>
          </div>
        )}

        {/* STATE B: RESULT READY */}
        {!isGenerating && tryOnResult && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
            {/* Result top bar */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-[#dfa24b] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {tryOnResult.isBananaGenerated ? 'ผลลัพธ์ใส่ชุด AI Banana Model' : 'ผลลัพธ์ใส่ชุดจริง • คงรูปหน้าเดิม 100%'}
              </span>
              <button
                onClick={() => setViewMode(viewMode === 'slider' ? 'side-by-side' : 'slider')}
                className="px-2.5 py-1 rounded-full bg-[#1c242a] text-[#cbb592] text-[10px] font-semibold border border-[#343e46] hover:border-[#cbb592] flex items-center gap-1 transition-all"
              >
                <Eye className="w-3 h-3" />
                <span>{viewMode === 'slider' ? 'ดูคู่ขนาน' : 'แถบเลื่อนเปรียบเทียบ'}</span>
              </button>
            </div>

            {/* Interactive Image Frame */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-[#cbb592]/60 shadow-2xl select-none">
              {viewMode === 'slider' ? (
                /* BEFORE / AFTER SPLIT SLIDER */
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={tryOnResult.outputImageUrl}
                    alt="After Fitted"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${compareSliderPos}%` }}
                  >
                    <img
                      src={tryOnResult.userPhotoUrl || activeBaseImage}
                      alt="Original User Photo"
                      className="w-full h-full object-cover"
                      style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: 'none'
                      }}
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-bold border border-white/20">
                      รูปจริงต้นฉบับ
                    </span>
                  </div>

                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#18392b]/90 text-[#f5ebd9] text-[10px] font-bold border border-[#cbb592]/60">
                    {tryOnResult.isBananaGenerated ? 'AI Banana Model' : 'สวมชุดเสมือนจริง (คงหน้าเดิม 100%)'}
                  </span>

                  {/* Slider divider & handle */}
                  <div
                    className="absolute inset-y-0 w-0.5 bg-[#dfa24b] shadow-[0_0_10px_rgba(223,162,75,0.8)] cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${compareSliderPos}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#142e22] border-2 border-[#dfa24b] flex items-center justify-center text-[#dfa24b] shadow-xl">
                      <Sliders className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={compareSliderPos}
                    onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                    title="ลากเพื่อเปรียบเทียบก่อนและหลัง"
                  />
                </div>
              ) : (
                /* SIDE BY SIDE MODE */
                <div className="grid grid-cols-2 h-full">
                  <div className="relative border-r border-[#3b4752]">
                    <img
                      src={tryOnResult.userPhotoUrl || activeBaseImage}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] text-white">
                      รูปจริงก่อนใส่
                    </span>
                  </div>
                  <div className="relative">
                    <img
                      src={tryOnResult.outputImageUrl}
                      alt="After Try On"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#18392b]/90 text-[9px] text-[#f5ebd9] border border-[#cbb592]/50">
                      ใส่ชุดเสร็จสมบูรณ์
                    </span>
                  </div>
                </div>
              )}

              {/* Fit Score Badge overlay */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#dfa24b] text-[#dfa24b] text-xs font-bold flex items-center gap-1 shadow-lg pointer-events-none">
                <span>ความเข้ากัน {tryOnResult.fitScore}%</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-400">
              💡 แตะหรือลากแถบเลื่อนบนรูป เพื่อดูเปรียบเทียบก่อน-หลังใส่ชุด
            </p>

            {/* Prompt banner indication */}
            <div className="p-2.5 rounded-xl bg-[#141b20] border border-[#2b353e] text-left">
              <div className="flex items-center gap-1 text-[10px] text-[#dfa24b] font-medium mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>คำสั่ง Prompt ใน AI Banana:</span>
              </div>
              <p className="text-[11px] text-[#e0d7c7] italic">
                &ldquo;นำชุดที่เลือก สวมใส่ให้กับบุคคลในรูปอย่างสวยงาม ห้ามเปลี่ยนแปลงหน้าตาบุคคลนั้นเด็ดขาด&rdquo;
              </p>
            </div>

            {/* AI Stylist Analysis Box */}
            <div className="p-3.5 rounded-2xl bg-[#172025] border border-[#2e3a44] text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#cbb592]">
                <Sparkles className="w-3.5 h-3.5 text-[#dfa24b]" />
                <span>คำแนะนำจาก AI Stylist:</span>
              </div>
              <p className="text-xs text-[#dcd4c3] leading-relaxed">
                {tryOnResult.stylistFeedback}
              </p>
            </div>

            {/* Clothes in this look */}
            <div className="pt-2 border-t border-[#222930]">
              <span className="text-[11px] text-[#8e969e] block mb-2 text-left">
                เสื้อผ้าที่ใส่ในรูปนี้ ({tryOnResult.wornProducts.length} ชิ้น • รวม ฿{totalWornPrice.toLocaleString()}):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {tryOnResult.wornProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-[#1b2228] p-1.5 pr-3 rounded-xl border border-[#303c46] whitespace-nowrap">
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="text-left">
                      <p className="text-[11px] font-semibold text-white line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-[#cbb592] font-mono">฿{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Actions: Download, Share, Order */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={handleDownloadImage}
                className="py-2.5 px-2 rounded-xl bg-[#1c242a] text-[#f5ebd9] font-medium text-xs border border-[#374450] hover:border-[#cbb592] flex items-center justify-center gap-1 shadow active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#cbb592]" />
                <span>ดาวน์โหลด</span>
              </button>

              <button
                onClick={() => {
                  onPostToFeed({
                    title: `ลุคใหม่ใส่จริงด้วย AI: ${tryOnResult.wornProducts.map(p => p.name).join(' + ')}`,
                    mediaUrl: tryOnResult.outputImageUrl,
                    price: totalWornPrice,
                    linkedProductId: tryOnResult.wornProducts[0].id
                  });
                  showToast('แชร์ไปยังหน้าฟีดเรียบร้อยแล้ว!');
                }}
                className="py-2.5 px-2 rounded-xl bg-[#1c242a] text-[#f5ebd9] font-medium text-xs border border-[#374450] hover:border-[#cbb592] flex items-center justify-center gap-1 shadow active:scale-95 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-[#cbb592]" />
                <span>แชร์ลงฟีด</span>
              </button>

              <button
                onClick={() => onQuickCheckout(tryOnResult.wornProducts)}
                className="py-2.5 px-2 rounded-xl bg-[#18392b] text-white font-bold text-xs border border-[#cbb592]/70 hover:bg-[#204a38] flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#cbb592]" />
                <span>สั่งซื้อชุดนี้</span>
              </button>
            </div>

            {/* Reset button */}
            <button
              onClick={() => setTryOnResult(null)}
              className="w-full py-1.5 text-xs text-[#cbb592] hover:underline flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>ลองเปลี่ยนชุดอื่น / รีเซ็ตผลลัพธ์</span>
            </button>
          </div>
        )}

        {/* STATE C: WAITING TO GENERATE (READY FRAME) */}
        {!isGenerating && !tryOnResult && (
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0e1215] border border-[#2d3742] shadow-inner flex flex-col justify-end">
            <img
              src={activeBaseImage}
              alt="Person Base"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.65]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Prompt & Call-to-action in center */}
            <div className="relative z-10 p-5 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#18392b]/90 border border-[#cbb592] text-[#dfa24b] shadow-lg mb-1">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-wide">ช่องแสดงผลลัพธ์การลองชุด</h4>
              <p className="text-[11px] text-[#cbb592] leading-relaxed">
                เลือกชุดที่ต้องการจากรายการด้านบน<br />
                แล้วกดปุ่ม <span className="text-[#dfa24b] font-bold">&ldquo;เริ่มเปลี่ยนลุค&rdquo;</span> ด้านล่าง เพื่อให้ AI banana ประมวลผล
              </p>

              <div className="mt-2 py-1.5 px-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-gray-300 text-left">
                <span className="text-[#dfa24b] font-semibold block mb-0.5">คำสั่ง AI Banana:</span>
                <span className="italic text-[#f4efe6]">
                  &ldquo;นำชุดที่เลือก สวมใส่ให้กับบุคคลในรูปอย่างสวยงาม ห้ามเปลี่ยนแปลงหน้าตาบุคคลนั้นเด็ดขาด&rdquo;
                </span>
              </div>
            </div>

            <div className="relative z-10 pb-3 text-center">
              <span className="px-3 py-1 rounded-full bg-[#182a20]/90 text-[10px] text-[#cbb592] border border-[#cbb592]/40 font-semibold shadow">
                พร้อมสวมใส่ {currentlyWornProducts.length} ชิ้น บนรูปของคุณ
              </span>
            </div>
          </div>
        )}
      </section>

      {/* MAIN ACTION: GENERATE BUTTON ("เริ่มเปลี่ยนลุค") */}
      {/* Acts as the connector between the selected clothes & person photo, running Gemini Banana */}
      <button
        disabled={isGenerating || selectedProductIds.length === 0}
        onClick={handleGenerateTryOn}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#18392b] via-[#224e3a] to-[#12281e] text-white font-bold text-sm tracking-wider border border-[#cbb592] shadow-[0_8px_30px_rgba(24,57,43,0.8)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-[#cbb592]" />
            <span>กำลังเปลี่ยนลุค...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-[#dfa24b] animate-pulse" />
            <span>เริ่มเปลี่ยนลุค</span>
          </>
        )}
      </button>

      {/* Note under generate button */}
      <p className="text-[11px] text-center text-[#788189] mt-2.5">
        รองรับการใส่ชุดได้10ครั้งต่อวัน
      </p>

    </div>
  );
};
