import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Gift, Tag, Check } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onViewShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout, onViewShop }) => {
  const {
    isCartOpen,
    setIsCartOpen,
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

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);

  if (!isCartOpen) return null;

  // Free shipping progress calculation
  const discountVal = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const netSubtotal = Math.max(0, cartSubtotal - discountVal);
  const progressPercent = Math.min(100, Math.round((netSubtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - netSubtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput);
    setIsApplying(false);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#092117] border-l border-[#D8B56D]/30 shadow-2xl flex flex-col text-[#F5F0E5]">
          {/* Header */}
          <div className="p-5 border-b border-[#1a3c2c] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#D8B56D]" />
              <h2 className="font-serif-luxury text-xl tracking-wide text-[#F5F0E5]">
                Your Shopping Flacon Bag
              </h2>
              <span className="text-xs bg-[#D8B56D]/20 text-[#D8B56D] px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#F5F0E5]/60 hover:text-[#D8B56D] hover:bg-[#050d09]/40 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-4 bg-[#050d09]/80 border-b border-[#1a3c2c] text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#F5F0E5]/80 mb-2">
                Add <span className="text-[#D8B56D] font-semibold">{formatPrice(remainingForFreeShipping)}</span> more for <span className="text-[#F1D99B]">Complimentary Insured Shipping</span> across India.
              </p>
            ) : (
              <p className="text-[#D8B56D] font-medium flex items-center gap-1.5 mb-2">
                <Check className="w-4 h-4 text-[#D8B56D]" /> You have unlocked Complimentary Express Delivery!
              </p>
            )}
            <div className="w-full bg-[#1a3c2c] h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D8B56D] to-[#F1D99B] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#050d09] border border-[#D8B56D]/30 flex items-center justify-center text-[#D8B56D]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif-luxury text-xl text-[#F5F0E5]">Your Bag is Empty</h3>
                <p className="text-sm text-[#F5F0E5]/60 max-w-xs mx-auto font-light leading-relaxed">
                  Explore our Haute Parfumerie collection and find your distinctive olfactory signature.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onViewShop();
                  }}
                  className="gold-button px-6 py-2.5 text-xs font-semibold uppercase tracking-wider inline-block mt-2"
                >
                  Explore Fragrances
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const imgUrl = item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80';
                const unitPrice = item.variant.sale_price || item.variant.price;

                return (
                  <div
                    key={item.variant.id}
                    className="p-3 border border-[#1a3c2c] bg-[#050d09]/40 flex gap-4 relative group"
                  >
                    <img
                      src={imgUrl}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover border border-[#D8B56D]/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif-luxury text-base text-[#F5F0E5] truncate pr-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.variant.id)}
                            className="text-[#F5F0E5]/40 hover:text-red-400 transition-colors p-1"
                            title="Remove flacon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#D8B56D] font-medium tracking-wide">
                          {item.variant.size_ml}ml Extrait de Parfum
                        </p>
                        <p className="text-xs text-[#F5F0E5]/50 font-light mt-0.5">
                          SKU: {item.variant.sku}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1a3c2c]/50">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#1a3c2c] bg-[#092117]">
                          <button
                            onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                            className="px-2 py-1 text-[#F5F0E5]/70 hover:text-[#D8B56D] hover:bg-[#050d09]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-1 text-xs font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock_quantity}
                            className="px-2 py-1 text-[#F5F0E5]/70 hover:text-[#D8B56D] hover:bg-[#050d09] disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[#F1D99B]">
                            {formatPrice(unitPrice * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-[#F5F0E5]/40">
                              {formatPrice(unitPrice)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Complimentary Gift Wrapping option */}
            {cart.length > 0 && (
              <div className="p-3 border border-[#1a3c2c] bg-[#050d09]/50 flex items-start gap-3">
                <Gift className="w-5 h-5 text-[#D8B56D] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#F5F0E5]">Haute Gift Presentation</span>
                    <span className="text-[10px] uppercase bg-[#D8B56D]/20 text-[#D8B56D] px-1.5 py-0.5 tracking-wider font-semibold">
                      Complimentary
                    </span>
                  </div>
                  <p className="text-[#F5F0E5]/60 mt-0.5 font-light">
                    Hand-tied emerald box, embossed gold seal, and personalized fragrance card.
                  </p>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGiftWrap}
                      onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                      className="accent-[#D8B56D]"
                    />
                    <span className="text-[11px] text-[#F1D99B]">Include Gift Packaging</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#1a3c2c] bg-[#050d09]/95 space-y-4">
              {/* Promo Code Box */}
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#D8B56D] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Privilege Code (e.g. VAYRIVO10)"
                      className="w-full pl-9 pr-3 py-2 bg-[#092117] border border-[#1a3c2c] text-xs text-[#F5F0E5] placeholder-[#F5F0E5]/40 outline-none uppercase font-mono tracking-wider focus:border-[#D8B56D]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="gold-button-outline px-4 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2.5 border border-[#D8B56D]/40 bg-[#D8B56D]/10 text-xs">
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

              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#F5F0E5]/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#D8B56D]">
                    <span>Privilege Discount</span>
                    <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#F5F0E5]/70">
                  <span>Insured Shipping Across India</span>
                  <span>{shippingFee === 0 ? <span className="text-[#D8B56D] uppercase font-medium">Free</span> : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#F5F0E5] pt-2 border-t border-[#1a3c2c]">
                  <span className="font-serif-luxury text-base">Estimated Total</span>
                  <span className="text-[#F1D99B] font-mono text-base">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-[10px] text-[#F5F0E5]/40 text-center font-light">
                  Inclusive of all Indian taxes ({settings.tax_rate_percent || '1'}% GST). Certified authenticity guaranteed.
                </p>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full gold-button py-3 text-xs font-semibold flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg"
              >
                Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
