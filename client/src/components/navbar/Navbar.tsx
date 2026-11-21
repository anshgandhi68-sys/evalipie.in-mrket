import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { Heart, User, Shield, LogOut, ChevronDown, ShoppingBag } from 'lucide-react';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.js';
import { AuthModal } from '../auth/AuthModal.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { user, isAuthenticated, isAdmin, signOut, openAuthModal, wishlistCount } = useAuth();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/' || location.pathname === '/marketplace') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Flagship Announcement Bar */}
        <div className="bg-[#105B55] text-white py-1.5 px-4 text-center text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-2 sm:gap-3">
          <span>Free Pan-India Delivery on Orders Above ₹999</span>
          <span className="opacity-40">•</span>
          <span>Live Razorpay UPI QR Payments</span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">180 Verified Database Products</span>
          <span className="opacity-40 hidden md:inline">•</span>
          <Link to="/experience" className="hidden md:inline text-emerald-200 hover:text-white underline ml-1">
            Experience 3D Storefront
          </Link>
        </div>

        {/* Sticky Header */}
        <header className="flex items-center justify-between px-4 sm:px-8 md:px-10 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-[#E5EAF0]">
          
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/assets/evalipie-logo.png" 
              alt="Evalipie.in" 
              className="h-8 sm:h-9 w-auto rounded-lg shadow-xs hover:opacity-95 transition-opacity" 
            />
          </Link>

          {/* Center/Right Nav Links */}
          <nav className="flex items-center gap-3 sm:gap-5 lg:gap-6 text-xs sm:text-sm font-semibold text-[#687385]">
            <Link 
              to="/products"
              className="hover:text-[#167D73] transition-colors cursor-pointer"
            >
              All Products
            </Link>

            <a 
              href="#ai" 
              onClick={(e) => handleScrollTo('ai', e)}
              className="hover:text-[#167D73] transition-colors cursor-pointer"
            >
              Evalipie AI
            </a>

            <Link 
              to="/categories" 
              className="hover:text-[#167D73] transition-colors cursor-pointer"
            >
              Categories
            </Link>

            <a 
              href="#trend" 
              onClick={(e) => handleScrollTo('trend', e)}
              className="hover:text-[#167D73] transition-colors cursor-pointer hidden md:inline-block"
            >
              Deals & Trending
            </a>

            {/* Admin Direct Pill if user is Admin */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-md text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}

            {/* Wishlist Link with Live Counter */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 hover:text-[#167D73] transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#167D73] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account / Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-gray-200 hover:border-gray-300 text-xs font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#105B55] text-white flex items-center justify-center text-[11px] font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                    {user?.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
                    <div className="px-3.5 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      My Account & Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3.5 py-2 text-xs font-medium text-teal-700 hover:bg-gray-50"
                      >
                        Platform Administration
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                type="button" 
                className="btn btn-outline text-xs px-3.5 py-1.5 cursor-pointer font-bold rounded-lg border border-[#E5EAF0] text-[#111827] hover:bg-[#F7F9FC]"
                onClick={() => openAuthModal('signin')}
              >
                Sign In
              </button>
            )}

            {/* Cart Drawer Toggle Button with Live Item Badge */}
            <button 
              type="button" 
              className="btn btn-primary cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#111827] text-white hover:bg-[#105B55] transition shadow-xs"
              onClick={openCart}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#167D73] text-white text-[10px] font-bold">
                {totalCount}
              </span>
            </button>
          </nav>
        </header>
      </div>

      {/* Global Modals */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
      <AuthModal />
    </>
  );
};

export default Navbar;
