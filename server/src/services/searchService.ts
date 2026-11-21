import { db } from '../db/connection.js';
import { CanonicalProduct, MerchantListing, MultiSellerOffer, StockStatus } from '../../../shared/types.js';

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function tokenFuzzyMatch(queryWords: string[], targetText: string): number {
  const targetWords = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  let score = 0;

  for (const q of queryWords) {
    if (q.length < 3) continue;
    let bestWordScore = 0;

    for (const t of targetWords) {
      if (t === q) {
        bestWordScore = Math.max(bestWordScore, 1.0);
      } else if (q.length >= 3 && t.length >= 3 && (t.startsWith(q) || q.startsWith(t))) {
        bestWordScore = Math.max(bestWordScore, 0.85);
      } else {
        const dist = levenshteinDistance(q, t);
        const maxLen = Math.max(q.length, t.length);
        const similarity = 1 - dist / maxLen;
        if (q.length >= 4 && similarity >= 0.75) {
          bestWordScore = Math.max(bestWordScore, similarity * 0.8);
        }
      }
    }
    score += bestWordScore;
  }

  return score;
}

function normalizeWord(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.endsWith('shoes')) return 'shoe';
  if (w.endsWith('headphones')) return 'headphone';
  if (w.endsWith('earphones')) return 'earphone';
  if (w.endsWith('chairs')) return 'chair';
  if (w.endsWith('laptops')) return 'laptop';
  if (w.endsWith('phones')) return 'phone';
  if (w.endsWith('cleaners') || w.endsWith('cleaning')) return 'clean';
  if (w.endsWith('products') || w.endsWith('product')) return 'product';
  if (w === 't-shirt' || w === 'tshirt' || w === 'tee' || w === 'tshirts') return 'tshirt';
  if (w === "men's" || w === 'mens') return 'men';
  return w;
}

export class SearchService {
  // Typo-Tolerant Catalog Search (Simulates Aiven OpenSearch with budget & synonym awareness)
  search(params: {
    query?: string;
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Array<{ product: CanonicalProduct; minPrice: number; sellerCount: number; inStock: boolean; relevanceScore: number }> {
    const products = Array.from(db.products.values());
    let rawQuery = (params.query || '').trim();
    let maxPrice = params.maxPrice;
    let minPrice = params.minPrice;

    // 1. Budget extraction (e.g. "laptop under 60000", "headphones under 2000", "below 1500")
    const budgetMatch = rawQuery.match(/(?:under|below|less than|within|ke andar|ke niche)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\s*(?:k|thousand|hazar|lakh))?)/i);
    if (budgetMatch) {
      const budgetStr = budgetMatch[1].toLowerCase().replace(/,/g, '').trim();
      let budgetVal = 0;
      if (budgetStr.endsWith('k')) {
        budgetVal = parseFloat(budgetStr) * 1000;
      } else if (budgetStr.includes('lakh')) {
        budgetVal = parseFloat(budgetStr) * 100000;
      } else if (budgetStr.includes('thousand') || budgetStr.includes('hazar')) {
        budgetVal = parseFloat(budgetStr) * 1000;
      } else {
        budgetVal = parseFloat(budgetStr);
      }
      if (!isNaN(budgetVal) && budgetVal > 0) {
        maxPrice = maxPrice !== undefined ? Math.min(maxPrice, budgetVal) : budgetVal;
      }
      rawQuery = rawQuery.replace(budgetMatch[0], ' ').trim();
    }

    const cleanPhrase = rawQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const queryWords = cleanPhrase.split(/\s+/).filter(Boolean);
    const normalizedQueryWords = queryWords.map(normalizeWord);

    const results: Array<{
      product: CanonicalProduct;
      minPrice: number;
      sellerCount: number;
      inStock: boolean;
      relevanceScore: number;
    }> = [];

    for (const product of products) {
      // 1. Category filter
      if (params.category && params.category !== 'All' && product.category.toLowerCase() !== params.category.toLowerCase()) {
        continue;
      }

      // 2. Compute search score (Title^3 + Tags^2 + Brand^2 + Description)
      let score = 1.0;
      if (queryWords.length > 0) {
        const prodTitleNorm = product.title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
        const prodBrandNorm = product.brand.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
        const prodCategoryNorm = product.category.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
        const prodTagsNorm = (product.tags || []).join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
        const prodDescNorm = product.description.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

        // Exact phrase bonus (e.g. "iphone 16", "samsung galaxy", "running shoes")
        let phraseBonus = 0;
        if (cleanPhrase.length >= 3) {
          if (prodTitleNorm.includes(cleanPhrase)) phraseBonus += 15.0;
          if (prodBrandNorm.includes(cleanPhrase)) phraseBonus += 10.0;
          if (prodTagsNorm.includes(cleanPhrase)) phraseBonus += 8.0;
          if (prodCategoryNorm.includes(cleanPhrase)) phraseBonus += 6.0;
        }

        const titleScore = tokenFuzzyMatch(normalizedQueryWords, prodTitleNorm) * 3.0;
        const brandScore = tokenFuzzyMatch(normalizedQueryWords, prodBrandNorm) * 2.5;
        const tagsScore = tokenFuzzyMatch(normalizedQueryWords, prodTagsNorm) * 2.0;
        const catScore = tokenFuzzyMatch(normalizedQueryWords, prodCategoryNorm) * 2.0;
        const descScore = tokenFuzzyMatch(normalizedQueryWords, prodDescNorm) * 1.0;

        score = phraseBonus + titleScore + brandScore + tagsScore + catScore + descScore;

        if (score < 1.0) {
          continue; // No sufficient match
        }
      }

      // 3. Find seller listings and check stock/price filters
      const listings = Array.from(db.listings.values()).filter(l => l.productId === product.id && l.isActive);
      if (listings.length === 0) continue;

      let bestSellingPrice = Infinity;
      let totalStock = 0;
      let matchingSellers = 0;

      for (const listing of listings) {
        if (minPrice !== undefined && listing.sellingPrice < minPrice) continue;
        if (maxPrice !== undefined && listing.sellingPrice > maxPrice) continue;

        // Check stock in city
        let sellerStockInCity = 0;
        for (const store of db.stores.values()) {
          if (store.organizationId === listing.organizationId) {
            if (!params.city || store.city.toLowerCase() === params.city.toLowerCase()) {
              const inv = db.findInventory(listing.id, store.id);
              if (inv) {
                sellerStockInCity += Math.max(0, inv.quantity - inv.reservedQuantity);
              }
            }
          }
        }

        bestSellingPrice = Math.min(bestSellingPrice, listing.sellingPrice);
        totalStock += sellerStockInCity;
        matchingSellers++;
      }

      if (matchingSellers > 0 && bestSellingPrice !== Infinity) {
        results.push({
          product,
          minPrice: bestSellingPrice,
          sellerCount: matchingSellers,
          inStock: totalStock > 0,
          relevanceScore: score
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore || a.minPrice - b.minPrice);
  }

  // Multi-Seller Comparison Drawer (Signature Feature)
  getMultiSellerOffers(productId: string, city = 'Bengaluru'): { canonicalProduct?: CanonicalProduct; offers: MultiSellerOffer[] } {
    const product = db.products.get(productId);
    if (!product) return { offers: [] };

    const listings = Array.from(db.listings.values()).filter(l => l.productId === productId && l.isActive);
    const offers: MultiSellerOffer[] = [];

    for (const listing of listings) {
      const org = db.organizations.get(listing.organizationId);
      const shop = Array.from(db.shops.values()).find(s => s.organizationId === listing.organizationId);
      const stores = Array.from(db.stores.values()).filter(s => s.organizationId === listing.organizationId);

      for (const store of stores) {
        if (city && store.city.toLowerCase() !== city.toLowerCase()) continue;

        const inv = db.findInventory(listing.id, store.id);
        const availableQty = inv ? Math.max(0, inv.quantity - inv.reservedQuantity) : 0;
        
        let stockStatus: StockStatus = 'OUT_OF_STOCK';
        if (availableQty > 2) stockStatus = 'IN_STOCK';
        else if (availableQty > 0) stockStatus = 'LOW_STOCK';

        // Distance simulation based on Indiranagar / Jayanagar
        const distanceKm = store.name.includes('Indiranagar') ? 1.4 : store.name.includes('Jayanagar') ? 4.8 : 7.2;

        offers.push({
          listingId: listing.id,
          merchant: {
            organizationId: listing.organizationId,
            shopName: shop?.displayName || org?.name || 'Local Merchant',
            shopSlug: shop?.slug || 'shop',
            logoUrl: shop?.logoUrl,
            rating: shop?.ratingAvg || 4.8
          },
          store: {
            storeId: store.id,
            name: store.name,
            city: store.city,
            address: store.addressLine1,
            distanceKm
          },
          sellingPrice: listing.sellingPrice,
          originalMrp: listing.originalMrp,
          stockStatus,
          availableQuantity: availableQty
        });
      }
    }

    // Sort by price ascending, then distance
    offers.sort((a, b) => a.sellingPrice - b.sellingPrice || a.store.distanceKm - b.store.distanceKm);

    return {
      canonicalProduct: product,
      offers
    };
  }
}

export const searchService = new SearchService();
