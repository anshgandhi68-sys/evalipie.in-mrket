"use client";

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Store, MapPin, Star, ShieldCheck, Sparkles, Check, ShoppingCart, 
  ArrowLeft, Truck, Clock, RefreshCw, AlertCircle, ChevronRight, Layers, SlidersHorizontal
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

      // Load similar products in the same category
      if (data.product.category) {
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
    const price = selectedOffer ? selectedOffer.sellingPrice : 0;
    const shopName = selectedOffer ? selectedOffer.merchant.shopName : 'Local Merchant';
    const shopSlug = selectedOffer ? selectedOffer.merchant.shopSlug : 'local-shop';
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

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#167D73]" />
          <p className="text-sm font-semibold">Loading verified catalogue product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Product Not Found</h2>
          <p className="text-xs text-gray-500 font-medium">
            The product identifier <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-bold">{id}</code> does not match any record in the Evalipie catalogue.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/products"
              className="bg-[#167D73] hover:bg-[#105B55] text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              Browse Full Catalogue
            </Link>
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-900 text-xs font-semibold py-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mrp = selectedOffer?.originalMrp || Math.round((selectedOffer?.sellingPrice || 0) * 1.25);
  const sellingPrice = selectedOffer ? selectedOffer.sellingPrice : 0;
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-[#167D73] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#167D73] transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </nav>

        {/* Main Product Showcase Box */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Product Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square bg-[#F8FAFC] rounded-2xl overflow-hidden p-8 border border-gray-100 flex items-center justify-center group">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-[#DC2626] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Guaranteed Trust Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-600 font-semibold pt-2">
              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-[#167D73] mx-auto mb-1" />
                <span>100% Genuine</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span>30-Min Fast Track</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span>Free Local Pickup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Sellers, Buy Box (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              {/* Brand & Category */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-400 uppercase tracking-wider text-[11px]">
                  {product.brand}
                </span>
                <span className="bg-[#E9F7F3] text-[#167D73] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Evalipie Verified Shelf Stock</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.title}
              </h1>

              {/* Rating & In-Stock Status */}
              <div className="flex items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1 bg-[#059669] text-white font-extrabold px-2 py-0.5 rounded-md">
                  <span>4.8</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-gray-400 font-medium">310 verified customer ratings</span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1 font-bold text-[#059669]">
                  <Sparkles className="w-3.5 h-3.5 fill-[#059669]" />
                  <span>Physical Units Verified In Stock</span>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-[#F8FAFC] border border-gray-200/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-base text-gray-400 line-through font-medium">
                    ₹{mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    Save ₹{(mrp - sellingPrice).toLocaleString('en-IN')} ({discountPercent}%)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Inclusive of all taxes · Cash on Delivery & UPI available
              </p>
            </div>

            {/* Multi-Seller Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#167D73]" />
                  <span>Select Local Store ({offers.length} sellers available):</span>
                </h3>
                {offers.length > 1 && (
                  <button
                    onClick={() => setIsCompareModalOpen(true)}
                    className="text-xs font-bold text-[#167D73] hover:underline cursor-pointer"
                  >
                    Compare All Stores
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {offers.map((offer, idx) => {
                  const isSelected = selectedOfferIndex === idx;
                  return (
                    <div
                      key={offer.listingId}
                      onClick={() => setSelectedOfferIndex(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#167D73] bg-[#E9F7F3]/40 shadow-xs ring-2 ring-[#167D73]/20' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span className="truncate">{offer.merchant.shopName}</span>
                        <span className="text-sm font-black text-[#167D73]">₹{offer.sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#167D73]" />
                          <span>{offer.store?.name || 'Bengaluru'} ({offer.store?.distanceKm ?? 1.2} km)</span>
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {offer.availableQuantity} in stock
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
              <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50 p-1 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-xl hover:bg-white flex items-center justify-center font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-extrabold text-sm text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-xl hover:bg-white flex items-center justify-center font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#111827] hover:bg-black text-white px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add {quantity} to Cart · ₹{(sellingPrice * quantity).toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              {/* View Storefront Link */}
              {selectedOffer && (
                <Link
                  to={`/shop/${selectedOffer.merchant.shopSlug}`}
                  className="border border-gray-200 hover:border-gray-400 text-gray-800 px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Store className="w-4 h-4 text-gray-500" />
                  <span>Visit Shop</span>
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Product Specifications & Full Description */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl font-black text-gray-900">Product Details & Specifications</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Verified physical manufacturer specifications</p>
          </div>

          <p className="text-sm text-gray-700 font-medium leading-relaxed">
            {product.description}
          </p>

          {/* Specifications Table */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody>
                  {Object.entries(product.attributes).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-5 py-3 font-bold text-gray-600 uppercase tracking-wider w-1/3 border-b border-gray-100">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900 border-b border-gray-100">
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                  {product.upcEan && (
                    <tr className="bg-gray-50">
                      <td className="px-5 py-3 font-bold text-gray-600 uppercase tracking-wider w-1/3">
                        UPC / Barcode (EAN)
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        {product.upcEan}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Similar / Relevant Products in Same Category */}
        {similarProducts.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-black text-gray-900">Similar Products You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((item: any) => (
                <Link
                  key={item.product.id}
                  to={`/products/${item.product.id}`}
                  className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-[#167D73] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden p-3 flex items-center justify-center">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.title} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.product.brand}</span>
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight group-hover:text-[#167D73] transition-colors">
                      {item.product.title}
                    </h4>
                    <div className="text-sm font-black text-gray-900 mt-1">
                      ₹{item.minPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Seller Comparison Modal */}
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
