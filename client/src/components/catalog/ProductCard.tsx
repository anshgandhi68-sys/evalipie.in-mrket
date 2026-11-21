import React, { useState } from 'react';
import { Store, ShoppingCart, Star, Check, Sparkles, MapPin, Zap } from 'lucide-react';
import { CanonicalProduct } from '../../../../shared/types.js';
import { useCart } from '../../context/CartContext.js';

interface ProductCardProps {
  product: CanonicalProduct;
  minPrice: number;
  sellerCount: number;
  inStock: boolean;
  onCompare: (product: CanonicalProduct) => void;
  originalMrp?: number;
  rating?: number;
  reviewsCount?: number;
  distanceKm?: number;
  featuredStoreName?: string;
  badge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  minPrice,
  sellerCount,
  inStock,
  onCompare,
  originalMrp,
  rating = 4.8,
  reviewsCount = 124,
  distanceKm = 1.4,
  featuredStoreName = "Sharma Electronics",
  badge
}) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Compute realistic MRP and discount %
  const mrp = originalMrp || Math.round(minPrice * 1.25);
  const discountPercent = mrp > minPrice ? Math.round(((mrp - minPrice) / mrp) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      listingId: `list-quick-${product.id}`,
      storeId: 'store-sharma-ind',
      productId: product.id,
      title: product.title,
      shopName: featuredStoreName,
      shopSlug: 'sharma-electronics',
      price: minPrice,
      originalMrp: mrp,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200/80 hover:border-gray-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 relative overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {discountPercent > 0 && (
          <span className="bg-[#DC2626] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs tracking-wider uppercase">
            {discountPercent}% OFF
          </span>
        )}
        {badge && (
          <span className="bg-[#167D73] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {badge}
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md border border-gray-100 text-[10px] font-bold text-gray-700 px-2 py-0.5 rounded-full shadow-xs">
          <MapPin className="w-2.5 h-2.5 text-[#167D73]" />
          <span>{distanceKm} km</span>
        </span>
      </div>

      {/* Product Image Canvas */}
      <div 
        onClick={() => onCompare(product)}
        className="relative aspect-square bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-6 cursor-pointer"
      >
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onCompare(product)}
          className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-[#167D73] transition-colors cursor-pointer"
        >
          {product.title}
        </h3>

        {/* Rating & Local Store Truth */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-gray-900 font-extrabold">{rating}</span>
            <span className="text-gray-400 text-[11px] font-normal">({reviewsCount})</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>Store In Stock</span>
          </div>
        </div>

        {/* Seller Info Pill */}
        <div 
          onClick={() => onCompare(product)}
          className="bg-gray-50 hover:bg-[#E9F7F3] border border-gray-100 hover:border-[#167D73]/30 rounded-xl p-2 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Store className="w-3.5 h-3.5 text-[#167D73]" />
            <span className="text-[11px] font-medium truncate max-w-[140px]">
              <b>{featuredStoreName}</b>
            </span>
          </div>
          {sellerCount > 1 ? (
            <span className="text-[10px] font-bold text-[#167D73] bg-white px-1.5 py-0.5 rounded border border-gray-200">
              +{sellerCount - 1} more
            </span>
          ) : (
            <span className="text-[10px] font-bold text-gray-500">Single seller</span>
          )}
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-gray-900 tracking-tight">
                ₹{minPrice.toLocaleString('en-IN')}
              </span>
              {mrp > minPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 block font-medium">Inclusive of all taxes</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onCompare(product)}
              title="Compare all local shop prices"
              className="border border-gray-300 hover:border-gray-500 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-2.5 py-2 rounded-xl transition-all shadow-2xs active:scale-95"
            >
              Compare
            </button>
            <button
              onClick={handleQuickAdd}
              className={`text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1 ${
                added ? 'bg-emerald-600' : 'bg-[#0F1412] hover:bg-[#167D73]'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
