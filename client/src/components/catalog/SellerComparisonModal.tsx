import React from 'react';
import { X, Store, MapPin, CheckCircle2, ShoppingBag } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#111111] shadow-architectural max-w-2xl w-full max-h-[90vh] flex flex-col rounded-[0px]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E4E2DA] flex items-start justify-between bg-[#F6F5F0]">
          <div className="flex gap-4">
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="w-16 h-16 object-cover border border-[#E4E2DA] rounded-[0px] bg-white shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#111111] bg-[#FFFFFF] border border-[#111111] px-2 py-0.5 rounded-[0px] uppercase">
                {product.category}
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#111111] leading-snug">
                {product.title}
              </h3>
              <p className="text-xs font-mono text-[#5A5852]">
                BRAND: {product.brand.toUpperCase()} : VERIFIED LOCAL STOCK
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-[#5A5852] hover:text-[#111111] p-1 transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Offers List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="text-[10px] font-mono font-bold text-[#5A5852] uppercase tracking-wider">
            {offers.length} PARTICIPATING STORE OFFERS
          </div>

          {offers.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#5A5852]">
              No active merchant offers listed in this city.
            </div>
          ) : (
            offers.map((offer, idx) => (
              <div 
                key={offer.listingId || idx}
                className="p-4 border border-[#E4E2DA] hover:border-[#111111] bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors rounded-[0px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#111111] stroke-[1.5]" />
                    <span className="font-mono text-xs font-bold text-[#111111] uppercase">
                      {offer.merchant.shopName}
                    </span>
                    <span className="text-[9px] font-mono bg-[#F6F5F0] border border-[#E4E2DA] px-1.5 py-0.5 text-[#5A5852]">
                      VERIFIED MERCHANT
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-[#5A5852]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#B84A27] stroke-[1.5]" />
                      <span>{offer.store.address}, {offer.store.city}</span>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-[#111111]">
                    SHELF STOCK: <b>{offer.availableQuantity} UNITS AVAILABLE</b>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E4E2DA]">
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-[#111111] block">
                      INR {offer.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#5A5852]">
                      INC. TAXES
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addItem({
                        listingId: offer.listingId,
                        storeId: offer.store.storeId,
                        productId: product.id,
                        title: product.title,
                        shopName: offer.merchant.shopName,
                        shopSlug: offer.merchant.shopSlug,
                        price: offer.sellingPrice,
                        quantity: 1,
                        imageUrl: product.imageUrl
                      });
                      window.dispatchEvent(new CustomEvent('order-placed-event'));
                      onClose();
                    }}
                    className="h-10 px-4 bg-[#111111] hover:bg-[#B84A27] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-[0px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>SELECT</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E4E2DA] bg-[#F6F5F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#111111] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-[0px] hover:bg-[#B84A27] transition-colors"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

export default SellerComparisonModal;
