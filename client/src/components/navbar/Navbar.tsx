import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { Heart, User, Shield, LogOut, ChevronDown, ShoppingBag, Play, FolderGit2, Cpu } from 'lucide-react';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.js';
import { AuthModal } from '../auth/AuthModal.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { user, isAuthenticated, isAdmin, signOut, openAuthModal, wishlistCount } = useAuth();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Flagship Announcement Bar */}
        <div className="bg-[#105B55] text-white py-1.5 px-4 text-center text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-2 sm:gap-3">
          <span className="font-bold flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-300" />
            Evalipie AI Software Auditor
          </span>
          <span className="opacity-40">•</span>
          <span className="italic hidden sm:inline">"Your project makes claims. Evalipie tries to break them."</span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <Link to="/evaluate" className="text-emerald-200 hover:text-white underline font-semibold">
            Evaluate Repository
          </Link>
          <span className="opacity-40 hidden md:inline">•</span>
          <Link to="/marketplace" className="hidden md:inline text-white/80 hover:text-white">
            Marketplace & Storefront (180 Products)
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
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-[#687385]">
            <Link 
              to="/evaluate"
              className="hover:text-[#105B55] transition-colors cursor-pointer flex items-center gap-1.5 text-[#111827] font-bold"
            >
              <Play className="w-3.5 h-3.5 text-[#105B55] fill-current" />
              <span>Evaluate</span>
            </Link>

            <Link 
              to="/projects"
              className="hover:text-[#105B55] transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>

            <Link 
              to="/marketplace"
              className="hover:text-[#105B55] transition-colors cursor-pointer hidden md:inline-block"
            >
              Marketplace
            </Link>

            <Link 
              to="/categories" 
              className="hover:text-[#105B55] transition-colors cursor-pointer hidden lg:inline-block"
            >
              Categories
            </Link>

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
              className="relative p-2 text-gray-600 hover:text-[#105B55] transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#105B55] text-white text-[10px] font-bold flex items-center justify-center">
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

                    <Link
                      to="/projects"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Evaluation History
                    </Link>

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
