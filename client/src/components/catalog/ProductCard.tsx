import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, MapPin, Store, Zap, Check } from 'lucide-react';
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
  availableStock?: number;
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
  featuredStoreName = 'City Supermarket (Indiranagar)',
  badge = 'Fresh Stock',
}) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Compute realistic MRP and discount percent
  const mrp = originalMrp || Math.round(minPrice * 1.18);
  const discountPercent = mrp > minPrice ? Math.round(((mrp - minPrice) / mrp) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;

    addItem({
      listingId: `list-quick-${product.id}`,
      storeId: 'store-hub',
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
    setTimeout(() => setAdded(false), 1600);
  };

  const handleOpenDetail = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <article className="bg-white rounded-2xl border border-[#E5EAF0] hover:border-[#167D73]/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden p-4 group">
      <div>
        
        {/* Top Badges Row matching Screenshot 1 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {discountPercent > 0 && (
              <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {discountPercent}% OFF
              </span>
            )}
            {badge && (
              <span className="bg-[#064E3B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 bg-[#E6F4EA] text-[#167D73] text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0">
            <MapPin className="w-3 h-3 text-[#167D73]" />
            <span>{distanceKm} km</span>
          </div>
        </div>

        {/* Real Product Photography matching Screenshot 1 */}
        <div 
          onClick={handleOpenDetail}
          className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-gray-50 mb-3 cursor-pointer flex items-center justify-center"
        >
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Brand & Category row */}
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-[#64748B] tracking-wider uppercase text-[11px]">
            {product.brand}
          </span>
          <span className="bg-[#F1F5F9] text-[#64748B] text-[10px] font-medium px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>

        {/* Product Title */}
        <h3 
          onClick={handleOpenDetail}
          className="font-bold text-[14px] text-[#111827] leading-snug line-clamp-2 hover:text-[#167D73] transition-colors cursor-pointer min-h-[40px] mb-2"
        >
          {product.title}
        </h3>

        {/* Rating & Stock Status */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-bold text-[#111827]">{rating}</span>
            <span className="text-[#94A3B8]">({reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1 text-[#16A34A] font-semibold text-xs">
            <Zap className="w-3.5 h-3.5 fill-[#16A34A] text-[#16A34A]" />
            <span>Store In Stock</span>
          </div>
        </div>

        {/* Store Proximity Row */}
        <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#475569] mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <Store className="w-3.5 h-3.5 text-[#167D73] shrink-0" />
            <span className="truncate">{featuredStoreName}</span>
          </div>
          {sellerCount > 1 && (
            <span className="bg-white border border-[#E2E8F0] text-[#64748B] text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ml-1">
              +{sellerCount - 1} more
            </span>
          )}
        </div>

      </div>

      {/* Bottom Price & Action Buttons matching Screenshot 1 */}
      <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2 mt-auto">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-[#111827]">
              ₹{minPrice.toLocaleString('en-IN')}
            </span>
            {mrp > minPrice && (
              <span className="text-xs text-[#94A3B8] line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#94A3B8] block">
            Inclusive of all taxes
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCompare(product)}
            className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:border-[#111827] text-[#111827] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Compare
          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!inStock}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              !inStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : added
                ? 'bg-[#167D73] text-white'
                : 'bg-[#111827] hover:bg-[#167D73] text-white shadow-sm'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : inStock ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            ) : (
              <span>Out of Stock</span>
            )}
          </button>
        </div>
      </div>

    </article>
  );
};

export default ProductCard;
