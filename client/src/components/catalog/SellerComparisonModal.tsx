import React from 'react';
import { X, Store, MapPin, CheckCircle2, AlertTriangle, ShoppingCart, Star } from 'lucide-react';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';
import { useCart } from '../../context/CartContext.js';

interface SellerComparisonModalProps {
  product: CanonicalProduct | null;
  offers: MultiSellerOffer[];
  isOpen: boolean;
  onClose: () => void;
}

export const SellerComparisonModal: React.FC<SellerComparisonModalProps> = ({
  product,
  offers,
  isOpen,
  onClose
}) => {
  const { addItem } = useCart();

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex gap-4">
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-white"
            />
            <div>
              <span className="text-[11px] font-bold text-[#167D73] bg-[#E9F7F3] px-2 py-0.5 rounded-full uppercase">
                {product.category}
              </span>
              <h3 className="font-extrabold text-gray-900 text-lg leading-tight mt-1">{product.title}</h3>
              <p className="text-xs text-gray-500 font-medium">Brand: {product.brand} · Compare local Bengaluru stores</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offers List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {offers.length} Participating Sellers in Bengaluru
          </div>

          {offers.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No active merchant offers in this city.</p>
          ) : (
            offers.map((offer, idx) => (
              <div 
                key={offer.listingId} 
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  idx === 0 
                    ? 'border-[#167D73] bg-[#E9F7F3]/40 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Store Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#167D73]" />
                      {offer.merchant.shopName}
                    </span>
                    {idx === 0 && (
                      <span className="bg-[#167D73] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Lowest Price
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {offer.store.name} ({offer.store.distanceKm} km away)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {offer.merchant.rating}
                    </span>
                  </div>

                  {/* Stock Indicator */}
                  <div className="pt-1">
                    {offer.availableQuantity > 2 ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> In Stock ({offer.availableQuantity} units)
                      </span>
                    ) : offer.availableQuantity > 0 ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                        <AlertTriangle className="w-3 h-3" /> Only {offer.availableQuantity} remaining!
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-max">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-[#111827]">
                      ₹{offer.sellingPrice.toLocaleString('en-IN')}
                    </div>
                    {offer.originalMrp && (
                      <div className="text-xs text-gray-400 line-through">
                        ₹{offer.originalMrp.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  <button
                    disabled={offer.availableQuantity <= 0}
                    onClick={() => {
                      addItem({
                        listingId: offer.listingId,
                        storeId: offer.store.storeId,
                        productId: product.id,
                        title: product.title,
                        shopName: offer.merchant.shopName,
                        shopSlug: offer.merchant.shopSlug,
                        price: offer.sellingPrice,
                        originalMrp: offer.originalMrp,
                        quantity: 1,
                        imageUrl: product.imageUrl
                      });
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                      offer.availableQuantity > 0 
                        ? 'bg-[#167D73] hover:bg-[#105B55] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Select Seller</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>PostgreSQL protects atomic checkout across all participating merchants.</span>
          <button onClick={onClose} className="font-bold text-gray-700 hover:text-black">Close</button>
        </div>
      </div>
    </div>
  );
};
