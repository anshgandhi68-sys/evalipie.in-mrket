import { db } from '../../db/connection.js';
import { searchService } from '../../services/searchService.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export interface AlternativeResult {
  originalProduct: CanonicalProduct;
  alternatives: Array<{
    product: CanonicalProduct;
    minPrice: number;
    priceDifference: number;
    percentSaved?: number;
    offers: MultiSellerOffer[];
    reason: string;
  }>;
}

/**
 * Controlled alternatives finder tool.
 * Recommends verified in-stock or lower-priced catalogue substitutes.
 */
export function findAlternatives(
  productId: string,
  maxPrice?: number,
  city = 'Bengaluru'
): AlternativeResult | null {
  const original = db.products.get(productId);
  if (!original) return null;

  const originalOffers = searchService.getMultiSellerOffers(original.id, city).offers;
  const originalMinPrice = originalOffers.length > 0 ? originalOffers[0].sellingPrice : 0;

  // Search same category products
  const candidates = Array.from(db.products.values())
    .filter(p => p.id !== original.id && p.category.toLowerCase() === original.category.toLowerCase())
    .map(product => {
      const { offers } = searchService.getMultiSellerOffers(product.id, city);
      const inStockOffers = offers.filter(o => o.availableQuantity > 0);
      if (inStockOffers.length === 0) return null;

      const altMinPrice = inStockOffers[0].sellingPrice;
      if (maxPrice && altMinPrice > maxPrice) return null;

      const priceDiff = originalMinPrice - altMinPrice;
      const percentSaved = originalMinPrice > 0 && priceDiff > 0
        ? Math.round((priceDiff / originalMinPrice) * 100)
        : undefined;

      let reason = '';
      if (priceDiff > 0) {
        reason = `Saves ₹${priceDiff.toLocaleString('en-IN')}${percentSaved ? ` (${percentSaved}%)` : ''} compared to ${original.title}.`;
      } else {
        reason = `Alternative ${product.category} option with verified physical stock at ${inStockOffers[0].merchant.shopName}.`;
      }

      return {
        product,
        minPrice: altMinPrice,
        priceDifference: priceDiff,
        percentSaved,
        offers: inStockOffers,
        reason
      };
    })
    .filter(Boolean) as AlternativeResult['alternatives'];

  // Sort by price savings, then price
  candidates.sort((a, b) => b.priceDifference - a.priceDifference || a.minPrice - b.minPrice);

  return {
    originalProduct: original,
    alternatives: candidates.slice(0, 3)
  };
}
