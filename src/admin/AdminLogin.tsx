import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Shield, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { adminLogin, switchDemoRole } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to authenticate administrative access.');
    }
  };

  const handleQuickRole = async (role: 'owner' | 'manager-ashkand' | 'manager-surya' | 'manager' | 'staff') => {
    setError('');
    setLoading(true);
    await switchDemoRole(role);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050d09] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-none border border-[#D8B56D] bg-[#092117] flex items-center justify-center text-[#D8B56D]">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8B56D] font-mono block">
            Administrative Sovereign Suite
          </span>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-[#F5F0E5]">
            VAYRIVO Atelier Admin
          </h1>
          <p className="text-xs text-[#F5F0E5]/60 font-light">
            Role-Based Access Control (RBAC) • Enterprise Security
          </p>
        </div>

        {/* 1-Click Role Switcher for instant testing */}
        <div className="p-4 border border-[#D8B56D]/40 bg-[#092117] space-y-3 text-xs">
          <div className="flex items-center justify-between text-[#F1D99B]">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D8B56D]" /> 1-Click Role Access (Testing)
            </span>
            <span className="text-[10px] uppercase font-mono text-[#D8B56D]">Authorized</span>
          </div>
          <p className="text-[#F5F0E5]/70 text-[11px] font-light">
            Select a verified role to inspect specific permissions:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickRole('owner')}
              disabled={loading}
              className="p-2 border border-[#D8B56D]/60 bg-[#050d09] hover:bg-[#D8B56D]/20 text-[#F1D99B] text-left font-mono text-[10px] transition-all"
            >
              <div className="font-bold uppercase text-[#D8B56D]">Owner / Admin</div>
              <div className="text-white font-sans text-xs font-semibold">Sandeep Kumar</div>
              <div className="text-[9px] text-[#F5F0E5]/50 truncate">vayrivo360@gmail.com</div>
            </button>

            <button
              onClick={() => handleQuickRole('manager-ashkand')}
              disabled={loading}
              className="p-2 border border-[#1a3c2c] bg-[#050d09] hover:bg-[#D8B56D]/20 text-[#F5F0E5] text-left font-mono text-[10px] transition-all"
            >
              <div className="font-bold uppercase text-[#F1D99B]">Store Manager</div>
              <div className="text-white font-sans text-xs font-semibold">Ashkand Yadav</div>
              <div className="text-[9px] text-[#F5F0E5]/50 truncate">manager@vayrivo.com</div>
            </button>

            <button
              onClick={() => handleQuickRole('manager-surya')}
              disabled={loading}
              className="p-2 border border-[#1a3c2c] bg-[#050d09] hover:bg-[#D8B56D]/20 text-[#F5F0E5] text-left font-mono text-[10px] transition-all"
            >
              <div className="font-bold uppercase text-[#F1D99B]">Store Manager</div>
              <div className="text-white font-sans text-xs font-semibold">Surya Kumar</div>
              <div className="text-[9px] text-[#F5F0E5]/50 truncate">surya@vayrivo.com</div>
            </button>

            <button
              onClick={() => handleQuickRole('staff')}
              disabled={loading}
              className="p-2 border border-[#1a3c2c] bg-[#050d09] hover:bg-[#D8B56D]/20 text-[#F5F0E5] text-left font-mono text-[10px] transition-all"
            >
              <div className="font-bold uppercase text-[#F5F0E5]/70">Order Staff</div>
              <div className="text-white font-sans text-xs font-semibold">Rohan Kapoor</div>
              <div className="text-[9px] text-[#F5F0E5]/50 truncate">staff@vayrivo.com</div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="glass-panel-dark border border-[#1a3c2c] p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block font-mono">Administrative Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D8B56D] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vayrivo360@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none focus:border-[#D8B56D]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[#F5F0E5]/70 block font-mono">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D8B56D] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#050d09] border border-[#1a3c2c] text-[#F5F0E5] font-mono outline-none focus:border-[#D8B56D]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-button py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In To Control Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onBackToStore}
              className="text-xs text-[#D8B56D]/80 hover:text-[#F1D99B] font-mono uppercase tracking-wider"
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
