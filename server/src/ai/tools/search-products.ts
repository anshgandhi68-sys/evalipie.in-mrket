import { db } from '../../db/connection.js';
import { searchService } from '../../services/searchService.js';
import { CanonicalProduct } from '../../../../shared/types.js';

export interface SearchProductsOptions {
  query?: string;
  category?: string;
  brand?: string;
  maxPrice?: number;
  minPrice?: number;
  city?: string;
  limit?: number;
}

export interface ProductSearchResult {
  product: CanonicalProduct;
  minPrice: number;
  sellerCount: number;
  inStock: boolean;
  relevanceScore: number;
}

/**
 * Controlled catalogue search tool.
 * Queries PostgreSQL/in-memory canonical catalog using OpenSearch/Levenshtein fuzzy matching.
 */
export function searchProducts(options: SearchProductsOptions): ProductSearchResult[] {
  const city = options.city || 'Bengaluru';
  const limit = options.limit || 8;

  const rawResults = searchService.search({
    query: options.query,
    category: options.category && options.category !== 'All' ? options.category : undefined,
    city,
    minPrice: options.minPrice,
    maxPrice: options.maxPrice
  });

  // Filter by brand if specified
  let filtered = rawResults;
  if (options.brand) {
    const brandLower = options.brand.toLowerCase();
    filtered = filtered.filter(r => r.product.brand.toLowerCase().includes(brandLower));
  }

  // Strict budget check
  if (options.maxPrice !== undefined) {
    filtered = filtered.filter(r => r.minPrice <= (options.maxPrice as number));
  }

  // Strict noun anchor filter for specific categories
  if (options.query) {
    const qLower = options.query.toLowerCase();
    if (qLower.includes('laptop') || qLower.includes('lapotp') || qLower.includes('leptop')) {
      filtered = filtered.filter(r => {
        const titleLower = r.product.title.toLowerCase();
        const descLower = r.product.description.toLowerCase();
        return titleLower.includes('laptop') || titleLower.includes('thinkpad') || titleLower.includes('macbook') || descLower.includes('laptop');
      });
    }

    if (qLower.includes('iphone') || (qLower.includes('phone') && !qLower.includes('headphone') && !qLower.includes('charger'))) {
      filtered = filtered.filter(r => {
        const titleLower = r.product.title.toLowerCase();
        return titleLower.includes('iphone') || titleLower.includes('phone') || titleLower.includes('s23') || titleLower.includes('galaxy');
      });
    }
  }

  return filtered.slice(0, limit);
}
