import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoorHero } from '../../components/hero/DoorHero.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { useCart } from '../../context/CartContext.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

// ── 1. CURATED CATEGORIES WITH HIGH-RES REAL PHOTOGRAPHY ────────
const CATEGORIES_DATA = [
  {
    id: 'cat-audio',
    title: 'Electronics & Audio',
    itemCount: 6,
    emoji: '🎧',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'AUDIO'
  },
  {
    id: 'cat-mobiles',
    title: 'Mobiles & Smart Tech',
    itemCount: 5,
    emoji: '📱',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'MOBILES'
  },
  {
    id: 'cat-computers',
    title: 'Computers & Laptops',
    itemCount: 5,
    emoji: '💻',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'LAPTOPS'
  },
  {
    id: 'cat-home',
    title: 'Home & Kitchen',
    itemCount: 6,
    emoji: '🍳',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'HOME & KITCHEN'
  },
  {
    id: 'cat-fashion',
    title: 'Fashion & Apparel',
    itemCount: 5,
    emoji: '👕',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'BOUTIQUE APPAREL'
  },
  {
    id: 'cat-footwear',
    title: 'Footwear & Sports',
    itemCount: 4,
    emoji: '👟',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'FOOTWEAR'
  },
  {
    id: 'cat-wearables',
    title: 'Smart Wearables',
    itemCount: 4,
    emoji: '⌚',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    categoryKey: 'WEARABLES'
  },
  {
    id: 'cat-power',
    title: 'Power & Fast Chargers',
    itemCount: 4,
    emoji: '⚡',
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

// ── 4. AI SUGGESTION PROMPTS MATCHING PROTOTYPE ──────────────────
const AI_PROMPT_CHIPS = [
  'I need something for clear audio during online meetings under ₹3,000',
  'Find a compact kitchen appliance for a small apartment',
  'Suggest a product for organizing my workspace',
  'Wireless keyboard for programming'
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem, totalCount, openCart } = useCart();

  // Selected Category filter ('ALL' or categoryKey)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'TRENDING' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('TRENDING');

  // AI Search state
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiBudget, setAiBudget] = useState<number | null>(null);
  const [aiResults, setAiResults] = useState<Array<{ item: typeof PRODUCTS_DATA[0]; hits: string[] }>>([]);
  const [hasSearchedAi, setHasSearchedAi] = useState<boolean>(false);

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

  // ── AI Grounded Search Function matching prototype algorithm ──
  const handleAiSearch = (customQuery?: string) => {
    const rawQuery = (customQuery !== undefined ? customQuery : aiQuery).trim();
    if (!rawQuery) return;

    if (customQuery !== undefined) {
      setAiQuery(customQuery);
    }

    // Extract budget e.g. "under ₹3,000" or "under 2000" or "₹60,000"
    const m = rawQuery.match(/(?:₹|rs\.?\s?|under\s)\s?(\d[\d,]*)/i);
    const budget = m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
    setAiBudget(budget);

    // Extract search terms
    const words = rawQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

    // Score products based on matching tags and title
    const scored = PRODUCTS_DATA.map(product => {
      const hits = product.tags.filter(tag => 
        words.some(word => tag.toLowerCase().startsWith(word) || word.startsWith(tag.toLowerCase()))
      );
      return { item: product, hits };
    })
    .filter(res => res.hits.length > 0 && (!budget || res.item.price <= budget))
    .sort((a, b) => b.hits.length - a.hits.length)
    .slice(0, 4);

    setAiResults(scored);
    setHasSearchedAi(true);

    if (scored.length > 0) {
      showToast(`Found ${scored.length} verified match(es) from local shops`);
    }
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
    showToast(`Added to cart · ${product.title}`);
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

  return (
    <div className="w-full bg-[#F7F9FC] text-[#111827] selection:bg-[#167D73] selection:text-white font-sans">
      
      {/* ── 1. NATIVE 3D STOREFRONT DOOR HERO ─────────────────────── */}
      <DoorHero 
        onSelectCategory={(catKey) => {
          setSelectedCategory(catKey);
          showToast(`Filtered by ${catKey}`);
        }} 
        onSearch={(query) => {
          handleAiSearch(query);
          showToast(`Searching verified local inventory for "${query}"`);
        }}
      />

      {/* ── 2. EVALIPIE AI DISCOVERY SECTION (#ai) ────────────────── */}
      <section className="sec" id="ai">
        <span className="tag ai">✦ Evalipie AI</span>
        <h2>You don’t need the product name. Just tell us what you need.</h2>
        <p className="sub">
          Describe what you are looking for. Evalipie AI matches it against products listed by participating stores.
        </p>

        <div className="ai-box">
          <div className="ai-in">
            <input 
              id="q" 
              placeholder="Describe what you need…" 
              aria-label="Describe what you need"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAiSearch();
              }}
            />
            <button 
              type="button" 
              className="btn a" 
              id="go"
              onClick={() => handleAiSearch()}
            >
              Ask Evalipie AI
            </button>
          </div>

          {/* Example Prompt Chips matching prototype */}
          <div className="chips" id="chips">
            {AI_PROMPT_CHIPS.map((chip, idx) => (
              <button 
                key={idx} 
                type="button" 
                className="chip"
                onClick={() => handleAiSearch(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Dynamic AI Results Output */}
          <div id="aiOut" aria-live="polite">
            {hasSearchedAi && (
              <>
                {aiResults.length === 0 ? (
                  <p className="note">
                    <b>No matching listings yet.</b> Nothing in the sample catalogue fits that request
                    {aiBudget ? ` within ₹${aiBudget.toLocaleString('en-IN')}` : ''}. 
                    Try different words or a higher budget. This kind of unmet search is what Demand Insights shows merchants.
                  </p>
                ) : (
                  <>
                    <p className="note">
                      {aiBudget 
                        ? <>Showing matches up to <b>₹{aiBudget.toLocaleString('en-IN')}</b>.</>
                        : <><b>Quick question:</b> what is your budget? I’ve shown the closest verified matches meanwhile.</>
                      }
                    </p>
                    {aiResults.map(({ item, hits }, idx) => (
                      <div key={idx} className="res">
                        <div className="res-img">
                          <img src={item.imageUrl} alt={item.title} />
                        </div>
                        <div>
                          <b className="text-sm text-[#111827]">{item.title}</b>{' '}
                          <span className="shop">· {item.store}</span>
                          <div className="text-xs font-bold text-[#111827] mt-1 flex items-center gap-2">
                            <span>₹{item.price.toLocaleString('en-IN')}</span>
                            <span className={`badge ${item.stockStatus}`}>
                              {item.stockStatus === 'in' ? 'In stock' : 'Low stock'}
                            </span>
                          </div>
                          <div className="why">
                            Matches: {hits.slice(0, 3).join(', ')}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn p"
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to cart
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          <p className="priv">
            Prototype: results come only from the sample catalogue below. Evalipie AI never invents products, prices, sellers or stock.
          </p>
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
                <span className="cat-icon">{cat.emoji}</span>
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
              <option value="TRENDING">🔥 Trending Deals</option>
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
                  ★ {s.rating}
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
        <span className="text-[#10B981] font-bold">✓</span>
        <span>{toastMessage}</span>
      </div>

      {/* ── 9. MULTI-SELLER COMPARISON MODAL ──────────────────────── */}
      <SellerComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        offers={activeOffers}
      />

    </div>
  );
};

export default HomePage;
