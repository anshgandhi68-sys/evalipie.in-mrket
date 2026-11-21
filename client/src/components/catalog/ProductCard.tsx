import React from 'react';
import { Store, ShoppingCart, Sparkles } from 'lucide-react';
import { CanonicalProduct } from '../../../../shared/types.js';

interface ProductCardProps {
  product: CanonicalProduct;
  minPrice: number;
  sellerCount: number;
  inStock: boolean;
  onCompare: (product: CanonicalProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  minPrice,
  sellerCount,
  inStock,
  onCompare
}) => {
  return (
    <article className="bg-white rounded-2xl border border-[#E5EAF0] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#E9F7F3] to-white overflow-hidden flex items-center justify-center p-4">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-1">
          <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#167D73] px-2.5 py-0.5 rounded-full border border-gray-100 uppercase tracking-wider">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {product.brand}
        </div>
        <h3 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2">
          {product.title}
        </h3>

        {/* Local Seller Tag */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Store className="w-3.5 h-3.5 text-[#167D73]" />
          <span>Available at <b>{sellerCount} {sellerCount === 1 ? 'local store' : 'local stores'}</b></span>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold">Starts from</span>
            <div className="text-lg font-black text-[#111827]">
              ₹{minPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={() => onCompare(product)}
            className="bg-[#167D73] hover:bg-[#105B55] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <span>Compare Offers</span>
          </button>
        </div>
      </div>
    </article>
  );
};
