import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/navbar/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { CartDrawer } from './components/cart/CartDrawer.js';
import { HomePage } from './pages/marketplace/HomePage.js';
import { ProductsPage } from './pages/marketplace/ProductsPage.js';
import { ShopStorefrontPage } from './pages/marketplace/ShopStorefrontPage.js';
import { VoiceKhataPage } from './pages/business/VoiceKhataPage.js';
import { LedgerTransactionsPage } from './pages/business/LedgerTransactionsPage.js';
import { BusinessDashboardPage } from './pages/business/BusinessDashboardPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import DemoOne from './components/ui/demo.js';
import MetroHeroDemo from './components/ui/metro-hero-demo.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Marketplace Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/demo" element={<DemoOne />} />
                <Route path="/demo/rail" element={<DemoOne />} />
                <Route path="/demo/video" element={<MetroHeroDemo />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/shop/:slug" element={<ShopStorefrontPage />} />
                <Route path="/ai" element={<HomePage />} />

                {/* Business & Voice Khata Routes */}
                <Route path="/business" element={<BusinessDashboardPage />} />
                <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
                <Route path="/business/branches" element={<BusinessDashboardPage />} />
                <Route path="/business/listings" element={<BusinessDashboardPage />} />
                <Route path="/business/orders" element={<BusinessDashboardPage />} />
                <Route path="/business/voice-khata" element={<VoiceKhataPage />} />
                <Route path="/business/voice-khata/ledger" element={<LedgerTransactionsPage />} />

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
