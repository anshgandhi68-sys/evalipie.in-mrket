import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Mic, Store, Sparkles, Shield, MapPin, UserCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth, UserPersona } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { persona, setPersona, personaLabel, activeCity } = useAuth();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5EAF0]">
      {/* Top Demo Bar for Persona Switching */}
      <div className="bg-[#111827] text-white text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-[#167D73] px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Live Hackathon Mode</span>
          <span className="hidden sm:inline text-gray-300">Active Persona: <b className="text-white">{personaLabel}</b></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[11px] hidden md:inline">Switch Role:</span>
          <select 
            value={persona} 
            onChange={(e) => setPersona(e.target.value as UserPersona)}
            className="bg-gray-800 text-white text-xs border border-gray-700 rounded px-2 py-0.5 outline-none cursor-pointer"
          >
            <option value="CUSTOMER">👤 Customer (Shopper)</option>
            <option value="MERCHANT_INDEPENDENT">🏪 Sharma Electronics (Shopkeeper)</option>
            <option value="MERCHANT_CHAIN">🏢 City Supermarket (Retail Chain)</option>
            <option value="ADMIN">🛡️ Platform Admin & Kafka Monitor</option>
          </select>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-[#111827] hover:opacity-90">
          <span className="w-8 h-8 rounded-lg bg-[#167D73] flex items-center justify-center text-white font-bold text-base shadow-sm">
            e
          </span>
          <span>Evalipie</span>
          <span className="text-[11px] font-bold text-[#167D73] bg-[#E9F7F3] px-2 py-0.5 rounded-full uppercase ml-1 hidden sm:inline">
            Marketplace
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#687385]">
          <Link to="/" className={`transition-colors hover:text-[#167D73] ${isCurrent('/') ? 'text-[#167D73]' : ''}`}>
            Home
          </Link>
          <Link to="/products" className={`transition-colors hover:text-[#167D73] ${isCurrent('/products') ? 'text-[#167D73]' : ''}`}>
            All Products
          </Link>
          <Link to="/ai" className={`flex items-center gap-1.5 transition-colors hover:text-[#7657E8] ${isCurrent('/ai') ? 'text-[#7657E8]' : ''}`}>
            <Sparkles className="w-4 h-4 text-[#7657E8]" />
            <span>Evalipie AI</span>
          </Link>
          <Link to="/business/voice-khata" className={`flex items-center gap-1.5 transition-colors hover:text-[#167D73] ${location.pathname.startsWith('/business/voice-khata') ? 'text-[#167D73]' : ''}`}>
            <Mic className="w-4 h-4 text-[#167D73]" />
            <span>Voice Khata</span>
            <span className="bg-[#E9F7F3] text-[#167D73] text-[10px] font-bold px-1.5 py-0.2 rounded-full">Gnani PS2</span>
          </Link>
          <Link to="/business/dashboard" className={`flex items-center gap-1.5 transition-colors hover:text-[#167D73] ${location.pathname.startsWith('/business') && !location.pathname.includes('voice-khata') ? 'text-[#167D73]' : ''}`}>
            <Store className="w-4 h-4" />
            <span>Merchant SaaS</span>
          </Link>
          <Link to="/admin" className={`flex items-center gap-1.5 transition-colors hover:text-[#111827] ${location.pathname.startsWith('/admin') ? 'text-[#111827]' : ''}`}>
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* City Location Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
            <span>{activeCity}</span>
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 bg-[#111827] hover:bg-[#1f2937] text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-sm active:scale-95"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {totalCount > 0 && (
              <span className="bg-[#167D73] text-white text-xs px-2 py-0.5 rounded-full font-bold ml-0.5">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
