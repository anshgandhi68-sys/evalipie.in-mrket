import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, ChevronDown, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal.js';

const INDIAN_METRO_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune'
];

export const Navbar: React.FC = () => {
  const { totalCount, openCart } = useCart();
  const { activeCity, setActiveCity } = useAuth();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
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

        {/* Center / Nav Links matching Screenshot 5 */}
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-[#687385]">
          <a href="#ai" className="hover:text-[#167D73] transition-colors hidden md:inline-block">
            Evalipie AI
          </a>
          <a href="#cats" className="hover:text-[#167D73] transition-colors hidden md:inline-block">
            Categories
          </a>
          <a href="#trend" className="hover:text-[#167D73] transition-colors hidden md:inline-block">
            Trending
          </a>
          <a href="#sell" className="hover:text-[#167D73] transition-colors hidden lg:inline-block">
            Become a Seller
          </a>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="hover:text-[#167D73] transition-colors text-xs font-bold text-[#167D73] bg-[#E9F7F3] hover:bg-[#d4f0e8] px-2.5 py-1 rounded-full cursor-pointer transition-colors"
          >
            Privacy Policy
          </button>

          {/* City Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#111827] bg-[#F7F9FC] hover:bg-[#E5EAF0] px-2.5 py-1.5 rounded-lg border border-[#E5EAF0] transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
              <span>{activeCity}</span>
              <ChevronDown className="w-3 h-3 text-[#687385]" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#E5EAF0] rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#687385] uppercase tracking-wider border-b border-[#E5EAF0]">
                  Select Metro City
                </div>
                {INDIAN_METRO_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setActiveCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-[#F7F9FC] transition-colors cursor-pointer ${
                      activeCity === city ? 'text-[#167D73] font-bold bg-[#E9F7F3]' : 'text-[#111827]'
                    }`}
                  >
                    <span>{city}</span>
                    {activeCity === city && <Check className="w-3.5 h-3.5 text-[#167D73]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Pill matching Screenshot 5 */}
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
