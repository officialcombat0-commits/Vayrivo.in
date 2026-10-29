import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { InvoiceModal } from '../components/InvoiceModal';
import {
  Search,
  Printer,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Eye,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { adminFetch } = useAdmin();
  const { formatPrice, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Order for Detail / Edit
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrderNumber, setInvoiceOrderNumber] = useState<string | null>(null);

  // Status update form fields
  const [newStatus, setNewStatus] = useState<string>('Confirmed');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('Blue Dart Express');
  const [notes, setNotes] = useState('');

  // Refund modal state
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/orders?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search)}&`;

      const res = await adminFetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setTrackingNumber(order.tracking_number || '');
    setCourierName(order.courier_name || 'Blue Dart Express');
    setNotes(order.notes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          trackingNumber,
          courierName,
          notes,
        }),
      });

      if (res.ok) {
        showToast(`Order ${selectedOrder.order_number} status updated to ${newStatus}`, 'success');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update order status', 'error');
      }
    } catch {
      showToast('Error updating order', 'error');
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedOrder) return;
    if (!window.confirm(`Issue full refund of ${formatPrice(selectedOrder.total_amount)} for ${selectedOrder.order_number}? This will restore vault inventory.`)) return;

    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundAmount: selectedOrder.total_amount,
          refundReason: refundReason || 'Patron requested cancellation & refund',
        }),
      });

      if (res.ok) {
        showToast(`Refund processed & inventory restored for ${selectedOrder.order_number}`, 'success');
        setIsRefunding(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to issue refund', 'error');
      }
    } catch {
      showToast('Refund transaction failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1a3c2c] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Commission Fulfillment
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
            Customer Order Registry ({orders.length})
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#D8B56D] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ref, patron, email..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#050d09] border border-[#1a3c2c] text-xs text-[#F5F0E5] outline-none font-mono"
          />
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] font-mono uppercase tracking-wider">
        {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 border transition-all ${
              statusFilter === st
                ? 'border-[#D8B56D] bg-[#D8B56D] text-[#050d09] font-bold'
                : 'border-[#1a3c2c] bg-[#050d09] text-[#F5F0E5]/70 hover:border-[#D8B56D]/50'
            }`}
          >
            {st === 'all' ? 'All Commissions' : st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass-panel-dark border border-[#1a3c2c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider bg-[#092117]/60">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Patron & Destination</th>
                <th className="py-3 px-4">Flacons Ordered</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-[#D8B56D] font-mono">
                    Querying orders database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-[#F5F0E5]/50 font-light">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#092117]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#F1D99B]">{ord.order_number}</div>
                      <div className="text-[10px] text-[#F5F0E5]/50 font-mono">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F5F0E5]">{ord.customer_name}</div>
                      <div className="text-[10px] text-[#F5F0E5]/60 font-mono">
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[#F5F0E5]/80">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="truncate max-w-xs">
                          {it.historical_product_name} ({it.historical_size_ml}ml) × {it.quantity}
                        </div>
                      ))}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#F1D99B]">
                      {formatPrice(ord.total_amount)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 font-bold ${
                        ord.payment_status === 'paid' ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'
                      }`}>
                        {ord.payment_method === 'cod' ? 'COD' : 'Online'} • {ord.payment_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-[#1a3c2c] text-[#D8B56D] border border-[#D8B56D]/30">
                        {ord.order_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openOrderDetail(ord)}
                          className="px-2.5 py-1 bg-[#1a3c2c] text-[#F1D99B] hover:bg-[#D8B56D] hover:text-[#050d09] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Manage
                        </button>
                        <button
                          onClick={() => setInvoiceOrderNumber(ord.order_number)}
                          className="p-1 text-[#F5F0E5]/60 hover:text-[#D8B56D]"
                          title="Print GST Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Status Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#092117] border border-[#D8B56D]/40 text-[#F5F0E5] shadow-2xl p-6 sm:p-8 space-y-6 relative my-8">
            <div className="flex justify-between items-center border-b border-[#1a3c2c] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#D8B56D] font-mono">
                  Order Management
                </span>
                <h2 className="font-serif-luxury text-2xl text-[#F1D99B] font-mono">
                  {selectedOrder.order_number}
                </h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#F5F0E5]/60 hover:text-[#D8B56D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patron & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#050d09]/50 border border-[#1a3c2c] text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#D8B56D] font-mono block">Patron:</span>
                <div className="font-semibold text-sm text-[#F5F0E5] mt-0.5">{selectedOrder.customer_name}</div>
                <div className="text-[#F5F0E5]/60 font-mono">{selectedOrder.customer_email} • {selectedOrder.customer_phone}</div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#D8B56D] font-mono block">Delivery Address:</span>
                <div className="text-[#F5F0E5]/80 mt-0.5 leading-relaxed">
                  {selectedOrder.shippingAddress?.addressLine1}
                  {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.pincode}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 border border-[#1a3c2c] p-4 bg-[#050d09]/40 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#D8B56D] font-mono block">
                Ordered Items Snapshot (Historical Frozen Prices):
              </span>
              <div className="divide-y divide-[#1a3c2c]/60">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-[#F5F0E5]">{it.historical_product_name}</span>
                      <span className="text-[10px] text-[#F5F0E5]/50 font-mono ml-2">
                        SKU: {it.historical_sku} • Qty: {it.quantity}
                      </span>
                    </div>
                    <span className="font-mono text-[#F1D99B]">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-[#1a3c2c] font-semibold">
                <span>Grand Total:</span>
                <span className="font-mono text-[#F1D99B] text-sm">{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Status & Fulfillment Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Update Order Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none font-mono"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled (Auto-Restores Stock)</option>
                    <option value="Returned">Returned (Auto-Restores Stock)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Airway Bill (AWB) Tracking No</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-88291039"
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#F5F0E5]/70 block font-mono">Courier Partner</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none font-mono"
                  >
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Delhivery Surface">Delhivery Surface</option>
                    <option value="DTDC Premium">DTDC Premium</option>
                    <option value="India Post Speed">India Post Speed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#F5F0E5]/70 block font-mono">Internal Atelier Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fragrance bottle checked by Sommelier; sealed with velvet ribbon."
                  className="w-full p-2 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1a3c2c]">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceOrderNumber(selectedOrder.order_number)}
                    className="px-4 py-2 border border-[#D8B56D]/40 text-[#D8B56D] hover:bg-[#D8B56D]/15 font-mono text-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Printable Tax Invoice
                  </button>

                  {selectedOrder.order_status !== 'Cancelled' && (
                    <button
                      type="button"
                      onClick={() => setIsRefunding(!isRefunding)}
                      className="px-3 py-2 border border-red-500/40 text-red-300 hover:bg-red-950/40 font-mono text-xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Process Refund
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-[#1a3c2c] text-[#F5F0E5]/60 hover:text-white font-mono text-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="gold-button px-6 py-2 uppercase font-semibold font-mono tracking-wider text-xs"
                  >
                    Save Fulfillment Status
                  </button>
                </div>
              </div>

              {/* Refund confirmation sub-box */}
              {isRefunding && (
                <div className="p-4 border border-red-500/50 bg-red-950/30 space-y-3 mt-3 animate-in fade-in">
                  <div className="text-red-300 font-semibold flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Refund & Stock Reversion Protocol
                  </div>
                  <p className="text-[11px] text-[#F5F0E5]/70">
                    Executing this action will record an official refund in the payment ledger, set order status to Cancelled, and automatically return {selectedOrder.items?.reduce((s, i) => s + i.quantity, 0)} units of flacon inventory back to the vault.
                  </p>
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Reason for refund / cancellation..."
                    className="w-full p-2 bg-[#050d09] border border-red-500/40 text-[#F5F0E5] text-xs outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRefunding(false)}
                      className="px-3 py-1 border border-[#1a3c2c] text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessRefund}
                      className="px-4 py-1 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs font-mono uppercase"
                    >
                      Confirm Full Refund ({formatPrice(selectedOrder.total_amount)})
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {invoiceOrderNumber && (
        <InvoiceModal
          orderNumber={invoiceOrderNumber}
          onClose={() => setInvoiceOrderNumber(null)}
        />
      )}
    </div>
  );
};
