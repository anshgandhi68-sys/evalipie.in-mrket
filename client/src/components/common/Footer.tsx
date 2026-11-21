import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Mic, Store, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E5EAF0] text-[#687385] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-[#111827]">
              <span className="w-8 h-8 rounded-lg bg-[#167D73] flex items-center justify-center text-white font-bold text-base">
                e
              </span>
              <span>Evalipie</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Every Shop. One Intelligent Marketplace. Empowering neighbourhood retail stores and established retail chains with digital sovereignty.
            </p>
            <div className="text-[11px] font-bold text-[#167D73] bg-[#E9F7F3] inline-block px-2.5 py-1 rounded-full">
              https://evalipie.in
            </div>
          </div>

          {/* Shopper Links */}
          <div>
            <h4 className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3">Customer Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-[#167D73] transition-colors">Home & Door Hero</Link></li>
              <li><Link to="/products" className="hover:text-[#167D73] transition-colors">Typo-Tolerant Product Search</Link></li>
              <li><Link to="/ai" className="hover:text-[#7657E8] transition-colors flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#7657E8]" /> Evalipie AI Discovery</Link></li>
              <li><Link to="/orders" className="hover:text-[#167D73] transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Merchant SaaS */}
          <div>
            <h4 className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3">Merchant & Retail OS</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/business/voice-khata" className="hover:text-[#167D73] transition-colors flex items-center gap-1 font-semibold text-[#167D73]"><Mic className="w-3 h-3" /> Voice Khata (Gnani PS2)</Link></li>
              <li><Link to="/business/voice-khata/ledger" className="hover:text-[#167D73] transition-colors">Customer Credit/Debit Ledger</Link></li>
              <li><Link to="/shop/sharma-electronics" className="hover:text-[#167D73] transition-colors">Sharma Electronics Storefront</Link></li>
              <li><Link to="/business/branches" className="hover:text-[#167D73] transition-colors">Retail Chain 3-Branch Manager</Link></li>
            </ul>
          </div>

          {/* Engineering & Hackathons */}
          <div>
            <h4 className="font-bold text-[#111827] text-xs uppercase tracking-wider mb-3">Engineering Tracks</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/admin" className="hover:text-[#111827] transition-colors flex items-center gap-1"><Shield className="w-3 h-3" /> Platform Observability</Link></li>
              <li><span className="text-gray-500">Aiven PostgreSQL (ACID Concurrency)</span></li>
              <li><span className="text-gray-500">Aiven Kafka (Transactional Outbox)</span></li>
              <li><span className="text-gray-500">Aiven OpenSearch (Fuzzy Match)</span></li>
              <li><span className="text-gray-500">Gnani Prisma STT & Timbre TTS</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Evalipie · Official Domain: evalipie.in · Built with Passion for Local Retailers</p>
          <div className="flex items-center gap-1">
            <span>Every Shop Gets a Digital Identity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
