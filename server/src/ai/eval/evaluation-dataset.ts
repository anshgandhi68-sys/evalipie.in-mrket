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
    | 'location_search'
    | 'out_of_stock'
    | 'empty_result'
    | 'conflicting_requirements';
  notes: string;
}

export const EVALUATION_DATASET: EvaluationTestCase[] = [
  // 1-5: Exact Product Searches
  {
    id: 'eval-01',
    query: 'Sony WH-1000XM5 wireless headphones',
    expectedCategory: 'Electronics',
    expectedBrand: 'Sony',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Exact match for flagship ANC headphones'
  },
  {
    id: 'eval-02',
    query: 'Lenovo ThinkPad E14 Core i5',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Lenovo',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Exact match for ThinkPad laptop'
  },
  {
    id: 'eval-03',
    query: 'Samsung Galaxy S23 5G 128GB',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Samsung',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Exact smartphone match'
  },
  {
    id: 'eval-04',
    query: 'Philips Digital Air Fryer HD9252',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: 'Philips',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Kitchen appliance exact lookup'
  },
  {
    id: 'eval-05',
    query: 'Logitech MX Keys Advanced Wireless Keyboard',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Logitech',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'exact_search',
    notes: 'Productivity keyboard search'
  },

  // 6-10: Misspellings & Typo Tolerance
  {
    id: 'eval-06',
    query: 'Soni noice cancel headfone',
    expectedCategory: 'Electronics',
    expectedBrand: 'Sony',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Multiple typos in brand and product type'
  },
  {
    id: 'eval-07',
    query: 'Lenovoo thinkpad leptop for codin',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Lenovo',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Misspelled brand and category'
  },
  {
    id: 'eval-08',
    query: 'Phillps digital ayr fryer',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: 'Philips',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Kitchen appliance spelling errors'
  },
  {
    id: 'eval-09',
    query: 'Ankr 65w gan fast chagre',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Anker',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Charger brand and hardware typos'
  },
  {
    id: 'eval-10',
    query: 'Macbok air m2 lapotp',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Apple',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'misspelling',
    notes: 'Common Apple laptop typo'
  },

  // 11-18: Hindi & Hinglish Queries
  {
    id: 'eval-11',
    query: 'Mujhe programming ke liye laptop chahiye 60,000 ke andar',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 60000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Hinglish query with Indian currency limit'
  },
  {
    id: 'eval-12',
    query: 'Office calls ke liye achha noise cancelling headphone batao under 5000',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 5000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Hinglish with use-case requirement'
  },
  {
    id: 'eval-13',
    query: 'Sasta wireless gaming mouse chahiye 1500 ke niche',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 1500,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Budget gaming mouse in Hinglish'
  },
  {
    id: 'eval-14',
    query: 'Fast charging wala 65 watt charger chahiye',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Hardware wattage requirement in Hindi'
  },
  {
    id: 'eval-15',
    query: 'Ghar ke liye digital air fryer dikhao 6 hazar tak',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: 6000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: '"6 hazar" Indian currency notation'
  },
  {
    id: 'eval-16',
    query: 'YouTube podcasting ke liye studio mic chahiye 4000 me',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 4000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Microphone for creator use case'
  },
  {
    id: 'eval-17',
    query: 'Boutique denim jacket Indiranagar me available hai kya',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Fashion item in neighbourhood store'
  },
  {
    id: 'eval-18',
    query: 'OnePlus ka phone chahiye 20000 ke budget me',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'OnePlus',
    expectedMaxBudget: 20000,
    expectedLanguage: 'hinglish',
    testType: 'hinglish',
    notes: 'Smartphone brand with budget'
  },

  // 19-21: Gujarati Queries
  {
    id: 'eval-19',
    query: 'Mane programming mate saras laptop joie che 70000 ma',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 70000,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati laptop query'
  },
  {
    id: 'eval-20',
    query: 'Mane wireless headphones joie che meeting mate',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati audio query'
  },
  {
    id: 'eval-21',
    query: 'Kitchen mate digital air fryer joie che',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'gu',
    testType: 'gujarati',
    notes: 'Gujarati kitchen appliance'
  },

  // 22-28: Strict Budget Constraints & Currency Slang
  {
    id: 'eval-22',
    query: 'ANC headphones under 3000',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: 3000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Hard budget threshold'
  },
  {
    id: 'eval-23',
    query: 'Mechanical keyboard below 3k',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 3000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: '"3k" notation'
  },
  {
    id: 'eval-24',
    query: 'MacBook Air under 1 lakh',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Apple',
    expectedMaxBudget: 100000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: '"1 lakh" notation'
  },
  {
    id: 'eval-25',
    query: 'Fast charger below ₹1,500',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: null,
    expectedMaxBudget: 1500,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Formatted rupee symbol'
  },
  {
    id: 'eval-26',
    query: 'AeroPress coffee maker under 4500',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: null,
    expectedMaxBudget: 4500,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Speciality coffee maker budget'
  },
  {
    id: 'eval-27',
    query: 'Men raw selvedge jacket under 5000',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: 5000,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: 'Apparel budget constraint'
  },
  {
    id: 'eval-28',
    query: 'Gaming mouse under 1200 rs',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 1200,
    expectedLanguage: 'en',
    testType: 'budget_constraint',
    notes: '"1200 rs" suffix'
  },

  // 29-33: Brand Preference Searches
  {
    id: 'eval-29',
    query: 'Show me Sony products available in Bengaluru',
    expectedCategory: null,
    expectedBrand: 'Sony',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Brand only query'
  },
  {
    id: 'eval-30',
    query: 'Philips kitchen appliances in store',
    expectedCategory: 'Home & Kitchen',
    expectedBrand: 'Philips',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Brand with category filter'
  },
  {
    id: 'eval-31',
    query: 'Razer gaming equipment',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: 'Razer',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Gaming brand match'
  },
  {
    id: 'eval-32',
    query: 'Anker fast chargers and cables',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Anker',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Power accessory brand'
  },
  {
    id: 'eval-33',
    query: 'Rode studio audio microphones',
    expectedCategory: 'Electronics',
    expectedBrand: 'Røde',
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'brand_preference',
    notes: 'Studio audio brand'
  },

  // 34-38: Multi-Attribute Complex Searches
  {
    id: 'eval-34',
    query: 'Compact 3-port 65W GaN fast charger with Type-C',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Multiple technical specifications'
  },
  {
    id: 'eval-35',
    query: 'Lightweight laptop with 16GB RAM for software engineering',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'RAM and profession attributes'
  },
  {
    id: 'eval-36',
    query: 'Studio podcast microphone with headphone monitoring jack',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Hardware feature spec'
  },
  {
    id: 'eval-37',
    query: 'Waterproof technical shell parka indiranagar',
    expectedCategory: 'Boutique Apparel',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Apparel material attribute'
  },
  {
    id: 'eval-38',
    query: 'Noise cancelling headphones with long battery life over 30 hours',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'multi_attribute',
    notes: 'Battery life attribute'
  },

  // 39-42: Location-Based Neighbourhood Queries
  {
    id: 'eval-39',
    query: 'Find electronics stores in Indiranagar 560038',
    expectedCategory: 'Electronics',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Pincode specific search'
  },
  {
    id: 'eval-40',
    query: 'Sharma Electronics products ready for 30-min pickup',
    expectedCategory: null,
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Specific store lookup'
  },
  {
    id: 'eval-41',
    query: 'Patel Digital Jayanagar stock comparison',
    expectedCategory: null,
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Jayanagar locality match'
  },
  {
    id: 'eval-42',
    query: 'Laptops available for walk-in today in Bengaluru',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'location_search',
    notes: 'Immediate walk-in requirement'
  },

  // 43-45: Empty Results & Impossible Constraints (Zero Hallucination Tests)
  {
    id: 'eval-43',
    query: 'Brand new iPhone 15 Pro Max under 5000 rupees',
    expectedCategory: 'Mobiles & Accessories',
    expectedBrand: 'Apple',
    expectedMaxBudget: 5000,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Impossible budget - must return 0 results without hallucination'
  },
  {
    id: 'eval-44',
    query: 'Jet engine rocket fuel container',
    expectedCategory: null,
    expectedBrand: null,
    expectedMaxBudget: null,
    expectedLanguage: 'en',
    testType: 'empty_result',
    notes: 'Out-of-catalogue product - must report no results found'
  },
  {
    id: 'eval-45',
    query: 'Gaming laptop with RTX 4090 under 20000',
    expectedCategory: 'Computers & Laptops',
    expectedBrand: null,
    expectedMaxBudget: 20000,
    expectedLanguage: 'en',
    testType: 'conflicting_requirements',
    notes: 'Conflicting spec and budget - must honestly state no match'
  }
];
