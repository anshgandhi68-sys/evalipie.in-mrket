import { db } from '../../db/connection.js';
import { StockStatus } from '../../../../shared/types.js';

export interface VerifiedInventoryResult {
  listingId: string;
  storeId: string;
  storeName: string;
  shopName: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  stockStatus: StockStatus;
  reorderThreshold: number;
  isGuaranteedAvailable: boolean;
}

/**
 * Controlled inventory verification tool.
 * Evaluates real shelf quantity against row-locked reservations to eliminate phantom stock.
 */
export function checkInventory(listingId: string, storeId?: string): VerifiedInventoryResult[] {
  const listing = db.listings.get(listingId);
  if (!listing) return [];

  const shop = Array.from(db.shops.values()).find(s => s.organizationId === listing.organizationId);
  const shopName = shop?.displayName || 'Local Merchant';

  const inventoryRecords = Array.from(db.inventory.values()).filter(inv => {
    if (inv.listingId !== listingId) return false;
    if (storeId && inv.storeId !== storeId) return false;
    return true;
  });

  return inventoryRecords.map(inv => {
    const store = db.stores.get(inv.storeId);
    const storeName = store?.name || 'Local Branch';
    const available = Math.max(0, inv.quantity - inv.reservedQuantity);

    let stockStatus: StockStatus = 'OUT_OF_STOCK';
    if (available > inv.reorderThreshold) {
      stockStatus = 'IN_STOCK';
    } else if (available > 0) {
      stockStatus = 'LOW_STOCK';
    }

    return {
      listingId: inv.listingId,
      storeId: inv.storeId,
      storeName,
      shopName,
      totalQuantity: inv.quantity,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity: available,
      stockStatus,
      reorderThreshold: inv.reorderThreshold,
      isGuaranteedAvailable: available > 0
    };
  });
}
