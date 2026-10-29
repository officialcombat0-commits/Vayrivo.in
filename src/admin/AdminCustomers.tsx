import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import { Search, Download, Users, Mail, Phone, ShoppingBag, Shield } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { adminFetch } = useAdmin();
  const { formatPrice, showToast } = useStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await adminFetch('/api/admin/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'Registered Date', 'Total Orders', 'Lifetime Spend (INR)'];
    const rows = customers.map((c) => [
      c.id,
      `"${c.full_name}"`,
      c.email,
      c.phone || '',
      c.created_at,
      c.total_orders,
      c.total_spent,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vayrivo_patrons_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Patron directory exported to CSV', 'success');
  };

  const filtered = customers.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1a3c2c] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
            Client Directory
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
            Registered Patrons & Collectors ({customers.length})
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#D8B56D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patron name, email..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#050d09] border border-[#1a3c2c] text-xs text-[#F5F0E5] outline-none font-mono"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="gold-button-outline px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel-dark border border-[#1a3c2c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider bg-[#092117]/60">
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-4">Contact Coordinates</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-[#D8B56D] font-mono">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-[#F5F0E5]/50 font-light">
                    No patron accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#092117]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-sm text-[#F5F0E5]">{c.full_name}</div>
                      <div className="text-[10px] text-[#D8B56D] font-mono">{c.id}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] space-y-0.5">
                      <div className="text-[#F5F0E5]/80">{c.email}</div>
                      <div className="text-[#F5F0E5]/50">{c.phone || 'No phone on file'}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#F5F0E5]/60 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-sm text-[#F5F0E5]">
                      {c.total_orders}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#F1D99B]">
                      {formatPrice(c.total_spent)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
