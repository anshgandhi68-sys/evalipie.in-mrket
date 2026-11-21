import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Store, MapPin, ShieldCheck, Check, ShoppingBag, 
  ArrowLeft, Truck, Clock, RefreshCw, AlertCircle, ChevronRight, Eye 
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<CanonicalProduct | null>(null);
  const [offers, setOffers] = useState<MultiSellerOffer[]>([]);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProduct(id);
  }, [id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProductById(productId);
      setProduct(data.product);
      setOffers(data.offers || []);
      setSelectedOfferIndex(0);

      if (data.product?.category) {
        api.getProducts({ category: data.product.category })
          .then(res => {
            setSimilarProducts(res.filter(p => p.product.id !== productId).slice(0, 4));
          })
          .catch(console.error);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Product not found in catalogue');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOffer = offers[selectedOfferIndex] || (offers.length > 0 ? offers[0] : null);

  const handleAddToCart = () => {
    if (!product) return;
    const price = selectedOffer ? selectedOffer.sellingPrice : 1999;
    const shopName = selectedOffer ? selectedOffer.merchant.shopName : 'Central Retail Hub';
    const shopSlug = selectedOffer ? selectedOffer.merchant.shopSlug : 'central-hub';
    const storeId = selectedOffer ? selectedOffer.store.storeId : 'store-default';
    const listingId = selectedOffer ? selectedOffer.listingId : `list-${product.id}`;

    addItem({
      listingId,
      storeId,
      productId: product.id,
      title: product.title,
      shopName,
      shopSlug,
      price,
      originalMrp: selectedOffer?.originalMrp || Math.round(price * 1.25),
      quantity,
      imageUrl: product.imageUrl
    });

    window.dispatchEvent(new CustomEvent('order-placed-event'));
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F5F0] py-16 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3 text-[#5A5852]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#111111]" />
          <p className="text-xs uppercase tracking-wider">RETRIEVING PHYSICAL INVENTORY SPECIFICATION...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F6F5F0] py-20 px-4 font-mono">
        <div className="max-w-md mx-auto bg-[#FFFFFF] p-8 border border-[#111111] shadow-architectural text-center space-y-4 rounded-[0px]">
          <div className="w-12 h-12 bg-[#F8EDE8] border border-[#B84A27] text-[#B84A27] flex items-center justify-center mx-auto rounded-[0px]">
            <AlertCircle className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h2 className="font-display font-bold text-xl text-[#111111] uppercase tracking-wide">
            CATALOG RECORD NOT FOUND
          </h2>
          <p className="text-xs text-[#5A5852] font-sans">
            Identifier <code className="bg-[#F6F5F0] border border-[#E4E2DA] px-1.5 py-0.5 text-[#111111] font-mono">{id}</code> has no active inventory index in this metro hub.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/products"
              className="bg-[#111111] hover:bg-[#B84A27] text-white py-3 rounded-[0px] text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              BROWSE ACTIVE CATALOG
            </Link>
            <Link
              to="/"
              className="text-[#5A5852] hover:text-[#111111] text-xs font-mono py-1.5"
            >
              RETURN TO HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mrp = selectedOffer?.originalMrp || Math.round((selectedOffer?.sellingPrice || 1999) * 1.25);
  const sellingPrice = selectedOffer ? selectedOffer.sellingPrice : 1999;
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const skuCode = product.id.replace('prod-', '').toUpperCase();

  return (
    <div className="min-h-screen bg-[#F6F5F0] py-8 text-[#111111] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#5A5852] overflow-x-auto">
          <Link to="/" className="hover:text-[#111111]">STOREFRONT</Link>
          <ChevronRight className="w-3.5 h-3.5 stroke-[1.5] shrink-0" />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#111111] uppercase">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 stroke-[1.5] shrink-0" />
          <span className="text-[#111111] font-bold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Product Showcase Box */}
        <div className="bg-[#FFFFFF] border border-[#111111] p-6 sm:p-10 shadow-architectural grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 rounded-[0px]">
          
          {/* Left Column: Studio Product Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-4/3 bg-[#F6F5F0] border border-[#E4E2DA] overflow-hidden p-6 flex items-center justify-center rounded-[0px]">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover rounded-[0px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
                }}
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider rounded-[0px]">
                  -{discountPercent}% OFF
                </span>
              )}
              <span className="absolute bottom-3 left-3 bg-[#FFFFFF] border border-[#111111] text-[#111111] text-[10px] font-mono px-2 py-0.5 uppercase rounded-[0px]">
                SKU: {skuCode}
              </span>
            </div>

            {/* Guaranteed Trust Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-[#5A5852] pt-1">
              <div className="bg-[#F6F5F0] p-2.5 border border-[#E4E2DA] rounded-[0px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111] mx-auto mb-1 stroke-[1.5]" />
                <span className="font-bold uppercase text-[#111111] block">AUDITED</span>
                <span>PHYSICAL STOCK</span>
              </div>
              <div className="bg-[#F6F5F0] p-2.5 border border-[#E4E2DA] rounded-[0px]">
                <Clock className="w-3.5 h-3.5 text-[#111111] mx-auto mb-1 stroke-[1.5]" />
                <span className="font-bold uppercase text-[#111111] block">DISPATCH</span>
                <span>SAME-DAY METRO</span>
              </div>
              <div className="bg-[#F6F5F0] p-2.5 border border-[#E4E2DA] rounded-[0px]">
                <Truck className="w-3.5 h-3.5 text-[#111111] mx-auto mb-1 stroke-[1.5]" />
                <span className="font-bold uppercase text-[#111111] block">STORE PICKUP</span>
                <span>AVAILABLE</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Sellers, Pricing, Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#5A5852] uppercase">
                <span className="font-bold text-[#111111] tracking-wider">
                  {product.brand}
                </span>
                <span className="bg-[#F6F5F0] border border-[#E4E2DA] px-2 py-0.5 text-[10px]">
                  {product.category}
                </span>
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#111111] uppercase tracking-tight">
                {product.title}
              </h1>

              <p className="text-xs text-[#5A5852] font-mono pt-1">
                VERIFIED SHELF UNIT IN CENTRAL HUB : ROW-LEVEL LOCK ACTIVE
              </p>
            </div>

            {/* Pricing Box */}
            <div className="bg-[#F6F5F0] border border-[#E4E2DA] p-5 space-y-1 font-mono rounded-[0px]">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#111111]">
                  INR {sellingPrice.toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-sm text-[#5A5852] line-through">
                    INR {mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#5A5852] uppercase">
                INCLUSIVE OF ALL TAXES : COMPLIMENTARY LOCAL DELIVERY
              </p>
            </div>

            {/* Multi-Seller Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#111111] uppercase flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 stroke-[1.5]" />
                  SELECT LOCAL FULFILLMENT MERCHANT:
                </span>
                {offers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(true)}
                    className="text-[#B84A27] hover:underline font-bold"
                  >
                    COMPARE ALL STORES
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {offers.map((offer, idx) => {
                  const isSelected = selectedOfferIndex === idx;
                  return (
                    <div
                      key={offer.listingId || idx}
                      onClick={() => setSelectedOfferIndex(idx)}
                      className={`p-3 border text-xs font-mono cursor-pointer transition-colors rounded-[0px] ${
                        isSelected 
                          ? 'border-[#111111] bg-[#FFFFFF] shadow-crisp' 
                          : 'border-[#E4E2DA] hover:border-[#111111] bg-[#F6F5F0]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[#111111]">
                        <span className="truncate">{offer.merchant.shopName}</span>
                        <span>INR {offer.sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#5A5852] mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#B84A27] stroke-[1.5]" />
                          <span>{offer.store?.name || 'Central'}</span>
                        </span>
                        <span className="text-[#111111] font-bold">
                          {offer.availableQuantity} IN STOCK
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-[#111111] bg-[#FFFFFF] p-1 w-fit rounded-[0px]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 font-mono font-bold text-xs hover:bg-[#F6F5F0] flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-bold text-xs text-[#111111]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 font-mono font-bold text-xs hover:bg-[#F6F5F0] flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-[#111111] hover:bg-[#B84A27] text-white px-8 text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-[0px] transition-colors shadow-architectural cursor-pointer"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 stroke-[1.5]" />
                    <span>RESERVED IN CART</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                    <span>ADD {quantity} TO CART : INR {(sellingPrice * quantity).toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-[#FFFFFF] border border-[#E4E2DA] p-6 sm:p-10 shadow-architectural space-y-6 rounded-[0px]">
          <div>
            <h2 className="font-display font-bold text-lg text-[#111111] uppercase tracking-wide">
              PRODUCT SPECIFICATIONS & TELEMETRY
            </h2>
            <p className="text-xs font-mono text-[#5A5852] mt-0.5">
              Verified physical attributes matching Indian retail packaging.
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#5A5852] font-sans leading-relaxed">
            {product.description}
          </p>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="border border-[#E4E2DA] rounded-[0px] overflow-hidden">
              <table className="w-full text-xs font-mono text-left">
                <tbody className="divide-y divide-[#E4E2DA]">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <tr key={key} className="bg-[#FFFFFF] hover:bg-[#F6F5F0]">
                      <td className="px-4 py-2.5 font-bold text-[#5A5852] uppercase w-1/3">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-2.5 text-[#111111]">
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-[#111111] uppercase tracking-wide">
              SIMILAR RETAIL ALLOCATIONS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((item: any) => (
                <Link
                  key={item.product.id}
                  to={`/products/${item.product.id}`}
                  className="bg-[#FFFFFF] p-4 border border-[#E4E2DA] hover:border-[#111111] transition-colors flex flex-col justify-between gap-3 group rounded-[0px] shadow-architectural"
                >
                  <div className="aspect-4/3 bg-[#F6F5F0] overflow-hidden flex items-center justify-center p-2 rounded-[0px]">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#5A5852] uppercase block">{item.product.brand}</span>
                    <h4 className="font-sans font-semibold text-xs text-[#111111] line-clamp-2 group-hover:text-[#B84A27] transition-colors">
                      {item.product.title}
                    </h4>
                    <div className="font-mono text-xs font-bold text-[#111111] mt-1">
                      INR {item.minPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <SellerComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        product={product}
        offers={offers}
      />
    </div>
  );
};

export default ProductDetailPage;
