import React from 'react';
import { Sparkles, Heart, Anchor, Clock, Wind } from 'lucide-react';

interface FragrancePyramidProps {
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  longevity?: string;
  sillage?: string;
}

export const FragrancePyramid: React.FC<FragrancePyramidProps> = ({
  topNotes,
  heartNotes,
  baseNotes,
  longevity = '12+ Hours',
  sillage = 'Intimate to Moderate',
}) => {
  return (
    <div className="space-y-6">
      <div className="border border-[#1a3c2c] bg-[#092117]/40 p-6 relative overflow-hidden">
        {/* Background decorative gold lines */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8B56D]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8B56D] font-mono">
            Olfactory Architecture
          </span>
          <h3 className="font-serif-luxury text-2xl text-[#F5F0E5] mt-1">
            The Fragrance Pyramid
          </h3>
          <div className="w-12 h-px bg-[#D8B56D]/50 mx-auto mt-2" />
        </div>

        {/* Pyramid levels */}
        <div className="space-y-4 max-w-xl mx-auto">
          {/* Top Notes */}
          <div className="border-l-2 border-[#F1D99B] pl-4 py-2 bg-[#050d09]/40 hover:bg-[#050d09]/70 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#F1D99B] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F1D99B]" /> Head Notes (The First Impression)
              </span>
              <span className="text-[10px] text-[#F5F0E5]/40 font-mono">0 - 30 Minutes</span>
            </div>
            <p className="text-sm text-[#F5F0E5] font-light mt-1">
              {topNotes}
            </p>
          </div>

          {/* Heart Notes */}
          <div className="border-l-2 border-[#D8B56D] pl-4 py-2 bg-[#050d09]/40 hover:bg-[#050d09]/70 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#D8B56D] font-medium flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#D8B56D]" /> Heart Notes (The Signature Soul)
              </span>
              <span className="text-[10px] text-[#F5F0E5]/40 font-mono">2 - 6 Hours</span>
            </div>
            <p className="text-sm text-[#F5F0E5] font-light mt-1">
              {heartNotes}
            </p>
          </div>

          {/* Base Notes */}
          <div className="border-l-2 border-[#B89347] pl-4 py-2 bg-[#050d09]/40 hover:bg-[#050d09]/70 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#B89347] font-medium flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-[#B89347]" /> Base Notes (The Enduring Memory)
              </span>
              <span className="text-[10px] text-[#F5F0E5]/40 font-mono">12+ Hours</span>
            </div>
            <p className="text-sm text-[#F5F0E5] font-light mt-1">
              {baseNotes}
            </p>
          </div>
        </div>

        {/* Longevity & Sillage Badges */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#1a3c2c]/60 max-w-xl mx-auto">
          <div className="flex items-center gap-3 p-3 bg-[#050d09]/60 border border-[#1a3c2c]">
            <Clock className="w-5 h-5 text-[#D8B56D] shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#F5F0E5]/50">Longevity</div>
              <div className="text-xs font-medium text-[#F5F0E5] mt-0.5">{longevity}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#050d09]/60 border border-[#1a3c2c]">
            <Wind className="w-5 h-5 text-[#D8B56D] shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#F5F0E5]/50">Sillage & Projection</div>
              <div className="text-xs font-medium text-[#F5F0E5] mt-0.5">{sillage}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
