/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeFeed } from './components/HomeFeed';
import { ShopView } from './components/ShopView';
import { VirtualTryOn } from './components/VirtualTryOn';
import { CartDrawer } from './components/CartDrawer';
import { LiveStreamModal } from './components/LiveStreamModal';
import { BrandStoreModal } from './components/BrandStoreModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NotificationModal } from './components/NotificationModal';
import { SearchModal } from './components/SearchModal';
import { ProfileView } from './components/ProfileView';

import { Product, Store, FeedPost, CartItem, Order, UserProfile, AppNotification } from './types';
import { INITIAL_PRODUCTS, INITIAL_STORES, INITIAL_FEED_POSTS, INITIAL_NOTIFICATIONS } from './data/mockData';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasStartedApp, setHasStartedApp] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<'feed' | 'shop' | 'tryon' | 'cart' | 'profile'>('feed');

  // Commerce Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      productId: INITIAL_PRODUCTS[0].id,
      product: INITIAL_PRODUCTS[0],
      size: 'M',
      color: 'เบจธรรมชาติ',
      quantity: 1,
      selected: true
    },
    {
      id: 'cart-2',
      productId: INITIAL_PRODUCTS[1].id,
      product: INITIAL_PRODUCTS[1],
      size: 'S',
      color: 'ดำหรูหรา',
      quantity: 1,
      selected: true
    },
    {
      id: 'cart-3',
      productId: INITIAL_PRODUCTS[2].id,
      product: INITIAL_PRODUCTS[2],
      size: 'M',
      color: 'ดำสนิท',
      quantity: 1,
      selected: true
    },
    {
      id: 'cart-4',
      productId: INITIAL_PRODUCTS[8].id,
      product: INITIAL_PRODUCTS[8],
      size: 'One Size',
      color: 'ครีมงาช้าง',
      quantity: 1,
      selected: true
    }
  ]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-101',
      orderNumber: 'IS-89421',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'ci-1',
          productId: INITIAL_PRODUCTS[0].id,
          product: INITIAL_PRODUCTS[0],
          size: 'M',
          color: 'เบจธรรมชาติ',
          quantity: 1,
          selected: true
        }
      ],
      totalAmount: 1290,
      discount: 100,
      finalAmount: 1190,
      status: 'shipping',
      paymentMethod: 'promptpay',
      trackingNumber: 'FL-TH88294012X',
      shippingAddress: '88/1 อาคารไอซาร่า ทาวเวอร์ ชั้น 18 กทม. 10110',
      customerName: 'คุณภัทรวดี (ISARA VIP)',
      customerPhone: '081-234-5678'
    }
  ]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals & Overlays
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [preSelectedTryOnProduct, setPreSelectedTryOnProduct] = useState<Product | null>(null);

  // Fetch initial data from server if available
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { if (data.success && data.products?.length) setProducts(data.products); })
      .catch(() => {});

    fetch('/api/stores')
      .then(res => res.json())
      .then(data => { if (data.success && data.stores?.length) setStores(data.stores); })
      .catch(() => {});

    fetch('/api/feed')
      .then(res => res.json())
      .then(data => { if (data.success && data.feed?.length) setFeedPosts(data.feed); })
      .catch(() => {});

    fetch('/api/cart')
      .then(res => res.json())
      .then(data => { if (data.success && data.cart?.length) setCartItems(data.cart); })
      .catch(() => {});

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.success && data.user) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  // Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setHasStartedApp(true);
    setActiveTab('feed');
  };

  const handleExploreGuest = () => {
    setCurrentUser({
      id: 'guest-1',
      name: 'ผู้มาเยือน (Guest)',
      email: 'guest@isara.style',
      phone: '080-000-0000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      authProvider: 'guest',
      role: 'customer',
      address: '88/1 อาคารไอซาร่า ทาวเวอร์ ถนนสุขุมวิท กทม. 10110',
      savedVouchers: ['ISARAVIP']
    });
    setHasStartedApp(true);
    setActiveTab('feed');
  };

  const handleAddToCart = (product: Product, size = 'M', color?: string) => {
    const existingIndex = cartItems.findIndex(i => i.productId === product.id && i.size === size);
    if (existingIndex > -1) {
      setCartItems(prev => {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      });
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        product,
        size,
        color: color || product.colors[0] || 'มาตรฐาน',
        quantity: 1,
        selected: true
      };
      setCartItems(prev => [newItem, ...prev]);
    }

    // Call server
    fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, size, color })
    }).catch(() => {});
  };

  const handleLikePost = (postId: string) => {
    setFeedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likes: isLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));

    fetch(`/api/feed/${postId}/like`, { method: 'POST' }).catch(() => {});
  };

  const handleCommentPost = (postId: string, commentText: string) => {
    setFeedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, commentsCount: p.commentsCount + 1 };
      }
      return p;
    }));

    fetch(`/api/feed/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: commentText })
    }).catch(() => {});
  };

  const handleDirectTryOn = (product: Product) => {
    setPreSelectedTryOnProduct(product);
    setActiveTab('tryon');
  };

  const handleToggleFollowStore = (storeId: string) => {
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        const isFollowing = !s.isFollowing;
        return {
          ...s,
          isFollowing,
          followersCount: isFollowing ? s.followersCount + 1 : s.followersCount - 1
        };
      }
      return s;
    }));
    fetch(`/api/stores/${storeId}/follow`, { method: 'POST' }).catch(() => {});
  };

  // Add / Edit Product from Backend
  const handleAddOrUpdateProduct = (prodData: Partial<Product>) => {
    fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setProducts(prev => {
            const exists = prev.some(p => p.id === data.product.id);
            if (exists) return prev.map(p => p.id === data.product.id ? data.product : p);
            return [data.product, ...prev];
          });
        }
      })
      .catch(() => {});
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    fetch(`/api/admin/products/${productId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  // If user hasn't started yet, display the Welcome screen matching Screenshot 1!
  if (!hasStartedApp && !currentUser) {
    return (
      <WelcomeScreen
        onLoginSuccess={handleLoginSuccess}
        onExploreGuest={handleExploreGuest}
      />
    );
  }

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#0b0d0e] text-[#f4efe6] flex flex-col justify-between selection:bg-[#cbb592] selection:text-black">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSearchClick={() => setShowSearchModal(true)}
        onLiveClick={() => setShowLiveStream(true)}
        onNotificationClick={() => setShowNotificationModal(true)}
        onAdminClick={() => setShowAdminPanel(true)}
        notificationCount={unreadNotifCount}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        {activeTab === 'feed' && (
          <HomeFeed
            feedPosts={feedPosts}
            products={products}
            currentUser={currentUser || undefined}
            onLikePost={handleLikePost}
            onAddToCart={handleAddToCart}
            onDirectTryOn={handleDirectTryOn}
            onCommentPost={handleCommentPost}
            onAddPost={(newPost) => setFeedPosts(prev => [newPost, ...prev])}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            products={products}
            stores={stores}
            onSelectProduct={(prod) => handleDirectTryOn(prod)}
            onSelectStore={(st) => setSelectedStore(st)}
            onAddToCart={handleAddToCart}
            onDirectTryOn={handleDirectTryOn}
            onOpenPrivateSaleVoucher={() => setShowCartDrawer(true)}
          />
        )}

        {activeTab === 'tryon' && (
          <VirtualTryOn
            cartItems={cartItems}
            allProducts={products}
            onAddToCart={handleAddToCart}
            preSelectedProduct={preSelectedTryOnProduct}
            onNavigateToShop={() => setActiveTab('shop')}
            onPostToFeed={(newPost) => {
              const created: FeedPost = {
                id: `feed-${Date.now()}`,
                author: {
                  name: currentUser?.name || 'ฉัน',
                  handle: `@${(currentUser?.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
                  avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                  verified: true
                },
                mediaUrl: newPost.mediaUrl,
                mediaType: 'image',
                title: newPost.title,
                price: newPost.price,
                description: 'ลองชุดนี้ด้วยระบบ ISARA AI Virtual Try-On สวยเป๊ะพร้อมใส่!',
                likes: 1,
                isLiked: false,
                commentsCount: 0,
                sharesCount: 0,
                timeAgo: 'เมื่อสักครู่',
                linkedProductId: newPost.linkedProductId,
                product: products.find(p => p.id === newPost.linkedProductId) || products[0]
              };
              setFeedPosts(prev => [created, ...prev]);
              setActiveTab('feed');
            }}
            onQuickCheckout={(selectedProds) => {
              // Add any missing to cart then open cart drawer
              selectedProds.forEach(p => handleAddToCart(p));
              setShowCartDrawer(true);
            }}
          />
        )}

        {activeTab === 'cart' && (
          <div className="w-full max-w-md mx-auto pt-4 px-4 text-center">
            <CartDrawer
              isOpen={true}
              onClose={() => setActiveTab('shop')}
              cartItems={cartItems}
              onUpdateQuantity={(id, qty) => setCartItems(prev => prev.map(c => c.id === id ? { ...c, quantity: qty } : c))}
              onRemoveItem={(id) => setCartItems(prev => prev.filter(c => c.id !== id))}
              onToggleSelect={(id, sel) => setCartItems(prev => prev.map(c => c.id === id ? { ...c, selected: sel } : c))}
              onOrderSuccess={(order) => {
                setOrders(prev => [order, ...prev]);
                setCartItems(prev => prev.filter(c => !order.items.some(i => i.id === c.id)));
              }}
            />
          </div>
        )}

        {activeTab === 'profile' && currentUser && (
          <ProfileView
            user={currentUser}
            orders={orders}
            stores={stores}
            products={products}
            feedPosts={feedPosts}
            onAddFeedPost={(newPost) => setFeedPosts(prev => [newPost, ...prev])}
            onAddOrUpdateProduct={handleAddOrUpdateProduct}
            onDirectTryOn={(product) => {
              setPreSelectedTryOnProduct(product);
              setActiveTab('tryon');
            }}
            onOpenAdmin={() => setShowAdminPanel(true)}
            onOpenTryOn={() => setActiveTab('tryon')}
            onLogout={() => {
              setCurrentUser(null);
              setHasStartedApp(false);
            }}
            onUpdateAddress={(newAddr) => {
              setCurrentUser(prev => prev ? { ...prev, address: newAddr } : null);
              fetch('/api/auth/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: newAddr })
              }).catch(() => {});
            }}
          />
        )}
      </main>

      {/* Luxury Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'cart') {
            setShowCartDrawer(true);
          } else {
            setActiveTab(tab);
          }
        }}
        cartCount={cartItems.length}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        cartItems={cartItems}
        onUpdateQuantity={(id, qty) => setCartItems(prev => prev.map(c => c.id === id ? { ...c, quantity: qty } : c))}
        onRemoveItem={(id) => setCartItems(prev => prev.filter(c => c.id !== id))}
        onToggleSelect={(id, sel) => setCartItems(prev => prev.map(c => c.id === id ? { ...c, selected: sel } : c))}
        onOrderSuccess={(order) => {
          setOrders(prev => [order, ...prev]);
          setCartItems(prev => prev.filter(c => !order.items.some(i => i.id === c.id)));
        }}
      />

      {/* Live Stream Shopping Modal */}
      <LiveStreamModal
        isOpen={showLiveStream}
        onClose={() => setShowLiveStream(false)}
        pinnedProduct={products[0]}
        onAddToCart={handleAddToCart}
        onDirectTryOn={handleDirectTryOn}
      />

      {/* Brand Store Detail Modal */}
      <BrandStoreModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        products={products}
        onAddToCart={handleAddToCart}
        onDirectTryOn={handleDirectTryOn}
        onToggleFollow={handleToggleFollowStore}
      />

      {/* Admin Panel Modal (ระบบหลังบ้าน) */}
      <AdminPanelModal
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        products={products}
        onAddOrUpdateProduct={handleAddOrUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          fetch('/api/notifications/mark-read', { method: 'POST' }).catch(() => {});
        }}
        onOpenLive={() => setShowLiveStream(true)}
        onOpenTryOn={() => setActiveTab('tryon')}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        products={products}
        stores={stores}
        onSelectProduct={(p) => handleDirectTryOn(p)}
        onSelectStore={(s) => setSelectedStore(s)}
        onDirectTryOn={handleDirectTryOn}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
}
