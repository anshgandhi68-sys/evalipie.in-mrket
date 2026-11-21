import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Store, MapPin, ArrowRight, ShieldCheck, CheckCircle2,
  Star, Headphones, Laptop, Smartphone, Utensils, Shirt, ShoppingBag, Trophy, Layers
} from 'lucide-react';
import { DoorHero } from '../../components/hero/DoorHero.js';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import ClothingRailHero from '../../components/ui/product-rail-gallery.js';
import { RAIL_DEMO_ITEMS } from '../../components/ui/clothing-rail-demo.js';
import { api } from '../../services/api.js';
import { CanonicalProduct, MultiSellerOffer, Shop } from '../../../../shared/types.js';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
    api.getCategories().then(setCategories).catch(console.error);
    api.getShops().then(setShops).catch(console.error);
  }, []);

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

  const handleAiSearch = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await api.aiDiscover(text);
      setAiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const quickAiChips = [
    'I need something for clear audio during online meetings under ₹3,000',
    'Find a compact kitchen appliance for a small apartment',
    'Suggest a product for organizing my workspace',
    'Wireless keyboard for programming'
  ];

  const getCategoryIcon = (icon: string, name: string) => {
    const key = `${icon || ''} ${name || ''}`.toLowerCase();
    if (key.includes('electronic') || key.includes('audio') || key.includes('headphone')) {
      return <Headphones className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
    }
    if (key.includes('laptop') || key.includes('computer')) {
      return <Laptop className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
    }
    if (key.includes('mobile') || key.includes('smartphone') || key.includes('phone')) {
      return <Smartphone className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
    }
    if (key.includes('kitchen') || key.includes('home') || key.includes('utensil')) {
      return <Utensils className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
    }
    if (key.includes('fashion') || key.includes('shirt') || key.includes('cloth') || key.includes('apparel')) {
      return <Shirt className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
    }
    if (key.includes('grocery') || key.includes('bag') || key.includes('market')) {
      return <ShoppingBag className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
    }
    if (key.includes('sport') || key.includes('fit') || key.includes('trophy')) {
      return <Trophy className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
    }
    return <Layers className="w-5 h-5 text-[#167D73] group-hover:text-white transition-colors" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative selection:bg-[#167D73] selection:text-white">
      {/* Blueprint Dot Matrix Ambient Background Design */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }}
      />
      {/* Soft Ambient Daylight Gradient Glow */}
      <div className="absolute top-[80vh] left-1/2 -translate-x-1/2 w-[90vw] max-w-7xl h-[600px] bg-gradient-to-b from-[#14B8A6]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      {/* 1. Signature 3D Door Hero (Daytime Entrance) */}
      <DoorHero title="Welcome to Evalipie" />

      {/* Main Marketplace Feed - Single Page Continuous Experience */}
      <main id="marketplace-feed" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16 relative z-10">
        
        {/* 2. Evalipie AI Natural Language Discovery Section */}
        <section className="bg-white rounded-3xl border border-[#E5EAF0] p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7657E8] bg-[#F0ECFD] px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evalipie AI Discovery</span>
            </span>
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
              You don’t need the product name. Just tell us what you need.
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Describe what problem you want to solve. Evalipie AI translates your intent into structured queries against real local shop inventory with zero hallucination.
            </p>
          </div>

          <div className="mt-6 max-w-3xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                placeholder="e.g. I need something for clear audio during online meetings under ₹3,000..."
                className="flex-1 border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-[#7657E8] focus:ring-4 focus:ring-[#F0ECFD] transition-all"
              />
              <button
                disabled={isAiLoading}
                onClick={() => handleAiSearch()}
                className="bg-[#7657E8] hover:bg-[#6342db] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAiLoading ? 'Analyzing Intent...' : 'Ask Evalipie AI'}</span>
              </button>
            </div>

            {/* Conversational Quick Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {quickAiChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => { setAiPrompt(chip); handleAiSearch(chip); }}
                  className="bg-gray-100 hover:bg-[#F0ECFD] hover:text-[#7657E8] border border-gray-200 hover:border-[#7657E8] text-xs font-semibold px-3 py-1.5 rounded-full text-gray-700 transition-all text-left"
                >
                  "{chip}"
                </button>
              ))}
            </div>

            {/* AI Results Output */}
            {aiResult && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-fade-in">
                <div className="bg-[#F0ECFD]/50 p-4 rounded-2xl border border-[#7657E8]/20 flex items-start gap-3 text-xs">
                  <Sparkles className="w-4 h-4 text-[#7657E8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#7657E8]">AI Intent Translation: </span>
                    <span className="text-gray-700 font-semibold">{aiResult.intentAnalysis.inferred_need}</span>
                    {aiResult.intentAnalysis.max_budget && (
                      <span className="ml-1 font-bold text-gray-900">(Budget: ₹{aiResult.intentAnalysis.max_budget.toLocaleString('en-IN')})</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiResult.matches.map((m: any) => (
                    <div key={m.productId} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-center">
                      <img src={m.imageUrl} alt={m.title} className="w-20 h-20 object-contain rounded-xl bg-gray-50 p-2" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{m.category}</span>
                        <h4 className="font-bold text-xs text-gray-900 truncate">{m.title}</h4>
                        <div className="text-xs font-extrabold text-[#111827]">
                          ₹{m.bestOffer.price.toLocaleString('en-IN')} <span className="text-[10px] text-gray-500 font-normal">at {m.bestOffer.shopName}</span>
                        </div>
                        <p className="text-[11px] text-[#7657E8] font-semibold">{m.matchReason}</p>
                        <button
                          onClick={() => handleCompareSellers({ id: m.productId, title: m.title, brand: m.brand, category: m.category, description: '', attributes: {}, imageUrl: m.imageUrl })}
                          className="text-xs font-bold text-[#167D73] hover:underline flex items-center gap-1 pt-1"
                        >
                          <span>Compare Local Sellers</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3. Shop by Category */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Shop by Category</h2>
              <p className="text-xs text-gray-500">Everything your neighbourhood stores sell, discoverable in one place.</p>
            </div>
            <Link to="/products" className="text-xs font-bold text-[#167D73] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#167D73] hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E9F7F3] group-hover:bg-[#167D73] flex items-center justify-center transition-all shadow-xs">
                  {getCategoryIcon(cat.icon, cat.name)}
                </div>
                <span className="text-xs font-extrabold text-gray-800 group-hover:text-[#167D73] leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3.5. Interactive Merchant Clothing Rail (Local Boutique Edit) */}
        <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 pb-2">
            <div>
              <span className="text-[11px] font-bold text-[#167D73] uppercase tracking-wider">Tactile 3D Rail · Local Boutique Edit</span>
              <h2 className="text-2xl font-black text-gray-900">Interactive Merchant Rail</h2>
              <p className="text-xs text-gray-500">Brush along the rail, slide a hanger, or lift any piece to inspect front and back details before purchasing.</p>
            </div>
            <Link to="/products?category=Apparel" className="text-xs font-bold text-[#167D73] hover:underline flex items-center gap-1 self-start sm:self-auto">
              <span>View All Apparel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ClothingRailHero
            items={RAIL_DEMO_ITEMS}
            hanger="none"
            autoplay={true}
            action={
              <Link
                to="/products?category=Apparel"
                className="inline-flex items-center gap-2 rounded-full bg-[#167D73] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#105B55] transition-all"
              >
                <span>Shop This Boutique Edit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
        </section>

        {/* 4. Trending in Bengaluru (Multi-Seller Catalog Feed) */}
        <section className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-[#167D73] uppercase tracking-wider">Local Availability</span>
            <h2 className="text-2xl font-black text-gray-900">Trending in Bengaluru</h2>
            <p className="text-xs text-gray-500">Compare prices and physical stock across Sharma Electronics, Patel Digital, and City Supermarket.</p>
          </div>

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
        </section>

        {/* 5. Participating Stores Near You */}
        <section className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Physical Retail Network</span>
            <h2 className="text-2xl font-black text-gray-900">Shops Near You in Bengaluru</h2>
            <p className="text-xs text-gray-500">Every shop gets its own digital store with real-time physical inventory.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shops.map(shop => (
              <Link
                key={shop.id}
                to={`/shop/${shop.slug}`}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#167D73] hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#105B55] bg-[#E9F7F3] px-2.5 py-0.5 rounded-full uppercase">
                      {shop.stores && shop.stores.length > 1 ? `${shop.stores.length} Branches` : 'Independent Shop'}
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{shop.ratingAvg}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#167D73] transition-colors">
                      {shop.displayName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {shop.tagline || shop.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#167D73]">
                  <span>Visit Storefront</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. How Evalipie Works */}
        <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="max-w-xl">
            <span className="text-[#167D73] text-xs font-bold tracking-widest uppercase">The Distributed Architecture</span>
            <h2 className="text-3xl font-black mt-1">One marketplace, many real shops.</h2>
            <p className="text-xs text-gray-400 mt-2">
              Combining Aiven PostgreSQL for ACID inventory truth, Aiven Kafka for event streaming, and Aiven OpenSearch for sub-millisecond typo-tolerant discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#167D73] text-white flex items-center justify-center font-bold text-xs">1</span>
              <h3 className="font-bold text-sm">Describe or Search</h3>
              <p className="text-xs text-gray-400">Search with typos like "blutooth hedphone" or describe needs to Evalipie AI.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#167D73] text-white flex items-center justify-center font-bold text-xs">2</span>
              <h3 className="font-bold text-sm">Compare Local Shops</h3>
              <p className="text-xs text-gray-400">Compare multiple local sellers for the exact same canonical product.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#167D73] text-white flex items-center justify-center font-bold text-xs">3</span>
              <h3 className="font-bold text-sm">Order Safely</h3>
              <p className="text-xs text-gray-400">Atomic stock reservation prevents overselling when competing for the last item.</p>
            </div>
          </div>
        </section>

        {/* 7. Become a Seller CTA */}
        <section className="bg-gradient-to-r from-[#105B55] to-[#167D73] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black">Your shop deserves its own digital store.</h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Create your store, manage inventory, take voice-based credit notes with Voice Khata, and reach thousands of local customers.
            </p>
          </div>
          <Link
            to="/business/voice-khata"
            className="bg-white hover:bg-gray-100 text-[#105B55] px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            Launch Voice Khata & Storefront
          </Link>
        </section>
      </main>

      {/* Multi-Seller Offer Drawer Modal */}
      <SellerComparisonModal
        product={selectedProduct}
        offers={activeOffers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
