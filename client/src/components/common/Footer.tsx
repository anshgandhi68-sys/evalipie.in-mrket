import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCcw, Lock, ChevronUp, MapPin, Sparkles, Store, ExternalLink } from 'lucide-react';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.js';

export const Footer: React.FC = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-white border-t border-[#E5EAF0] text-gray-600 font-sans text-xs">
        
        {/* ── 1. SUBTLE BACK TO TOP ── */}
        <div className="border-b border-[#E5EAF0] bg-[#F7F9FC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block animate-pulse" />
              <span>Bengaluru Local Delivery Network Active · 142 Verified Stores</span>
            </div>
            <button
              onClick={scrollToTop}
              className="text-xs font-bold text-[#167D73] hover:text-[#105B55] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
              <span>Back to top</span>
            </button>
          </div>
        </div>

        {/* ── 2. CLEAN TRUST ASSURANCE STRIP ── */}
        <div className="border-b border-[#E5EAF0] bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9F7F3] text-[#167D73] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-xs">30-Min Local Delivery</h5>
                <p className="text-[11px] text-gray-500">From neighborhood stores in Bengaluru</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9F7F3] text-[#167D73] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-xs">Zero Phantom Stock</h5>
                <p className="text-[11px] text-gray-500">Row-locked verified shelf inventory</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9F7F3] text-[#167D73] flex items-center justify-center shrink-0">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-xs">Counter Walk-In Pickup</h5>
                <p className="text-[11px] text-gray-500">Inspect & pick up in Indiranagar/Jayanagar</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9F7F3] text-[#167D73] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-gray-900 text-xs">Bank-Grade Privacy</h5>
                <p className="text-[11px] text-gray-500">DPDP Act 2023 · Zero ad selling</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. FOUR EDITORIAL NAVIGATION COLUMNS ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            
            {/* Col 1 & 2: Brand & Mission */}
            <div className="md:col-span-2 space-y-4 pr-4">
              <Link to="/" className="inline-flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#167D73] text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  e
                </span>
                <span className="font-black text-xl text-gray-900 tracking-tight">
                  Evalipie
                </span>
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                Every Shop. One Intelligent Marketplace. India's first real-time hyperlocal discovery platform connecting shoppers to authentic local kirana, electronics, and fashion stores.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#105B55] font-bold bg-[#E9F7F3] px-3 py-1.5 rounded-full inline-flex">
                <MapPin className="w-3.5 h-3.5" />
                <span>Indiranagar · Jayanagar · Koramangala · Whitefield</span>
              </div>
            </div>

            {/* Col 3: Marketplace */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                Marketplace
              </h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link to="/categories" className="hover:text-[#167D73] transition-colors">Browse Categories</Link></li>
                <li><a href="/#trend" className="hover:text-[#167D73] transition-colors">Trending in Bengaluru</a></li>
                <li><Link to="/products" className="hover:text-[#167D73] transition-colors">Physical Storefront Catalog</Link></li>
                <li><Link to="/shops" className="hover:text-[#167D73] transition-colors">Verified Local Stores</Link></li>
                <li><Link to="/account" className="hover:text-[#167D73] transition-colors">Your Orders & Account</Link></li>
              </ul>
            </div>

            {/* Col 4: For Merchants */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                For Merchants
              </h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link to="/business/dashboard" className="text-[#167D73] hover:underline font-bold">Sell on Evalipie</Link></li>
                <li><Link to="/business/listings" className="hover:text-[#167D73] transition-colors">Store Inventory Sync</Link></li>
                <li><Link to="/business/branches" className="hover:text-[#167D73] transition-colors">Branch Management</Link></li>
                <li><Link to="/business/orders" className="hover:text-[#167D73] transition-colors">Order Dispatch Console</Link></li>
                <li><span className="text-gray-400">Zero Commission Partner</span></li>
              </ul>
            </div>

            {/* Col 5: Trust & Legal */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                Trust & Legal
              </h4>
              <ul className="space-y-2 text-gray-500">
                <li>
                  <button
                    onClick={() => setIsPrivacyOpen(true)}
                    className="text-[#167D73] hover:underline font-bold cursor-pointer text-left"
                  >
                    Privacy Policy (DPDP Act)
                  </button>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#167D73] transition-colors">
                    Privacy Documentation Page
                  </Link>
                </li>
                <li><span className="text-gray-400">Terms of Hyperlocal Service</span></li>
                <li><span className="text-gray-400">Merchant Code of Conduct</span></li>
                <li><span className="text-gray-400">Anti-Overselling Guarantee</span></li>
              </ul>
            </div>

          </div>

          {/* ── 4. COPYRIGHT & REGULATORY FOOTER ── */}
          <div className="pt-6 border-t border-[#E5EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 text-center sm:text-left">
            <div>
              © 2026 Evalipie Technologies Inc. · <b>evalipie.in</b> · Registered under Karnataka Shops & Commercial Establishments Act.
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <button 
                onClick={() => setIsPrivacyOpen(true)}
                className="hover:text-[#167D73] font-semibold underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <Link to="/privacy" className="hover:text-[#167D73] font-semibold">
                Legal Notice
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">Bengaluru HQ: 42, 100ft Road, HAL 2nd Stage, Indiranagar</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />
    </>
  );
};

export default Footer;
