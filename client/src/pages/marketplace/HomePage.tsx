import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Search, ChevronRight, Store, ShieldCheck, 
  ArrowRight, Check, ShoppingBag, Eye, MapPin, Zap
} from 'lucide-react';
import { DoorHero } from '../../components/hero/DoorHero.js';
import { ProductCard } from '../../components/catalog/ProductCard.js';
import { SellerComparisonModal } from '../../components/catalog/SellerComparisonModal.js';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { CanonicalProduct, MultiSellerOffer, Shop } from '../../../../shared/types.js';

// Curated Category Definitions matching Screenshot 2
const CATEGORIES_DATA = [
  {
    id: 'cat-kirana',
    title: 'Kirana & Staples',
    itemCount: 4,
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    categoryKey: 'KIRANA & GROCERIES'
  },
  {
    id: 'cat-audio',
    title: 'Electronics & Audio',
    itemCount: 6,
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    categoryKey: 'AUDIO'
  },
  {
    id: 'cat-mobiles',
    title: 'Mobiles & Smart Tech',
    itemCount: 5,
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&auto=format&fit=crop&q=80',
    categoryKey: 'MOBILES'
  },
  {
    id: 'cat-computers',
    title: 'Computers & Laptops',
    itemCount: 4,
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
    categoryKey: 'LAPTOPS'
  },
  {
    id: 'cat-home',
    title: 'Home & Kitchen',
    itemCount: 6,
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&auto=format&fit=crop&q=80',
    categoryKey: 'HOME & KITCHEN'
  },
  {
    id: 'cat-footwear',
    title: 'Footwear & Running',
    itemCount: 4,
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    categoryKey: 'FOOTWEAR'
  },
  {
    id: 'cat-fashion',
    title: 'Boutique Apparel',
    itemCount: 5,
    badge: 'STORE PRICES',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&auto=format&fit=crop&q=80',
    categoryKey: 'BOUTIQUE APPAREL'
  }
];

// Curated Products Matching Screenshot 1 & Catalogue
const CURATED_PRODUCTS = [
  // 1. Daawat Rozana Gold Basmati Rice (Screenshot 1)
  {
    product: {
      id: 'prod-kirana-daawat',
      title: 'Daawat Rozana Gold Basmati Rice (5kg)',
      brand: 'DAAWAT',
      category: 'Kirana & Groceries',
      subCategory: 'Rice & Grains',
      description: 'Finest aged long-grain Rozana Gold Basmati rice with authentic rich aroma and fluffy slender grains.',
      attributes: { weight: '5kg', grain_type: 'Long Grain Basmati' },
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      tags: ['rice', 'basmati', 'daawat', 'rozana', 'groceries', 'kirana']
    },
    minPrice: 420,
    originalMrp: 480,
    sellerCount: 3,
    inStock: true,
    rating: 4.8,
    reviewsCount: 310,
    featuredStoreName: 'City Supermarket (Indira...',
    distanceKm: 0.8,
    badge: 'Fresh Stock',
    availableStock: 14
  },
  // 2. Fortune Sunlite Refined Sunflower Oil (Screenshot 1)
  {
    product: {
      id: 'prod-kirana-fortune-oil',
      title: 'Fortune Sunlite Refined Sunflower Oil (1L Pouch)',
      brand: 'FORTUNE',
      category: 'Kirana & Groceries',
      subCategory: 'Cooking Oil',
      description: 'Light, healthy and refined sunflower oil enriched with vitamins A & D for everyday healthy cooking.',
      attributes: { volume: '1 Litre', type: 'Sunflower Oil' },
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      tags: ['oil', 'cooking oil', 'sunflower', 'fortune', 'kirana', 'groceries']
    },
    minPrice: 145,
    originalMrp: 175,
    sellerCount: 4,
    inStock: true,
    rating: 4.9,
    reviewsCount: 520,
    featuredStoreName: 'Sharma General Kirana',
    distanceKm: 0.5,
    badge: 'Popular',
    availableStock: 22
  },
  // 3. Tata Tea Gold Premium Black Tea (Screenshot 1)
  {
    product: {
      id: 'prod-kirana-tata-tea',
      title: 'Tata Tea Gold Premium Black Tea (500g Pack)',
      brand: 'TATA TEA',
      category: 'Kirana & Groceries',
      subCategory: 'Tea & Coffee',
      description: 'Exquisite blend of Assam tea leaves with gently rolled long leaves for rich taste and irresistible aroma.',
      attributes: { weight: '500g', blend: 'Assam Gold' },
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
      tags: ['tea', 'tata tea', 'chai', 'black tea', 'groceries']
    },
    minPrice: 285,
    originalMrp: 320,
    sellerCount: 3,
    inStock: true,
    rating: 4.9,
    reviewsCount: 680,
    featuredStoreName: 'City Supermarket (Jayan...',
    distanceKm: 1.1,
    badge: 'Top Rated',
    availableStock: 18
  },
  // 4. Aashirvaad Select Whole Wheat Atta (Screenshot 1)
  {
    product: {
      id: 'prod-kirana-aashirvaad-atta',
      title: 'Aashirvaad Select 100% Sharbati Whole Wheat Atta (5kg)',
      brand: 'AASHIRVAAD',
      category: 'Kirana & Groceries',
      subCategory: 'Atta & Flours',
      description: 'Made from 100% MP Sharbati wheat grains, sun-kissed and golden, producing rotis that stay extra soft.',
      attributes: { weight: '5kg', wheat_origin: 'Sehore, MP' },
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      tags: ['atta', 'flour', 'wheat', 'sharbati', 'aashirvaad', 'rotis']
    },
    minPrice: 310,
    originalMrp: 360,
    sellerCount: 3,
    inStock: true,
    rating: 4.8,
    reviewsCount: 440,
    featuredStoreName: 'Sharma General Kirana',
    distanceKm: 0.5,
    badge: 'Daily Essential',
    availableStock: 16
  },
  // 5. boAt Rockerz 550 Wireless Bluetooth Headphones
  {
    product: {
      id: 'prod-audio-boat-550',
      title: 'boAt Rockerz 550 Wireless Bluetooth Headphones',
      brand: 'BOAT',
      category: 'AUDIO',
      subCategory: 'Headphones',
      description: 'Over-ear headphones with 50mm dynamic drivers, physical noise isolation, and 20-hour battery life.',
      attributes: { drivers: '50mm', battery: '20 Hours', connectivity: 'Bluetooth 5.0' },
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      tags: ['bluetoth', 'headphone', 'audio', 'wireless', 'boat', 'meeting']
    },
    minPrice: 1999,
    originalMrp: 3999,
    sellerCount: 3,
    inStock: true,
    rating: 4.8,
    reviewsCount: 310,
    featuredStoreName: 'Sharma Electronics',
    distanceKm: 0.8,
    badge: 'Fresh Stock',
    availableStock: 12
  },
  // 6. Apple iPhone 16 (128GB)
  {
    product: {
      id: 'prod-mobiles-iphone16',
      title: 'Apple iPhone 16 (128GB) : Teal Aluminum',
      brand: 'APPLE',
      category: 'MOBILES',
      subCategory: 'Smartphones',
      description: 'A18 Bionic chip, Camera Control haptic interface, 48MP Fusion camera, and aerospace-grade aluminum enclosure.',
      attributes: { storage: '128GB', chip: 'A18 Bionic', color: 'Teal' },
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      tags: ['iphone', 'iphone 16', 'apple', 'mobile', '5g']
    },
    minPrice: 79900,
    originalMrp: 79900,
    sellerCount: 2,
    inStock: true,
    rating: 4.9,
    reviewsCount: 1420,
    featuredStoreName: 'Patel Digital Store',
    distanceKm: 1.4,
    badge: 'Popular',
    availableStock: 5
  },
  // 7. Lenovo ThinkPad E14
  {
    product: {
      id: 'prod-laptops-thinkpad-e14',
      title: 'Lenovo ThinkPad E14 Gen 5 AMD Ryzen 5 (16GB/512GB SSD)',
      brand: 'LENOVO',
      category: 'LAPTOPS',
      subCategory: 'Laptops',
      description: 'MIL-STD 810H certified business laptop with AMD Ryzen 5 7530U, backlit TrackPoint keyboard, and aluminum top cover.',
      attributes: { processor: 'Ryzen 5 7530U', ram: '16GB', storage: '512GB SSD' },
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
      tags: ['laptop', 'lenovo', 'thinkpad', 'ryzen', 'programming', 'work']
    },
    minPrice: 52990,
    originalMrp: 64990,
    sellerCount: 2,
    inStock: true,
    rating: 4.9,
    reviewsCount: 215,
    featuredStoreName: 'Patel Digital Store',
    distanceKm: 1.4,
    badge: 'Top Rated',
    availableStock: 5
  },
  // 8. Nike Air Zoom Pegasus 40
  {
    product: {
      id: 'prod-footwear-pegasus',
      title: 'Nike Air Zoom Pegasus 40 Road Running Shoes',
      brand: 'NIKE',
      category: 'FOOTWEAR',
      subCategory: 'Shoes',
      description: 'Responsive road runners with Nike React foam, dual Zoom Air units, and engineered breathable single-layer mesh.',
      attributes: { cushioning: 'Dual Zoom Air', size: 'UK 9 / US 10', weight: '288g' },
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      tags: ['shoes', 'nike', 'running', 'pegasus', 'footwear']
    },
    minPrice: 8495,
    originalMrp: 11495,
    sellerCount: 3,
    inStock: true,
    rating: 4.8,
    reviewsCount: 520,
    featuredStoreName: 'City Supermarket',
    distanceKm: 0.9,
    badge: 'Daily Essential',
    availableStock: 8
  }
];

// Curated Local Shops in Bengaluru
const LOCAL_SHOPS: Shop[] = [
  {
    id: 'shop-sharma-elec',
    organizationId: 'org-sharma',
    displayName: 'Sharma Electronics',
    slug: 'sharma-electronics',
    tagline: 'Independent electronics & audio retail',
    description: 'Independent electronics and audio retail specialist in Indiranagar since 2012.',
    logoUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&auto=format&fit=crop&q=80',
    ratingAvg: 4.8,
    ratingCount: 310,
    isPublished: true
  },
  {
    id: 'shop-patel-digital',
    organizationId: 'org-patel',
    displayName: 'Patel Digital Store',
    slug: 'patel-digital',
    tagline: 'Computing & Apple Authorized Specialist',
    description: 'Authorized retailer for ThinkPad, Apple, audio and computing peripherals in Jayanagar.',
    logoUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop&q=80',
    ratingAvg: 4.9,
    ratingCount: 520,
    isPublished: true
  },
  {
    id: 'shop-city-supermarket',
    organizationId: 'org-city',
    displayName: 'City Supermarket',
    slug: 'city-supermarket',
    tagline: 'Provisions, staples & groceries retail chain',
    description: 'Multi-branch grocery, fresh provisions, and daily essentials retail chain.',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80',
    ratingAvg: 4.8,
    ratingCount: 680,
    isPublished: true
  },
  {
    id: 'shop-modern-living',
    organizationId: 'org-modern',
    displayName: 'Modern Living Store',
    slug: 'modern-living',
    tagline: 'Modern furniture, ergonomics & appliances',
    description: 'Modern home furniture, ergonomics, and smart appliances in Koramangala.',
    logoUrl: 'https://images.unsplash.com/photo-1580481077195-c228c3b7f290?w=200&auto=format&fit=crop&q=80',
    ratingAvg: 4.9,
    ratingCount: 340,
    isPublished: true
  }
];

export const HomePage: React.FC = () => {
  const { activeCity } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>(CURATED_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'TRENDING' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('TRENDING');
  
  // Seller comparison modal state
  const [selectedProduct, setSelectedProduct] = useState<CanonicalProduct | null>(null);
  const [activeOffers, setActiveOffers] = useState<MultiSellerOffer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AI interactive search state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [hasSearchedAi, setHasSearchedAi] = useState(false);

  const sampleAiChips = [
    'Daawat basmati rice or sunflower oil under ₹500',
    'I need something for clear audio during online meetings under ₹3,000',
    'Find a compact kitchen appliance for a small apartment',
    'Suggest a product for organizing my workspace',
    'Wireless keyboard for programming'
  ];

  const handleAiSearch = (textToSearch?: string) => {
    const q = (textToSearch || aiQuery).trim().toLowerCase();
    if (!q) return;

    if (textToSearch) {
      setAiQuery(textToSearch);
    }

    setHasSearchedAi(true);

    // Extract potential budget
    const budgetMatch = q.match(/(?:₹|rs\.?\s?|under\s)\s?(\d[\d,]*)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : null;
    const words = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

    const matches = CURATED_PRODUCTS.map(item => {
      const p = item.product;
      const allText = `${p.title} ${p.brand} ${p.category} ${p.subCategory} ${p.tags.join(' ')}`.toLowerCase();
      const hits = words.filter(w => allText.includes(w));
      return { item, hits };
    })
      .filter(r => r.hits.length > 0 && (!budget || r.item.minPrice <= budget))
      .sort((a, b) => b.hits.length - a.hits.length)
      .slice(0, 4);

    setAiResults(matches);
  };

  const handleCompareSellers = async (product: CanonicalProduct) => {
    setSelectedProduct(product);
    try {
      const res = await api.getProductById(product.id, activeCity);
      if (res && res.offers && res.offers.length > 0) {
        setActiveOffers(res.offers);
      } else {
        // Fallback realistic offers for comparison
        setActiveOffers([
          {
            listingId: `list-1-${product.id}`,
            merchant: {
              organizationId: 'org-city',
              shopName: 'City Supermarket (Indiranagar)',
              shopSlug: 'city-supermarket',
              rating: 4.8
            },
            store: {
              storeId: 'store-ind',
              name: 'Indiranagar Hub',
              address: 'Indiranagar 100ft Road, Bengaluru',
              city: activeCity,
              distanceKm: 0.8
            },
            sellingPrice: 420,
            originalMrp: 480,
            stockStatus: 'IN_STOCK' as any,
            availableQuantity: 14
          },
          {
            listingId: `list-2-${product.id}`,
            merchant: {
              organizationId: 'org-sharma',
              shopName: 'Sharma General Kirana',
              shopSlug: 'sharma-general',
              rating: 4.9
            },
            store: {
              storeId: 'store-jdr',
              name: 'Jayanagar Branch',
              address: 'Jayanagar 4th Block, Bengaluru',
              city: activeCity,
              distanceKm: 1.2
            },
            sellingPrice: 435,
            originalMrp: 480,
            stockStatus: 'IN_STOCK' as any,
            availableQuantity: 8
          }
        ]);
      }
    } catch (err) {
      console.warn('Error fetching offers:', err);
    }
    setIsModalOpen(true);
  };

  // Filter & sort products
  const filteredProducts = products.filter(item => {
    if (selectedCategory === 'ALL') return true;
    return item.product.category.toUpperCase().includes(selectedCategory);
  }).sort((a, b) => {
    if (sortBy === 'PRICE_ASC') return a.minPrice - b.minPrice;
    if (sortBy === 'PRICE_DESC') return b.minPrice - a.minPrice;
    if (sortBy === 'RATING') return (b.rating || 4.8) - (a.rating || 4.8);
    return 0; // Trending default order
  });

  return (
    <div className="bg-[#F7F9FC]">
      
      {/* 1. SCROLL-DRIVEN 3D DOOR HERO (Matching Screenshot 5) */}
      <DoorHero />

      {/* 2. EVALIPIE AI DISCOVERY ENGINE */}
      <section className="sec" id="ai">
        <span className="tag ai">✦ Evalipie AI</span>
        <h2>You don’t need the product name. Just tell us what you need.</h2>
        <p className="sub">
          Describe what you are looking for. Evalipie AI matches it against verified in-stock products listed by participating local stores.
        </p>
        
        <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#687385] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAiSearch(); }}
                placeholder="Describe what you need (e.g. Daawat basmati rice under ₹500, wireless headphones for calls)..."
                className="w-full bg-[#F7F9FC] border border-[#E5EAF0] focus:border-[#7657E8] text-[#111827] text-sm pl-11 pr-4 py-3.5 rounded-xl outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAiSearch()}
              className="bg-[#7657E8] hover:bg-[#6042cf] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Evalipie AI</span>
            </button>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {sampleAiChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAiSearch(chip)}
                className="border border-[#E5EAF0] bg-[#F7F9FC] hover:border-[#7657E8] hover:text-[#7657E8] text-xs font-semibold text-[#111827] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* AI Search Results */}
          {hasSearchedAi && (
            <div className="mt-6 pt-6 border-t border-[#E5EAF0] space-y-3">
              {aiResults.length === 0 ? (
                <div className="p-4 bg-[#F7F9FC] rounded-xl text-sm text-[#687385]">
                  <p className="font-bold text-[#111827] mb-1">No exact match found in current catalogue.</p>
                  <p>Try different keywords or a higher budget. All results come strictly from verified merchant stock.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiResults.map(({ item, hits }, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 bg-[#F7F9FC] border border-[#E5EAF0] rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.title} 
                          className="w-14 h-14 object-cover rounded-lg shrink-0 border border-[#E5EAF0]" 
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#111827] truncate">
                            {item.product.title}
                          </p>
                          <p className="text-[11px] text-[#687385] truncate">
                            {item.featuredStoreName} · ₹{item.minPrice}
                          </p>
                          <span className="text-[10px] text-[#7657E8] font-bold">
                            Matches: {hits.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            listingId: `list-ai-${item.product.id}`,
                            storeId: 'store-hub',
                            productId: item.product.id,
                            title: item.product.title,
                            shopName: item.featuredStoreName,
                            shopSlug: 'central',
                            price: item.minPrice,
                            quantity: 1,
                            imageUrl: item.product.imageUrl
                          });
                        }}
                        className="bg-[#167D73] hover:bg-[#105B55] text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-[#687385] mt-4">
            Evalipie AI matches only real products with verified inventory from participating local merchants. Zero fabricated products or phantom stock.
          </p>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY (Matching Screenshot 2) */}
      <section className="sec pt-0" id="cats">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2>Shop by category</h2>
            <p className="sub mb-0">Everything your neighbourhood stores sell, in one place.</p>
          </div>
          <Link 
            to="/categories" 
            className="text-[#167D73] hover:text-[#105B55] font-bold text-sm flex items-center gap-1 group transition-colors"
          >
            <span>View Full Catalog</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Category Cards matching Screenshot 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.categoryKey)}
              className={`bg-white border rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 group ${
                selectedCategory === cat.categoryKey
                  ? 'border-[#167D73] shadow-md ring-2 ring-[#167D73]/20'
                  : 'border-[#E5EAF0] hover:border-[#167D73] hover:shadow-md'
              }`}
            >
              {/* Category Square Thumbnail matching Screenshot 2 */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center p-1">
                <img 
                  src={cat.imageUrl} 
                  alt={cat.title} 
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title & Count */}
              <h3 className="font-bold text-sm text-[#111827] leading-tight mb-1 group-hover:text-[#167D73] transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs text-[#687385] mb-3">
                {cat.itemCount} Items
              </p>

              {/* STORE PRICES Badge matching Screenshot 2 */}
              <span className="mt-auto bg-[#E9F7F3] text-[#167D73] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {cat.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TRENDING IN BENGALURU (Product Cards matching Screenshot 1) */}
      <section className="sec pt-0" id="trend">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2>Trending in {activeCity}</h2>
            <p className="sub mb-0">
              Compare prices, verified in-stock units, and store proximity across Indiranagar, Jayanagar & Whitefield.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#687385] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#E5EAF0] text-xs font-bold text-[#111827] px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="TRENDING">🔥 Trending Deals</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="RATING">Top Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid matching Screenshot 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((item) => (
            <ProductCard
              key={item.product.id}
              product={item.product}
              minPrice={item.minPrice}
              originalMrp={item.originalMrp}
              sellerCount={item.sellerCount}
              inStock={item.inStock}
              rating={item.rating}
              reviewsCount={item.reviewsCount}
              featuredStoreName={item.featuredStoreName}
              distanceKm={item.distanceKm}
              badge={item.badge}
              availableStock={item.availableStock}
              onCompare={handleCompareSellers}
            />
          ))}
        </div>
      </section>

      {/* 5. SHOPS NEAR YOU */}
      <section className="sec pt-0" id="shops">
        <h2>Shops near you</h2>
        <p className="sub">Independent stores and verified retail chains in {activeCity}.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOCAL_SHOPS.map((shop) => (
            <div
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.slug}`)}
              className="bg-white border border-[#E5EAF0] hover:border-[#167D73] rounded-2xl p-5 transition-all duration-200 cursor-pointer group shadow-sm"
            >
              <span className="tag mb-2">
                {shop.tagline || 'Verified Merchant'}
              </span>
              <h3 className="font-bold text-base text-[#111827] group-hover:text-[#167D73] transition-colors">
                {shop.displayName}
              </h3>
              <p className="text-xs text-[#687385] mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#167D73]" />
                <span>Indiranagar & Jayanagar, {activeCity}</span>
              </p>
              <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#167D73] font-semibold">★ {shop.ratingAvg} ({shop.ratingCount})</span>
                <span className="text-[#687385] font-medium group-hover:underline">View Store →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW EVALIPIE WORKS */}
      <section className="sec pt-0" id="how-it-works">
        <h2>How Evalipie works</h2>
        <p className="sub">One marketplace, many real neighbourhood shops.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <div className="w-9 h-9 rounded-full bg-[#167D73] text-white flex items-center justify-center font-bold text-sm mb-4">
              1
            </div>
            <h3 className="font-bold text-base text-[#111827] mb-1">Describe or search</h3>
            <p className="text-sm text-[#687385]">
              Type a product name, or just tell Evalipie AI what you need in plain English.
            </p>
          </div>
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <div className="w-9 h-9 rounded-full bg-[#167D73] text-white flex items-center justify-center font-bold text-sm mb-4">
              2
            </div>
            <h3 className="font-bold text-base text-[#111827] mb-1">Compare local shops</h3>
            <p className="text-sm text-[#687385]">
              See the exact same product from different sellers, competitive prices and store proximity.
            </p>
          </div>
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6">
            <div className="w-9 h-9 rounded-full bg-[#167D73] text-white flex items-center justify-center font-bold text-sm mb-4">
              3
            </div>
            <h3 className="font-bold text-base text-[#111827] mb-1">Order safely</h3>
            <p className="text-sm text-[#687385]">
              Stock is reserved at checkout with zero phantom units, so the last item is never sold twice.
            </p>
          </div>
        </div>
      </section>

      {/* 7. BECOME A SELLER CTA */}
      <section className="sec pt-0" id="sell">
        <div className="bg-gradient-to-r from-[#105B55] to-[#167D73] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
          <div>
            <h2 className="text-white text-2xl sm:text-3xl font-extrabold mb-2">
              Your shop deserves its own digital store.
            </h2>
            <p className="text-white/85 text-sm sm:text-base max-w-xl">
              Create your store, manage inventory, reach nearby buyers, and unlock 30-minute hyperlocal delivery with Evalipie Business.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/business')}
            className="bg-white hover:bg-gray-100 text-[#105B55] px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shrink-0 cursor-pointer"
          >
            Start Selling
          </button>
        </div>
      </section>

      {/* MULTI-SELLER COMPARISON MODAL */}
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
