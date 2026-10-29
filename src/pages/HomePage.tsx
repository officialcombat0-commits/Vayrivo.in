import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, ArrowRight, ShieldCheck, Droplet, Award, Compass, HeartHandshake, Star } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { products, formatPrice } = useStore();
  const [selectedFamily, setSelectedFamily] = useState('all');

  const featuredProducts = products.filter((p) => p.is_featured === 1);
  const bestsellers = products.filter((p) => p.is_bestseller === 1);

  // Olfactory family filter
  const filteredProducts = selectedFamily === 'all'
    ? products
    : products.filter((p) => p.fragrance_family.toLowerCase().includes(selectedFamily.toLowerCase()));

  // Hero showcase fragrance (Noir Crown)
  const heroProduct = products.find((p) => p.slug === 'noir-crown') || products[0];

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[#D8B56D]/20 bg-gradient-to-b from-[#050d09] via-[#092117] to-[#050d09]">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D8B56D]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Brand Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 border border-[#D8B56D]/40 bg-[#092117]/80 text-[#D8B56D] text-[10px] uppercase tracking-[0.25em] font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Extrait de Parfum • 30% Pure Concentration
            </div>

            <h1 className="font-brand text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-[#F5F0E5] leading-[1.08]">
              Your Scent.<br />
              <span className="gold-gradient-text font-serif italic font-normal">Your Signature.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#F5F0E5]/80 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
              VAYRIVO synthesizes the sacred olfactory treasures of the Indian subcontinent—pure Mysore sandalwood, Kashmir saffron, and Kannauj damascena—with the timeless French extraction alchemy of Grasse.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-auto gold-button px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2"
              >
                Explore The Haute Collection <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="w-full sm:w-auto gold-button-outline px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em]"
              >
                Our Botanical Story
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-8 border-t border-[#1a3c2c]/60 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="font-mono text-xs font-bold text-[#F1D99B]">14+ Hours</div>
                <div className="text-[10px] text-[#F5F0E5]/50 tracking-wider uppercase mt-0.5">Enduring Longevity</div>
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-[#F1D99B]">100% IFRA</div>
                <div className="text-[10px] text-[#F5F0E5]/50 tracking-wider uppercase mt-0.5">Natural Absolutes</div>
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-[#F1D99B]">Complimentary</div>
                <div className="text-[10px] text-[#F5F0E5]/50 tracking-wider uppercase mt-0.5">Miniature with 100ml</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Flacon Showcase */}
          {heroProduct && (
            <div className="lg:col-span-5 flex flex-col items-center">
              <div
                onClick={() => onSelectProduct(heroProduct.slug)}
                className="relative group cursor-pointer w-full max-w-sm border border-[#D8B56D]/30 bg-[#092117]/50 p-6 backdrop-blur-md shadow-2xl hover:border-[#D8B56D]/70 transition-all duration-500"
              >
                {/* Glowing Crown Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D8B56D] text-[#050d09] px-4 py-0.5 text-[10px] uppercase font-bold tracking-widest shadow-lg">
                  Masterpiece Creation
                </div>

                <div className="aspect-4/5 overflow-hidden mb-5 bg-[#050d09]">
                  <img
                    src={heroProduct.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'}
                    alt={heroProduct.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="text-center space-y-1.5">
                  <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono">
                    {heroProduct.fragrance_family} • Extrait de Parfum
                  </div>
                  <h3 className="font-serif-luxury text-2xl text-[#F5F0E5] group-hover:text-[#F1D99B] transition-colors">
                    {heroProduct.name}
                  </h3>
                  <p className="text-xs text-[#F5F0E5]/60 font-light italic">
                    &quot;{heroProduct.tag_line}&quot;
                  </p>
                  <div className="pt-2 text-sm font-semibold text-[#F1D99B]">
                    From {formatPrice(heroProduct.minPrice)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. THREE PILLARS OF HAUTE PARFUMERIE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/30 space-y-4 hover:border-[#D8B56D]/40 transition-colors">
            <div className="w-12 h-12 rounded-none border border-[#D8B56D]/40 bg-[#050d09] flex items-center justify-center text-[#D8B56D]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl text-[#F5F0E5]">Venerable Indian Botanicals</h3>
            <p className="text-xs text-[#F5F0E5]/70 font-light leading-relaxed">
              We ethically source authentic aged Santalum album from Karnataka, rare hand-plucked saffron threads from Pampore, Kashmir, and hydro-distilled hydro-essences from historic Kannauj.
            </p>
          </div>

          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/30 space-y-4 hover:border-[#D8B56D]/40 transition-colors">
            <div className="w-12 h-12 rounded-none border border-[#D8B56D]/40 bg-[#050d09] flex items-center justify-center text-[#D8B56D]">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl text-[#F5F0E5]">Grasse Maceration Tradition</h3>
            <p className="text-xs text-[#F5F0E5]/70 font-light leading-relaxed">
              Every formula undergoes eight weeks of cold-temperature maturation and maceration in dark glass demijohns, unlocking crystalline depth, smooth transitions, and hypnotic sillage.
            </p>
          </div>

          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/30 space-y-4 hover:border-[#D8B56D]/40 transition-colors">
            <div className="w-12 h-12 rounded-none border border-[#D8B56D]/40 bg-[#050d09] flex items-center justify-center text-[#D8B56D]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-xl text-[#F5F0E5]">Extrait de Parfum Longevity</h3>
            <p className="text-xs text-[#F5F0E5]/70 font-light leading-relaxed">
              Formulated with 28% to 32% aromatic oil concentration—the highest grade in Haute Parfumerie. One single spray lingers softly for 14 hours on skin and days on fine textiles.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED FRAGRANCES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1a3c2c] pb-6">
          <div className="text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
              The Sovereign Collection
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F0E5] mt-1">
              Featured Haute Flacons
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="gold-button-outline px-6 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
          >
            View All Fragrances <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 4. OLFACTORY FAMILY FILTER & EXPLORATION */}
      <section className="bg-[#092117]/40 border-y border-[#D8B56D]/15 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
              The Olfactory Library
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F0E5]">
              Select By Scent Family
            </h2>
            <p className="text-xs text-[#F5F0E5]/70 font-light leading-relaxed">
              Every persona possesses a signature olfactory harmony. Filter through our botanical genres to find your intimate resonant scent.
            </p>
          </div>

          {/* Family Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: 'all', label: 'All Families' },
              { id: 'woody', label: 'Woody & Smoky' },
              { id: 'floral', label: 'Haute Floral' },
              { id: 'oriental', label: 'Amber & Oriental' },
              { id: 'fresh', label: 'Fresh & Aromatic' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFamily(f.id)}
                className={`px-5 py-2 text-xs uppercase tracking-wider transition-all ${
                  selectedFamily === f.id
                    ? 'border border-[#D8B56D] bg-[#D8B56D] text-[#050d09] font-bold shadow-md'
                    : 'border border-[#1a3c2c] bg-[#050d09]/60 text-[#F5F0E5]/70 hover:border-[#D8B56D]/50 hover:text-[#D8B56D]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE BRAND PHILOSOPHY / THE STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="border border-[#D8B56D]/30 p-2 bg-[#092117]/60">
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85"
                alt="VAYRIVO Perfumer Botanical Distillation"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:block p-6 glass-panel-dark border border-[#D8B56D]/40 max-w-xs shadow-2xl">
              <div className="font-serif-luxury text-lg text-[#F1D99B] italic">
                &quot;A perfume is an invisible crown worn by those who command their destiny.&quot;
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono mt-2">
                — Master Perfumer, VAYRIVO
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
              The Heritage of Haute Parfumerie
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F0E5] leading-tight">
              Honoring India&apos;s Royal Fragrance Legacy with French Rigor
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#F5F0E5]/75 font-light leading-relaxed">
              <p>
                For centuries, the royal courts of India were perfumed with attars distilled from steam, copper deg-bapka kettles, and precious woods. VAYRIVO was born to preserve these endangered botanical treasures while adapting them for the global connoisseur.
              </p>
              <p>
                Each flacon is cast from heavyweight French crystalline glass, capped with a hand-polished zamak sovereign stopper, and delivered in an emerald presentation case wrapped in golden silk.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-6">
              <button
                onClick={() => onNavigate('about')}
                className="gold-button px-6 py-3 text-xs font-semibold uppercase tracking-widest flex items-center gap-2"
              >
                Read Full Story <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="text-xs uppercase tracking-widest text-[#D8B56D] hover:underline underline-offset-4"
              >
                Book Private Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONCIERGE & GIFTING CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 border border-[#D8B56D]/30 bg-gradient-to-r from-[#092117] to-[#050d09] text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
              Complimentary Client Privilege
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F0E5]">
              Corporate & Wedding Gifting Concierge
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F0E5]/70 font-light leading-relaxed">
              Looking for bespoke flacons engraved with personal initials or curated discovery sets for royal weddings and milestone celebrations? Our private fragrance concierges curate extraordinary olfactory presentations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('contact')}
              className="gold-button px-8 py-3 text-xs font-semibold uppercase tracking-widest"
            >
              Contact Concierge
            </button>
            <button
              onClick={() => onNavigate('faq')}
              className="gold-button-outline px-8 py-3 text-xs font-semibold uppercase tracking-widest"
            >
              Shipping & Gifting FAQ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
