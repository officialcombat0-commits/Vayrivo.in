import React from 'react';
import { Sparkles, Award, ShieldCheck, Heart, Leaf, Compass, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Haute Parfumerie & Botanical Philosophy
        </span>
        <h1 className="font-brand text-4xl sm:text-5xl lg:text-6xl text-[#F5F0E5]">
          The Heritage of VAYRIVO
        </h1>
        <p className="font-serif italic text-lg sm:text-xl text-[#F1D99B]/90 font-light">
          &quot;Where Ancient Indian Aromatics Meet French Haute Extraction.&quot;
        </p>
      </div>

      {/* Main Narrative with Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative">
          <div className="border border-[#D8B56D]/30 p-2 bg-[#092117]/60">
            <img
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85"
              alt="VAYRIVO Atelier Flacon"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden sm:block p-6 glass-panel-dark border border-[#D8B56D]/40 max-w-xs shadow-2xl">
            <div className="text-xs uppercase tracking-widest text-[#D8B56D] font-mono">
              Pure Extrait Grade
            </div>
            <div className="font-serif-luxury text-base text-[#F5F0E5] mt-1">
              30% Concentration • Aged for 56 Days in Dark Demijohns
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6 text-xs sm:text-sm text-[#F5F0E5]/80 font-light leading-relaxed">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
            Reviving the Golden Age of Imperial Scent
          </h2>
          <p>
            For millennia, the Indian subcontinent held the crown of global perfumery. The ancient courts of Pataliputra, Ujjain, and Mughal Agra distilled rare botanicals in copper degs, capturing the intimate essence of monsoon earth, midnight-blooming jasmine, and wild Mysore sandalwood.
          </p>
          <p>
            VAYRIVO was founded to liberate these sacred Indian notes from fading historical archives and elevate them with contemporary French olfactory architecture. In our Mumbai atelier, classical botanical absolutes are formulated at an uncompromised 28% to 32% Extrait de Parfum concentration.
          </p>
          <p>
            We reject mass commercial synthesizers, diluted waters, and fleeting formulations. A VAYRIVO flacon does not merely introduce itself—it leaves a lasting regal aura.
          </p>
        </div>
      </div>

      {/* Pillars of Ethics and Purity */}
      <div className="border-t border-[#1a3c2c] pt-16 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Our Unwavering Standards
          </span>
          <h2 className="font-serif-luxury text-3xl text-[#F5F0E5]">
            Botanical Integrity & Craftsmanship
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed">
          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/30 space-y-3">
            <Leaf className="w-6 h-6 text-[#D8B56D]" />
            <h3 className="font-serif-luxury text-xl text-[#F1D99B]">Ethical Botanical Sourcing</h3>
            <p className="text-[#F5F0E5]/70 font-light">
              We work directly with certified sustainable sandalwood cooperatives in Karnataka and traditional rose harvesting dynasties in Kannauj, ensuring fair compensation and environmental regeneration.
            </p>
          </div>

          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/30 space-y-3">
            <Compass className="w-6 h-6 text-[#D8B56D]" />
            <h3 className="font-serif-luxury text-xl text-[#F1D99B]">56-Day Maceration</h3>
            <p className="text-[#F5F0E5]/70 font-light">
              Unlike commercial fragrance brands that bottle immediately, every VAYRIVO batch is rested for eight weeks in temperature-controlled darkness to allow full aromatic bonding and depth.
            </p>
          </div>

          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/30 space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#D8B56D]" />
            <h3 className="font-serif-luxury text-xl text-[#F1D99B]">Strict Indian & IFRA Compliance</h3>
            <p className="text-[#F5F0E5]/70 font-light">
              Compliant with the Drugs and Cosmetics Act (Cosmetic Rules 2020) and IFRA 51st Amendment standards. 100% cruelty-free, phthalate-free, and vegan formulation.
            </p>
          </div>
        </div>
      </div>

      {/* Atelier Leadership & Founders */}
      <div className="border-t border-[#1a3c2c] pt-16 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Visionaries & Stewards
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F0E5]">
            Atelier Leadership
          </h2>
          <p className="text-xs text-[#F5F0E5]/70 font-light max-w-lg mx-auto">
            Guiding VAYRIVO with an uncompromised commitment to Indian botanical sovereignty and Haute Parfumerie standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-[#D8B56D]/40 bg-[#092117]/60 text-center space-y-3 relative">
            <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono font-bold">
              Founder & Owner
            </div>
            <h3 className="font-brand text-2xl text-[#F1D99B]">Sandeep Kumar</h3>
            <p className="text-xs text-[#F5F0E5]/75 font-light leading-relaxed">
              Curator of brand vision and custodian of authentic royal Indian botanicals, uniting heritage artistry with modern luxury commerce.
            </p>
          </div>

          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/40 text-center space-y-3 hover:border-[#D8B56D]/40 transition-colors">
            <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono font-bold">
              Store Manager & Operations
            </div>
            <h3 className="font-brand text-2xl text-[#F5F0E5]">Ashkand Yadav</h3>
            <p className="text-xs text-[#F5F0E5]/75 font-light leading-relaxed">
              Directing botanical harvest logistics, sustainable extraction chains, and customer fulfillment across India.
            </p>
          </div>

          <div className="p-8 border border-[#1a3c2c] bg-[#092117]/40 text-center space-y-3 hover:border-[#D8B56D]/40 transition-colors">
            <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono font-bold">
              Store Manager & Formulations
            </div>
            <h3 className="font-brand text-2xl text-[#F5F0E5]">Surya Kumar</h3>
            <p className="text-xs text-[#F5F0E5]/75 font-light leading-relaxed">
              Spearheading olfactory formulation architectures, notes harmonization, and the rigorous 56-day maturation cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Flagship Boutiques */}
      <div className="p-10 border border-[#D8B56D]/30 bg-[#092117]/40 space-y-6 text-center max-w-4xl mx-auto">
        <h3 className="font-serif-luxury text-3xl text-[#F5F0E5]">
          Experience VAYRIVO In Person
        </h3>
        <p className="text-xs sm:text-sm text-[#F5F0E5]/70 font-light max-w-xl mx-auto leading-relaxed">
          Visit our flagship salon in Mumbai for a bespoke olfactory consultation with our resident fragrance sommeliers.
        </p>
        <div className="font-mono text-xs text-[#D8B56D]">
          The Heritage Galleria, Colaba, Mumbai 400001 • Open Daily 11 AM - 8 PM
        </div>
        <div>
          <button
            onClick={() => onNavigate('contact')}
            className="gold-button px-8 py-3 text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2"
          >
            Schedule Private Appointment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
