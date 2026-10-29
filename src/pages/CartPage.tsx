import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Gift, Tag, Check, ShieldCheck, ChevronRight } from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: string, param?: string) => void;
  onProceedToCheckout: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onProceedToCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartTotal,
    shippingFee,
    freeShippingThreshold,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice,
    settings,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);

  const discountVal = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const netSubtotal = Math.max(0, cartSubtotal - discountVal);
  const remainingForFree = Math.max(0, freeShippingThreshold - netSubtotal);
  const progressPercent = Math.min(100, Math.round((netSubtotal / freeShippingThreshold) * 100));

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCode);
    setIsApplying(false);
    setCouponCode('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#092117] border border-[#D8B56D]/30 flex items-center justify-center text-[#D8B56D]">
          <ShoppingBag className="w-10 h-10 opacity-70" />
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F0E5]">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-[#F5F0E5]/60 max-w-md mx-auto font-light leading-relaxed">
          Discover our sovereign Extrait de Parfum creations, hand-crafted with rare Indian florals and Mysore sandalwood.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="gold-button px-8 py-3.5 text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2"
        >
          Explore Catalogue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-[#F5F0E5]/60 uppercase tracking-widest font-mono">
        <button onClick={() => onNavigate('home')} className="hover:text-[#D8B56D]">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#F1D99B] font-semibold">Shopping Bag</span>
      </nav>

      <div className="border-b border-[#1a3c2c] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Client Bag Review
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F0E5] mt-1">
            Your Selected Flacons ({cart.length})
          </h1>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs uppercase tracking-wider text-[#D8B56D] hover:underline"
        >
          Continue Shopping
        </button>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="p-4 bg-[#092117] border border-[#1a3c2c] text-xs">
        {remainingForFree > 0 ? (
          <div className="space-y-2">
            <p className="text-[#F5F0E5]/80">
              Add <strong className="text-[#F1D99B] font-mono">{formatPrice(remainingForFree)}</strong> more to your order to unlock{' '}
              <strong className="text-[#D8B56D]">Complimentary Insured Express Shipping across India</strong>.
            </p>
            <div className="w-full bg-[#050d09] h-2 border border-[#1a3c2c] overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D8B56D] to-[#F1D99B] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-[#D8B56D] font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-[#D8B56D]" /> Congratulations! You have qualified for Complimentary Insured Express Shipping across India.
          </p>
        )}
      </div>

      {/* Grid: Cart Items on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Items */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const imgUrl = item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';
            const unitPrice = item.variant.sale_price || item.variant.price;

            return (
              <div
                key={item.variant.id}
                className="p-4 sm:p-6 border border-[#1a3c2c] bg-[#092117]/30 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={imgUrl}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover border border-[#D8B56D]/30 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono">
                      {item.product.fragrance_family}
                    </span>
                    <h3 className="font-serif-luxury text-xl text-[#F5F0E5]">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-[#F1D99B] font-mono">
                      {item.variant.size_ml}ml Extrait de Parfum
                    </p>
                    <p className="text-[10px] text-[#F5F0E5]/50 font-mono">
                      SKU: {item.variant.sku}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#1a3c2c]">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#1a3c2c] bg-[#050d09]">
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-[#F5F0E5]/70 hover:text-[#D8B56D]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-xs font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      disabled={item.quantity >= item.variant.stock_quantity}
                      className="px-3 py-1.5 text-[#F5F0E5]/70 hover:text-[#D8B56D] disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-base font-bold text-[#F1D99B] font-mono">
                      {formatPrice(unitPrice * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[10px] text-[#F5F0E5]/50 font-mono">
                        {formatPrice(unitPrice)} each
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.variant.id)}
                    className="text-[#F5F0E5]/40 hover:text-red-400 transition-colors p-2"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Complimentary Gift Packaging Card */}
          <div className="p-4 border border-[#1a3c2c] bg-[#050d09]/60 flex items-start gap-4">
            <Gift className="w-6 h-6 text-[#D8B56D] shrink-0 mt-1" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#F5F0E5]">Complimentary Sovereign Gift Packaging</span>
                <span className="text-[10px] uppercase bg-[#D8B56D]/20 text-[#D8B56D] px-2 py-0.5 font-bold">
                  Free Privilege
                </span>
              </div>
              <p className="text-[#F5F0E5]/70 font-light leading-relaxed">
                Every bottle is prepared in an emerald rigid gift presentation case wrapped in embossed gold foil ribbon with a handwritten fragrance calligraph card.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGiftWrap}
                  onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                  className="accent-[#D8B56D]"
                />
                <span className="text-[11px] text-[#F1D99B]">Confirm gift presentation with personalized envelope</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel-dark border border-[#D8B56D]/30 p-6 space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-4">
              Order Summary
            </h2>

            {/* Privilege Code Section */}
            <div>
              {!appliedCoupon ? (
                <form onSubmit={handleApply} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#D8B56D] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Privilege Code"
                      className="w-full pl-9 pr-3 py-2 bg-[#092117] border border-[#1a3c2c] text-xs text-[#F5F0E5] placeholder-[#F5F0E5]/40 outline-none uppercase font-mono tracking-wider focus:border-[#D8B56D]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying || !couponCode.trim()}
                    className="gold-button-outline px-4 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-3 border border-[#D8B56D]/40 bg-[#D8B56D]/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#D8B56D]" />
                    <span>
                      Code <strong className="text-[#F1D99B] font-mono">{appliedCoupon.code}</strong> applied (-{formatPrice(appliedCoupon.discountAmount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-[#F5F0E5]/60 hover:text-red-400 font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs border-t border-[#1a3c2c] pt-4">
              <div className="flex justify-between text-[#F5F0E5]/80">
                <span>Subtotal ({cart.length} flacons)</span>
                <span className="font-mono">{formatPrice(cartSubtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-[#D8B56D]">
                  <span>Privilege Code Discount</span>
                  <span className="font-mono">-{formatPrice(appliedCoupon.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#F5F0E5]/80">
                <span>Insured Courier Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-[#D8B56D] uppercase font-semibold">Complimentary</span>
                  ) : (
                    <span className="font-mono">{formatPrice(shippingFee)}</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#F5F0E5]/50">
                <span>Goods & Services Tax ({settings.tax_rate_percent || '1'}% inclusive)</span>
                <span className="font-mono">
                  {formatPrice(Math.round((cartTotal * Number(settings.tax_rate_percent || 1)) / (100 + Number(settings.tax_rate_percent || 1))))}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#F1D99B] pt-4 border-t border-[#1a3c2c]">
                <span className="font-serif-luxury text-xl text-[#F5F0E5]">Estimated Total</span>
                <span className="font-mono text-xl">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={onProceedToCheckout}
              className="w-full gold-button py-4 text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <div className="pt-2 border-t border-[#1a3c2c]/60 space-y-2 text-[11px] text-[#F5F0E5]/60 font-light">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D8B56D]" />
                <span>Complies with Cosmetic Rules 2020 & IFRA standards</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D8B56D]" />
                <span>UPI, Card, NetBanking & Cash on Delivery supported</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
