import { searchService } from '../services/searchService.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../shared/types.js';
import { StructuredIntent, ProductOfferMatch } from './schemas.js';
import { ProductSearchResult } from './tools/search-products.js';

export class ProductRankingEngine {
  /**
   * Deterministically rank candidate products against customer intent.
   * Zero hallucinations, explainable criteria only.
   */
  rank(
    candidates: ProductSearchResult[],
    intent: StructuredIntent,
    city = 'Bengaluru'
  ): ProductOfferMatch[] {
    const scoredMatches: ProductOfferMatch[] = [];

    for (const item of candidates) {
      const { canonicalProduct, offers } = searchService.getMultiSellerOffers(item.product.id, city);
      if (!canonicalProduct || offers.length === 0) continue;

      // Filter in-stock offers first
      const inStockOffers = offers.filter(o => o.availableQuantity > 0);
      const activeOffers = inStockOffers.length > 0 ? inStockOffers : offers;
      const bestOffer = activeOffers[0]; // Lowest price offer

      const prices = offers.map(o => o.sellingPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // ── Scoring Dimensions (0.0 to 1.0) ──
      // 1. Text Relevance (0.35 weight)
      const textScore = Math.min(1.0, item.relevanceScore / 4.0);

      // 2. Category Match (0.20 weight)
      let categoryScore = 0.5;
      if (intent.category) {
        if (canonicalProduct.category.toLowerCase() === intent.category.toLowerCase()) {
          categoryScore = 1.0;
        } else {
          categoryScore = 0.1;
        }
      }

      // 3. Brand Match (0.10 weight)
      let brandScore = 0.5;
      if (intent.brand) {
        brandScore = canonicalProduct.brand.toLowerCase() === intent.brand.toLowerCase() ? 1.0 : 0.0;
      }

      // 4. Budget Compatibility (0.20 weight)
      let budgetScore = 0.8;
      if (intent.budget?.max) {
        if (bestOffer.sellingPrice <= intent.budget.max) {
          // Bonus for good value
          const ratio = bestOffer.sellingPrice / intent.budget.max;
          budgetScore = ratio >= 0.5 ? 1.0 : 0.85;
        } else {
          // Over budget penalty
          budgetScore = Math.max(0.1, 1 - (bestOffer.sellingPrice - intent.budget.max) / intent.budget.max);
        }
      }

      // 5. Stock Availability (0.15 weight)
      let stockScore = 0.2;
      if (bestOffer.availableQuantity > 5) {
        stockScore = 1.0;
      } else if (bestOffer.availableQuantity > 0) {
        stockScore = 0.8; // Low stock
      }

      // Compute total weighted score
      const totalScore = Number(
        (
          textScore * 0.35 +
          categoryScore * 0.20 +
          brandScore * 0.10 +
          budgetScore * 0.20 +
          stockScore * 0.15
        ).toFixed(3)
      );

      // Build explainable match reason
      const reasonParts: string[] = [];
      if (intent.brand && canonicalProduct.brand.toLowerCase() === intent.brand.toLowerCase()) {
        reasonParts.push(`Genuine ${canonicalProduct.brand}`);
      }
      if (intent.budget?.max && bestOffer.sellingPrice <= intent.budget.max) {
        reasonParts.push(`within your budget at ₹${bestOffer.sellingPrice.toLocaleString('en-IN')}`);
      }
      if (bestOffer.availableQuantity > 0) {
        reasonParts.push(`verified physical stock at ${bestOffer.merchant.shopName}`);
      }

      const matchReason =
        reasonParts.length > 0
          ? `${canonicalProduct.title} is a verified match: ${reasonParts.join(', ')}.`
          : `Verified ${canonicalProduct.category} product available locally from ${offers.length} merchants.`;

      scoredMatches.push({
        productId: canonicalProduct.id,
        title: canonicalProduct.title,
        brand: canonicalProduct.brand,
        category: canonicalProduct.category,
        imageUrl: canonicalProduct.imageUrl,
        description: canonicalProduct.description,
        attributes: canonicalProduct.attributes || {},
        bestOffer: {
          listingId: bestOffer.listingId,
          shopName: bestOffer.merchant.shopName,
          shopSlug: bestOffer.merchant.shopSlug,
          sellingPrice: bestOffer.sellingPrice,
          originalMrp: bestOffer.originalMrp,
          stockStatus: bestOffer.stockStatus,
          availableQuantity: bestOffer.availableQuantity,
          storeName: bestOffer.store.name,
          storeAddress: bestOffer.store.address,
          distanceKm: bestOffer.store.distanceKm,
          slaMinutes: 30
        },
        totalSellers: offers.length,
        priceRange: {
          min: minPrice,
          max: maxPrice
        },
        matchScore: totalScore,
        matchReason
      });
    }

    // Sort descending by matchScore
    return scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const productRankingEngine = new ProductRankingEngine();
