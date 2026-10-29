import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  X,
  Image as ImageIcon
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { adminFetch } = useAdmin();
  const { formatPrice, refreshProducts, showToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    tagLine: '',
    description: '',
    shortDescription: '',
    fragranceFamily: 'Woody Oriental',
    gender: 'Unisex',
    concentration: 'Extrait de Parfum (30% Concentration)',
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    longevity: '14+ Hours',
    sillage: 'Commanding & Enveloping',
    isFeatured: false,
    isBestseller: false,
    isPublished: true,
    variants: [
      { size_ml: 50, sku: '', price: 3450, sale_price: '', stock_quantity: 25, low_stock_threshold: 5 },
      { size_ml: 100, sku: '', price: 5400, sale_price: '', stock_quantity: 15, low_stock_threshold: 5 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  });

  const fetchAdminProducts = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      tagLine: '',
      description: '',
      shortDescription: '',
      fragranceFamily: 'Woody Oriental',
      gender: 'Unisex',
      concentration: 'Extrait de Parfum (30% Concentration)',
      topNotes: '',
      heartNotes: '',
      baseNotes: '',
      longevity: '14+ Hours',
      sillage: 'Commanding & Enveloping',
      isFeatured: false,
      isBestseller: false,
      isPublished: true,
      variants: [
        { size_ml: 50, sku: '', price: 3450, sale_price: '', stock_quantity: 25, low_stock_threshold: 5 },
        { size_ml: 100, sku: '', price: 5400, sale_price: '', stock_quantity: 15, low_stock_threshold: 5 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      tagLine: p.tag_line || '',
      description: p.description,
      shortDescription: p.short_description || '',
      fragranceFamily: p.fragrance_family,
      gender: p.gender,
      concentration: p.concentration,
      topNotes: p.top_notes,
      heartNotes: p.heart_notes,
      baseNotes: p.base_notes,
      longevity: p.longevity || '14+ Hours',
      sillage: p.sillage || 'Intimate to Moderate',
      isFeatured: p.is_featured === 1,
      isBestseller: p.is_bestseller === 1,
      isPublished: p.is_published === 1,
      variants: p.variants.map((v) => ({
        size_ml: v.size_ml,
        sku: v.sku,
        price: v.price,
        sale_price: v.sale_price ? String(v.sale_price) : '',
        stock_quantity: v.stock_quantity,
        low_stock_threshold: v.low_stock_threshold,
      })),
      imageUrl: p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      variants: formData.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        sale_price: v.sale_price ? Number(v.sale_price) : null,
        stock_quantity: Number(v.stock_quantity),
        sku: v.sku || `VAY-${formData.name.substring(0, 3).toUpperCase()}-${v.size_ml}`,
      })),
      images: [
        { image_url: formData.imageUrl, alt_text: formData.name, is_primary: 1 },
      ],
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingProduct ? 'Product updated successfully' : 'Product created successfully', 'success');
        setIsModalOpen(false);
        fetchAdminProducts();
        refreshProducts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch {
      showToast('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you certain you wish to delete "${name}"? This action cannot be reversed.`)) return;
    try {
      const res = await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Flacon ${name} removed from vault`, 'info');
        fetchAdminProducts();
        refreshProducts();
      }
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.fragrance_family.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1a3c2c] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Vault Catalog Management
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
            Fragrance Formulations ({products.length})
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#D8B56D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search formulations..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#050d09] border border-[#1a3c2c] text-xs text-[#F5F0E5] outline-none font-mono"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="gold-button px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Flacon
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel-dark border border-[#1a3c2c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider bg-[#092117]/60">
                <th className="py-3 px-4">Flacon</th>
                <th className="py-3 px-4">Family & Notes</th>
                <th className="py-3 px-4">Variants (Size / Stock)</th>
                <th className="py-3 px-4 text-right">Price Range</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-[#D8B56D] font-mono">
                    Loading fragrances from vault...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-[#F5F0E5]/50 font-light">
                    No matching fragrance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const imgUrl = p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80';
                  return (
                    <tr key={p.id} className="hover:bg-[#092117]/30 transition-colors">
                      {/* Image & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-10 h-12 object-cover border border-[#D8B56D]/30 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-sm text-[#F5F0E5]">{p.name}</div>
                            <div className="text-[10px] text-[#D8B56D] font-mono">
                              {p.is_bestseller === 1 && '★ Bestseller • '}
                              {p.is_featured === 1 && 'Featured • '}
                              {p.concentration}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Family & Notes */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-mono text-[#F1D99B] text-[11px]">{p.fragrance_family}</div>
                        <div className="text-[10px] text-[#F5F0E5]/60 truncate font-light mt-0.5">
                          Top: {p.top_notes}
                        </div>
                      </td>

                      {/* Variants & Stock */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {p.variants?.map((v) => (
                          <div key={v.id} className="flex items-center gap-2">
                            <span>{v.size_ml}ml:</span>
                            <span className={v.stock_quantity <= v.low_stock_threshold ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                              {v.stock_quantity} in vault
                            </span>
                            <span className="text-[#F5F0E5]/40 text-[9px]">({v.sku})</span>
                          </div>
                        ))}
                      </td>

                      {/* Price Range */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-[#F1D99B]">
                        {(() => {
                          const minP = p.minPrice ?? (p.variants?.length ? Math.min(...p.variants.map((v) => v.sale_price || v.price)) : 0);
                          const maxP = p.maxPrice ?? (p.variants?.length ? Math.max(...p.variants.map((v) => v.price)) : 0);
                          return (
                            <>
                              {formatPrice(minP)} {maxP > minP ? ` - ${formatPrice(maxP)}` : ''}
                            </>
                          );
                        })()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold ${
                          p.is_published === 1
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {p.is_published === 1 ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-[#D8B56D] hover:text-[#F1D99B] hover:bg-[#050d09]"
                            title="Edit Flacon"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-[#F5F0E5]/40 hover:text-red-400 hover:bg-[#050d09]"
                            title="Delete Flacon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#092117] border border-[#D8B56D]/40 text-[#F5F0E5] shadow-2xl p-6 sm:p-8 space-y-6 relative my-8">
            <div className="flex justify-between items-center border-b border-[#1a3c2c] pb-4">
              <h2 className="font-serif-luxury text-2xl text-[#F1D99B]">
                {editingProduct ? `Edit Formulation: ${editingProduct.name}` : 'Create New Haute Flacon'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#F5F0E5]/60 hover:text-[#D8B56D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Fragrance Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Imperial Vetiver"
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Olfactory Family *</label>
                  <input
                    type="text"
                    required
                    value={formData.fragranceFamily}
                    onChange={(e) => setFormData({ ...formData, fragranceFamily: e.target.value })}
                    placeholder="e.g. Woody Oriental / Haute Floral"
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block font-mono">Artisanal Tagline</label>
                <input
                  type="text"
                  value={formData.tagLine}
                  onChange={(e) => setFormData({ ...formData, tagLine: e.target.value })}
                  placeholder="The Sovereign Darkness of Black Fig and Velvet Woods"
                  className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              {/* Fragrance Pyramid Notes */}
              <div className="p-4 border border-[#1a3c2c] bg-[#050d09]/50 space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono block">
                  Olfactory Pyramid Breakdown
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={formData.topNotes}
                    onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                    placeholder="Top Notes (e.g. Black Fig, Italian Bergamot, Bitter Almond)"
                    className="w-full p-2 bg-[#092117] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                  <input
                    type="text"
                    required
                    value={formData.heartNotes}
                    onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                    placeholder="Heart Notes (e.g. Dark Ceylon Tea, Saffron, Night Jasmine)"
                    className="w-full p-2 bg-[#092117] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                  <input
                    type="text"
                    required
                    value={formData.baseNotes}
                    onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                    placeholder="Base Notes (e.g. Velvet Woods, Smoked Amber, Mysore Sandalwood)"
                    className="w-full p-2 bg-[#092117] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block font-mono">Full Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              {/* Primary Image URL */}
              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block font-mono">Flacon Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
                />
              </div>

              {/* Variants Section */}
              <div className="p-4 border border-[#1a3c2c] bg-[#050d09]/50 space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono block">
                  Bottle Size Variants & Vault Inventory
                </span>
                <div className="space-y-3">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2 items-center text-xs">
                      <div>
                        <span className="font-mono text-[#F1D99B] font-bold block">{v.size_ml}ml Bottle</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#F5F0E5]/50 block">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={v.price}
                          onChange={(e) => {
                            const newVars = [...formData.variants];
                            newVars[idx].price = Number(e.target.value);
                            setFormData({ ...formData, variants: newVars });
                          }}
                          className="w-full p-1.5 bg-[#092117] border border-[#1a3c2c] font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#F5F0E5]/50 block">Sale Price (Optional)</label>
                        <input
                          type="number"
                          value={v.sale_price}
                          onChange={(e) => {
                            const newVars = [...formData.variants];
                            newVars[idx].sale_price = e.target.value;
                            setFormData({ ...formData, variants: newVars });
                          }}
                          className="w-full p-1.5 bg-[#092117] border border-[#1a3c2c] font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#F5F0E5]/50 block">Stock Qty</label>
                        <input
                          type="number"
                          required
                          value={v.stock_quantity}
                          onChange={(e) => {
                            const newVars = [...formData.variants];
                            newVars[idx].stock_quantity = Number(e.target.value);
                            setFormData({ ...formData, variants: newVars });
                          }}
                          className="w-full p-1.5 bg-[#092117] border border-[#1a3c2c] font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#F5F0E5]/50 block">Low Stock Alert</label>
                        <input
                          type="number"
                          value={v.low_stock_threshold}
                          onChange={(e) => {
                            const newVars = [...formData.variants];
                            newVars[idx].low_stock_threshold = Number(e.target.value);
                            setFormData({ ...formData, variants: newVars });
                          }}
                          className="w-full p-1.5 bg-[#092117] border border-[#1a3c2c] font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-mono">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-[#D8B56D]"
                  />
                  <span>Featured Flacon</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-mono">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="accent-[#D8B56D]"
                  />
                  <span>Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-mono">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="accent-[#D8B56D]"
                  />
                  <span>Published on Storefront</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1a3c2c]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-[#1a3c2c] text-[#F5F0E5]/70 hover:text-white uppercase font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button px-6 py-2 uppercase font-semibold font-mono tracking-wider"
                >
                  {editingProduct ? 'Update Formulation' : 'Create Flacon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
