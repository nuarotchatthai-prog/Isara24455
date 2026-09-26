import React, { useState, useRef } from 'react';
import { UserProfile, Order, Store, Product, FeedPost, FashionVideoItem } from '../types';
import { 
  X, Send, Play, Pause, Volume2, VolumeX, Eye, Heart, ShoppingBag, 
  Sparkles, Upload, Video, Film, Download, Check, Plus, RefreshCw,
  Store as StoreIcon, User as UserIcon, Camera, ArrowRight, TrendingUp,
  RotateCw, Layers, Image as ImageIcon
} from 'lucide-react';
import { MODEL_PRESETS } from '../data/mockData';

interface ProfileViewProps {
  user: UserProfile;
  orders: Order[];
  stores: Store[];
  products?: Product[];
  feedPosts?: FeedPost[];
  onAddFeedPost?: (newPost: FeedPost) => void;
  onAddOrUpdateProduct?: (product: Partial<Product>) => void;
  onDirectTryOn?: (product: Product) => void;
  onOpenAdmin: () => void;
  onOpenTryOn: () => void;
  onLogout: () => void;
  onUpdateAddress: (address: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'store';
  text: string;
  time: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  orders,
  stores,
  products = [],
  feedPosts = [],
  onAddFeedPost,
  onAddOrUpdateProduct,
  onDirectTryOn,
  onOpenAdmin,
  onOpenTryOn,
  onLogout,
  onUpdateAddress
}) => {
  // Main Mode Toggle: User (ผู้ใช้งาน) <-> Store (ร้านค้า)
  const [activeMode, setActiveMode] = useState<'user' | 'store'>('user');

  // User Mode Sub-Tabs
  const [userTab, setUserTab] = useState<'orders' | 'saved_videos' | 'my_clips'>('orders');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('all');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState(user.address);

  // Store Mode Sub-Tabs & Selected Store
  const [storeTab, setStoreTab] = useState<'products' | 'videos' | 'ai_generator' | 'orders'>('products');
  const [selectedStore, setSelectedStore] = useState<Store>(stores[4] || stores[0]);

  // Video Playing Modal
  const [activeVideoModal, setActiveVideoModal] = useState<FashionVideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Store Product Listing Modal State (ลงสินค้าด้วยรูปภาพ พร้อมเทมเพลตหน้า-หลัง)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('1490');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('1890');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('tops');
  const [newProdSubCategory, setNewProdSubCategory] = useState<Product['subCategory']>('women');
  const [newProdStock, setNewProdStock] = useState('40');
  const [newProdColors, setNewProdColors] = useState('เบจ, ดำ, ขาว');
  const [newProdFabric, setNewProdFabric] = useState('ผ้าลินินธรรมชาติ 100% สั่งทอพิเศษ สัมผัสสบาย');
  const [newProdDescription, setNewProdDescription] = useState('ดีไซน์คัตติ้งระดับพรีเมียม สวมใส่สวยหรูทั้งด้านหน้าและด้านหลัง พร้อมรองรับระบบลองชุด AI');
  
  // Image angles for store product
  const [newProdFrontImage, setNewProdFrontImage] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
  const [newProdBackImage, setNewProdBackImage] = useState('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80');
  const [newProdSideImage, setNewProdSideImage] = useState('');
  const [newProdDetailImage, setNewProdDetailImage] = useState('');
  const [newProdTemplate, setNewProdTemplate] = useState<'front_back' | 'all_angles'>('front_back');
  const [prodModalPreviewAngle, setProdModalPreviewAngle] = useState<'front' | 'back' | 'side' | 'detail'>('front');
  const [autoPostToFeed, setAutoPostToFeed] = useState(true);

  // Store catalog product card angle toggle: productId -> 'front' | 'back'
  const [storeCardAngles, setStoreCardAngles] = useState<Record<string, 'front' | 'back'>>({});

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick Preset Sample Fillers for Store Product Listing
  const applyStoreProductPreset = (preset: 'blazer' | 'linen' | 'dress') => {
    if (preset === 'blazer') {
      setNewProdName('สูทเบลเซอร์เทเลอร์ คอลเลกชันผู้บริหาร (หน้า-หลัง)');
      setNewProdPrice('3690');
      setNewProdOriginalPrice('4290');
      setNewProdCategory('outerwear');
      setNewProdSubCategory('women');
      setNewProdColors('ดำคลาสสิก, เทาชาร์โคล, ครีม');
      setNewProdFabric('ผ้าวูลผสมโพลีเอสเตอร์นำเข้า อัดกาวเก็บทรงพรีเมียม');
      setNewProdDescription('สูทเบลเซอร์คัตติ้งเนี้ยบระดับห้องเสื้อ ดีเทลสาบกระเป๋าและแผ่นหลังทรงเข้ารูป รองรับการลองชุด AI ได้เป๊ะตรงปก');
      setNewProdFrontImage('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80');
      setNewProdBackImage('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80');
      setNewProdSideImage('');
      setNewProdDetailImage('');
      setNewProdTemplate('front_back');
      setProdModalPreviewAngle('front');
    } else if (preset === 'linen') {
      setNewProdName('กางเกงขาสั้นเอวสูง ผ้าลินินธรรมชาติ (หน้า-หลัง)');
      setNewProdPrice('1290');
      setNewProdOriginalPrice('1590');
      setNewProdCategory('pants');
      setNewProdSubCategory('women');
      setNewProdColors('เบจธรรมชาติ, ขาวมุก, ดำสนิท');
      setNewProdFabric('ผ้าลินินแท้ 100% สั่งทอพิเศษ ระบายอากาศยอดเยี่ยม');
      setNewProdDescription('กางเกงลินินทรงเอวสูง ช่วยให้ดูเพรียวขึ้น มีมุมมองด้านหน้าและด้านหลังตัดเย็บประณีต แมตช์ง่ายทุกสไตล์');
      setNewProdFrontImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
      setNewProdBackImage('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80');
      setNewProdSideImage('');
      setNewProdDetailImage('');
      setNewProdTemplate('front_back');
      setProdModalPreviewAngle('front');
    } else if (preset === 'dress') {
      setNewProdName('เดรสผ้าซาตินสายเดี่ยว ลักชัวรีอีฟนิ่ง (หน้า-หลัง)');
      setNewProdPrice('2890');
      setNewProdOriginalPrice('3490');
      setNewProdCategory('dresses');
      setNewProdSubCategory('women');
      setNewProdColors('ทองแชมเปญ, ดำ, เขียวมรกต');
      setNewProdFabric('ผ้าซาตินเกรดพรีเมียม เงางาม ทิ้งตัวนุ่มนวล');
      setNewProdDescription('ชุดเดรสออกงานหรูหรา เว้าหลังเปิดสเน่ห์สวยงาม พร้อมภาพถ่ายมุมด้านหลังและด้านหน้าให้ลูกค้าดูชัดเจน');
      setNewProdFrontImage('https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=800&q=80');
      setNewProdBackImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80');
      setNewProdSideImage('');
      setNewProdDetailImage('');
      setNewProdTemplate('front_back');
      setProdModalPreviewAngle('front');
    }
    showToast('✨ ใส่ข้อมูลตัวอย่างสินค้าแฟชั่นหน้า-หลังแล้ว');
  };

  const handleProductImageUpload = (angle: 'front' | 'back' | 'side' | 'detail', file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (angle === 'front') {
        setNewProdFrontImage(dataUrl);
        setProdModalPreviewAngle('front');
      } else if (angle === 'back') {
        setNewProdBackImage(dataUrl);
        setProdModalPreviewAngle('back');
      } else if (angle === 'side') {
        setNewProdSideImage(dataUrl);
        setProdModalPreviewAngle('side');
      } else if (angle === 'detail') {
        setNewProdDetailImage(dataUrl);
        setProdModalPreviewAngle('detail');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStoreProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showToast('กรุณาระบุชื่อสินค้า');
      return;
    }
    if (!newProdFrontImage) {
      showToast('กรุณาอัปโหลดรูปภาพด้านหน้าของสินค้า');
      return;
    }

    const mainImg = newProdFrontImage;
    const anglesObj = {
      front: mainImg,
      back: newProdBackImage || undefined,
      side: newProdSideImage || undefined,
      detail: newProdDetailImage || undefined
    };
    const detailList = [mainImg, newProdBackImage, newProdSideImage, newProdDetailImage].filter(Boolean) as string[];

    const newCreatedProduct: Product = {
      id: `prod-store-${Date.now()}`,
      name: newProdName.trim(),
      price: Number(newProdPrice) || 1290,
      originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      description: newProdDescription.trim(),
      category: newProdCategory,
      subCategory: newProdSubCategory,
      brand: selectedStore.name,
      brandId: selectedStore.id,
      image: mainImg,
      backImage: newProdBackImage || undefined,
      sideImage: newProdSideImage || undefined,
      detailImage: newProdDetailImage || undefined,
      angles: anglesObj,
      layoutTemplate: newProdTemplate,
      detailImages: detailList,
      stockCount: Number(newProdStock) || 30,
      inStock: true,
      rating: 5.0,
      soldCount: 0,
      likesCount: 1,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: newProdColors.split(',').map(s => s.trim()).filter(Boolean),
      fabric: newProdFabric,
      tags: ['สินค้ามาใหม่', 'เทมเพลตหน้าหลัง', selectedStore.name]
    };

    if (onAddOrUpdateProduct) {
      onAddOrUpdateProduct(newCreatedProduct);
    }

    // Auto post to feed if checked
    if (autoPostToFeed && onAddFeedPost) {
      const feedPostItem: FeedPost = {
        id: `feed-auto-${Date.now()}`,
        author: {
          name: selectedStore.name,
          handle: `@${selectedStore.name.toLowerCase().replace(/\s+/g, '')}`,
          avatar: selectedStore.logo,
          verified: true
        },
        mediaUrl: mainImg,
        backMediaUrl: newProdBackImage || undefined,
        sideMediaUrl: newProdSideImage || undefined,
        detailMediaUrl: newProdDetailImage || undefined,
        angles: anglesObj,
        layoutTemplate: 'split_dual',
        mediaType: 'image',
        title: `${newCreatedProduct.name} (คอลเลกชันใหม่)`,
        price: newCreatedProduct.price,
        description: `เปิดตัวสินค้าใหม่จาก ${selectedStore.name}! ชมมุมมองด้านหน้าและด้านหลัง พร้อมลองชุด AI ได้ทันที`,
        likes: 1,
        isLiked: false,
        commentsCount: 0,
        sharesCount: 0,
        timeAgo: 'เมื่อสักครู่',
        linkedProductId: newCreatedProduct.id,
        product: newCreatedProduct
      };
      onAddFeedPost(feedPostItem);
    }

    setShowAddProductModal(false);
    showToast(`✨ ลงขาย "${newCreatedProduct.name}" สำเร็จ พร้อมแสดงมุมมองหน้า-หลังเรียบร้อยแล้ว`);
  };

  // --- Initial Data: Saved Videos (หน้าผู้ใช้งาน) ---
  const [savedVideos, setSavedVideos] = useState<FashionVideoItem[]>([
    {
      id: 'saved-1',
      title: 'รีวิวใส่ชุดลินินเบจ แมตช์กระเป๋าหนัง ชิคคลาสสิก',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-with-sunglasses-41719-large.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      duration: '0:18',
      views: 18400,
      likes: 2150,
      ordersCount: 94,
      authorType: 'user',
      authorName: 'พลอยใส @ploy_chic',
      createdAt: '1 วันที่แล้ว',
      linkedProduct: products[0] || undefined,
      caption: 'กางเกงลินินตัวนี้คือที่สุด ทรงสวยมาก ผ้าทิ้งตัวใส่สบาย แนะนำเลยค่ะ #OOTD #ISARA'
    },
    {
      id: 'saved-2',
      title: 'พาส่องคอลเลกชันใหม่ เทรนช์โค้ท 2024 ลองชุด AI แล้วเป๊ะ',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-runway-41716-large.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      duration: '0:22',
      views: 34200,
      likes: 4120,
      ordersCount: 168,
      authorType: 'store',
      authorName: 'ISARA Official Atelier',
      createdAt: '2 วันที่แล้ว',
      linkedProduct: products[4] || products[1] || undefined,
      caption: 'ความเรียบหรูระดับไฮเอนด์ สวมใส่ได้ทั้งชายและหญิง พร้อมบริการลองชุด AI เสมือนจริง'
    }
  ]);

  // --- Initial Data: My Clips (คลิปที่ผู้ใช้งานลง) ---
  const [userClips, setUserClips] = useState<FashionVideoItem[]>([
    {
      id: 'user-clip-1',
      title: 'ลองชุด AI ออกมาตรงปกมาก! สั่งจริงมาใส่แล้วชอบสุดๆ',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stylish-model-posing-in-front-of-a-white-wall-41722-large.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      duration: '0:15',
      views: 5820,
      likes: 740,
      ordersCount: 28,
      authorType: 'user',
      authorName: user.name,
      createdAt: 'เมื่อวานนี้',
      linkedProduct: products[1] || undefined,
      caption: 'เสื้อไหมพรมแขนพอง ลุคคุณหนูลักชัวรี แมตช์ง่ายมากกกก ✨ #ISARAVIP #Review'
    }
  ]);

  // --- Initial Data: Store Commerce Videos (วิดีโอที่ร้านค้าอัปโหลดลงขาย พร้อมสถิติยอดวิว) ---
  const [storeVideos, setStoreVideos] = useState<FashionVideoItem[]>([
    {
      id: 'sv-1',
      title: 'กางเกงขาสั้นเอวสูง ผ้าลินินธรรมชาติ • เดินแบบ Runway Show',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-runway-41716-large.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      duration: '0:15',
      views: 48900,
      likes: 5820,
      ordersCount: 342,
      revenue: 441180,
      authorType: 'store',
      authorName: selectedStore.name,
      createdAt: '3 วันที่แล้ว',
      linkedProduct: products[0],
      style: 'เดินแคทวอค',
      background: 'สตูดิโอมินิมอล',
      caption: '✨ เปิดตัวกางเกงลินินธรรมชาติ ทรงเอวสูงตัดเย็บระดับห้องเสื้อ สั่งซื้อได้ทันทีในตะกร้า!'
    },
    {
      id: 'sv-2',
      title: 'เสื้อครอปไหมพรมแขนพอง ลักชัวรี • คาเฟ่ปารีสชิค',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-with-sunglasses-41719-large.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      duration: '0:20',
      views: 31200,
      likes: 3940,
      ordersCount: 215,
      revenue: 526750,
      authorType: 'store',
      authorName: selectedStore.name,
      createdAt: '5 วันที่แล้ว',
      linkedProduct: products[1],
      style: 'หรูหรา',
      background: 'วิวร้านคาเฟ่',
      caption: 'คอลเลกชันขายดีอันดับ 1 ใน TikTok สไตล์สาวชิค ใส่ถ่ายรูปมุมไหนก็สวยแพง'
    },
    {
      id: 'sv-3',
      title: 'สูทเบลเซอร์เทเลอร์ งานประชุมผู้บริหาร • สไตล์ทางการ',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-businesswoman-in-an-office-during-a-meeting-41724-large.mp4',
      coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      duration: '0:18',
      views: 22600,
      likes: 2410,
      ordersCount: 128,
      revenue: 472320,
      authorType: 'store',
      authorName: selectedStore.name,
      createdAt: '1 สัปดาห์ที่แล้ว',
      linkedProduct: products[6] || products[0],
      style: 'ทางการ',
      background: 'วิวห้องประชุมใหญ่',
      caption: 'สูทคัตติ้งเนี้ยบ เสริมบุคลิกภาพความน่าเชื่อถือ สั่งตัดพิเศษสำหรับผู้นำธุรกิจ'
    }
  ]);

  // --- Modal: User Upload New Clip / Post (ลงคลิปหรือรูปภาพหลายมุม) ---
  const [showUserUploadModal, setShowUserUploadModal] = useState(false);
  const [userUploadType, setUserUploadType] = useState<'photo_multi' | 'video'>('photo_multi');
  const [userUploadTemplate, setUserUploadTemplate] = useState<'split_dual' | 'interactive_flip'>('split_dual');
  const [uploadClipTitle, setUploadClipTitle] = useState('');
  const [uploadClipCaption, setUploadClipCaption] = useState('');
  const [uploadClipProduct, setUploadClipProduct] = useState<Product>(products[0]);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
  const [userUploadBackUrl, setUserUploadBackUrl] = useState<string>('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80');
  const userClipFileInputRef = useRef<HTMLInputElement>(null);
  const userBackFileInputRef = useRef<HTMLInputElement>(null);

  // --- AI Video Generator State (หน้าร้านค้า) ---
  const [generatorGarmentSource, setGeneratorGarmentSource] = useState<'catalog' | 'upload'>('catalog');
  const [selectedProductForVideo, setSelectedProductForVideo] = useState<Product>(products[0] || null);
  const [uploadedGarmentImage, setUploadedGarmentImage] = useState<string | null>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  // Model selection (Preset vs Custom Face)
  const [modelType, setModelType] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetModel, setSelectedPresetModel] = useState<string>(MODEL_PRESETS[0].name);
  const [customFaceImage, setCustomFaceImage] = useState<string | null>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  // Styles (5 styles requested: ทางการ, หรูหรา, ร่าเริง, ตลก, เดินแคทวอค)
  const STYLES = [
    { id: 'ทางการ', label: 'ทางการ', desc: 'สุขุม ภูมิฐาน มาดนักธุรกิจ' },
    { id: 'หรูหรา', label: 'หรูหรา', desc: 'สง่างาม ไฮเอนด์ ลักชัวรี' },
    { id: 'ร่าเริง', label: 'ร่าเริง', desc: 'สดใส มีพลัง ยิ้มแย้ม' },
    { id: 'ตลก', label: 'ตลก', desc: 'เฮฮา เข้าถึงง่าย ดึงดูดไวรัล' },
    { id: 'เดินแคทวอค', label: 'เดินแคทวอค', desc: 'ก้าวเดินรันเวย์ แฟชั่นวีคระดับโลก' }
  ];
  const [selectedStyle, setSelectedStyle] = useState<string>('หรูหรา');

  // Backgrounds (5 backgrounds requested: วิวทะเล, วิวร้านคาเฟ่, วิวภูเขา, วิวห้องประชุมใหญ่, สตูดิโอมินิมอล)
  const BACKGROUNDS = [
    { id: 'วิวทะเล', label: 'วิวทะเล', desc: 'ชายหาด แสงแดดอุ่น ทะเลสีคราม' },
    { id: 'วิวร้านคาเฟ่', label: 'วิวร้านคาเฟ่', desc: 'คาเฟ่สไตล์ปารีส ชิคคลาสสิก' },
    { id: 'วิวภูเขา', label: 'วิวภูเขา', desc: 'ทิวทัศน์ขุนเขา ธรรมชาติบริสุทธิ์' },
    { id: 'วิวห้องประชุมใหญ่', label: 'วิวห้องประชุมใหญ่', desc: 'แกรนด์ฮอลล์ บอร์ดรูมผู้บริหาร' },
    { id: 'สตูดิโอมินิมอล', label: 'สตูดิโอมินิมอล', desc: 'แสงเงาสตูดิโอ สไตล์โมเดิร์นลักชัวรี' }
  ];
  const [selectedBackground, setSelectedBackground] = useState<string>('วิวร้านคาเฟ่');

  // Generation status & result
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedVideoResult, setGeneratedVideoResult] = useState<FashionVideoItem | null>(null);

  // Chat with store state
  const [showStoreChatModal, setShowStoreChatModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({
    'store-isara': [
      {
        id: 'msg-1',
        sender: 'store',
        text: `สวัสดีค่ะคุณ ${user.name} ยินดีต้อนรับสู่ ${selectedStore.name} ฝ่ายบริการลูกค้าและสไตล์ลิสต์พร้อมดูแลค่ะ มีอะไรให้ช่วยแนะนำเรื่องสินค้าหรือการลองชุด AI ไหมคะ?`,
        time: '10:00'
      }
    ]
  });

  // Calculate store metrics
  const totalStoreViews = storeVideos.reduce((acc, curr) => acc + curr.views, 0);
  const totalStoreOrders = storeVideos.reduce((acc, curr) => acc + curr.ordersCount, 0);
  const totalStoreRevenue = storeVideos.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

  // Handlers
  const handleSaveAddress = () => {
    onUpdateAddress(addressInput);
    setIsEditingAddress(false);
    showToast('บันทึกที่อยู่จัดส่งเรียบร้อยแล้ว');
  };

  const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedGarmentImage(event.target?.result as string);
        setGeneratorGarmentSource('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomFaceImage(event.target?.result as string);
        setModelType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserClipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUserClip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadClipTitle.trim()) {
      showToast('กรุณากรอกชื่อโพสต์ / คลิป');
      return;
    }

    const newClip: FashionVideoItem = {
      id: `my-clip-${Date.now()}`,
      title: uploadClipTitle.trim(),
      videoUrl: userUploadType === 'video' 
        ? 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-for-a-photo-session-41715-large.mp4'
        : uploadPreviewUrl,
      coverUrl: uploadPreviewUrl,
      duration: userUploadType === 'video' ? '0:15' : '0:10',
      views: 1,
      likes: 1,
      ordersCount: 0,
      authorType: 'user',
      authorName: user.name,
      createdAt: 'เมื่อสักครู่',
      linkedProduct: uploadClipProduct,
      caption: uploadClipCaption.trim() || 'โพสต์รีวิวแฟชั่นและลองชุด AI สไตล์ฉัน'
    };

    setUserClips(prev => [newClip, ...prev]);
    setShowUserUploadModal(false);
    setUploadClipTitle('');
    setUploadClipCaption('');
    showToast(userUploadType === 'photo_multi' ? '✨ โพสต์รูปชุดหลายมุมของคุณเรียบร้อยแล้ว!' : '🎉 โพสต์คลิปวิดีโอของคุณเรียบร้อยแล้ว!');

    // Also share to main feed if callback provided
    if (onAddFeedPost) {
      const newFeedPost: FeedPost = {
        id: `feed-clip-${Date.now()}`,
        author: {
          name: user.name,
          handle: `@${user.name.replace(/\s+/g, '').toLowerCase()}`,
          avatar: user.avatar,
          verified: false
        },
        mediaUrl: uploadPreviewUrl,
        backMediaUrl: userUploadType === 'photo_multi' ? userUploadBackUrl : undefined,
        angles: {
          front: uploadPreviewUrl,
          back: userUploadType === 'photo_multi' ? userUploadBackUrl : undefined
        },
        layoutTemplate: userUploadType === 'photo_multi' ? userUploadTemplate : undefined,
        mediaType: 'image',
        title: newClip.title,
        price: uploadClipProduct?.price || 1290,
        description: newClip.caption || '',
        likes: 1,
        commentsCount: 0,
        sharesCount: 0,
        timeAgo: 'เมื่อสักครู่',
        linkedProductId: uploadClipProduct?.id || 'prod-1',
        product: uploadClipProduct
      };
      onAddFeedPost(newFeedPost);
    }
  };

  // AI Video Generation Handler
  const handleGenerateAiVideo = async () => {
    setIsGeneratingVideo(true);
    setGenerationStep('1/4 วิเคราะห์โครงสร้างชุดผ้าและโทนสี...');

    const garmentName = generatorGarmentSource === 'upload' 
      ? 'ชุดแฟชั่นสั่งตัดคัสตอม' 
      : (selectedProductForVideo?.name || 'ชุดคอลเลกชันใหม่');
    
    const garmentImage = generatorGarmentSource === 'upload' 
      ? uploadedGarmentImage 
      : selectedProductForVideo?.image;

    const timer1 = setTimeout(() => {
      setGenerationStep(`2/4 จำลองการเคลื่อนไหวสไตล์ "${selectedStyle}"...`);
    }, 900);

    const timer2 = setTimeout(() => {
      setGenerationStep(`3/4 ซิงค์ฉากหลัง "${selectedBackground}" และแสงสตูดิโอ 4K...`);
    }, 1800);

    const timer3 = setTimeout(() => {
      setGenerationStep('4/4 ประพันธ์แคปชัน TikTok และเพลงประกอบ...');
    }, 2600);

    try {
      const res = await fetch('/api/ai/generate-fashion-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentImage,
          garmentName,
          modelPersona: selectedPresetModel,
          customFaceUrl: modelType === 'custom' ? customFaceImage : undefined,
          style: selectedStyle,
          background: selectedBackground,
          storeName: selectedStore.name
        })
      });

      const data = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (data.success && data.video) {
        const vidItem: FashionVideoItem = {
          ...data.video,
          linkedProduct: generatorGarmentSource === 'catalog' ? selectedProductForVideo : products[0]
        };
        setGeneratedVideoResult(vidItem);
        showToast('✨ สร้างคลิปวิดีโอ AI แฟชั่นสำเร็จแล้ว!');
      } else {
        throw new Error('Fallback generation');
      }
    } catch (_err) {
      // Robust client fallback
      const fallbackVideo: FashionVideoItem = {
        id: `ai-vid-${Date.now()}`,
        title: `${garmentName} • ลุค${selectedStyle} (${selectedBackground})`,
        videoUrl: selectedStyle === 'เดินแคทวอค' 
          ? 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-on-a-runway-41716-large.mp4'
          : selectedBackground === 'วิวทะเล'
          ? 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-on-a-beach-at-sunset-41720-large.mp4'
          : 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-with-sunglasses-41719-large.mp4',
        coverUrl: garmentImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        duration: '0:15',
        views: 0,
        likes: 0,
        ordersCount: 0,
        revenue: 0,
        style: selectedStyle,
        background: selectedBackground,
        modelName: modelType === 'custom' ? 'ใบหน้าของคุณ (Custom Face)' : selectedPresetModel,
        createdAt: 'เมื่อสักครู่',
        authorType: 'store',
        authorName: selectedStore.name,
        linkedProduct: generatorGarmentSource === 'catalog' ? selectedProductForVideo : products[0],
        caption: `✨ คอลเลกชันใหม่จาก ${selectedStore.name}! อวดเสน่ห์ชุด "${garmentName}" ในสไตล์${selectedStyle} บนฉากหลัง${selectedBackground} ลองใส่จริงด้วย AI ลองชุดแล้ววันนี้ กดสั่งซื้อในตะกร้าได้เลย! #ISARAStyle #AIFashion #TikTokFashion`
      };
      setGeneratedVideoResult(fallbackVideo);
      showToast('✨ สร้างคลิปวิดีโอ AI แฟชั่นสำเร็จแล้ว!');
    } finally {
      setIsGeneratingVideo(false);
      setGenerationStep('');
    }
  };

  // Publish AI Video to Store
  const handlePublishGeneratedVideo = () => {
    if (!generatedVideoResult) return;

    // Add to Store Videos
    setStoreVideos(prev => [generatedVideoResult, ...prev]);
    
    // Add to Feed
    if (onAddFeedPost) {
      const feedItem: FeedPost = {
        id: `feed-${generatedVideoResult.id}`,
        author: {
          name: selectedStore.name,
          handle: `@${selectedStore.name.replace(/\s+/g, '').toLowerCase()}`,
          avatar: selectedStore.logo,
          verified: true
        },
        mediaUrl: generatedVideoResult.coverUrl,
        mediaType: 'image',
        title: generatedVideoResult.title,
        price: generatedVideoResult.linkedProduct?.price || 1290,
        description: generatedVideoResult.caption || '',
        likes: 12,
        commentsCount: 2,
        sharesCount: 1,
        timeAgo: 'เมื่อสักครู่',
        linkedProductId: generatedVideoResult.linkedProduct?.id || 'prod-1',
        product: generatedVideoResult.linkedProduct
      };
      onAddFeedPost(feedItem);
    }

    setStoreTab('videos');
    showToast('🚀 เผยแพร่วิดีโอลงขายในหน้าร้านและหน้าแรกเรียบร้อยแล้ว!');
  };

  const filteredOrders = orders.filter(ord => {
    if (selectedOrderStatus === 'all') return true;
    if (selectedOrderStatus === 'shipping') return ord.status === 'shipping';
    if (selectedOrderStatus === 'preparing') return ord.status === 'preparing';
    if (selectedOrderStatus === 'delivered') return ord.status === 'delivered';
    return true;
  });

  return (
    <div className="w-full pb-32 max-w-md mx-auto px-4 pt-3 space-y-3.5 text-left">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-60 px-4 py-2 rounded-full bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-[#cbb592]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP SWITCHER: สลับระหว่าง [ผู้ใช้งาน] ↔ [ร้านค้า] */}
      <div className="p-1 rounded-2xl bg-[#121619] border border-[#27323a] flex items-center justify-between shadow-lg">
        <button
          onClick={() => setActiveMode('user')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'user'
              ? 'bg-[#f4efe6] text-[#0b0d0e] shadow-md scale-[1.01]'
              : 'text-[#8c949e] hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>ผู้ใช้งาน (Shopper)</span>
        </button>

        <button
          onClick={() => setActiveMode('store')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'store'
              ? 'bg-gradient-to-r from-[#18392b] to-[#122c21] text-[#f5ebd9] border border-[#cbb592] shadow-md scale-[1.01]'
              : 'text-[#8c949e] hover:text-white'
          }`}
        >
          <StoreIcon className="w-4 h-4 text-[#cbb592]" />
          <span>ร้านค้า (Merchant)</span>
        </button>
      </div>

      {/* ========================================================
          MODE 1: หน้าผู้ใช้งาน (USER / SHOPPER VIEW)
          ======================================================== */}
      {activeMode === 'user' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          
          {/* User Profile Header Card */}
          <div className="p-4 rounded-2xl bg-[#121619] border border-[#222b32] flex items-center gap-3.5 shadow-md">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border border-[#cbb592]/60 shadow"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#18392b] text-[#cbb592] text-[9px] font-bold border border-[#cbb592]/40 uppercase">
                  {user.role === 'admin' ? 'Admin' : 'VIP Member'}
                </span>
              </div>
              <p className="text-[11px] text-[#8c949e] truncate mt-0.5">อีเมล: {user.email}</p>
              <p className="text-[11px] text-[#8c949e] truncate">เบอร์โทร: {user.phone}</p>
            </div>
          </div>

          {/* User Quick Nav Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121619] border border-[#20272e]">
            <button
              onClick={() => setUserTab('orders')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                userTab === 'orders'
                  ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/60'
                  : 'text-[#8c949e] hover:text-white'
              }`}
            >
              คำสั่งซื้อ ({orders.length})
            </button>
            <button
              onClick={() => setUserTab('saved_videos')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                userTab === 'saved_videos'
                  ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/60'
                  : 'text-[#8c949e] hover:text-white'
              }`}
            >
              วิดีโอที่บันทึกไว้ ({savedVideos.length})
            </button>
            <button
              onClick={() => setUserTab('my_clips')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                userTab === 'my_clips'
                  ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/60'
                  : 'text-[#8c949e] hover:text-white'
              }`}
            >
              คลิปของฉัน ({userClips.length})
            </button>
          </div>

          {/* SUB-TAB 1: วิดีโอที่บันทึกไว้ (SAVED VIDEOS) */}
          {userTab === 'saved_videos' && (
            <div className="p-4 rounded-2xl bg-[#121619] border border-[#222b32] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">วิดีโอแฟชั่นที่บันทึกไว้</h4>
                  <p className="text-[10px] text-[#8c949e]">คลิปสไตล์และทริกการแต่งตัวที่คุณเซฟไว้ดูย้อนหลัง</p>
                </div>
                <span className="text-xs text-[#cbb592] font-mono">{savedVideos.length} คลิป</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {savedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => { setActiveVideoModal(vid); setIsPlaying(true); }}
                    className="rounded-xl bg-[#161c20] border border-[#242e36] overflow-hidden group cursor-pointer hover:border-[#cbb592]/60 transition-all shadow-md"
                  >
                    <div className="relative aspect-[3/4] bg-black overflow-hidden">
                      <img
                        src={vid.coverUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-[#f5ebd9] font-mono">
                        {vid.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-[#18392b]/90 border border-[#cbb592] flex items-center justify-center text-[#f5ebd9] shadow-lg">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white">
                        <span className="flex items-center gap-1 font-mono">
                          <Eye className="w-3 h-3 text-[#cbb592]" />
                          {(vid.views / 1000).toFixed(1)}k
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Heart className="w-3 h-3 text-red-400" />
                          {vid.likes}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <h5 className="text-[11px] font-semibold text-white line-clamp-2 leading-tight">
                        {vid.title}
                      </h5>
                      <p className="text-[10px] text-[#cbb592] truncate">{vid.authorName}</p>
                      {vid.linkedProduct && (
                        <div className="pt-1 border-t border-[#20272e] flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 truncate max-w-[90px]">
                            {vid.linkedProduct.name}
                          </span>
                          <span className="text-[10px] font-bold text-white font-mono">
                            ฿{vid.linkedProduct.price.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: คลิปของฉัน / ให้ลงคลิป (MY CLIPS & UPLOAD) */}
          {userTab === 'my_clips' && (
            <div className="p-4 rounded-2xl bg-[#121619] border border-[#222b32] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">คลิปแฟชั่นของฉัน</h4>
                  <p className="text-[10px] text-[#8c949e]">แชร์ไอเดียการแต่งตัวและรีวิวชุดที่สั่งซื้อ</p>
                </div>
                <button
                  onClick={() => setShowUserUploadModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/70 text-[11px] font-bold flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ลงคลิปใหม่</span>
                </button>
              </div>

              {userClips.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Film className="w-8 h-8 text-[#8c949e] mx-auto opacity-50" />
                  <p className="text-xs text-[#8c949e]">ยังไม่มีคลิปที่คุณลงไว้</p>
                  <button
                    onClick={() => setShowUserUploadModal(true)}
                    className="text-xs text-[#cbb592] underline font-semibold"
                  >
                    อัปโหลดคลิปแรกของคุณตอนนี้
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {userClips.map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() => { setActiveVideoModal(clip); setIsPlaying(true); }}
                      className="p-2.5 rounded-xl bg-[#161c20] border border-[#242e36] flex items-center gap-3 cursor-pointer hover:border-[#cbb592]/50 transition-all group"
                    >
                      <div className="relative w-16 h-20 rounded-lg bg-black overflow-hidden shrink-0">
                        <img src={clip.coverUrl} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white opacity-80" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                          {clip.title}
                        </h5>
                        <div className="flex items-center gap-3 text-[10px] text-[#8c949e] font-mono">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-[#cbb592]" />
                            {clip.views.toLocaleString()} วิว
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />
                            {clip.likes} ไลก์
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">{clip.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 3: คำสั่งซื้อของฉัน (ORDERS) */}
          {userTab === 'orders' && (
            <div className="space-y-3">
              {/* Orders Card */}
              <div className="p-4 rounded-2xl bg-[#121619] border border-[#222b32] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">คำสั่งซื้อของฉัน</h4>
                  <span className="text-[11px] text-[#cbb592]">{filteredOrders.length} รายการ</span>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'shipping', label: 'กำลังจัดส่ง' },
                    { id: 'preparing', label: 'กำลังเตรียม' },
                    { id: 'delivered', label: 'จัดส่งแล้ว' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedOrderStatus(cat.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                        selectedOrderStatus === cat.id
                          ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/70 font-semibold'
                          : 'bg-[#161c20] text-[#8c949e] border border-transparent hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="text-xs text-[#8c949e] py-4 text-center">ไม่มีรายการคำสั่งซื้อในหมวดหมู่นี้</p>
                ) : (
                  <div className="space-y-2">
                    {filteredOrders.map((ord) => (
                      <div key={ord.id} className="p-3 rounded-xl bg-[#161c20] border border-[#242e36] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-semibold text-[#cbb592]">{ord.orderNumber}</span>
                          <span className="text-[10px] font-medium text-emerald-400">
                            {ord.status === 'shipping' ? 'กำลังจัดส่ง' : ord.status === 'preparing' ? 'กำลังเตรียมสินค้า' : ord.status === 'delivered' ? 'จัดส่งแล้ว' : 'รอชำระ'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#cfd4da]">
                          <span>สินค้า {ord.items.length} รายการ</span>
                          <span className="font-semibold text-white">฿{ord.finalAmount.toLocaleString()}</span>
                        </div>
                        {ord.trackingNumber && (
                          <p className="text-[10px] text-[#8c949e] font-mono pt-1 border-t border-[#20272e]">
                            Flash Express: {ord.trackingNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ช่องแชทคุยกับร้านค้า (แสดงเฉพาะในหน้าคำสั่งซื้อเท่านั้น) */}
              <div
                onClick={() => setShowStoreChatModal(true)}
                className="p-3.5 rounded-2xl bg-[#121619] border border-[#222b32] hover:border-[#cbb592]/60 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">บริการลูกค้า</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h5 className="text-xs font-bold text-white mt-0.5">แชทคุยกับร้านค้า</h5>
                  <p className="text-[10px] text-[#8c949e] mt-0.5">สอบถามสถานะพัสดุ ขนาดไซส์ หรือติดต่อสไตล์ลิสต์</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/60 text-[10px] font-semibold group-hover:brightness-110">
                  เปิดแชท
                </span>
              </div>

              {/* ที่อยู่จัดส่งเริ่มต้น (แสดงเฉพาะในหน้าคำสั่งซื้อเท่านั้น) */}
              <div className="p-4 rounded-2xl bg-[#121619] border border-[#222b32] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">ที่อยู่จัดส่งเริ่มต้น</span>
                  <button
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-[11px] text-[#cbb592] hover:underline"
                  >
                    {isEditingAddress ? 'ยกเลิก' : 'แก้ไข'}
                  </button>
                </div>

                {isEditingAddress ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={2}
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="w-full bg-[#181e22] p-2.5 rounded-xl text-xs text-white border border-[#2e3a44] outline-none focus:border-[#cbb592]"
                    />
                    <button
                      onClick={handleSaveAddress}
                      className="px-3.5 py-1 rounded-xl bg-[#18392b] text-white text-xs font-semibold border border-[#cbb592]/50"
                    >
                      บันทึกที่อยู่
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#cfd4da] leading-relaxed">{user.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Logout / Switch Account */}
          <div className="pt-1 text-center">
            <button
              onClick={onLogout}
              className="text-xs text-[#8c949e] hover:text-red-400 transition-colors py-2 px-4 rounded-full"
            >
              สลับบัญชี หรือ ออกจากระบบ
            </button>
          </div>

        </div>
      )}

      {/* ========================================================
          MODE 2: หน้าร้านค้า (MERCHANT / STORE VIEW)
          ======================================================== */}
      {activeMode === 'store' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          
          {/* Store Profile Header & Switcher */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c17] via-[#121619] to-[#0e1713] border border-[#cbb592]/50 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                  <img src={selectedStore.logo} alt={selectedStore.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{selectedStore.name}</h3>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#cbb592]">{selectedStore.highlight}</p>
                </div>
              </div>
              <button
                onClick={onOpenAdmin}
                className="px-2.5 py-1.5 rounded-xl bg-[#142e22] text-[#f5ebd9] border border-[#cbb592]/60 text-[10px] font-semibold hover:brightness-110 shadow"
              >
                หลังบ้าน Admin
              </button>
            </div>

            {/* Quick Store Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-[#1c2723]">
              <span className="text-[10px] text-gray-400 shrink-0">เลือกร้านค้า:</span>
              {stores.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStore(s)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                    selectedStore.id === s.id
                      ? 'bg-[#f4efe6] text-black font-bold shadow'
                      : 'bg-[#182025] text-gray-400 border border-[#2b353e] hover:text-white'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* STORE DASHBOARD (ฟีเจอร์ที่ร้านค้าต้องมี) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-[#121619] border border-[#222b32] text-center">
              <span className="text-[10px] text-[#8c949e] block">ยอดขายวันนี้</span>
              <span className="text-xs font-bold text-[#cbb592] font-mono mt-0.5 block">฿48,920</span>
              <span className="text-[9px] text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +18.4%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#121619] border border-[#222b32] text-center">
              <span className="text-[10px] text-[#8c949e] block">คำสั่งซื้อรอส่ง</span>
              <span className="text-xs font-bold text-white font-mono mt-0.5 block">8 ออเดอร์</span>
              <span className="text-[9px] text-[#cbb592] mt-0.5 block">Flash Express</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#121619] border border-[#222b32] text-center">
              <span className="text-[10px] text-[#8c949e] block">ยอดวิวรวมวิดีโอ</span>
              <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                {(totalStoreViews / 1000).toFixed(1)}k วิว
              </span>
              <span className="text-[9px] text-[#cbb592] mt-0.5 block">{storeVideos.length} คลิป</span>
            </div>
          </div>

          {/* Store Sub-Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121619] border border-[#20272e]">
            <button
              onClick={() => setStoreTab('products')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                storeTab === 'products'
                  ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/70 shadow'
                  : 'text-[#8c949e] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#cbb592]" />
              <span>สินค้า & ลงขาย</span>
            </button>

            <button
              onClick={() => setStoreTab('videos')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                storeTab === 'videos'
                  ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/70 shadow'
                  : 'text-[#8c949e] hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>วิดีโอ ({storeVideos.length})</span>
            </button>

            <button
              onClick={() => setStoreTab('ai_generator')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                storeTab === 'ai_generator'
                  ? 'bg-gradient-to-r from-[#dfa24b] to-[#b68235] text-black shadow font-black'
                  : 'text-[#dfa24b] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI ทำคลิป</span>
            </button>
          </div>

          {/* -------------------------------------------------------------
              STORE TAB 0: สินค้าของร้าน & ลงสินค้าด้วยรูปภาพ (หน้า-หลัง)
              ------------------------------------------------------------- */}
          {storeTab === 'products' && (
            <div className="p-4 rounded-2xl bg-[#121619] border border-[#222b32] space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>สินค้าของร้าน {selectedStore.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#18392b] text-[#cbb592] text-[9px] font-bold border border-[#cbb592]/40">
                      {products.filter(p => p.brandId === selectedStore.id || p.brand === selectedStore.name || true).length} รายการ
                    </span>
                  </h4>
                  <p className="text-[10px] text-[#8c949e]">ลงสินค้าด้วยรูปภาพ พร้อมเทมเพลตมุมมองหน้า-หลัง รองรับลองชุด AI</p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#18392b] to-[#142e23] text-[#f5ebd9] border border-[#cbb592] text-[11px] font-bold flex items-center gap-1 shadow hover:brightness-110 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#cbb592]" />
                  <span>ลงสินค้าใหม่</span>
                </button>
              </div>

              {/* Products Grid with Front / Back interactive view */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {products
                  .slice(0, 8)
                  .map((product) => {
                    const cardAngle = storeCardAngles[product.id] || 'front';
                    const hasBack = Boolean(product.backImage || product.angles?.back);
                    const currentImg = cardAngle === 'back' && hasBack ? (product.backImage || product.angles?.back || product.image) : product.image;

                    return (
                      <div
                        key={product.id}
                        className="rounded-2xl bg-[#161c20] border border-[#242e36] overflow-hidden flex flex-col justify-between hover:border-[#cbb592]/50 transition-all group"
                      >
                        {/* Image Box */}
                        <div className="relative aspect-[3/4] bg-black overflow-hidden">
                          <img
                            src={currentImg}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          {/* Front / Back Toggle Pill */}
                          {hasBack && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStoreCardAngles(prev => ({
                                    ...prev,
                                    [product.id]: cardAngle === 'front' ? 'back' : 'front'
                                  }));
                                }}
                                className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#cbb592]/60 text-[8px] font-bold text-[#f5ebd9] flex items-center gap-1 hover:border-[#cbb592] shadow active:scale-95"
                              >
                                <RotateCw className="w-2.5 h-2.5 text-[#cbb592]" />
                                <span>{cardAngle === 'front' ? 'ดูด้านหลัง' : 'ดูด้านหน้า'}</span>
                              </button>
                            </div>
                          )}

                          {/* Stock Status Badge */}
                          <div className="absolute top-2 right-2 z-10">
                            <span className="px-1.5 py-0.5 rounded-md bg-[#18392b]/90 text-[8px] font-bold text-[#cbb592] border border-[#cbb592]/40 shadow">
                              สต็อก {product.stockCount}
                            </span>
                          </div>

                          {/* Quick AI Try-on */}
                          <button
                            onClick={() => onDirectTryOn?.(product)}
                            className="absolute bottom-2 inset-x-2 py-1 rounded-full bg-[#18392b]/95 backdrop-blur-md text-[#f5ebd9] border border-[#cbb592]/70 text-[9px] font-semibold flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100 shadow active:scale-95"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#cbb592]" />
                            <span>ลองชุด AI</span>
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-2.5 space-y-1 text-left">
                          <h5 className="text-xs font-semibold text-white truncate">{product.name}</h5>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#d4b588] font-mono">฿{product.price.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400">{product.sizes?.join('/') || 'S/M/L'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STORE TAB 1: วิดีโอที่เคยอัปโหลดลงขาย (พร้อมสถิติยอดวิว)
              ------------------------------------------------------------- */}
          {storeTab === 'videos' && (
            <div className="p-4 rounded-2xl bg-[#121619] border border-[#222b32] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">วิดีโอที่เคยอัปโหลดลงขาย</h4>
                  <p className="text-[10px] text-[#8c949e]">เช็กสถิติยอดวิว ยอดไลก์ และยอดขายที่เกิดจากแต่ละคลิป</p>
                </div>
                <button
                  onClick={() => setStoreTab('ai_generator')}
                  className="px-2.5 py-1 rounded-xl bg-[#18392b] text-[#cbb592] border border-[#cbb592]/50 text-[10px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>สร้างคลิป AI</span>
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {storeVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-3 rounded-2xl bg-[#161c20] border border-[#242e36] space-y-2.5 hover:border-[#cbb592]/50 transition-all shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Video Thumbnail with Play Button */}
                      <div
                        onClick={() => { setActiveVideoModal(vid); setIsPlaying(true); }}
                        className="relative w-20 h-28 rounded-xl bg-black overflow-hidden shrink-0 cursor-pointer group"
                      >
                        <img
                          src={vid.coverUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-[#18392b]/90 border border-[#cbb592] flex items-center justify-center text-[#f5ebd9] shadow">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] text-white font-mono">
                          {vid.duration || '0:15'}
                        </div>
                      </div>

                      {/* Video Info & Views Analytics */}
                      <div className="flex-1 min-w-0 space-y-1.5 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#18392b] text-[#cbb592] text-[9px] font-bold border border-[#cbb592]/40">
                            {vid.style || 'แฟชั่น'}
                          </span>
                          <span className="text-[10px] text-gray-400">{vid.createdAt}</span>
                        </div>

                        <h5 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                          {vid.title}
                        </h5>

                        {/* Views & Orders Statistics Bar */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono">
                          <div className="p-1.5 rounded-lg bg-[#0f1316] border border-[#20272e]">
                            <span className="text-[9px] text-[#8c949e] block font-sans">ยอดวิว</span>
                            <span className="text-[11px] font-bold text-[#dfa24b] flex items-center justify-center gap-0.5">
                              <Eye className="w-2.5 h-2.5" />
                              {(vid.views).toLocaleString()}
                            </span>
                          </div>

                          <div className="p-1.5 rounded-lg bg-[#0f1316] border border-[#20272e]">
                            <span className="text-[9px] text-[#8c949e] block font-sans">ยอดไลก์</span>
                            <span className="text-[11px] font-bold text-red-400 flex items-center justify-center gap-0.5">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                              {vid.likes.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-1.5 rounded-lg bg-[#0f1316] border border-[#20272e]">
                            <span className="text-[9px] text-[#8c949e] block font-sans">ขายได้</span>
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-0.5">
                              <ShoppingBag className="w-2.5 h-2.5" />
                              {vid.ordersCount} ชิ้น
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Linked Product Bar & Watch Action */}
                    {vid.linkedProduct && (
                      <div className="p-2 rounded-xl bg-[#101417] border border-[#20272e] flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={vid.linkedProduct.image} alt={vid.linkedProduct.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div className="truncate">
                            <span className="text-[10px] text-gray-400 block truncate">สินค้าในคลิป:</span>
                            <span className="text-xs font-semibold text-white truncate block">{vid.linkedProduct.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#cbb592] font-mono">฿{vid.linkedProduct.price.toLocaleString()}</span>
                          <button
                            onClick={() => { setActiveVideoModal(vid); setIsPlaying(true); }}
                            className="px-2.5 py-1 rounded-lg bg-[#18392b] text-[#f5ebd9] text-[10px] font-semibold hover:brightness-110"
                          >
                            ดูคลิป
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STORE TAB 2: ระบบทำคลิปเอไอ (AI FASHION VIDEO GENERATOR)
              ------------------------------------------------------------- */}
          {storeTab === 'ai_generator' && (
            <div className="p-4 rounded-2xl bg-[#121619] border border-[#cbb592]/60 space-y-4 shadow-2xl">
              
              {/* Header Banner */}
              <div className="flex items-center justify-between border-b border-[#242e36] pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#dfa24b]" />
                    <h4 className="text-sm font-bold text-white">ระบบทำคลิปเอไอ (AI Video Generator)</h4>
                  </div>
                  <p className="text-[10px] text-[#cbb592] mt-0.5">
                    สร้างคลิปวิดีโอแฟชั่นสวมใส่ชุดจริงพร้อมขายบน TikTok และฟีดแอปได้ในคลิกเดียว
                  </p>
                </div>
              </div>

              {/* STEP 1: อัปโหลดชุด หรือ เลือกชุดในร้าน */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1">
                    <span>1. เลือกชุดหรืออัปโหลดรูปชุด</span>
                    <span className="text-[#dfa24b]">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setGeneratorGarmentSource('catalog')}
                      className={`px-2 py-0.5 rounded-full ${
                        generatorGarmentSource === 'catalog'
                          ? 'bg-[#18392b] text-[#cbb592] font-bold border border-[#cbb592]/50'
                          : 'text-gray-400'
                      }`}
                    >
                      เลือกจากร้าน
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeneratorGarmentSource('upload')}
                      className={`px-2 py-0.5 rounded-full ${
                        generatorGarmentSource === 'upload'
                          ? 'bg-[#18392b] text-[#cbb592] font-bold border border-[#cbb592]/50'
                          : 'text-gray-400'
                      }`}
                    >
                      อัปโหลดชุดเอง
                    </button>
                  </div>
                </div>

                {generatorGarmentSource === 'catalog' ? (
                  <div className="grid grid-cols-4 gap-2">
                    {products.slice(0, 8).map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProductForVideo(prod)}
                        className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${
                          selectedProductForVideo?.id === prod.id
                            ? 'bg-[#18392b] border-[#cbb592] shadow-md scale-105'
                            : 'bg-[#161c20] border-[#252f37] hover:border-gray-500'
                        }`}
                      >
                        <img src={prod.image} alt={prod.name} className="w-full aspect-square rounded-lg object-cover mb-1" />
                        <span className="text-[10px] text-white line-clamp-1 font-medium">{prod.name}</span>
                        <span className="text-[9px] text-[#cbb592] font-mono">฿{prod.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => garmentInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-[#cbb592]/40 bg-[#161c20] text-center cursor-pointer hover:border-[#cbb592] transition-colors"
                  >
                    <input
                      ref={garmentInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleGarmentUpload}
                      className="hidden"
                    />
                    {uploadedGarmentImage ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={uploadedGarmentImage} alt="Garment" className="w-16 h-16 rounded-xl object-cover border border-[#cbb592]" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">อัปโหลดรูปชุดเรียบร้อย</p>
                          <span className="text-[10px] text-[#cbb592] underline">แตะเพื่อเปลี่ยนรูป</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-[#cbb592] mx-auto" />
                        <p className="text-xs font-semibold text-white">แตะเพื่ออัปโหลดรูปเสื้อผ้า / ชุดแฟชั่น</p>
                        <p className="text-[10px] text-gray-400">รองรับรูปถ่ายชุดบนหุ่น หรือวางบนพื้นเรียบ</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2: เลือกนางแบบ หรือ อัปโหลดหน้าตัวเอง */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1">
                    <span>2. เลือกนางแบบ / อัปโหลดหน้าตัวเอง</span>
                    <span className="text-[#dfa24b]">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setModelType('preset')}
                      className={`px-2 py-0.5 rounded-full ${
                        modelType === 'preset'
                          ? 'bg-[#18392b] text-[#cbb592] font-bold border border-[#cbb592]/50'
                          : 'text-gray-400'
                      }`}
                    >
                      AI Model Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelType('custom')}
                      className={`px-2 py-0.5 rounded-full ${
                        modelType === 'custom'
                          ? 'bg-[#18392b] text-[#cbb592] font-bold border border-[#cbb592]/50'
                          : 'text-gray-400'
                      }`}
                    >
                      อัปโหลดหน้าตัวเอง
                    </button>
                  </div>
                </div>

                {modelType === 'preset' ? (
                  <div className="grid grid-cols-5 gap-1.5">
                    {MODEL_PRESETS.slice(0, 5).map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedPresetModel(m.name)}
                        className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${
                          selectedPresetModel === m.name
                            ? 'bg-[#18392b] border-[#cbb592] scale-105 shadow-md'
                            : 'bg-[#161c20] border-[#252f37] hover:border-gray-500'
                        }`}
                      >
                        <img src={m.imageUrl} alt={m.name} className="w-full aspect-square rounded-lg object-cover mb-1" />
                        <span className="text-[9px] text-white line-clamp-1">{m.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => faceInputRef.current?.click()}
                    className="p-3.5 rounded-xl border-2 border-dashed border-[#cbb592]/40 bg-[#161c20] text-center cursor-pointer hover:border-[#cbb592] transition-colors"
                  >
                    <input
                      ref={faceInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFaceUpload}
                      className="hidden"
                    />
                    {customFaceImage ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={customFaceImage} alt="Custom face" className="w-14 h-14 rounded-full object-cover border-2 border-[#cbb592]" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">ใช้ใบหน้าของคุณในการสร้างคลิป AI</p>
                          <span className="text-[10px] text-[#cbb592] underline">แตะเพื่อเปลี่ยนรูปหน้า</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Camera className="w-5 h-5 text-[#cbb592] mx-auto" />
                        <p className="text-xs font-semibold text-white">อัปโหลดรูปหน้าตัวเอง / เจ้าของร้าน / นางแบบ</p>
                        <p className="text-[10px] text-gray-400">AI จะนำหน้าของคุณไปใส่ชุดและเคลื่อนไหวตามสไตล์ที่เลือก</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 3: เลือกสไตล์ (5 สไตล์: ทางการ, หรูหรา, ร่าเริง, ตลก, เดินแคทวอค) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <span>3. เลือกสไตล์คลิป</span>
                  <span className="text-[#dfa24b]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStyle(s.id)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        selectedStyle === s.id
                          ? 'bg-[#18392b] text-[#f5ebd9] border-[#cbb592] shadow'
                          : 'bg-[#161c20] text-gray-300 border-[#252f37] hover:border-gray-500'
                      }`}
                    >
                      <span className="text-xs font-bold block">{s.label}</span>
                      <span className="text-[9px] text-[#8c949e] line-clamp-1 mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 4: เลือกแบล็คกราวด์ (5 วิว: วิวทะเล, วิวร้านคาเฟ่, วิวภูเขา, วิวห้องประชุมใหญ่, สตูดิโอมินิมอล) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <span>4. เลือกแบล็คกราวด์ (ฉากหลัง)</span>
                  <span className="text-[#dfa24b]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {BACKGROUNDS.map(bg => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBackground(bg.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedBackground === bg.id
                          ? 'bg-[#18392b] text-[#f5ebd9] border-[#cbb592] shadow'
                          : 'bg-[#161c20] text-gray-300 border-[#252f37] hover:border-gray-500'
                      }`}
                    >
                      <span className="text-xs font-bold block">{bg.label}</span>
                      <span className="text-[10px] text-[#8c949e] mt-0.5 block">{bg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 5: ปุ่มเจเนอเรท (GENERATE BUTTON) */}
              <button
                type="button"
                disabled={isGeneratingVideo}
                onClick={handleGenerateAiVideo}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#dfa24b] via-[#cbb592] to-[#b38a42] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>กำลังประมวลผลคลิป AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>สร้างคลิปวิดีโอแฟชั่น AI ทันที</span>
                  </>
                )}
              </button>

              {/* Generation Progress Indicator */}
              {isGeneratingVideo && (
                <div className="p-3 rounded-xl bg-[#0e1713] border border-[#cbb592]/50 text-center space-y-2 animate-pulse">
                  <span className="text-xs font-bold text-[#cbb592]">{generationStep}</span>
                  <div className="w-full h-1.5 rounded-full bg-[#182025] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#18392b] to-[#cbb592] w-3/4 rounded-full animate-pulse" />
                  </div>
                </div>
              )}

              {/* STEP 6: ช่องผลลัพธ์ (RESULT BOX & ACTIONS) */}
              {generatedVideoResult && !isGeneratingVideo && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#14231b] to-[#101814] border border-[#cbb592] space-y-3 shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between border-b border-[#26372d] pb-2">
                    <span className="text-xs font-bold text-[#dfa24b] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      ผลลัพธ์คลิปวิดีโอ AI ที่ได้
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#18392b] text-[#cbb592] text-[9px] font-bold border border-[#cbb592]/50">
                      พร้อมใช้งาน
                    </span>
                  </div>

                  {/* Video Player Box (9:16 Aspect) */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl bg-black overflow-hidden shadow-2xl border border-[#cbb592]/40 group">
                    <video
                      src={generatedVideoResult.videoUrl}
                      poster={generatedVideoResult.coverUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Controls Overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#18392b]/90 text-[#f5ebd9] text-[9px] font-bold border border-[#cbb592]/60">
                          สไตล์: {generatedVideoResult.style}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-medium">
                          ฉาก: {generatedVideoResult.background}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white drop-shadow-md">
                        {generatedVideoResult.title}
                      </p>
                    </div>
                  </div>

                  {/* AI Generated Marketing Caption */}
                  <div className="p-3 rounded-xl bg-[#0d1511] border border-[#213127] space-y-1.5 text-left">
                    <span className="text-[10px] text-[#cbb592] font-semibold block">แคปชัน TikTok ที่ AI แต่งให้:</span>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      {generatedVideoResult.caption}
                    </p>
                  </div>

                  {/* Action Buttons: Post to Store & Download */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handlePublishGeneratedVideo}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#18392b] to-[#122c21] text-[#f5ebd9] border border-[#cbb592] text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 shadow"
                    >
                      <Plus className="w-4 h-4 text-[#cbb592]" />
                      <span>โพสต์ลงขายหน้าร้าน</span>
                    </button>

                    <button
                      onClick={() => showToast('📥 บันทึกวิดีโอลงในเครื่องเรียบร้อยแล้ว')}
                      className="py-2.5 px-3 rounded-xl bg-[#1a2328] text-gray-200 border border-[#2e3a44] text-xs font-semibold flex items-center justify-center gap-1.5 hover:text-white active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลดคลิป</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================
          MODAL: USER UPLOAD NEW CLIP / POST (ลงคลิปหรือรูปภาพหลายมุม)
          ======================================================== */}
      {showUserUploadModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-[#121619] border border-[#2e3a44] rounded-3xl p-4 space-y-3.5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#20272e] pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#cbb592]" />
                <span>ลงโพสต์แฟชั่นของคุณ</span>
              </h4>
              <button onClick={() => setShowUserUploadModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Type Selector: Photo Multi-Angle vs Video */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0d1012] border border-[#232b32]">
              <button
                type="button"
                onClick={() => setUserUploadType('photo_multi')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  userUploadType === 'photo_multi'
                    ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/60 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#cbb592]" />
                <span>รูปภาพ (หน้า-หลัง)</span>
              </button>

              <button
                type="button"
                onClick={() => setUserUploadType('video')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  userUploadType === 'video'
                    ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592]/60 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>วิดีโอคลิป</span>
              </button>
            </div>

            <form onSubmit={handleSubmitUserClip} className="space-y-3 text-left">
              {/* If Photo Multi-Angle Mode: Front & Back Upload with Template Selector */}
              {userUploadType === 'photo_multi' ? (
                <div className="space-y-2.5">
                  {/* Template Style */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#cbb592] font-semibold">เทมเพลตจัดวาง:</span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setUserUploadTemplate('split_dual')}
                        className={`px-2 py-0.5 rounded-full ${
                          userUploadTemplate === 'split_dual'
                            ? 'bg-[#18392b] text-[#cbb592] font-bold border border-[#cbb592]/40'
                            : 'text-gray-400'
                        }`}
                      >
                        คู่หน้า-หลัง
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserUploadTemplate('interactive_flip')}
                        className={`px-2 py-0.5 rounded-full ${
                          userUploadTemplate === 'interactive_flip'
                            ? 'bg-[#18392b] text-[#cbb592] font-bold border border-[#cbb592]/40'
                            : 'text-gray-400'
                        }`}
                      >
                        สลับดู 360°
                      </button>
                    </div>
                  </div>

                  {/* Dual Image Slots */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Front */}
                    <div
                      onClick={() => userClipFileInputRef.current?.click()}
                      className="relative aspect-[3/4] rounded-xl bg-black overflow-hidden border border-[#2e3a44] cursor-pointer group flex items-center justify-center"
                    >
                      <input
                        ref={userClipFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUserClipUpload}
                        className="hidden"
                      />
                      <img src={uploadPreviewUrl} alt="Front" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-white border border-[#cbb592]/50">
                        📸 หน้า
                      </div>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition-opacity">
                        เปลี่ยนรูป
                      </div>
                    </div>

                    {/* Back */}
                    <div
                      onClick={() => userBackFileInputRef.current?.click()}
                      className="relative aspect-[3/4] rounded-xl bg-black overflow-hidden border border-[#2e3a44] cursor-pointer group flex items-center justify-center"
                    >
                      <input
                        ref={userBackFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => setUserUploadBackUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                      <img src={userUploadBackUrl} alt="Back" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-[#dfa24b] border border-[#dfa24b]/50">
                        🔄 หลัง
                      </div>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition-opacity">
                        เปลี่ยนรูป
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Video Upload Mode */
                <div
                  onClick={() => userClipFileInputRef.current?.click()}
                  className="relative aspect-[16/9] rounded-2xl bg-black overflow-hidden border border-[#2e3a44] cursor-pointer group flex items-center justify-center"
                >
                  <input
                    ref={userClipFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleUserClipUpload}
                    className="hidden"
                  />
                  <img src={uploadPreviewUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 text-white text-xs font-semibold">
                    <Video className="w-4 h-4" />
                    <span>แตะเพื่อเลือกไฟล์วิดีโอ</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] text-gray-300 font-semibold block mb-1">ชื่อโพสต์ / ชื่อลุค</label>
                <input
                  type="text"
                  required
                  value={uploadClipTitle}
                  onChange={(e) => setUploadClipTitle(e.target.value)}
                  placeholder="เช่น รีวิวชุดลินินเบจ แมตช์เที่ยวทะเล..."
                  className="w-full bg-[#182025] border border-[#2b353e] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#cbb592]"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-300 font-semibold block mb-1">แคปชัน</label>
                <textarea
                  rows={2}
                  value={uploadClipCaption}
                  onChange={(e) => setUploadClipCaption(e.target.value)}
                  placeholder="แชร์ความรู้สึก หรือทริกการเลือกไซส์..."
                  className="w-full bg-[#182025] border border-[#2b353e] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#cbb592]"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-300 font-semibold block mb-1">ผูกสินค้าในลุค</label>
                <select
                  value={uploadClipProduct?.id}
                  onChange={(e) => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) setUploadClipProduct(found);
                  }}
                  className="w-full bg-[#182025] border border-[#2b353e] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#cbb592]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ฿{p.price.toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#161c20] text-gray-400 border border-[#28323a] text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] text-xs font-bold hover:brightness-110 shadow"
                >
                  เผยแพร่โพสต์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: VIDEO PLAYER (เล่นคลิปวิดีโอพร้อมข้อมูลสินค้า)
          ======================================================== */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm h-[85vh] bg-[#0c1012] border border-[#29353e] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
            
            {/* Top Close & Sound */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs">
                <span className="font-bold">{activeVideoModal.authorName}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Canvas */}
            <div 
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer select-none"
            >
              <video
                src={activeVideoModal.videoUrl}
                poster={activeVideoModal.coverUrl}
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />

              {!isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#18392b]/90 border border-[#cbb592] flex items-center justify-center text-[#f5ebd9] shadow-2xl">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating Info & Product Cart */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent space-y-2.5 z-20 text-left">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white drop-shadow">
                  {activeVideoModal.title}
                </h4>
                <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed drop-shadow">
                  {activeVideoModal.caption}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[#cbb592] font-mono pt-0.5">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {activeVideoModal.views.toLocaleString()} วิว
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <Heart className="w-3 h-3 fill-current" />
                    {activeVideoModal.likes.toLocaleString()} ไลก์
                  </span>
                </div>
              </div>

              {activeVideoModal.linkedProduct && (
                <div className="p-2.5 rounded-2xl bg-[#121619]/90 backdrop-blur-md border border-[#cbb592]/50 flex items-center justify-between gap-2 shadow-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={activeVideoModal.linkedProduct.image}
                      alt={activeVideoModal.linkedProduct.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#cbb592]/40"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white truncate block">
                        {activeVideoModal.linkedProduct.name}
                      </span>
                      <span className="text-xs font-bold text-[#cbb592] font-mono">
                        ฿{activeVideoModal.linkedProduct.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onDirectTryOn && (
                      <button
                        onClick={() => {
                          const p = activeVideoModal.linkedProduct!;
                          setActiveVideoModal(null);
                          onDirectTryOn(p);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#dfa24b] to-[#b68235] text-black text-[10px] font-black hover:brightness-110 shadow"
                      >
                        ลองชุด AI
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STORE CUSTOMER CHAT (แผงแชทดูแลลูกค้า)
          ======================================================== */}
      {showStoreChatModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md h-[90vh] bg-[#0e1215] border border-[#29333b] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
            
            {/* Chat Modal Top Header */}
            <div className="p-3.5 bg-[#14191d] border-b border-[#232b32] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center shadow">
                  <img src={selectedStore.logo} alt={selectedStore.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{selectedStore.name}</h4>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-[#cbb592]">ฝ่ายบริการลูกค้า & สไตล์ลิสต์</span>
                </div>
              </div>

              <button
                onClick={() => setShowStoreChatModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(chatHistory['store-isara'] || []).map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[82%] text-left ${
                    m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#18392b] text-white border border-[#cbb592]/50 rounded-br-none'
                        : 'bg-[#182025] text-gray-100 border border-[#2d3741] rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1 font-mono">{m.time}</span>
                </div>
              ))}
            </div>

      {/* ========================================================
          MODAL: STORE ADD PRODUCT WITH MULTI-ANGLE TEMPLATES
          ======================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveStoreProduct}
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#101417] border border-[#2c3743] rounded-3xl p-5 shadow-2xl space-y-4 text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#232b33]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#18392b] text-[#cbb592] border border-[#cbb592]/50 flex items-center justify-center shadow">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>ลงสินค้าใหม่ด้วยรูปภาพ</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#1f4a38] text-[#cbb592] text-[9px] font-bold border border-[#cbb592]/30">
                      ร้าน {selectedStore.name}
                    </span>
                  </h4>
                  <p className="text-[10px] text-[#cbb592]">ระบบเทมเพลตมุมมองเสื้อผ้า (หน้า-หลัง-ข้าง-ซูมผ้า) ลองชุด AI ได้ทันที</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Basic Info: Name, Price */}
            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">ชื่อสินค้าแฟชั่น *</label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="เช่น สูทเบลเซอร์เทเลอร์ คัตติ้งเนี้ยบ หรือ กางเกงลินินเอวสูง"
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none focus:border-[#cbb592]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">ราคาขาย (บาท) *</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1 font-semibold">ราคาเต็มก่อนลด (บาท)</label>
                <input
                  type="number"
                  value={newProdOriginalPrice}
                  onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                  placeholder="เช่น 1890"
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
                />
              </div>
            </div>

            {/* Category & Demographic */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">หมวดหมู่สินค้า</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value as any)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
                >
                  <option value="tops">เสื้อ (Tops)</option>
                  <option value="pants">กางเกง (Pants)</option>
                  <option value="skirts">กระโปรง (Skirts)</option>
                  <option value="dresses">ชุดเดรส (Dresses)</option>
                  <option value="outerwear">เสื้อคลุม / สูท / โค้ท (Outerwear)</option>
                  <option value="shoes">รองเท้า (Shoes)</option>
                  <option value="bags">กระเป๋า (Bags)</option>
                  <option value="accessories">เครื่องประดับ (Accessories)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">กลุ่มลูกค้าเป้าหมาย</label>
                <select
                  value={newProdSubCategory}
                  onChange={(e) => setNewProdSubCategory(e.target.value as any)}
                  className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
                >
                  <option value="women">ผู้หญิง (Women)</option>
                  <option value="men">ผู้ชาย (Men)</option>
                  <option value="kids">เด็ก (Kids)</option>
                  <option value="mature">วัยผู้ใหญ่ / วัยสง่า (Mature)</option>
                </select>
              </div>
            </div>

            {/* MULTI-ANGLE TEMPLATES SECTION (แบ่งเทมเพลตหน้า-หลัง) */}
            <div className="p-3.5 rounded-2xl bg-[#0d1114] border border-[#293540] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#dfa24b]" />
                  <span>เทมเพลตมุมมองเสื้อผ้า (หน้า-หลัง-ข้าง-ซูมผ้า)</span>
                </span>
                <span className="text-[9px] text-[#cbb592] bg-[#14281e] px-2 py-0.5 rounded-full border border-[#cbb592]/30 font-semibold">
                  รองรับ AI Try-On
                </span>
              </div>

              {/* Template Type Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewProdTemplate('front_back')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    newProdTemplate === 'front_back'
                      ? 'bg-[#18392b] border-[#cbb592] text-[#f5ebd9] shadow-md font-bold'
                      : 'bg-[#12161a] border-[#293540] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs mb-0.5">📸 ✦ 🔄</div>
                  <span className="text-[11px] block font-semibold">เทมเพลตคู่หน้า-หลัง</span>
                  <span className="text-[8px] text-[#cbb592] block">Front & Back Duo (มาตรฐานแฟชั่น)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewProdTemplate('all_angles')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    newProdTemplate === 'all_angles'
                      ? 'bg-[#18392b] border-[#cbb592] text-[#f5ebd9] shadow-md font-bold'
                      : 'bg-[#12161a] border-[#293540] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs mb-0.5">📐 ⊞ 🔍</div>
                  <span className="text-[11px] block font-semibold">เทมเพลตครบ 4 มุม 360°</span>
                  <span className="text-[8px] text-[#cbb592] block">หน้า / หลัง / ข้าง / ดีเทลเนื้อผ้า</span>
                </button>
              </div>

              {/* Quick Preset Samples */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[10px] text-gray-400 whitespace-nowrap">ตัวอย่างด่วน:</span>
                <button
                  type="button"
                  onClick={() => applyStoreProductPreset('blazer')}
                  className="px-2 py-0.5 rounded-full bg-[#1b252c] hover:bg-[#25323a] text-[#cbb592] text-[9px] font-semibold border border-[#3b4752] whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  ✨ สูทเบลเซอร์หน้า-หลัง
                </button>
                <button
                  type="button"
                  onClick={() => applyStoreProductPreset('linen')}
                  className="px-2 py-0.5 rounded-full bg-[#1b252c] hover:bg-[#25323a] text-[#cbb592] text-[9px] font-semibold border border-[#3b4752] whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  ✨ กางเกงลินินหน้า-หลัง
                </button>
                <button
                  type="button"
                  onClick={() => applyStoreProductPreset('dress')}
                  className="px-2 py-0.5 rounded-full bg-[#1b252c] hover:bg-[#25323a] text-[#cbb592] text-[9px] font-semibold border border-[#3b4752] whitespace-nowrap flex items-center gap-1 active:scale-95"
                >
                  ✨ เดรสซาตินหน้า-หลัง
                </button>
              </div>

              {/* Live Preview Box with Front / Back Switch */}
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-[#26313b] flex items-center justify-center">
                {newProdTemplate === 'front_back' ? (
                  /* Split Dual Preview */
                  <div className="w-full h-full grid grid-cols-2 divide-x divide-[#cbb592]/30 relative">
                    <div className="relative h-full overflow-hidden">
                      {newProdFrontImage ? (
                        <img src={newProdFrontImage} alt="Front Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] text-gray-500">อัปโหลดรูปหน้า</div>
                      )}
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-white border border-[#cbb592]/50">
                        📸 หน้า
                      </span>
                    </div>

                    <div className="relative h-full overflow-hidden">
                      {newProdBackImage ? (
                        <img src={newProdBackImage} alt="Back Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] text-gray-500">อัปโหลดรูปหลัง</div>
                      )}
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-[#dfa24b] border border-[#dfa24b]/50">
                        🔄 หลัง
                      </span>
                    </div>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#18392b] border border-[#cbb592] text-[7px] font-bold text-[#f5ebd9]">
                      เทมเพลต หน้า ✦ หลัง
                    </div>
                  </div>
                ) : (
                  /* All Angles Switcher Preview */
                  <>
                    {(() => {
                      const curImg = prodModalPreviewAngle === 'front' ? newProdFrontImage : prodModalPreviewAngle === 'back' ? newProdBackImage : prodModalPreviewAngle === 'side' ? newProdSideImage : newProdDetailImage;
                      return curImg ? (
                        <img src={curImg} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-gray-500 text-xs">ยังไม่มีรูปภาพมุมนี้</div>
                      );
                    })()}
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1.5 z-10">
                      {(['front', 'back', 'side', 'detail'] as const).map(ang => (
                        <button
                          key={ang}
                          type="button"
                          onClick={() => setProdModalPreviewAngle(ang)}
                          className={`px-2 py-0.5 rounded-xl text-[9px] font-bold transition-all backdrop-blur-md ${
                            prodModalPreviewAngle === ang
                              ? 'bg-[#18392b] text-[#f5ebd9] border border-[#cbb592] shadow'
                              : 'bg-black/60 text-gray-300 border border-white/20'
                          }`}
                        >
                          {ang === 'front' ? '📸 หน้า' : ang === 'back' ? '🔄 หลัง' : ang === 'side' ? '📐 ข้าง' : '🔍 ผ้า'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 4 Image Upload Slots */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* 1. ด้านหน้า (Front - Required) */}
                <div className={`p-2 rounded-xl border text-left ${prodModalPreviewAngle === 'front' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-0.5">
                      <span>📸 รูปด้านหน้า</span>
                      <span className="text-red-400">*</span>
                    </span>
                    {newProdFrontImage && <span className="text-[8px] text-green-400 font-bold">✓ มีรูป</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลดรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProductImageUpload('front', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={newProdFrontImage}
                    onChange={(e) => setNewProdFrontImage(e.target.value)}
                    placeholder="URL รูปด้านหน้า..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>

                {/* 2. ด้านหลัง (Back - Recommended) */}
                <div className={`p-2 rounded-xl border text-left ${prodModalPreviewAngle === 'back' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white flex items-center gap-0.5">
                      <span>🔄 รูปด้านหลัง</span>
                    </span>
                    {newProdBackImage && <span className="text-[8px] text-green-400 font-bold">✓ มีรูป</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลดรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProductImageUpload('back', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={newProdBackImage}
                    onChange={(e) => setNewProdBackImage(e.target.value)}
                    placeholder="URL รูปด้านหลัง..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>

                {/* 3. ด้านข้าง (Side - Optional) */}
                <div className={`p-2 rounded-xl border text-left ${prodModalPreviewAngle === 'side' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white">📐 รูปด้านข้าง</span>
                    {newProdSideImage && <span className="text-[8px] text-green-400 font-bold">✓ มีรูป</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลด</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProductImageUpload('side', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={newProdSideImage}
                    onChange={(e) => setNewProdSideImage(e.target.value)}
                    placeholder="URL รูปด้านข้าง..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>

                {/* 4. ซูมเนื้อผ้า (Detail - Optional) */}
                <div className={`p-2 rounded-xl border text-left ${prodModalPreviewAngle === 'detail' ? 'border-[#cbb592] bg-[#162127]' : 'border-[#27323c] bg-[#12161a]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-white">🔍 ซูมเนื้อผ้า</span>
                    {newProdDetailImage && <span className="text-[8px] text-green-400 font-bold">✓ มีรูป</span>}
                  </div>
                  <label className="py-1 px-2 rounded-lg bg-[#1f2930] hover:bg-[#283540] border border-[#3b4854] text-[10px] text-[#cbb592] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-3 h-3" />
                    <span>อัปโหลด</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProductImageUpload('detail', e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={newProdDetailImage}
                    onChange={(e) => setNewProdDetailImage(e.target.value)}
                    placeholder="URL ซูมเนื้อผ้า..."
                    className="w-full mt-1.5 bg-[#0e1215] text-[9px] text-white p-1 rounded-lg border border-[#2b353f] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Additional Garment Specs: Stock, Colors, Fabric */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">จำนวนสต็อก (ชิ้น)</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  className="w-full bg-[#182025] text-xs text-white p-2 rounded-xl border border-[#303c47] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">ตัวเลือกสี</label>
                <input
                  type="text"
                  value={newProdColors}
                  onChange={(e) => setNewProdColors(e.target.value)}
                  placeholder="เช่น ดำ, ขาว, เบจ"
                  className="w-full bg-[#182025] text-xs text-white p-2 rounded-xl border border-[#303c47] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">ชนิดผ้า & คัตติ้ง</label>
              <input
                type="text"
                value={newProdFabric}
                onChange={(e) => setNewProdFabric(e.target.value)}
                placeholder="เช่น ผ้าลินินธรรมชาติ 100% สั่งทอพิเศษ สัมผัสสบาย"
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#cbb592] block mb-1 font-semibold">คำอธิบายและรายละเอียดสินค้า</label>
              <textarea
                rows={2}
                value={newProdDescription}
                onChange={(e) => setNewProdDescription(e.target.value)}
                placeholder="อธิบายจุดเด่นของชุด คัตติ้ง และคำแนะนำการสวมใส่"
                className="w-full bg-[#182025] text-xs text-white p-2.5 rounded-xl border border-[#303c47] outline-none"
              />
            </div>

            {/* Auto post to feed checkbox */}
            <div className="p-2.5 rounded-xl bg-[#141d18] border border-[#2b4233] flex items-center gap-2 cursor-pointer" onClick={() => setAutoPostToFeed(!autoPostToFeed)}>
              <input
                type="checkbox"
                checked={autoPostToFeed}
                onChange={(e) => setAutoPostToFeed(e.target.checked)}
                className="w-4 h-4 accent-[#cbb592] cursor-pointer"
              />
              <span className="text-xs text-white font-medium select-none">
                แชร์ลงโพสต์ฟีดหลักทันทีด้วยเทมเพลตคู่หน้า-หลัง (Split Dual)
              </span>
            </div>

            {/* Submit & Cancel */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-transparent border border-gray-600 text-gray-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#18392b] text-[#f5ebd9] text-xs font-bold border border-[#cbb592] hover:bg-[#204b38] shadow"
              >
                บันทึกและลงขายสินค้า
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Prompt Chips */}
            <div className="px-3 pt-2 bg-[#121619] border-t border-[#20272e] flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                'ขอคำแนะนำขนาดไซส์',
                'ปรึกษาเรื่องลองชุด AI',
                'สอบถามสถานะคำสั่งซื้อ',
                'ขอโค้ดส่วนลดพิเศษ'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    const userMsg: ChatMessage = {
                      id: `u-${Date.now()}`,
                      sender: 'user',
                      text: chip,
                      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                    };
                    setChatHistory(prev => ({
                      ...prev,
                      'store-isara': [...(prev['store-isara'] || []), userMsg]
                    }));
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#1b2329] text-[10px] text-[#cbb592] border border-[#303c46] whitespace-nowrap hover:bg-[#18392b] hover:text-white transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                const userMsg: ChatMessage = {
                  id: `u-${Date.now()}`,
                  sender: 'user',
                  text: chatInput.trim(),
                  time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                };
                setChatHistory(prev => ({
                  ...prev,
                  'store-isara': [...(prev['store-isara'] || []), userMsg]
                }));
                setChatInput('');
              }}
              className="p-3 bg-[#14191d] border-t border-[#20272e] flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`พิมพ์ข้อความคุยกับ ${selectedStore.name}...`}
                className="flex-1 bg-[#1a2126] border border-[#2e3943] focus:border-[#cbb592] rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-full bg-[#18392b] text-[#cbb592] border border-[#cbb592] hover:bg-[#204a38] disabled:opacity-40 transition-all"
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
