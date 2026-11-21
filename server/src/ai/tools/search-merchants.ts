import { db } from '../../db/connection.js';
import { Shop, Store } from '../../../../shared/types.js';

export interface MerchantDetails {
  shopId: string;
  organizationId: string;
  name: string;
  slug: string;
  ratingAvg: number;
  ratingCount: number;
  businessType: string;
  stores: Array<{
    storeId: string;
    name: string;
    address: string;
    locality: string;
    city: string;
    distanceKm: number;
  }>;
}

/**
 * Controlled merchant lookup tool.
 * Resolves verified physical neighborhood stores in Bengaluru.
 */
export function searchMerchants(query?: string, city = 'Bengaluru'): MerchantDetails[] {
  const q = (query || '').toLowerCase().trim();
  const shops = Array.from(db.shops.values());
  const results: MerchantDetails[] = [];

  for (const shop of shops) {
    const org = db.organizations.get(shop.organizationId);
    const stores = Array.from(db.stores.values()).filter(
      st => st.organizationId === shop.organizationId && st.isActive
    );

    const matchesQuery =
      !q ||
      shop.displayName.toLowerCase().includes(q) ||
      (shop.description || '').toLowerCase().includes(q) ||
      stores.some(s => s.addressLine1.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));

    if (matchesQuery) {
      results.push({
        shopId: shop.id,
        organizationId: shop.organizationId,
        name: shop.displayName,
        slug: shop.slug,
        ratingAvg: shop.ratingAvg,
        ratingCount: shop.ratingCount,
        businessType: org?.businessType || 'INDEPENDENT_SHOP',
        stores: stores.map(st => ({
          storeId: st.id,
          name: st.name,
          address: st.addressLine1,
          locality: st.postalCode === '560038' ? 'Indiranagar' : st.postalCode === '560011' ? 'Jayanagar' : 'Bengaluru',
          city: st.city,
          distanceKm: st.postalCode === '560038' ? 0.8 : 2.4
        }))
      });
    }
  }

  return results;
}
