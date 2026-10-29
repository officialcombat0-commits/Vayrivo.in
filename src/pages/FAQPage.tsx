import React, { useState } from 'react';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the concentration of VAYRIVO fragrances?',
      a: 'All VAYRIVO fragrances are formulated at pure Extrait de Parfum concentration (28% to 32% aromatic compound concentration). This is the highest grade attainable in fine perfumery, significantly richer than Eau de Parfum (15-20%) or Eau de Toilette (5-15%). One to two sprays provide 14+ hours of projection.',
    },
    {
      q: 'How does shipping and delivery work across India?',
      a: 'We dispatch all orders via insured express air and surface partners (Blue Dart, Delhivery, DTDC). Standard transit time is 2 to 3 business days for metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune) and 3 to 5 business days for regional hubs. We offer complimentary insured shipping on all orders exceeding ₹2,500.',
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is available across serviceable Indian postal PIN codes for orders up to ₹15,000. A standard cash handling convenience fee of ₹50 applies. Delivery personnel can accept cash or instantaneous UPI QR code scan on arrival.',
    },
    {
      q: 'What is the 56-day maceration process?',
      a: 'Following formulation, each batch of fragrance oil is mixed with high-purity natural alcohol and stored in dark amber glass vessels at a steady 14°C for 56 continuous days (8 weeks). This allows the natural resinoids, florals, and Mysore sandalwood to mature and meld seamlessly, removing harsh ethanol notes and producing our signature silky drydown.',
    },
    {
      q: 'How should I store my VAYRIVO flacon?',
      a: 'Fine perfumes are living botanical compositions sensitive to ultraviolet light, excessive heat, and humidity. Store your flacon inside its emerald presentation box or in a cool, dark cabinet away from direct sunlight and bathroom temperature swings. Stored properly, an Extrait de Parfum maintains its full potency for over five years.',
    },
    {
      q: 'What is your returns and cancellation policy?',
      a: 'Because fragrances are intimate personal cosmetic goods governed by Indian Cosmetic Rules 2020, opened bottles cannot be returned for hygiene and authenticity assurance. However, if your flacon arrives damaged in transit or defective, notify our concierge within 48 hours with unboxing photographs for an immediate complimentary replacement or full refund.',
    },
    {
      q: 'Are VAYRIVO perfumes cruelty-free and IFRA certified?',
      a: 'Yes. VAYRIVO is 100% cruelty-free; we never test on animals. All formulas comply rigorously with the International Fragrance Association (IFRA 51st Amendment) safety and purity standards, as well as the Indian Drugs and Cosmetics Act.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Client Guidance & Advisory
        </span>
        <h1 className="font-brand text-4xl sm:text-5xl text-[#F5F0E5]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F0E5]/70 font-light max-w-xl mx-auto leading-relaxed">
          Everything you need to know about our artisanal formulations, shipping commitments across India, and perfume care rituals.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-[#1a3c2c] bg-[#092117]/30 transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-serif-luxury text-[#F5F0E5] hover:text-[#F1D99B]"
              >
                <span className="text-base sm:text-lg">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#D8B56D] shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#F5F0E5]/75 font-light leading-relaxed border-t border-[#1a3c2c]/40 animate-in fade-in duration-200">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
