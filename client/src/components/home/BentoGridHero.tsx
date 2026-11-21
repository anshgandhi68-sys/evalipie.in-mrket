import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';

interface BentoGridHeroProps {
  onShowToast?: (msg: string) => void;
}

export const BentoGridHero: React.FC<BentoGridHeroProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handlePurchaseMacbook = () => {
    navigate('/products/prod-hero-macbook-m4-pro');
  };

  const handleGetAirpods = () => {
    navigate('/products/prod-hero-airpods-max');
  };

  const handleClaimShoesDiscount = () => {
    navigate('/products/prod-hero-flat20-shoes');
  };

  const handleExploreStyleDeals = () => {
    navigate('/products?category=cat-fashion');
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        
        {/* ── CARD 1: MACBOOK M4 PRO (Left Column) ──────────────────── */}
        <div 
          onClick={handlePurchaseMacbook}
          className="group relative bg-[#F7F7F8] hover:bg-[#F2F2F4] rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100/80 shadow-xs hover:shadow-md min-h-[380px] md:min-h-[460px]"
        >
          {/* Text Content */}
          <div className="z-10 max-w-xs">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight">
              Macbook m4 pro
            </h2>
            <p className="text-xs sm:text-sm text-[#687385] mt-2.5 leading-relaxed font-normal">
              Enjoy stunning picture clarity, immersive sound, and smart features designed to elevate your everyday entertainment.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePurchaseMacbook();
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 shadow-2xs group-hover:border-gray-400 transition-all cursor-pointer"
            >
              Purchase Now
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Clean Laptop Image */}
          <div className="relative mt-6 flex justify-center items-end overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=85"
              alt="Apple Macbook M4 Pro"
              className="w-full max-w-[280px] sm:max-w-[340px] h-auto object-contain transform group-hover:scale-105 transition-transform duration-500 rounded-lg shadow-sm"
              loading="lazy"
            />
          </div>
        </div>

        {/* ── CARD 2: AIRPODS MAX (Center Column - Tall Card) ───────── */}
        <div 
          onClick={handleGetAirpods}
          className="group relative bg-[#FBF7EF] hover:bg-[#F5F0E4] rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 border border-[#EFE8DA] shadow-xs hover:shadow-md min-h-[380px] md:min-h-[460px]"
        >
          {/* Top Headphone Photo */}
          <div className="relative flex justify-center items-center py-4">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=85"
              alt="AirPods Max Silver"
              className="w-full max-w-[220px] sm:max-w-[260px] h-auto object-contain transform group-hover:scale-105 transition-transform duration-500 filter drop-shadow-md rounded-lg"
              loading="lazy"
            />
          </div>

          {/* Bottom Content */}
          <div className="z-10 mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              AirPods Max
            </h2>
            <p className="text-xs sm:text-sm text-[#687385] mt-2 leading-relaxed">
              AirPods Max deliver stunningly detailed, high-fidelity audio for an unparalleled listening experience.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleGetAirpods();
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-[#DED4C0] text-xs font-semibold text-gray-900 shadow-2xs group-hover:border-gray-500 transition-all cursor-pointer"
            >
              Get Now
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: SPLIT INTO TWO CARDS (3 & 4) ────────────── */}
        <div className="flex flex-col gap-5 lg:gap-6 justify-between">
          
          {/* ── CARD 3: FLAT 20% OFF ON REGULAR SHOES ───────────────── */}
          <div 
            onClick={handleClaimShoesDiscount}
            className="group relative bg-[#EBF4FA] hover:bg-[#E0EFF8] rounded-2xl p-6 flex flex-row items-center justify-between overflow-hidden cursor-pointer transition-all duration-300 border border-[#D5E6F2] shadow-xs hover:shadow-md flex-1"
          >
            <div className="z-10 max-w-[180px] sm:max-w-[200px]">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] leading-tight">
                Flat 20% Off on Regular Shoes
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimShoesDiscount();
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-[#C5DCEB] text-xs font-semibold text-gray-900 shadow-2xs transition-all cursor-pointer"
              >
                Claim Discount
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="relative w-32 sm:w-40 shrink-0 flex justify-end">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
                alt="Flat 20% Off on Regular Shoes"
                className="w-full h-auto object-contain transform group-hover:scale-105 group-hover:rotate-2 transition-transform duration-500 rounded-lg drop-shadow-sm"
                loading="lazy"
              />
            </div>
          </div>

          {/* ── CARD 4: DISCOVER DEALS THAT DEFINE YOUR STYLE ─────────── */}
          <div 
            onClick={handleExploreStyleDeals}
            className="group relative bg-[#FCEFEB] hover:bg-[#F9E6E1] rounded-2xl p-6 flex flex-row items-center justify-between overflow-hidden cursor-pointer transition-all duration-300 border border-[#F3DAD3] shadow-xs hover:shadow-md flex-1"
          >
            <div className="z-10 max-w-[180px] sm:max-w-[200px]">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] leading-tight">
                Discover Deals That Define Your
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExploreStyleDeals();
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E9C8BF] text-xs font-semibold text-gray-900 shadow-2xs transition-all cursor-pointer"
              >
                Explore More
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="relative w-32 sm:w-40 shrink-0 flex justify-end">
              <img
                src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80"
                alt="Discover Fashion Style Deals"
                className="w-full h-auto object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500 shadow-xs"
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
