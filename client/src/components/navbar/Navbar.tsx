import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Store, ShieldCheck, MapPin, 
  Search, ChevronDown, Flame, Zap, Menu,
  Headphones, Shirt, Utensils
} from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth, UserPersona } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { totalCount, totalAmount, openCart } = useCart();
  const { persona, setPersona, personaLabel } = useAuth();
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-gray-900 border-b border-gray-200 shadow-xs h-[64px] flex flex-col justify-between select-none">
      {/* ── UNIFIED PROFESSIONAL MARKETPLACE HEADER (64px) ── */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-[62px] flex items-center gap-3 sm:gap-5 justify-between">
        
        {/* Brand Logo & Tag */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#167D73] to-[#105B55] flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              e
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-gray-900 group-hover:text-[#167D73] transition-colors">
                  Evalipie
                </span>
                <span className="bg-[#FEB849] text-gray-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                  PLUS
                </span>
              </div>
              <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mt-0.5 hidden sm:block">
                Smart Marketplace
              </span>
            </div>
          </div>
        </Link>

        {/* Deliver to Pincode Pill (Amazon Signature) */}
        <button
          onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 text-left transition-colors shrink-0 cursor-pointer border border-transparent hover:border-gray-200"
          title="Change delivery pincode"
        >
          <MapPin className="w-4 h-4 text-[#167D73] shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-gray-500 font-semibold">Deliver to</span>
            <span className="text-xs font-bold text-gray-900 flex items-center gap-0.5">
              {locality.split(',')[0]} {pincode}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </span>
          </div>
        </button>

        {/* Central Omni-Search Bar (Amazon & Flipkart Core) */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="flex-1 max-w-2xl flex items-stretch rounded-xl overflow-hidden border border-gray-300 bg-gray-50 focus-within:border-[#167D73] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#167D73]/20 transition-all shadow-2xs"
        >
          {/* Department Select Dropdown */}
          <div className="relative bg-gray-100/80 text-gray-700 text-xs font-semibold shrink-0 border-r border-gray-200 hidden sm:flex items-center">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-transparent px-3 py-2 pr-6 outline-none appearance-none cursor-pointer text-xs font-bold text-gray-700"
              aria-label="Select Category"
            >
              <option value="All">All Departments</option>
              <option value="Electronics">Electronics & Hardware</option>
              <option value="Audio & Gaming">Audio & Headphones</option>
              <option value="Mobiles & Accessories">Mobiles & Chargers</option>
              <option value="Fashion">Local Boutique Fashion</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 bg-transparent">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Amazon & Flipkart verified local shops in Bengaluru..."
              className="w-full h-full px-3.5 py-2 text-xs sm:text-sm text-gray-900 font-medium placeholder-gray-400 bg-transparent outline-none"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-[#FEB849] hover:bg-[#F3A847] active:bg-[#D48928] text-gray-900 px-4 flex items-center justify-center transition-colors shrink-0 cursor-pointer font-bold"
            aria-label="Search Catalog"
          >
            <Search className="w-4 h-4 text-gray-900 stroke-[2.5]" />
          </button>
        </form>

        {/* Right User Controls: Role / Account, Orders, Cart */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          {/* Persona / Account Switcher */}
          <div className="relative group px-2 py-1 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-gray-500 font-medium">Hello, {personaLabel.split(' ')[0]}</span>
              <span className="text-xs font-bold text-gray-900 flex items-center gap-0.5">
                Account & Lists <ChevronDown className="w-3 h-3 text-gray-400" />
              </span>
            </div>

            {/* Dropdown Menu on Hover/Click */}
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-200 p-3 hidden group-hover:block group-focus-within:block z-50">
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
                <Link to="/admin" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 font-semibold text-gray-800">
                  <span>Platform Telemetry</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Admin</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Returns & Orders */}
          <Link
            to="/products"
            className="hidden sm:flex flex-col text-left leading-tight px-2 py-1 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <span className="text-[10px] text-gray-500 font-medium">Returns</span>
            <span className="text-xs font-bold text-gray-900">& Orders</span>
          </Link>

          {/* Shopping Cart Pill */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 cursor-pointer text-gray-900 relative transition-all border border-gray-200"
            aria-label="View Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-gray-900" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#167D73] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalCount}
                </span>
              )}
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Cart</span>
              <span className="text-xs font-black text-gray-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── 2PX SCROLL PROGRESS TRACKER ── */}
      <div className="h-[2px] w-full bg-gray-100 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#167D73] via-emerald-400 to-[#FEB849] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── PINCODE MODAL ── */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#167D73]" />
                <h3 className="font-black text-base">Choose Delivery Location</h3>
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Delivery options and physical stock availability update automatically for your selected Bengaluru neighborhood.
            </p>
            <form onSubmit={handlePincodeSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Enter a 6-digit Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#167D73] outline-none"
                  placeholder="e.g. 560038"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPincode('560038');
                    setLocality('Indiranagar, Bengaluru');
                    setIsLocationModalOpen(false);
                  }}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
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
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                >
                  Koramangala (560034)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPincode('560041');
                    setLocality('Jayanagar, Bengaluru');
                    setIsLocationModalOpen(false);
                  }}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                >
                  Jayanagar (560041)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPincode('560066');
                    setLocality('Whitefield, Bengaluru');
                    setIsLocationModalOpen(false);
                  }}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                >
                  Whitefield (560066)
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-[#167D73] hover:bg-[#105B55] text-white font-extrabold text-xs py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
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
