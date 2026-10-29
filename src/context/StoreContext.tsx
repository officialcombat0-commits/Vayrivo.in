import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, User, SiteSettings, Category } from '../types';

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  discountType: string;
}

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  loading: boolean;
  cart: CartItem[];
  wishlist: string[];
  appliedCoupon: AppliedCoupon | null;
  user: User | null;
  token: string | null;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  toast: ToastInfo | null;
  cartSubtotal: number;
  cartTotal: number;
  cartCount: number;
  shippingFee: number;
  freeShippingThreshold: number;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  refreshProducts: () => Promise<void>;
  formatPrice: (amount?: number | null) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    brand_name: 'VAYRIVO',
    brand_tagline: 'Your Scent. Your Signature.',
    announcement_bar: 'Complimentary Luxury Miniature (10ml) with every 100ml bottle | Free Insured Shipping Across India on orders above ₹2,000',
    shipping_fee: '0',
    standard_shipping_enabled: 'false',
    free_shipping_threshold: '2000',
    cod_available: 'true',
    cod_fee: '50',
    tax_rate_percent: '1',
    currency_symbol: '₹',
  });
  const [loading, setLoading] = useState(true);

  // Cart & Wishlist persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vayrivo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vayrivo_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('vayrivo_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth persistence
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('vayrivo_token');
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('vayrivo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Save Cart & Wishlist
  useEffect(() => {
    localStorage.setItem('vayrivo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vayrivo_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('vayrivo_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('vayrivo_coupon');
    }
  }, [appliedCoupon]);

  // Load products, categories, settings from server
  const refreshProducts = async () => {
    try {
      const [resProd, resCat, resSet] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/settings'),
      ]);

      if (resProd.ok) {
        const prodData = await resProd.json();
        setProducts(prodData);
      }
      if (resCat.ok) {
        const catData = await resCat.json();
        setCategories(catData);
      }
      if (resSet.ok) {
        const setData = await resSet.json();
        setSettings(setData);
      }
    } catch (err) {
      console.error('Failed to fetch store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Toast auto-clear
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.variant.sale_price ? item.variant.sale_price : item.variant.price;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const freeShippingThreshold = Number(settings.free_shipping_threshold || 2000);
  const isShippingEnabled = settings.standard_shipping_enabled === 'true';
  const baseShippingFee = isShippingEnabled ? Number(settings.shipping_fee || 0) : 0;

  const discountVal = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const netSubtotal = Math.max(0, cartSubtotal - discountVal);
  const shippingFee = cartSubtotal === 0 || netSubtotal >= freeShippingThreshold ? 0 : baseShippingFee;
  const cartTotal = netSubtotal + (cartSubtotal > 0 ? shippingFee : 0);

  // Cart Actions
  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    if (variant.stock_quantity <= 0) {
      showToast(`${product.name} (${variant.size_ml}ml) is currently out of stock`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, variant.stock_quantity);
        return prev.map((item) => (item.variant.id === variant.id ? { ...item, quantity: newQty } : item));
      }
      return [...prev, { product, variant, quantity: Math.min(quantity, variant.stock_quantity) }];
    });

    showToast(`Added ${product.name} (${variant.size_ml}ml) to your shopping bag`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variant.id !== variantId));
    showToast('Flacon removed from shopping bag', 'info');
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.variant.id === variantId) {
          const validQty = Math.min(quantity, item.variant.stock_quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from your private wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your private wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Apply Coupon
  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to apply promotional code', 'error');
        return false;
      }
      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
      });
      showToast(`Privilege code ${data.code} applied! Saved ₹${data.discountAmount.toLocaleString('en-IN')}`, 'success');
      return true;
    } catch {
      showToast('Network error while validating promo code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Privilege code removed', 'info');
  };

  // Auth Actions
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Authentication failed', 'error');
        return false;
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('vayrivo_token', data.token);
      localStorage.setItem('vayrivo_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.fullName}`, 'success');
      return true;
    } catch {
      showToast('Login request failed', 'error');
      return false;
    }
  };

  const register = async (fullName: string, email: string, pass: string, phone?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password: pass, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Registration failed', 'error');
        return false;
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('vayrivo_token', data.token);
      localStorage.setItem('vayrivo_user', JSON.stringify(data.user));
      showToast(`Welcome to VAYRIVO Haute Parfumerie, ${data.user.fullName}`, 'success');
      return true;
    } catch {
      showToast('Registration request failed', 'error');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vayrivo_token');
    localStorage.removeItem('vayrivo_user');
    showToast('Signed out from your VAYRIVO account', 'info');
  };

  const formatPrice = (amount?: number | null): string => {
    const symbol = settings.currency_symbol || '₹';
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return `${symbol}0`;
    }
    return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        loading,
        cart,
        wishlist,
        appliedCoupon,
        user,
        token,
        isCartOpen,
        isSearchOpen,
        toast,
        cartSubtotal,
        cartTotal,
        cartCount,
        shippingFee,
        freeShippingThreshold,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        setIsCartOpen,
        setIsSearchOpen,
        showToast,
        login,
        register,
        logout,
        refreshProducts,
        formatPrice,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
