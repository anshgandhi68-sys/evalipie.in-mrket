"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Sparkles, X, ChevronRight, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { api } from '../../services/api.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');
  
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Sync state when URL search params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'All';
    setSearchQuery(q);
    setSelectedCategory(cat);
    fetchProducts(q, cat);
  }, [searchParams]);

  const fetchProducts = async (q: string, cat: string) => {
    setIsLoading(true);
    try {
      const data = await api.getProducts({
        q: q || undefined,
        category: cat && cat !== 'All' ? cat : undefined
      });
      setProducts(data);
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
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    setSearchParams(params);
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (catName !== 'All') params.category = catName;
    setSearchParams(params);
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSearchParams({});
  };

  const handleCompareSellers = async (product: CanonicalProduct) => {
    setSelectedProduct(product);
    try {
      const res = await api.getProductSellers(product.id);
      setActiveOffers(res.offers);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Sort results client-side
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.minPrice || 0) - (b.minPrice || 0);
    if (sortBy === 'price-desc') return (b.minPrice || 0) - (a.minPrice || 0);
    if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
    return 0; // relevance
  });

  const popularQueries = [
    'iPhone 16',
    'Samsung Galaxy',
    'Bluetooth headphones',
    'Wireless mouse',
    'Running shoes',
    'Office chair',
    'Laptop under 60000',
    'Headphones under 2000',
    'Black T-shirt',
    'Men\'s shoes',
    'Home cleaning products'
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search Header Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {searchParams.get('q') ? `Search Results for "${searchParams.get('q')}"` : 'Explore Catalogue'}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Verified physical shelf stock from participating Bengaluru stores.
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-[#167D73] cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Try searching 'iPhone 16', 'running shoes', 'laptop under 60000', 'headphones under 2000'..."
                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:border-[#167D73] focus:ring-4 focus:ring-[#E9F7F3] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#167D73] hover:bg-[#105B55] text-white px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Department:
            </span>
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#167D73] text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-[#167D73] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {(searchParams.get('q') || selectedCategory !== 'All') && (
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-red-600 hover:underline ml-auto cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Strip */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
          <span>
            {isLoading ? 'Searching...' : `Showing ${sortedProducts.length} verified products in Bengaluru`}
          </span>
          <span className="text-gray-400 font-medium hidden sm:inline">
            Aiven OpenSearch fuzzy matching + PostgreSQL stock truth
          </span>
        </div>

        {/* Product Grid / Empty State */}
        {isLoading ? (
          <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#167D73]" />
            <p className="text-sm font-semibold">Retrieving verified inventory...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          /* Honest Empty State with Suggestions */
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">
                No verified products found
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {searchParams.get('q') 
                  ? `No store in Bengaluru currently lists physical stock matching "${searchParams.get('q')}".` 
                  : 'Try selecting a different category or clearing filters.'}
              </p>
            </div>

            {/* Popular Query Suggestions */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Popular Searches with In-Stock Guarantee:
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {popularQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item);
                      setSearchParams({ q: item });
                    }}
                    className="bg-gray-50 hover:bg-[#E9F7F3] border border-gray-200 hover:border-[#167D73] text-gray-700 hover:text-[#167D73] text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleClearAll}
              className="bg-[#167D73] text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-sm transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedProducts.map((item: any) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                minPrice={item.minPrice}
                sellerCount={item.sellerCount}
                inStock={item.inStock}
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
