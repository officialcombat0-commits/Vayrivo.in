import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import { Coupon } from '../types';
import { Plus, Trash2, Tag, Percent, IndianRupee, X } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { adminFetch } = useAdmin();
  const { formatPrice, showToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 2000,
    maxDiscountAmount: 1000,
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    try {
      const res = await adminFetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        showToast(`Privilege code ${newCoupon.code} created`, 'success');
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to create coupon', 'error');
      }
    } catch {
      showToast('Error creating coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Delete promotional privilege code "${code}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Privilege code ${code} deleted`, 'info');
        fetchCoupons();
      }
    } catch {
      showToast('Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1a3c2c] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Promotional Privileges
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
            Discount Codes & Coupons ({coupons.length})
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="gold-button px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono"
        >
          <Plus className="w-4 h-4" /> Create Privilege Code
        </button>
      </div>

      {/* Coupons Table */}
      <div className="glass-panel-dark border border-[#1a3c2c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider bg-[#092117]/60">
                <th className="py-3 px-4">Privilege Code</th>
                <th className="py-3 px-4">Type & Benefit</th>
                <th className="py-3 px-4">Min Order Value</th>
                <th className="py-3 px-4">Max Benefit Cap</th>
                <th className="py-3 px-4 text-center">Times Claimed</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-[#D8B56D] font-mono">
                    Loading promotional privileges...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-[#F5F0E5]/50 font-light">
                    No active discount codes. Create one to reward VIP patrons.
                  </td>
                </tr>
              ) : (
                coupons.map((cp) => (
                  <tr key={cp.id} className="hover:bg-[#092117]/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sm text-[#F1D99B] bg-[#050d09] px-2.5 py-1 border border-[#D8B56D]/30">
                        {cp.code}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-[#F5F0E5]">
                      {cp.discount_type === 'percentage' ? (
                        <span className="text-emerald-400 font-bold">{cp.discount_value}% Discount</span>
                      ) : (
                        <span className="text-[#F1D99B] font-bold">₹{cp.discount_value} Flat Off</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#F5F0E5]/80">
                      {formatPrice(cp.min_order_amount)}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#F5F0E5]/60">
                      {cp.max_discount_amount ? formatPrice(cp.max_discount_amount) : 'Uncapped'}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-[#F5F0E5]">
                      {cp.times_used}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold ${
                        cp.is_active === 1
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {cp.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(cp.id, cp.code)}
                        className="p-1.5 text-[#F5F0E5]/40 hover:text-red-400 transition-colors"
                        title="Delete Privilege Code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#092117] border border-[#D8B56D]/40 text-[#F5F0E5] p-6 space-y-4 relative">
            <div className="flex justify-between items-center border-b border-[#1a3c2c] pb-3">
              <h3 className="font-serif-luxury text-xl text-[#F1D99B]">
                Create Promotional Privilege Code
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#F5F0E5]/60 hover:text-[#D8B56D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block font-mono">Privilege Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ROYAL20"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] uppercase font-mono tracking-wider outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none font-mono"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Benefit Value *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    placeholder="10"
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscountAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: Number(e.target.value) })}
                    placeholder="1000"
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#1a3c2c] text-[#F5F0E5]/60 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button px-5 py-2 uppercase font-semibold font-mono tracking-wider"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
