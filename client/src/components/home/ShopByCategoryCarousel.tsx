import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CategoryHierarchy } from '../../../../shared/types.js';

interface ShopByCategoryCarouselProps {
  categories?: CategoryHierarchy[];
}

// Curated visuals matching Reference Image 1 exactly
const CATEGORY_VISUALS: Record<string, { title: string; image: string }> = {
  'cat-electronics': {
    title: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80' // Wireless earbuds in case
  },
  'cat-beauty': {
    title: 'Beauty Products',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80' // Beauty skincare dropper & cream
  },
  'cat-computers': {
    title: 'Smart Watches & Tech',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80' // Smartwatch
  },
  'cat-home': {
    title: 'Home Decor',
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=400&auto=format&fit=crop&q=80' // Clean flower vase aesthetic
  },
  'cat-kitchen': {
    title: 'Kitchen Appliances',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&auto=format&fit=crop&q=80' // Kitchen blender / mixer
  },
  'cat-toys': {
    title: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=400&auto=format&fit=crop&q=80' // Toy scooter / Lego brick
  },
  'cat-fashion': {
    title: 'Fashion & Style',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80'
  },
  'cat-sports': {
    title: 'Sports & Fitness',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80'
  },
  'cat-books': {
    title: 'Books & Stationery',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
  },
  'cat-automotive': {
    title: 'Automotive & Tools',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=80'
  }
};

export const ShopByCategoryCarousel: React.FC<ShopByCategoryCarouselProps> = ({ categories = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fallback default list if categories API is loading
  const displayList = categories.length > 0 ? categories : Object.keys(CATEGORY_VISUALS).map((id, idx) => ({
    id,
    name: CATEGORY_VISUALS[id].title,
    slug: id.replace('cat-', ''),
    icon: 'Grid',
    displayOrder: idx + 1,
    isActive: true,
    count: 18,
    subcategories: []
  }));

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-t border-gray-100">
      
      {/* Header Row: "Shop by Category" on left, "< >" and "View All" on right */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-[#687385] mt-1">
            Explore 10 curated departments across 180 verified local products
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-2xs hover:border-gray-400 transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-2xs hover:border-gray-400 transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-[#105B55] hover:text-[#167D73] inline-flex items-center gap-1 ml-2 transition-colors"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Circular Carousel Shelf matching Reference Image 1 */}
      <div
        ref={scrollRef}
        className="flex items-start gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayList.map((cat: any) => {
          const visual = CATEGORY_VISUALS[cat.id] || {
            title: cat.name,
            image: cat.bannerUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80'
          };

          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className="group flex flex-col items-center shrink-0 cursor-pointer text-center w-28 sm:w-32 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Circular Thumbnail Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-b from-gray-100 to-gray-50 border border-gray-200/80 group-hover:border-[#105B55] group-hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center shadow-inner">
                  <img
                    src={visual.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Title & Count */}
              <h3 className="mt-3 text-xs sm:text-sm font-bold text-[#111827] group-hover:text-[#105B55] transition-colors line-clamp-1">
                {visual.title}
              </h3>
              <span className="text-[11px] text-[#687385] font-mono mt-0.5">
                {cat.count || 18} Products
              </span>
            </div>
          );
        })}
      </div>

    </section>
  );
};
