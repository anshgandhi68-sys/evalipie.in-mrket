import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage.js';
import { BusinessDashboardPage } from './pages/business/BusinessDashboardPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import DemoOne from './components/ui/demo.js';
import MetroHeroDemo from './components/ui/metro-hero-demo.js';
import SlideTabsDemo from './components/ui/slide-tabs-demo.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Marketplace Core Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<ProductsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/shops" element={<ShopsPage />} />
                <Route path="/shop/:slug" element={<ShopStorefrontPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/ai" element={<HomePage />} />

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
            </div>
            <Footer />
            <CartDrawer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
