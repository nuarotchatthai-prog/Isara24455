export interface ProductAngles {
  front: string;
  back?: string;
  side?: string;
  detail?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: 'tops' | 'pants' | 'skirts' | 'dresses' | 'shoes' | 'bags' | 'outerwear' | 'hats' | 'eyewear' | 'jewelry' | 'belts' | 'underwear' | 'accessories' | 'socks';
  subCategory: 'women' | 'men' | 'kids' | 'mature';
  brand: string;
  brandId: string;
  image: string;
  backImage?: string;
  sideImage?: string;
  detailImage?: string;
  detailImages?: string[];
  angles?: ProductAngles;
  layoutTemplate?: 'front_back' | 'all_angles';
  inStock: boolean;
  stockCount: number;
  rating: number;
  soldCount: number;
  likesCount: number;
  sizes: string[];
  colors: string[];
  fabric?: string;
  tags?: string[];
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  description: string;
  highlight: string;
  coverImage: string;
  followersCount: number;
  isFollowing?: boolean;
  category: string;
  vouchers: {
    code: string;
    discountPercent?: number;
    discountBaht?: number;
    minSpend: number;
    title: string;
  }[];
}

export interface FeedPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  mediaUrl: string;
  backMediaUrl?: string;
  sideMediaUrl?: string;
  detailMediaUrl?: string;
  galleryUrls?: string[];
  angles?: ProductAngles;
  layoutTemplate?: 'split_dual' | 'interactive_flip' | 'lookbook_grid' | 'carousel_tabs';
  mediaType: 'image' | 'video';
  videoDuration?: string;
  title: string;
  price: number;
  description: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  sharesCount: number;
  timeAgo: string;
  linkedProductId: string;
  product?: Product;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  selected: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  authProvider: 'google' | 'apple' | 'phone' | 'email' | 'guest';
  role: 'customer' | 'admin';
  address: string;
  promptPayNumber?: string;
  savedVouchers?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: 'pending' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  paymentMethod: 'promptpay' | 'credit_card' | 'cod' | 'truemoney';
  trackingNumber?: string;
  shippingAddress: string;
  customerName: string;
  customerPhone: string;
}

export interface TryOnResult {
  id: string;
  createdAt: string;
  modelPersona: string;
  userPhotoUrl?: string;
  wornProducts: Product[];
  scene: string;
  outputImageUrl: string;
  stylistFeedback: string;
  fitScore: number;
  colorHarmonies: string[];
  isBananaGenerated?: boolean;
  promptUsed?: string;
}

export interface LiveMessage {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  isHost?: boolean;
  badge?: string;
}

export interface AppNotification {
  id: string;
  type: 'order' | 'promo' | 'live' | 'tryon';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface FashionVideoItem {
  id: string;
  title: string;
  videoUrl: string;
  coverUrl: string;
  duration?: string;
  views: number;
  likes: number;
  ordersCount: number;
  revenue?: number;
  linkedProduct?: Product;
  style?: string;
  background?: string;
  modelName?: string;
  createdAt: string;
  authorType: 'user' | 'store';
  authorName: string;
  caption?: string;
}
