import { Request, Response } from 'express';
import { db } from '../db/connection.js';
import { MerchantListing, StoreInventory } from '../../../shared/types.js';

export const merchantController = {
  // GET /api/merchant/dashboard
  getDashboard: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const listings = Array.from(db.listings.values()).filter(l => l.organizationId === orgId);
    const orders = Array.from(db.orders.values()).filter(o => o.organizationId === orgId);
    
    // Calculate total sales & stock metrics
    const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;

    let totalAvailableStock = 0;
    let lowStockCount = 0;

    for (const listing of listings) {
      for (const inv of db.inventory.values()) {
        if (inv.listingId === listing.id) {
          const avail = Math.max(0, inv.quantity - inv.reservedQuantity);
          totalAvailableStock += avail;
          if (avail > 0 && avail <= inv.reorderThreshold) lowStockCount++;
        }
      }
    }

    const shop = Array.from(db.shops.values()).find(s => s.organizationId === orgId);

    res.json({
      status: 'success',
      data: {
        shop,
        metrics: {
          totalSales,
          pendingOrders,
          activeListings: listings.filter(l => l.isActive).length,
          totalAvailableStock,
          lowStockCount
        },
        recentOrders: orders.slice(0, 5)
      }
    });
  },

  // GET /api/merchant/listings
  getListings: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const listings = Array.from(db.listings.values())
      .filter(l => l.organizationId === orgId)
      .map(l => {
        const product = db.products.get(l.productId);
        const invList = Array.from(db.inventory.values()).filter(i => i.listingId === l.id);
        return {
          ...l,
          product,
          inventory: invList.map(inv => {
            const store = db.stores.get(inv.storeId);
            return {
              ...inv,
              storeName: store?.name || 'Store Branch',
              availableQuantity: Math.max(0, inv.quantity - inv.reservedQuantity)
            };
          })
        };
      });

    res.json({ status: 'success', data: listings });
  },

  // PUT /api/merchant/inventory/:id
  updateInventory: (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity, delta } = req.body;

    const inv = db.inventory.get(id);
    if (!inv) {
      return res.status(404).json({ status: 'error', message: 'Inventory record not found' });
    }

    if (quantity !== undefined) {
      inv.quantity = Math.max(0, parseInt(quantity, 10));
    } else if (delta !== undefined) {
      inv.quantity = Math.max(0, inv.quantity + parseInt(delta, 10));
    }

    db.inventory.set(id, { ...inv });

    // Emits inventory.changed event to Outbox
    db.outbox.unshift({
      id: `outbox-${Date.now()}`,
      aggregateType: 'INVENTORY',
      aggregateId: id,
      eventType: 'inventory.changed',
      topic: 'evalipie.inventory.changed',
      payload: {
        inventoryId: id,
        listingId: inv.listingId,
        storeId: inv.storeId,
        newQuantity: inv.quantity,
        timestamp: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      retryCount: 0
    });

    res.json({
      status: 'success',
      data: {
        ...inv,
        availableQuantity: Math.max(0, inv.quantity - inv.reservedQuantity)
      }
    });
  },

  // GET /api/merchant/branches
  getBranches: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-citysuper'; // default to retail chain
    const stores = Array.from(db.stores.values()).filter(s => s.organizationId === orgId);
    res.json({ status: 'success', data: stores });
  },

  // GET /api/merchant/orders
  getOrders: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const orders = Array.from(db.orders.values())
      .filter(o => o.organizationId === orgId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ status: 'success', data: orders });
  },

  // PUT /api/merchant/orders/:id/status
  updateOrderStatus: (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = db.orders.get(id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    order.status = status;
    db.orders.set(id, { ...order });

    res.json({ status: 'success', data: order });
  },

  // GET /api/merchant/demand-insights
  getDemandInsights: (_req: Request, res: Response) => {
    const unmetSearches = [
      { query: 'Noise cancelling earbuds under 1500', searchesCount: 42, city: 'Bengaluru', potentialRevenue: 63000 },
      { query: 'Mechanical keyboard hot swappable', searchesCount: 38, city: 'Bengaluru', potentialRevenue: 95000 },
      { query: 'Compact induction cooktop', searchesCount: 29, city: 'Bengaluru', potentialRevenue: 58000 },
      { query: 'Foldable laptop stand aluminum', searchesCount: 24, city: 'Bengaluru', potentialRevenue: 24000 }
    ];

    res.json({
      status: 'success',
      data: {
        unmetSearches,
        highDemandCategories: ['Electronics / Audio', 'Computers / Accessories', 'Home / Compact Cooking']
      }
    });
  }
};
