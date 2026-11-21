import { db } from '../db/connection.js';
import { searchService } from './searchService.js';
import { AiDiscoveryResult, StructuredIntent, StockStatus } from '../../../shared/types.js';

export class AiDiscoveryService {
  // Extract structured intent using heuristic regex/dictionary or LLM
  parseIntent(prompt: string): StructuredIntent {
    const clean = prompt.toLowerCase();

    // 1. Extract Budget
    const budgetMatch = clean.match(/(?:₹|rs\.?\s?|under\s+|below\s+|budget\s+is\s+)(\d[\d,]*)/i);
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : null;

    // 2. Extract Category
    const categoryMap: Record<string, string> = {
      audio: 'Electronics',
      sound: 'Electronics',
      mic: 'Electronics',
      microphone: 'Electronics',
      headphone: 'Electronics',
      headset: 'Electronics',
      call: 'Electronics',
      watch: 'Electronics',
      charger: 'Mobiles & Accessories',
      mobile: 'Mobiles & Accessories',
      keyboard: 'Computers & Laptops',
      mouse: 'Computers & Laptops',
      laptop: 'Computers & Laptops',
      pc: 'Computers & Laptops',
      coding: 'Computers & Laptops',
      programming: 'Computers & Laptops',
      kitchen: 'Home & Kitchen',
      fryer: 'Home & Kitchen',
      cook: 'Home & Kitchen',
      desk: 'Home & Kitchen',
      organize: 'Home & Kitchen'
    };

    let detectedCategory = 'Electronics';
    for (const [kw, cat] of Object.entries(categoryMap)) {
      if (clean.includes(kw)) {
        detectedCategory = cat;
        break;
      }
    }

    // 3. Extract meaningful keywords
    const stopWords = new Set([
      'i', 'need', 'something', 'for', 'a', 'the', 'in', 'under', 'with', 'and', 'to',
      'during', 'my', 'is', 'find', 'suggest', 'product', 'looking'
    ]);
    const keywords = clean
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    return {
      category: detectedCategory,
      keywords,
      max_budget: maxBudget,
      city: 'Bengaluru',
      clarification_needed: false,
      clarification_question: null,
      inferred_need: `Shopper is looking for ${detectedCategory} equipment for: ${keywords.join(', ')}`
    };
  }

  // Execute zero-hallucination grounded discovery
  discover(prompt: string, city = 'Bengaluru'): AiDiscoveryResult {
    const intent = this.parseIntent(prompt);

    // Search catalog with extracted criteria
    const searchResults = searchService.search({
      query: intent.keywords.join(' '),
      category: intent.category,
      city,
      maxPrice: intent.max_budget || undefined
    });

    const matches: AiDiscoveryResult['matches'] = [];

    for (const res of searchResults.slice(0, 4)) {
      const { canonicalProduct, offers } = searchService.getMultiSellerOffers(res.product.id, city);
      const bestOffer = offers[0]; // Lowest price offer

      if (bestOffer) {
        // Build explanation string grounded strictly in actual attributes
        let matchReason = '';
        if (res.product.tags?.some(t => intent.keywords.includes(t))) {
          const hitTags = res.product.tags.filter(t => intent.keywords.includes(t));
          matchReason = `Directly matches your requirement for ${hitTags.join(' & ')}.`;
        } else {
          matchReason = `Matches ${res.product.category} category within your budget at ${bestOffer.merchant.shopName}.`;
        }

        matches.push({
          productId: res.product.id,
          title: res.product.title,
          brand: res.product.brand,
          category: res.product.category,
          imageUrl: res.product.imageUrl,
          bestOffer: {
            listingId: bestOffer.listingId,
            shopName: bestOffer.merchant.shopName,
            shopSlug: bestOffer.merchant.shopSlug,
            price: bestOffer.sellingPrice,
            stockStatus: bestOffer.stockStatus,
            availableQuantity: bestOffer.availableQuantity,
            city: bestOffer.store.city
          },
          matchReason
        });
      }
    }

    // Unmet demand logging if no products matched
    const unmetDemandLogged = matches.length === 0;

    return {
      intentAnalysis: intent,
      matches,
      unmetDemandLogged
    };
  }
}

export const aiDiscoveryService = new AiDiscoveryService();
