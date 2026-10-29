import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import { FragrancePyramid } from '../components/FragrancePyramid';
import { ProductCard } from '../components/ProductCard';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Clock,
  Gift,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  MapPin
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (slug: string) => void;
  onBuyNow: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigate,
  onSelectProduct,
  onBuyNow,
}) => {
  const { products, addToCart, toggleWishlist, isInWishlist, formatPrice, showToast } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // PIN code checker state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pinResult, setPinResult] = useState<any>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // Accordion open tabs
  const [activeTab, setActiveTab] = useState<'description' | 'ritual' | 'packaging' | 'compliance'>('description');

  useEffect(() => {
    const found = products.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setProduct(found);
      const initialVariant = found.variants?.[0] || null;
      setSelectedVariant(initialVariant);
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [slug, products]);

  if (!product || !selectedVariant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif-luxury text-3xl text-[#F5F0E5]">Fragrance Profile Loading...</h2>
        <p className="text-xs text-[#F5F0E5]/60">Selecting the bespoke flacon from our vault.</p>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const currentPrice = selectedVariant.sale_price || selectedVariant.price;
  const isSale = !!selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.price;
  const isOutOfStock = selectedVariant.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && selectedVariant.stock_quantity <= selectedVariant.low_stock_threshold;

  const images = product.images?.length > 0
    ? product.images
    : [{ id: '1', product_id: product.id, image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80', is_primary: 1, display_order: 1 }];

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincodeInput.trim())) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'error');
      return;
    }
    setCheckingPin(true);
    try {
      const res = await fetch('/api/validate-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pincodeInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinResult(data);
      } else {
        showToast(data.error || 'PIN code verification failed', 'error');
      }
    } catch {
      showToast('Error validating PIN code', 'error');
    } finally {
      setCheckingPin(false);
    }
  };

  const handleInstantBuy = () => {
    addToCart(product, selectedVariant, quantity);
    onBuyNow();
  };

  // Other recommendations
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-[#F5F0E5]/60 uppercase tracking-widest font-mono">
        <button onClick={() => onNavigate('home')} className="hover:text-[#D8B56D]">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('shop')} className="hover:text-[#D8B56D]">Catalogue</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#F1D99B] font-semibold">{product.name}</span>
      </nav>

      {/* Main Flacon Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Multi-Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="border border-[#1a3c2c] bg-[#050d09] aspect-4/5 overflow-hidden relative group">
            <img
              src={images[activeImageIndex]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Concentration watermark */}
            <div className="absolute top-4 left-4 bg-[#092117]/85 border border-[#D8B56D]/30 px-3 py-1 text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono">
              {product.concentration}
            </div>
            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#050d09]/80 border border-[#D8B56D]/40 flex items-center justify-center text-[#F5F0E5] hover:text-[#D8B56D] hover:border-[#D8B56D] transition-all"
              aria-label="Save to wishlist"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-[#D8B56D] text-[#D8B56D]' : ''}`} />
            </button>
          </div>

          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 shrink-0 border overflow-hidden transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#D8B56D] shadow-lg scale-102'
                      : 'border-[#1a3c2c] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Olfactory Details & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
                {product.fragrance_family}
              </span>
              <span className="text-[#F5F0E5]/40">•</span>
              <span className="text-xs uppercase tracking-widest text-[#F5F0E5]/60 font-mono">
                {product.gender}
              </span>
            </div>

            <h1 className="font-brand text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F0E5] tracking-wide">
              {product.name}
            </h1>

            {product.tag_line && (
              <p className="font-serif italic text-base sm:text-lg text-[#F1D99B]/90 font-light">
                &quot;{product.tag_line}&quot;
              </p>
            )}
          </div>

          {/* Price Display */}
          <div className="p-4 border border-[#1a3c2c] bg-[#092117]/40 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#F1D99B] font-mono">
                  {formatPrice(currentPrice)}
                </span>
                {isSale && (
                  <span className="text-sm text-[#F5F0E5]/40 line-through font-mono">
                    {formatPrice(selectedVariant.price)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#F5F0E5]/50 block mt-0.5">
                Inclusive of all Indian taxes (18% GST). Standard Insured Courier included above ₹2,500.
              </span>
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <span className="px-3 py-1 bg-red-950/60 border border-red-500/40 text-red-300 text-xs uppercase font-mono font-bold">
                  Sold Out
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs uppercase font-mono">
                  Only {selectedVariant.stock_quantity} Left in Vault
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs uppercase font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </span>
              )}
            </div>
          </div>

          {/* Flacon Bottle Size Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#D8B56D] font-mono block">
              Select Flacon Volume:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`p-3 text-left border transition-all ${
                    selectedVariant.id === v.id
                      ? 'border-[#D8B56D] bg-[#D8B56D]/15 text-[#F1D99B] shadow-md'
                      : 'border-[#1a3c2c] bg-[#050d09]/60 text-[#F5F0E5]/70 hover:border-[#D8B56D]/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-serif-luxury text-lg font-bold">{v.size_ml}ml Flacon</span>
                    <span className="font-mono text-xs">{formatPrice(v.sale_price || v.price)}</span>
                  </div>
                  <div className="text-[10px] text-[#F5F0E5]/50 mt-1 uppercase font-mono">
                    SKU: {v.sku} • {v.stock_quantity > 0 ? `${v.stock_quantity} available` : 'Sold Out'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest text-[#F5F0E5]/60 font-mono">Qty:</span>
              <div className="flex items-center border border-[#1a3c2c] bg-[#050d09]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-[#F5F0E5]/70 hover:text-[#D8B56D]"
                >
                  -
                </button>
                <span className="px-4 py-2 font-mono text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))}
                  disabled={quantity >= selectedVariant.stock_quantity}
                  className="px-3 py-2 text-[#F5F0E5]/70 hover:text-[#D8B56D] disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-[#F5F0E5]/50 font-light">
                Max {selectedVariant.stock_quantity} units per patron
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => addToCart(product, selectedVariant, quantity)}
                disabled={isOutOfStock}
                className="gold-button py-3.5 text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl disabled:opacity-30"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>

              <button
                onClick={handleInstantBuy}
                disabled={isOutOfStock}
                className="gold-button-outline py-3.5 text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-30"
              >
                Instant Buy Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Indian PIN code delivery checker */}
          <div className="p-4 border border-[#1a3c2c] bg-[#050d09]/70 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D8B56D] font-mono">
              <MapPin className="w-4 h-4 text-[#D8B56D]" /> Check Delivery & COD in India
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN (e.g. 400001, 560001)"
                className="flex-1 px-3 py-2 bg-[#092117] border border-[#1a3c2c] text-xs text-[#F5F0E5] font-mono tracking-wider outline-none focus:border-[#D8B56D]"
              />
              <button
                type="submit"
                disabled={checkingPin || pincodeInput.length !== 6}
                className="px-4 py-2 border border-[#D8B56D] text-xs font-semibold uppercase text-[#D8B56D] hover:bg-[#D8B56D]/15 disabled:opacity-40"
              >
                {checkingPin ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pinResult && (
              <div className="p-3 bg-[#092117] border border-[#1a3c2c] text-xs space-y-1 animate-fade-in">
                <div className="flex items-center justify-between text-[#F1D99B] font-semibold">
                  <span>Serviceable: {pinResult.city}, {pinResult.state}</span>
                  <span className="font-mono text-emerald-400">Verified</span>
                </div>
                <div className="text-[#F5F0E5]/70 text-[11px]">
                  Estimated Dispatch & Delivery: <strong>{pinResult.estimatedDays} - {pinResult.estimatedDays + 2} Business Days</strong>
                </div>
                <div className="text-[11px] text-[#D8B56D]">
                  {pinResult.codAvailable ? '✓ Cash on Delivery (COD) Available' : '✗ Online Payment Only for this zone'}
                </div>
              </div>
            )}
          </div>

          {/* Luxury Perks Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#F5F0E5]/70 font-light">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D8B56D] shrink-0" />
              <span>100% Authentic Extrait Flacon</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D8B56D] shrink-0" />
              <span>Discreet Insured Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#D8B56D] shrink-0" />
              <span>Complimentary Emerald Gift Box</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D8B56D] shrink-0" />
              <span>14+ Hours Skin Longevity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fragrance Pyramid Section */}
      <section className="pt-8">
        <FragrancePyramid
          topNotes={product.top_notes}
          heartNotes={product.heart_notes}
          baseNotes={product.base_notes}
          longevity={product.longevity}
          sillage={product.sillage}
        />
      </section>

      {/* Detailed Accordion Tabs */}
      <section className="border border-[#1a3c2c] bg-[#092117]/30">
        <div className="flex border-b border-[#1a3c2c] overflow-x-auto">
          {[
            { id: 'description', label: 'The Inspiration' },
            { id: 'ritual', label: 'Application Ritual' },
            { id: 'packaging', label: 'Haute Packaging' },
            { id: 'compliance', label: 'Safety & Regulations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-xs uppercase tracking-widest font-mono shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#D8B56D] text-[#F1D99B] bg-[#050d09]/50 font-bold'
                  : 'text-[#F5F0E5]/60 hover:text-[#D8B56D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 text-xs sm:text-sm text-[#F5F0E5]/80 font-light leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl">
              <p className="font-serif-luxury text-xl text-[#F5F0E5]">
                {product.name} — Crafted for those who understand scent as aura.
              </p>
              <p>{product.description}</p>
              <p>
                Each batch is matured in custom amber glassware for 56 days under controlled temperatures, allowing natural essential oils to harmonize before being individually bottled in our Mumbai atelier.
              </p>
            </div>
          )}

          {activeTab === 'ritual' && (
            <div className="space-y-3 max-w-3xl">
              <h4 className="font-serif-luxury text-lg text-[#F1D99B]">The Haute Parfumerie Ritual:</h4>
              <ul className="list-disc list-inside space-y-2 text-[#F5F0E5]/75">
                <li>Because of the intense 30% Extrait concentration, 1-2 atomized sprays are sufficient for a full day of projection.</li>
                <li>Apply to warm pulse points: the nape of the neck, collarbones, and inner wrists.</li>
                <li>Never rub your wrists together after spraying, as friction crushes the delicate top molecules.</li>
                <li>Mist lightly over cashmere, silk lapels, or fine fabrics for an extraordinary multi-day presence.</li>
              </ul>
            </div>
          )}

          {activeTab === 'packaging' && (
            <div className="space-y-3 max-w-3xl">
              <h4 className="font-serif-luxury text-lg text-[#F1D99B]">Bespoke Presentation:</h4>
              <p>
                Your flacon arrives encased in our signature heavy-gauge emerald green rigid drawer box, lined with velvet foam cushioning.
              </p>
              <p>
                The bottle cap is forged from high-density zamak alloy, precision engraved with the VAYRIVO sovereign crest and finished with brushed antique gold plating.
              </p>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-3 max-w-3xl">
              <h4 className="font-serif-luxury text-lg text-[#F1D99B]">Regulatory Standards & Safety:</h4>
              <p>
                Manufactured in compliance with the Drugs and Cosmetics Act & Indian Cosmetics Rules 2020.
              </p>
              <p>
                IFRA (International Fragrance Association) 51st Amendment compliant. 100% phthalate-free, paraben-free, cruelty-free, and vegan-friendly certified natural absolutes.
              </p>
              <p className="text-[11px] font-mono text-[#D8B56D]">
                Marketed by: VAYRIVO Luxury Parfumerie Pvt Ltd, Colaba, Mumbai 400001, Maharashtra.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Complementary Creations */}
      <section className="space-y-8 pt-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Olfactory Pairings
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
            Complementary Fragrance Creations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {related.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
