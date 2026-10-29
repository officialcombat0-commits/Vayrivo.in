import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { InvoiceModal } from '../components/InvoiceModal';
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  Package,
  Plus,
  Printer,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: string;
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'orders',
  onNavigate,
  onSelectProduct,
}) => {
  const {
    user,
    token,
    login,
    register,
    logout,
    formatPrice,
    products,
    wishlist,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState(initialTab);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Customer Orders & Addresses
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<string | null>(null);

  // Add Address Modal / Form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  // Fetch client data
  const fetchClientData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [resOrders, resMe] = await Promise.all([
        fetch('/api/my-orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resOrders.ok) {
        const orderData = await resOrders.json();
        setMyOrders(orderData);
      }
      if (resMe.ok) {
        const meData = await resMe.json();
        setAddresses(meData.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load account data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchClientData();
    }
  }, [user, token]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    await login(email, password);
    setAuthLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    await register(fullName, email, password, phone);
    setAuthLoading(false);
  };

  const handleDemoCustomerLogin = async () => {
    setAuthLoading(true);
    await login('customer@example.com', 'Customer@2026');
    setAuthLoading(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.addressLine1 || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      showToast('All address fields are required', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses);
        setShowAddAddress(false);
        showToast('Delivery address saved successfully', 'success');
      } else {
        showToast(data.error || 'Failed to save address', 'error');
      }
    } catch {
      showToast('Failed to save address', 'error');
    }
  };

  // Filter wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // If user is not authenticated, show luxury auth portal
  if (!user || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Client Sanctuary
          </span>
          <h1 className="font-brand text-3xl text-[#F5F0E5]">
            VAYRIVO Salon
          </h1>
          <p className="text-xs text-[#F5F0E5]/60 font-light">
            Sign in to track orders, manage saved addresses, and access private collector allocations.
          </p>
        </div>

        {/* 1-Click Demo Login Box */}
        <div className="p-4 border border-[#D8B56D]/40 bg-[#092117] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#F1D99B] font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D8B56D]" /> Demo Patron Account
            </span>
            <span className="text-[10px] uppercase font-mono text-[#D8B56D]">Instant Test</span>
          </div>
          <p className="text-[#F5F0E5]/70 text-[11px] font-light">
            Pre-loaded with sample Mumbai address and previous commissioned orders.
          </p>
          <button
            type="button"
            onClick={handleDemoCustomerLogin}
            disabled={authLoading}
            className="w-full gold-button py-2 text-xs font-semibold uppercase tracking-wider mt-1"
          >
            Sign In with Demo Patron
          </button>
        </div>

        {/* Auth Tabs */}
        <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-6">
          <div className="flex border-b border-[#1a3c2c]">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 text-xs uppercase tracking-widest font-mono text-center transition-all ${
                authMode === 'login'
                  ? 'border-b-2 border-[#D8B56D] text-[#F1D99B] font-bold'
                  : 'text-[#F5F0E5]/50 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 text-xs uppercase tracking-widest font-mono text-center transition-all ${
                authMode === 'register'
                  ? 'border-b-2 border-[#D8B56D] text-[#F1D99B] font-bold'
                  : 'text-[#F5F0E5]/50 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full gold-button py-3 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
              >
                {authLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maharani Gayatri Devi"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block">Indian Mobile (+91)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full gold-button py-3 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
              >
                {authLoading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Authenticated Patron Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Patron Welcome Header */}
      <div className="p-6 sm:p-8 border border-[#1a3c2c] bg-[#092117]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            VAYRIVO Circle Patron
          </span>
          <h1 className="font-brand text-2xl sm:text-3xl text-[#F5F0E5]">
            Welcome, {user.fullName}
          </h1>
          <p className="text-xs text-[#F5F0E5]/60 font-mono">
            {user.email} • {user.phone || 'No mobile linked'}
          </p>
        </div>

        <button
          onClick={logout}
          className="gold-button-outline px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a3c2c] overflow-x-auto text-xs uppercase tracking-widest font-mono">
        {[
          { id: 'orders', label: `Order History (${myOrders.length})`, icon: Package },
          { id: 'addresses', label: `Saved Addresses (${addresses.length})`, icon: MapPin },
          { id: 'wishlist', label: `Private Wishlist (${wishlist.length})`, icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3.5 flex items-center gap-2 shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#D8B56D] text-[#F1D99B] bg-[#092117]/30 font-bold'
                  : 'text-[#F5F0E5]/60 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#D8B56D]" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingData ? (
            <div className="text-center py-12 text-xs text-[#D8B56D]">Loading past orders...</div>
          ) : myOrders.length === 0 ? (
            <div className="text-center py-16 border border-[#1a3c2c] bg-[#092117]/20 p-8 space-y-4">
              <ShoppingBag className="w-10 h-10 text-[#D8B56D]/40 mx-auto" />
              <h3 className="font-serif-luxury text-2xl text-[#F5F0E5]">No Orders Placed Yet</h3>
              <p className="text-xs text-[#F5F0E5]/60 max-w-sm mx-auto font-light">
                Your inaugural flacon awaits. Commission an Extrait de Parfum to begin your olfactory journey.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="gold-button px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 border border-[#1a3c2c] bg-[#092117]/30 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#1a3c2c] gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#F1D99B]">{ord.order_number}</span>
                        <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-[#1a3c2c] text-[#D8B56D] border border-[#D8B56D]/30">
                          {ord.order_status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#F5F0E5]/50 font-mono mt-0.5">
                        Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-[#F5F0E5]">
                        {formatPrice(ord.total_amount)}
                      </span>
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord.order_number)}
                        className="gold-button-outline px-3 py-1 text-[11px] uppercase font-mono flex items-center gap-1.5"
                      >
                        <Printer className="w-3 h-3" /> Tax Invoice
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 text-xs">
                    {ord.items?.map((it: any) => (
                      <div key={it.id} className="flex justify-between items-center text-[#F5F0E5]/80">
                        <span>
                          {it.historical_product_name} ({it.historical_size_ml}ml) × {it.quantity}
                        </span>
                        <span className="font-mono">{formatPrice(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dispatch and Tracking info */}
                  {ord.tracking_number && (
                    <div className="p-3 bg-[#050d09]/70 border border-[#1a3c2c] text-xs flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2 text-[#D8B56D]">
                        <Truck className="w-4 h-4" />
                        <span>AWB Tracking: {ord.tracking_number} ({ord.courier_name || 'Express Courier'})</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">In Transit</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-luxury text-xl text-[#F5F0E5]">Registered Delivery Addresses</h3>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="gold-button px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddress && (
            <form onSubmit={handleSaveAddress} className="p-6 border border-[#D8B56D]/40 bg-[#092117] space-y-4 text-xs animate-in fade-in duration-200">
              <h4 className="font-serif-luxury text-lg text-[#F1D99B]">New Delivery Destination</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#F5F0E5]/70 block mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#F5F0E5]/70 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[#F5F0E5]/70 block mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[#F5F0E5]/70 block mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={newAddr.addressLine2}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#F5F0E5]/70 block mb-1">PIN Code (6 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#F5F0E5]/70 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[#F5F0E5]/70 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="accent-[#D8B56D]"
                  />
                  <span>Set as default delivery address</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 border border-[#1a3c2c] text-[#F5F0E5]/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="gold-button px-5 py-2 uppercase font-semibold">
                    Save Address
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Addresses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-5 border border-[#1a3c2c] bg-[#092117]/30 space-y-2 text-xs relative"
              >
                {addr.is_default === 1 && (
                  <span className="absolute top-4 right-4 bg-[#D8B56D]/20 text-[#D8B56D] border border-[#D8B56D]/40 text-[10px] font-mono px-2 py-0.5">
                    Default Destination
                  </span>
                )}
                <div className="font-semibold text-sm text-[#F5F0E5]">{addr.full_name}</div>
                <div className="text-[#F5F0E5]/80 leading-relaxed">
                  {addr.address_line1}
                  {addr.address_line2 && `, ${addr.address_line2}`}<br />
                  {addr.city}, {addr.state} — {addr.pincode}<br />
                  India
                </div>
                <div className="text-[#F5F0E5]/60 font-mono pt-1">
                  Mobile: {addr.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h3 className="font-serif-luxury text-xl text-[#F5F0E5]">Your Curated Wishlist ({wishlist.length})</h3>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 border border-[#1a3c2c] bg-[#092117]/20 p-8 space-y-4">
              <Heart className="w-10 h-10 text-[#D8B56D]/40 mx-auto" />
              <h4 className="font-serif-luxury text-2xl text-[#F5F0E5]">No Fragrances Saved</h4>
              <p className="text-xs text-[#F5F0E5]/60 max-w-sm mx-auto font-light">
                Click the heart icon on any flacon to save it to your private collection.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="gold-button px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
              >
                Explore Flacons
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          orderNumber={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
