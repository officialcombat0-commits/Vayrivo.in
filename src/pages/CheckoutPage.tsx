import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Check,
  AlertCircle,
  MapPin,
  Lock,
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string, param?: string) => void;
  onOrderSuccess: (orderNumber: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const {
    cart,
    cartSubtotal,
    cartTotal,
    shippingFee,
    appliedCoupon,
    formatPrice,
    clearCart,
    showToast,
    user,
    token,
    settings,
  } = useStore();

  // Form State
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinValidation, setPinValidation] = useState<any>(null);
  const [isValidatingPin, setIsValidatingPin] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'online_razorpay' | 'cod'>('online_razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If user is logged in, try loading default saved address
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            const def = data.addresses.find((a: any) => a.is_default === 1) || data.addresses[0];
            setCustomerName(def.full_name || customerName);
            setCustomerPhone(def.phone || customerPhone);
            setAddressLine1(def.address_line1);
            setAddressLine2(def.address_line2 || '');
            setPincode(def.pincode);
            setCity(def.city);
            setState(def.state);
            validatePinCode(def.pincode);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Validate Indian PIN code
  const validatePinCode = async (pin: string) => {
    if (!/^[1-9][0-9]{5}$/.test(pin.trim())) {
      setPinValidation(null);
      return;
    }
    setIsValidatingPin(true);
    try {
      const res = await fetch('/api/validate-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinValidation(data);
        if (!city) setCity(data.city);
        if (!state) setState(data.state);
        // If COD not available for this pincode, fallback to online
        if (!data.codAvailable && paymentMethod === 'cod') {
          setPaymentMethod('online_razorpay');
        }
      } else {
        setPinValidation(null);
      }
    } catch {
      setPinValidation(null);
    } finally {
      setIsValidatingPin(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      validatePinCode(val);
    } else {
      setPinValidation(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-luxury text-3xl text-[#F5F0E5]">No Flacons In Shopping Bag</h2>
        <p className="text-xs text-[#F5F0E5]/60">Your cart is currently empty. Please select a fragrance to proceed.</p>
        <button onClick={() => onNavigate('shop')} className="gold-button px-6 py-2.5 text-xs uppercase font-semibold">
          Explore Fragrances
        </button>
      </div>
    );
  }

  const isCodAvailable = settings.cod_available !== 'false';
  const configuredCodFee = Number(settings.cod_fee || 50);
  const codFee = (paymentMethod === 'cod' && isCodAvailable) ? configuredCodFee : 0;
  const finalOrderTotal = cartTotal + codFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !city || !state || !pincode) {
      setErrorMessage('Please complete all required contact and shipping details.');
      showToast('All shipping and contact details are required', 'error');
      return;
    }

    if (!pinValidation || !pinValidation.serviceable) {
      setErrorMessage('The entered PIN code is invalid or unserviceable.');
      showToast('Please provide a valid Indian postal PIN code', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          fullName: customerName,
          phone: customerPhone,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
        },
        items: cart.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place order. Please review your details.');
        showToast(data.error || 'Order placement failed', 'error');
        setIsSubmitting(false);
        return;
      }

      // Order successfully created!
      clearCart();
      showToast(`Order ${data.orderNumber} placed successfully!`, 'success');
      onOrderSuccess(data.orderNumber);
    } catch {
      setErrorMessage('Network error while processing your transaction. Please try again.');
      showToast('Order processing network failure', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-[#F5F0E5]/60 uppercase tracking-widest font-mono">
        <button onClick={() => onNavigate('home')} className="hover:text-[#D8B56D]">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('cart')} className="hover:text-[#D8B56D]">Bag</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#F1D99B] font-semibold">Secure Checkout</span>
      </nav>

      <div className="border-b border-[#1a3c2c] pb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-[#D8B56D]" /> 256-Bit Encrypted Client Transaction
        </span>
        <h1 className="font-brand text-3xl sm:text-4xl text-[#F5F0E5] mt-1">
          Finalize Your Order
        </h1>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Client Details, Address & Payment */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact Information */}
            <div className="glass-panel-dark p-6 border border-[#1a3c2c] space-y-4">
              <h2 className="font-serif-luxury text-xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3 flex items-center justify-between">
                <span>1. Client Information</span>
                {user ? (
                  <span className="text-xs text-[#D8B56D] font-mono font-normal">Logged in as {user.email}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('account')}
                    className="text-xs text-[#D8B56D] hover:underline font-mono"
                  >
                    Have an account? Sign In
                  </button>
                )}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#F5F0E5]/70 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sandeep Kumar"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block">Email Address (for Invoice & Updates) *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block">Indian Mobile Number (+91) *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address with PIN Code Validation */}
            <div className="glass-panel-dark p-6 border border-[#1a3c2c] space-y-4">
              <h2 className="font-serif-luxury text-xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3 flex items-center justify-between">
                <span>2. Delivery Consignment Details</span>
                <span className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono">India Only</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#F5F0E5]/70 block">Address Line 1 (Flat, House No., Building, Street) *</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. Penthouse 18B, The Heritage Towers"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#F5F0E5]/70 block">Address Line 2 (Colony, Landmark, Area)</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Near Royal Yacht Club, Colaba"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block flex items-center justify-between">
                    <span>Postal PIN Code *</span>
                    {isValidatingPin && <span className="text-[10px] text-[#D8B56D] font-mono">Verifying...</span>}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit Indian PIN (e.g. 400001)"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono tracking-wider outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai / Delhi / Bengaluru"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#F5F0E5]/70 block">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra / Karnataka / Delhi NCR"
                    className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>
              </div>

              {/* Real-time PIN code feedback card */}
              {pinValidation && (
                <div className="p-3 bg-[#092117] border border-[#D8B56D]/40 text-xs space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-[#F1D99B] font-semibold">
                    <Check className="w-4 h-4 text-[#D8B56D]" /> Serviceable Destination ({pinValidation.city}, {pinValidation.state})
                  </div>
                  <div className="text-[11px] text-[#F5F0E5]/70">
                    Estimated Transit Time: <strong>{pinValidation.estimatedDays} - {pinValidation.estimatedDays + 2} Business Days</strong> via Blue Dart / Delhivery Express.
                  </div>
                </div>
              )}
            </div>

            {/* 3. Payment Method Selection */}
            <div className="glass-panel-dark p-6 border border-[#1a3c2c] space-y-4">
              <h2 className="font-serif-luxury text-xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3">
                3. Payment Privilege Selection
              </h2>

              <div className="space-y-3">
                {/* Online Payment via Razorpay */}
                <label
                  className={`p-4 border block cursor-pointer transition-all ${
                    paymentMethod === 'online_razorpay'
                      ? 'border-[#D8B56D] bg-[#D8B56D]/15 text-[#F1D99B]'
                      : 'border-[#1a3c2c] bg-[#050d09]/60 text-[#F5F0E5]/80 hover:border-[#D8B56D]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online_razorpay"
                        checked={paymentMethod === 'online_razorpay'}
                        onChange={() => setPaymentMethod('online_razorpay')}
                        className="accent-[#D8B56D]"
                      />
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#D8B56D]" /> Online Payment (Razorpay 256-Bit SSL)
                        </div>
                        <div className="text-[11px] text-[#F5F0E5]/60 mt-0.5">
                          UPI (Google Pay, PhonePe, Paytm), All Credit & Debit Cards, NetBanking.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 font-mono">
                      Recommended
                    </span>
                  </div>
                </label>

                {/* Cash on Delivery */}
                {isCodAvailable && (
                  <label
                    className={`p-4 border block cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#D8B56D] bg-[#D8B56D]/15 text-[#F1D99B]'
                        : 'border-[#1a3c2c] bg-[#050d09]/60 text-[#F5F0E5]/80 hover:border-[#D8B56D]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-[#D8B56D]"
                        />
                        <div>
                          <div className="text-sm font-semibold flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-[#D8B56D]" /> Cash on Delivery (COD)
                          </div>
                          <div className="text-[11px] text-[#F5F0E5]/60 mt-0.5">
                            Pay upon delivery in cash or UPI. {configuredCodFee > 0 ? `Includes ₹${configuredCodFee} cash handling surcharge.` : 'No additional surcharge.'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-[#F1D99B]">
                        {configuredCodFee > 0 ? `+₹${configuredCodFee}` : 'Free'}
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Snapshot & Confirmation Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel-dark border border-[#D8B56D]/30 p-6 space-y-6 sticky top-24">
              <h2 className="font-serif-luxury text-2xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3">
                Order Review
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const imgUrl = item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80';
                  const unitPrice = item.variant.sale_price || item.variant.price;

                  return (
                    <div key={item.variant.id} className="flex items-center gap-3 text-xs py-1">
                      <img src={imgUrl} alt="" className="w-12 h-14 object-cover border border-[#D8B56D]/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#F5F0E5] truncate">{item.product.name}</div>
                        <div className="text-[10px] text-[#D8B56D] font-mono">{item.variant.size_ml}ml • Qty: {item.quantity}</div>
                      </div>
                      <div className="font-mono text-right text-[#F1D99B]">
                        {formatPrice(unitPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 text-xs border-t border-[#1a3c2c] pt-4">
                <div className="flex justify-between text-[#F5F0E5]/80">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatPrice(cartSubtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#D8B56D]">
                    <span>Privilege Code ({appliedCoupon.code}):</span>
                    <span className="font-mono">-{formatPrice(appliedCoupon.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#F5F0E5]/80">
                  <span>Insured Courier:</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#D8B56D] uppercase">Complimentary</strong> : formatPrice(shippingFee)}</span>
                </div>

                {paymentMethod === 'cod' && codFee > 0 && (
                  <div className="flex justify-between text-[#F5F0E5]/80">
                    <span>Cash on Delivery Handling:</span>
                    <span className="font-mono">{formatPrice(codFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-[#F5F0E5]/50">
                  <span>Goods & Services Tax ({settings.tax_rate_percent || '1'}% inclusive):</span>
                  <span className="font-mono">
                    {formatPrice(Math.round((finalOrderTotal * Number(settings.tax_rate_percent || 1)) / (100 + Number(settings.tax_rate_percent || 1))))}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#F1D99B] pt-3 border-t border-[#1a3c2c]">
                  <span className="font-serif-luxury text-xl text-[#F5F0E5]">Total Payable:</span>
                  <span className="font-mono text-xl">{formatPrice(finalOrderTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gold-button py-4 text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Confirm & Authorize Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[10px] text-[#F5F0E5]/40 text-center font-light leading-relaxed">
                By clicking Confirm, you authorize VAYRIVO Haute Parfumerie to process your order under our Terms of Sale and Indian Consumer Protection Regulations.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
