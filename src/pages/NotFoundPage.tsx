import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-[#092117] border border-[#D8B56D]/40 flex items-center justify-center text-[#D8B56D]">
        <Compass className="w-10 h-10 opacity-70 animate-spin-slow" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
          404 • Destination Unknown
        </span>
        <h1 className="font-brand text-4xl sm:text-5xl text-[#F5F0E5]">
          A Lost Olfactory Trail
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F0E5]/60 max-w-md mx-auto font-light leading-relaxed">
          The page or formulation you are seeking does not exist or has been archived in our private vault.
        </p>
      </div>

      <div className="pt-4 flex justify-center gap-4">
        <button
          onClick={() => onNavigate('home')}
          className="gold-button px-8 py-3 text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2"
        >
          Return to Atelier <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
