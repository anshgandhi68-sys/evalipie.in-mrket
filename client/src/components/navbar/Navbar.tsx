"use client";

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { personaLabel } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleAiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById('ai');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.dispatchEvent(new CustomEvent('open-evalipie-ai'));
    setIsMobileMenuOpen(false);
  };

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="hd">
        {/* Brand Logo (Matching Screenshot 5) */}
        <Link className="logo shrink-0" to="/">
          <i>e</i>
          <span>Evalipie</span>
        </Link>

        {/* Desktop Navigation (Matching Screenshot 5) */}
        <nav>
          <button 
            type="button"
            onClick={handleAiClick}
            className="nav-btn hover:text-[#167D73] transition-colors"
          >
            Evalipie AI
          </button>
          
          <Link to="/categories" className="hover:text-[#167D73] transition-colors">
            Categories
          </Link>

          <a 
            href="#trend" 
            onClick={(e) => handleScrollTo('trend', e)} 
            className="hover:text-[#167D73] transition-colors"
          >
            Trending
          </a>

          <Link to="/business/dashboard" className="hover:text-[#167D73] transition-colors">
            Become a Seller
          </Link>

          {/* Quick Search Toggle Icon Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="nav-btn hover:text-[#167D73] p-1 transition-colors"
            title="Search Products"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-gray-500 hover:text-[#167D73]" />
          </button>

          {/* Account Icon */}
          <Link 
            to="/account" 
            className="hover:text-[#167D73] transition-colors flex items-center gap-1"
            title={personaLabel}
          >
            <User className="w-4 h-4 text-gray-500 hover:text-[#167D73]" />
          </Link>

          {/* Cart Pill Button (Matching Screenshot 5) */}
          <button className="cart" onClick={openCart} id="cartBtn" type="button">
            <span>Cart · </span>
            <span id="cc">{totalCount}</span>
          </button>
        </nav>

        {/* Mobile Action Buttons */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <button 
            onClick={openCart}
            className="cart text-xs py-1.5 px-3"
            type="button"
          >
            <span>Cart · {totalCount}</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
            type="button"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Expandable Search Drawer */}
      {isSearchOpen && (
        <div className="fixed top-[57px] left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-40 shadow-md animate-in fade-in duration-150">
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search iPhone 16, Samsung Galaxy, headphones, running shoes, kirana..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#167D73] rounded-full pl-10 pr-4 py-2 text-xs font-semibold outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#167D73] hover:bg-[#105B55] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2 text-xs font-bold"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 bg-white border-b border-gray-200 p-4 space-y-4 shadow-xl z-40 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products in Bengaluru..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#167D73]"
            />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-bold text-gray-700">
            <button 
              type="button"
              onClick={handleAiClick}
              className="flex items-center gap-2 text-[#7657E8] p-2 hover:bg-purple-50 rounded-xl text-left"
            >
              <Sparkles className="w-4 h-4" />
              <span>Evalipie AI Assistant</span>
            </button>
            <Link 
              to="/categories" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-50 rounded-xl"
            >
              Categories
            </Link>
            <a 
              href="#trend" 
              onClick={(e) => handleScrollTo('trend', e)} 
              className="p-2 hover:bg-gray-50 rounded-xl"
            >
              Trending Products
            </a>
            <Link 
              to="/shops" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-50 rounded-xl"
            >
              Verified Shops
            </Link>
            <Link 
              to="/business/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-50 rounded-xl text-[#167D73]"
            >
              Become a Seller
            </Link>
            <Link 
              to="/account" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-50 rounded-xl flex items-center justify-between"
            >
              <span>Account & Orders</span>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                {personaLabel}
              </span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
