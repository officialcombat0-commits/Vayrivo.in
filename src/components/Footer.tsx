import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Mail, ShieldCheck, MapPin, Phone, ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer_newsletter' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        showToast('Welcome to the VAYRIVO Circle. Promo code: FIRSTSCENT', 'success');
      }
    } catch {
      showToast('Subscription failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#050d09] border-t border-[#D8B56D]/20 text-[#F5F0E5] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-14">
        {/* Top Newsletter & Privilege Section */}
        <div className="p-8 border border-[#1a3c2c] bg-[#092117]/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D8B56D]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-center lg:text-left space-y-2 max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center justify-center lg:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> The VAYRIVO Inner Circle
              </span>
              <h3 className="font-serif-luxury text-2xl md:text-3xl text-[#F5F0E5]">
                Receive Private Previews & ₹500 Privilege Voucher
              </h3>
              <p className="text-xs text-[#F5F0E5]/70 font-light leading-relaxed">
                Subscribe to our discreet salon dispatches for private harvest announcements, limited edition flacon launches, and complimentary olfactory samples.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#D8B56D] absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your private email..."
                      className="w-full pl-9 pr-4 py-2.5 bg-[#050d09] border border-[#1a3c2c] text-xs text-[#F5F0E5] placeholder-[#F5F0E5]/40 outline-none focus:border-[#D8B56D] tracking-wide"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="gold-button px-6 py-2.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    Join Salon <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-[#D8B56D]/15 border border-[#D8B56D] flex items-center gap-3 text-xs">
                  <Check className="w-4 h-4 text-[#D8B56D] shrink-0" />
                  <div>
                    <span className="text-[#F1D99B] font-semibold">Welcome to the Inner Circle.</span> Use code{' '}
                    <strong className="font-mono text-white bg-black/40 px-1 py-0.5">FIRSTSCENT</strong> for ₹500 off your inaugural order.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs">
          {/* Brand Signature */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col items-start cursor-pointer" onClick={() => onNavigate('home')}>
              <span className="font-brand text-2xl font-bold tracking-[0.25em] text-[#F1D99B]">
                VAYRIVO
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#D8B56D] font-medium mt-0.5">
                Your Scent. Your Signature.
              </span>
            </div>
            <p className="text-xs text-[#F5F0E5]/70 font-light leading-relaxed max-w-sm">
              Haute Parfumerie born from venerable Indian botanicals — pure Mysore sandalwood, saffron strands, and Kannauj roses — distilled with legendary Grasse extraction artistry.
            </p>
            <div className="pt-2 text-[11px] text-[#F5F0E5]/60 space-y-1.5 font-light">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D8B56D] shrink-0" />
                <span>{settings.boutique_address || 'The Heritage Galleria, Colaba, Mumbai 400001'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D8B56D] shrink-0" />
                <span>Concierge: {settings.support_phone || '+91 98200 12345'} (10 AM - 8 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Column 1: Olfactory Families */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#D8B56D] font-mono font-bold">
              Olfactory Families
            </h4>
            <ul className="space-y-2 text-[#F5F0E5]/70 font-light">
              <li>
                <button onClick={() => onNavigate('shop', 'woody')} className="hover:text-[#F1D99B] transition-colors">
                  Woody & Smoky Extraits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'floral')} className="hover:text-[#F1D99B] transition-colors">
                  Haute Damascena Florals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'oriental')} className="hover:text-[#F1D99B] transition-colors">
                  Imperial Amber & Ouds
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'fresh')} className="hover:text-[#F1D99B] transition-colors">
                  Aromatic & Fresh Vetivers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-[#F1D99B] transition-colors">
                  View Full Flacon Catalog
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Client Concierge */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#D8B56D] font-mono font-bold">
              Client Concierge
            </h4>
            <ul className="space-y-2 text-[#F5F0E5]/70 font-light">
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-[#F1D99B] transition-colors">
                  Client Profile & Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account', 'track')} className="hover:text-[#F1D99B] transition-colors">
                  Track Consignment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#F1D99B] transition-colors">
                  Bespoke Consultation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#F1D99B] transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#F1D99B] transition-colors">
                  Fragrance Philosophy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Standards */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#D8B56D] font-mono font-bold">
              Legal & Disclosures
            </h4>
            <ul className="space-y-2 text-[#F5F0E5]/70 font-light">
              <li>
                <button onClick={() => onNavigate('policies', 'privacy')} className="hover:text-[#F1D99B] transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies', 'terms')} className="hover:text-[#F1D99B] transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies', 'shipping')} className="hover:text-[#F1D99B] transition-colors">
                  Shipping & Delivery Terms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies', 'returns')} className="hover:text-[#F1D99B] transition-colors">
                  Returns & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-[#D8B56D]/80 hover:text-[#F1D99B] font-mono transition-colors">
                  Admin Management
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Payment Trust Badges */}
        <div className="pt-8 border-t border-[#1a3c2c] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#F5F0E5]/50 font-light">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="flex items-center gap-1 text-[#D8B56D]">
              <ShieldCheck className="w-3.5 h-3.5" /> Cosmetic Rules 2020 Compliant
            </span>
            <span>•</span>
            <span>GSTIN: 27AABCU9603R1ZM</span>
            <span>•</span>
            <span>HSN Code: 33030010</span>
            <span>•</span>
            <span>Razorpay 256-Bit SSL Secured</span>
          </div>

          <div className="text-center md:text-right font-mono text-[10px]">
            Currencies: INR (₹) • Powered by VAYRIVO Haute Parfumerie
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[10px] text-[#F5F0E5]/40 font-light tracking-wider">
          © {new Date().getFullYear()} VAYRIVO Luxury Parfumerie Private Limited. All rights reserved. Your Scent. Your Signature.
        </div>
      </div>
    </footer>
  );
};
