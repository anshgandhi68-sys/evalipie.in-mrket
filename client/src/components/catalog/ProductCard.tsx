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
  reviewsCount = 310,
  distanceKm = 0.8,
  featuredStoreName = "City Supermarket (Indiranagar)",
  badge
}) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Compute realistic MRP and discount %
  const mrp = originalMrp || Math.round(minPrice * 1.2);
  const discountPercent = mrp > minPrice ? Math.round(((mrp - minPrice) / mrp) * 100) : 0;

  // Determine tag badge (Fresh Stock, Popular, Top Rated, Daily Essential)
  const defaultBadge = badge || (
    product.category.includes('Kirana') || product.category.includes('Grocer')
      ? (minPrice > 300 ? 'Fresh Stock' : 'Daily Essential')
      : (product.category.includes('Audio') || product.category.includes('Electr') ? 'Top Rated' : 'Popular')
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      listingId: `list-quick-${product.id}`,
      storeId: 'store-city-ind',
      productId: product.id,
      title: product.title,
      shopName: featuredStoreName,
      shopSlug: 'city-supermarket',
      price: minPrice,
      originalMrp: mrp,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#167D73]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden">
      
      {/* Top Badges (Matching Screenshot 1) */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 items-center">
        {discountPercent > 0 && (
          <span className="bg-[#DC2626] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-2xs tracking-wider uppercase">
            {discountPercent}% OFF
          </span>
        )}
        <span className="bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs tracking-wider">
          {defaultBadge}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md border border-gray-200 text-[10px] font-semibold text-gray-600 px-2.5 py-0.5 rounded-full shadow-2xs">
          <MapPin className="w-2.5 h-2.5 text-[#167D73]" />
          <span>{distanceKm} km</span>
        </span>
      </div>

      {/* Product Image Canvas */}
      <div 
        onClick={() => onCompare(product)}
        className="relative aspect-4/3 bg-white overflow-hidden flex items-center justify-center p-6 cursor-pointer border-b border-gray-100/80"
      >
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        
        {/* Brand & Category Pill */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-gray-400 uppercase tracking-wider text-[10px]">
            {product.brand}
          </span>
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onCompare(product)}
          className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-[#167D73] transition-colors cursor-pointer min-h-[38px]"
        >
          {product.title}
        </h3>

        {/* Rating & In-Stock Status */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-900">{rating}</span>
            <span className="text-gray-400 font-normal">({reviewsCount})</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#059669]">
            <Sparkles className="w-3 h-3 text-[#059669]" />
            <span>Store In Stock</span>
          </div>
        </div>

        {/* Local Verified Merchant Pill */}
        <div 
          onClick={() => onCompare(product)}
          className="bg-gray-50/90 hover:bg-emerald-50/50 border border-gray-200/80 hover:border-emerald-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium truncate max-w-[170px]">
            <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{featuredStoreName}</span>
          </div>
          <span className="text-[10px] font-bold text-[#167D73] bg-white px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
            +{sellerCount > 1 ? sellerCount - 1 : 2} more
          </span>
        </div>

        {/* Price & Buy Actions Footer (Matching Screenshot 1) */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-gray-900 tracking-tight">
                ₹{minPrice.toLocaleString('en-IN')}
              </span>
              {mrp > minPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-medium block">
              Inclusive of all taxes
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onCompare(product)}
              title="Compare all local shop prices"
              className="border border-gray-200 hover:border-gray-400 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs hover:bg-gray-50 active:scale-95 cursor-pointer"
            >
              Compare
            </button>
            <button
              onClick={handleQuickAdd}
              className={`text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer ${
                added 
                  ? 'bg-emerald-600' 
                  : 'bg-[#111827] hover:bg-black'
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

export default ProductCard;
