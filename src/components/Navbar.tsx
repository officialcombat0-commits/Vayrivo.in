import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const {
    settings,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    user,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Flacon Collection' },
    { id: 'about', label: 'Our Philosophy' },
    { id: 'contact', label: 'VIP Concierge' },
    { id: 'faq', label: 'Client Care & FAQ' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Luxury Announcement Bar */}
      {settings.announcement_bar && (
        <div className="bg-[#092117] border-b border-[#D8B56D]/20 px-4 py-2 text-center text-[11px] text-[#F1D99B] tracking-widest uppercase flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-[#D8B56D] shrink-0" />
          <span className="font-light">{settings.announcement_bar}</span>
          <Sparkles className="w-3 h-3 text-[#D8B56D] shrink-0 hidden sm:inline" />
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <nav className="glass-panel-dark border-b border-[#D8B56D]/15 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F5F0E5]/80 hover:text-[#D8B56D] transition-colors"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Signature */}
          <div
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center cursor-pointer group text-center"
          >
            <span className="font-brand text-2xl md:text-3xl font-bold tracking-[0.22em] text-[#F5F0E5] group-hover:text-[#F1D99B] transition-colors">
              VAYRIVO
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#D8B56D] -mt-0.5 font-medium">
              Your Scent. Your Signature.
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`text-xs uppercase tracking-[0.16em] transition-all relative py-1 ${
                  currentPage === link.id
                    ? 'text-[#F1D99B] font-medium'
                    : 'text-[#F5F0E5]/80 hover:text-[#D8B56D]'
                }`}
              >
                {link.label}
                {currentPage === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D8B56D]" />
                )}
              </button>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#F5F0E5]/80 hover:text-[#D8B56D] transition-colors"
              title="Search Fragrances"
              aria-label="Search Fragrances"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Link */}
            <button
              onClick={() => onNavigate('account', 'wishlist')}
              className="p-2 text-[#F5F0E5]/80 hover:text-[#D8B56D] transition-colors relative"
              title="Saved Fragrances"
              aria-label="Saved Fragrances"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D8B56D] text-[#050d09] text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account Link */}
            <button
              onClick={() => onNavigate('account')}
              className="p-2 text-[#F5F0E5]/80 hover:text-[#D8B56D] transition-colors flex items-center gap-1.5"
              title="Client Account"
              aria-label="Client Account"
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              {user && (
                <span className="text-[11px] hidden xl:inline text-[#D8B56D] font-medium max-w-[80px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Cart Bag Icon with Live Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#F5F0E5]/80 hover:text-[#D8B56D] transition-colors relative"
              title="Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D8B56D] text-[#050d09] text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard Shortcut */}
            <button
              onClick={() => onNavigate('admin')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider border border-[#D8B56D]/40 text-[#D8B56D] hover:bg-[#D8B56D]/15 transition-all"
              title="Administrative Management Suite"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel-dark border-b border-[#D8B56D]/30 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 text-sm uppercase tracking-widest ${
                  currentPage === link.id
                    ? 'text-[#F1D99B] font-semibold pl-2 border-l-2 border-[#D8B56D]'
                    : 'text-[#F5F0E5]/80 hover:text-[#D8B56D]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#1a3c2c] flex items-center justify-between">
            <button
              onClick={() => {
                onNavigate('account');
                setMobileMenuOpen(false);
              }}
              className="text-xs uppercase tracking-wider text-[#D8B56D] flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              {user ? `Account: ${user.fullName}` : 'Sign In / Register'}
            </button>

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1 text-xs uppercase font-mono tracking-wider border border-[#D8B56D]/40 text-[#D8B56D]"
            >
              Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
