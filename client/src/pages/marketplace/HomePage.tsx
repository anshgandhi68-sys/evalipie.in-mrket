import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Check } from 'lucide-react';
import { DoorHero } from '../../components/hero/DoorHero.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { VoiceShoppingModal } from '../../components/voice/VoiceShoppingModal.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

// ── 1. CURATED CATEGORIES WITH HIGH-RES REAL PHOTOGRAPHY ────────
const CATEGORIES_DATA = [
  {
    id: 'cat-audio',
    title: 'Electronics & Audio',
    itemCount: 6,
    code: 'AUDIO',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'AUDIO'
  },
  {
    id: 'cat-mobiles',
    title: 'Mobiles & Smart Tech',
    itemCount: 5,
    code: 'MOBILES',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'MOBILES'
  },
  {
    id: 'cat-computers',
    title: 'Computers & Laptops',
    itemCount: 5,
    code: 'LAPTOPS',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'LAPTOPS'
  },
  {
    id: 'cat-home',
    title: 'Home & Kitchen',
    itemCount: 6,
    code: 'HOME',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'HOME & KITCHEN'
  },
  {
    id: 'cat-fashion',
    title: 'Fashion & Apparel',
    itemCount: 5,
    code: 'FASHION',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'BOUTIQUE APPAREL'
  },
  {
    id: 'cat-footwear',
    title: 'Footwear & Sports',
    itemCount: 4,
    code: 'FOOTWEAR',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'FOOTWEAR'
  },
  {
    id: 'cat-wearables',
    title: 'Smart Wearables',
    itemCount: 4,
    code: 'WEARABLES',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'WEARABLES'
  },
  {
    id: 'cat-power',
    title: 'Power & Fast Chargers',
    itemCount: 4,
    code: 'CHARGERS',
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b14e3245b3?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'ACCESSORIES'
  }
];

// ── 2. REAL VERIFIED PRODUCT CATALOGUE WITH HIGH-RES PHOTOGRAPHY ─
const PRODUCTS_DATA = [
  {
    id: 'prod-audio-boat-550',
    title: 'boAt Rockerz 550 Wireless Bluetooth Headphones',
    brand: 'BOAT',
    category: 'AUDIO',
    store: 'Sharma Electronics',
    locality: 'Indiranagar',
    price: 1999,
    originalMrp: 3999,
    stockStatus: 'in' as const,
    rating: 4.8,
    reviewsCount: 310,
    tags: ['meeting', 'audio', 'call', 'voice', 'online', 'headset', 'music', 'wireless', 'headphones', 'bluetooth'],
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-audio-mic',
    title: 'Studio USB Condenser Microphone with Pop Filter',
    brand: 'AUDIO-TECH',
    category: 'AUDIO',
    store: 'Patel Digital Store',
    locality: 'Jayanagar',
    price: 2799,
    originalMrp: 3499,
    stockStatus: 'low' as const,
    rating: 4.9,
    reviewsCount: 180,
    tags: ['meeting', 'voice', 'clear', 'microphone', 'audio', 'online', 'stream', 'call', 'podcast'],
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-keyboards-keychron-k2',
    title: 'Wireless Mechanical Keyboard (RGB Backlit Gateron Brown)',
    brand: 'KEYCHRON',
    category: 'LAPTOPS',
    store: 'Sharma Electronics',
    locality: 'Indiranagar',
    price: 1499,
    originalMrp: 2199,
    stockStatus: 'in' as const,
    rating: 4.8,
    reviewsCount: 420,
    tags: ['keyboard', 'typing', 'wireless', 'work', 'programming', 'laptop', 'coding', 'office'],
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-computers-mouse',
    title: 'Precision Ergonomic Wireless Gaming & Work Mouse',
    brand: 'LOGITECH',
    category: 'LAPTOPS',
    store: 'Patel Digital Store',
    locality: 'Jayanagar',
    price: 999,
    originalMrp: 1299,
    stockStatus: 'in' as const,
    rating: 4.7,
    reviewsCount: 260,
    tags: ['mouse', 'gaming', 'game', 'work', 'wireless', 'laptop', 'ergonomic'],
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-home-airfryer',
    title: 'Compact Digital Air Fryer 4.2L with Rapid Airflow',
    brand: 'CHEFMAX',
    category: 'HOME & KITCHEN',
    store: 'Modern Living Store',
    locality: 'Koramangala',
    price: 3999,
    originalMrp: 4999,
    stockStatus: 'low' as const,
    rating: 4.9,
    reviewsCount: 190,
    tags: ['kitchen', 'appliance', 'compact', 'apartment', 'cook', 'small', 'fryer', 'healthy', 'home'],
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-home-desk-organizer',
    title: 'Minimalist Birch Desk Organiser & Cable Dock Set',
    brand: 'STUDIO CRAFT',
    category: 'HOME & KITCHEN',
    store: 'Modern Living Store',
    locality: 'Koramangala',
    price: 799,
    originalMrp: 1099,
    stockStatus: 'in' as const,
    rating: 4.8,
    reviewsCount: 145,
    tags: ['organize', 'organizing', 'workspace', 'desk', 'storage', 'stand', 'minimalist', 'office'],
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-audio-sony-xm5',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    brand: 'SONY',
    category: 'AUDIO',
    store: 'Sharma Electronics',
    locality: 'Indiranagar',
    price: 29990,
    originalMrp: 34990,
    stockStatus: 'in' as const,
    rating: 4.9,
    reviewsCount: 780,
    tags: ['sony', 'headphones', 'noise cancelling', 'xm5', 'audio', 'wireless', 'meeting', 'premium'],
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-mobiles-iphone16',
    title: 'Apple iPhone 16 (128GB) : Teal Aluminum',
    brand: 'APPLE',
    category: 'MOBILES',
    store: 'Patel Digital Store',
    locality: 'Jayanagar',
    price: 79900,
    originalMrp: 79900,
    stockStatus: 'in' as const,
    rating: 4.9,
    reviewsCount: 1420,
    tags: ['iphone', 'iphone 16', 'apple', 'mobile', '5g', 'smartphone'],
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-mob-samsung-m34',
    title: 'Samsung Galaxy M34 5G (128GB, 6GB RAM, 50MP No Shake Camera)',
    brand: 'SAMSUNG',
    category: 'MOBILES',
    store: 'Apex Digital & Audio Store',
    locality: 'Indiranagar',
    price: 16999,
    originalMrp: 24499,
    stockStatus: 'in' as const,
    rating: 4.8,
    reviewsCount: 640,
    tags: ['samsung', 'phone', 'mobile', '5g', 'smartphone', '128gb', 'camera', 'budget', 'battery'],
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-mob-samsung-a15',
    title: 'Samsung Galaxy A15 5G (128GB, 8GB RAM, Super AMOLED)',
    brand: 'SAMSUNG',
    category: 'MOBILES',
    store: 'Patel Digital Store',
    locality: 'Jayanagar',
    price: 19499,
    originalMrp: 21499,
    stockStatus: 'in' as const,
    rating: 4.7,
    reviewsCount: 380,
    tags: ['samsung', 'phone', 'mobile', '5g', 'smartphone', '128gb', 'amoled', 'budget', 'display'],
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-chargers-gan65',
    title: 'PowerVolt 65W GaN Fast Charger 3-Port (USB-C PD)',
    brand: 'POWERVOLT',
    category: 'ACCESSORIES',
    store: 'Sharma Electronics',
    locality: 'Indiranagar',
    price: 1899,
    originalMrp: 2499,
    stockStatus: 'in' as const,
    rating: 4.8,
    reviewsCount: 390,
    tags: ['charger', 'gan', '65w', 'fast charger', 'type-c', 'mobile', 'laptop'],
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b14e3245b3?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-laptops-thinkpad-e14',
    title: 'Lenovo ThinkPad E14 Gen 5 AMD Ryzen 5 (16GB/512GB SSD)',
    brand: 'LENOVO',
    category: 'LAPTOPS',
    store: 'Patel Digital Store',
    locality: 'Jayanagar',
    price: 52990,
    originalMrp: 64990,
    stockStatus: 'in' as const,
    rating: 4.9,
    reviewsCount: 215,
    tags: ['laptop', 'lenovo', 'thinkpad', 'ryzen', 'programming', 'work', 'coding'],
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-chairs-ergoposture',
    title: 'ErgoPosture Pro Ergonomic Mesh Office Chair with Lumbar Support',
    brand: 'ERGOPOSTURE',
    category: 'HOME & KITCHEN',
    store: 'Modern Living Store',
    locality: 'Koramangala',
    price: 8999,
    originalMrp: 12999,
    stockStatus: 'in' as const,
    rating: 4.8,
    reviewsCount: 160,
    tags: ['chair', 'office chair', 'ergonomic', 'lumbar support', 'desk', 'workspace', 'back pain'],
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'prod-footwear-pegasus',
    title: 'Nike Air Zoom Pegasus 40 Road Running Shoes',
    brand: 'NIKE',
    category: 'FOOTWEAR',
    store: 'City Retail Hub',
    locality: 'Indiranagar',
    price: 8495,
    originalMrp: 11495,
    stockStatus: 'in' as const,
    rating: 4.8,
    reviewsCount: 520,
    tags: ['shoes', 'nike', 'running', 'pegasus', 'footwear', 'sneakers'],
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
  }
];

// ── 3. VERIFIED LOCAL SHOPS DATA ─────────────────────────────────
const SHOPS_DATA = [
  {
    id: 'shop-sharma',
    name: 'Sharma Electronics',
    tag: 'Independent Specialist',
    locality: 'Indiranagar, Bengaluru',
    rating: '4.9 (780 reviews)',
    slug: 'sharma-electronics',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'shop-patel',
    name: 'Patel Digital Store',
    tag: 'Independent Specialist',
    locality: 'Jayanagar, Bengaluru',
    rating: '4.8 (420 reviews)',
    slug: 'patel-digital',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'shop-city',
    name: 'City Supermarket & Tech Hub',
    tag: 'Retail Chain · 3 Branches',
    locality: 'Whitefield & Indiranagar, Bengaluru',
    rating: '4.7 (1,250 reviews)',
    slug: 'city-supermarket',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'shop-modern',
    name: 'Modern Living Store',
    tag: 'Independent Specialist',
    locality: 'Koramangala, Bengaluru',
    rating: '4.8 (310 reviews)',
    slug: 'modern-living',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format&fit=crop&q=80'
  }
];

export interface AiSearchResultItem {
  productId: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  originalMrp: number;
  imageUrl: string;
  merchant: string;
  city: string;
  availableStock: number;
  inStock: boolean;
  sku?: string;
  matchReason?: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { activeCity } = useAuth();

  // Selected Category filter ('ALL' or categoryKey)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'TRENDING' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('TRENDING');

  // AI Search state
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [aiResults, setAiResults] = useState<AiSearchResultItem[]>([]);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Modal state for comparison
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastActive, setIsToastActive] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastActive(true);
    setTimeout(() => {
      setIsToastActive(false);
    }, 2400);
  };

  // ── 1. Backend-Powered AI Search ──
  const handleAiSearch = async (customQuery?: string) => {
    const rawQuery = (customQuery !== undefined ? customQuery : aiQuery).trim();
    if (!rawQuery) return;

    if (customQuery !== undefined) {
      setAiQuery(customQuery);
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Direct call to the backend AI discovery / chat API
      const res = await api.aiChat(rawQuery, 'default-session', activeCity || 'Bengaluru');

      if (res && res.status === 'success' && Array.isArray(res.matches)) {
        setAiResults(res.matches.map(m => ({
          productId: m.productId,
          title: m.title,
          brand: m.brand || 'Verified Brand',
          category: m.category || 'GENERAL',
          price: m.price || 0,
          originalMrp: m.originalMrp || m.price,
          imageUrl: m.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          merchant: m.merchant || 'Verified Partner Store',
          city: m.city || activeCity || 'Bengaluru',
          availableStock: m.availableStock ?? 5,
          inStock: m.inStock !== false,
          sku: m.sku,
          matchReason: m.matchReason
        })));
        setAiMessage(res.message || null);
      } else {
        fallbackCatalogueSearch(rawQuery);
      }
    } catch (err) {
      console.warn('Backend AI discovery call failed, falling back to catalogue query:', err);
      fallbackCatalogueSearch(rawQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const fallbackCatalogueSearch = (query: string) => {
    const m = query.match(/(?:₹|rs\.?\s?|under\s)\s?(\d[\d,]*)/i);
    const budget = m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
    const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

    const matches = PRODUCTS_DATA.filter(prod => {
      const text = `${prod.title} ${prod.brand} ${prod.category} ${prod.tags.join(' ')}`.toLowerCase();
      const hits = words.some(w => text.includes(w));
      return hits && (!budget || prod.price <= budget);
    }).map(prod => ({
      productId: prod.id,
      title: prod.title,
      brand: prod.brand,
      category: prod.category,
      price: prod.price,
      originalMrp: prod.originalMrp,
      imageUrl: prod.imageUrl,
      merchant: prod.store,
      city: activeCity || 'Bengaluru',
      availableStock: 5,
      inStock: prod.stockStatus === 'in'
    }));

    setAiResults(matches);
    setAiMessage(matches.length > 0 ? `Showing verified matches for "${query}".` : null);
  };

  // ── Filtered & Sorted Trending Products ──
  const filteredProducts = PRODUCTS_DATA.filter(item => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  }).sort((a, b) => {
    if (sortBy === 'PRICE_ASC') return a.price - b.price;
    if (sortBy === 'PRICE_DESC') return b.price - a.price;
    if (sortBy === 'RATING') return b.rating - a.rating;
    return 0; // TRENDING
  });

  // ── Handle Add To Cart ──
  const handleAddToCart = (product: typeof PRODUCTS_DATA[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addItem({
      listingId: `list-${product.id}`,
      storeId: `store-${product.store.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      productId: product.id,
      title: product.title,
      shopName: product.store,
      shopSlug: product.store.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    showToast(`Added to cart: ${product.title}`);
  };

  // ── Handle Add AI Search Item to Cart ──
  const handleAddAiItemToCart = (item: AiSearchResultItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addItem({
      listingId: `list-${item.productId}`,
      storeId: `store-${item.merchant.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      productId: item.productId,
      title: item.title,
      shopName: item.merchant,
      shopSlug: item.merchant.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl
    });
    showToast(`Added to cart: ${item.title}`);
  };

  // ── Handle Open Compare Modal ──
  const handleOpenProduct = (product: typeof PRODUCTS_DATA[0]) => {
    setSelectedProduct({
      id: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      subCategory: product.category,
      description: `${product.title} with verified in-store warranty from ${product.store}.`,
      attributes: { warranty: '1 Year Brand Warranty', condition: 'Brand New In Box' },
      imageUrl: product.imageUrl,
      tags: product.tags
    });

    setActiveOffers([
      {
        listingId: `offer-1-${product.id}`,
        merchant: {
          organizationId: 'org-sharma',
          shopName: product.store,
          shopSlug: product.store.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          rating: 4.9
        },
        store: {
          storeId: 'store-1',
          name: product.store,
          city: 'Bengaluru',
          address: `${product.locality}, 100ft Road`,
          distanceKm: 0.8
        },
        sellingPrice: product.price,
        originalMrp: product.originalMrp,
        stockStatus: 'IN_STOCK',
        availableQuantity: 6
      },
      {
        listingId: `offer-2-${product.id}`,
        merchant: {
          organizationId: 'org-patel',
          shopName: 'Patel Digital Store',
          shopSlug: 'patel-digital',
          rating: 4.8
        },
        store: {
          storeId: 'store-2',
          name: 'Patel Digital Store',
          city: 'Bengaluru',
          address: '4th Block, Jayanagar',
          distanceKm: 1.4
        },
        sellingPrice: Math.round(product.price * 1.02),
        originalMrp: product.originalMrp,
        stockStatus: 'IN_STOCK',
        availableQuantity: 3
      }
    ]);

    setIsModalOpen(true);
  };

  const handleOpenAiDetails = (item: AiSearchResultItem) => {
    setSelectedProduct({
      id: item.productId,
      title: item.title,
      brand: item.brand,
      category: item.category,
      subCategory: item.category,
      description: `${item.title} with verified in-store warranty from ${item.merchant}.`,
      attributes: { warranty: '1 Year Brand Warranty', condition: 'Brand New In Box' },
      imageUrl: item.imageUrl,
      tags: []
    });

    setActiveOffers([
      {
        listingId: `offer-${item.productId}`,
        merchant: {
          organizationId: 'org-verified',
          shopName: item.merchant,
          shopSlug: item.merchant.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          rating: 4.9
        },
        store: {
          storeId: 'store-verified',
          name: item.merchant,
          city: item.city,
          address: 'Verified Local Storefront',
          distanceKm: 0.8
        },
        sellingPrice: item.price,
        originalMrp: item.originalMrp,
        stockStatus: item.inStock ? 'IN_STOCK' : 'LOW_STOCK',
        availableQuantity: item.availableStock
      }
    ]);

    setIsModalOpen(true);
  };

  return (
    <div className="w-full bg-[#F7F9FC] text-[#111827] selection:bg-[#167D73] selection:text-white font-sans">
      
      {/* ── 1. NATIVE 3D STOREFRONT DOOR HERO ─────────────────────── */}
      <DoorHero 
        onSelectCategory={(catKey) => {
          setSelectedCategory(catKey);
          showToast(`Filtered by ${catKey}`);
        }} 
        onSearch={(query) => {
          setAiQuery(query);
          handleAiSearch(query);
          document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── 2. MAIN EVALIPIE AI DISCOVERY INTERFACE (#ai) ──────────── */}
      {/* Centered, minimal, elegant, professional layout using brand palette */}
      <section className="w-full bg-[#FBF7EF] border-y border-[#E5EAF0] py-16 md:py-24" id="ai">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          {/* Small Heading */}
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#167D73] uppercase mb-3 block">
            EVALIPIE AI
          </span>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight mb-3">
            Find exactly what you need.
          </h2>

          {/* Supporting Text */}
          <p className="text-[#687385] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Describe what you're looking for. Discover relevant products from neighbourhood shops.
          </p>

          {/* Prominent Search Input with Functional Microphone & Primary Search Button */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = document.getElementById('aiSearchInput') as HTMLInputElement | null;
              const val = (input?.value || aiQuery).trim();
              if (val) handleAiSearch(val);
            }}
            className="relative flex items-center bg-white border border-[#E5EAF0] focus-within:border-[#167D73] focus-within:ring-2 focus-within:ring-[#167D73]/10 rounded-xl shadow-xs transition-all p-1.5 sm:p-2 max-w-2xl mx-auto"
          >
            <input 
              type="text" 
              id="aiSearchInput"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Describe the product you're looking for..."
              className="w-full bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-[#111827] placeholder-[#687385] outline-none"
              aria-label="Describe the product you're looking for"
            />

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Functional Microphone Control connected to voice-shopping assistant */}
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="p-2 sm:p-2.5 text-[#687385] hover:text-[#167D73] hover:bg-[#FBF7EF] rounded-lg transition-colors cursor-pointer"
                title="Speak to voice assistant"
                aria-label="Activate Microphone for Voice Shopping"
              >
                <Mic className="w-5 h-5" strokeWidth={1.75} />
              </button>

              {/* Primary Search Button calling backend AI discovery */}
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#167D73] hover:bg-[#105B55] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search Results Display — Only shown after a query is submitted */}
          {isSearching && (
            <div className="py-12 text-center text-sm font-medium text-[#687385]">
              Searching verified neighbourhood inventory...
            </div>
          )}

          {!isSearching && hasSearched && (
            <div className="mt-10 text-left">
              {aiResults.length === 0 ? (
                <div className="border border-[#E5EAF0] rounded-xl bg-white p-8 sm:p-10 text-center max-w-2xl mx-auto">
                  <p className="text-base font-semibold text-[#111827] mb-1">
                    No matching products found
                  </p>
                  <p className="text-sm text-[#687385] leading-relaxed">
                    No verified inventory in your area currently matches this description. Try adjusting your search or expanding your budget.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {aiMessage && (
                    <p className="text-xs sm:text-sm text-[#687385] px-1 font-medium">
                      {aiMessage}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {aiResults.map((item) => (
                      <div 
                        key={item.productId}
                        className="bg-white border border-[#E5EAF0] hover:border-[#167D73]/50 rounded-xl p-4 flex gap-4 transition-all"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-[#FBF7EF] border border-[#E5EAF0]">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base text-[#111827] line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#687385] mt-1 truncate">
                              {item.merchant} · {item.city}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="font-bold text-sm text-[#111827]">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                              {item.originalMrp > item.price && (
                                <span className="text-xs text-[#687385] line-through">
                                  ₹{item.originalMrp.toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className={`text-[11px] font-semibold ${item.inStock ? 'text-[#167D73]' : 'text-amber-700'}`}>
                                {item.inStock ? `${item.availableStock} in stock` : 'Low stock'}
                              </span>
                            </div>
                          </div>

                          {/* Actions: View Details and Add to Cart */}
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#E5EAF0]">
                            <button
                              type="button"
                              onClick={() => handleOpenAiDetails(item)}
                              className="text-xs font-semibold text-[#167D73] hover:text-[#105B55] px-2.5 py-1.5 rounded-md hover:bg-[#FBF7EF] transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddAiItemToCart(item)}
                              className="bg-[#111827] hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ml-auto"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ── 3. SHOP BY CATEGORY SECTION (#cats) ──────────────────── */}
      <section className="sec" id="cats" style={{ paddingTop: 0 }}>
        <h2>Shop by category</h2>
        <p className="sub">Everything your neighbourhood stores sell, in one place.</p>
        
        <div className="grid" id="catGrid">
          {CATEGORIES_DATA.map((cat) => (
            <div 
              key={cat.id} 
              className={`cat ${selectedCategory === cat.categoryKey ? 'active' : ''}`}
              onClick={() => {
                const nextCategory = selectedCategory === cat.categoryKey ? 'ALL' : cat.categoryKey;
                setSelectedCategory(nextCategory);
                showToast(nextCategory === 'ALL' ? 'Showing All Products' : `Filtered by ${cat.title}`);
                document.getElementById('trend')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="cat-img-box">
                <img src={cat.imageUrl} alt={cat.title} loading="lazy" />
              </div>
              <div className="cat-title font-bold text-sm text-[#111827]">{cat.title}</div>
              <div className="cat-meta text-xs text-[#687385]">{cat.itemCount} Items available</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. TRENDING IN BENGALURU (#trend) ────────────────────── */}
      <section className="sec" id="trend" style={{ paddingTop: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2>Trending in Bengaluru</h2>
            <p className="sub mb-0">Sample data for prototype purposes. Stock labels reflect each seller’s listing.</p>
          </div>
          
          {/* Active Filter Pill & Sort */}
          <div className="flex items-center gap-3">
            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  showToast('Showing All Products');
                }}
                className="bg-[#E9F7F3] hover:bg-[#d2f3e8] text-[#167D73] px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-[#A7E3D8]"
              >
                <span>Category: {selectedCategory}</span>
                <span className="text-sm">✕</span>
              </button>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#E5EAF0] text-xs font-bold text-[#111827] px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="TRENDING">Trending Deals</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="RATING">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid with Real Images */}
        <div className="grid" id="prodGrid">
          {filteredProducts.map((x) => (
            <article 
              key={x.id} 
              className="card cursor-pointer group"
              onClick={() => handleOpenProduct(x)}
            >
              <div className="img">
                <img src={x.imageUrl} alt={x.title} loading="lazy" />
              </div>
              <div className="cb">
                <h3 className="line-clamp-2">{x.title}</h3>
                <div className="shop">{x.store} · {x.locality}</div>
                <span className={`badge ${x.stockStatus}`}>
                  {x.stockStatus === 'in' ? 'In stock' : 'Low stock'}
                </span>
                <div className="price">
                  <span>₹{x.price.toLocaleString('en-IN')}</span>
                  {x.originalMrp > x.price && (
                    <s>₹{x.originalMrp.toLocaleString('en-IN')}</s>
                  )}
                </div>
                <button 
                  type="button" 
                  className="btn p"
                  onClick={(e) => handleAddToCart(x, e)}
                >
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 5. SHOPS NEAR YOU SECTION (#shops) ────────────────────── */}
      <section className="sec" id="shops" style={{ paddingTop: 0 }}>
        <h2>Shops near you</h2>
        <p className="sub">Independent stores and retail chains in Bengaluru (sample shops).</p>
        
        <div className="grid" id="shopGrid">
          {SHOPS_DATA.map((s) => (
            <div 
              key={s.id} 
              className="card cursor-pointer group"
              onClick={() => {
                navigate(`/shop/${s.slug}`);
                showToast(`Opening storefront: ${s.name}`);
              }}
            >
              <div className="img" style={{ aspectRatio: '16/9' }}>
                <img src={s.imageUrl} alt={s.name} loading="lazy" />
              </div>
              <div className="cb">
                <span className="tag" style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
                  {s.tag}
                </span>
                <h3>{s.name}</h3>
                <div className="shop">{s.locality}</div>
                <div className="text-xs font-semibold text-[#167D73] mt-1">
                  Rating: {s.rating}
                </div>
                <button 
                  type="button" 
                  className="btn o mt-3"
                  style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
                >
                  View Storefront →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. HOW EVALIPIE WORKS SECTION ────────────────────────── */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <h2>How Evalipie works</h2>
        <p className="sub">One marketplace, many real shops.</p>
        <div className="steps">
          <div className="step">
            <h3>Describe or search</h3>
            <p>Type a product name, or just tell Evalipie AI what you need.</p>
          </div>
          <div className="step">
            <h3>Compare local shops</h3>
            <p>See the same product from different sellers, prices and locations.</p>
          </div>
          <div className="step">
            <h3>Order safely</h3>
            <p>Stock is reserved at checkout, so the last item is never sold twice.</p>
          </div>
        </div>
      </section>

      {/* ── 7. BECOME A SELLER CTA SECTION (#sell) ────────────────── */}
      <section className="sec" id="sell" style={{ paddingTop: 0 }}>
        <div className="cta">
          <div>
            <h2>Your shop deserves its own digital store.</h2>
            <p>Create your store, manage inventory and reach more customers with Evalipie Business.</p>
          </div>
          <button 
            type="button" 
            className="btn"
            onClick={() => {
              navigate('/business');
              showToast('Opening Merchant Onboarding & Dashboard');
            }}
          >
            Start Selling
          </button>
        </div>
      </section>

      {/* ── 8. TOAST NOTIFICATION POPUP (#toast) ─────────────────── */}
      <div 
        id="toast" 
        className={isToastActive ? 'on' : ''} 
        aria-live="polite"
      >
        <Check className="w-4 h-4 text-[#10B981] inline-block mr-1.5" strokeWidth={2.5} />
        <span>{toastMessage}</span>
      </div>

      {/* ── 9. MULTI-SELLER COMPARISON MODAL ──────────────────────── */}
      <SellerComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        offers={activeOffers}
      />

      {/* ── 10. VOICE SHOPPING ASSISTANT MODAL ────────────────────── */}
      {/* Exactly ONE microphone entry point on homepage controls this */}
      <VoiceShoppingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

    </div>
  );
};

export default HomePage;
