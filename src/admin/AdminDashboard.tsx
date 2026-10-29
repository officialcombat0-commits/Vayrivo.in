import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminFetch, setActiveTab } = useAdmin();
  const { formatPrice } = useStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await adminFetch('/api/admin/metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#D8B56D] font-mono">
        Aggregating boutique performance metrics...
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-12 text-center text-xs text-red-400 font-mono">
        Failed to load administrative analytics.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1a3c2c] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Atelier Executive Overview
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5] mt-0.5">
            Store Performance Dashboard
          </h1>
        </div>
        <div className="text-xs text-[#F5F0E5]/60 font-mono">
          Last Synced: {new Date().toLocaleTimeString('en-IN')} IST
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 border border-[#1a3c2c] bg-[#092117]/50 space-y-2">
          <div className="flex items-center justify-between text-[#D8B56D]">
            <span className="text-[11px] uppercase tracking-wider font-mono">Total Sales Volume</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F1D99B]">
            {formatPrice(metrics.totalSales)}
          </div>
          <div className="text-[10px] text-[#F5F0E5]/50 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Today&apos;s Revenue: {formatPrice(metrics.todaySales || 0)}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 border border-[#1a3c2c] bg-[#092117]/50 space-y-2">
          <div className="flex items-center justify-between text-[#D8B56D]">
            <span className="text-[11px] uppercase tracking-wider font-mono">Customer Orders</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F5F0E5]">
            {metrics.totalOrders}
          </div>
          <div className="text-[10px] text-[#F5F0E5]/50">
            {metrics.todayOrderCount || 0} commissions received today
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 border border-[#1a3c2c] bg-[#092117]/50 space-y-2">
          <div className="flex items-center justify-between text-[#D8B56D]">
            <span className="text-[11px] uppercase tracking-wider font-mono">Patron Accounts</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F5F0E5]">
            {metrics.totalCustomers}
          </div>
          <div className="text-[10px] text-[#F5F0E5]/50">
            Registered collectors & buyers
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`p-5 border space-y-2 ${metrics.lowStockCount > 0 ? 'border-amber-600/60 bg-amber-950/20' : 'border-[#1a3c2c] bg-[#092117]/50'}`}>
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] uppercase tracking-wider font-mono">Vault Alerts</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {metrics.lowStockCount} Flacons
          </div>
          <div className="text-[10px] text-[#F5F0E5]/50">
            {metrics.lowStockCount > 0 ? 'Replenishment recommended' : 'Vault stock levels healthy'}
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-4">
        <h2 className="font-serif-luxury text-xl text-[#F5F0E5] border-b border-[#1a3c2c] pb-3">
          Order Status Pipeline
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => {
            const found = metrics.ordersByStatus?.find((s: any) => s.order_status === status);
            const count = found ? found.count : 0;
            return (
              <div
                key={status}
                onClick={() => setActiveTab('orders')}
                className="p-3 border border-[#1a3c2c] bg-[#050d09] hover:border-[#D8B56D]/60 cursor-pointer transition-all space-y-1"
              >
                <div className="text-[10px] uppercase text-[#F5F0E5]/60">{status}</div>
                <div className="text-lg font-bold text-[#F1D99B]">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#1a3c2c] pb-3">
          <h2 className="font-serif-luxury text-xl text-[#F5F0E5]">
            Recent Commissions
          </h2>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs uppercase tracking-wider text-[#D8B56D] hover:underline flex items-center gap-1 font-mono"
          >
            Manage All Orders <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Order Ref</th>
                <th className="py-2.5 px-3">Patron Name</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]/60">
              {metrics.recentOrders?.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-[#092117]/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#F1D99B]">
                    {ord.order_number}
                  </td>
                  <td className="py-3 px-3 text-[#F5F0E5]">
                    {ord.customer_name}
                  </td>
                  <td className="py-3 px-3 text-[#F5F0E5]/60 font-mono text-[11px]">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#F5F0E5] text-right">
                    {formatPrice(ord.total_amount)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-[#1a3c2c] text-[#D8B56D] border border-[#D8B56D]/30">
                      {ord.order_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[10px] uppercase">
                    <span className={ord.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                      {ord.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
