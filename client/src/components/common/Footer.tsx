import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, ArrowUp } from 'lucide-react';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.js';

export const Footer: React.FC = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-white border-t border-[#E5EAF0] text-[#111827] font-sans text-xs">
        
        {/* Top Bar */}
        <div className="border-b border-[#E5EAF0] bg-[#F7F9FC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#687385]">
              <span className="w-2 h-2 bg-[#167D73] rounded-full inline-block animate-pulse" />
              <span className="font-semibold">Nationwide Hyperlocal Retail Network · 6 Metro Hubs Active</span>
            </div>
            <button
              type="button"
              onClick={scrollToTop}
              className="text-[#111827] hover:text-[#167D73] flex items-center gap-1 font-semibold text-xs cursor-pointer transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <i className="w-6 h-6 rounded-md bg-[#167D73] text-white flex items-center justify-center font-bold text-xs not-italic">
                  e
                </i>
                <span className="font-extrabold text-base tracking-tight text-[#111827]">
                  Evalipie
                </span>
              </div>
              <p className="text-xs text-[#687385] leading-relaxed">
                Hyperlocal retail intelligence connecting independent neighborhood kiranas, electronics stores, and local retailers directly to buyers with zero phantom stock.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#111827] uppercase tracking-wider text-[11px]">Storefront</p>
              <ul className="space-y-1.5 text-[#687385]">
                <li><Link to="/products" className="hover:text-[#167D73] transition-colors">All Products</Link></li>
                <li><Link to="/categories" className="hover:text-[#167D73] transition-colors">Shop by Category</Link></li>
                <li><Link to="/shops" className="hover:text-[#167D73] transition-colors">Verified Local Merchants</Link></li>
                <li><Link to="/account" className="hover:text-[#167D73] transition-colors">Account & Orders</Link></li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#111827] uppercase tracking-wider text-[11px]">Platform & Legal</p>
              <ul className="space-y-1.5 text-[#687385]">
                <li><Link to="/business" className="hover:text-[#167D73] transition-colors">Evalipie Business (Merchant OS)</Link></li>
                <li><Link to="/admin" className="hover:text-[#167D73] transition-colors">Platform Telemetry</Link></li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="hover:text-[#167D73] text-left cursor-pointer transition-colors font-medium text-[#167D73]"
                  >
                    Privacy Policy (DPDP Act 2023)
                  </button>
                </li>
                <li><Link to="/privacy" className="hover:text-[#167D73] transition-colors">Full Legal Disclosure</Link></li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#111827] uppercase tracking-wider text-[11px]">Active Hubs</p>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-[#687385]">
                {['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'].map((c) => (
                  <span key={c} className="px-2 py-0.5 bg-[#F7F9FC] border border-[#E5EAF0] rounded-md font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-[#E5EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#687385]">
            <p>
              © 2026 Evalipie Technologies Inc. (evalipie.in). All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-[#167D73] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Inventory · Zero Phantom Stock</span>
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
