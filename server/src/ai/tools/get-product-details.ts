import { db } from '../../db/connection.js';
import { searchService } from '../../services/searchService.js';
import { CanonicalProduct, MultiSellerOffer } from '../../../../shared/types.js';

export interface ProductDetailsResult {
  product: CanonicalProduct;
  offers: MultiSellerOffer[];
  totalAvailableStock: number;
  minPrice: number;
  maxPrice: number;
  verifiedSellersCount: number;
  featuredStore: {
    shopName: string;
    storeName: string;
    city: string;
    distanceKm: number;
    price: number;
    stockStatus: string;
  } | null;
}

/**
 * Authoritative product details tool.
 * Returns verified product specifications, inventory, and seller offers from PostgreSQL.
 */
export function getProductDetails(productId: string, city = 'Bengaluru'): ProductDetailsResult | null {
  const product = db.products.get(productId);
  if (!product) return null;

  const { offers } = searchService.getMultiSellerOffers(product.id, city);
  const totalStock = offers.reduce((sum, o) => sum + Math.max(0, o.availableQuantity), 0);
  const prices = offers.map(o => o.sellingPrice);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const bestOffer = offers[0] || null;

  return {
    product,
    offers,
    totalAvailableStock: totalStock,
    minPrice,
    maxPrice,
    verifiedSellersCount: offers.length,
    featuredStore: bestOffer
      ? {
          shopName: bestOffer.merchant.shopName,
          storeName: bestOffer.store.name,
          city: bestOffer.store.city,
          distanceKm: bestOffer.store.distanceKm,
          price: bestOffer.sellingPrice,
          stockStatus: bestOffer.stockStatus
        }
      : null
  };
}
