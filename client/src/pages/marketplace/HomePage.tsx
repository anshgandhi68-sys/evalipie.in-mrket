"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Store, MapPin, ArrowRight, ShieldCheck, CheckCircle2,
  Star, Headphones, Laptop, Smartphone, Utensils, Shirt, ShoppingBag, 
  Trophy, Layers, Clock, Zap, Flame, Filter, ChevronRight, SlidersHorizontal,
  BadgePercent, Truck, HeartHandshake
} from 'lucide-react';
import { DoorHero } from '../../components/hero/DoorHero.js';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import ClothingRailHero from '../../components/ui/product-rail-gallery.js';
import { RAIL_DEMO_ITEMS } from '../../components/ui/clothing-rail-demo.js';
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
    { id: 'Boutique Apparel', label: 'Boutique Apparel', icon: <Shirt className="w-3.5 h-3.5" />, count: 3 },
  ];

  const quickAiChips = [
    'Noise-cancelling headphones for video meetings under ₹3,000',
    'Compact digital air fryer for apartment kitchen',
    'Wireless ergonomic keyboard for programming',
    'PowerVolt 65W GaN fast charger 3-port'
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] relative selection:bg-[#167D73] selection:text-white font-sans text-gray-900">
      {/* 1. Signature Full-Screen Scroll-Locked Entry Video */}
      <DoorHero />

      {/* 2. Main Marketplace Feed Container */}
      <main id="marketplace-feed" className="w-full relative z-10 space-y-10">

        {/* ── DEPARTMENT STRIP / SUB-NAV ─────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 shadow-2xs sticky top-[64px] z-30 transition-all">
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
            <div className="lg:col-span-8 bg-gradient-to-br from-[#111827] via-[#132224] to-[#0D1C1A] rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl border border-white/10 group min-h-[380px]">

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
              
              {/* Promo Card 1: 65W GaN Fast Tech */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm flex flex-col justify-between flex-1 relative overflow-hidden group hover:border-[#167D73]/50 transition-all">
                <div className="space-y-2">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block">
                    ⚡ GaN Tech & Hardware
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-snug">
                    65W Fast Chargers & Audio Tech
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Order 3-port GaN fast chargers, Bluetooth studio headphones, and USB condenser mics directly from Sharma Electronics with zero phantom stock.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Sharma Electronics · Indiranagar</span>
                  <button
                    onClick={() => {
                      setSelectedCategory('Mobiles & Accessories');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-black text-[#167D73] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Shop Hardware</span>
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

          {/* ── 2B. AMAZON & FLIPKART SIGNATURE 4-BOX PROMO GRID ─────────── */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Box 1: Up to 60% off Electronics */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <h3 className="font-black text-lg text-gray-900 leading-snug mb-3">
                  Up to 60% off | Top Electronics & Tech
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div 
                    onClick={() => {
                      setSelectedCategory('Electronics');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80" 
                      alt="Headphones" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">ANC Headphones</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">From ₹4,999</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Computers & Laptops');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80" 
                      alt="Keyboard" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">RGB Keyboard</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">From ₹2,799</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Electronics');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80" 
                      alt="Mic" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">USB Condenser Mic</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">From ₹3,299</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Computers & Laptops');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80" 
                      alt="Mouse" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">Ergonomic Mouse</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">From ₹1,499</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedCategory('Electronics');
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 text-xs font-black text-[#167D73] hover:text-amber-600 flex items-center gap-1 cursor-pointer"
              >
                <span>See all electronics offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Box 2: Smart Wearables & Mobile Tech */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-max">
                  <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>30-Min Local Walk-in</span>
                </div>
                <h3 className="font-black text-lg text-gray-900 leading-snug mb-3">
                  Smart Wearables & Tech Accessories
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div 
                    onClick={() => {
                      setSelectedCategory('Electronics');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&auto=format&fit=crop&q=80" 
                      alt="Smartwatch" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">AMOLED Watch</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">₹3,499 (Save 22%)</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Mobiles & Accessories');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80" 
                      alt="Charger" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">65W GaN Charger</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">₹1,499 (Save 25%)</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Electronics');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80" 
                      alt="Studio Mic" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">Podcasting Mic</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">₹3,299 (Save 21%)</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Home & Kitchen');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-amber-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&auto=format&fit=crop&q=80" 
                      alt="Air Fryer" 
                      className="w-full aspect-square object-contain group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">Digital Air Fryer</span>
                    <span className="text-[10px] font-extrabold text-[#388E3C]">₹4,299 (Save 28%)</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedCategory('Mobiles & Accessories');
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 text-xs font-black text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Shop all mobile & smart gadgets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Box 3: Curated Fashion Rail */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <h3 className="font-black text-lg text-gray-900 leading-snug mb-3">
                  Boutique Fashion | Local Bengaluru Edit
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div 
                    onClick={() => {
                      setSelectedCategory('Boutique Apparel');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-purple-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&auto=format&fit=crop&q=80" 
                      alt="Apparel" 
                      className="w-full aspect-square object-cover rounded-lg group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">Denim Jacket</span>
                    <span className="text-[10px] font-extrabold text-purple-700">₹2,499</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Boutique Apparel');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-purple-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&auto=format&fit=crop&q=80" 
                      alt="Kurta" 
                      className="w-full aspect-square object-cover rounded-lg group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">Linen Kurta</span>
                    <span className="text-[10px] font-extrabold text-purple-700">₹1,499</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Boutique Apparel');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-purple-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&auto=format&fit=crop&q=80" 
                      alt="Sneakers" 
                      className="w-full aspect-square object-cover rounded-lg group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">Classic Sneakers</span>
                    <span className="text-[10px] font-extrabold text-purple-700">₹2,999</span>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedCategory('Boutique Apparel');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group/tile cursor-pointer bg-[#F8FAFC] p-2 rounded-xl border border-gray-100 hover:border-purple-400 transition-colors"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80" 
                      alt="Tote" 
                      className="w-full aspect-square object-cover rounded-lg group-hover/tile:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-1 block">Canvas Tote</span>
                    <span className="text-[10px] font-extrabold text-purple-700">₹699</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedCategory('Boutique Apparel');
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 text-xs font-black text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect on interactive 3D rail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Box 4: Verified Neighbourhood Stores */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <h3 className="font-black text-lg text-gray-900 leading-snug mb-3">
                  Verified Local Kiranas Near You
                </h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'Sharma Electronics', dist: '1.4 km', rating: '4.9', area: 'Indiranagar' },
                    { name: 'City Supermarket', dist: '2.1 km', rating: '4.8', area: 'Koramangala' },
                    { name: 'Patel Digital & Mobiles', dist: '0.8 km', rating: '4.7', area: 'HSR Layout' },
                    { name: 'Modern Living Home Store', dist: '3.0 km', rating: '4.8', area: 'Jayanagar' },
                  ].map((store, i) => (
                    <div 
                      key={i}
                      onClick={() => {
                        document.getElementById('stores-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-amber-50/70 border border-gray-100 hover:border-amber-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-500" />
                        <div>
                          <h5 className="font-bold text-xs text-gray-900 leading-none">{store.name}</h5>
                          <span className="text-[10px] text-gray-400">{store.area} · {store.dist}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        ★ {store.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => {
                  document.getElementById('stores-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 text-xs font-black text-gray-900 hover:text-[#167D73] flex items-center gap-1 cursor-pointer"
              >
                <span>Browse 142 local shops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

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
                  name: 'Smartwatches & Fitness', 
                  filterId: 'Electronics', 
                  count: 'PulsePro Series', 
                  img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=80',
                  badge: 'AMOLED'
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
                <span className="p-2.5 bg-red-100 text-red-600 rounded-2xl">
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
                        {shop.stores && shop.stores.length > 1 ? `${shop.stores.length} Branches` : 'Independent Retail Store'}
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
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h4 className="font-extrabold text-sm text-gray-900">Direct Verified Local Store Truth</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Every product price and stock count is directly synced with verified neighborhood retailers with zero phantom listings.
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
