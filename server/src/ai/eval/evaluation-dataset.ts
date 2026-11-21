export interface EvaluationTestCase {
  id: string;
  query: string;
  expectedCategory: string | null;
  expectedBrand?: string | null;
  expectedMaxBudget?: number | null;
  expectedLanguage: 'en' | 'hi' | 'hinglish' | 'gu' | 'other';
  testType:
    | 'exact_search'
    | 'misspelling'
    | 'hindi'
    | 'hinglish'
    | 'gujarati'
    | 'budget_constraint'
    | 'brand_preference'
    | 'multi_attribute'
    | 'comparison'
    | 'alternative'
    | 'location_search'
    | 'out_of_stock'
    | 'empty_result'
    | 'conflicting_requirements';
  notes: string;
}

export const EVALUATION_DATASET: EvaluationTestCase[] = [
  // ── 1-10: Exact Product Searches ──────────────────────────────────
  {
    id: 'eval-01',
    query: 'Apple iPhone 16 128GB Teal',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Apple',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Exact match for flagship smartphone'
  },
  {
    id: 'eval-02',
    query: 'Lenovo ThinkPad E14 Gen 5 Ryzen 5',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Lenovo',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Exact match for ThinkPad laptop'
  },
  {
    id: 'eval-03',
    query: 'Samsung Galaxy S24 5G 128GB Onyx Black',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Samsung',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Exact smartphone match'
  },
  {
    id: 'eval-04',
    query: 'ChefMax Compact Digital Air Fryer 4.2L',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: 'ChefMax',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Kitchen appliance exact lookup'
  },
  {
    id: 'eval-05',
    query: 'Keychron K2 Wireless Mechanical Keyboard',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Keychron',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Productivity keyboard search'
  },
  {
    id: 'eval-06',
    query: 'Nike Air Zoom Pegasus 40 Road Running Shoes',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: 'Nike',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Exact sports shoe match'
  },
  {
    id: 'eval-07',
    query: 'ErgoFlex High-Back Mesh Ergonomic Office Chair',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: 'ErgoFlex',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Office ergonomics lookup'
  },
  {
    id: 'eval-08',
    query: 'Daawat Rozana Gold Basmati Rice 5kg',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Daawat',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Essential grocery grain match'
  },
  {
    id: 'eval-09',
    query: 'Fortune Sunlite Refined Sunflower Oil 1L Pouch',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Fortune',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Cooking oil exact match'
  },
  {
    id: 'eval-10',
    query: 'Aashirvaad Select 100% Sharbati Whole Wheat Atta 5kg',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Aashirvaad',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Daily staple flour match'
  },

  // ── 11-20: Misspellings & Typo Tolerance ──────────────────────────
  {
    id: 'eval-11',
    query: 'blutooth headfone under 2000',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 2000,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Phonetic typos in bluetooth and headphone'
  },
  {
    id: 'eval-12',
    query: 'Lenovoo thinkpad leptop for codin',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Lenovo',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Misspelled brand and category'
  },
  {
    id: 'eval-13',
    query: 'samung galxy s24 mobail',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Samsung',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Severe typo in brand and product'
  },
  {
    id: 'eval-14',
    query: 'ipone 16 moblie 128gb',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Apple',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Misspelled iPhone'
  },
  {
    id: 'eval-15',
    query: 'runing shoos for joging',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Double letter omissions'
  },
  {
    id: 'eval-16',
    query: 'ergo cher for desk work',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Abbreviated and misspelled chair'
  },
  {
    id: 'eval-17',
    query: 'dawat basmati rys 5 kg',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Daawat',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Grocery brand and item typo'
  },
  {
    id: 'eval-18',
    query: 'forchun sunflowr oyl pouch',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Fortune',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Phonetic cooking oil typo'
  },
  {
    id: 'eval-19',
    query: 'wirless keybord for progranming',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Peripherals typo'
  },
  {
    id: 'eval-20',
    query: 'ashirvad sharbati aata 5kg',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Aashirvaad',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Hindi phonetic transliteration typo'
  },

  // ── 21-30: Hindi & Hinglish Queries ──────────────────────────────
  {
    id: 'eval-21',
    query: 'Mujhe programming ke liye laptop chahiye 60,000 ke andar',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 60000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Classic Hinglish coding laptop with budget'
  },
  {
    id: 'eval-22',
    query: '2000 me achha wireless headphone batao',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 2000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Hinglish budget audio query'
  },
  {
    id: 'eval-23',
    query: 'Ek sasta digital air fryer dikhaye',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Affordable kitchen appliance query'
  },
  {
    id: 'eval-24',
    query: 'Ghar ke liye basmati chawal aur sunflower tel chahiye',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Combined grocery item query'
  },
  {
    id: 'eval-25',
    query: 'Running shoes 3000 ke niche dikhao',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: 3000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Budget fitness footwear'
  },
  {
    id: 'eval-26',
    query: 'Office chair chahiye jisme back pain na ho',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Problem-solution intent'
  },
  {
    id: 'eval-27',
    query: 'Gaming mouse aur keyboard combo 2500 me',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 2500,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Peripherals combo budget query'
  },
  {
    id: 'eval-28',
    query: 'Samsung ka 5g mobile phone chahiye',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Samsung',
    expectedMaxBudget: null,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Brand preference in Hindi'
  },
  {
    id: 'eval-29',
    query: 'Ghar safai ke liye multipurpose cleaner batao',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Home cleaning utility query'
  },
  {
    id: 'eval-30',
    query: 'Pure cotton black t-shirt 1000 ke andar',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: 1000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Apparel fabric and color intent'
  },

  // ── 31-40: Gujarati Queries ──────────────────────────────────────
  {
    id: 'eval-31',
    query: 'Mane saras wireless headphones joie che 2000 ma',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 2000,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati wireless audio query'
  },
  {
    id: 'eval-32',
    query: 'Programming mate laptop 60000 ni andar',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 60000,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati laptop requirement'
  },
  {
    id: 'eval-33',
    query: 'Ghar mate air fryer saaru batao',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati kitchen appliance'
  },
  {
    id: 'eval-34',
    query: 'Basmati chokha ane tel joie che',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati grocery staples'
  },
  {
    id: 'eval-35',
    query: 'Daudva mate running shoes 3000 ma',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: 3000,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati fitness footwear'
  },
  {
    id: 'eval-36',
    query: 'Office mate chair saari mane joie',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati ergonomic furniture'
  },
  {
    id: 'eval-37',
    query: 'Samsung mobile phone 5g ma',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Samsung',
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati phone inquiry'
  },
  {
    id: 'eval-38',
    query: 'Ghar safai mate liquid cleaner',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati household cleaner'
  },
  {
    id: 'eval-39',
    query: 'Black t-shirt pure cotton ma',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati apparel search'
  },
  {
    id: 'eval-40',
    query: 'Wireless mouse ane keyboard combo',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati peripherals'
  },

  // ── 41-55: Strict Budget Constraints ──────────────────────────────
  {
    id: 'eval-41',
    query: 'Laptop under 60000',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 60000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Core mandated query'
  },
  {
    id: 'eval-42',
    query: 'Headphones under 2000',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 2000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Core mandated query'
  },
  {
    id: 'eval-43',
    query: 'Office chair under 10000',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: 10000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Furniture budget test'
  },
  {
    id: 'eval-44',
    query: 'Wireless mouse under 1500',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 1500,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Accessory budget test'
  },
  {
    id: 'eval-45',
    query: 'Running shoes under 9000',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: 9000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Nike Pegasus price band'
  },
  {
    id: 'eval-46',
    query: 'Black T-shirt under 1000',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: 1000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Apparel budget test'
  },
  {
    id: 'eval-47',
    query: 'Men shoes under 3500',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: 3500,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Footwear budget test'
  },
  {
    id: 'eval-48',
    query: 'Home cleaning products under 500',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: 500,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Cleaning budget test'
  },
  {
    id: 'eval-49',
    query: 'Basmati rice 5kg below 500',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: 500,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Grocery grain price band'
  },
  {
    id: 'eval-50',
    query: 'Cooking oil under 200',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: 200,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: '1L cooking oil budget'
  },
  {
    id: 'eval-51',
    query: 'Air fryer below 5000',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: 5000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Appliance price constraint'
  },
  {
    id: 'eval-52',
    query: 'Condenser microphone under 3000',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 3000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Audio recording budget'
  },
  {
    id: 'eval-53',
    query: 'Mechanical keyboard under 2000',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 2000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Keyboard budget ceiling'
  },
  {
    id: 'eval-54',
    query: 'Tea powder 500g under 350',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: 350,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Beverage price ceiling'
  },
  {
    id: 'eval-55',
    query: 'Desk organizer caddy under 1000',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: 1000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Desk storage budget'
  },

  // ── 56-65: Brand Preferences ──────────────────────────────────────
  {
    id: 'eval-56',
    query: 'Apple mobile devices in stock',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Apple',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Brand filtering for Apple'
  },
  {
    id: 'eval-57',
    query: 'Samsung smartphones 5G',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Samsung',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Brand filtering for Samsung'
  },
  {
    id: 'eval-58',
    query: 'Lenovo laptops for programming',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Lenovo',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Lenovo brand preference'
  },
  {
    id: 'eval-59',
    query: 'Nike shoes for road running',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: 'Nike',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Nike athletic brand'
  },
  {
    id: 'eval-60',
    query: 'boAt wireless bluetooth audio',
    expectedCategory: 'Electronics',
    expectedBrand: 'boAt',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'boAt consumer audio'
  },
  {
    id: 'eval-61',
    query: 'Woodland leather casual footwear',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: 'Woodland',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Woodland rugged footwear'
  },
  {
    id: 'eval-62',
    query: 'Logitech wireless gaming mouse',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Logitech',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Logitech peripherals'
  },
  {
    id: 'eval-63',
    query: 'Daawat basmati rice packages',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Daawat',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Daawat grain brand'
  },
  {
    id: 'eval-64',
    query: 'Fortune sunflower cooking oil',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Fortune',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Fortune oil brand'
  },
  {
    id: 'eval-65',
    query: 'Aashirvaad wheat flour atta',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: 'Aashirvaad',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Aashirvaad staple brand'
  },

  // ── 66-75: Multi-Attribute & Technical Specifications ─────────────
  {
    id: 'eval-66',
    query: 'Smartphone with 128GB storage and 5G connectivity',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Phone specification filter'
  },
  {
    id: 'eval-67',
    query: 'Laptop with AMD Ryzen 5 and 16GB RAM',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'PC specs attribute filter'
  },
  {
    id: 'eval-68',
    query: 'Wireless on-ear headphones with 40mm dynamic drivers',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Audio driver attribute'
  },
  {
    id: 'eval-69',
    query: 'Ergonomic mesh chair with 3D lumbar support',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Chair ergonomic feature'
  },
  {
    id: 'eval-70',
    query: 'Organic cotton heavyweight black crewneck t-shirt',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Textile weight and color'
  },
  {
    id: 'eval-71',
    query: 'Digital air fryer with 8 one-touch presets and 4.2L capacity',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Appliance capacity and preset spec'
  },
  {
    id: 'eval-72',
    query: 'Cardioid condenser microphone with USB interface for podcasting',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Microphone polar pattern'
  },
  {
    id: 'eval-73',
    query: 'Mechanical keyboard with Gateron brown switches and RGB',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Switch type attribute'
  },
  {
    id: 'eval-74',
    query: 'Dual Zoom Air road running shoes for marathon training',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Shoe cushion technology'
  },
  {
    id: 'eval-75',
    query: 'All-surface antibacterial disinfectant spray refill 1L',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Cleaning volume and formula'
  },

  // ── 76-85: Comparison & Alternatives Discovery ────────────────────
  {
    id: 'eval-76',
    query: 'Compare iPhone 16 and Samsung Galaxy S24',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'comparison',
    notes: 'Flagship smartphone comparison'
  },
  {
    id: 'eval-77',
    query: 'Compare boAt Rockerz and SoundPro Bluetooth headphones',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'comparison',
    notes: 'Headphone comparison'
  },
  {
    id: 'eval-78',
    query: 'Compare Nike Pegasus and Woodland casual shoes',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'comparison',
    notes: 'Footwear comparison'
  },
  {
    id: 'eval-79',
    query: 'Find cheaper alternatives for digital air fryer',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'alternative',
    notes: 'Appliance alternative discovery'
  },
  {
    id: 'eval-80',
    query: 'Alternative to ThinkPad laptop under 60000',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 60000,
    expectedLanguage: 'en',
    testType: 'alternative',
    notes: 'Budget laptop alternatives'
  },
  {
    id: 'eval-81',
    query: 'Similar running shoes to Nike Pegasus in stock',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'alternative',
    notes: 'Athletic footwear alternatives'
  },
  {
    id: 'eval-82',
    query: 'Compare Basmati rice and Sharbati wheat flour',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'comparison',
    notes: 'Grocery staple comparison'
  },
  {
    id: 'eval-83',
    query: 'Alternatives to boAt bluetooth headphones under 2000',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 2000,
    expectedLanguage: 'en',
    testType: 'alternative',
    notes: 'Audio alternatives under budget'
  },
  {
    id: 'eval-84',
    query: 'Compare USB condenser mic and wireless headphones',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'comparison',
    notes: 'Audio peripheral comparison'
  },
  {
    id: 'eval-85',
    query: 'Alternative ergonomic chair for back pain under 9000',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: 9000,
    expectedLanguage: 'en',
    testType: 'alternative',
    notes: 'Furniture alternative'
  },

  // ── 86-92: Location & Local Neighbourhood Store Queries ───────────
  {
    id: 'eval-86',
    query: 'Indiranagar electronics store verified items in stock',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Locality based merchant stock'
  },
  {
    id: 'eval-87',
    query: 'Sharma General Kirana staples available for 30 min delivery',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Specific verified shop inventory'
  },
  {
    id: 'eval-88',
    query: 'Patel Digital Store Jayanagar peripherals in stock',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Jayanagar neighbourhood stock'
  },
  {
    id: 'eval-89',
    query: 'City Supermarket Indiranagar rice and oil prices',
    expectedCategory: 'Kirana & Groceries',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Supermarket chain branch'
  },
  {
    id: 'eval-90',
    query: 'Modern Living Store Koramangala furniture stock',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Koramangala merchant lookup'
  },
  {
    id: 'eval-91',
    query: 'Indiranagar Boutique Collective black t-shirt',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Boutique local storefront'
  },
  {
    id: 'eval-92',
    query: 'Items available for immediate pickup in Bengaluru 560038',
    expectedCategory: null,
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Pincode radius check'
  },

  // ── 93-100: Impossible Constraints & Anti-Hallucination Tests ─────
  {
    id: 'eval-93',
    query: 'Brand new Apple iPhone 16 under 5000 rupees',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Apple',
    expectedMaxBudget: 5000,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Impossible budget - must return 0 results without hallucination'
  },
  {
    id: 'eval-94',
    query: 'Jet engine rocket fuel container',
    expectedCategory: null,
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Out-of-catalogue product - must report no results found'
  },
  {
    id: 'eval-95',
    query: 'Gaming laptop with RTX 4090 under 20000',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 20000,
    expectedLanguage: 'en',
    testType: 'conflicting_requirements',
    notes: 'Conflicting spec and budget - must honestly state no match'
  },
  {
    id: 'eval-96',
    query: 'Nuclear submarine titanium battery',
    expectedCategory: null,
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Absurd query - must report no stock in Bengaluru stores'
  },
  {
    id: 'eval-97',
    query: 'Samsung Galaxy S24 under 10000 rupees',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Samsung',
    expectedMaxBudget: 10000,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Absurd flagship phone budget'
  },
  {
    id: 'eval-98',
    query: 'Nike Pegasus road running shoes under 500 rupees',
    expectedCategory: 'Sports & Fitness',
    expectedBrand: 'Nike',
    expectedMaxBudget: 500,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Unrealistic premium shoe budget'
  },
  {
    id: 'eval-99',
    query: 'Ergonomic high-back office chair under 500 rupees',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: 500,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Unrealistic ergonomic chair budget'
  },
  {
    id: 'eval-100',
    query: 'Intergalactic quantum teleportation device with free shipping',
    expectedCategory: null,
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Science fiction query - strict zero hallucination test'
  }
];
