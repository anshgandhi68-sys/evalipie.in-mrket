import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.js';

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 bg-white/85 backdrop-blur-md border-b border-[#E5EAF0]">
        
        {/* Left: Brand Logo matching Screenshot 5 */}
        <Link to="/" className="flex items-center gap-2 group">
          <i className="w-7 h-7 rounded-lg bg-[#167D73] text-white flex items-center justify-center font-bold text-sm not-italic shadow-sm group-hover:bg-[#105B55] transition-colors">
            e
          </i>
          <span className="font-extrabold text-xl tracking-tight text-[#111827]">
            Evalipie
          </span>
        </Link>

        {/* Center / Nav Links matching Screenshot 3 & user specs */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-[#687385]">
          <Link to="/ai" className="hover:text-[#167D73] transition-colors hidden sm:inline-block">
            Evalipie AI
          </Link>
          <a href="#cats" className="hover:text-[#167D73] transition-colors hidden sm:inline-block">
            Categories
          </a>
          <a href="#trend" className="hover:text-[#167D73] transition-colors hidden sm:inline-block">
            Trending
          </a>
          <Link to="/business" className="hover:text-[#167D73] transition-colors hidden md:inline-block">
            Become a Seller
          </Link>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="hover:text-[#167D73] transition-colors hidden lg:inline-block text-xs font-semibold text-[#687385] hover:text-[#167D73] cursor-pointer"
          >
            Privacy Policy
          </button>

          {/* Cart Pill matching Screenshot 3 */}
          <button
            type="button"
            onClick={openCart}
            className="bg-[#111827] hover:bg-black text-white px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart · {totalCount}</span>
          </button>
        </nav>
      </header>

      {/* DPDP Act 2023 Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
