import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.js';
import { VoiceShoppingModal } from '../voice/VoiceShoppingModal.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-3.5 bg-white/85 backdrop-blur-md border-b border-[#E5EAF0]">
        
        {/* Left: Brand Logo matching User Upload */}
        <Link to="/" className="flex items-center group">
          <img 
            src="/assets/evalipie-logo.png" 
            alt="Evalipie.in" 
            className="h-8 sm:h-9 w-auto rounded-lg shadow-xs hover:opacity-95 transition-opacity" 
          />
        </Link>

        {/* Right Nav Links matching Prototype */}
        <nav className="flex items-center gap-5 sm:gap-7 text-sm font-semibold text-[#687385]">
          <a 
            href="#ai" 
            onClick={(e) => handleScrollTo('ai', e)}
            className="hover:text-[#167D73] transition-colors cursor-pointer"
          >
            Evalipie AI
          </a>
          <a 
            href="#cats" 
            onClick={(e) => handleScrollTo('cats', e)}
            className="hover:text-[#167D73] transition-colors cursor-pointer"
          >
            Categories
          </a>
          <a 
            href="#trend" 
            onClick={(e) => handleScrollTo('trend', e)}
            className="hover:text-[#167D73] transition-colors cursor-pointer"
          >
            Trending
          </a>
          <Link to="/business" className="hover:text-[#167D73] transition-colors hidden sm:inline-block">
            Become a Seller
          </Link>

          {/* Voice Shopping Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#E9F7F3] hover:bg-[#d5f3eb] text-[#167D73] px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer border border-[#A7E3D8] shadow-xs hover:scale-105 active:scale-95"
            title="Speak to Evalipie Voice AI"
          >
            <span>🎙️</span>
            <span>Voice AI</span>
          </button>

          {/* Cart Pill matching Image 2 */}
          <button
            type="button"
            onClick={openCart}
            className="bg-[#111827] hover:bg-black text-white px-4 py-1.5 rounded-full font-semibold text-sm transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
          >
            Cart · {totalCount}
          </button>
        </nav>
      </header>

      {/* Voice Shopping Interactive Experience Modal */}
      <VoiceShoppingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* DPDP Act 2023 Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
