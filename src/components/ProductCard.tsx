import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, toggleWishlist, isInWishlist, formatPrice } = useStore();

  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    return variants[0] || {
      id: 'default',
      product_id: product.id,
      size_ml: 50,
      sku: 'SKU',
      price: product.minPrice,
      stock_quantity: product.totalStock,
      low_stock_threshold: 5,
    };
  });

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const currentPrice = selectedVariant.sale_price || selectedVariant.price;
  const isSale = !!selectedVariant.sale_price && selectedVariant.sale_price < selectedVariant.price;
  const isOutOfStock = selectedVariant.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && selectedVariant.stock_quantity <= selectedVariant.low_stock_threshold;

  return (
    <div className="group relative border border-[#1a3c2c]/80 bg-[#092117]/30 hover:border-[#D8B56D]/60 hover:bg-[#092117]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.is_bestseller === 1 && (
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 bg-[#D8B56D] text-[#050d09] font-bold">
            Bestseller
          </span>
        )}
        {product.is_featured === 1 && product.is_bestseller !== 1 && (
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 bg-[#1a3c2c] text-[#F1D99B] border border-[#D8B56D]/40 font-medium">
            Featured Flacon
          </span>
        )}
        {isLowStock && (
          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-amber-900/60 text-amber-300 border border-amber-600/40">
            Only {selectedVariant.stock_quantity} left
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#050d09]/70 border border-[#D8B56D]/30 flex items-center justify-center text-[#F5F0E5] hover:text-[#D8B56D] hover:border-[#D8B56D] transition-colors"
        aria-label="Save to wishlist"
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#D8B56D] text-[#D8B56D]' : ''}`} />
      </button>

      {/* Product Image Stage */}
      <div
        onClick={() => onSelect(product.slug)}
        className="relative aspect-4/5 overflow-hidden cursor-pointer bg-[#050d09]/50 flex items-center justify-center p-4"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#092117] via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        {/* Hover Quick Action */}
        <div className="absolute inset-x-4 bottom-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden sm:flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product.slug);
            }}
            className="w-full py-2 bg-[#050d09]/90 border border-[#D8B56D]/60 text-xs font-semibold uppercase tracking-widest text-[#F1D99B] hover:bg-[#D8B56D] hover:text-[#050d09] transition-all flex items-center justify-center gap-1.5 shadow-xl"
          >
            <Eye className="w-3.5 h-3.5" /> View Scent Profile
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono mb-1">
            {product.fragrance_family} • {product.concentration}
          </div>

          <h3
            onClick={() => onSelect(product.slug)}
            className="font-serif-luxury text-lg md:text-xl text-[#F5F0E5] group-hover:text-[#D8B56D] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#F5F0E5]/60 font-light line-clamp-2 mt-1 leading-relaxed">
            {product.short_description || product.description}
          </p>
        </div>

        {/* Size Selector */}
        {variants.length > 1 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-[#F5F0E5]/50">Flacon:</span>
            <div className="flex gap-1.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-mono transition-all ${
                    selectedVariant.id === v.id
                      ? 'border border-[#D8B56D] bg-[#D8B56D]/20 text-[#F1D99B] font-semibold'
                      : 'border border-[#1a3c2c] text-[#F5F0E5]/70 hover:border-[#D8B56D]/50'
                  }`}
                >
                  {v.size_ml}ml
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price & Add to Bag */}
        <div className="pt-2 border-t border-[#1a3c2c]/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#F1D99B]">
                {formatPrice(currentPrice)}
              </span>
              {isSale && (
                <span className="text-xs text-[#F5F0E5]/40 line-through">
                  {formatPrice(selectedVariant.price)}
                </span>
              )}
            </div>
            <span className="text-[9px] text-[#F5F0E5]/40 block uppercase tracking-wider">
              {isOutOfStock ? (
                <span className="text-red-400">Sold Out</span>
              ) : (
                'Tax incl. • Pure Extrait'
              )}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, selectedVariant, 1)}
            disabled={isOutOfStock}
            className={`p-2.5 transition-all ${
              isOutOfStock
                ? 'opacity-30 cursor-not-allowed bg-[#1a3c2c] text-[#F5F0E5]'
                : 'bg-[#D8B56D] text-[#050d09] hover:bg-[#F1D99B] shadow-md hover:scale-105 active:scale-95'
            }`}
            title={isOutOfStock ? 'Sold Out' : 'Add to Bag'}
            aria-label="Add to bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
