import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, X, ChevronRight, ChevronDown, RefreshCw, 
  Heart, ShoppingBag, Eye, Star, SlidersHorizontal, ArrowUpDown,
  MapPin, ShoppingCart
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { DetailedProduct, CategoryHierarchy } from '../../../../shared/types.js';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, wishlistCount, refreshWishlistCount } = useAuth();

  // URL query params
  const categoryParam = searchParams.get('category') || 'all';
  const subcategoryParam = searchParams.get('subcategory') || 'all';
  const brandParam = searchParams.get('brand') || 'all';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'featured';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const qParam = searchParams.get('q') || '';

  // Local state
  const [products, setProducts] = useState<DetailedProduct[]>([]);
  const [taxonomy, setTaxonomy] = useState<CategoryHierarchy[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([categoryParam]));
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  // Search input state
  const [searchInput, setSearchInput] = useState(qParam);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<DetailedProduct | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const userId = user?.id || 'usr-default-customer';

  // Load taxonomy on mount
  useEffect(() => {
    api.getTaxonomy().then(cats => {
      if (Array.isArray(cats)) {
        setTaxonomy(cats);
      }
    }).catch(console.error);

    // Load initial wishlist state
    api.getWishlist(userId).then(list => {
      if (Array.isArray(list)) {
        setWishlistIds(new Set(list.map(p => p.id)));
      }
    }).catch(() => {});
  }, [userId]);

  // Load products when query params change
  useEffect(() => {
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getDetailedProducts({
        category: categoryParam !== 'all' ? categoryParam : undefined,
        subcategory: subcategoryParam !== 'all' ? subcategoryParam : undefined,
        brand: brandParam !== 'all' ? brandParam : undefined,
        minPrice: minPriceParam ? Number(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
        inStock: inStockParam || undefined,
        search: qParam || undefined,
        sort: sortParam,
        page: pageParam,
        limit: 20
      });

      if (res && Array.isArray(res.data)) {
        setProducts(res.data);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);

        // Extract brands
        const brands = Array.from(new Set(res.data.map(p => p.brand))).sort();
        setAvailableBrands(prev => Array.from(new Set([...prev, ...brands])));
      }
    } catch (err) {
      console.error('Failed to load catalogue products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update query params
  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === 'all' || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset to page 1 on filter changes unless changing page directly
    if (!('page' in updates)) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ q: searchInput.trim() || null });
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const handleToggleWishlist = async (product: DetailedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleWishlist(product.id, userId);
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (res.inWishlist) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
      refreshWishlistCount();
      showToast(res.inWishlist ? 'Saved to your wishlist' : 'Removed from wishlist');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (product: DetailedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
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
    showToast(`Added ${product.title.substring(0, 24)}... to cart!`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  return (
    <div className="min-h-screen bg-[#FBF7EF] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs & Header */}
        <div className="mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link to="/" className="hover:text-[#105B55]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800">Marketplace Catalogue</span>
            {categoryParam !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[#105B55] font-semibold capitalize">
                  {taxonomy.find(c => c.id === categoryParam)?.name || categoryParam}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#111827]">
                Marketplace Catalogue
              </h1>
              <p className="text-xs sm:text-sm text-[#687385] mt-0.5">
                Showing {totalCount} verified database products across 10 departments
              </p>
            </div>

            {/* Mobile Filter Toggle & Quick Search */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search catalogue..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-[#105B55]"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </form>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1 text-xs font-semibold"
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills Strip */}
        {(categoryParam !== 'all' || subcategoryParam !== 'all' || brandParam !== 'all' || qParam || inStockParam) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-2.5 bg-white border border-gray-200 rounded-xl text-xs">
            <span className="text-gray-400 font-medium">Active Filters:</span>
            {categoryParam !== 'all' && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                Category: {taxonomy.find(c => c.id === categoryParam)?.name || categoryParam}
                <button onClick={() => updateQuery({ category: null, subcategory: null })} className="hover:text-red-500">✕</button>
              </span>
            )}
            {subcategoryParam !== 'all' && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                Subcategory: {subcategoryParam}
                <button onClick={() => updateQuery({ subcategory: null })} className="hover:text-red-500">✕</button>
              </span>
            )}
            {brandParam !== 'all' && (
              <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-full flex items-center gap-1 border border-teal-200">
                Brand: {brandParam}
                <button onClick={() => updateQuery({ brand: null })} className="hover:text-red-500">✕</button>
              </span>
            )}
            {qParam && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full flex items-center gap-1">
                "{qParam}"
                <button onClick={() => updateQuery({ q: null })} className="hover:text-red-500">✕</button>
              </span>
            )}
            {inStockParam && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full flex items-center gap-1">
                In Stock Only
                <button onClick={() => updateQuery({ inStock: null })} className="hover:text-red-500">✕</button>
              </span>
            )}
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-red-600 hover:underline font-semibold ml-auto"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Grid: Left Filter Sidebar + Right Products List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ── LEFT DESKTOP FILTER SIDEBAR ──────────────────────────── */}
          <aside className="hidden lg:block space-y-6">
            
            {/* 10 Departments & 59 Subcategories Accordion */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center justify-between">
                <span>Categories</span>
                <span className="text-[11px] font-mono font-normal text-gray-400">10 DEPARTMENTS</span>
              </h3>

              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => updateQuery({ category: null, subcategory: null })}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    categoryParam === 'all'
                      ? 'bg-[#105B55] text-white font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] font-mono opacity-80">{totalCount}</span>
                </button>

                {taxonomy.map((cat) => {
                  const isSelected = categoryParam === cat.id;
                  const isExpanded = expandedCategories.has(cat.id);

                  return (
                    <div key={cat.id} className="space-y-0.5">
                      <div className="flex items-center justify-between group">
                        <button
                          type="button"
                          onClick={() => {
                            updateQuery({ category: cat.id, subcategory: null });
                            if (!isExpanded) toggleCategoryExpand(cat.id);
                          }}
                          className={`flex-1 text-left py-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50 text-[#105B55] font-bold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] font-mono text-gray-400 ml-1">
                            {cat.count}
                          </span>
                        </button>
                        
                        {cat.subcategories?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpand(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Subcategories Shelf */}
                      {isExpanded && cat.subcategories?.length > 0 && (
                        <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-emerald-100 ml-3">
                          {cat.subcategories.map(sub => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => updateQuery({ category: cat.id, subcategory: sub.id })}
                              className={`w-full text-left py-1 px-2 rounded-md text-[11px] transition-colors flex items-center justify-between ${
                                subcategoryParam === sub.id
                                  ? 'bg-emerald-100/80 text-[#105B55] font-bold'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span className="truncate">{sub.name}</span>
                              {sub.productCount !== undefined && (
                                <span className="font-mono text-[9px] text-gray-400">{sub.productCount}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Price (INR)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono">Min (₹)</label>
                  <input
                    type="number"
                    value={minPriceParam}
                    onChange={(e) => updateQuery({ minPrice: e.target.value || null })}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono">Max (₹)</label>
                  <input
                    type="number"
                    value={maxPriceParam}
                    onChange={(e) => updateQuery({ maxPrice: e.target.value || null })}
                    placeholder="200000"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {/* Quick Price Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => updateQuery({ minPrice: null, maxPrice: '1000' })}
                  className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Under ₹1K
                </button>
                <button
                  type="button"
                  onClick={() => updateQuery({ minPrice: '1000', maxPrice: '5000' })}
                  className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  ₹1K - ₹5K
                </button>
                <button
                  type="button"
                  onClick={() => updateQuery({ minPrice: '5000', maxPrice: '25000' })}
                  className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  ₹5K - ₹25K
                </button>
                <button
                  type="button"
                  onClick={() => updateQuery({ minPrice: '25000', maxPrice: null })}
                  className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Above ₹25K
                </button>
              </div>
            </div>

            {/* In Stock & Availability */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                Availability
              </h3>
              <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateQuery({ inStock: e.target.checked ? 'true' : null })}
                  className="w-4 h-4 rounded text-[#105B55] focus:ring-[#105B55] border-gray-300"
                />
                <span>In Stock Only (Ready to Dispatch)</span>
              </label>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center justify-between">
                  <span>Brands</span>
                  {brandParam !== 'all' && (
                    <button onClick={() => updateQuery({ brand: null })} className="text-[10px] text-red-500 hover:underline">
                      Reset
                    </button>
                  )}
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1 text-xs pr-1">
                  {availableBrands.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateQuery({ brand: brandParam === b ? null : b })}
                      className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                        brandParam === b
                          ? 'bg-emerald-50 text-[#105B55] font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{b}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </aside>

          {/* ── RIGHT PRODUCTS GRID ──────────────────────────────────── */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar: Total Count + Sort Selector */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-xs text-gray-600 font-medium">
                Showing <b className="text-gray-900">{products.length}</b> of {totalCount} items
              </span>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                <select
                  value={sortParam}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  className="bg-transparent text-xs font-semibold text-gray-900 outline-none cursor-pointer"
                >
                  <option value="featured">Featured / Bestsellers</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                  <option value="discount">Biggest Discount %</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-2 border-[#105B55] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-mono">Filtering 195 products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8">
                <p className="text-base font-bold text-gray-800">No products match your active filters</p>
                <p className="text-xs text-gray-500 mt-1">Try resetting your price or category filters to see more results.</p>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="mt-4 px-4 py-2 bg-[#105B55] text-white text-xs font-semibold rounded-lg hover:bg-[#0c4742] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="product-grid" id="catalogProductGrid">
                {products.map((p) => {
                  const isWishlisted = wishlistIds.has(p.id);

                  return (
                    <article
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="product-card group relative cursor-pointer"
                    >
                      {/* 1. Product image container at the top (4:3 aspect ratio, object-fit contain, centered) */}
                      <div className="product-image-container relative">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="product-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
                          }}
                        />

                        {/* Discount Pill */}
                        {p.discountPercent > 0 && (
                          <span className="absolute top-3 left-3 bg-[#105B55] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            {p.discountPercent}% OFF
                          </span>
                        )}

                        {/* 2. Wishlist Heart Toggle in image's top-right corner */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleWishlist(p, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-gray-700 flex items-center justify-center shadow-xs hover:shadow-md transition-all cursor-pointer z-10"
                          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                        </button>

                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(p);
                          }}
                          className="absolute bottom-2.5 right-2.5 py-1 px-2.5 rounded-md bg-white/90 hover:bg-white text-[11px] font-medium text-gray-800 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer z-10"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Quick View
                        </button>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                        <div className="space-y-1.5">
                          {/* 3. Product category or brand */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase font-bold text-[#105B55] tracking-wider">
                              {p.brand}
                            </span>
                            <span className="text-[11px] font-medium text-[#687385]">
                              {p.categoryName}
                            </span>
                          </div>

                          {/* 4. Product name */}
                          <h3 className="font-bold text-sm sm:text-base text-[#111827] line-clamp-2 leading-snug group-hover:text-[#167D73] transition-colors">
                            {p.title}
                          </h3>

                          {/* 5. Store name and location */}
                          <div className="flex items-center gap-1.5 text-xs text-[#687385]">
                            <MapPin className="w-3.5 h-3.5 text-[#167D73] shrink-0" />
                            <span className="truncate">
                              Indira Retail Hub · Bengaluru
                            </span>
                          </div>

                          {/* 6. Rating and reviews */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <div className="flex items-center gap-1 text-amber-500 text-xs">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="font-bold text-[#111827]">{p.rating || 4.5}</span>
                            </div>
                            <span className="text-xs text-[#687385]">
                              ({p.reviewsCount || 10} reviews)
                            </span>
                            {p.stockQuantity !== undefined && (
                              <span className="ml-auto text-[11px] font-semibold text-[#167D73]">
                                In Stock ({p.stockQuantity})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 7. Current & Original Price + 8. Add to Cart Button */}
                        <div className="pt-3 border-t border-[#F1F4F7] flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-[#111827]">
                                ₹{p.price.toLocaleString('en-IN')}
                              </span>
                              {p.originalMrp > p.price && (
                                <s className="text-xs text-[#687385] font-normal">
                                  ₹{p.originalMrp.toLocaleString('en-IN')}
                                </s>
                              )}
                            </div>
                          </div>

                          {/* 8. Add to Cart Button */}
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(p, e)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#105B55] hover:bg-[#0c4742] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={pageParam <= 1}
                  onClick={() => updateQuery({ page: String(pageParam - 1) })}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => updateQuery({ page: String(pNum) })}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold font-mono transition-colors ${
                        pageParam === pNum
                          ? 'bg-[#105B55] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={pageParam >= totalPages}
                  onClick={() => updateQuery({ page: String(pageParam + 1) })}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col sm:flex-row gap-6 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Product Image */}
            <div className="w-full sm:w-1/2 aspect-square rounded-xl overflow-hidden bg-gray-50">
              <img
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="w-full sm:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-[#105B55]">
                  {quickViewProduct.brand} · SKU: {quickViewProduct.sku}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {quickViewProduct.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-xl font-bold text-gray-900 font-mono">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.originalMrp > quickViewProduct.price && (
                    <span className="text-xs text-gray-400 line-through font-mono">
                      ₹{quickViewProduct.originalMrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {quickViewProduct.discountPercent > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {quickViewProduct.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs text-emerald-700 font-semibold">
                  ✓ {quickViewProduct.stockQuantity} units available for instant dispatch
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    handleAddToCart(quickViewProduct, e);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-2.5 px-4 bg-[#105B55] hover:bg-[#0c4742] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/products/${quickViewProduct.id}`)}
                  className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  View Full Details & Specifications →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fadeIn">
          {toastMsg}
        </div>
      )}

    </div>
  );
};
