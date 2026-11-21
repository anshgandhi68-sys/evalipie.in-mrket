import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Store, MapPin, ShieldCheck, Check, ShoppingBag, 
  ArrowLeft, Truck, Clock, RefreshCw, AlertCircle, ChevronRight, 
  Heart, Star, Share2, ThumbsUp 
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { DetailedProduct, ProductReview } from '../../../../shared/types.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { user, refreshWishlistCount } = useAuth();

  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<DetailedProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Write a Review Form state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const userId = user?.id || 'usr-default-customer';

  useEffect(() => {
    if (!id) return;
    loadProductDetails(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const loadProductDetails = async (productId: string) => {
    setIsLoading(true);
    try {
      const res = await api.getDetailedProductById(productId);
      if (res && res.product) {
        setProduct(res.product);
        setReviews(res.reviews || []);
        setRelatedProducts(res.related || []);
        setSelectedImage(res.product.images?.[0] || res.product.imageUrl);

        // Check wishlist status
        api.getWishlist(userId).then(list => {
          if (Array.isArray(list)) {
            setIsWishlisted(list.some(p => p.id === res.product.id));
          }
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Failed to load product detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      const res = await api.toggleWishlist(product.id, userId);
      setIsWishlisted(res.inWishlist);
      refreshWishlistCount();
      showToast(res.inWishlist ? 'Saved to your wishlist' : 'Removed from wishlist');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      listingId: `list-${product.id}`,
      storeId: 'store-apex-indira',
      productId: product.id,
      title: product.title,
      shopName: 'Evalipie Express Fulfillment',
      shopSlug: 'apex-audio',
      price: product.price,
      originalMrp: product.originalMrp,
      quantity,
      imageUrl: product.imageUrl
    });
    showToast(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    openCart();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;
    setIsSubmittingReview(true);

    try {
      const res = await api.submitProductReview(product.id, {
        rating: reviewRating,
        title: reviewTitle.trim() || 'Verified Customer Review',
        comment: reviewComment.trim(),
        userName: user?.fullName || 'Verified Shopper',
        userId
      });

      if (res && res.review) {
        setReviews(prev => [res.review, ...prev]);
        setProduct(prev => prev ? { ...prev, rating: res.newRating, reviewsCount: res.newCount } : null);
        setIsReviewFormOpen(false);
        setReviewTitle('');
        setReviewComment('');
        showToast('Review submitted successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF7EF] flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#105B55] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-mono">Loading product details & live inventory...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBF7EF] flex items-center justify-center py-24">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-xs text-gray-500 mt-2">The product you're looking for does not exist in our active catalogue.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#105B55] text-white text-xs font-semibold rounded-lg hover:bg-[#0c4742] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const savingsAmount = product.originalMrp > product.price ? product.originalMrp - product.price : 0;

  return (
    <div className="min-h-screen bg-[#FBF7EF] py-8 md:py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#105B55]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/products" className="hover:text-[#105B55]">Marketplace Catalogue</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to={`/products?category=${product.categoryId}`} className="hover:text-[#105B55]">
            {product.categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-800 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* ── MAIN PRODUCT OVERVIEW: GALLERY + PURCHASE BOX ─────────── */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left: Multi-Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F7F7F8] border border-gray-100 flex items-center justify-center">
              <img
                src={selectedImage || product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
              {product.discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  {product.discountPercent}% OFF FESTIVAL SPECIAL
                </span>
              )}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-[#105B55] shadow-xs'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.title} angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-semibold text-gray-800">100% Genuine</span>
                <span className="text-[10px] text-gray-400">Direct Brand Warranty</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 flex flex-col items-center">
                <Truck className="w-4 h-4 text-[#105B55] mb-1" />
                <span className="font-semibold text-gray-800">Express Delivery</span>
                <span className="text-[10px] text-gray-400">Doorstep within 2-4 hrs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 flex flex-col items-center">
                <RefreshCw className="w-4 h-4 text-blue-600 mb-1" />
                <span className="font-semibold text-gray-800">7-Day Return</span>
                <span className="text-[10px] text-gray-400">Hassle-Free Replacement</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand and SKU */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase font-bold text-[#105B55] tracking-widest">
                  {product.brand}
                </span>
                <span className="text-gray-400">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-snug">
                {product.title}
              </h1>

              {/* Data Honesty: Star Rating rendered ONLY if reviews exist */}
              {product.reviewsCount > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviewsCount} verified customer reviews)</span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  No customer reviews yet — be the first to share your thoughts below.
                </div>
              )}

              {/* Pricing */}
              <div className="p-4 bg-[#FBF7EF] border border-[#EFE8DA] rounded-xl flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold font-mono text-gray-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalMrp > product.price && (
                      <span className="text-base text-gray-400 line-through font-mono">
                        ₹{product.originalMrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {savingsAmount > 0 && (
                    <p className="text-xs font-semibold text-emerald-700 mt-1">
                      You save ₹{savingsAmount.toLocaleString('en-IN')} ({product.discountPercent}% Off)
                    </p>
                  )}
                </div>

                <div className="text-right text-[11px] font-mono text-gray-500">
                  <span>Inclusive of all GST taxes</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Stock & Fulfillment Status */}
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  In Stock · {product.stockQuantity} units ready for immediate local dispatch in Bengaluru
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-l transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-mono font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-r transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3.5 px-4 rounded-xl border-2 border-[#105B55] hover:bg-emerald-50 text-[#105B55] font-semibold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3.5 px-4 rounded-xl bg-[#105B55] hover:bg-[#0c4742] text-white font-semibold text-xs tracking-wide uppercase shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Buy Now (UPI QR)
              </button>
            </div>
          </div>

        </div>

        {/* ── SPECIFICATIONS TABLE RENDERED FROM JSON ───────────────── */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-10 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 md:p-8">
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Technical Specifications & Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-500">{key}</span>
                  <span className="text-gray-900 font-medium text-right max-w-xs">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GENUINE CUSTOMER REVIEWS (Strict Data Honesty) ─────────── */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Customer Reviews
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Real feedback from verified purchasers in the marketplace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
              className="px-4 py-2 bg-[#105B55] hover:bg-[#0c4742] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              {isReviewFormOpen ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

          {/* "Write a Review" Form */}
          {isReviewFormOpen && (
            <form onSubmit={handleSubmitReview} className="mt-6 p-5 bg-[#FBF7EF] border border-[#E5EAF0] rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Share your product experience</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Rating</label>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-800">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Unbelievable performance and battery life"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-[#105B55]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Comment</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe what you liked or how this product helped you..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-[#105B55] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2 bg-[#105B55] hover:bg-[#0c4742] text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No reviews yet. Be the first customer to review this product!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-gray-900">{rev.userName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>

                  {rev.title && <h4 className="text-xs font-bold text-gray-900">{rev.title}</h4>}
                  <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS IN SAME CATEGORY ─────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-serif font-bold text-gray-900">
              Related in {product.categoryName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/products/${rel.id}`)}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-4 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3">
                      <img src={rel.imageUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold text-[#105B55]">{rel.brand}</span>
                    <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mt-1">{rel.title}</h3>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-mono font-bold text-sm text-gray-900">₹{rel.price.toLocaleString('en-IN')}</span>
                    {rel.discountPercent > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold">{rel.discountPercent}% OFF</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fadeIn">
          {toastMsg}
        </div>
      )}

    </div>
  );
};
