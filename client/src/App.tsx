import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/navbar/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { CartDrawer } from './components/cart/CartDrawer.js';
import { HomePage } from './pages/marketplace/HomePage.js';
import { ProductsPage } from './pages/marketplace/ProductsPage.js';
import { ProductDetailPage } from './pages/marketplace/ProductDetailPage.js';
import { CategoriesPage } from './pages/marketplace/CategoriesPage.js';
import { ShopsPage } from './pages/marketplace/ShopsPage.js';
import { ShopStorefrontPage } from './pages/marketplace/ShopStorefrontPage.js';
import { AccountPage } from './pages/marketplace/AccountPage.js';
import { WishlistPage } from './pages/marketplace/WishlistPage.js';
import { AuthPage } from './pages/marketplace/AuthPage.js';
import { PaymentPage } from './pages/marketplace/PaymentPage.js';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage.js';
import { ExperiencePage } from './pages/marketplace/ExperiencePage.js';
import DemoOne from './components/ui/demo.js';
import MetroHeroDemo from './components/ui/metro-hero-demo.js';
import SlideTabsDemo from './components/ui/slide-tabs-demo.js';
import { BusinessDashboardPage } from './pages/business/BusinessDashboardPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isExperience = location.pathname === '/experience' || location.pathname === '/storefront';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#111827]">
      {!isExperience && <Navbar />}
      <main className={`flex-1 ${isExperience ? 'pt-0' : 'pt-24 sm:pt-28'}`}>
        <Routes>
          {/* Marketplace Core Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/storefront" element={<ExperiencePage />} />
          <Route path="/search" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/shop/:slug" element={<ShopStorefrontPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/ai" element={<Navigate to="/#ai" replace />} />

          {/* Demos */}
          <Route path="/demo" element={<DemoOne />} />
          <Route path="/demo/rail" element={<DemoOne />} />
          <Route path="/demo/video" element={<MetroHeroDemo />} />
          <Route path="/demo/tabs" element={<SlideTabsDemo />} />

          {/* Business / Merchant Routes */}
          <Route path="/business" element={<BusinessDashboardPage />} />
          <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
          <Route path="/business/branches" element={<BusinessDashboardPage />} />
          <Route path="/business/listings" element={<BusinessDashboardPage />} />
          <Route path="/business/orders" element={<BusinessDashboardPage />} />

          {/* Platform Admin */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
