import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminInventory } from './AdminInventory';
import { AdminCustomers } from './AdminCustomers';
import { AdminCoupons } from './AdminCoupons';
import { AdminContent } from './AdminContent';
import { AdminAuditLogs } from './AdminAuditLogs';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Users,
  Tag,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const {
    adminUser,
    isAuthenticated,
    activeTab,
    setActiveTab,
    adminLogout,
    switchDemoRole,
  } = useAdmin();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated, render Admin Login screen
  if (!isAuthenticated || !adminUser) {
    return <AdminLogin onBackToStore={onBackToStore} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Performance Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Flacons & Formulations', icon: Package },
    { id: 'orders', label: 'Commissions & Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Vault Inventory & Stock', icon: Layers },
    { id: 'customers', label: 'Patron Directory', icon: Users },
    { id: 'coupons', label: 'Privilege Codes & Offers', icon: Tag },
    { id: 'content', label: 'Settings & Content', icon: Settings },
    { id: 'audit', label: 'Security & Audit Logs', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#050d09] text-[#F5F0E5] flex flex-col lg:flex-row antialiased">
      {/* Mobile Header Bar */}
      <div className="lg:hidden p-4 border-b border-[#1a3c2c] bg-[#092117] flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-[#F5F0E5]/80 hover:text-[#D8B56D]"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-brand text-lg font-bold tracking-widest text-[#F1D99B]">
          VAYRIVO ADMIN
        </span>
        <button
          onClick={onBackToStore}
          className="text-xs uppercase font-mono text-[#D8B56D]"
        >
          Store
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-72 bg-[#092117] border-r border-[#1a3c2c] flex flex-col justify-between p-6 shrink-0 z-30 transition-all duration-300 ${
          sidebarOpen ? 'fixed inset-y-0 left-0 shadow-2xl block' : 'hidden lg:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo in Admin */}
          <div className="space-y-1 pb-4 border-b border-[#1a3c2c]">
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#D8B56D] font-mono block">
              Atelier Control Center
            </span>
            <div className="font-brand text-2xl font-bold tracking-[0.2em] text-[#F5F0E5]">
              VAYRIVO
            </div>
          </div>

          {/* Role Badge and Quick Tester Switcher */}
          <div className="p-3 border border-[#D8B56D]/30 bg-[#050d09]/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-[#F5F0E5]/60">Active Role:</span>
              <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold bg-[#D8B56D] text-[#050d09]">
                {adminUser.role === 'owner' ? 'Owner / Admin' : adminUser.role === 'manager' ? 'Store Manager' : 'Order Staff'}
              </span>
            </div>
            <div className="text-[11px] text-[#F5F0E5] font-semibold truncate">
              {adminUser.fullName}
            </div>
            {/* Quick Role Switcher Buttons */}
            <div className="pt-2 border-t border-[#1a3c2c] flex items-center justify-between text-[9px] font-mono text-[#D8B56D]">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Test Role:
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => switchDemoRole('owner')}
                  className={`px-1.5 py-0.5 border ${adminUser.role === 'owner' ? 'border-[#D8B56D] text-[#F1D99B] font-bold' : 'border-[#1a3c2c] text-[#F5F0E5]/50'}`}
                  title="Owner: Sandeep Kumar"
                >
                  Sandeep
                </button>
                <button
                  onClick={() => switchDemoRole('manager-ashkand')}
                  className={`px-1.5 py-0.5 border ${adminUser.email?.includes('manager') || adminUser.email?.includes('ashkand') ? 'border-[#D8B56D] text-[#F1D99B] font-bold' : 'border-[#1a3c2c] text-[#F5F0E5]/50'}`}
                  title="Manager: Ashkand Yadav"
                >
                  Ashkand
                </button>
                <button
                  onClick={() => switchDemoRole('manager-surya')}
                  className={`px-1.5 py-0.5 border ${adminUser.email?.includes('surya') ? 'border-[#D8B56D] text-[#F1D99B] font-bold' : 'border-[#1a3c2c] text-[#F5F0E5]/50'}`}
                  title="Manager: Surya Kumar"
                >
                  Surya
                </button>
                <button
                  onClick={() => switchDemoRole('staff')}
                  className={`px-1.5 py-0.5 border ${adminUser.role === 'staff' ? 'border-[#D8B56D] text-[#F1D99B] font-bold' : 'border-[#1a3c2c] text-[#F5F0E5]/50'}`}
                  title="Staff: Rohan Kapoor"
                >
                  Staff
                </button>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1 text-xs font-sans">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left ${
                    isActive
                      ? 'bg-[#D8B56D] text-[#050d09] font-semibold shadow-md'
                      : 'text-[#F5F0E5]/75 hover:bg-[#050d09]/50 hover:text-[#D8B56D]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#050d09]' : 'text-[#D8B56D]'}`} />
                  <span className="text-xs tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-[#1a3c2c] space-y-3">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-between px-3 py-2 text-xs border border-[#1a3c2c] text-[#F5F0E5]/80 hover:text-[#D8B56D] hover:border-[#D8B56D]/40 font-mono transition-colors"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={adminLogout}
            className="w-full flex items-center justify-between px-3 py-2 text-xs border border-red-900/40 text-red-300 hover:bg-red-950/30 font-mono transition-colors"
          >
            <span>Sign Out Admin</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'inventory' && <AdminInventory />}
        {activeTab === 'customers' && <AdminCustomers />}
        {activeTab === 'coupons' && <AdminCoupons />}
        {activeTab === 'content' && <AdminContent />}
        {activeTab === 'audit' && <AdminAuditLogs />}
      </main>
    </div>
  );
};
