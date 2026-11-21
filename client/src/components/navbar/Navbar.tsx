import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Mic, Store, Sparkles, Shield, MapPin, UserCheck, Shirt } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth, UserPersona } from '../../context/AuthContext.js';
import { SlideTabs, SlideTabItem } from '../ui/slide-tabs.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { persona, setPersona, personaLabel, activeCity } = useAuth();
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  const navItems: SlideTabItem[] = [
    { label: "Discover", href: "/" },
    { label: "Catalog", href: "/products" },
    { label: "Local Rail", href: "/demo/rail" },
    { label: "AI Search", href: "/ai" },
    { label: "Voice Khata", href: "/business/voice-khata", badge: "Gnani" },
    { label: "Merchant OS", href: "/business/dashboard" },
    { label: "Admin", href: "/admin" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5EAF0]">
      {/* 1. Editorial Announcement Ticker Bar */}
      <div className="bg-[#0F1412] text-[#E6E9E4] text-[11px] font-semibold py-1.5 px-4 overflow-hidden border-b border-white/10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="bg-[#167D73] text-white px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase shrink-0">
              Evalipie Platform
            </span>
            <span className="text-gray-300 font-medium truncate">
              Connecting Every Local Shop ✦ Real-Time Inventory Truth ✦ Voice Khata Powered ✦ Zero-Overselling Guaranteed
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="hidden md:inline text-[11px] text-gray-400 font-mono">
              Role: <strong className="text-white font-semibold">{personaLabel}</strong>
            </span>
            <select 
              value={persona} 
              onChange={(e) => setPersona(e.target.value as UserPersona)}
              className="bg-black/60 text-white text-[11px] border border-white/20 rounded-md px-2 py-0.5 outline-none cursor-pointer font-medium"
              aria-label="Select Demo Role"
            >
              <option value="CUSTOMER">Customer (Shopper)</option>
              <option value="MERCHANT_INDEPENDENT">Sharma Electronics (Shopkeeper)</option>
              <option value="MERCHANT_CHAIN">City Supermarket (Retail Chain)</option>
              <option value="ADMIN">Platform Admin & Telemetry</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity">
          <div className="bg-[#120B2E] px-3.5 py-1.5 rounded-xl border border-white/10 shadow-sm flex items-center">
            <img 
              src="/assets/evalipie-logo-transparent.png" 
              alt="Evalipie.in" 
              className="h-7 w-auto object-contain"
            />
          </div>
          <span className="text-[10px] font-extrabold text-[#167D73] bg-[#E9F7F3] px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline">
            Intelligent Marketplace
          </span>
        </Link>

        {/* Navigation Slide Tabs (Fluid 21st.dev pill navigation) */}
        <nav className="hidden lg:flex items-center">
          <SlideTabs 
            items={navItems}
            borderColor="border-[#0F1412]"
            pillColor="bg-[#0F1412]"
            className="py-0.5 px-1 bg-white/80"
          />
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* City Location Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#0F1412] bg-[#E6E9E4]/60 px-3 py-1.5 rounded-full border border-[#0F1412]/10 uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
            <span>{activeCity}</span>
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 bg-[#0F1412] hover:bg-[#1f2937] text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {totalCount > 0 && (
              <span className="bg-[#167D73] text-white text-[11px] px-2 py-0.5 rounded-full font-black ml-0.5">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. 2px Scroll Progress Bar under Nav */}
      <div className="h-[2px] w-full bg-transparent overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#167D73] via-[#14B8A6] to-[#7657E8] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  );
};
