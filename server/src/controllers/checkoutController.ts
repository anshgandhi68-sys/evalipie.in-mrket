import { Request, Response } from 'express';
import { db } from '../db/connection.js';
import { searchService } from '../services/searchService.js';

export const checkoutController = {
  // POST /api/checkout/reserve (Atomic Concurrency Reservation)
  reserve: async (req: Request, res: Response) => {
    try {
      const { listingId, storeId, quantity, customerName, customerPhone, deliveryAddress, fulfillmentType, idempotencyKey } = req.body;

      if (!listingId || !storeId || !quantity) {
        return res.status(400).json({ status: 'error', message: 'listingId, storeId, and quantity are required' });
      }

      // Execute atomic transaction with row locking
      const { order, outboxEvent } = await db.atomicReserveStock({
        listingId,
        storeId,
        quantity: parseInt(quantity, 10) || 1,
        customerName: customerName || 'Ananya Sharma',
        customerPhone: customerPhone || '+919876543210',
        deliveryAddress: deliveryAddress || '100ft Road, Indiranagar, Bengaluru',
        fulfillmentType: fulfillmentType || 'LOCAL_DELIVERY',
        idempotencyKey
      });

      return res.status(201).json({
        status: 'success',
        message: 'Stock reserved and order confirmed successfully',
        data: {
          order,
          outboxEventId: outboxEvent.id
        }
      });
    } catch (err: any) {
      if (err.code === 'STOCK_EXHAUSTED' || err.status === 409) {
        // Suggest alternative merchants selling the same product
        const listing = db.listings.get(req.body.listingId);
        let alternatives: any[] = [];
        if (listing) {
          const { offers } = searchService.getMultiSellerOffers(listing.productId);
          alternatives = offers.filter(o => o.listingId !== req.body.listingId && o.availableQuantity > 0);
        }

        return res.status(409).json({
          status: 'error',
          code: 'STOCK_EXHAUSTED',
          message: 'The last remaining unit of this item was just claimed by another customer. Zero overselling guaranteed.',
          availableQuantity: err.availableQuantity || 0,
          alternativeSellers: alternatives
        });
      }

      return res.status(500).json({
        status: 'error',
        message: err.message || 'Internal error reserving stock'
      });
    }
  },

  // GET /api/orders
  getOrders: (req: Request, res: Response) => {
    const orders = Array.from(db.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ status: 'success', data: orders });
  },

  // GET /api/orders/:id
  getOrderById: (req: Request, res: Response) => {
    const order = db.orders.get(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }
    res.json({ status: 'success', data: order });
  }
};
