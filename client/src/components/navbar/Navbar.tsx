import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Store, Sparkles, ShieldCheck, MapPin, 
  Search, ChevronDown, Flame, Zap, Package, Layers,
  CheckCircle2, Menu, Smartphone, Headphones, Shirt, Utensils
} from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth, UserPersona } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { totalCount, totalAmount, openCart } = useCart();
  const { persona, setPersona, personaLabel, activeCity } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pincode, setPincode] = useState('560038');
  const [locality, setLocality] = useState('Indiranagar, Bengaluru');

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (searchCategory !== 'All') params.set('category', searchCategory);
    navigate(`/products?${params.toString()}`);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocationModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#131921] text-white shadow-md border-b border-black/20">
      {/* ── 1. TOP UTILITY STRIP (Amazon / Flipkart Global Notification Bar) ── */}
      <div className="bg-[#0b0e14] text-[11px] py-1 px-4 border-b border-white/10 text-gray-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="bg-[#167D73] text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0">
              Smart Amazon + Flipkart
            </span>
            <span className="text-gray-300 font-medium truncate">
              India's 1st Real-Time Hyperlocal Marketplace ✦ Zero Phantom Stock ✦ 30-Min Walk-in or Doorstep Delivery
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs font-medium">
            <div className="hidden md:flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evalipie Assured Genuine</span>
            </div>
            <span className="text-gray-600 hidden md:inline">|</span>
            <Link to="/admin" className="text-gray-300 hover:text-white transition-colors text-[11px]">
              Platform Telemetry
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. PRIMARY AMAZON / FLIPKART POWER SEARCH HEADER ── */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3 sm:gap-6 justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="bg-[#1A222D] px-3 py-1.5 rounded-lg border border-white/10 group-hover:border-[#167D73] transition-colors flex items-center gap-2 shadow-inner">
            <img 
              src="/assets/evalipie-logo-transparent.png" 
              alt="Evalipie" 
              className="h-7 w-auto object-contain"
            />
            <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
              PLUS
            </span>
          </div>
        </Link>

        {/* Location Picker (Amazon Signature: "Deliver to...") */}
        <button
          onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded hover:ring-1 hover:ring-white/40 text-left transition-all shrink-0 cursor-pointer"
          title="Change delivery pincode"
        >
          <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-gray-400 font-medium">Deliver to</span>
            <span className="text-xs font-bold text-white flex items-center gap-0.5">
              {locality.split(',')[0]} {pincode}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </span>
          </div>
        </button>

        {/* The Central Mega Omni-Search Bar (Amazon / Flipkart Core) */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-3xl flex items-stretch rounded-lg overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-amber-400"
        >
          {/* Department Dropdown Selector */}
          <div className="relative bg-gray-100 text-gray-800 text-xs font-semibold shrink-0 border-r border-gray-300 hidden sm:flex items-center">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-transparent px-3 py-2.5 pr-6 outline-none appearance-none cursor-pointer text-xs font-bold text-gray-700"
              aria-label="Select Category"
            >
              <option value="All">All Departments</option>
              <option value="Electronics">Electronics & Hardware</option>
              <option value="Audio & Gaming">Audio & Headphones</option>
              <option value="Mobiles & Accessories">Mobiles & Fast Chargers</option>
              <option value="Fashion">Local Boutique Fashion</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 bg-white">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Amazon & Flipkart verified local shops (e.g. Sony ANC, PulsePro Watch, Sharma Electronics)..."
              className="w-full h-full px-4 py-2.5 text-xs sm:text-sm text-gray-900 font-medium placeholder-gray-400 outline-none"
            />
          </div>

          {/* Amazon Orange / Amber Search Button */}
          <button
            type="submit"
            className="bg-[#FEB849] hover:bg-[#F3A847] active:bg-[#D48928] text-gray-900 px-5 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Search Catalog"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 stroke-[2.5]" />
          </button>
        </form>

        {/* Right User Controls: Role / Account, Orders, Cart */}
        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          
          {/* Persona / Account Switcher */}
          <div className="relative group px-2 py-1 rounded hover:ring-1 hover:ring-white/40 cursor-pointer">
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-gray-400 font-medium">Hello, {personaLabel.split(' ')[0]}</span>
              <span className="text-xs font-bold text-white flex items-center gap-0.5">
                Account & Lists <ChevronDown className="w-3 h-3 text-gray-400" />
              </span>
            </div>

            {/* Dropdown Menu on Hover/Click */}
            <div className="absolute right-0 top-full mt-1 w-64 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 p-3 hidden group-hover:block group-focus-within:block z-50">
              <div className="pb-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Active Demo Persona
                </span>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as UserPersona)}
                  className="w-full text-xs font-semibold p-2 border border-gray-300 rounded-lg bg-gray-50 outline-none"
                >
                  <option value="CUSTOMER">Shopper (Bengaluru Customer)</option>
                  <option value="MERCHANT_INDEPENDENT">Sharma Electronics (Indiranagar)</option>
                  <option value="MERCHANT_CHAIN">City Supermarket (3 Branches)</option>
                  <option value="ADMIN">Platform Admin & Telemetry</option>
                </select>
              </div>

              <div className="pt-2 space-y-1 text-xs">
                <Link to="/business/dashboard" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 font-semibold text-gray-800">
                  <span>Merchant OS Portal</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">Storekeeper</span>
                </Link>
                <Link to="/products" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 font-semibold text-gray-800">
                  <span>Explore All Products</span>
                </Link>
                <Link to="/demo/rail" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 font-semibold text-gray-800">
                  <span>Interactive Fashion Rail</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">3D Hanger</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Returns & Orders */}
          <Link
            to="/products"
            className="hidden sm:flex flex-col text-left leading-tight px-2 py-1 rounded hover:ring-1 hover:ring-white/40 cursor-pointer"
          >
            <span className="text-[10px] text-gray-400 font-medium">Returns</span>
            <span className="text-xs font-bold text-white">& Orders</span>
          </Link>

          {/* Shopping Cart Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded hover:ring-1 hover:ring-white/40 cursor-pointer text-white relative"
            aria-label="View Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-[#131921]">
                  {totalCount}
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-[10px] text-gray-400 font-medium">Cart</span>
              <span className="text-xs font-extrabold text-white">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── 3. FLIPKART & AMAZON CATEGORY MEGA STRIP ── */}
      <nav className="bg-[#232F3E] text-white text-xs px-4 border-t border-white/10 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-4 py-1.5 whitespace-nowrap">
          
          {/* All Departments Button */}
          <Link 
            to="/products"
            className="flex items-center gap-1.5 font-bold hover:text-amber-400 py-1 px-2.5 rounded transition-colors bg-white/5 border border-white/10"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>

          <Link 
            to="/#deals-section"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 py-1 px-2 rounded transition-colors"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-300" />
            <span>Today's Flash Deals</span>
          </Link>

          <Link 
            to="/products?category=Electronics"
            className="flex items-center gap-1 hover:text-amber-400 py-1 px-2 rounded transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-gray-400" />
            <span>Electronics & Tech</span>
          </Link>

          <Link 
            to="/products?category=Electronics"
            className="flex items-center gap-1 hover:text-amber-400 py-1 px-2 rounded transition-colors font-medium text-emerald-300"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Smartwatches & Fitness</span>
          </Link>

          <Link 
            to="/demo/rail"
            className="flex items-center gap-1 hover:text-amber-400 py-1 px-2 rounded transition-colors font-medium text-purple-300"
          >
            <Shirt className="w-3.5 h-3.5 text-purple-400" />
            <span>Fashion Rail Showcase</span>
          </Link>

          <Link 
            to="/products?category=Home%20%26%20Kitchen"
            className="flex items-center gap-1 hover:text-amber-400 py-1 px-2 rounded transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-gray-400" />
            <span>Home & Kitchen</span>
          </Link>

          <Link 
            to="/#stores-section"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                document.getElementById('stores-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1 hover:text-amber-400 py-1 px-2 rounded transition-colors font-bold text-gray-200"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Local Shops</span>
          </Link>

          <Link 
            to="/business/dashboard"
            className="hover:text-amber-400 py-1 px-2 rounded transition-colors text-gray-300 hidden md:inline"
          >
            Merchant OS
          </Link>

          <div className="ml-auto hidden xl:flex items-center gap-2 text-[11px] text-gray-300 font-semibold bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>142 Bengaluru Local Hubs Active</span>
          </div>
        </div>
      </nav>

      {/* ── 4. 2PX SCROLL PROGRESS TRACKER ── */}
      <div className="h-[2px] w-full bg-transparent overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-[#167D73] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── 5. PINCODE MODAL ── */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base">Choose Your Delivery Location</h3>
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Delivery options and local shop inventories vary based on your neighborhood pincode.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Enter a 6-digit Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold focus:border-amber-500 outline-none"
                  placeholder="e.g. 560038"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPincode('560038');
                    setLocality('Indiranagar, Bengaluru');
                    setIsLocationModalOpen(false);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold py-2 rounded-xl transition-all"
                >
                  Indiranagar (560038)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPincode('560034');
                    setLocality('Koramangala, Bengaluru');
                    setIsLocationModalOpen(false);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold py-2 rounded-xl transition-all"
                >
                  Koramangala (560034)
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs py-2.5 rounded-xl shadow-sm transition-all"
              >
                Apply Pincode & Update Stores
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
