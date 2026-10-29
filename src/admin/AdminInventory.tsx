import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import { InventoryMovement } from '../types';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  History,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { adminFetch } = useAdmin();
  const { showToast } = useStore();
  const [stockOverview, setStockOverview] = useState<any[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/inventory');
      if (res.ok) {
        const data = await res.json();
        setStockOverview(data.stockOverview || []);
        setMovements(data.movements || []);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || adjustQuantity === 0) {
      showToast('Please enter a non-zero adjustment quantity', 'error');
      return;
    }
    setAdjusting(true);
    try {
      const res = await adminFetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          changeQuantity: adjustQuantity,
          note: adjustNote || 'Manual stock correction',
        }),
      });

      if (res.ok) {
        showToast('Vault stock level successfully adjusted', 'success');
        setSelectedVariant(null);
        setAdjustQuantity(0);
        setAdjustNote('');
        fetchInventoryData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Adjustment failed', 'error');
      }
    } catch {
      showToast('Failed to adjust stock', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1a3c2c] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Vault Inventory Ledger
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
            Flacon Stock & Movement Trail
          </h1>
        </div>
      </div>

      {/* Stock Level Table */}
      <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-4">
        <h2 className="font-serif-luxury text-xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3 flex items-center justify-between">
          <span>Active Flacon Stock Levels</span>
          <span className="text-xs text-[#D8B56D] font-mono">
            {stockOverview.filter((v) => v.stock_quantity <= v.low_stock_threshold).length} low-stock alerts
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider bg-[#092117]/60">
                <th className="py-2.5 px-3">Flacon & Fragrance</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-center">In Vault</th>
                <th className="py-2.5 px-3 text-center">Threshold</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-[#D8B56D] font-mono">
                    Auditing vault stock levels...
                  </td>
                </tr>
              ) : (
                stockOverview.map((v) => {
                  const isLow = v.stock_quantity <= v.low_stock_threshold;
                  const isOut = v.stock_quantity <= 0;
                  return (
                    <tr key={v.id} className="hover:bg-[#092117]/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#F5F0E5]">
                        {v.product_name}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#D8B56D]">
                        {v.size_ml}ml
                      </td>
                      <td className="py-3 px-3 font-mono text-[#F5F0E5]/60 text-[11px]">
                        {v.sku}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                        <span className={isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                          {v.stock_quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#F5F0E5]/50">
                        {v.low_stock_threshold}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold ${
                          isOut
                            ? 'bg-red-950/60 text-red-300 border border-red-500/40'
                            : isLow
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {isOut ? 'Sold Out' : isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedVariant(v);
                            setAdjustQuantity(0);
                            setAdjustNote('');
                          }}
                          className="px-3 py-1 bg-[#1a3c2c] text-[#F1D99B] hover:bg-[#D8B56D] hover:text-[#050d09] text-[10px] font-mono uppercase tracking-wider transition-all"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Audit Trail */}
      <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-4">
        <h2 className="font-serif-luxury text-xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-[#D8B56D]" /> Stock Movement Audit Trail
        </h2>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider bg-[#092117]/60">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Flacon & SKU</th>
                <th className="py-2.5 px-3 text-center">Type</th>
                <th className="py-2.5 px-3 text-center">Units Delta</th>
                <th className="py-2.5 px-3">Audit Note / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-xs text-[#F5F0E5]/50 font-light">
                    No movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#092117]/20 text-[11px]">
                    <td className="py-2.5 px-3 font-mono text-[#F5F0E5]/60">
                      {new Date(m.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#F5F0E5]">{m.product_name}</span> ({m.size_ml}ml)
                      <span className="text-[10px] font-mono text-[#F5F0E5]/50 block">{m.sku}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold ${
                        m.movement_type === 'sale' ? 'text-red-300 bg-red-950/40' :
                        m.movement_type === 'restock' ? 'text-emerald-300 bg-emerald-950/40' :
                        'text-amber-300 bg-amber-950/40'
                      }`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={m.change_quantity > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {m.change_quantity > 0 ? `+${m.change_quantity}` : m.change_quantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#F5F0E5]/70 font-light truncate max-w-xs">
                      {m.note || m.reference_order_id || 'Internal stock management'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#092117] border border-[#D8B56D]/40 text-[#F5F0E5] p-6 space-y-4 relative">
            <div className="flex justify-between items-center border-b border-[#1a3c2c] pb-3">
              <h3 className="font-serif-luxury text-xl text-[#F1D99B]">
                Adjust Stock: {selectedVariant.product_name}
              </h3>
              <button onClick={() => setSelectedVariant(null)} className="text-[#F5F0E5]/60 hover:text-[#D8B56D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs p-3 bg-[#050d09] border border-[#1a3c2c] space-y-1 font-mono">
              <div>Flacon Size: {selectedVariant.size_ml}ml</div>
              <div>SKU: {selectedVariant.sku}</div>
              <div>Current Vault Stock: <strong>{selectedVariant.stock_quantity} units</strong></div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block font-mono">
                  Quantity Change (+ to add, - to deduct) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  placeholder="e.g. +25 or -5"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none"
                />
                <span className="text-[10px] text-[#F5F0E5]/50 block">
                  New stock will be: <strong>{selectedVariant.stock_quantity + (Number(adjustQuantity) || 0)} units</strong>
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block font-mono">Audit Log Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Restock shipment arrival from atelier / Quality inspection damage"
                  className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVariant(null)}
                  className="px-4 py-2 border border-[#1a3c2c] text-[#F5F0E5]/60 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="gold-button px-5 py-2 uppercase font-semibold font-mono tracking-wider"
                >
                  {adjusting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
