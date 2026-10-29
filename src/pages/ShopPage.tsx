import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  onSelectProduct: (slug: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory = 'all', onSelectProduct }) => {
  const { products } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const families = [
    { id: 'all', label: 'All Fragrance Families' },
    { id: 'woody', label: 'Woody & Smoky' },
    { id: 'floral', label: 'Haute Floral' },
    { id: 'oriental', label: 'Amber & Oriental' },
    { id: 'fresh', label: 'Fresh & Aromatic' },
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const match =
            p.name.toLowerCase().includes(term) ||
            p.top_notes.toLowerCase().includes(term) ||
            p.heart_notes.toLowerCase().includes(term) ||
            p.base_notes.toLowerCase().includes(term) ||
            p.fragrance_family.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term);
          if (!match) return false;
        }

        // Family
        if (selectedFamily !== 'all') {
          if (!p.fragrance_family.toLowerCase().includes(selectedFamily.toLowerCase())) {
            return false;
          }
        }

        // Stock
        if (inStockOnly && p.totalStock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.minPrice - b.minPrice;
        if (sortBy === 'price-desc') return b.minPrice - a.minPrice;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, searchTerm, selectedFamily, inStockOnly, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFamily('all');
    setSortBy('featured');
    setInStockOnly(false);
  };

  const hasActiveFilters = searchTerm !== '' || selectedFamily !== 'all' || inStockOnly || sortBy !== 'featured';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Complete Flacon Catalogue
        </span>
        <h1 className="font-brand text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E5]">
          Haute Parfumerie
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F0E5]/70 font-light leading-relaxed">
          Explore our collection of pure Extrait de Parfum creations. Each flacon is hand-filled, aged for eight weeks, and sealed with our sovereign crest.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="glass-panel-dark p-4 sm:p-6 border border-[#1a3c2c] space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#D8B56D] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, fig, saffron, oud, rose..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#050d09] border border-[#1a3c2c] text-xs text-[#F5F0E5] placeholder-[#F5F0E5]/40 outline-none focus:border-[#D8B56D] font-light tracking-wide"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-[#F5F0E5]/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* In stock toggle */}
            <label className="flex items-center gap-2 text-xs text-[#F5F0E5]/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#D8B56D]"
              />
              <span>In Stock Flacons</span>
            </label>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-[#F5F0E5]/60">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D8B56D]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#050d09] border border-[#1a3c2c] text-xs text-[#F5F0E5] px-3 py-2 outline-none focus:border-[#D8B56D]"
              >
                <option value="featured">Featured / Curated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A - Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#D8B56D] hover:underline uppercase tracking-wider font-mono px-2 py-1"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Olfactory Family Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1a3c2c]/50">
          {families.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFamily(f.id)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all ${
                selectedFamily === f.id
                  ? 'border border-[#D8B56D] bg-[#D8B56D] text-[#050d09] font-bold'
                  : 'border border-[#1a3c2c] bg-[#050d09]/60 text-[#F5F0E5]/70 hover:border-[#D8B56D]/60 hover:text-[#D8B56D]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Results */}
      <div>
        <div className="text-xs uppercase tracking-widest text-[#D8B56D]/80 mb-6 flex justify-between items-center">
          <span>Showing {filteredProducts.length} Bespoke {filteredProducts.length === 1 ? 'Flacon' : 'Flacons'}</span>
          <span className="text-[11px] text-[#F5F0E5]/50 font-light">Free Insured Courier Across India Above ₹2,500</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-[#1a3c2c] bg-[#092117]/20 p-8 space-y-4">
            <h3 className="font-serif-luxury text-2xl text-[#F5F0E5]">No Flacons Match Your Selection</h3>
            <p className="text-xs text-[#F5F0E5]/60 max-w-md mx-auto font-light leading-relaxed">
              We couldn&apos;t find any fragrances matching your current search and filters. Try adjusting your search term or exploring another olfactory family.
            </p>
            <button
              onClick={clearFilters}
              className="gold-button px-6 py-2.5 text-xs font-semibold uppercase tracking-wider inline-block"
            >
              View Full Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
