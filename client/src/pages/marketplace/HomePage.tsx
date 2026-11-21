"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Store, MapPin, ArrowRight, ShieldCheck, CheckCircle2,
  Star, ChevronRight, SlidersHorizontal, Flame, Truck, Check, RefreshCw
} from 'lucide-react';
import { DoorHero } from '../../components/hero/DoorHero.js';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { AiDiscoveryModal } from '../../components/ai/AiDiscoveryModal.js';
import { api } from '../../services/api.js';
import { CanonicalProduct, MultiSellerOffer, Shop } from '../../../../shared/types.js';

// Curated Apparel Products matching the Boutique Rail
const BOUTIQUE_APPAREL_PRODUCTS = [
  {
    product: {
      id: 'prod-apparel-1',
      title: 'Tactile Shell Minimalist Parka',
      brand: 'Boutique Atelier',
      category: 'Boutique Apparel',
      subCategory: 'Outerwear',
      description: 'Waterproof seam-sealed technical parka with storm hood and articulated sleeve darts. Handcrafted in Indiranagar.',
      attributes: { material: '3-Layer Ripstop Nylon', fit: 'Relaxed Technical' },
      imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80',
      tags: ['jacket', 'parka', 'outerwear', 'fashion']
    },
    minPrice: 4800,
    originalMrp: 6200,
    sellerCount: 2,
    inStock: true,
    rating: 4.9,
    reviewsCount: 88,
    featuredStoreName: 'Indiranagar Boutique Collective',
    distanceKm: 1.2,
    badge: 'Artisanal Edit'
  },
  {
    product: {
      id: 'prod-apparel-2',
      title: 'Raw Selvedge Denim Trucker Jacket',
      brand: 'Loom & Shuttle',
      category: 'Boutique Apparel',
      subCategory: 'Jackets',
      description: '14.5oz Japanese shuttle-loom denim with custom brass shanks and chain-stitched hems. Unwashed dry denim.',
      attributes: { weight: '14.5oz', weave: 'Right-hand twill' },
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
      tags: ['denim', 'jacket', 'selvedge', 'apparel']
    },
    minPrice: 3900,
    originalMrp: 4900,
    sellerCount: 2,
    inStock: true,
    rating: 4.8,
    reviewsCount: 64,
    featuredStoreName: 'Jayanagar Denim Co.',
    distanceKm: 2.1,
    badge: 'Limited Run'
  },
  {
    product: {
      id: 'prod-apparel-3',
      title: 'Merino Wool Heavyweight Mockneck Knit',
      brand: 'Nordic Weave',
      category: 'Boutique Apparel',
      subCategory: 'Knitwear',
      description: '100% extrafine Australian merino wool with 7-gauge fisherman ribbing. Non-itchy thermal comfort for cool evenings.',
      attributes: { wool: '100% Extrafine Merino', gauge: '7GG' },
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
      tags: ['knit', 'merino', 'sweater', 'apparel']
    },
    minPrice: 2600,
    originalMrp: 3400,
    sellerCount: 3,
    inStock: true,
    rating: 4.9,
    reviewsCount: 112,
    featuredStoreName: 'Indiranagar Boutique Collective',
    distanceKm: 1.2,
    badge: 'Best Seller'
  }
];

// Curated Category Tiles Matching Prototype & Screenshot 2
const CATEGORY_TILES = [
  {
    id: 'Kirana & Groceries',
    title: 'Kirana & Staples',
    itemCount: '4 Items',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'Electronics',
    title: 'Audio & Sound',
    itemCount: '3 Items',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'Computers & Laptops',
    title: 'Computers & Tech',
    itemCount: '2 Items',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'Mobiles & Accessories',
    title: 'Mobiles & 5G',
    itemCount: '2 Items',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'Home & Kitchen',
    title: 'Kitchen & Home',
    itemCount: '2 Items',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'Boutique Apparel',
    title: 'Fashion & Apparel',
    itemCount: '3 Items',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'Sports & Fitness',
    title: 'Sports & Running',
    itemCount: '2 Items',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'All',
    title: 'Verified Hubs',
    itemCount: '6 Shops',
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80'
  }
];

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Category Filtering & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'trending' | 'price-asc' | 'price-desc' | 'rating'>('trending');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
    api.getShops().then(setShops).catch(console.error);

    // Listen for custom open-ai-modal event from navbar
    const handleOpenAi = () => setIsAiModalOpen(true);
    window.addEventListener('open-evalipie-ai', handleOpenAi);
    return () => window.removeEventListener('open-evalipie-ai', handleOpenAi);
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
      const target = document.getElementById('ai-results-anchor');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Combine products with curated Boutique Apparel
  const allCombinedProducts = [
    ...products,
    ...BOUTIQUE_APPAREL_PRODUCTS
  ];

  // Filter products by active category
  const filteredProducts = allCombinedProducts.filter(item => {
    if (selectedCategory === 'All') return true;
    const cat = (item.product?.category || '').toLowerCase();
    const sel = selectedCategory.toLowerCase();
    if (sel.includes('kirana') || sel.includes('grocer') || sel.includes('staple')) {
      return cat.includes('kirana') || cat.includes('grocer') || cat.includes('staple');
    }
    if (sel.includes('electronic') || sel.includes('audio')) {
      return cat.includes('electronic') || cat.includes('audio');
    }
    if (sel.includes('computer') || sel.includes('laptop') || sel.includes('tech')) {
      return cat.includes('computer') || cat.includes('laptop');
    }
    if (sel.includes('kitchen') || sel.includes('home')) {
      return cat.includes('kitchen') || cat.includes('home');
    }
    if (sel.includes('apparel') || sel.includes('fashion')) {
      return cat.includes('apparel') || cat.includes('fashion');
    }
    return cat.includes(sel);
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return (a.minPrice || 0) - (b.minPrice || 0);
    if (sortBy === 'price-desc') return (b.minPrice || 0) - (a.minPrice || 0);
    if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
    return 0; // trending
  });

  const quickAiChips = [
    'Wireless headphones under ₹2,000 for video meetings',
    'Daawat Basmati rice and sunflower oil near Indiranagar',
    'Mujhe programming ke liye laptop chahiye 60,000 ke andar',
    'Compact digital air fryer for apartment'
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] relative selection:bg-[#167D73] selection:text-white font-sans text-gray-900">
      
      {/* 1. ARCHITECTURAL 3D DOOR SCROLL HERO (Daytime with Sunshine & Glass Reflections) */}
      <DoorHero />

      {/* 2. MAIN MARKETPLACE FEED */}
      <main id="marketplace-feed" className="w-full relative z-10 space-y-16 pt-8 pb-20">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* ── 2A. SHOP BY CATEGORY (Matching Screenshot 2) ──────────────── */}
          <section id="cats" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Shop by category
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Everything your neighbourhood stores sell, in one place.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs sm:text-sm font-bold text-[#167D73] hover:text-[#105B55] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
              {CATEGORY_TILES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isSelected ? 'All' : cat.id);
                      document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col items-center text-center gap-3 cursor-pointer group shadow-2xs hover:shadow-md ${
                      isSelected 
                        ? 'border-2 border-[#167D73] ring-4 ring-[#167D73]/10 shadow-md' 
                        : 'border-gray-200/90 hover:border-[#167D73]'
                    }`}
                  >
                    {/* Rounded Image Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center p-2 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={cat.imageUrl} 
                        alt={cat.title} 
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                      />
                    </div>

                    {/* Title & Item Count */}
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-900 group-hover:text-[#167D73] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold">
                        {cat.itemCount}
                      </p>
                    </div>

                    {/* Store Prices Pill Badge */}
                    <span className="bg-[#E9F7F3] text-[#0D6258] text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mt-auto">
                      {cat.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 2B. TRENDING IN BENGALURU (Matching Screenshot 1) ─────────── */}
          <section id="trend" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Trending in Bengaluru
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Compare prices, verified in-stock units, and store proximity across Indiranagar, Jayanagar & Whitefield.
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 shadow-2xs outline-none focus:border-[#167D73] cursor-pointer"
                >
                  <option value="trending">🔥 Trending Deals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Active Category Indicator */}
            {selectedCategory !== 'All' && (
              <div className="flex items-center gap-2 bg-[#E9F7F3] border border-[#167D73]/20 px-3.5 py-2 rounded-xl text-xs font-bold text-[#105B55]">
                <span>Filtering by: <b>{selectedCategory}</b></span>
                <button 
                  onClick={() => setSelectedCategory('All')}
                  className="ml-auto underline hover:text-black cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* Product Cards Grid (Matching Screenshot 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((item, idx) => (
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
                  featuredStoreName={item.featuredStoreName || (idx % 2 === 0 ? "City Supermarket (Indiranagar)" : "Sharma General Kirana")}
                  badge={item.badge}
                  onCompare={handleCompareSellers}
                />
              ))}
            </div>
          </section>

          {/* ── 2C. EVALIPIE AI ASSISTANT BOX ───────────────────────────────── */}
          <section id="ai" className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-[#F0ECFD] text-[#7657E8] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                  ✦ Evalipie AI
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  You don’t need the product name. Just tell us what you need.
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Describe what you are looking for in English, Hindi, Hinglish, or Gujarati. Evalipie AI matches it against verified local store stock.
                </p>
              </div>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="bg-[#7657E8] hover:bg-[#603fd9] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-200 transition-all shrink-0 cursor-pointer self-start sm:self-auto active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Open AI Assistant</span>
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                placeholder="Describe what you need (e.g. Wireless headphones under 2000, or Daawat Basmati rice near Indiranagar)..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:border-[#7657E8] focus:bg-white shadow-inner"
              />
              <button
                onClick={() => handleAiSearch()}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="bg-[#7657E8] hover:bg-[#603fd9] disabled:opacity-40 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-200 cursor-pointer shrink-0"
              >
                {isAiLoading ? 'Searching...' : 'Ask Evalipie AI'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Suggested Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {quickAiChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(chip);
                    handleAiSearch(chip);
                  }}
                  className="bg-gray-100 hover:bg-[#F0ECFD] text-gray-700 hover:text-[#7657E8] border border-gray-200 hover:border-purple-200 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* AI Search Results Anchor & Display */}
            {aiResult && (
              <div id="ai-results-anchor" className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7657E8]" />
                    <span className="font-extrabold text-sm text-gray-900">
                      AI Intent: {aiResult.intentAnalysis?.inferred_need || 'Product Discovery'}
                    </span>
                  </div>
                  <button
                    onClick={() => setAiResult(null)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    ✕ Dismiss Results
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {aiResult.matches?.map((m: any) => (
                    <div key={m.productId} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between gap-3">
                      <div className="flex gap-3 items-center">
                        <img src={m.imageUrl} alt={m.title} className="w-16 h-16 object-cover rounded-xl bg-white p-1 border border-gray-200 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{m.category}</span>
                          <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{m.title}</h4>
                          <div className="text-xs font-black text-[#167D73] mt-0.5">
                            ₹{(m.bestOffer?.price || m.price)?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#7657E8] font-semibold bg-white p-2 rounded-xl border border-purple-100">
                        {m.matchReason}
                      </p>
                      <button
                        onClick={() => handleCompareSellers({ id: m.productId, title: m.title, brand: m.brand, category: m.category, description: '', attributes: {}, imageUrl: m.imageUrl })}
                        className="w-full bg-[#167D73] hover:bg-[#105B55] text-white text-xs font-bold py-2 rounded-xl transition-all text-center cursor-pointer"
                      >
                        Compare Local Offers
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── 2D. VERIFIED SHOPS NEAR YOU ───────────────────────────────── */}
          <section id="shops" className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Shops near you
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Independent neighborhood stores and retail chains in Bengaluru with verified physical stock.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {shops.map(shop => (
                <div 
                  key={shop.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <span className="bg-[#E9F7F3] text-[#105B55] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block">
                      Verified Store
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#167D73] transition-colors">
                      {shop.displayName}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {shop.tagline || shop.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
                    <span>Bengaluru</span>
                    <Link 
                      to={`/shop/${shop.slug}`}
                      className="text-[#167D73] hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <span>Storefront</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 2E. HOW EVALIPIE WORKS ────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                How Evalipie works
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                One intelligent marketplace, connecting you directly to real local shops.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#167D73] text-white flex items-center justify-center font-black text-base">
                  1
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Describe or search</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  Type a product name, or tell Evalipie AI what you need in plain English, Hindi, Hinglish, or Gujarati.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#167D73] text-white flex items-center justify-center font-black text-base">
                  2
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Compare local shops</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  See the exact product from different neighborhood sellers, real physical stock, and store distance.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#167D73] text-white flex items-center justify-center font-black text-base">
                  3
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Zero overselling guarantee</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                  Stock is reserved in real-time with row-level database locks, so the last shelf item is never sold twice.
                </p>
              </div>
            </div>
          </section>

          {/* ── 2F. SELLER ONBOARDING BANNER ──────────────────────────────── */}
          <section id="sell" className="bg-gradient-to-r from-[#105B55] to-[#167D73] rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Your shop deserves its own digital store.
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl">
                Create your store, manage inventory with row-locked accuracy, and reach thousands of local shoppers across Bengaluru.
              </p>
            </div>
            <Link
              to="/business/dashboard"
              className="bg-white hover:bg-emerald-50 text-[#105B55] px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg transition-all shrink-0 cursor-pointer active:scale-95"
            >
              Start Selling on Evalipie
            </Link>
          </section>

        </div>
      </main>

      {/* 3. MULTI-SELLER COMPARISON MODAL */}
      <SellerComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        offers={activeOffers}
      />

      {/* 4. CONVERSATIONAL AI DISCOVERY MODAL */}
      <AiDiscoveryModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onCompareProduct={handleCompareSellers}
      />
    </div>
  );
};

export default HomePage;
