"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Store, MapPin, ArrowRight, ShieldCheck, CheckCircle2,
  Star, Headphones, Laptop, Smartphone, Utensils, Shirt, ShoppingBag, 
  Trophy, Layers, Clock, Zap, Flame, Filter, ChevronRight, SlidersHorizontal,
  BadgePercent, Truck, HeartHandshake, Mic
} from 'lucide-react';
import { DoorHero } from '../../components/hero/DoorHero.js';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import ClothingRailHero from '../../components/ui/product-rail-gallery.js';
import { RAIL_DEMO_ITEMS } from '../../components/ui/clothing-rail-demo.js';
import { api } from '../../services/api.js';
import { CanonicalProduct, MultiSellerOffer, Shop } from '../../../../shared/types.js';

// Curated Kirana & Grocery Products for Local Bengaluru Kiranas
const LOCAL_KIRANA_PRODUCTS = [
  {
    product: {
      id: 'prod-kirana-1',
      title: 'Daawat Rozana Gold Basmati Rice (5kg)',
      brand: 'Daawat',
      category: 'Kirana & Groceries',
      subCategory: 'Staples',
      description: 'Aged aromatic long-grain basmati rice for daily family meals. Sourced directly from verified Indiranagar grocery shelves.',
      attributes: { weight: '5kg', grain: 'Long Grain' },
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      tags: ['rice', 'basmati', 'grocery', 'kirana']
    },
    minPrice: 420,
    originalMrp: 499,
    sellerCount: 3,
    inStock: true,
    rating: 4.8,
    reviewsCount: 310,
    featuredStoreName: 'City Supermarket (Indiranagar)',
    distanceKm: 0.8,
    badge: 'Fresh Stock'
  },
  {
    product: {
      id: 'prod-kirana-2',
      title: 'Fortune Sunlite Refined Sunflower Oil (1L Pouch)',
      brand: 'Fortune',
      category: 'Kirana & Groceries',
      subCategory: 'Cooking Oils',
      description: 'Light, healthy cooking oil enriched with Vitamins A and D. Physical inventory verified at your neighbourhood Kirana.',
      attributes: { volume: '1L', type: 'Refined Sunflower Oil' },
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
      tags: ['oil', 'cooking', 'grocery', 'kirana']
    },
    minPrice: 145,
    originalMrp: 175,
    sellerCount: 4,
    inStock: true,
    rating: 4.9,
    reviewsCount: 520,
    featuredStoreName: 'Sharma General Kirana',
    distanceKm: 0.5,
    badge: 'Popular'
  },
  {
    product: {
      id: 'prod-kirana-3',
      title: 'Tata Tea Gold Premium Black Tea (500g Pack)',
      brand: 'Tata Tea',
      category: 'Kirana & Groceries',
      subCategory: 'Beverages',
      description: 'Rich Assam CTC blend with 15% gently rolled long tea leaves for irresistible aroma and strength.',
      attributes: { weight: '500g', form: 'Granules & Leaves' },
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      tags: ['tea', 'chai', 'grocery', 'beverage']
    },
    minPrice: 285,
    originalMrp: 320,
    sellerCount: 3,
    inStock: true,
    rating: 4.9,
    reviewsCount: 680,
    featuredStoreName: 'City Supermarket (Jayanagar)',
    distanceKm: 1.1,
    badge: 'Top Rated'
  },
  {
    product: {
      id: 'prod-kirana-4',
      title: 'Aashirvaad Select 100% Sharbati Whole Wheat Atta (5kg)',
      brand: 'Aashirvaad',
      category: 'Kirana & Groceries',
      subCategory: 'Flours',
      description: 'Crafted from golden Sharbati wheat grains from Madhya Pradesh. Delivers extra soft and fluffy rotis.',
      attributes: { weight: '5kg', type: 'Whole Wheat' },
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      tags: ['atta', 'flour', 'wheat', 'grocery']
    },
    minPrice: 310,
    originalMrp: 360,
    sellerCount: 3,
    inStock: true,
    rating: 4.8,
    reviewsCount: 440,
    featuredStoreName: 'Sharma General Kirana',
    distanceKm: 0.5,
    badge: 'Daily Essential'
  }
];

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

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Category Filtering & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocality, setSelectedLocality] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'trending' | 'price-asc' | 'price-desc' | 'rating'>('trending');

  // Flash Deals Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
    api.getCategories().then(setCategories).catch(console.error);
    api.getShops().then(setShops).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
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

  // Combine products with curated Kirana and Apparel
  const allCombinedProducts = [
    ...products,
    ...LOCAL_KIRANA_PRODUCTS,
    ...BOUTIQUE_APPAREL_PRODUCTS
  ];

  // Filter products by active category
  const filteredProducts = allCombinedProducts.filter(item => {
    if (selectedCategory === 'All') return true;
    const cat = (item.product?.category || '').toLowerCase();
    const sel = selectedCategory.toLowerCase();
    if (sel.includes('electronic') || sel.includes('audio')) {
      return cat.includes('electronic') || cat.includes('audio');
    }
    if (sel.includes('computer') || sel.includes('laptop')) {
      return cat.includes('computer') || cat.includes('laptop');
    }
    if (sel.includes('mobile')) {
      return cat.includes('mobile');
    }
    if (sel.includes('kitchen') || sel.includes('home')) {
      return cat.includes('kitchen') || cat.includes('home');
    }
    if (sel.includes('kirana') || sel.includes('grocery')) {
      return cat.includes('kirana') || cat.includes('grocery');
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

  // Filter shops by locality
  const filteredShops = shops.filter(shop => {
    if (selectedLocality === 'All') return true;
    const loc = selectedLocality.toLowerCase();
    const storeAddresses = (shop.stores || []).map(s => (s.addressLine1 + ' ' + s.name).toLowerCase()).join(' ');
    const desc = (shop.description + ' ' + shop.tagline).toLowerCase();
    return storeAddresses.includes(loc) || desc.includes(loc);
  });

  const departmentTabs = [
    { id: 'All', label: 'All Items', icon: <Layers className="w-3.5 h-3.5" />, count: allCombinedProducts.length },
    { id: 'Electronics', label: 'Audio & Gadgets', icon: <Headphones className="w-3.5 h-3.5" />, count: 3 },
    { id: 'Computers & Laptops', label: 'Computers & Workspaces', icon: <Laptop className="w-3.5 h-3.5" />, count: 2 },
    { id: 'Mobiles & Accessories', label: 'Mobiles & GaN Chargers', icon: <Smartphone className="w-3.5 h-3.5" />, count: 1 },
    { id: 'Home & Kitchen', label: 'Kitchen & Appliances', icon: <Utensils className="w-3.5 h-3.5" />, count: 2 },
    { id: 'Kirana & Groceries', label: 'Kirana & Daily Staples', icon: <ShoppingBag className="w-3.5 h-3.5" />, count: 4 },
    { id: 'Boutique Apparel', label: 'Boutique Apparel', icon: <Shirt className="w-3.5 h-3.5" />, count: 3 },
  ];

  const quickAiChips = [
    'Noise-cancelling headphones for video meetings under ₹3,000',
    'Compact digital air fryer for apartment kitchen',
    'Wireless ergonomic keyboard for programming',
    'Daily kirana cooking oil and aged basmati rice'
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] relative selection:bg-[#167D73] selection:text-white font-sans text-gray-900">
      {/* 1. Signature Full-Screen Scroll-Locked Entry Video */}
      <DoorHero title="Welcome to Evalipie" />

      {/* 2. Main Marketplace Feed Container */}
      <main id="marketplace-feed" className="w-full relative z-10 space-y-10">

        {/* ── DEPARTMENT STRIP / SUB-NAV ─────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 shadow-2xs sticky top-[108px] z-30 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            {/* Left: Category Switcher Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              {departmentTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    const catalogEl = document.getElementById('catalog-section');
                    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-[#0F1412] text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    selectedCategory === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right: Geolocation & Delivery SLA */}
            <div className="hidden lg:flex items-center gap-3 shrink-0 text-xs text-gray-600 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-1 font-bold text-gray-800">
                <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
                <span>Indiranagar, Bengaluru (560038)</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                <Truck className="w-3 h-3" />
                <span>Instant 30-min Store Delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">

          {/* ── HERO SPOTLIGHT SHOWCASE (Amazon / Flipkart Style Multi-Tile Grid) ── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            
            {/* Main Feature Banner (8 cols) */}
            <div className="lg:col-span-8 bg-gradient-to-br from-[#0F1412] via-[#142320] to-[#0A1614] rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl border border-white/10 group min-h-[380px]">
              {/* Subtle ambient grid backdrop */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }}
              />
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-[#167D73]/30 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-[#167D73] text-white px-3 py-1 rounded-full text-[11px] font-extrabold tracking-widest uppercase">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Bengaluru Electronics & Hardware Fair</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Every Local Store. One Verified Price Comparison.
                </h1>
                <p className="text-sm text-gray-300 font-medium leading-relaxed">
                  Compare real physical shelf prices across <b>Sharma Electronics</b>, <b>Patel Digital</b>, and <b>City Supermarket</b>. Save up to 38% with same-day store delivery and zero phantom inventory.
                </p>
              </div>

              <div className="pt-6 relative z-10 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory('Electronics');
                    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#167D73] hover:bg-[#13665e] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Browse Electronics Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('stores-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
                >
                  <span>Explore 142 Local Shops</span>
                </button>
              </div>

              {/* Bottom Guarantee Badges */}
              <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-3 gap-2 text-[11px] text-gray-300 font-semibold relative z-10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">100% Genuine Physical Stock</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Zero Overselling (Row Locked)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">30-Min Doorstep Pickup</span>
                </div>
              </div>
            </div>

            {/* Right Side Dual Promos (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
              
              {/* Promo Card 1: Kirana Truth */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm flex flex-col justify-between flex-1 relative overflow-hidden group hover:border-[#167D73]/50 transition-all">
                <div className="space-y-2">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block">
                    ⚡ Instant Kirana Truth
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-snug">
                    Zero-Markup Daily Essentials
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Order Aashirvaad Atta, Fortune Oil, and Daawat Basmati directly from your local neighbourhood Kirana at store prices.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">4 Stores nearby</span>
                  <button
                    onClick={() => {
                      setSelectedCategory('Kirana & Groceries');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-black text-[#167D73] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Shop Kirana</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Promo Card 2: Evalipie AI Conversational Search */}
              <div className="bg-gradient-to-br from-[#7657E8]/10 via-white to-[#F0ECFD]/50 rounded-3xl p-6 border border-[#7657E8]/30 shadow-sm flex flex-col justify-between flex-1 relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#7657E8] uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Evalipie AI Shopping Assistant</span>
                  </div>
                  <h3 className="font-extrabold text-base text-gray-900 leading-snug">
                    Describe your problem. We find real local stock.
                  </h3>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                      placeholder="e.g. Headphones under ₹3,000 for office calls..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#7657E8] shadow-2xs"
                    />
                    <button
                      onClick={() => handleAiSearch()}
                      disabled={isAiLoading}
                      className="bg-[#7657E8] hover:bg-[#603fd9] text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer"
                    >
                      {isAiLoading ? '...' : <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Search Results Display (if active) */}
          {aiResult && (
            <div id="ai-results-anchor" className="bg-white rounded-3xl border-2 border-[#7657E8] p-6 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#F0ECFD] text-[#7657E8] rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">
                      AI Intent: {aiResult.intentAnalysis.inferred_need}
                    </h3>
                    {aiResult.intentAnalysis.max_budget && (
                      <span className="text-xs text-gray-500 font-semibold">
                        Filter: Budget under ₹{aiResult.intentAnalysis.max_budget.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setAiResult(null)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕ Clear AI View
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiResult.matches.map((m: any) => (
                  <div key={m.productId} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between gap-3">
                    <div className="flex gap-3 items-center">
                      <img src={m.imageUrl} alt={m.title} className="w-16 h-16 object-contain rounded-xl bg-white p-1.5 border border-gray-100" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{m.category}</span>
                        <h4 className="font-extrabold text-xs text-gray-900 line-clamp-1">{m.title}</h4>
                        <div className="text-xs font-black text-[#167D73] mt-0.5">
                          ₹{m.bestOffer.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#7657E8] font-semibold bg-white p-2 rounded-lg border border-purple-100">
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

          {/* ── 3. VISUAL CATEGORY TILES (Amazon / Blinkit Level Categorisation) ── */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-bold text-[#167D73] uppercase tracking-wider">
                  Browse by Department
                </span>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Everything Your Neighbourhood Sells, Categorised
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-bold text-[#167D73] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {[
                { 
                  name: 'Audio & Gadgets', 
                  filterId: 'Electronics', 
                  count: '3 Items', 
                  img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
                  badge: 'Up to 35% OFF'
                },
                { 
                  name: 'Computers & Workspaces', 
                  filterId: 'Computers & Laptops', 
                  count: '2 Items', 
                  img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
                  badge: 'Ergonomic'
                },
                { 
                  name: 'Mobiles & Chargers', 
                  filterId: 'Mobiles & Accessories', 
                  count: '1 Item', 
                  img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80',
                  badge: 'GaN Tech'
                },
                { 
                  name: 'Kitchen & Home', 
                  filterId: 'Home & Kitchen', 
                  count: '2 Items', 
                  img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&auto=format&fit=crop&q=80',
                  badge: 'Air Fryers'
                },
                { 
                  name: 'Boutique Apparel', 
                  filterId: 'Boutique Apparel', 
                  count: '10 Garments', 
                  img: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80',
                  badge: 'Indiranagar Edit'
                },
                { 
                  name: 'Kirana & Staples', 
                  filterId: 'Kirana & Groceries', 
                  count: '4 Items', 
                  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
                  badge: 'Store Prices'
                },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat.filterId);
                    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`bg-white rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center text-center gap-3 cursor-pointer group hover:-translate-y-1 ${
                    selectedCategory === cat.filterId 
                      ? 'border-[#167D73] shadow-md ring-2 ring-[#167D73]/20' 
                      : 'border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center p-1 relative">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-gray-900 group-hover:text-[#167D73] transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">{cat.count}</span>
                  </div>
                  <span className="mt-auto text-[9px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {cat.badge}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. FLASH DEALS OF THE DAY (Urgency & Conversions Shelf) ─────── */}
          <section className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-red-100 text-red-600 rounded-2xl animate-pulse">
                  <Flame className="w-5 h-5 fill-red-500 text-red-500" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Today's Store Flash Deals</h2>
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                      Limited Physical Stock
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Direct discounts offered by Indiranagar & Jayanagar shop owners.</p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-gray-600">Ends in:</span>
                <span className="font-mono text-sm font-black text-gray-900">
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Flash Deal Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allCombinedProducts.slice(0, 4).map((item, idx) => (
                <ProductCard
                  key={item.product.id || idx}
                  product={item.product}
                  minPrice={item.minPrice}
                  sellerCount={item.sellerCount}
                  inStock={item.inStock}
                  originalMrp={item.originalMrp}
                  rating={item.rating}
                  reviewsCount={item.reviewsCount}
                  featuredStoreName={item.featuredStoreName}
                  distanceKm={item.distanceKm}
                  badge={item.badge || 'Flash Deal'}
                  onCompare={handleCompareSellers}
                />
              ))}
            </div>
          </section>

          {/* ── 5. CURATED BOUTIQUE APPAREL RAIL (Seamless Editorial Gallery) ── */}
          <section className="bg-gradient-to-br from-[#0F1412] to-[#172522] rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-6 border border-white/10">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 pb-2 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-[#167D73] uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                  Tactile 3D Rail · Indiranagar Fashion District
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                  Curated Boutique Apparel Edit
                </h2>
                <p className="text-xs text-gray-300 font-medium max-w-2xl mt-1">
                  Brush along the rail, slide a hanger, or lift any piece to inspect front and back seam details before placing your order.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('Boutique Apparel');
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14B8A6] hover:underline cursor-pointer"
              >
                <span>View All 10 Boutique Pieces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/40 p-4 border border-white/5">
              <ClothingRailHero
                items={RAIL_DEMO_ITEMS}
                hanger="none"
                autoplay={true}
                action={
                  <button
                    onClick={() => {
                      setSelectedCategory('Boutique Apparel');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[#167D73] hover:bg-[#11635b] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    <span>Shop This Boutique Edit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
            </div>
          </section>

          {/* ── 6. MAIN MULTI-SELLER CATALOG FEED (Live Filtering & Sort) ─────── */}
          <section id="catalog-section" className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {selectedCategory === 'All' ? 'Complete Local Catalog' : selectedCategory}
                  </h2>
                  <span className="bg-gray-200 text-gray-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    {filteredProducts.length} Products
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Compare prices, verified in-stock units, and store proximity across Indiranagar, Jayanagar & Whitefield.
                </p>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-[#167D73] shadow-2xs"
                >
                  <option value="trending">🔥 Trending Deals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map(item => (
                <ProductCard
                  key={item.product.id}
                  product={item.product}
                  minPrice={item.minPrice}
                  sellerCount={item.sellerCount}
                  inStock={item.inStock}
                  originalMrp={item.originalMrp}
                  rating={item.rating}
                  reviewsCount={item.reviewsCount}
                  featuredStoreName={item.featuredStoreName}
                  distanceKm={item.distanceKm}
                  badge={item.badge}
                  onCompare={handleCompareSellers}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
                <p className="text-base font-bold text-gray-700">No products found in this category.</p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs font-bold text-[#167D73] hover:underline"
                >
                  Clear Category Filter
                </button>
              </div>
            )}
          </section>

          {/* ── 7. VERIFIED NEIGHBOURHOOD STORES DIRECTORY ─────────────────── */}
          <section id="stores-section" className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 border-b border-gray-200 pb-4">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Physical Storefront Network
                </span>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Verified Neighbourhood Stores in Bengaluru
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Every store operates its own sovereign digital storefront with live physical inventory truth.
                </p>
              </div>

              {/* Locality Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All', 'Indiranagar', 'Jayanagar', 'Koramangala'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocality(loc)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                      selectedLocality === loc
                        ? 'bg-[#167D73] text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredShops.map(shop => (
                <Link
                  key={shop.id}
                  to={`/shop/${shop.slug}`}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-[#167D73] hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#105B55] bg-[#E9F7F3] px-2.5 py-0.5 rounded-full uppercase">
                        {shop.stores && shop.stores.length > 1 ? `${shop.stores.length} Branches` : 'Independent Kirana'}
                      </span>
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{shop.ratingAvg}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({shop.ratingCount})</span>
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

                    <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#167D73]" />
                      <span className="truncate">
                        {shop.stores && shop.stores[0]?.addressLine1 || 'Bengaluru'}
                      </span>
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

          {/* ── 8. MARKETPLACE VALUE & CONCURRENCY TRUTH PILLARS ────────────── */}
          <section className="bg-white rounded-3xl border border-gray-200/90 p-8 shadow-sm">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
              <span className="text-[11px] font-bold text-[#167D73] uppercase tracking-wider">
                The Evalipie Marketplace Guarantee
              </span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Why Neighbourhood Commerce Wins Over Big Tech Warehouses
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
              <div className="space-y-2 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl inline-block">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h4 className="font-extrabold text-sm text-gray-900">Zero Phantom Inventory</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Row-level database locks ensure when stock is 1, only the fastest buyer confirms. No cancellations after payment.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <span className="p-2.5 bg-teal-100 text-[#167D73] rounded-xl inline-block">
                  <Store className="w-5 h-5" />
                </span>
                <h4 className="font-extrabold text-sm text-gray-900">100% Real Physical Stores</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Support your local neighbourhood family businesses. Every rupee stays in your local community.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl inline-block">
                  <Clock className="w-5 h-5" />
                </span>
                <h4 className="font-extrabold text-sm text-gray-900">30-Min Walk-In Pickup</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Order online and pick it up on your way home, or get it delivered to your door in 45 minutes flat.
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                <span className="p-2.5 bg-purple-100 text-purple-800 rounded-xl inline-block">
                  <Mic className="w-5 h-5" />
                </span>
                <h4 className="font-extrabold text-sm text-gray-900">Voice Khata Powered</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Shopkeepers record daily credit and sales naturally using Hindi, Kannada, and English speech technology.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* 3. Atomic Multi-Seller Comparison Modal */}
      <SellerComparisonModal
        product={selectedProduct}
        offers={activeOffers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
