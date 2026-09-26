import React, { useState } from 'react';
import { Mail, Phone, Apple, Shield, ArrowRight, Lock, X } from 'lucide-react';
import { UserProfile } from '../types';
import loginBgImage from '../assets/images/isara_login_bg_1790310980791.jpg';

interface WelcomeScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onExploreGuest: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginSuccess,
  onExploreGuest
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'options' | 'google' | 'apple' | 'phone' | 'admin'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailInput, setEmailInput] = useState('nuarotchatthai@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle multi-provider login connected to backend
  const handleAuthSubmit = async (provider: 'google' | 'apple' | 'phone' | 'admin') => {
    setLoading(true);
    try {
      let payload: any = { provider };
      if (provider === 'google') {
        payload.email = emailInput || 'nuarotchatthai@gmail.com';
        payload.name = 'คุณนุชรจ (Google Account)';
        payload.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
      } else if (provider === 'apple') {
        payload.email = 'apple.user@icloud.com';
        payload.name = 'ISARA Apple User';
        payload.avatar = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80';
      } else if (provider === 'phone') {
        payload.phone = phoneNumber || '081-234-5678';
        payload.name = `สมาชิกเบอร์ (${phoneNumber || '081-234-5678'})`;
        payload.avatar = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80';
      } else if (provider === 'admin') {
        payload.name = 'ผู้ดูแลระบบ ISARA (Master Admin)';
        payload.role = 'admin';
        payload.email = 'admin@isara.style';
        payload.avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80';
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#090b0c] text-white flex flex-col justify-between overflow-hidden select-none">
      
      {/* Background Hero Image with ISARA Family - matching IMG_20260925_101023.jpg */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBgImage}
          alt="ISARA Family Portrait - Style For Every You"
          className="w-full h-full object-cover object-center filter contrast-[1.03] brightness-[0.96]"
          referrerPolicy="no-referrer"
        />
        {/* Subtle cinematic top and bottom gradients for readability */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
      </div>

      {/* Top Branding Section (Matching IMG_20260925_101023.jpg) */}
      <div className="relative z-10 pt-10 sm:pt-14 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold tracking-[0.24em] pl-[0.24em] gold-gradient-text drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] leading-tight">
          ISARA
        </h1>
        <p className="text-[10px] sm:text-xs tracking-[0.32em] pl-[0.32em] text-[#d8c5aa] uppercase font-medium mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          STYLE FOR EVERY YOU
        </p>
      </div>

      {/* Spacer to keep central family portrait clear and unobscured */}
      <div className="flex-1" />

      {/* Bottom Action Area (Exact button styling and layout from IMG_20260925_101023.jpg) */}
      <div className="relative z-10 px-6 pb-10 sm:pb-12 flex flex-col items-center w-full max-w-sm mx-auto space-y-3.5">
        
        {/* 1. ปุ่ม "เริ่มต้นใช้งาน" (Dark Pine/Forest Green with Fine Champagne Gold Border) */}
        <button
          onClick={() => {
            setAuthMethod('options');
            setShowAuthModal(true);
          }}
          className="w-full py-4 px-8 rounded-full bg-[#152e22]/95 hover:bg-[#1b3d2d] text-[#ffffff] font-bold text-base sm:text-lg tracking-wide border border-[#cbb085] shadow-[0_8px_25px_rgba(0,0,0,0.7)] active:scale-[0.98] transition-all flex items-center justify-center backdrop-blur-sm"
        >
          <span>เริ่มต้นใช้งาน</span>
        </button>

        {/* 2. ข้อความ "เข้าสู่ระบบ" in warm champagne gold */}
        <button
          onClick={() => {
            setAuthMethod('options');
            setShowAuthModal(true);
          }}
          className="text-sm sm:text-base font-semibold text-[#e1cfb4] hover:text-[#f7e6c9] tracking-wider transition-colors pt-1"
        >
          เข้าสู่ระบบ
        </button>

        {/* Guest Explore link */}
        <button
          onClick={onExploreGuest}
          className="text-xs text-[#a0a7ae]/90 hover:text-white tracking-wider transition-colors pt-1"
        >
          เข้าชมสินค้าก่อนในฐานะผู้มาเยือน &rarr;
        </button>
      </div>

      {/* Multi-Provider Auth Modal (Gmail, Apple, Phone OTP, Admin) in Cohesive Color Theme */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0f1315] border border-[#2b3338] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="font-serif-luxury text-2xl font-bold gold-gradient-text tracking-wider">
                ISARA MEMBERSHIP
              </h3>
              <p className="text-xs text-[#a49b8a] mt-1">
                เข้าสู่ระบบเพื่อลองชุด AI ไม่จำกัด และสะสมสิทธิพิเศษ
              </p>
            </div>

            {/* Options Mode */}
            {authMethod === 'options' && (
              <div className="space-y-3">
                {/* 1. Google (Gmail) */}
                <button
                  onClick={() => setAuthMethod('google')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#171b1e] border border-[#2e373d] hover:border-[#cbb592]/50 hover:bg-[#1f252a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow">
                      {/* Google G logo */}
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.26 21.36 7.36 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white group-hover:text-[#cbb592]">
                        ดำเนินการต่อด้วย Google (Gmail)
                      </div>
                      <div className="text-[11px] text-gray-400">nuarotchatthai@gmail.com</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </button>

                {/* 2. Apple Store / Apple ID */}
                <button
                  onClick={() => setAuthMethod('apple')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#171b1e] border border-[#2e373d] hover:border-[#cbb592]/50 hover:bg-[#1f252a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black border border-white/20 flex items-center justify-center">
                      <Apple className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white group-hover:text-[#cbb592]">
                        ดำเนินการต่อด้วย Apple ID
                      </div>
                      <div className="text-[11px] text-gray-400">ปลอดภัยด้วย Face ID / Touch ID</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </button>

                {/* 3. Phone Number OTP */}
                <button
                  onClick={() => setAuthMethod('phone')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#171b1e] border border-[#2e373d] hover:border-[#cbb592]/50 hover:bg-[#1f252a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#142e22] text-[#cbb592] border border-[#cbb592]/40 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white group-hover:text-[#cbb592]">
                        เข้าสู่ระบบด้วยเบอร์โทรศัพท์
                      </div>
                      <div className="text-[11px] text-gray-400">รับรหัสยืนยัน OTP ผ่าน SMS</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </button>

                {/* 4. Admin Management Login */}
                <div className="pt-2 border-t border-[#22272b]">
                  <button
                    onClick={() => setAuthMethod('admin')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#10241b]/70 border border-[#cbb592]/30 hover:bg-[#142e22] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-[#cbb592]" />
                      <span className="text-xs font-medium text-[#f5ebd9]">เข้าสู่ระบบหลังบ้านผู้ดูแล (Admin)</span>
                    </div>
                    <span className="text-[10px] text-[#cbb592] font-semibold">เข้าสู่ระบบ &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* Google Form */}
            {authMethod === 'google' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#182025] rounded-2xl border border-[#2d3942]">
                  <label className="text-xs text-[#a49b8a] block mb-1">บัญชี Gmail ที่ต้องการเข้าสู่ระบบ</label>
                  <div className="flex items-center gap-2 bg-[#0b0e10] p-2.5 rounded-xl border border-[#3b4750]">
                    <Mail className="w-4 h-4 text-[#cbb592]" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@gmail.com"
                      className="bg-transparent text-sm w-full outline-none text-white"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={() => handleAuthSubmit('google')}
                  className="w-full py-3.5 rounded-2xl bg-[#152e22] text-white font-semibold text-sm border border-[#cbb592]/60 hover:bg-[#1c3c2d] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? 'กำลังเชื่อมต่อ...' : 'ยืนยันเข้าสู่ระบบด้วย Gmail'}
                </button>

                <button
                  onClick={() => setAuthMethod('options')}
                  className="w-full text-xs text-gray-400 hover:text-white py-1"
                >
                  &larr; เลือกวิธีอื่น
                </button>
              </div>
            )}

            {/* Apple Form */}
            {authMethod === 'apple' && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-[#171b1e] rounded-2xl border border-[#2b3338]">
                  <Apple className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-sm font-semibold">Sign in with Apple ID</p>
                  <p className="text-xs text-gray-400 mt-1">nuarotchatthai@privaterelay.appleid.com</p>
                </div>

                <button
                  disabled={loading}
                  onClick={() => handleAuthSubmit('apple')}
                  className="w-full py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? 'กำลังยืนยันตัวตน...' : 'เข้าสู่ระบบด้วย Apple'}
                </button>

                <button
                  onClick={() => setAuthMethod('options')}
                  className="w-full text-xs text-gray-400 hover:text-white py-1"
                >
                  &larr; เลือกวิธีอื่น
                </button>
              </div>
            )}

            {/* Phone OTP Form */}
            {authMethod === 'phone' && (
              <div className="space-y-4">
                {!otpSent ? (
                  <div>
                    <label className="text-xs text-[#a49b8a] block mb-1">กรอกหมายเลขโทรศัพท์ 10 หลัก</label>
                    <div className="flex items-center gap-2 bg-[#161a1d] p-3 rounded-2xl border border-[#2f3840]">
                      <span className="text-xs text-[#cbb592] font-semibold">+66</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="081 234 5678"
                        className="bg-transparent text-sm w-full outline-none text-white tracking-wider"
                      />
                    </div>
                    <button
                      onClick={() => setOtpSent(true)}
                      className="w-full mt-3 py-3 rounded-2xl bg-[#152e22] text-white font-semibold text-xs border border-[#cbb592]/50 hover:bg-[#1c3c2d]"
                    >
                      ส่งรหัส OTP
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-[#a49b8a] block mb-1">กรอกรหัส OTP 6 หลักที่ส่งไปที่ {phoneNumber || '081-234-5678'}</label>
                    <div className="flex items-center gap-2 bg-[#161a1d] p-3 rounded-2xl border border-[#2f3840]">
                      <Lock className="w-4 h-4 text-[#cbb592]" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="1 2 3 4 5 6"
                        className="bg-transparent text-center font-mono text-base tracking-[0.4em] w-full outline-none text-white"
                      />
                    </div>
                    <button
                      disabled={loading}
                      onClick={() => handleAuthSubmit('phone')}
                      className="w-full mt-3 py-3 rounded-2xl bg-[#152e22] text-white font-semibold text-xs border border-[#cbb592]/50 hover:bg-[#1c3c2d]"
                    >
                      {loading ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP'}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setAuthMethod('options')}
                  className="w-full text-xs text-gray-400 hover:text-white py-1"
                >
                  &larr; เลือกวิธีอื่น
                </button>
              </div>
            )}

            {/* Admin Form */}
            {authMethod === 'admin' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#15241b] rounded-2xl border border-[#cbb592]/30 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#cbb592]">
                    <Shield className="w-4 h-4" />
                    <span>ระบบหลังบ้าน ISARA Administrator</span>
                  </div>
                  <p className="text-[11px] text-gray-300 mt-1">
                    จัดการสินค้า, คำสั่งซื้อ, ประวัติการลองชุด AI, และรายการไลฟ์สด
                  </p>
                </div>

                <div className="bg-[#161a1d] p-3 rounded-2xl border border-[#2f3840]">
                  <label className="text-[11px] text-gray-400 block mb-1">รหัสผ่านผู้ดูแลระบบ</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent text-sm w-full outline-none text-white"
                  />
                </div>

                <button
                  disabled={loading}
                  onClick={() => handleAuthSubmit('admin')}
                  className="w-full py-3.5 rounded-2xl bg-[#152e22] text-white font-semibold text-xs border border-[#cbb592]/60 hover:bg-[#1c3c2d] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? 'กำลังเข้าสู่ระบบหลังบ้าน...' : 'เข้าสู่แผงควบคุมหลังบ้าน'}
                </button>

                <button
                  onClick={() => setAuthMethod('options')}
                  className="w-full text-xs text-gray-400 hover:text-white py-1"
                >
                  &larr; กลับหน้าหลัก
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
