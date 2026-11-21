import { aivenPg, memoryPg, ProductRow, InventoryRow } from './aivenPg.js';

export interface SeedProductInput {
  id: string;
  title: string;
  brand: string;
  category: 'AUDIO' | 'FASHION' | 'FOOTWEAR' | 'HOME & KITCHEN' | 'LAPTOPS' | 'MOBILES';
  sku: string;
  description: string;
  price: number;
  originalMrp: number;
  imageUrl: string;
  attributes: Record<string, any>;
  tags: string[];
}

export const SEED_CATEGORIES = [
  { id: 'cat-audio', name: 'AUDIO', slug: 'audio', description: 'Studio monitors, wireless headphones, and precision microphones.' },
  { id: 'cat-fashion', name: 'FASHION', slug: 'fashion', description: 'Handcrafted apparel, selvedge denim, and organic knitwear.' },
  { id: 'cat-footwear', name: 'FOOTWEAR', slug: 'footwear', description: 'Athletic running shoes, formal leathers, and daily trainers.' },
  { id: 'cat-home', name: 'HOME & KITCHEN', slug: 'home-kitchen', description: 'Ergonomic workspace seating, compact appliances, and culinary tools.' },
  { id: 'cat-laptops', name: 'LAPTOPS', slug: 'laptops', description: 'Workstation laptops, ultrabooks, and programming rigs.' },
  { id: 'cat-mobiles', name: 'MOBILES', slug: 'mobiles', description: '5G smartphones, GaN charging bricks, and mobile accessories.' }
];

export const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'] as const;

export const SEED_PRODUCTS: SeedProductInput[] = [
  // ── AUDIO (6 Products) ─────────────────────────────────────────────
  {
    id: 'prod-audio-boat-550',
    title: 'boAt Rockerz 550 Wireless Bluetooth Headphones',
    brand: 'boAt',
    category: 'AUDIO',
    sku: 'BOAT-RCK-550',
    description: 'Wireless over-ear headphones with 50mm dynamic drivers, physical noise isolation, and 20-hour playback.',
    price: 1999,
    originalMrp: 3999,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    attributes: { drivers: '50mm', battery: '20 Hours', connectivity: 'Bluetooth 5.0' },
    tags: ['bluetoth', 'headphone', 'audio', 'wireless', 'budget', 'boat']
  },
  {
    id: 'prod-audio-soundpro-tune',
    title: 'SoundPro Tune Bluetooth Wireless Headphones',
    brand: 'SoundPro',
    category: 'AUDIO',
    sku: 'SP-TUNE-BT',
    description: 'On-ear ultra-lightweight Bluetooth headset with 40mm drivers, built-in mic, and fast USB-C charge.',
    price: 2499,
    originalMrp: 3299,
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    attributes: { drivers: '40mm', battery: '30 Hours', connectivity: 'Bluetooth 5.2' },
    tags: ['bluetoth', 'headphones', 'soundpro', 'wireless', 'music']
  },
  {
    id: 'prod-audio-hyperclear-mic',
    title: 'HyperClear USB Condenser Studio Microphone',
    brand: 'HyperClear',
    category: 'AUDIO',
    sku: 'HC-USB-MIC',
    description: 'Cardioid polar condenser microphone for podcasts, streaming, voice recording, and meetings with zero latency.',
    price: 2799,
    originalMrp: 3999,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    attributes: { pattern: 'Cardioid', sampleRate: '192kHz/24bit', interface: 'USB-C' },
    tags: ['microphone', 'mic', 'podcast', 'studio', 'usb', 'audio']
  },
  {
    id: 'prod-audio-sony-xm5',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'AUDIO',
    sku: 'SONY-WH-1000XM5',
    description: 'Industry-leading noise cancellation powered by two processors and 8 microphones with Auto NC Optimizer.',
    price: 26990,
    originalMrp: 34990,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    attributes: { anc: 'Active Noise Cancelling', battery: '30 Hours', codec: 'LDAC' },
    tags: ['sony', 'anc', 'headphones', 'premium', 'noise cancelling', 'audio']
  },
  {
    id: 'prod-audio-ath-m50x',
    title: 'Audio-Technica ATH-M50x Professional Studio Monitor Headphones',
    brand: 'Audio-Technica',
    category: 'AUDIO',
    sku: 'ATH-M50X-BLK',
    description: 'Critically acclaimed sonic performance praised by top audio engineers and pro audio reviewers.',
    price: 12499,
    originalMrp: 16500,
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
    attributes: { drivers: '45mm Neodymium', design: 'Circumaural Closed-Back', cables: 'Detachable' },
    tags: ['audiotechnica', 'studio', 'monitor', 'dj', 'audio', 'headphones']
  },
  {
    id: 'prod-audio-jbl-flip6',
    title: 'JBL Flip 6 Portable Waterproof Bluetooth Speaker',
    brand: 'JBL',
    category: 'AUDIO',
    sku: 'JBL-FLIP-6',
    description: 'Eco-friendly packaging, 2-way speaker system engineered to deliver loud, crystal clear, powerful sound.',
    price: 8999,
    originalMrp: 11999,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
    attributes: { waterproofing: 'IP67 Waterproof & Dustproof', battery: '12 Hours', power: '30W RMS' },
    tags: ['speaker', 'jbl', 'bluetooth', 'waterproof', 'outdoor', 'audio']
  },

  // ── LAPTOPS (6 Products) ───────────────────────────────────────────
  {
    id: 'prod-lap-thinkpad-e14',
    title: 'Lenovo ThinkPad E14 Gen 5 AMD Ryzen 5 Laptop',
    brand: 'Lenovo',
    category: 'LAPTOPS',
    sku: 'THINKPAD-E14-G5',
    description: 'Durable business laptop featuring AMD Ryzen 5 7530U, 16GB RAM, 512GB NVMe SSD, and backlit TrackPoint keyboard.',
    price: 52990,
    originalMrp: 64990,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    attributes: { processor: 'AMD Ryzen 5 7530U', ram: '16GB DDR4', storage: '512GB NVMe SSD', display: '14-inch WUXGA' },
    tags: ['laptop', 'lenovo', 'thinkpad', 'programming', 'business', 'ryzen']
  },
  {
    id: 'prod-lap-macbook-air-m3',
    title: 'Apple MacBook Air 13-inch M3 Chip',
    brand: 'Apple',
    category: 'LAPTOPS',
    sku: 'APPLE-MBA-M3-13',
    description: 'Blazing-fast M3 chip with 8-core CPU and 10-core GPU, Liquid Retina display, and up to 18 hours battery life.',
    price: 104900,
    originalMrp: 114900,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    attributes: { chip: 'Apple M3', ram: '8GB Unified', storage: '256GB SSD', weight: '1.24 kg' },
    tags: ['apple', 'macbook', 'air', 'm3', 'laptop', 'ultrabook']
  },
  {
    id: 'prod-lap-dell-xps-13',
    title: 'Dell XPS 13 Plus Intel Core i7 Laptop',
    brand: 'Dell',
    category: 'LAPTOPS',
    sku: 'DELL-XPS-13-PLUS',
    description: 'Machined aluminum chassis, zero-lattice keyboard, seamless glass touchpad, and 13.4-inch 4K OLED display.',
    price: 134990,
    originalMrp: 154990,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
    attributes: { processor: 'Intel Core i7-1360P', ram: '16GB LPDDR5', storage: '1TB NVMe SSD' },
    tags: ['dell', 'xps', 'laptop', 'intel', 'premium', 'oled']
  },
  {
    id: 'prod-lap-asus-zephyrus-g14',
    title: 'ASUS ROG Zephyrus G14 Gaming Laptop',
    brand: 'ASUS',
    category: 'LAPTOPS',
    sku: 'ASUS-ROG-G14',
    description: 'Ultraportable gaming laptop with AMD Ryzen 9, NVIDIA GeForce RTX 4060, and ROG Nebula 165Hz display.',
    price: 119990,
    originalMrp: 139990,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    attributes: { gpu: 'RTX 4060 8GB', cpu: 'Ryzen 9 7940HS', ram: '16GB DDR5', display: '14-inch QHD+ 165Hz' },
    tags: ['asus', 'rog', 'gaming', 'laptop', 'rtx4060', 'zephyrus']
  },
  {
    id: 'prod-lap-hp-pavilion-aero',
    title: 'HP Pavilion Aero 13 Ultralight Magnesium Laptop',
    brand: 'HP',
    category: 'LAPTOPS',
    sku: 'HP-AERO-13',
    description: 'Weighing under 1kg with AMD Ryzen 7 processor, 16:10 micro-edge display, and fast charging.',
    price: 62490,
    originalMrp: 74990,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    attributes: { weight: '970 grams', processor: 'AMD Ryzen 7 7735U', ram: '16GB', storage: '512GB' },
    tags: ['hp', 'laptop', 'lightweight', 'ryzen7', 'ultrabook']
  },
  {
    id: 'prod-lap-acer-swift-go',
    title: 'Acer Swift Go 14 OLED Intel Core Ultra 5 Laptop',
    brand: 'Acer',
    category: 'LAPTOPS',
    sku: 'ACER-SWIFT-GO-14',
    description: 'AI-ready laptop with Intel Core Ultra 5 with NPU, 2.8K 90Hz OLED display, and dual fans.',
    price: 57990,
    originalMrp: 69990,
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    attributes: { display: '2.8K 90Hz OLED', cpu: 'Intel Core Ultra 5', ram: '16GB LPDDR5X' },
    tags: ['acer', 'laptop', 'oled', 'intel', 'ultra5', 'ai']
  },

  // ── MOBILES (6 Products) ───────────────────────────────────────────
  {
    id: 'prod-mob-iphone-16',
    title: 'Apple iPhone 16 128GB Teal',
    brand: 'Apple',
    category: 'MOBILES',
    sku: 'IPHONE-16-128-TEA',
    description: 'A18 chip with Camera Control, 48MP Fusion camera, Action button, and Ceramic Shield front.',
    price: 79900,
    originalMrp: 79900,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    attributes: { chip: 'A18', storage: '128GB', camera: '48MP Dual', display: '6.1-inch Super Retina XDR' },
    tags: ['apple', 'iphone', 'iphone16', 'teal', 'smartphone', 'mobile', '5g']
  },
  {
    id: 'prod-mob-samsung-s24',
    title: 'Samsung Galaxy S24 5G 128GB Onyx Black',
    brand: 'Samsung',
    category: 'MOBILES',
    sku: 'SAMSUNG-S24-128-BLK',
    description: 'Galaxy AI smartphone with Circle to Search, Live Translate, Armor Aluminum frame, and 50MP camera.',
    price: 74999,
    originalMrp: 79999,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    attributes: { chip: 'Exynos 2400', ram: '8GB', storage: '128GB', display: '6.2-inch FHD+ Dynamic AMOLED 2X' },
    tags: ['samsung', 'galaxy', 's24', '5g', 'smartphone', 'android', 'mobile']
  },
  {
    id: 'prod-mob-oneplus-12',
    title: 'OnePlus 12 5G 256GB Silky Black',
    brand: 'OnePlus',
    category: 'MOBILES',
    sku: 'ONEPLUS-12-256',
    description: 'Snapdragon 8 Gen 3 flagship with 4th Gen Hasselblad Camera, 5400 mAh battery, and 100W SUPERVOOC charging.',
    price: 64999,
    originalMrp: 69999,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    attributes: { cpu: 'Snapdragon 8 Gen 3', ram: '12GB', battery: '5400mAh', charging: '100W Wired' },
    tags: ['oneplus', 'oneplus12', 'flagship', '5g', 'smartphone', 'fastcharging']
  },
  {
    id: 'prod-mob-pixel-8a',
    title: 'Google Pixel 8a 128GB Bay Blue',
    brand: 'Google',
    category: 'MOBILES',
    sku: 'GOOGLE-PIXEL-8A-BLU',
    description: 'Google Tensor G3 chip, Pixel Camera with Best Take and Magic Audio Eraser, and 7 years of OS updates.',
    price: 49999,
    originalMrp: 52999,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    attributes: { chip: 'Google Tensor G3', camera: '64MP Dual', ram: '8GB', display: '6.1-inch Actua 120Hz' },
    tags: ['google', 'pixel', 'pixel8a', 'camera', 'android', '5g']
  },
  {
    id: 'prod-mob-powervolt-gan',
    title: 'PowerVolt 65W GaN Fast Charger 3-Port',
    brand: 'PowerVolt',
    category: 'MOBILES',
    sku: 'PV-GAN-65W',
    description: 'Gallium Nitride high-efficiency compact adapter with 2 USB-C ports and 1 USB-A port for laptops and phones.',
    price: 1499,
    originalMrp: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    attributes: { power: '65W Max', technology: 'GaN III', ports: '2x USB-C + 1x USB-A' },
    tags: ['charger', 'gan', 'fastcharger', 'powervolt', 'usbc', 'mobile']
  },
  {
    id: 'prod-mob-anker-nano',
    title: 'Anker Nano 30W USB-C Compact Wall Charger',
    brand: 'Anker',
    category: 'MOBILES',
    sku: 'ANKER-NANO-30W',
    description: 'Pocket-sized 30W high-speed charger for iPhone, iPad, MacBook Air, and Samsung Galaxy devices.',
    price: 1299,
    originalMrp: 1899,
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
    attributes: { power: '30W', ports: '1x USB-C', size: 'Ultra Compact' },
    tags: ['anker', 'charger', 'iphone', 'usbc', 'nano', 'adapter']
  },

  // ── HOME & KITCHEN (6 Products) ────────────────────────────────────
  {
    id: 'prod-home-chefmax-fryer',
    title: 'ChefMax Compact Digital Air Fryer 4.2L',
    brand: 'ChefMax',
    category: 'HOME & KITCHEN',
    sku: 'CHEF-AF-42',
    description: 'Rapid 360-degree hot air circulation, 8 one-touch preset programs, non-stick dishwasher-safe basket.',
    price: 3999,
    originalMrp: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80',
    attributes: { capacity: '4.2 Liters', power: '1400W', presets: '8' },
    tags: ['airfryer', 'kitchen', 'appliance', 'cooking', 'chefmax', 'healthy']
  },
  {
    id: 'prod-home-ergoflex-chair',
    title: 'ErgoFlex High-Back Mesh Ergonomic Office Chair',
    brand: 'ErgoFlex',
    category: 'HOME & KITCHEN',
    sku: 'ERGO-CHAIR-MESH',
    description: '3D adjustable lumbar support, breathable Korean mesh, 135-degree recline lock, and Class 4 gas lift.',
    price: 8499,
    originalMrp: 12999,
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&auto=format&fit=crop&q=80',
    attributes: { mechanism: 'Multi-lock Synchro-Tilt', gasLift: 'Class 4 BIFMA Certified', material: 'Breathable Mesh' },
    tags: ['chair', 'office', 'ergonomic', 'furniture', 'ergoflex', 'workfromhome']
  },
  {
    id: 'prod-home-desk-caddy',
    title: 'Moderne Steel Mesh Desk Organiser Set',
    brand: 'Moderne',
    category: 'HOME & KITCHEN',
    sku: 'MOD-DESK-SET',
    description: 'Powder-coated steel mesh 6-compartment desk caddy with sliding drawer for stationery and electronics.',
    price: 799,
    originalMrp: 1199,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    attributes: { material: 'Powder Coated Steel', compartments: '6 + 1 Drawer' },
    tags: ['desk', 'organizer', 'office', 'stationery', 'storage']
  },
  {
    id: 'prod-home-philips-grinder',
    title: 'Philips Daily Collection 750W Mixer Grinder',
    brand: 'Philips',
    category: 'HOME & KITCHEN',
    sku: 'PHIL-MG-750W',
    description: 'Powerful 750W motor with advanced air ventilation, 3 rust-resistant stainless steel jars, and leak-proof lids.',
    price: 3299,
    originalMrp: 4495,
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    attributes: { wattage: '750W', jars: '3 Stainless Steel', speed: '3 Speed + Pulse' },
    tags: ['mixer', 'grinder', 'philips', 'kitchen', 'appliance', 'cooking']
  },
  {
    id: 'prod-home-prestige-iris',
    title: 'Prestige Iris 750 Watt Mixer Grinder',
    brand: 'Prestige',
    category: 'HOME & KITCHEN',
    sku: 'PRESTIGE-IRIS-750',
    description: 'All-round kitchen powerhouse with 3 multipurpose stainless steel jars and 1 transparent juicer jar with blade.',
    price: 2899,
    originalMrp: 4195,
    imageUrl: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80',
    attributes: { motor: '750 Watts', jars: '4 Jars (3 SS + 1 Juicer)' },
    tags: ['prestige', 'mixer', 'grinder', 'kitchen', 'appliances']
  },
  {
    id: 'prod-home-wonderchef-coffee',
    title: 'Wonderchef Regalia Capsule Espresso Coffee Machine',
    brand: 'Wonderchef',
    category: 'HOME & KITCHEN',
    sku: 'WC-REG-ESPRESSO',
    description: '15-bar Italian pressure pump delivering rich crema espresso and lungo with dual volumetric buttons.',
    price: 7499,
    originalMrp: 10000,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    attributes: { pressure: '15 Bar', tank: '0.8L Detachable', type: 'Capsule Espresso' },
    tags: ['coffee', 'espresso', 'wonderchef', 'kitchen', 'cafe']
  },

  // ── FASHION (6 Products) ───────────────────────────────────────────
  {
    id: 'prod-fash-black-tee',
    title: 'UrbanKnit 100% Organic Heavyweight Crewneck Black T-Shirt',
    brand: 'UrbanKnit',
    category: 'FASHION',
    sku: 'UK-TEE-BLK-M',
    description: '240 GSM pre-shrunk combed organic cotton with reinforced double-stitched collar and dropped shoulders.',
    price: 899,
    originalMrp: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    attributes: { material: '100% Organic Cotton', weight: '240 GSM', fit: 'Relaxed Boxy' },
    tags: ['tshirt', 'cotton', 'black', 'clothing', 'fashion', 'apparel']
  },
  {
    id: 'prod-fash-selvedge-denim',
    title: 'Raw Selvedge Denim Trucker Jacket',
    brand: 'Loom & Shuttle',
    category: 'FASHION',
    sku: 'LS-DENIM-JCK',
    description: '14.5oz Japanese shuttle-loom selvedge denim with antique copper hardware and custom felled seams.',
    price: 3900,
    originalMrp: 4900,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    attributes: { denim: '14.5oz Raw Selvedge', origin: 'Kojima, Japan Weave' },
    tags: ['denim', 'jacket', 'selvedge', 'fashion', 'apparel', 'outerwear']
  },
  {
    id: 'prod-fash-merino-knit',
    title: 'Merino Wool Heavyweight Mockneck Knit Sweater',
    brand: 'Nordic Weave',
    category: 'FASHION',
    sku: 'NW-MERINO-KNIT',
    description: '100% extrafine Australian merino wool with 7-gauge fisherman ribbing for thermal comfort.',
    price: 2600,
    originalMrp: 3400,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    attributes: { wool: '100% Extrafine Merino', gauge: '7GG' },
    tags: ['sweater', 'merino', 'wool', 'knitwear', 'fashion', 'winter']
  },
  {
    id: 'prod-fash-parka',
    title: 'Tactile Shell Minimalist Technical Parka',
    brand: 'Boutique Atelier',
    category: 'FASHION',
    sku: 'BA-PARKA-SHELL',
    description: 'Waterproof seam-sealed technical parka with storm hood and articulated sleeve darts.',
    price: 4800,
    originalMrp: 6200,
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80',
    attributes: { fabric: '3-Layer Ripstop Nylon', waterColumn: '20,000mm' },
    tags: ['parka', 'jacket', 'outerwear', 'fashion', 'waterproof']
  },
  {
    id: 'prod-fash-raymond-shirt',
    title: 'Raymond Premium Cotton Tailored Fit Formal Shirt',
    brand: 'Raymond',
    category: 'FASHION',
    sku: 'RAY-SHIRT-WHT',
    description: '100% Egyptian Giza cotton formal shirt with semi-spread collar and mother-of-pearl finish buttons.',
    price: 1899,
    originalMrp: 2699,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    attributes: { fabric: '100% Giza Cotton', fit: 'Tailored Slim' },
    tags: ['shirt', 'formal', 'raymond', 'cotton', 'white', 'apparel']
  },
  {
    id: 'prod-fash-fabindia-kurta',
    title: 'FabIndia Handcrafted Indigo Cotton Kurta',
    brand: 'FabIndia',
    category: 'FASHION',
    sku: 'FAB-KURTA-IND',
    description: 'Traditional artisanal hand-block printed indigo long kurta featuring Mandarin collar and side pockets.',
    price: 1690,
    originalMrp: 2190,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    attributes: { weave: 'Handloom Cotton', craft: 'Dabu Indigo Print' },
    tags: ['kurta', 'ethnic', 'fabindia', 'cotton', 'indigo', 'fashion']
  },

  // ── FOOTWEAR (6 Products) ──────────────────────────────────────────
  {
    id: 'prod-foot-nike-pegasus',
    title: 'Nike Air Zoom Pegasus 40 Road Running Shoes',
    brand: 'Nike',
    category: 'FOOTWEAR',
    sku: 'NIKE-PEGASUS-40',
    description: 'Dual Zoom Air units and React foam midsole delivering high-energy return and responsive road performance.',
    price: 8495,
    originalMrp: 10495,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    attributes: { cushion: 'Zoom Air + React Foam', drop: '10mm', weight: '285g' },
    tags: ['nike', 'shoes', 'running', 'pegasus', 'footwear', 'sneakers']
  },
  {
    id: 'prod-foot-woodland-leather',
    title: 'Woodland Handcrafted Leather Casual Men Shoes',
    brand: 'Woodland',
    category: 'FOOTWEAR',
    sku: 'WOOD-CAS-LTHR',
    description: 'Heavy-duty oiled nubuck leather with rugged grooved rubber lug sole for daily urban and trail endurance.',
    price: 3495,
    originalMrp: 4495,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    attributes: { upper: 'Full Grain Oiled Leather', sole: 'Vibram-Grade Rubber' },
    tags: ['woodland', 'shoes', 'leather', 'boots', 'footwear', 'casual']
  },
  {
    id: 'prod-foot-puma-velocity',
    title: 'Puma Velocity Nitro 2 Lightweight Running Shoes',
    brand: 'Puma',
    category: 'FOOTWEAR',
    sku: 'PUMA-VELO-N2',
    description: 'Nitro-infused foam for lightweight cushioning with PumaGrip high-traction rubber outsole.',
    price: 5999,
    originalMrp: 7999,
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
    attributes: { midsole: 'Nitro Foam', drop: '8mm', weight: '257g' },
    tags: ['puma', 'shoes', 'nitro', 'running', 'footwear']
  },
  {
    id: 'prod-foot-asics-kayano',
    title: 'Asics Gel-Kayano 30 Stability Road Running Shoes',
    brand: 'Asics',
    category: 'FOOTWEAR',
    sku: 'ASICS-KAYANO-30',
    description: '4D Guidance System providing adaptive stability and PureGEL technology for softer landings.',
    price: 11999,
    originalMrp: 14999,
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    attributes: { support: '4D Guidance Stability', cushion: 'PureGEL + FF Blast Plus Eco' },
    tags: ['asics', 'kayano', 'running', 'shoes', 'marathon', 'footwear']
  },
  {
    id: 'prod-foot-clarks-tilden',
    title: 'Clarks Tilden Walk Leather Formal Oxford Shoes',
    brand: 'Clarks',
    category: 'FOOTWEAR',
    sku: 'CLARKS-TILDEN-BLK',
    description: 'Polished genuine leather with Ortholite footbed and discreet elastic stretch gore panels for comfort.',
    price: 4999,
    originalMrp: 6999,
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
    attributes: { upper: 'Full-Grain Black Leather', footbed: 'Ortholite Cushion Soft' },
    tags: ['clarks', 'shoes', 'formal', 'oxford', 'leather', 'footwear']
  },
  {
    id: 'prod-foot-adidas-stan-smith',
    title: 'Adidas Originals Stan Smith Classic Leather Sneakers',
    brand: 'Adidas',
    category: 'FOOTWEAR',
    sku: 'ADIDAS-STAN-SMITH',
    description: 'Timeless court silhouette with perforated 3-Stripes, clean white leather upper, and OrthoLite sockliner.',
    price: 6999,
    originalMrp: 8999,
    imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80',
    attributes: { upper: 'Synthetic Leather (Primegreen)', sole: 'Rubber Cupsole' },
    tags: ['adidas', 'stansmith', 'sneakers', 'white', 'classics', 'footwear']
  }
];

export async function runAivenSeed() {
  console.log('\n========================================================');
  console.log('🌱 EVALIPIE INFRASTRUCTURE SEEDING');
  console.log(`📊 Products: ${SEED_PRODUCTS.length} across 6 Major Categories`);
  console.log(`🏙️  Cities: ${CITIES.join(', ')}`);
  console.log(`⚡ Mode: ${aivenPg.mode.toUpperCase()}`);
  console.log('========================================================\n');

  // 1. Seed Categories
  for (const cat of SEED_CATEGORIES) {
    if (aivenPg.isConnected) {
      await aivenPg.query(
        `INSERT INTO categories (id, name, slug, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
        [cat.id, cat.name, cat.slug, cat.description]
      );
    }
    memoryPg.categories.set(cat.id, { ...cat, created_at: new Date() });
  }

  // Store names per city
  const cityStores: Record<string, { name: string; address: string; dist: number }> = {
    'Bengaluru': { name: 'Sharma Electronics & Kirana Hub', address: '42, 100ft Road, HAL 2nd Stage, Indiranagar', dist: 0.8 },
    'Mumbai': { name: 'Bandra Retail Central', address: 'Linking Road, Bandra West, Mumbai 400050', dist: 1.4 },
    'Delhi': { name: 'Connaught Place Storefront', address: 'Block M, Inner Circle, Connaught Place, New Delhi', dist: 1.2 },
    'Hyderabad': { name: 'Hitec City Hub', address: 'Madhapur Main Road, Hyderabad 500081', dist: 2.1 },
    'Chennai': { name: 'T Nagar Commercial Depot', address: 'Usman Road, T Nagar, Chennai 600017', dist: 1.6 },
    'Pune': { name: 'Koregaon Park Store', address: 'North Main Road, Koregaon Park, Pune 411001', dist: 1.8 }
  };

  // 2. Seed Products and Inventory
  for (const p of SEED_PRODUCTS) {
    const prodRow: ProductRow = {
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      sku: p.sku,
      description: p.description,
      price: p.price,
      original_mrp: p.originalMrp,
      image_url: p.imageUrl,
      attributes: p.attributes,
      tags: p.tags,
      created_at: new Date()
    };

    if (aivenPg.isConnected) {
      await aivenPg.query(
        `INSERT INTO products (id, title, brand, category, sku, description, price, original_mrp, image_url, attributes, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (sku) DO UPDATE SET 
           price = EXCLUDED.price, 
           image_url = EXCLUDED.image_url,
           description = EXCLUDED.description`,
        [
          p.id,
          p.title,
          p.brand,
          p.category,
          p.sku,
          p.description,
          p.price,
          p.originalMrp,
          p.imageUrl,
          JSON.stringify(p.attributes),
          p.tags
        ]
      );
    }
    memoryPg.products.set(p.id, prodRow);

    // 3. Seed Inventory across 6 Indian cities
    for (const city of CITIES) {
      const invId = `inv-${p.id}-${city.toLowerCase()}`;
      const store = cityStores[city];

      // SPECIAL CONCURRENCY TARGETS:
      // boAt Rockerz 550 and iPhone 16 have EXACTLY stock = 1 in Bengaluru!
      let availableStock = 8;
      if (p.id === 'prod-audio-boat-550' && city === 'Bengaluru') {
        availableStock = 1; // Strict concurrency lock test target 1
      } else if (p.id === 'prod-mob-iphone-16' && city === 'Bengaluru') {
        availableStock = 1; // Strict concurrency lock test target 2
      } else if (city === 'Bengaluru') {
        availableStock = 5 + (p.title.length % 7);
      } else {
        availableStock = 3 + (p.title.length % 5);
      }

      const invRow: InventoryRow = {
        id: invId,
        product_id: p.id,
        city,
        available_stock: availableStock,
        reserved_stock: 0,
        reorder_threshold: 3,
        store_name: store.name,
        store_address: store.address,
        distance_km: store.dist,
        updated_at: new Date()
      };

      if (aivenPg.isConnected) {
        await aivenPg.query(
          `INSERT INTO inventory (id, product_id, city, available_stock, reserved_stock, reorder_threshold, store_name, store_address, distance_km)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (product_id, city) DO UPDATE SET
             available_stock = EXCLUDED.available_stock,
             store_name = EXCLUDED.store_name,
             store_address = EXCLUDED.store_address,
             distance_km = EXCLUDED.distance_km`,
          [
            invId,
            p.id,
            city,
            invRow.available_stock,
            0,
            3,
            invRow.store_name,
            invRow.store_address,
            invRow.distance_km
          ]
        );
      }
      memoryPg.inventory.set(invId, invRow);
    }
  }

  console.log(`✅ Successfully seeded ${SEED_PRODUCTS.length} products & ${SEED_PRODUCTS.length * CITIES.length} inventory records!`);
  console.log(`🎯 Concurrency target 1: boAt Rockerz 550 (Bengaluru stock = 1)`);
  console.log(`🎯 Concurrency target 2: Apple iPhone 16 (Bengaluru stock = 1)`);
  console.log('========================================================\n');
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.endsWith('aivenSeed.ts') || process.argv[1]?.endsWith('aivenSeed.js')) {
  runAivenSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}
