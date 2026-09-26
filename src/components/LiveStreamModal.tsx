import React, { useState, useEffect } from 'react';
import { X, Heart, Send, ShoppingBag, Sparkles, Users, Radio, MessageSquare } from 'lucide-react';
import { Product, LiveMessage } from '../types';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectTryOn: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  pinnedProduct: Product;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  isOpen,
  onClose,
  onDirectTryOn,
  onAddToCart,
  pinnedProduct
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<LiveMessage[]>([
    {
      id: 'm1',
      sender: 'ISARA Stylist Nana',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      message: 'สวัสดีค่าทุกคน! วันนี้เรามารีวิวกางเกงผ้าลินินสีเบจตัวจริง ใส่แล้วทรงสวยมากกก',
      time: '20:10',
      isHost: true,
      badge: 'ผู้จัด'
    },
    {
      id: 'm2',
      sender: 'kanyarat_99',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      message: 'CF 1 ตัวค่ะ ไซส์ M สวยมากก',
      time: '20:11'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(2485);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  // Periodically increment viewers
  useEffect(() => {
    const timer = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: LiveMessage = {
      id: `msg-${Date.now()}`,
      sender: 'คุณ (ฉัน)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      message: chatInput.trim(),
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const handleSendHeart = () => {
    const newHeart = {
      id: Date.now(),
      x: 60 + Math.random() * 40
    };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Live Mobile Frame */}
      <div className="relative w-full max-w-md h-full sm:h-[90vh] bg-black sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl border border-[#2b333a]">
        
        {/* Background Video Simulation */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
            alt="Live Stream Host"
            className="w-full h-full object-cover brightness-90 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />
        </div>

        {/* Floating Hearts Area */}
        <div className="absolute right-4 bottom-24 pointer-events-none z-30">
          {hearts.map(h => (
            <div
              key={h.id}
              style={{ left: `${h.x}px` }}
              className="absolute bottom-0 animate-float-heart"
            >
              <Heart className="w-8 h-8 fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
          ))}
        </div>

        {/* Top Live Bar */}
        <div className="relative z-10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Host"
              className="w-8 h-8 rounded-full object-cover border border-[#cbb592]"
            />
            <div className="text-left">
              <span className="text-xs font-bold text-white block">Nana & Stylists</span>
              <span className="text-[10px] text-[#cbb592]">ISARA Official Live</span>
            </div>
            <button className="px-2.5 py-0.5 rounded-full bg-[#18392b] text-white text-[10px] font-bold border border-[#cbb592]/50 hover:bg-[#204a38]">
              ติดตาม
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs border border-white/10 font-mono">
              <Users className="w-3.5 h-3.5 text-[#cbb592]" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Area: Pinned Product + Live Chat Stream + Actions */}
        <div className="relative z-10 p-4 space-y-3">
          
          {/* Pinned Product Card (Instant Checkout & Try-on) */}
          <div className="bg-[#121619]/90 backdrop-blur-md border border-[#cbb592]/60 rounded-2xl p-3 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2.5">
              <img
                src={pinnedProduct.image}
                alt={pinnedProduct.name}
                className="w-13 h-13 rounded-xl object-cover border border-[#3b4752]"
              />
              <div className="text-left">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold uppercase">
                  ลดพิเศษในไลฟ์
                </span>
                <h5 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                  {pinnedProduct.name}
                </h5>
                <span className="text-xs font-extrabold text-[#dfa24b]">
                  ฿{pinnedProduct.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onDirectTryOn(pinnedProduct);
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#1b252b] text-[#cbb592] border border-[#374550] text-[11px] font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#cbb592]" />
                <span>ลองชุด</span>
              </button>
              <button
                onClick={() => onAddToCart(pinnedProduct)}
                className="px-3 py-1.5 rounded-xl bg-[#18392b] text-white border border-[#cbb592] text-[11px] font-bold flex items-center gap-1 hover:bg-[#204a38]"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>CF ทันที</span>
              </button>
            </div>
          </div>

          {/* Live Chat Stream (Scrollable) */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-1.5 text-xs text-white bg-black/40 backdrop-blur-sm p-1.5 px-2.5 rounded-xl max-w-[85%]">
                <span className={`font-bold ${m.isHost ? 'text-[#dfa24b]' : 'text-[#cbb592]'}`}>
                  {m.sender}:
                </span>
                <span className="text-gray-200 text-[11px] leading-tight">{m.message}</span>
              </div>
            ))}
          </div>

          {/* Chat Form & Heart Reaction */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ร่วมพูดคุยหรือพิมพ์ CF สินค้า..."
              className="flex-1 bg-black/60 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-400 outline-none focus:border-[#cbb592]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2.5 rounded-full bg-[#18392b] text-[#cbb592] border border-[#cbb592]/50 hover:bg-[#204a38]"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSendHeart}
              className="p-2.5 rounded-full bg-red-600/80 text-white hover:bg-red-600 transition-all active:scale-125 shadow-lg"
            >
              <Heart className="w-4 h-4 fill-white" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
