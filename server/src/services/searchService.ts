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
      } else if (t.startsWith(q) || q.startsWith(t)) {
        bestWordScore = Math.max(bestWordScore, 0.85);
      } else {
        const dist = levenshteinDistance(q, t);
        const maxLen = Math.max(q.length, t.length);
        const similarity = 1 - dist / maxLen;
        if (similarity >= 0.7) {
          bestWordScore = Math.max(bestWordScore, similarity * 0.8);
        }
      }
    }
    score += bestWordScore;
  }

  return score;
}

export class SearchService {
  // Typo-Tolerant Catalog Search (Simulates Aiven OpenSearch)
  search(params: {
    query?: string;
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Array<{ product: CanonicalProduct; minPrice: number; sellerCount: number; inStock: boolean; relevanceScore: number }> {
    const products = Array.from(db.products.values());
    const queryWords = (params.query || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

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
        const titleScore = tokenFuzzyMatch(queryWords, product.title) * 3.0;
        const brandScore = tokenFuzzyMatch(queryWords, product.brand) * 2.0;
        const tagsScore = tokenFuzzyMatch(queryWords, (product.tags || []).join(' ')) * 2.0;
        const descScore = tokenFuzzyMatch(queryWords, product.description) * 1.0;
        score = titleScore + brandScore + tagsScore + descScore;

        if (score < 0.8) {
          continue; // No sufficient match
        }
      }

      // 3. Find seller listings and check stock/price filters
      const listings = Array.from(db.listings.values()).filter(l => l.productId === product.id && l.isActive);
      if (listings.length === 0) continue;

      let minPrice = Infinity;
      let totalStock = 0;
      let matchingSellers = 0;

      for (const listing of listings) {
        if (params.minPrice !== undefined && listing.sellingPrice < params.minPrice) continue;
        if (params.maxPrice !== undefined && listing.sellingPrice > params.maxPrice) continue;

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

        minPrice = Math.min(minPrice, listing.sellingPrice);
        totalStock += sellerStockInCity;
        matchingSellers++;
      }

      if (matchingSellers > 0 && minPrice !== Infinity) {
        results.push({
          product,
          minPrice,
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
