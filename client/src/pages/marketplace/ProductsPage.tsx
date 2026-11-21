import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeCity } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');
  
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'ALL';
    setSearchQuery(q);
    setSelectedCategory(cat);
    fetchProducts(q, cat);
  }, [searchParams, activeCity]);

  const fetchProducts = async (q: string, cat: string) => {
    setIsLoading(true);
    try {
      const data = await api.getProducts({
        q: q || undefined,
        category: cat && cat !== 'ALL' ? cat : undefined,
        city: activeCity
      });
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
    params.city = activeCity;
    setSearchParams(params);
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (catName !== 'ALL') params.category = catName;
    params.city = activeCity;
    setSearchParams(params);
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSearchParams({ city: activeCity });
  };

  const handleCompareSellers = async (product: CanonicalProduct) => {
    setSelectedProduct(product);
    try {
      const res = await api.getProductSellers(product.id, activeCity);
      setActiveOffers(res.offers || []);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.minPrice || 0) - (b.minPrice || 0);
    if (sortBy === 'price-desc') return (b.minPrice || 0) - (a.minPrice || 0);
    if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F6F5F0] py-8 text-[#111111] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search Header Bar */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 border border-[#111111] shadow-architectural space-y-4 rounded-[0px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#111111] uppercase tracking-tight">
                {searchParams.get('q') ? `SEARCH : "${searchParams.get('q')}"` : 'EXPLORE CATALOG'}
              </h1>
              <p className="text-xs font-mono text-[#5A5852] mt-0.5">
                VERIFIED SHELF ALLOCATIONS IN {activeCity.toUpperCase()} : TYPO-TOLERANT OPENSEARCH
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#5A5852] uppercase">SORT:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-[#F6F5F0] border border-[#E4E2DA] focus:border-[#111111] px-3 py-1.5 text-xs font-mono font-bold text-[#111111] outline-none rounded-[0px] cursor-pointer"
              >
                <option value="relevance">RELEVANCE</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
                <option value="rating">HIGHEST RATED</option>
              </select>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1 font-mono text-xs">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5852] stroke-[1.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or categories in India..."
                className="w-full pl-10 pr-10 py-3 bg-[#FFFFFF] border border-[#E4E2DA] focus:border-[#111111] text-xs font-mono outline-none rounded-[0px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5852] hover:text-[#111111]"
                >
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#111111] hover:bg-[#B84A27] text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider rounded-[0px] transition-colors cursor-pointer"
            >
              SEARCH
            </button>
          </form>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1 items-center font-mono text-xs">
            <span className="text-[10px] text-[#5A5852] uppercase mr-1">
              CATEGORY:
            </span>
            <button
              type="button"
              onClick={() => handleCategorySelect('ALL')}
              className={`px-3 py-1 border rounded-[0px] transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-[#F6F5F0] border-[#E4E2DA] text-[#5A5852] hover:text-[#111111]'
              }`}
            >
              ALL ITEMS
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-3 py-1 border rounded-[0px] transition-colors whitespace-nowrap ${
                  selectedCategory.toUpperCase() === cat.name.toUpperCase()
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-[#F6F5F0] border-[#E4E2DA] text-[#5A5852] hover:text-[#111111]'
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}

            {(searchParams.get('q') || selectedCategory !== 'ALL') && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-mono text-[#B84A27] hover:underline ml-auto"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Strip */}
        <div className="flex items-center justify-between text-xs font-mono text-[#5A5852] px-1">
          <span>
            {isLoading ? 'QUERYING OPENSEARCH...' : `SHOWING ${sortedProducts.length} PRODUCTS IN ${activeCity.toUpperCase()}`}
          </span>
          <span className="text-[#111111] font-bold hidden sm:inline">
            AIVEN OPENSEARCH AUTO-FUZZINESS ACTIVE
          </span>
        </div>

        {/* Product Grid / Empty State */}
        {sortedProducts.length === 0 && !isLoading ? (
          <div className="p-16 text-center bg-[#FFFFFF] border border-[#E4E2DA] space-y-3 font-mono rounded-[0px]">
            <Layers className="w-8 h-8 text-[#5A5852] mx-auto stroke-[1.5]" />
            <h3 className="font-bold text-sm uppercase text-[#111111]">ZERO INVENTORY MATCHES FOUND</h3>
            <p className="text-xs text-[#5A5852] max-w-sm mx-auto font-sans">
              No matching records in {activeCity} match your search query. Try broadening your terms or clear category filters.
            </p>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-5 py-2.5 bg-[#111111] text-white text-xs uppercase font-mono mt-2 rounded-[0px]"
            >
              VIEW ALL INVENTORY
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedProducts.map((item, idx) => (
              <ProductCard
                key={item.product?.id || idx}
                product={item.product}
                minPrice={item.minPrice}
                originalMrp={item.originalMrp}
                sellerCount={item.sellerCount || 2}
                inStock={item.inStock !== false}
                rating={item.rating || 4.8}
                reviewsCount={item.reviewsCount || 310}
                distanceKm={item.distanceKm || (0.5 + (idx % 4) * 0.3)}
                featuredStoreName={item.featuredStoreName || 'Central Hub'}
                badge={item.badge}
                onCompare={handleCompareSellers}
              />
            ))}
          </div>
        )}

      </div>

      <SellerComparisonModal
        product={selectedProduct}
        offers={activeOffers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ProductsPage;
