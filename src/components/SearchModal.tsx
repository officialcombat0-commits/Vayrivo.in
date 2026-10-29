import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  onSelectProduct: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectProduct }) => {
  const { isSearchOpen, setIsSearchOpen, products, formatPrice } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState<Product[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const matches = products.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.top_notes.toLowerCase().includes(term) ||
        p.heart_notes.toLowerCase().includes(term) ||
        p.base_notes.toLowerCase().includes(term) ||
        p.fragrance_family.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    });
    setFiltered(matches);
  }, [searchTerm, products]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl glass-panel-dark border border-[#D8B56D]/30 shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-5 right-5 text-[#F5F0E5]/60 hover:text-[#D8B56D] transition-colors"
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#D8B56D]/40 pb-4 mb-6">
          <Search className="w-6 h-6 text-[#D8B56D] mr-3 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fragrance, note (fig, saffron, oud, rose, vanilla)..."
            autoFocus
            className="w-full bg-transparent text-lg md:text-xl text-[#F5F0E5] placeholder-[#F5F0E5]/40 outline-none font-serif-luxury tracking-wide"
          />
        </div>

        {/* Popular Olfactory Notes Suggestions */}
        {!searchTerm && (
          <div className="py-4">
            <div className="text-xs uppercase tracking-widest text-[#D8B56D] font-medium mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Curated Fragrance Notes
            </div>
            <div className="flex flex-wrap gap-2">
              {['Black Fig', 'Saffron', 'Mysore Sandalwood', 'Turkish Rose', 'Oud', 'Bourbon Vanilla', 'Bergamot', 'Velvet Woods'].map((note) => (
                <button
                  key={note}
                  onClick={() => setSearchTerm(note)}
                  className="px-3.5 py-1.5 text-xs border border-[#1a3c2c] bg-[#092117]/60 text-[#F5F0E5]/80 hover:border-[#D8B56D] hover:text-[#D8B56D] transition-all tracking-wider"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searchTerm && (
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
            <div className="text-xs uppercase tracking-widest text-[#D8B56D]/80 mb-2">
              Found {filtered.length} {filtered.length === 1 ? 'creation' : 'creations'}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10 text-[#F5F0E5]/50 font-light">
                No bespoke fragrances found matching &quot;{searchTerm}&quot;. Try exploring notes like Oud, Fig, or Rose.
              </div>
            ) : (
              filtered.map((product) => {
                const primaryImg = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=500&q=80';
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product.slug);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-4 p-3 border border-[#1a3c2c]/60 hover:border-[#D8B56D]/60 hover:bg-[#092117]/40 transition-all cursor-pointer group"
                  >
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-16 h-16 object-cover border border-[#D8B56D]/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif-luxury text-lg text-[#F5F0E5] group-hover:text-[#D8B56D] transition-colors truncate">
                          {product.name}
                        </h4>
                        <span className="text-sm font-medium text-[#D8B56D]">
                          From {formatPrice(product.minPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-[#D8B56D]/80 tracking-wider mb-1">
                        {product.fragrance_family} • {product.concentration}
                      </p>
                      <p className="text-xs text-[#F5F0E5]/60 truncate font-light">
                        {product.top_notes} • {product.heart_notes}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#F5F0E5]/30 group-hover:text-[#D8B56D] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
