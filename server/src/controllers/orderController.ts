import { Request, Response } from 'express';
import { aivenPg, memoryPg, OrderRow, OutboxRow } from '../db/aivenPg.js';
import { kafkaEventProducer } from '../services/kafkaService.js';
import { sseEventStream } from '../controllers/eventsController.js';

export class OrderController {
  // POST /api/orders/checkout (ACID Transactional Checkout with Row-Level Locks)
  async checkout(req: Request, res: Response) {
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      (req.headers['x-idempotency-key'] as string) ||
      req.body.idempotencyKey;

    if (!idempotencyKey) {
      return res.status(400).json({
        error: 'Idempotency-Key header or body field is required to prevent duplicate order processing.'
      });
    }

    const {
      customerName = 'Evalipie Customer',
      customerPhone = '+919876543210',
      deliveryAddress = '42, 100ft Road, Indiranagar',
      city = 'Bengaluru',
      fulfillmentType = 'STORE_PICKUP',
      paymentMethod = 'UPI_INSTANT',
      items = []
    } = req.body;

    // Resolve items from request body or cart
    let orderItems = items;
    if (!orderItems || orderItems.length === 0) {
      const cartId = (req.headers['x-cart-id'] as string) || 'default-user-cart';
      orderItems = Array.from(memoryPg.cart_items.values()).filter(i => i.cartId === cartId);
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: 'Cannot checkout with an empty order or cart.' });
    }

    // 1. Idempotency Check (Prevent duplicate charging)
    const existingOrder = Array.from(memoryPg.orders.values()).find(o => o.idempotency_key === idempotencyKey);
    if (existingOrder) {
      return res.status(200).json({
        status: 'success',
        isIdempotentReplay: true,
        data: {
          order: existingOrder,
          items: memoryPg.order_items.get(existingOrder.id) || []
        }
      });
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const outboxId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // ─────────────────────────────────────────────────────────────────
    // PATH A: Real Aiven PostgreSQL ACID Transaction (when DATABASE_URL is active)
    // ─────────────────────────────────────────────────────────────────
    if (aivenPg.isConnected) {
      const client = await aivenPg.getClient();
      if (!client) {
        return res.status(500).json({ error: 'Database connection client unavailable.' });
      }

      try {
        await client.query('BEGIN');

        // Check idempotency in DB
        const idempRes = await client.query('SELECT * FROM orders WHERE idempotency_key = $1', [idempotencyKey]);
        if (idempRes.rows.length > 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(200).json({
            status: 'success',
            isIdempotentReplay: true,
            data: { order: idempRes.rows[0] }
          });
        }

        let calculatedTotal = 0;
        const verifiedItems: any[] = [];

        for (const item of orderItems) {
          const productId = item.productId || item.id;
          const qty = Number(item.quantity) || 1;
          const targetCity = item.city || city;

          // 2. Fetch real price from PostgreSQL (Never trust frontend price)
          const prodRes = await client.query('SELECT id, title, price FROM products WHERE id = $1', [productId]);
          if (prodRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: `Product not found: ${productId}` });
          }
          const realPrice = Number(prodRes.rows[0].price);

          // 3. Row-Level Locking with FOR UPDATE
          const invRes = await client.query(
            'SELECT id, available_stock, reserved_stock FROM inventory WHERE product_id = $1 AND city = $2 FOR UPDATE',
            [productId, targetCity]
          );

          if (invRes.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: `No inventory record for ${prodRes.rows[0].title} in ${targetCity}` });
          }

          const currentStock = invRes.rows[0].available_stock;

          // 4. Concurrency Guard: Reject with HTTP 409 Conflict if stock is insufficient
          if (currentStock < qty) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(409).json({
              error: 'STOCK_EXHAUSTED',
              message: `Insufficient physical stock for "${prodRes.rows[0].title}". Available: ${currentStock}, Requested: ${qty}. Another customer may have reserved the last item.`,
              productId,
              availableStock: currentStock,
              requestedQuantity: qty
            });
          }

          // 5. Decrement stock atomically
          await client.query(
            'UPDATE inventory SET available_stock = available_stock - $1, reserved_stock = reserved_stock + $1, updated_at = NOW() WHERE product_id = $2 AND city = $3',
            [qty, productId, targetCity]
          );

          calculatedTotal += realPrice * qty;
          verifiedItems.push({
            productId,
            productTitle: prodRes.rows[0].title,
            city: targetCity,
            quantity: qty,
            unitPrice: realPrice,
            totalPrice: realPrice * qty
          });
        }

        // 6. Insert Order
        await client.query(
          `INSERT INTO orders (id, idempotency_key, customer_name, customer_phone, delivery_address, city, total_amount, status, fulfillment_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED', $8)`,
          [orderId, idempotencyKey, customerName, customerPhone, deliveryAddress, city, calculatedTotal, fulfillmentType]
        );

        // 7. Insert Order Items
        for (const vItem of verifiedItems) {
          const itemId = `oi-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          await client.query(
            `INSERT INTO order_items (id, order_id, product_id, product_title, city, quantity, unit_price, total_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [itemId, orderId, vItem.productId, vItem.productTitle, vItem.city, vItem.quantity, vItem.unitPrice, vItem.totalPrice]
          );
        }

        // 8. Insert Payment
        await client.query(
          `INSERT INTO payments (id, order_id, payment_method, amount, status, transaction_ref)
           VALUES ($1, $2, $3, $4, 'COMPLETED', $5)`,
          [`pay-${orderId}`, orderId, paymentMethod, calculatedTotal, `TXN-${Date.now()}`]
        );

        // 9. Transactional Outbox Insertion (orders.placed)
        const outboxPayload = {
          orderId,
          idempotencyKey,
          customerName,
          customerPhone,
          city,
          totalAmount: calculatedTotal,
          items: verifiedItems,
          timestamp: new Date().toISOString()
        };

        await client.query(
          `INSERT INTO outbox_events (id, event_type, aggregate_type, aggregate_id, payload, status)
           VALUES ($1, 'orders.placed', 'Order', $2, $3, 'PENDING')`,
          [outboxId, orderId, JSON.stringify(outboxPayload)]
        );

        await client.query('COMMIT');
        client.release();

        // Relay to Kafka & Server-Sent Events stream
        kafkaEventProducer.publish('orders.placed', outboxPayload);
        sseEventStream.broadcast('notifications.send', {
          orderId,
          message: `Order #${orderId.slice(-6).toUpperCase()} confirmed for ₹${calculatedTotal.toLocaleString('en-IN')}`,
          customerName,
          status: 'CONFIRMED'
        });

        return res.status(201).json({
          status: 'success',
          data: {
            order: {
              id: orderId,
              idempotencyKey,
              customerName,
              customerPhone,
              city,
              totalAmount: calculatedTotal,
              status: 'CONFIRMED',
              createdAt: new Date().toISOString()
            },
            items: verifiedItems
          }
        });
      } catch (err: any) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(500).json({ error: 'Checkout transaction failed: ' + err.message });
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // PATH B: Memory ACID Store with Strict Atomic Row-Level Locks
    // ─────────────────────────────────────────────────────────────────
    const releaseLocks: Array<() => void> = [];
    try {
      let calculatedTotal = 0;
      const verifiedItems: any[] = [];

      for (const item of orderItems) {
        const productId = item.productId || item.id;
        const qty = Number(item.quantity) || 1;
        const targetCity = item.city || city;

        // Acquire simulated SELECT ... FOR UPDATE lock on the inventory row
        const lockKey = `lock:inv:${productId}:${targetCity.toLowerCase()}`;
        const release = await memoryPg.acquireRowLock(lockKey, 3000);
        releaseLocks.push(release);

        const prod = memoryPg.products.get(productId);
        if (!prod) {
          throw { status: 404, message: `Product not found: ${productId}` };
        }
        const realPrice = Number(prod.price);

        const inv = memoryPg.findInventory(productId, targetCity);
        const currentStock = inv ? inv.available_stock : 0;

        // Concurrency Guard: Check stock inside row lock
        if (currentStock < qty) {
          throw {
            status: 409,
            code: 'STOCK_EXHAUSTED',
            message: `Insufficient physical stock for "${prod.title}". Available: ${currentStock}, Requested: ${qty}. Another customer may have reserved the last item.`,
            productId,
            availableStock: currentStock,
            requestedQuantity: qty
          };
        }

        // Decrement stock atomically
        if (inv) {
          inv.available_stock -= qty;
          inv.reserved_stock += qty;
          inv.updated_at = new Date();
        }

        calculatedTotal += realPrice * qty;
        verifiedItems.push({
          productId,
          productTitle: prod.title,
          city: targetCity,
          quantity: qty,
          unitPrice: realPrice,
          totalPrice: realPrice * qty
        });
      }

      // Record Order
      const newOrder: OrderRow = {
        id: orderId,
        idempotency_key: idempotencyKey,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        city,
        total_amount: calculatedTotal,
        status: 'CONFIRMED',
        fulfillment_type: fulfillmentType,
        created_at: new Date()
      };
      memoryPg.orders.set(orderId, newOrder);
      memoryPg.order_items.set(orderId, verifiedItems);

      // Record Outbox Event
      const outboxPayload = {
        orderId,
        idempotencyKey,
        customerName,
        customerPhone,
        city,
        totalAmount: calculatedTotal,
        items: verifiedItems,
        timestamp: new Date().toISOString()
      };

      const outboxRow: OutboxRow = {
        id: outboxId,
        event_type: 'orders.placed',
        aggregate_type: 'Order',
        aggregate_id: orderId,
        payload: outboxPayload,
        status: 'PENDING',
        retry_count: 0,
        published_at: null,
        created_at: new Date()
      };
      memoryPg.outbox_events.set(outboxId, outboxRow);

      // Clear Cart
      const cartId = (req.headers['x-cart-id'] as string) || 'default-user-cart';
      for (const [key, val] of memoryPg.cart_items.entries()) {
        if (val.cartId === cartId) {
          memoryPg.cart_items.delete(key);
        }
      }

      // Release all acquired row locks
      while (releaseLocks.length > 0) {
        const rel = releaseLocks.pop();
        if (rel) rel();
      }

      // Relay to Kafka & Server-Sent Events stream
      kafkaEventProducer.publish('orders.placed', outboxPayload);
      sseEventStream.broadcast('notifications.send', {
        orderId,
        message: `Order #${orderId.slice(-6).toUpperCase()} confirmed for ₹${calculatedTotal.toLocaleString('en-IN')}`,
        customerName,
        status: 'CONFIRMED'
      });

      return res.status(201).json({
        status: 'success',
        data: {
          order: newOrder,
          items: verifiedItems
        }
      });
    } catch (err: any) {
      // Release all acquired row locks on failure
      while (releaseLocks.length > 0) {
        const rel = releaseLocks.pop();
        if (rel) rel();
      }

      if (err.status) {
        return res.status(err.status).json({
          error: err.code || 'CHECKOUT_FAILED',
          message: err.message,
          availableStock: err.availableStock,
          requestedQuantity: err.requestedQuantity
        });
      }

      return res.status(500).json({ error: 'Checkout error: ' + (err.message || String(err)) });
    }
  }

  // GET /api/orders
  async getOrders(_req: Request, res: Response) {
    const orders = Array.from(memoryPg.orders.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return res.json({ status: 'success', total: orders.length, data: orders });
  }

  // GET /api/orders/:id
  async getOrderById(req: Request, res: Response) {
    const { id } = req.params;
    const order = memoryPg.orders.get(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    const items = memoryPg.order_items.get(id) || [];
    return res.json({ status: 'success', data: { ...order, items } });
  }
}

export const orderController = new OrderController();
