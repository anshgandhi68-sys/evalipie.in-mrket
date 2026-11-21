import {
  Organization,
  Store,
  Shop,
  CanonicalProduct,
  MerchantListing,
  StoreInventory,
  LedgerCustomer,
  LedgerEntry,
  Order,
  OutboxEvent
} from '../../../shared/types.js';

export const initialOrganizations: Organization[] = [
  {
    id: 'org-sharma',
    name: 'Sharma Electronics & Electricals',
    businessType: 'INDEPENDENT_SHOP',
    taxIdentifier: '29ABCDE1234F1Z5',
    contactEmail: 'sharma@evalipie.in',
    contactPhone: '+919876543210',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'org-patel',
    name: 'Patel Digital Store',
    businessType: 'INDEPENDENT_SHOP',
    taxIdentifier: '29FGHIJ5678K1Z2',
    contactEmail: 'patel@evalipie.in',
    contactPhone: '+919811223344',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'org-citysuper',
    name: 'City Supermarket Retail Chain Ltd',
    businessType: 'RETAIL_CHAIN',
    taxIdentifier: '29KLMNO9012P1Z9',
    contactEmail: 'ops@citysupermarket.in',
    contactPhone: '+918025251234',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'org-modern',
    name: 'Modern Living Home Store',
    businessType: 'INDEPENDENT_SHOP',
    taxIdentifier: '29PQRST3456U1Z3',
    contactEmail: 'hello@modernliving.in',
    contactPhone: '+919900112233',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'org-kirana',
    name: 'Sharma General Kirana & Provisions',
    businessType: 'INDEPENDENT_SHOP',
    taxIdentifier: '29ABCDE1234F1Z8',
    contactEmail: 'kirana@evalipie.in',
    contactPhone: '+919845012345',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const initialStores: Store[] = [
  {
    id: 'store-sharma-ind',
    organizationId: 'org-sharma',
    name: 'Main Store - Indiranagar',
    storeCode: 'SHAR-IND-01',
    addressLine1: '42, 100ft Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: 12.9784,
    longitude: 77.6408,
    contactPhone: '+919876543210',
    isActive: true
  },
  {
    id: 'store-patel-jay',
    organizationId: 'org-patel',
    name: 'Patel Digital - Jayanagar',
    storeCode: 'PATEL-JAY-01',
    addressLine1: '18, 4th Block, 11th Main, Jayanagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560011',
    latitude: 12.9308,
    longitude: 77.5838,
    contactPhone: '+919811223344',
    isActive: true
  },
  {
    id: 'store-city-ind',
    organizationId: 'org-citysuper',
    name: 'City Supermarket — Indiranagar Branch',
    storeCode: 'CITY-IND-01',
    addressLine1: '12th Main Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: 12.9719,
    longitude: 77.6412,
    contactPhone: '+918025251234',
    isActive: true
  },
  {
    id: 'store-city-jay',
    organizationId: 'org-citysuper',
    name: 'City Supermarket — Jayanagar Branch',
    storeCode: 'CITY-JAY-02',
    addressLine1: '32, 9th Cross, 3rd Block, Jayanagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560011',
    latitude: 12.9298,
    longitude: 77.5824,
    contactPhone: '+918025251235',
    isActive: true
  },
  {
    id: 'store-city-whi',
    organizationId: 'org-citysuper',
    name: 'City Supermarket — Whitefield Branch',
    storeCode: 'CITY-WHI-03',
    addressLine1: 'ITPB Main Road, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560066',
    latitude: 12.9698,
    longitude: 77.7499,
    contactPhone: '+918025251236',
    isActive: true
  },
  {
    id: 'store-modern-kor',
    organizationId: 'org-modern',
    name: 'Modern Living - Koramangala',
    storeCode: 'MOD-KOR-01',
    addressLine1: '80ft Road, 4th Block, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560034',
    latitude: 12.9352,
    longitude: 77.6245,
    contactPhone: '+919900112233',
    isActive: true
  },
  {
    id: 'store-kirana-ind',
    organizationId: 'org-kirana',
    name: 'Sharma General Kirana — Indiranagar',
    storeCode: 'SHAR-KIR-01',
    addressLine1: '88, 6th Main, Defence Colony, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: 12.9750,
    longitude: 77.6430,
    contactPhone: '+919845012345',
    isActive: true
  }
];

export const initialShops: Shop[] = [
  {
    id: 'shop-kirana',
    organizationId: 'org-kirana',
    slug: 'sharma-kirana',
    displayName: 'Sharma General Kirana',
    tagline: 'Fresh Staples, Daily Groceries, Pure Ghee & Spices',
    description: 'Neighbourhood grocery store serving Indiranagar since 1998 with hand-picked Basmati rice, premium pulses, and everyday staples.',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=80',
    primaryColor: '#059669',
    ratingAvg: 4.9,
    ratingCount: 520,
    isPublished: true
  },
  {
    id: 'shop-sharma',
    organizationId: 'org-sharma',
    slug: 'sharma-electronics',
    displayName: 'Sharma Electronics',
    tagline: "Indiranagar's Most Trusted Electronics Store Since 2002",
    description: 'Specialists in audio gear, desktop accessories, fast chargers, and daily electronics. Same-day local delivery across East Bengaluru.',
    logoUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80',
    primaryColor: '#167D73',
    ratingAvg: 4.9,
    ratingCount: 142,
    isPublished: true
  },
  {
    id: 'shop-patel',
    organizationId: 'org-patel',
    slug: 'patel-digital',
    displayName: 'Patel Digital Store',
    tagline: 'Premium Gadgets, Gaming Gear & Streaming Accessories',
    description: 'South Bengaluru destination for genuine microphones, gaming mice, keyboards, and creator setups.',
    logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    primaryColor: '#7657E8',
    ratingAvg: 4.8,
    ratingCount: 98,
    isPublished: true
  },
  {
    id: 'shop-citysuper',
    organizationId: 'org-citysuper',
    slug: 'city-supermarket',
    displayName: 'City Supermarket',
    tagline: '3 Branches in Bengaluru — Groceries, Appliances & Home Goods',
    description: 'Established retail chain serving Indiranagar, Jayanagar, and Whitefield with guaranteed fresh stock and local pickup.',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
    primaryColor: '#16A34A',
    ratingAvg: 4.7,
    ratingCount: 420,
    isPublished: true
  },
  {
    id: 'shop-modern',
    organizationId: 'org-modern',
    slug: 'modern-living',
    displayName: 'Modern Living Store',
    tagline: 'Smart Living, Kitchen Appliances & Workspace Essentials',
    description: 'Curated home goods and compact appliances for modern urban apartments in Koramangala.',
    logoUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=120&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    primaryColor: '#E9A23B',
    ratingAvg: 4.6,
    ratingCount: 64,
    isPublished: true
  }
];

export const initialProducts: CanonicalProduct[] = [
  {
    id: 'prod-1',
    title: 'SoundPro Bluetooth Wireless Headphones',
    brand: 'SoundPro',
    category: 'Electronics',
    subCategory: 'Audio',
    upcEan: '8901234567890',
    description: 'High-fidelity wireless headphones with Active Noise Cancellation (ANC), 30-hour battery life, and crystal clear dual microphones for video meetings.',
    attributes: {
      connectivity: 'Bluetooth 5.3',
      battery_hours: 30,
      noise_cancellation: true,
      color: 'Midnight Black'
    },
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    tags: ['headphones', 'bluetooth', 'wireless', 'meeting', 'audio', 'call', 'voice', 'headset', 'music']
  },
  {
    id: 'prod-2',
    title: 'HyperClear USB Condenser Microphone',
    brand: 'HyperClear',
    category: 'Electronics',
    subCategory: 'Audio',
    upcEan: '8901234567891',
    description: 'Studio-grade cardioid USB microphone with built-in pop filter, zero-latency headphone monitoring, and background noise isolation for meetings and streams.',
    attributes: {
      polar_pattern: 'Cardioid',
      sample_rate: '192kHz/24bit',
      connectivity: 'USB-C',
      mute_button: true
    },
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    tags: ['microphone', 'meeting', 'voice', 'clear', 'audio', 'online', 'stream', 'call', 'usb']
  },
  {
    id: 'prod-3',
    title: 'KeyCraft Wireless Ergonomic Keyboard',
    brand: 'KeyCraft',
    category: 'Computers & Laptops',
    subCategory: 'Peripherals',
    upcEan: '8901234567892',
    description: 'Low-profile wireless mechanical keyboard with quiet linear switches, multi-device Bluetooth/2.4GHz switching, and cushioned palm rest for long coding sessions.',
    attributes: {
      switch_type: 'Low Profile Red',
      layout: '75%',
      connectivity: 'Tri-mode (Bluetooth/2.4G/Wired)'
    },
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    tags: ['keyboard', 'typing', 'wireless', 'work', 'programming', 'laptop', 'ergonomic']
  },
  {
    id: 'prod-4',
    title: 'ViperTech Precision Gaming Mouse',
    brand: 'ViperTech',
    category: 'Computers & Laptops',
    subCategory: 'Peripherals',
    upcEan: '8901234567893',
    description: 'Ultra-lightweight 58g ergonomic gaming mouse with 16,000 DPI optical sensor, PTFE glide feet, and programmable thumb macro buttons.',
    attributes: {
      dpi: 16000,
      weight_grams: 58,
      sensor: 'PixArt 3389'
    },
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    tags: ['mouse', 'gaming', 'game', 'work', 'ergonomic', 'usb']
  },
  {
    id: 'prod-5',
    title: 'ChefMax Compact Digital Air Fryer 4.2L',
    brand: 'ChefMax',
    category: 'Home & Kitchen',
    subCategory: 'Appliances',
    upcEan: '8901234567894',
    description: 'Space-saving 4.2L digital air fryer with 8 one-touch cooking presets, rapid 360-degree hot air circulation, and non-stick dishwasher-safe basket.',
    attributes: {
      capacity_litres: 4.2,
      power_watts: 1400,
      presets_count: 8
    },
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
    tags: ['kitchen', 'appliance', 'compact', 'apartment', 'cook', 'small', 'air fryer']
  },
  {
    id: 'prod-6',
    title: 'Moderne Steel Mesh Desk Organiser Set',
    brand: 'Moderne',
    category: 'Home & Kitchen',
    subCategory: 'Organization',
    upcEan: '8901234567895',
    description: 'Durable 6-compartment desk caddy with sliding drawer, pen barrels, and memo pad holder for clean and clutter-free workspaces.',
    attributes: {
      material: 'Powder-coated steel mesh',
      compartments: 6,
      color: 'Matte Black'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    tags: ['organize', 'organizing', 'workspace', 'desk', 'storage', 'stationery']
  },
  {
    id: 'prod-7',
    title: 'PowerVolt 65W GaN Fast Charger 3-Port',
    brand: 'PowerVolt',
    category: 'Mobiles & Accessories',
    subCategory: 'Chargers',
    upcEan: '8901234567896',
    description: 'Gallium Nitride (GaN) fast wall charger with 2 USB-C and 1 USB-A port, capable of charging laptops and smartphones simultaneously.',
    attributes: {
      power_watts: 65,
      ports: '2x USB-C, 1x USB-A',
      technology: 'GaN III'
    },
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    tags: ['charger', 'gan', 'fast charging', 'usb-c', 'mobile', 'laptop']
  },
  {
    id: 'prod-8',
    title: 'PulsePro AMOLED Smart Fitness Watch',
    brand: 'PulsePro',
    category: 'Electronics',
    subCategory: 'Wearables',
    upcEan: '8901234567897',
    description: '1.43-inch AMOLED display smartwatch with continuous heart-rate, SpO2 blood oxygen tracking, 110+ sports modes, and 12-day battery life.',
    attributes: {
      display: '1.43 inch AMOLED',
      battery_days: 12,
      water_resistant: '5 ATM'
    },
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    tags: ['watch', 'smartwatch', 'fitness', 'health', 'heart rate', 'tracker']
  },
  {
    id: 'prod-kirana-1',
    title: 'Daawat Rozana Gold Basmati Rice (5kg)',
    brand: 'Daawat',
    category: 'Kirana & Groceries',
    subCategory: 'Rice & Grains',
    upcEan: '8901234567901',
    description: 'Finest long-grain Rozana Gold Basmati rice with authentic rich aroma, fluffy texture, and slender grains for daily biryani and pulav.',
    attributes: {
      weight: '5kg',
      grain_type: 'Long Grain Basmati',
      shelf_life: '24 Months'
    },
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    tags: ['rice', 'basmati', 'daawat', 'rozana', 'groceries', 'kirana', 'grains', 'food', 'staples']
  },
  {
    id: 'prod-kirana-2',
    title: 'Fortune Sunlite Refined Sunflower Oil (1L Pouch)',
    brand: 'Fortune',
    category: 'Kirana & Groceries',
    subCategory: 'Edible Oils',
    upcEan: '8901234567902',
    description: 'Light, non-sticky refined sunflower cooking oil enriched with Vitamin A and Vitamin D for healthy everyday cooking and frying.',
    attributes: {
      volume: '1L',
      packaging: 'Pouch',
      enriched_with: 'Vitamins A & D'
    },
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    tags: ['oil', 'cooking oil', 'sunflower oil', 'fortune', 'sunlite', 'kirana', 'groceries', 'staples']
  },
  {
    id: 'prod-kirana-3',
    title: 'Tata Tea Gold Premium Black Tea (500g Pack)',
    brand: 'Tata Tea',
    category: 'Kirana & Groceries',
    subCategory: 'Tea & Beverages',
    upcEan: '8901234567903',
    description: 'Exquisite blend of rich Assam CTC tea with 15% gently rolled long leaves for an irresistible aroma and rich full-bodied taste.',
    attributes: {
      weight: '500g',
      blend: 'Assam CTC with Long Leaves',
      caffeine: 'Medium'
    },
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    tags: ['tea', 'chai', 'tata tea', 'gold', 'assam tea', 'beverages', 'kirana', 'groceries']
  },
  {
    id: 'prod-kirana-4',
    title: 'Aashirvaad Select 100% Sharbati Whole Wheat Atta (5kg)',
    brand: 'Aashirvaad',
    category: 'Kirana & Groceries',
    subCategory: 'Flours & Grains',
    upcEan: '8901234567904',
    description: 'Premium quality 100% pure Sharbati wheat flour harvested from Sehore, Madhya Pradesh, producing golden, extra-soft rotis that stay soft longer.',
    attributes: {
      weight: '5kg',
      grain_source: 'Madhya Pradesh Sharbati',
      fiber: 'High Fiber Whole Wheat'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    tags: ['atta', 'wheat flour', 'aashirvaad', 'sharbati', 'roti', 'kirana', 'groceries', 'staples']
  }
];

export const initialListings: MerchantListing[] = [
  // SoundPro Headphones (prod-1) sold by Sharma (Priced at 2499) - STOCK = 1 FOR CONCURRENCY TEST!
  {
    id: 'list-sharma-headphone',
    organizationId: 'org-sharma',
    productId: 'prod-1',
    merchantSku: 'SHAR-AUD-001',
    sellingPrice: 2499.00,
    originalMrp: 3299.00,
    condition: 'NEW',
    isActive: true
  },
  // SoundPro Headphones (prod-1) also sold by Patel Digital (Priced at 2699)
  {
    id: 'list-patel-headphone',
    organizationId: 'org-patel',
    productId: 'prod-1',
    merchantSku: 'PAT-AUD-88',
    sellingPrice: 2699.00,
    originalMrp: 3299.00,
    condition: 'NEW',
    isActive: true
  },
  // SoundPro Headphones (prod-1) also sold by City Supermarket (Priced at 2799)
  {
    id: 'list-city-headphone',
    organizationId: 'org-citysuper',
    productId: 'prod-1',
    merchantSku: 'CITY-ELEC-10',
    sellingPrice: 2799.00,
    originalMrp: 3299.00,
    condition: 'NEW',
    isActive: true
  },
  // USB Mic (prod-2) sold by Patel Digital
  {
    id: 'list-patel-mic',
    organizationId: 'org-patel',
    productId: 'prod-2',
    merchantSku: 'PAT-MIC-01',
    sellingPrice: 2799.00,
    originalMrp: 3499.00,
    condition: 'NEW',
    isActive: true
  },
  // USB Mic (prod-2) sold by Sharma Electronics
  {
    id: 'list-sharma-mic',
    organizationId: 'org-sharma',
    productId: 'prod-2',
    merchantSku: 'SHAR-MIC-02',
    sellingPrice: 2899.00,
    originalMrp: 3499.00,
    condition: 'NEW',
    isActive: true
  },
  // Wireless Keyboard (prod-3) sold by Sharma Electronics
  {
    id: 'list-sharma-keyboard',
    organizationId: 'org-sharma',
    productId: 'prod-3',
    merchantSku: 'SHAR-KB-01',
    sellingPrice: 1499.00,
    originalMrp: 1999.00,
    condition: 'NEW',
    isActive: true
  },
  // Gaming Mouse (prod-4) sold by Patel Digital
  {
    id: 'list-patel-mouse',
    organizationId: 'org-patel',
    productId: 'prod-4',
    merchantSku: 'PAT-MOU-01',
    sellingPrice: 999.00,
    originalMrp: 1299.00,
    condition: 'NEW',
    isActive: true
  },
  // Compact Air Fryer (prod-5) sold by Modern Living
  {
    id: 'list-modern-fryer',
    organizationId: 'org-modern',
    productId: 'prod-5',
    merchantSku: 'MOD-APP-01',
    sellingPrice: 3999.00,
    originalMrp: 4999.00,
    condition: 'NEW',
    isActive: true
  },
  // Air Fryer (prod-5) also sold by City Supermarket (3 branches)
  {
    id: 'list-city-fryer',
    organizationId: 'org-citysuper',
    productId: 'prod-5',
    merchantSku: 'CITY-KIT-05',
    sellingPrice: 4199.00,
    originalMrp: 4999.00,
    condition: 'NEW',
    isActive: true
  },
  // Desk Organiser (prod-6) sold by Modern Living
  {
    id: 'list-modern-desk',
    organizationId: 'org-modern',
    productId: 'prod-6',
    merchantSku: 'MOD-DSK-01',
    sellingPrice: 799.00,
    originalMrp: 999.00,
    condition: 'NEW',
    isActive: true
  },
  // GaN Charger (prod-7) sold by Sharma Electronics
  {
    id: 'list-sharma-charger',
    organizationId: 'org-sharma',
    productId: 'prod-7',
    merchantSku: 'SHAR-CHG-01',
    sellingPrice: 1899.00,
    originalMrp: 2499.00,
    condition: 'NEW',
    isActive: true
  },
  // Fitness Watch (prod-8) sold by Patel Digital
  {
    id: 'list-patel-watch',
    organizationId: 'org-patel',
    productId: 'prod-8',
    merchantSku: 'PAT-WTC-01',
    sellingPrice: 2499.00,
    originalMrp: 3499.00,
    condition: 'NEW',
    isActive: true
  },
  // Kirana Products Matching User Reference
  {
    id: 'list-city-rice',
    organizationId: 'org-citysuper',
    productId: 'prod-kirana-1',
    merchantSku: 'CITY-RICE-01',
    sellingPrice: 420.00,
    originalMrp: 480.00,
    condition: 'NEW',
    isActive: true
  },
  {
    id: 'list-kirana-rice',
    organizationId: 'org-kirana',
    productId: 'prod-kirana-1',
    merchantSku: 'KIR-RICE-01',
    sellingPrice: 435.00,
    originalMrp: 480.00,
    condition: 'NEW',
    isActive: true
  },
  {
    id: 'list-kirana-oil',
    organizationId: 'org-kirana',
    productId: 'prod-kirana-2',
    merchantSku: 'KIR-OIL-01',
    sellingPrice: 145.00,
    originalMrp: 175.00,
    condition: 'NEW',
    isActive: true
  },
  {
    id: 'list-city-oil',
    organizationId: 'org-citysuper',
    productId: 'prod-kirana-2',
    merchantSku: 'CITY-OIL-01',
    sellingPrice: 152.00,
    originalMrp: 175.00,
    condition: 'NEW',
    isActive: true
  },
  {
    id: 'list-city-tea',
    organizationId: 'org-citysuper',
    productId: 'prod-kirana-3',
    merchantSku: 'CITY-TEA-01',
    sellingPrice: 285.00,
    originalMrp: 320.00,
    condition: 'NEW',
    isActive: true
  },
  {
    id: 'list-kirana-tea',
    organizationId: 'org-kirana',
    productId: 'prod-kirana-3',
    merchantSku: 'KIR-TEA-01',
    sellingPrice: 295.00,
    originalMrp: 320.00,
    condition: 'NEW',
    isActive: true
  },
  {
    id: 'list-kirana-atta',
    organizationId: 'org-kirana',
    productId: 'prod-kirana-4',
    merchantSku: 'KIR-ATTA-01',
    sellingPrice: 310.00,
    originalMrp: 360.00,
    condition: 'NEW',
    isActive: true
  },
  {
    id: 'list-city-atta',
    organizationId: 'org-citysuper',
    productId: 'prod-kirana-4',
    merchantSku: 'CITY-ATTA-01',
    sellingPrice: 325.00,
    originalMrp: 360.00,
    condition: 'NEW',
    isActive: true
  }
];

export const initialInventory: StoreInventory[] = [
  // Kirana Inventories
  {
    id: 'inv-city-rice-ind',
    listingId: 'list-city-rice',
    storeId: 'store-city-ind',
    quantity: 18,
    reservedQuantity: 0,
    reorderThreshold: 5
  },
  {
    id: 'inv-kirana-rice-ind',
    listingId: 'list-kirana-rice',
    storeId: 'store-kirana-ind',
    quantity: 12,
    reservedQuantity: 0,
    reorderThreshold: 4
  },
  {
    id: 'inv-kirana-oil-ind',
    listingId: 'list-kirana-oil',
    storeId: 'store-kirana-ind',
    quantity: 24,
    reservedQuantity: 0,
    reorderThreshold: 6
  },
  {
    id: 'inv-city-oil-ind',
    listingId: 'list-city-oil',
    storeId: 'store-city-ind',
    quantity: 30,
    reservedQuantity: 0,
    reorderThreshold: 8
  },
  {
    id: 'inv-city-tea-ind',
    listingId: 'list-city-tea',
    storeId: 'store-city-ind',
    quantity: 15,
    reservedQuantity: 0,
    reorderThreshold: 4
  },
  {
    id: 'inv-kirana-tea-ind',
    listingId: 'list-kirana-tea',
    storeId: 'store-kirana-ind',
    quantity: 10,
    reservedQuantity: 0,
    reorderThreshold: 3
  },
  {
    id: 'inv-kirana-atta-ind',
    listingId: 'list-kirana-atta',
    storeId: 'store-kirana-ind',
    quantity: 20,
    reservedQuantity: 0,
    reorderThreshold: 5
  },
  {
    id: 'inv-city-atta-ind',
    listingId: 'list-city-atta',
    storeId: 'store-city-ind',
    quantity: 25,
    reservedQuantity: 0,
    reorderThreshold: 6
  },
  // Sharma Headphone: EXACTLY 1 REMAINING! (Key for concurrency contest)
  {
    id: 'inv-sharma-headphone-ind',
    listingId: 'list-sharma-headphone',
    storeId: 'store-sharma-ind',
    quantity: 1,
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  // Patel Headphone: 5 in stock
  {
    id: 'inv-patel-headphone-jay',
    listingId: 'list-patel-headphone',
    storeId: 'store-patel-jay',
    quantity: 5,
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  // City Supermarket Headphone (Indiranagar branch)
  {
    id: 'inv-city-headphone-ind',
    listingId: 'list-city-headphone',
    storeId: 'store-city-ind',
    quantity: 3,
    reservedQuantity: 0,
    reorderThreshold: 1
  },
  // Patel Mic: 2 in stock (Low stock)
  {
    id: 'inv-patel-mic-jay',
    listingId: 'list-patel-mic',
    storeId: 'store-patel-jay',
    quantity: 2,
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  // Sharma Mic: 4 in stock
  {
    id: 'inv-sharma-mic-ind',
    listingId: 'list-sharma-mic',
    storeId: 'store-sharma-ind',
    quantity: 4,
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  // Sharma Keyboard: 6 in stock
  {
    id: 'inv-sharma-kb-ind',
    listingId: 'list-sharma-keyboard',
    storeId: 'store-sharma-ind',
    quantity: 6,
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  // Patel Mouse: 8 in stock
  {
    id: 'inv-patel-mouse-jay',
    listingId: 'list-patel-mouse',
    storeId: 'store-patel-jay',
    quantity: 8,
    reservedQuantity: 0,
    reorderThreshold: 3
  },
  // Modern Living Air Fryer (Koramangala): 2 in stock
  {
    id: 'inv-modern-fryer-kor',
    listingId: 'list-modern-fryer',
    storeId: 'store-modern-kor',
    quantity: 2,
    reservedQuantity: 0,
    reorderThreshold: 1
  },
  // City Supermarket Air Fryer across its 3 branches:
  {
    id: 'inv-city-fryer-ind',
    listingId: 'list-city-fryer',
    storeId: 'store-city-ind',
    quantity: 4,
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  {
    id: 'inv-city-fryer-jay',
    listingId: 'list-city-fryer',
    storeId: 'store-city-jay',
    quantity: 0, // OUT OF STOCK at Jayanagar branch to test location availability!
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  {
    id: 'inv-city-fryer-whi',
    listingId: 'list-city-fryer',
    storeId: 'store-city-whi',
    quantity: 3,
    reservedQuantity: 0,
    reorderThreshold: 1
  },
  // Modern Living Desk Organiser: 7 in stock
  {
    id: 'inv-modern-desk-kor',
    listingId: 'list-modern-desk',
    storeId: 'store-modern-kor',
    quantity: 7,
    reservedQuantity: 0,
    reorderThreshold: 2
  },
  // Sharma Charger: 12 in stock
  {
    id: 'inv-sharma-charger-ind',
    listingId: 'list-sharma-charger',
    storeId: 'store-sharma-ind',
    quantity: 12,
    reservedQuantity: 0,
    reorderThreshold: 3
  },
  // Patel Watch: 4 in stock
  {
    id: 'inv-patel-watch-jay',
    listingId: 'list-patel-watch',
    storeId: 'store-patel-jay',
    quantity: 4,
    reservedQuantity: 0,
    reorderThreshold: 2
  }
];

// Initial Store Customers for Sharma Electronics
export const initialLedgerCustomers: LedgerCustomer[] = [
  {
    id: 'cust-ramesh-ind',
    organizationId: 'org-sharma',
    name: 'Ramesh',
    phone: '+919876543210',
    disambiguationTag: 'Indiranagar',
    currentBalance: 1200.00, // Owes ₹1200 udhaar
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'cust-ramesh-jay',
    organizationId: 'org-sharma',
    name: 'Ramesh',
    phone: '+919811223344',
    disambiguationTag: 'Jayanagar',
    currentBalance: 450.00, // Owes ₹450 udhaar
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'cust-suresh',
    organizationId: 'org-sharma',
    name: 'Suresh',
    phone: '+919822334455',
    disambiguationTag: 'Kirana Regular',
    currentBalance: 0.00, // Settled
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'cust-priya',
    organizationId: 'org-sharma',
    name: 'Priya',
    phone: '+919833445566',
    disambiguationTag: 'Design Studio',
    currentBalance: 2400.00,
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const initialLedgerEntries: LedgerEntry[] = [
  {
    id: 'entry-01',
    organizationId: 'org-sharma',
    customerId: 'cust-ramesh-ind',
    customerName: 'Ramesh (Indiranagar)',
    entryType: 'CREDIT',
    amount: 1000.00,
    balanceAfter: 1000.00,
    notes: 'Bought wireless earbuds on credit',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'entry-02',
    organizationId: 'org-sharma',
    customerId: 'cust-ramesh-ind',
    customerName: 'Ramesh (Indiranagar)',
    entryType: 'CREDIT',
    amount: 200.00,
    balanceAfter: 1200.00,
    notes: 'USB cable on credit',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'entry-03',
    organizationId: 'org-sharma',
    customerId: 'cust-ramesh-jay',
    customerName: 'Ramesh (Jayanagar)',
    entryType: 'CREDIT',
    amount: 450.00,
    balanceAfter: 450.00,
    notes: 'Multi-plug extension cord',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'entry-04',
    organizationId: 'org-sharma',
    customerId: 'cust-priya',
    customerName: 'Priya (Design Studio)',
    entryType: 'CREDIT',
    amount: 2400.00,
    balanceAfter: 2400.00,
    notes: 'KeyCraft mechanical keyboard',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'EVAL-202611-0001',
    organizationId: 'org-sharma',
    storeId: 'store-sharma-ind',
    totalAmount: 1499.00,
    currency: 'INR',
    status: 'CONFIRMED',
    customerName: 'Ananya Sharma',
    customerPhone: '+919988776655',
    deliveryAddress: 'Flat 302, Palm Heights, Indiranagar, Bengaluru',
    fulfillmentType: 'LOCAL_DELIVERY',
    items: [
      {
        id: 'item-01',
        orderId: 'ord-1001',
        listingId: 'list-sharma-keyboard',
        productId: 'prod-3',
        unitPrice: 1499.00,
        quantity: 1,
        subtotal: 1499.00,
        productTitle: 'KeyCraft Wireless Ergonomic Keyboard',
        shopName: 'Sharma Electronics'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    shopName: 'Sharma Electronics',
    storeName: 'Main Store - Indiranagar'
  }
];

export const initialOutboxEvents: OutboxEvent[] = [
  {
    id: 'outbox-1',
    aggregateType: 'ORDER',
    aggregateId: 'ord-1001',
    eventType: 'order.placed',
    topic: 'evalipie.order.placed',
    payload: {
      orderId: 'ord-1001',
      orderNumber: 'EVAL-202611-0001',
      totalAmount: 1499.00,
      shop: 'Sharma Electronics'
    },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    dispatchedAt: new Date(Date.now() - 2 * 3600000 + 120).toISOString(),
    retryCount: 0
  }
];
