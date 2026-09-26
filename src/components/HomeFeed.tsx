import React, { useState } from 'react';
import { 
  Sparkles, MessageCircle, Share2, ShoppingBag, Heart, Check, X, Send, 
  Volume2, VolumeX, Plus, Camera, Upload, Image as ImageIcon, RotateCw, Layers 
} from 'lucide-react';
import { FeedPost, Product } from '../types';

interface HomeFeedProps {
  feedPosts: FeedPost[];
  products?: Product[];
  currentUser?: { name: string; avatar: string; email?: string };
  onLikePost: (postId: string) => void;
  onAddToCart: (product: Product) => void;
  onDirectTryOn: (product: Product) => void;
  onCommentPost: (postId: string, comment: string) => void;
  onAddPost?: (newPost: FeedPost) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  feedPosts,
  products = [],
  currentUser,
  onLikePost,
  onAddToCart,
  onDirectTryOn,
  onCommentPost,
  onAddPost
}) => {
  const [activeCommentPost, setActiveCommentPost] = useState<FeedPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [sharedPost, setSharedPost] = useState<FeedPost | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Active viewing angle per post: id -> 'front' | 'back' | 'side' | 'detail'
  const [postActiveAngles, setPostActiveAngles] = useState<Record<string, 'front' | 'back' | 'side' | 'detail'>>({});

  // Post Creation Modal State
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postPrice, setPostPrice] = useState('1290');
  const [postDescription, setPostDescription] = useState('');
  const [selectedLinkedProductId, setSelectedLinkedProductId] = useState<string>(products[0]?.id || 'prod-1');

  // Multi-angle Template Selection: 'split_dual' | 'interactive_flip' | 'lookbook_grid'
  const [postLayoutTemplate, setPostLayoutTemplate] = useState<'split_dual' | 'interactive_flip' | 'lookbook_grid'>('split_dual');

  // Multi-angle Template Upload Slots
  const [postFrontImage, setPostFrontImage] = useState<string>('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80');
  const [postBackImage, setPostBackImage] = useState<string>('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80');
  const [postSideImage, setPostSideImage] = useState<string>('');
  const [postDetailImage, setPostDetailImage] = useState<string>('');
  const [modalPreviewAngle, setModalPreviewAngle] = useState<'front' | 'back' | 'side' | 'detail'>('front');

  // Quick Preset Sample Fillers for Post Creation
  const applyPostSamplePreset = (preset: 'linen' | 'knit' | 'blazer') => {
    if (preset === 'linen') {
      setPostTitle('กางเกงขาสั้นเอวสูง ผ้าลินินธรรมชาติ (ลุคหน้า-หลัง)');
      setPostPrice('1290');
      setPostDescription('ผ้าลินินทอละเอียด ทรงสวยมาก ตัดเย็บเนี้ยบทั้งด้านหน้าและด้านหลัง แมตช์ง่ายสุดๆ #OOTD #ISARAFashion');
      setPostFrontImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80');
      setPostBackImage('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80');
      setPostSideImage('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80');
      setPostDetailImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80');
      setPostLayoutTemplate('split_dual');
      setSelectedLinkedProductId(products[0]?.id || 'prod-1');
    } else if (preset === 'knit') {
      setPostTitle('เสื้อครอปไหมพรมแขนพอง ลักชัวรีชิค');
      setPostPrice('2450');
      setPostDescription('งานถักนิตติ้งระดับไฮเอนด์ ด้านหลังเก็บทรงสวย กระชับพอดีตัว ใส่แล้วหุ่นเป๊ะ #ChicLook #Luxury');
      setPostFrontImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80');
      setPostBackImage('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80');
      setPostSideImage('');
      setPostDetailImage('');
      setPostLayoutTemplate('interactive_flip');
      setSelectedLinkedProductId(products[1]?.id || 'prod-2');
    } else if (preset === 'blazer') {
      setPostTitle('สูทเบลเซอร์เทเลอร์ สไตล์สมาร์ทแคชชวล');
      setPostPrice('3690');
      setPostDescription('เบลเซอร์ทรงสลิมคัตติ้งเนี้ยบ รองรับการลองชุด AI แบบเสมือนจริง มีดีเทลทั้งด้านหน้าและด้านหลัง #Blazer #Executive');
      setPostFrontImage('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80');
      setPostBackImage('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80');
      setPostSideImage('');
      setPostDetailImage('');
      setPostLayoutTemplate('split_dual');
      setSelectedLinkedProductId(products[6]?.id || 'prod-7');
    }
    showToast('✨ โหลดเทมเพลตรูปภาพหน้า-หลังเรียบร้อยแล้ว');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDoubleTap = (e: React.MouseEvent, post: FeedPost) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onLikePost(post.id);
    
    // Add floating heart
    const newHeart = { id: Date.now(), x, y };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeCommentPost) return;
    onCommentPost(activeCommentPost.id, newComment.trim());
    setNewComment('');
    showToast('ส่งความคิดเห็นเรียบร้อยแล้ว');
  };

  // Toggle angle on feed card
  const togglePostAngle = (postId: string, angle: 'front' | 'back' | 'side' | 'detail', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPostActiveAngles(prev => ({
      ...prev,
      [postId]: angle
    }));
  };

  // Quick flip between front and back
  const handleQuickFlip = (post: FeedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = postActiveAngles[post.id] || 'front';
    const next = current === 'front' ? 'back' : 'front';
    togglePostAngle(post.id, next);
  };

  // Handle image file upload for post creation
  const handlePostImageUpload = (angle: 'front' | 'back' | 'side' | 'detail', file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (angle === 'front') {
        setPostFrontImage(dataUrl);
        setModalPreviewAngle('front');
      } else if (angle === 'back') {
        setPostBackImage(dataUrl);
        setModalPreviewAngle('back');
      } else if (angle === 'side') {
        setPostSideImage(dataUrl);
        setModalPreviewAngle('side');
      } else if (angle === 'detail') {
        setPostDetailImage(dataUrl);
        setModalPreviewAngle('detail');
      }
    };
    reader.readAsDataURL(file);
  };

  // Publish new post
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      showToast('กรุณากรอกชื่อโพสต์');
      return;
    }
    if (!postFrontImage) {
      showToast('กรุณาอัปโหลดรูปภาพด้านหน้า');
      return;
    }

    const linkedProd = products.find(p => p.id === selectedLinkedProductId) || products[0];

    const newPost: FeedPost = {
      id: `feed-post-${Date.now()}`,
      author: {
        name: currentUser?.name || 'ฉัน',
        handle: `@${(currentUser?.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        verified: true
      },
      mediaUrl: postFrontImage,
      backMediaUrl: postBackImage || undefined,
      sideMediaUrl: postSideImage || undefined,
      detailMediaUrl: postDetailImage || undefined,
      angles: {
        front: postFrontImage,
        back: postBackImage || undefined,
        side: postSideImage || undefined,
        detail: postDetailImage || undefined
      },
      layoutTemplate: postLayoutTemplate,
      mediaType: 'image',
      title: postTitle.trim(),
      price: Number(postPrice) || linkedProd?.price || 1290,
      description: postDescription.trim() || 'แชร์ลุคแฟชั่นสุดพิเศษ พร้อมให้ลองชุด AI ได้ทันที!',
      likes: 1,
      isLiked: false,
      commentsCount: 0,
      sharesCount: 0,
      timeAgo: 'เมื่อสักครู่',
      linkedProductId: linkedProd?.id || 'prod-1',
      product: linkedProd
    };

    if (onAddPost) {
      onAddPost(newPost);
    }

    // Call server API
    fetch('/api/feed/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newPost.title,
        mediaUrl: newPost.mediaUrl,
        backMediaUrl: newPost.backMediaUrl,
        sideMediaUrl: newPost.sideMediaUrl,
        detailMediaUrl: newPost.detailMediaUrl,
        angles: newPost.angles,
        layoutTemplate: newPost.layoutTemplate,
        price: newPost.price,
        description: newPost.description,
        linkedProductId: newPost.linkedProductId
      })
    }).catch(() => {});

    setShowCreatePostModal(false);
    setPostTitle('');
    setPostDescription('');
    showToast('✨ เผยแพร่โพสต์แฟชั่นของคุณเรียบร้อยแล้ว!');
  };

  return (
    <div className="w-full pb-24 max-w-md mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-[#cbb592]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Create Post with Multi-Angle Templates */}
      <div className="pt-2 px-3">
        <div 
          onClick={() => setShowCreatePostModal(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-[#17231c] via-[#121c17] to-[#121619] border border-[#cbb592]/50 hover:border-[#cbb592] flex items-center justify-between cursor-pointer shadow-lg transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1b3d2e] border border-[#cbb592]/60 flex items-center justify-center text-[#cbb592] shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>ลงโพสต์ด้วยรูปภาพ</span>
                <span className="px-1.5 py-0.2 rounded bg-[#1f4a38] text-[#cbb592] text-[9px] font-bold border border-[#cbb592]/30">
                  เทมเพลตหน้า-หลัง
                </span>
              </h4>
              <p className="text-[10px] text-[#cbb592] mt-0.5">
                แชร์ลุคเสื้อผ้าหลายมุม กดดูหน้า-หลังได้ 360°
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] text-xs font-bold shadow flex items-center gap-1 group-hover:brightness-110"
          >
            <Plus className="w-3.5 h-3.5 text-[#cbb592]" />
            <span>สร้างโพสต์</span>
          </button>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-6 pt-3 px-3">
        {feedPosts.map((post) => {
          const activeAngle = postActiveAngles[post.id] || 'front';
          const hasBack = Boolean(post.backMediaUrl || post.angles?.back);
          const hasSide = Boolean(post.sideMediaUrl || post.angles?.side);
          const hasDetail = Boolean(post.detailMediaUrl || post.angles?.detail);
          const hasMultipleAngles = hasBack || hasSide || hasDetail;

          // Determine current displaying media URL
          let currentDisplayUrl = post.mediaUrl;
          if (activeAngle === 'back' && (post.backMediaUrl || post.angles?.back)) {
            currentDisplayUrl = post.backMediaUrl || post.angles?.back || post.mediaUrl;
          } else if (activeAngle === 'side' && (post.sideMediaUrl || post.angles?.side)) {
            currentDisplayUrl = post.sideMediaUrl || post.angles?.side || post.mediaUrl;
          } else if (activeAngle === 'detail' && (post.detailMediaUrl || post.angles?.detail)) {
            currentDisplayUrl = post.detailMediaUrl || post.angles?.detail || post.mediaUrl;
          }

          return (
            <article 
              key={post.id} 
              className="rounded-3xl bg-[#111417] border border-[#20252b] overflow-hidden shadow-2xl transition-all"
            >
              {/* Media Canvas / Presentation Area */}
              <div 
                onDoubleClick={(e) => handleDoubleTap(e, post)}
                className="relative w-full aspect-[4/5] bg-black overflow-hidden group cursor-pointer select-none"
              >
                {/* 1. DUAL SPLIT TEMPLATE (แบ่งเทมเพลตหน้า-หลังคู่กัน) */}
                {post.layoutTemplate === 'split_dual' && hasBack ? (
                  <div className="w-full h-full grid grid-cols-2 divide-x divide-[#cbb592]/30 relative">
                    {/* Left: Front View */}
                    <div 
                      onClick={(e) => { e.stopPropagation(); togglePostAngle(post.id, 'front'); }}
                      className="relative h-full overflow-hidden group/front"
                    >
                      <img
                        src={post.mediaUrl || post.angles?.front}
                        alt={`${post.title} ด้านหน้า`}
                        className={`w-full h-full object-cover transition-all duration-500 ${activeAngle === 'front' ? 'scale-105 brightness-105' : 'group-hover/front:scale-105 opacity-90'}`}
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-2.5 z-20 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#f5ebd9] border border-[#cbb592]/70 text-[9px] font-bold shadow flex items-center gap-1">
                        <span>📸 หน้า</span>
                      </div>
                    </div>

                    {/* Right: Back View */}
                    <div 
                      onClick={(e) => { e.stopPropagation(); togglePostAngle(post.id, 'back'); }}
                      className="relative h-full overflow-hidden group/back"
                    >
                      <img
                        src={post.backMediaUrl || post.angles?.back || post.mediaUrl}
                        alt={`${post.title} ด้านหลัง`}
                        className={`w-full h-full object-cover transition-all duration-500 ${activeAngle === 'back' ? 'scale-105 brightness-105' : 'group-hover/back:scale-105 opacity-90'}`}
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#dfa24b] border border-[#dfa24b]/70 text-[9px] font-bold shadow flex items-center gap-1">
                        <span>🔄 หลัง</span>
                      </div>
                    </div>

                    {/* Center Luxury Badge */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#18392b]/95 backdrop-blur-md border border-[#cbb592] text-[8px] font-extrabold text-[#f5ebd9] shadow-lg tracking-wider whitespace-nowrap">
                        เทมเพลต หน้า ✦ หลัง
                      </span>
                    </div>
                  </div>
                ) : post.layoutTemplate === 'lookbook_grid' && (hasBack || hasSide || hasDetail) ? (
                  /* 2. LOOKBOOK COLLAGE GRID TEMPLATE (คอลลาจหลายมุม) */
                  <div className="w-full h-full grid grid-cols-5 gap-1 p-1 bg-black relative">
                    {/* Main Front (3 cols) */}
                    <div className="col-span-3 h-full relative overflow-hidden rounded-2xl">
                      <img
                        src={post.mediaUrl || post.angles?.front}
                        alt={`${post.title} ด้านหน้า`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-bold text-white border border-white/20">
                        📸 หน้า
                      </span>
                    </div>
                    {/* Stacked Back & Side/Detail (2 cols) */}
                    <div className="col-span-2 h-full flex flex-col gap-1">
                      <div className="flex-1 relative overflow-hidden rounded-xl">
                        <img
                          src={post.backMediaUrl || post.angles?.back || post.mediaUrl}
                          alt={`${post.title} ด้านหลัง`}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-[8px] font-bold text-[#dfa24b] border border-[#dfa24b]/40">
                          🔄 หลัง
                        </span>
                      </div>
                      {(post.sideMediaUrl || post.detailMediaUrl) && (
                        <div className="flex-1 relative overflow-hidden rounded-xl">
                          <img
                            src={post.sideMediaUrl || post.detailMediaUrl || post.mediaUrl}
                            alt={`${post.title} ดีเทล`}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-[8px] font-bold text-[#cbb592] border border-[#cbb592]/40">
                            {post.sideMediaUrl ? '📐 ข้าง' : '🔍 ผ้า'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full bg-[#18392b]/95 backdrop-blur-md border border-[#cbb592] text-[8px] font-bold text-[#f5ebd9] shadow">
                        ลุคบุ๊กหลายมุม
                      </span>
                    </div>
                  </div>
                ) : (
                  /* 3. SINGLE / INTERACTIVE FLIP TEMPLATE */
                  <img
                    src={currentDisplayUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {/* Floating Hearts from double taps */}
                {floatingHearts.map(heart => (
                  <div
                    key={heart.id}
                    style={{ left: heart.x - 20, top: heart.y - 20 }}
                    className="absolute pointer-events-none z-30 animate-float-heart"
                  >
                    <Heart className="w-10 h-10 fill-red-500 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  </div>
                ))}

                {/* TOP BAR OVERLAY: Multi-Angle Template Selector (เทมเพลตหน้า-หลัง) for interactive_flip / standard */}
                {hasMultipleAngles && post.layoutTemplate !== 'split_dual' && post.layoutTemplate !== 'lookbook_grid' && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/75 backdrop-blur-md border border-[#cbb592]/50 shadow-xl">
                      {/* Button: หน้า */}
                      <button
                        onClick={(e) => togglePostAngle(post.id, 'front', e)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                          activeAngle === 'front'
                            ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] shadow-md'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <span>📸 ด้านหน้า</span>
                      </button>

                      {/* Button: หลัง */}
                      {hasBack && (
                        <button
                          onClick={(e) => togglePostAngle(post.id, 'back', e)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                            activeAngle === 'back'
                              ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] shadow-md'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          <span>🔄 ด้านหลัง</span>
                        </button>
                      )}

                      {/* Button: ข้าง */}
                      {hasSide && (
                        <button
                          onClick={(e) => togglePostAngle(post.id, 'side', e)}
                          className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                            activeAngle === 'side'
                              ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] shadow-md'
                            : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          📐 ข้าง
                        </button>
                      )}

                      {/* Button: ซูมผ้า */}
                      {hasDetail && (
                        <button
                          onClick={(e) => togglePostAngle(post.id, 'detail', e)}
                          className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                            activeAngle === 'detail'
                              ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] shadow-md'
                            : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          🔍 ผ้า
                        </button>
                      )}
                    </div>

                    {/* Quick Flip Button */}
                    {hasBack && (
                      <button
                        onClick={(e) => handleQuickFlip(post, e)}
                        title="คลิกเพื่อสลับหน้า-หลังทันที"
                        className="p-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-[#cbb592]/50 text-[#cbb592] hover:text-white active:rotate-180 transition-transform shadow-lg"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Badge if viewing Back View */}
                {activeAngle === 'back' && (
                  <div className="absolute top-14 left-3 z-15 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#dfa24b] text-[9px] font-semibold border border-[#dfa24b]/40">
                    🔄 กำลังแสดงมุมมองด้านหลัง (Back View)
                  </div>
                )}

                {/* Top Vignette and Sound toggle */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-end px-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Bottom Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Floating Diamond with likes count on bottom left */}
                <div className="absolute bottom-3 left-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLikePost(post.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-[#cbb592]/40 text-[#f5ebd9] hover:border-[#cbb592] active:scale-95 transition-all shadow-lg"
                  >
                    <div className="relative">
                      <svg 
                        className={`w-5 h-5 transition-transform duration-300 ${
                          post.isLiked ? 'text-[#dfa24b] scale-110' : 'text-[#cbb592]'
                        }`} 
                        viewBox="0 0 24 24" 
                        fill={post.isLiked ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <path d="M6 3h12l4 6-10 12L2 9z" />
                      </svg>
                      <span className="absolute -top-1 -right-1 text-[8px] text-[#dfa24b] animate-ping">✦</span>
                    </div>
                    <span className="text-xs font-semibold tracking-wider font-mono">
                      {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
                    </span>
                  </button>
                </div>

                {/* Quick Try-on Overlay Button on top-right */}
                <div className="absolute bottom-3 right-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (post.product) onDirectTryOn(post.product);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18392b]/90 backdrop-blur-md text-[#f5ebd9] border border-[#cbb592]/70 hover:bg-[#1f4736] text-xs font-semibold shadow-xl active:scale-95 transition-all"
                  >
                    <svg className="w-4 h-4 text-[#cbb592]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2 14v2h20v-2l-7.8-6.9c.5-.6.8-1.3.8-2.1a3 3 0 0 0-3-3z" />
                      <path d="M2 16h20" />
                    </svg>
                    <span>ลองชุดนี้</span>
                  </button>
                </div>
              </div>

              {/* Description Details */}
              <div className="p-4 space-y-2.5">
                
                {/* Product Title */}
                <h2 className="text-base font-bold text-white tracking-wide text-left">
                  {post.title}
                </h2>

                {/* Price in Gold */}
                <div className="text-base font-extrabold text-[#d4b588] tracking-tight text-left">
                  ฿{post.price.toLocaleString()}
                </div>

                {/* Thai Description */}
                <p className="text-xs text-[#a9b0b6] leading-relaxed line-clamp-2 text-left">
                  {post.description}
                </p>

                {/* Creator Metadata Row: Avatar + Handle + Time */}
                <div className="pt-2 flex items-center justify-between border-t border-[#1f252a]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#cbb592]/50 shadow"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#f0ebe1] hover:text-[#cbb592] cursor-pointer">
                        {post.author.handle}
                      </span>
                      <span className="text-[11px] text-[#788087]">
                        {post.timeAgo}
                      </span>
                    </div>
                  </div>

                  {/* Right Action Icons: Comment, Add to Cart, Share */}
                  <div className="flex items-center gap-3">
                    {/* Comment */}
                    <button
                      onClick={() => setActiveCommentPost(post)}
                      className="flex items-center gap-1 text-[#8c949e] hover:text-white"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.commentsCount}</span>
                    </button>

                    {/* Add to Cart */}
                    <button
                      onClick={() => {
                        if (post.product) {
                          onAddToCart(post.product);
                          showToast(`เพิ่ม "${post.product.name}" ลงในตะกร้าแล้ว`);
                        }
                      }}
                      className="p-1.5 rounded-full bg-[#172025] hover:bg-[#18392b] text-[#cbb592] hover:text-white border border-[#2b353e] transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => {
                        setSharedPost(post);
                        showToast('คัดลอกลิงก์โพสต์เรียบร้อย');
                      }}
                      className="text-[#8c949e] hover:text-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </article>
          );
        })}
      </div>

      {/* POST CREATION MODAL (ระบบลงโพสต์ด้วยรูปภาพ พร้อมแบ่งเทมเพลตหน้า-หลัง) */}
      {showCreatePostModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <form 
            onSubmit={handlePublishPost}
            className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#101417] border border-[#2c3743] rounded-3xl p-5 shadow-2xl space-y-3.5 text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#232b33]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#18392b] text-[#cbb592] border border-[#cbb592]/50 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ลงโพสต์ใหม่ด้วยรูปภาพ</h4>
                  <p className="text-[10px] text-[#cbb592]">ระบบเทมเพลตหลายมุม (ด้านหน้า, ด้านหลัง, มุมข้าง, ซูมผ้า)</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreatePostModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Price */}
            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">ชื่อโพสต์ / ชื่อชุดแฟชั่น</label>
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="เช่น ชุดเดรสลินินทรงเอ สไตล์มินิมอลชิค"
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none focus:border-[#cbb592]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">ราคา (บาท)</label>
                <input
                  type="number"
                  value={postPrice}
                  onChange={(e) => setPostPrice(e.target.value)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">ผูกกับสินค้า (ให้กดลองชุดได้)</label>
                <select
                  value={selectedLinkedProductId}
                  onChange={(e) => setSelectedLinkedProductId(e.target.value)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (฿{p.price.toLocaleString()})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MULTI-ANGLE TEMPLATES SECTION (แบ่งเทมเพลตหน้า-หลัง) */}
            <div className="p-3 rounded-2xl bg-[#0d1114] border border-[#293540] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#dfa24b]" />
                  <span>เทมเพลตมุมมองเสื้อผ้า (หน้า-หลัง-ข้าง-ผ้า)</span>
                </span>
                <span className="text-[9px] text-[#cbb592] bg-[#14281e] px-2 py-0.5 rounded-full border border-[#cbb592]/30 font-semibold">
                  เลือกเทมเพลตแสดงผล
                </span>
              </div>

              {/* Template Choice Tabs */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPostLayoutTemplate('split_dual')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    postLayoutTemplate === 'split_dual'
                      ? 'bg-[#18392b] border-[#cbb592] text-[#f5ebd9] shadow-md font-bold'
                      : 'bg-[#12161a] border-[#293540] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs mb-0.5">📸 ✦ 🔄</div>
                  <span className="text-[10px] block font-semibold">คู่หน้า-หลัง</span>
                  <span className="text-[8px] text-[#cbb592] block">Split Dual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostLayoutTemplate('interactive_flip')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    postLayoutTemplate === 'interactive_flip'
                      ? 'bg-[#18392b] border-[#cbb592] text-[#f5ebd9] shadow-md font-bold'
                      : 'bg-[#12161a] border-[#293540] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs mb-0.5">🔄 360°</div>
                  <span className="text-[10px] block font-semibold">สลับมุมมอง</span>
                  <span className="text-[8px] text-[#cbb592] block">Interactive Flip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostLayoutTemplate('lookbook_grid')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    postLayoutTemplate === 'lookbook_grid'
                      ? 'bg-[#18392b] border-[#cbb592] text-[#f5ebd9] shadow-md font-bold'
                      : 'bg-[#12161a] border-[#293540] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs mb-0.5">📐 ⊞ 🔍</div>
                  <span className="text-[10px] block font-semibold">คอลลาจ</span>
                  <span className="text-[8px] text-[#cbb592] block">Lookbook Grid</span>
                </button>
              </div>

              {/* Quick Sample Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[10px] text-gray-400 whitespace-nowrap">ตัวอย่างด่วน:</span>
                <button
                  type="button"
                  onClick={() => applyPostSamplePreset('linen')}
                  className="px-2 py-0.5 rounded-full bg-[#1b252c] hover:bg-[#25323a] text-[#cbb592] text-[9px] font-semibold border border-[#3b4752] whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  ✨ กางเกงลินินหน้า-หลัง
                </button>
                <button
                  type="button"
                  onClick={() => applyPostSamplePreset('knit')}
                  className="px-2 py-0.5 rounded-full bg-[#1b252c] hover:bg-[#25323a] text-[#cbb592] text-[9px] font-semibold border border-[#3b4752] whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  ✨ เสื้อไหมพรมหน้า-หลัง
                </button>
                <button
                  type="button"
                  onClick={() => applyPostSamplePreset('blazer')}
                  className="px-2 py-0.5 rounded-full bg-[#1b252c] hover:bg-[#25323a] text-[#cbb592] text-[9px] font-semibold border border-[#3b4752] whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  ✨ สูทเบลเซอร์หน้า-หลัง
                </button>
              </div>

              {/* Dynamic Live Preview Inside Modal */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-[#26313b] flex items-center justify-center">
                {postLayoutTemplate === 'split_dual' ? (
                  /* Split Dual Preview */
                  <div className="w-full h-full grid grid-cols-2 divide-x divide-[#cbb592]/30 relative">
                    <div className="relative h-full overflow-hidden">
                      {postFrontImage ? (
                        <img src={postFrontImage} alt="Front Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] text-gray-500">ใส่รูปหน้า</div>
                      )}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-white border border-[#cbb592]/50">
                        📸 หน้า
                      </span>
                    </div>

                    <div className="relative h-full overflow-hidden">
                      {postBackImage ? (
                        <img src={postBackImage} alt="Back Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] text-gray-500">ใส่รูปหลัง</div>
                      )}
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-[#dfa24b] border border-[#dfa24b]/50">
                        🔄 หลัง
                      </span>
                    </div>
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#18392b] border border-[#cbb592] text-[7px] font-bold text-[#f5ebd9]">
                      เทมเพลตคู่ หน้า-หลัง
                    </div>
                  </div>
                ) : postLayoutTemplate === 'lookbook_grid' ? (
                  /* Lookbook Collage Preview */
                  <div className="w-full h-full grid grid-cols-5 gap-1 p-1 bg-black relative">
                    <div className="col-span-3 h-full relative overflow-hidden rounded-lg">
                      {postFrontImage ? (
                        <img src={postFrontImage} alt="Front" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] text-gray-500">รูปหน้า</div>
                      )}
                      <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/80 text-[7px] text-white">📸 หน้า</span>
                    </div>
                    <div className="col-span-2 h-full flex flex-col gap-1">
                      <div className="flex-1 relative overflow-hidden rounded-lg">
                        {postBackImage ? (
                          <img src={postBackImage} alt="Back" className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-[9px] text-gray-500">รูปหลัง</div>
                        )}
                        <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/80 text-[7px] text-[#dfa24b]">🔄 หลัง</span>
                      </div>
                      <div className="flex-1 relative overflow-hidden rounded-lg bg-[#14191d]">
                        {postSideImage || postDetailImage ? (
                          <img src={postSideImage || postDetailImage} alt="Side" className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-[8px] text-gray-500">ข้าง/ผ้า</div>
                        )}
                        <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/80 text-[7px] text-[#cbb592]">📐 ข้าง/ผ้า</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Interactive Flip Preview */
                  <>
                    {(() => {
                      const currentImg = modalPreviewAngle === 'front' ? postFrontImage : modalPreviewAngle === 'back' ? postBackImage : modalPreviewAngle === 'side' ? postSideImage : postDetailImage;
                      return currentImg ? (
                        <img src={currentImg} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-gray-500 text-center p-3 text-xs">
                          ยังไม่มีรูปภาพในมุมนี้
                        </div>
                      );
                    })()}

                    {/* Floating Preview Switcher */}
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1.5 z-10">
                      {(['front', 'back', 'side', 'detail'] as const).map(ang => (
                        <button
                          key={ang}
                          type="button"
                          onClick={() => setModalPreviewAngle(ang)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all backdrop-blur-md ${
                            modalPreviewAngle === ang
                              ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] shadow-lg scale-105'
                              : 'bg-black/60 text-gray-300 border border-white/20'
                          }`}
                        >
                          {ang === 'front' ? '📸 ด้านหน้า' : ang === 'back' ? '🔄 ด้านหลัง' : ang === 'side' ? '📐 ด้านข้าง' : '🔍 ซูมผ้า'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 4 Image Upload Slots */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* 1. ด้านหน้า (Front - Required) */}
                <div className={`p-2 rounded-xl border text-left ${modalPreviewAngle === 'front' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-0.5">
                      <span>📸 ด้านหน้า</span>
                      <span className="text-red-400">*</span>
                    </span>
                    {postFrontImage && <span className="text-[8px] text-green-400 font-bold">✓ อัปแล้ว</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลดรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePostImageUpload('front', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={postFrontImage}
                    onChange={(e) => setPostFrontImage(e.target.value)}
                    placeholder="URL ภาพหน้า..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>

                {/* 2. ด้านหลัง (Back - Recommended) */}
                <div className={`p-2 rounded-xl border text-left ${modalPreviewAngle === 'back' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-0.5">
                      <span>🔄 ด้านหลัง</span>
                    </span>
                    {postBackImage && <span className="text-[8px] text-green-400 font-bold">✓ อัปแล้ว</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลดรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePostImageUpload('back', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={postBackImage}
                    onChange={(e) => setPostBackImage(e.target.value)}
                    placeholder="URL ภาพหลัง..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>

                {/* 3. ด้านข้าง (Side - Optional) */}
                <div className={`p-2 rounded-xl border text-left ${modalPreviewAngle === 'side' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white">📐 มุมข้าง</span>
                    {postSideImage && <span className="text-[8px] text-green-400 font-bold">✓ อัปแล้ว</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลด</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePostImageUpload('side', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={postSideImage}
                    onChange={(e) => setPostSideImage(e.target.value)}
                    placeholder="URL ภาพข้าง..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>

                {/* 4. ซูมเนื้อผ้า (Detail - Optional) */}
                <div className={`p-2 rounded-xl border text-left ${modalPreviewAngle === 'detail' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white">🔍 ซูมเนื้อผ้า</span>
                    {postDetailImage && <span className="text-[8px] text-green-400 font-bold">✓ อัปแล้ว</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลด</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePostImageUpload('detail', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={postDetailImage}
                    onChange={(e) => setPostDetailImage(e.target.value)}
                    placeholder="URL ซูมผ้า..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">แคปชันโพสต์ & รีวิว</label>
              <textarea
                rows={2}
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                placeholder="พิมพ์รีวิวการแต่งตัว ความรู้สึกเมื่อสวมใส่ และแฮชแท็ก #OOTD #ISARA"
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none focus:border-[#cbb592]"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreatePostModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-transparent border border-gray-600 text-gray-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#18392b] text-[#f5ebd9] text-xs font-bold border border-[#cbb592] hover:bg-[#204b38] shadow"
              >
                เผยแพร่โพสต์
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comment Drawer Modal */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13171a] border border-[#2b333a] rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl space-y-4 max-h-[80vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#232b31] pb-3">
              <h3 className="text-sm font-bold text-white text-left">
                ความคิดเห็น ({activeCommentPost.commentsCount})
              </h3>
              <button onClick={() => setActiveCommentPost(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comment Thread */}
            <div className="space-y-3 overflow-y-auto max-h-60 pr-1 text-left">
              <div className="flex items-start gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="user"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <span className="text-xs font-bold text-white block">@may_fashionista</span>
                  <p className="text-xs text-gray-300 mt-0.5">ชุดนี้ทรงสวยมากกก กดสลับดูด้านหลังแล้วคัตติ้งเป๊ะจริง สั่งแล้วค่ะ!</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                  alt="user"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <span className="text-xs font-bold text-white block">@bow_outfits</span>
                  <p className="text-xs text-gray-300 mt-0.5">ลองชุดด้วย AI แล้วสีขับผิวมาก ต้องมีติดตู้ไว้เลยค่า ✨</p>
                </div>
              </div>
            </div>

            {/* Input comment */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2 border-t border-[#232b31]">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="เขียนความคิดเห็นของคุณ..."
                className="flex-1 bg-[#182025] text-xs text-white placeholder-gray-500 rounded-full px-4 py-2.5 border border-[#303c46] outline-none"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2.5 rounded-full bg-[#18392b] text-[#cbb592] border border-[#cbb592] disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
