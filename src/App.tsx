import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminProvider } from './context/AdminContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { Toast } from './components/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin
import { AdminLayout } from './admin/AdminLayout';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string | undefined>(undefined);

  // Read URL hash on load (e.g. #/shop, #/product/noir-crown, #/admin)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setCurrentPage('home');
        setPageParam(undefined);
        return;
      }

      const parts = hash.split('/');
      const page = parts[0];
      const param = parts[1];

      if (page === 'admin') {
        setCurrentPage('admin');
      } else if (page === 'shop') {
        setCurrentPage('shop');
        setPageParam(param);
      } else if (page === 'product') {
        setCurrentPage('product');
        setPageParam(param);
      } else if (page === 'order-confirmation') {
        setCurrentPage('order-confirmation');
        setPageParam(param);
      } else if (['cart', 'checkout', 'account', 'about', 'contact', 'faq', 'policies'].includes(page)) {
        setCurrentPage(page);
        setPageParam(param);
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    setPageParam(param);

    if (page === 'home') {
      window.location.hash = '';
    } else if (param) {
      window.location.hash = `/${page}/${param}`;
    } else {
      window.location.hash = `/${page}`;
    }
  };

  // If in Admin Mode, render the full admin application
  if (currentPage === 'admin') {
    return <AdminLayout onBackToStore={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#050d09] text-[#F5F0E5] flex flex-col font-sans selection:bg-[#D8B56D]/30 selection:text-[#F1D99B]">
      {/* Global Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page, param) => navigateTo(page, param)}
      />

      {/* Main Page View */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={(page, param) => navigateTo(page, param)}
            onSelectProduct={(slug) => navigateTo('product', slug)}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            initialCategory={pageParam}
            onSelectProduct={(slug) => navigateTo('product', slug)}
          />
        )}

        {currentPage === 'product' && pageParam && (
          <ProductDetailPage
            slug={pageParam}
            onNavigate={(page, param) => navigateTo(page, param)}
            onSelectProduct={(slug) => navigateTo('product', slug)}
            onBuyNow={() => navigateTo('checkout')}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            onNavigate={(page, param) => navigateTo(page, param)}
            onProceedToCheckout={() => navigateTo('checkout')}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onNavigate={(page, param) => navigateTo(page, param)}
            onOrderSuccess={(orderNumber) => navigateTo('order-confirmation', orderNumber)}
          />
        )}

        {currentPage === 'order-confirmation' && pageParam && (
          <OrderConfirmationPage
            orderNumber={pageParam}
            onNavigate={(page, param) => navigateTo(page, param)}
          />
        )}

        {currentPage === 'account' && (
          <AccountPage
            initialTab={pageParam || 'orders'}
            onNavigate={(page, param) => navigateTo(page, param)}
            onSelectProduct={(slug) => navigateTo('product', slug)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={(page, param) => navigateTo(page, param)} />
        )}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'faq' && <FAQPage />}

        {currentPage === 'policies' && (
          <PoliciesPage initialTab={pageParam || 'privacy'} />
        )}

        {currentPage === 'not-found' && (
          <NotFoundPage onNavigate={(page) => navigateTo(page)} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={(page, param) => navigateTo(page, param)} />

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => navigateTo('checkout')}
        onViewShop={() => navigateTo('shop')}
      />

      {/* Global Olfactory Search Modal */}
      <SearchModal onSelectProduct={(slug) => navigateTo('product', slug)} />

      {/* Notification Toast */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </StoreProvider>
  );
}
