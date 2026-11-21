import { db } from '../../db/connection.js';
import { searchService } from '../../services/searchService.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export interface ProductComparisonResult {
  products: Array<{
    product: CanonicalProduct;
    offers: MultiSellerOffer[];
    minPrice: number;
    maxPrice: number;
    totalSellers: number;
    bestSeller: {
      shopName: string;
      price: number;
      stockStatus: string;
      slaMinutes: number;
    } | null;
  }>;
  commonAttributes: string[];
  differingAttributes: string[];
  recommendationNote: string;
}

/**
 * Controlled product comparison tool.
 * Evaluates 2-4 products side by side across real merchant listings.
 */
export function compareProducts(productIds: string[], city = 'Bengaluru'): ProductComparisonResult {
  const comparedList = productIds
    .map(id => {
      const product = db.products.get(id);
      if (!product) return null;
      const { offers } = searchService.getMultiSellerOffers(product.id, city);
      const prices = offers.map(o => o.sellingPrice);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const bestOffer = offers[0] || null;

      return {
        product,
        offers,
        minPrice,
        maxPrice,
        totalSellers: offers.length,
        bestSeller: bestOffer
          ? {
              shopName: bestOffer.merchant.shopName,
              price: bestOffer.sellingPrice,
              stockStatus: bestOffer.stockStatus,
              slaMinutes: 30
            }
          : null
      };
    })
    .filter(Boolean) as ProductComparisonResult['products'];

  // Identify attribute differences
  const allAttributeKeys = Array.from(
    new Set(comparedList.flatMap(p => Object.keys(p.product.attributes || {})))
  );

  const commonAttributes: string[] = [];
  const differingAttributes: string[] = [];

  for (const key of allAttributeKeys) {
    const values = comparedList.map(p => String(p.product.attributes?.[key] ?? ''));
    const allSame = values.every(v => v === values[0]);
    if (allSame) {
      commonAttributes.push(key);
    } else {
      differingAttributes.push(key);
    }
  }

  let recommendationNote = '';
  if (comparedList.length >= 2) {
    const sortedByPrice = [...comparedList].sort((a, b) => a.minPrice - b.minPrice);
    const cheapest = sortedByPrice[0];
    recommendationNote = `${cheapest.product.title} offers the lowest entry price at ₹${cheapest.minPrice.toLocaleString('en-IN')} available through ${cheapest.bestSeller?.shopName || 'verified sellers'}.`;
  }

  return {
    products: comparedList,
    commonAttributes,
    differingAttributes,
    recommendationNote
  };
}
