import {
  Organization,
  Store,
  Shop,
  CanonicalProduct,
  MerchantListing,
  StoreInventory,
  LedgerCustomer,
  LedgerEntry,
  Order,
  OutboxEvent
} from '../../../shared/types.js';
import {
  initialOrganizations,
  initialStores,
  initialShops,
  initialProducts,
  initialListings,
  initialInventory,
  initialLedgerCustomers,
  initialLedgerEntries,
  initialOrders,
  initialOutboxEvents
} from './seedData.js';
import { PRODUCTS_SEED } from './marketplaceCatalogueSeed.js';

class DatabaseStore {
  organizations: Map<string, Organization> = new Map();
  stores: Map<string, Store> = new Map();
  shops: Map<string, Shop> = new Map();
  products: Map<string, CanonicalProduct> = new Map();
  listings: Map<string, MerchantListing> = new Map();
  inventory: Map<string, StoreInventory> = new Map();
  orders: Map<string, Order> = new Map();
  outbox: OutboxEvent[] = [];
  ledgerCustomers: Map<string, LedgerCustomer> = new Map();
  ledgerEntries: LedgerEntry[] = [];
  
  // Concurrency lock simulation for atomic row-level locks
  private rowLocks: Set<string> = new Set();

  constructor() {
    this.seed();
  }

  seed() {
    initialOrganizations.forEach(org => this.organizations.set(org.id, { ...org }));
    initialStores.forEach(s => this.stores.set(s.id, { ...s }));
    initialShops.forEach(s => this.shops.set(s.id, { ...s }));
    initialProducts.forEach(p => this.products.set(p.id, { ...p }));
    initialListings.forEach(l => this.listings.set(l.id, { ...l }));
    initialInventory.forEach(i => this.inventory.set(i.id, { ...i }));
    initialOrders.forEach(o => this.orders.set(o.id, { ...o }));
    this.outbox = [...initialOutboxEvents];
    initialLedgerCustomers.forEach(c => this.ledgerCustomers.set(c.id, { ...c }));
    this.ledgerEntries = [...initialLedgerEntries];

    // Merge full 195-product catalogue
    PRODUCTS_SEED.forEach(p => {
      if (!this.products.has(p.id)) {
        this.products.set(p.id, {
          id: p.id,
          title: p.title,
          brand: p.brand,
          category: p.categoryName,
          subCategory: p.subcategoryName,
          description: p.description,
          attributes: p.specifications,
          imageUrl: p.imageUrl,
          tags: p.tags
        });
      }
      this.products.set(p.sku, this.products.get(p.id)!);
      this.products.set(p.sku.toLowerCase(), this.products.get(p.id)!);
      const listingId = `list-${p.id}`;
      if (!this.listings.has(listingId)) {
        this.listings.set(listingId, {
          id: listingId,
          organizationId: 'org-apex',
          productId: p.id,
          sellingPrice: p.price,
          originalMrp: p.originalMrp,
          condition: 'NEW',
          isActive: true
        });
      }
      const invId = `inv-${listingId}-indira`;
      if (!this.inventory.has(invId)) {
        this.inventory.set(invId, {
          id: invId,
          listingId: listingId,
          storeId: 'store-apex-indira',
          quantity: p.stockQuantity,
          availableQuantity: p.stockQuantity,
          reservedQuantity: 0,
          reorderThreshold: 2
        });
      }
    });
  }

  // Atomic row locking simulating PostgreSQL "SELECT ... FOR UPDATE"
  async acquireRowLock(key: string, timeoutMs = 2000): Promise<() => void> {
    const startTime = Date.now();
    while (this.rowLocks.has(key)) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`LockTimeout: Could not acquire lock for row ${key} within ${timeoutMs}ms`);
      }
      await new Promise(r => setTimeout(r, 20));
    }
    this.rowLocks.add(key);
    return () => {
      this.rowLocks.delete(key);
    };
  }

  // Find inventory row by listingId and storeId
  findInventory(listingId: string, storeId: string): StoreInventory | undefined {
    for (const inv of this.inventory.values()) {
      if (inv.listingId === listingId && inv.storeId === storeId) {
        return inv;
      }
    }
    return undefined;
  }

  // Atomic Stock Reservation (Core of Concurrency Protection)
  async atomicReserveStock(params: {
    listingId: string;
    storeId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    deliveryAddress?: string;
    fulfillmentType?: 'STORE_PICKUP' | 'LOCAL_DELIVERY';
    idempotencyKey?: string;
  }): Promise<{ order: Order; outboxEvent: OutboxEvent }> {
    const lockKey = `inv:${params.listingId}:${params.storeId}`;
    const releaseLock = await this.acquireRowLock(lockKey, 3000);

    try {
      const inv = this.findInventory(params.listingId, params.storeId);
      if (!inv) {
        throw new Error('NotFound: Inventory record not found for this listing and store');
      }

      const available = inv.quantity - inv.reservedQuantity;
      if (available < params.quantity) {
        const error: any = new Error('StockExhausted: Insufficient inventory');
        error.status = 409;
        error.code = 'STOCK_EXHAUSTED';
        error.availableQuantity = available;
        throw error;
      }

      // Decrement available quantity atomically
      inv.quantity -= params.quantity;
      this.inventory.set(inv.id, { ...inv });

      // Lookup listing and product details
      const listing = this.listings.get(params.listingId);
      const product = listing ? this.products.get(listing.productId) : undefined;
      const store = this.stores.get(params.storeId);
      const shop = listing ? Array.from(this.shops.values()).find(s => s.organizationId === listing.organizationId) : undefined;

      const orderNumber = `EVAL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const totalAmount = (listing?.sellingPrice || 0) * params.quantity;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        organizationId: listing?.organizationId || '',
        storeId: params.storeId,
        totalAmount,
        currency: 'INR',
        status: 'CONFIRMED',
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        deliveryAddress: params.deliveryAddress || 'Standard Local Address',
        fulfillmentType: params.fulfillmentType || 'LOCAL_DELIVERY',
        items: [
          {
            id: `item-${Date.now()}`,
            orderId,
            listingId: params.listingId,
            productId: listing?.productId || '',
            unitPrice: listing?.sellingPrice || 0,
            quantity: params.quantity,
            subtotal: totalAmount,
            productTitle: product?.title || 'Catalog Product',
            shopName: shop?.displayName || 'Merchant Store'
          }
        ],
        createdAt: new Date().toISOString(),
        shopName: shop?.displayName || 'Merchant Store',
        storeName: store?.name || 'Local Store'
      };

      this.orders.set(orderId, newOrder);

      // Create outbox event in same transaction
      const outboxEvent: OutboxEvent = {
        id: `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        aggregateType: 'ORDER',
        aggregateId: orderId,
        eventType: 'inventory.changed',
        topic: 'evalipie.inventory.changed',
        payload: {
          listingId: params.listingId,
          storeId: params.storeId,
          newQuantity: inv.quantity,
          orderId,
          orderNumber,
          timestamp: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        retryCount: 0
      };

      this.outbox.unshift(outboxEvent);

      return { order: newOrder, outboxEvent };
    } finally {
      releaseLock();
    }
  }
}

export const db = new DatabaseStore();
