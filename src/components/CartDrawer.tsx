import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X, ArrowRight, ShieldCheck, QrCode, CreditCard, Banknote, CheckCircle, Tag } from 'lucide-react';
import { CartItem, Order } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, qty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onToggleSelect: (cartItemId: string, selected: boolean) => void;
  onOrderSuccess: (order: Order) => void;
  defaultVoucher?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelect,
  onOrderSuccess,
  defaultVoucher = 'ISARAVIP'
}) => {
  const [voucherCode, setVoucherCode] = useState(defaultVoucher);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('88/1 อาคารไอซาร่า ทาวเวอร์ ชั้น 18 ถนนสุขุมวิท คลองเตย กทม. 10110');
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'credit_card' | 'cod' | 'truemoney'>('promptpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Selected items calculation
  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Apply voucher
  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (code === 'ISARAVIP') {
      const disc = Math.round(subtotal * 0.2);
      setDiscountAmount(disc);
      setAppliedVoucher('ISARAVIP (ลด 20%)');
    } else if (code === 'TRYONFREE') {
      setDiscountAmount(100);
      setAppliedVoucher('TRYONFREE (ลด ฿100)');
    } else if (code === 'HMNEW10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setAppliedVoucher('HMNEW10 (ลด 10%)');
    } else {
      alert('ไม่พบโค้ดส่วนลดนี้ หรือหมดอายุแล้ว');
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Submit Checkout to backend
  const handleCheckoutSubmit = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedItems,
          paymentMethod,
          shippingAddress,
          voucherCode: appliedVoucher,
          discount: discountAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        setCompletedOrder(data.order);
        onOrderSuccess(data.order);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Side Cart Container */}
      <div className="w-full max-w-md h-full bg-[#0d1012] border-l border-[#242b32] flex flex-col justify-between shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#20272e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#cbb592]" />
            <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide">
              ตะกร้าสินค้า ({cartItems.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="w-12 h-12 text-gray-600 mb-2 stroke-1" />
              <p className="text-sm text-gray-400">ยังไม่มีสินค้าในตะกร้า</p>
              <button
                onClick={onClose}
                className="mt-3 text-xs text-[#cbb592] underline font-medium"
              >
                เลือกดูสินค้าในร้านค้า &rarr;
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#14191d] border border-[#273038] flex items-center gap-3 relative"
              >
                {/* Select Checkbox */}
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={(e) => onToggleSelect(item.id, e.target.checked)}
                  className="w-4 h-4 rounded accent-[#1b382b] cursor-pointer"
                />

                {/* Product Photo */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#37444f]"
                />

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[10px] text-[#8e969e] uppercase block font-medium">
                    {item.product.brand}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    ไซส์: {item.size} • สี: {item.color}
                  </p>
                  <p className="text-xs font-extrabold text-[#d4b588] mt-1">
                    ฿{item.product.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-500 hover:text-red-400 p-1"
                    title="ลบรายการ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 bg-[#1c2328] px-2 py-0.5 rounded-lg border border-[#313d47]">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="text-gray-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white font-mono min-w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-[#111518] border-t border-[#222930] space-y-3">
            
            {/* Voucher input */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#171c20] px-3 py-2 rounded-xl border border-[#2d3740]">
                <Tag className="w-3.5 h-3.5 text-[#cbb592]" />
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="โค้ดส่วนลด (เช่น ISARAVIP)"
                  className="bg-transparent text-xs text-white uppercase outline-none w-full"
                />
              </div>
              <button
                onClick={handleApplyVoucher}
                className="px-3.5 py-2 rounded-xl bg-[#1b382b] text-[#f5ebd9] text-xs font-semibold hover:bg-[#224737] border border-[#cbb592]/50"
              >
                ใช้โค้ด
              </button>
            </div>

            {appliedVoucher && (
              <div className="flex items-center justify-between text-xs text-[#cbb592] bg-[#16271e] p-2 rounded-lg border border-[#cbb592]/30">
                <span>โค้ดที่ใช้: {appliedVoucher}</span>
                <span>-฿{discountAmount.toLocaleString()}</span>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>ยอดรวมสินค้า ({selectedItems.length} รายการ)</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#cbb592]">
                  <span>ส่วนลดพิเศษ</span>
                  <span>-฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>ค่าจัดส่งพรีเมียม</span>
                <span className="text-[#cbb592]">ฟรี</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#232a32]">
                <span>ยอดชำระสุทธิ</span>
                <span className="text-base text-[#dfa24b] font-extrabold">
                  ฿{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              disabled={selectedItems.length === 0}
              onClick={() => setShowCheckoutModal(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#18392b] text-white font-bold text-sm tracking-wider border border-[#cbb592]/70 shadow-[0_4px_20px_rgba(24,57,43,0.7)] hover:bg-[#204b38] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>สั่งซื้อสินค้า ({selectedItems.length} ชิ้น)</span>
              <ArrowRight className="w-4 h-4 text-[#cbb592]" />
            </button>

          </div>
        )}

      </div>

      {/* Interactive Checkout Modal (PromptPay QR / Credit Card) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0f1215] border border-[#2b333a] rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {completedOrder ? (
              /* ORDER SUCCESS SCREEN */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#18392b] text-[#cbb592] flex items-center justify-center mx-auto border-2 border-[#cbb592] shadow-xl">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-serif-luxury text-2xl font-bold gold-gradient-text">
                  สั่งซื้อและชำระเงินสำเร็จ!
                </h3>
                <p className="text-xs text-gray-300">
                  หมายเลขคำสั่งซื้อ: <strong className="text-white font-mono">{completedOrder.orderNumber}</strong>
                </p>
                <div className="p-3 bg-[#171c20] rounded-2xl border border-[#2c3740] text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">สถานะจัดส่ง:</span>
                    <span className="text-[#cbb592] font-semibold">กำลังจัดเตรียมสินค้า</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">เลขพัสดุ Flash Express:</span>
                    <span className="text-white font-mono">{completedOrder.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ยอดชำระ:</span>
                    <span className="text-[#dfa24b] font-bold">฿{completedOrder.finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    setShowCheckoutModal(false);
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-[#18392b] text-white font-bold text-xs border border-[#cbb592]/70 hover:bg-[#214a38]"
                >
                  เรียบร้อย (กลับสู่หน้าช้อปปิ้ง)
                </button>
              </div>
            ) : (
              /* CHECKOUT PAYMENT FORM */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242b32]">
                  <h3 className="font-serif-luxury text-base font-bold text-white">
                    ยืนยันคำสั่งซื้อและการชำระเงิน
                  </h3>
                  <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Shipping Address */}
                <div className="p-3 bg-[#151a1e] rounded-2xl border border-[#283138] space-y-1 text-left">
                  <label className="text-[11px] font-semibold text-[#cbb592] block">ที่อยู่จัดส่งสินค้า</label>
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-[#0b0e10] p-2 rounded-xl text-xs text-white border border-[#34404a] outline-none"
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-2 text-left">
                  <label className="text-[11px] font-semibold text-[#cbb592] block">เลือกวิธีชำระเงิน</label>
                  
                  {/* PromptPay */}
                  <div
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'promptpay' ? 'bg-[#182a20] border-[#cbb592] text-white' : 'bg-[#151a1e] border-[#29323a] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-5 h-5 text-[#cbb592]" />
                      <div>
                        <div className="text-xs font-bold">พร้อมเพย์ (PromptPay QR)</div>
                        <div className="text-[10px] text-gray-400">สแกนจ่ายได้ทุกแอปธนาคาร ไม่มีค่าธรรมเนียม</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'promptpay' ? 'bg-[#cbb592] border-[#cbb592]' : 'border-gray-500'}`} />
                  </div>

                  {/* Credit Card */}
                  <div
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'credit_card' ? 'bg-[#182a20] border-[#cbb592] text-white' : 'bg-[#151a1e] border-[#29323a] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-[#cbb592]" />
                      <div>
                        <div className="text-xs font-bold">บัตรเครดิต / เดบิต (Visa, Mastercard, JCB)</div>
                        <div className="text-[10px] text-gray-400">ผ่อน 0% สูงสุด 10 เดือน</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'credit_card' ? 'bg-[#cbb592] border-[#cbb592]' : 'border-gray-500'}`} />
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'bg-[#182a20] border-[#cbb592] text-white' : 'bg-[#151a1e] border-[#29323a] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-5 h-5 text-[#cbb592]" />
                      <div>
                        <div className="text-xs font-bold">เก็บเงินปลายทาง (COD)</div>
                        <div className="text-[10px] text-gray-400">ชำระเงินเมื่อสินค้าส่งถึงหน้าบ้าน</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'cod' ? 'bg-[#cbb592] border-[#cbb592]' : 'border-gray-500'}`} />
                  </div>
                </div>

                {/* Simulated PromptPay QR Preview */}
                {paymentMethod === 'promptpay' && (
                  <div className="p-3 bg-white text-black rounded-2xl text-center shadow-lg">
                    <span className="text-[11px] font-bold text-[#142e22] block">สแกนจ่ายผ่าน Thai QR PromptPay</span>
                    {/* Simulated QR Code Canvas */}
                    <div className="w-36 h-36 mx-auto my-2 p-2 border-2 border-dashed border-[#142e22] flex flex-col items-center justify-center">
                      <QrCode className="w-28 h-28 text-[#142e22]" />
                    </div>
                    <span className="text-xs font-mono font-bold">ยอดเงิน ฿{finalTotal.toLocaleString()}</span>
                  </div>
                )}

                {/* Final Pay Button */}
                <button
                  disabled={isProcessing}
                  onClick={handleCheckoutSubmit}
                  className="w-full py-3.5 rounded-xl bg-[#18392b] text-white font-bold text-sm tracking-wider border border-[#cbb592] shadow-xl hover:bg-[#214a38] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? 'กำลังยืนยันคำสั่งซื้อ...' : `ชำระเงิน ฿${finalTotal.toLocaleString()}`}
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
