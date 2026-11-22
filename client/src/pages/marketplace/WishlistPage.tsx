import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { DetailedProduct } from '../../../../shared/types.js';

export const WishlistPage: React.FC = () => {
  const { user, refreshWishlistCount } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState<DetailedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const userId = user?.id || 'usr-default-customer';

  useEffect(() => {
    loadWishlist();
  }, [userId]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const items = await api.getWishlist(userId);
      setWishlistItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await api.toggleWishlist(productId, userId);
      setWishlistItems(prev => prev.filter(p => p.id !== productId));
      refreshWishlistCount();
      showToast('Item removed from your wishlist.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToCart = (product: DetailedProduct) => {
    addItem({
      listingId: `list-${product.id}`,
      storeId: 'store-apex-indira',
      productId: product.id,
      title: product.title,
      shopName: 'Evalipie Express Central',
      shopSlug: 'apex-audio',
      price: product.price,
      originalMrp: product.originalMrp,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    handleRemove(product.id);
    showToast('Moved item to cart!');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FBF7EF] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#105B55] font-mono font-bold mb-1">
              <Heart className="w-4 h-4 fill-[#105B55] text-[#105B55]" />
              Saved Items
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#111827]">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[#687385] mt-1">
              Items you've bookmarked for later consideration.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-800 hover:bg-gray-50 shadow-2xs transition-colors self-start sm:self-auto"
          >
            Continue Shopping
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fadeIn">
            {toastMsg}
          </div>
        )}

        {/* Wishlist Items List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#105B55] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-mono">Loading wishlist items...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Heart className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Explore our 195-product multi-category catalogue and tap the heart icon on any card to save your favorites.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#105B55] hover:bg-[#0c4742] text-white text-xs font-semibold shadow-sm transition-all"
            >
              Browse Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 product-grid">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="product-card group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div 
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="product-image-container relative cursor-pointer"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />
                    {product.discountPercent > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-[#105B55] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        {product.discountPercent}% OFF
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(product.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-red-500 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 sm:p-5">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#105B55] tracking-wider block mb-1">
                      {product.brand}
                    </span>
                    <h3 
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-[#105B55] leading-snug"
                    >
                      {product.title}
                    </h3>

                    {/* Strict Data Honesty Rating */}
                    {product.reviewsCount > 0 ? (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="text-xs font-bold text-gray-800">{product.rating}</span>
                        <span className="text-[11px] text-gray-400">({product.reviewsCount})</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 mt-2 block italic">No reviews yet</span>
                    )}

                    <div className="flex items-baseline gap-2 mt-2.5">
                      <span className="text-base font-bold text-gray-900 font-mono">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalMrp > product.price && (
                        <span className="text-xs text-gray-400 line-through font-mono">
                          ₹{product.originalMrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move to Cart Action */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#105B55] hover:bg-[#0c4742] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
