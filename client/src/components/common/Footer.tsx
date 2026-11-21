import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Store, ChevronUp, Lock, RefreshCcw, Truck, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#131921] text-gray-300 text-xs">
      {/* ── 1. "BACK TO TOP" BUTTON (Amazon Signature) ── */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#232F3E] hover:bg-[#2c3b4e] text-white py-3.5 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b border-white/5"
      >
        <ChevronUp className="w-4 h-4" />
        <span>Back to Top</span>
      </button>

      {/* ── 2. TRUST ASSURANCE STRIP (Flipkart / Amazon India Style) ── */}
      <div className="bg-[#1A222D] border-b border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">30-Min Instant Delivery</h5>
              <p className="text-[11px] text-gray-400">Direct from local Bengaluru stores</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">100% Genuine Physical Stock</h5>
              <p className="text-[11px] text-gray-400">Zero phantom catalog inventory</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-blue-400/10 text-blue-400 flex items-center justify-center shrink-0">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">Easy 7-Day Local Returns</h5>
              <p className="text-[11px] text-gray-400">Hand it back to the store counter</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-purple-400/10 text-purple-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs">Safe & Encrypted Payments</h5>
              <p className="text-[11px] text-gray-400">UPI, RuPay, Cards & Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FOUR EDITORIAL NAVIGATION COLUMNS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Get to Know Us */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Get to Know Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">About Evalipie</Link></li>
              <li><Link to="/products" className="hover:text-amber-400 transition-colors">Physical Storefront Catalog</Link></li>
              <li><Link to="/demo/rail" className="hover:text-amber-400 transition-colors">Local Rail Fashion Showcase</Link></li>
              <li><span className="text-gray-500">Careers & Retail Technology</span></li>
              <li><span className="text-gray-500">Press Releases & Coverage</span></li>
            </ul>
          </div>

          {/* Col 2: Connect with Us */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Connect with Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://github.com/anshgandhi68-sys/evalipie.in-mrket" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Official GitHub Repository</a></li>
              <li><span className="text-gray-500">Bengaluru Retail Innovation Lab</span></li>
              <li><span className="text-gray-500">Twitter / X (@EvalipieHQ)</span></li>
              <li><span className="text-gray-500">Instagram (@evalipie.in)</span></li>
              <li><Link to="/admin" className="text-emerald-400 hover:underline">Platform Operations & Telemetry</Link></li>
            </ul>
          </div>

          {/* Col 3: Make Money with Us */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Make Money with Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/business/dashboard" className="text-amber-400 hover:underline font-semibold">Sell on Evalipie (Merchant OS)</Link></li>
              <li><Link to="/business/listings" className="hover:text-amber-400 transition-colors">Sync Offline Store Inventory</Link></li>
              <li><Link to="/business/branches" className="hover:text-amber-400 transition-colors">Multi-Branch Retail Management</Link></li>
              <li><span className="text-gray-500">Become an Evalipie Fast-Rider</span></li>
              <li><span className="text-gray-500">Fulfilled by Local Rail Network</span></li>
            </ul>
          </div>

          {/* Col 4: Let Us Help You */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Let Us Help You</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/products" className="hover:text-amber-400 transition-colors">Your Account & Active Orders</Link></li>
              <li><span className="text-gray-500">Returns & Replacement Centre</span></li>
              <li><span className="text-gray-500">100% Purchase Protection</span></li>
              <li><span className="text-gray-500">Help Centre & 24x7 Support</span></li>
              <li><span className="text-gray-500">Evalipie App Download</span></li>
            </ul>
          </div>
        </div>

        {/* ── 4. BRAND & REGION SELECTOR ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#1A222D] px-3.5 py-1.5 rounded-lg border border-white/10 flex items-center">
              <img 
                src="/assets/evalipie-logo-transparent.png" 
                alt="Evalipie" 
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-[11px] font-bold text-gray-400">
              Smart Hyperlocal Amazon & Flipkart
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="bg-[#1A222D] px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 font-medium">
              <span>🇮🇳</span>
              <span className="text-white font-bold">India (Bengaluru 560038)</span>
            </div>
            <div className="bg-[#1A222D] px-3 py-1.5 rounded-lg border border-white/10 font-bold text-white">
              ₹ INR
            </div>
          </div>
        </div>

        {/* ── 5. LEGAL & COPYRIGHT FOOTER ── */}
        <div className="pt-6 mt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-gray-500 text-center sm:text-left">
          <p>© 2026 Evalipie Technologies Pvt. Ltd. · Domain: <strong>evalipie.in</strong> · Zero Phantom Inventory Guarantee.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Conditions of Use & Sale</span>
            <span className="hover:text-gray-400 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-gray-400 cursor-pointer">Interest-Based Ads</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
