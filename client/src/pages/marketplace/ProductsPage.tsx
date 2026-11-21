import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles } from 'lucide-react';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { api } from '../../services/api.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const q = searchParams.get('q') || '';
      const cat = searchParams.get('category') || '';
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

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header & Typo-Tolerant Search Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Explore Product Catalog</h1>
            <p className="text-xs text-gray-500 font-medium">Sub-millisecond fuzzy search backed by Aiven OpenSearch with typo-tolerance.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Try typing 'blutooth hedphone', 'micrphone', or 'airfryr'..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-2xl text-sm font-semibold outline-none focus:border-[#167D73] focus:ring-4 focus:ring-[#E9F7F3]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#167D73] hover:bg-[#105B55] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#167D73] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-[#167D73] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500">
            <span>Showing {products.length} canonical products in Bengaluru</span>
            <span>Typo-tolerance: Levenshtein fuzzy match active</span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-gray-400">Loading catalog from OpenSearch...</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
              <p className="text-gray-500 font-bold">No matching products found.</p>
              <p className="text-xs text-gray-400">Try a different search or remove category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map(item => (
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
