import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';
import { Save, Download, Mail, Bell, Settings, MapPin, ShieldCheck, Key, UserCheck, Check, AlertCircle } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const { adminFetch, adminUser } = useAdmin();
  const { showToast, refreshProducts } = useStore();
  const [settings, setSettings] = useState<any>({});
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin credentials update state
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credConfirm, setCredConfirm] = useState('');
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [credMessage, setCredMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resSet, resSub] = await Promise.all([
          adminFetch('/api/admin/settings'),
          adminFetch('/api/admin/subscribers'),
        ]);

        if (resSet.ok) {
          const setData = await resSet.json();
          setSettings(setData);
        }
        if (resSub.ok) {
          const subData = await resSub.json();
          setSubscribers(subData);
        }
      } catch (err) {
        console.error('Failed to load admin content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showToast('Store settings and commerce rules saved successfully', 'success');
        refreshProducts();
      } else {
        showToast('Failed to update settings', 'error');
      }
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    if (!credEmail && !credPassword) {
      setCredMessage({ text: 'Please provide either a new email or password to update.', type: 'error' });
      return;
    }

    if (credPassword && credPassword !== credConfirm) {
      setCredMessage({ text: 'Passwords do not match. Please verify.', type: 'error' });
      return;
    }

    if (credPassword && credPassword.length < 6) {
      setCredMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setUpdatingCreds(true);
    try {
      const res = await adminFetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: credEmail ? credEmail.trim() : undefined,
          newPassword: credPassword ? credPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCredMessage({ text: data.message || 'Administrative credentials successfully updated!', type: 'success' });
        showToast('Admin email/password updated', 'success');
        setCredEmail('');
        setCredPassword('');
        setCredConfirm('');
      } else {
        setCredMessage({ text: data.error || 'Failed to update credentials.', type: 'error' });
      }
    } catch {
      setCredMessage({ text: 'Network error updating credentials.', type: 'error' });
    } finally {
      setUpdatingCreds(false);
    }
  };

  const handleExportSubscribers = () => {
    if (subscribers.length === 0) return;
    const headers = ['Subscriber ID', 'Email Address', 'Source', 'Subscribed At'];
    const rows = subscribers.map((s) => [s.id, s.email, s.source, s.subscribed_at]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vayrivo_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers exported to CSV', 'success');
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-[#D8B56D]">
        Loading boutique settings & commerce configuration...
      </div>
    );
  }

  const isShippingEnabled = settings.standard_shipping_enabled === 'true';
  const isCodEnabled = settings.cod_available !== 'false';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#1a3c2c] pb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono">
          Content & Boutique Configuration
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F0E5]">
          Store Settings, Shipping & Taxes
        </h1>
        <p className="text-xs text-[#F5F0E5]/60 mt-1 font-light">
          Configure Free Shipping, Standard Courier Fee, GST Rate %, Cash on Delivery, Announcement Bar, and Admin Credentials.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Announcement Bar & Store Header */}
        <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-4">
          <h2 className="font-serif-luxury text-xl text-[#F1D99B] border-b border-[#1a3c2c] pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#D8B56D]" /> Announcement Bar & Promotional Headline
          </h2>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block font-mono">Top Announcement Banner Text</label>
              <input
                type="text"
                value={settings.announcement_bar || ''}
                onChange={(e) => setSettings({ ...settings, announcement_bar: e.target.value })}
                placeholder="Complimentary Luxury Miniature (10ml) with every 100ml bottle | Free Insured Shipping Across India on orders above ₹2,000"
                className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
              />
              <span className="text-[10px] text-[#F5F0E5]/50">
                Displays globally at the very top of all customer-facing storefront pages.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Indian E-Commerce Shipping & Taxes Configuration */}
        <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-6">
          <div className="border-b border-[#1a3c2c] pb-3">
            <h2 className="font-serif-luxury text-xl text-[#F1D99B] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#D8B56D]" /> Shipping Thresholds, Courier Rules & GST
            </h2>
            <p className="text-[11px] text-[#F5F0E5]/60 mt-1">
              Changes saved here instantly update live customer cart calculations, checkout totals, and server-verified orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {/* Free Shipping Threshold */}
            <div className="space-y-2 p-4 bg-[#050d09] border border-[#1a3c2c]">
              <label className="text-[#F1D99B] font-semibold block font-mono text-[11px] uppercase tracking-wide">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={settings.free_shipping_threshold || '2000'}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                className="w-full p-2.5 bg-[#092117] border border-[#1a3c2c] text-[#F5F0E5] font-mono text-sm font-bold outline-none focus:border-[#D8B56D]"
              />
              <span className="text-[10px] text-[#F5F0E5]/50 block leading-relaxed">
                Orders with cart subtotal ≥ ₹{Number(settings.free_shipping_threshold || 2000).toLocaleString('en-IN')} automatically qualify for complimentary shipping.
              </span>
            </div>

            {/* Standard Courier Delivery Fee Mode */}
            <div className="space-y-2 p-4 bg-[#050d09] border border-[#1a3c2c]">
              <label className="text-[#F1D99B] font-semibold block font-mono text-[11px] uppercase tracking-wide">
                Standard Courier Fee Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, standard_shipping_enabled: isShippingEnabled ? 'false' : 'true' })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isShippingEnabled ? 'bg-[#D8B56D]' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-[#050d09] transition-transform ${
                      isShippingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-mono font-medium text-[#F5F0E5]">
                  {isShippingEnabled ? (
                    <span className="text-[#D8B56D]">Enabled (Charge below threshold)</span>
                  ) : (
                    <span className="text-emerald-400">Optional / Free on All Orders</span>
                  )}
                </span>
              </div>
              <span className="text-[10px] text-[#F5F0E5]/50 block leading-relaxed pt-1">
                When Optional (Disabled), shipping is ₹0 for all orders. When Enabled, standard fee applies below ₹{settings.free_shipping_threshold || '2000'}.
              </span>
            </div>

            {/* Standard Courier Delivery Fee Amount */}
            <div className="space-y-2 p-4 bg-[#050d09] border border-[#1a3c2c]">
              <label className="text-[#F1D99B] font-semibold block font-mono text-[11px] uppercase tracking-wide">
                Standard Courier Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                disabled={!isShippingEnabled}
                value={settings.shipping_fee || '0'}
                onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
                className={`w-full p-2.5 bg-[#092117] border border-[#1a3c2c] text-[#F5F0E5] font-mono text-sm font-bold outline-none focus:border-[#D8B56D] ${
                  !isShippingEnabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
              <span className="text-[10px] text-[#F5F0E5]/50 block leading-relaxed">
                Applied only when Courier Fee Status is Enabled and cart is below threshold.
              </span>
            </div>

            {/* GST Rate Percentage */}
            <div className="space-y-2 p-4 bg-[#050d09] border border-[#1a3c2c]">
              <label className="text-[#F1D99B] font-semibold block font-mono text-[11px] uppercase tracking-wide">
                GST Rate % (HSN 33030010)
              </label>
              <input
                type="number"
                min="0"
                max="28"
                step="0.5"
                value={settings.tax_rate_percent || '1'}
                onChange={(e) => setSettings({ ...settings, tax_rate_percent: e.target.value })}
                className="w-full p-2.5 bg-[#092117] border border-[#1a3c2c] text-[#F5F0E5] font-mono text-sm font-bold outline-none focus:border-[#D8B56D]"
              />
              <span className="text-[10px] text-[#F5F0E5]/50 block leading-relaxed">
                Currently set to {settings.tax_rate_percent || '1'}%. Included in product prices and printed on official invoices.
              </span>
            </div>

            {/* Cash on Delivery Status */}
            <div className="space-y-2 p-4 bg-[#050d09] border border-[#1a3c2c]">
              <label className="text-[#F1D99B] font-semibold block font-mono text-[11px] uppercase tracking-wide">
                Cash on Delivery (COD) Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, cod_available: isCodEnabled ? 'false' : 'true' })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isCodEnabled ? 'bg-[#D8B56D]' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-[#050d09] transition-transform ${
                      isCodEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-mono font-medium text-[#F5F0E5]">
                  {isCodEnabled ? <span className="text-emerald-400">Available at Checkout</span> : <span className="text-red-400">Disabled</span>}
                </span>
              </div>
              <span className="text-[10px] text-[#F5F0E5]/50 block leading-relaxed pt-1">
                Toggle Cash on Delivery payment option for customer checkout.
              </span>
            </div>

            {/* Cash on Delivery Surcharge */}
            <div className="space-y-2 p-4 bg-[#050d09] border border-[#1a3c2c]">
              <label className="text-[#F1D99B] font-semibold block font-mono text-[11px] uppercase tracking-wide">
                COD Handling Surcharge (₹)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                disabled={!isCodEnabled}
                value={settings.cod_fee || '50'}
                onChange={(e) => setSettings({ ...settings, cod_fee: e.target.value })}
                className={`w-full p-2.5 bg-[#092117] border border-[#1a3c2c] text-[#F5F0E5] font-mono text-sm font-bold outline-none focus:border-[#D8B56D] ${
                  !isCodEnabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
              <span className="text-[10px] text-[#F5F0E5]/50 block leading-relaxed">
                Carrier cash collection surcharge added when COD is selected (e.g. ₹50 or ₹0).
              </span>
            </div>
          </div>
        </div>

        {/* 3. Flagship Coordinates & Concierge Support */}
        <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-4">
          <h2 className="font-serif-luxury text-xl text-[#F1D99B] border-b border-[#1a3c2c] pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D8B56D]" /> Boutique Coordinates & Support
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block font-mono">Flagship Boutique Address</label>
              <input
                type="text"
                value={settings.boutique_address || ''}
                onChange={(e) => setSettings({ ...settings, boutique_address: e.target.value })}
                className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block font-mono">Client Concierge Email</label>
              <input
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[#F5F0E5]/70 block font-mono">Concierge Telephone / WhatsApp Line</label>
              <input
                type="text"
                value={settings.support_phone || ''}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
              />
            </div>
          </div>
        </div>

        {/* Save CTA for Store Configuration */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="gold-button px-8 py-3 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 shadow-xl"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Persisting Changes...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>

      {/* 4. Administrative Security & Credentials Management */}
      <div className="glass-panel-dark border border-[#D8B56D]/40 p-6 space-y-6">
        <div className="border-b border-[#1a3c2c] pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-serif-luxury text-xl text-[#F1D99B] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#D8B56D]" /> Admin Portal Credentials & Security
            </h2>
            <p className="text-xs text-[#F5F0E5]/60 mt-0.5">
              Change your administrative portal login Gmail or password anytime directly from this portal.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#092117] border border-[#D8B56D]/30 px-3 py-1.5 text-xs font-mono text-[#D8B56D]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Owner: Sandeep Kumar</span>
          </div>
        </div>

        {/* Key Roles Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#050d09] border border-[#1a3c2c]">
            <div className="text-[10px] uppercase text-[#D8B56D]">Owner / Super Admin</div>
            <div className="text-[#F5F0E5] font-sans font-semibold mt-0.5">Sandeep Kumar</div>
            <div className="text-[#F1D99B] text-[11px] truncate">vayrivo360@gmail.com</div>
          </div>
          <div className="p-3 bg-[#050d09] border border-[#1a3c2c]">
            <div className="text-[10px] uppercase text-[#D8B56D]">Store Manager 1</div>
            <div className="text-[#F5F0E5] font-sans font-semibold mt-0.5">Ashkand Yadav</div>
            <div className="text-[#F5F0E5]/70 text-[11px] truncate">manager@vayrivo.com</div>
          </div>
          <div className="p-3 bg-[#050d09] border border-[#1a3c2c]">
            <div className="text-[10px] uppercase text-[#D8B56D]">Store Manager 2</div>
            <div className="text-[#F5F0E5] font-sans font-semibold mt-0.5">Surya Kumar</div>
            <div className="text-[#F5F0E5]/70 text-[11px] truncate">surya@vayrivo.com</div>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleUpdateCredentials} className="space-y-4 pt-2">
          {credMessage && (
            <div
              className={`p-3 border text-xs flex items-center gap-2 ${
                credMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/50 text-red-200'
              }`}
            >
              {credMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{credMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block">New Admin Gmail / Email</label>
              <input
                type="email"
                value={credEmail}
                onChange={(e) => setCredEmail(e.target.value)}
                placeholder="vayrivo360@gmail.com"
                className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block">New Password</label>
              <input
                type="password"
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block">Confirm New Password</label>
              <input
                type="password"
                value={credConfirm}
                onChange={(e) => setCredConfirm(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] outline-none focus:border-[#D8B56D]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updatingCreds}
              className="gold-button-outline px-6 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{updatingCreds ? 'Updating...' : 'Update Admin Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. Newsletter Subscribers Section */}
      <div className="glass-panel-dark border border-[#1a3c2c] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1a3c2c] pb-3">
          <div>
            <h2 className="font-serif-luxury text-xl text-[#F5F0E5]">
              Newsletter Subscribers & Salon Members ({subscribers.length})
            </h2>
            <p className="text-xs text-[#F5F0E5]/60">
              Patrons who subscribed through the footer form or discovery popover.
            </p>
          </div>

          <button
            onClick={handleExportSubscribers}
            className="gold-button-outline px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono"
          >
            <Download className="w-3.5 h-3.5" /> Export Subscribers CSV
          </button>
        </div>

        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1a3c2c] text-[#D8B56D] font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Subscriber Email</th>
                <th className="py-2.5 px-3">Origin / Form</th>
                <th className="py-2.5 px-3 text-right">Subscription Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3c2c]">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-xs text-[#F5F0E5]/50 font-light">
                    No newsletter subscriptions recorded yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#092117]/30 text-[11px]">
                    <td className="py-2.5 px-3 font-mono text-[#F1D99B]">{s.email}</td>
                    <td className="py-2.5 px-3 text-[#F5F0E5]/70 font-mono text-[10px] uppercase">{s.source}</td>
                    <td className="py-2.5 px-3 text-[#F5F0E5]/50 font-mono text-right">
                      {new Date(s.subscribed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
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
