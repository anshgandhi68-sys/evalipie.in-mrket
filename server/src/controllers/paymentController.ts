import { Request, Response } from 'express';
import { razorpayService } from '../services/razorpayService.js';
import { db } from '../db/connection.js';
import { memoryPg } from '../db/aivenPg.js';
import { sseEventStream } from './eventsController.js';

export const paymentController = {
  // POST /api/payments/create-qr
  createQr: async (req: Request, res: Response) => {
    try {
      const { orderId, amount, customerName = 'Evalipie Customer' } = req.body;

      if (!orderId || !amount) {
        return res.status(400).json({ status: 'error', message: 'orderId and amount are required' });
      }

      const numericAmount = Number(amount);

      // 1. Create a live Razorpay Order for standard checkout fallback
      const rzpOrder = await razorpayService.createOrder({
        amount: numericAmount,
        receipt: `rcpt_${orderId.slice(-14)}`,
        notes: { orderId, customerName }
      });

      // 2. Create a live Dynamic UPI QR Code for instant scanning
      const qr = await razorpayService.createQrCode({
        amount: numericAmount,
        orderId,
        customerName,
        description: `Evalipie Order #${orderId}`
      });

      // 3. Link Razorpay details to existing order in store
      const order: any = db.orders.get(orderId) || memoryPg.orders.get(orderId);
      if (order) {
        order.razorpayQrId = qr.id;
        order.razorpayOrderId = rzpOrder.id;
        order.paymentStatus = 'PENDING';
      }

      return res.status(201).json({
        status: 'success',
        data: {
          qrId: qr.id,
          qrImageUrl: qr.image_url,
          paymentAmount: numericAmount,
          currency: 'INR',
          razorpayOrderId: rzpOrder.id,
          keyId: razorpayService.getKeyId(),
          orderId
        }
      });
    } catch (err: any) {
      console.error('Error creating Razorpay QR Code:', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to generate Razorpay QR Code'
      });
    }
  },

  // GET /api/payments/status/:qrId
  checkStatus: async (req: Request, res: Response) => {
    try {
      const { qrId } = req.params;
      const { orderId } = req.query;

      if (!qrId) {
        return res.status(400).json({ status: 'error', message: 'qrId is required' });
      }

      // Check live status directly from Razorpay API
      const qrStatus = await razorpayService.getQrStatus(qrId);

      let order: any = null;
      if (orderId) {
        order = db.orders.get(String(orderId)) || memoryPg.orders.get(String(orderId));
      } else {
        // Look up by qrId
        order = Array.from(db.orders.values()).find(o => o.razorpayQrId === qrId) ||
                Array.from(memoryPg.orders.values()).find(o => o.razorpayQrId === qrId);
      }

      if (qrStatus.isPaid) {
        if (order && order.paymentStatus !== 'PAID') {
          order.status = 'CONFIRMED';
          order.paymentStatus = 'PAID';
          order.paymentId = qrStatus.paymentId || `pay_qr_${Date.now()}`;
          order.paidAt = new Date().toISOString();

          // Also sync to memoryPg
          const memOrder = memoryPg.orders.get(order.id);
          if (memOrder) {
            memOrder.status = 'CONFIRMED';
            memOrder.paymentStatus = 'PAID';
            memOrder.paymentId = order.paymentId;
            memOrder.paidAt = order.paidAt;
          }

          // Emit real-time SSE payment confirmation event
          sseEventStream.broadcast('order-paid', {
            orderId: order.id,
            paymentId: order.paymentId,
            amount: order.totalAmount ?? order.total_amount ?? 0,
            paidAt: order.paidAt
          });
        }

        return res.json({
          status: 'success',
          data: {
            paid: true,
            status: 'PAID',
            paymentId: qrStatus.paymentId,
            amountReceived: qrStatus.amountReceived,
            order: order || null
          }
        });
      }

      return res.json({
        status: 'success',
        data: {
          paid: false,
          status: qrStatus.status || 'PENDING',
          order: order || null
        }
      });
    } catch (err: any) {
      console.error('Error checking QR status:', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to check QR payment status'
      });
    }
  },

  // POST /api/payments/verify (Standard Razorpay Checkout verification)
  verifyPayment: async (req: Request, res: Response) => {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ status: 'error', message: 'Missing payment verification credentials' });
      }

      const isValid = razorpayService.verifyPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature
      });

      if (!isValid) {
        return res.status(400).json({ status: 'error', message: 'Invalid Razorpay payment signature' });
      }

      // Mark order as paid
      const order: any = db.orders.get(orderId) || memoryPg.orders.get(orderId);
      if (order) {
        order.status = 'CONFIRMED';
        order.paymentStatus = 'PAID';
        order.paymentId = razorpayPaymentId;
        order.paidAt = new Date().toISOString();

        sseEventStream.broadcast('order-paid', {
          orderId: order.id,
          paymentId: razorpayPaymentId,
          amount: order.totalAmount ?? order.total_amount ?? 0,
          paidAt: order.paidAt
        });
      }

      return res.json({
        status: 'success',
        message: 'Payment verified successfully',
        data: {
          paid: true,
          orderId,
          paymentId: razorpayPaymentId
        }
      });
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Payment verification failed'
      });
    }
  },

  // GET /api/payments/order/:orderId
  getOrderPayment: async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      let order: any = db.orders.get(orderId) || memoryPg.orders.get(orderId);
      if (!order) {
        order = Array.from(db.orders.values()).find(o => o.orderNumber === orderId || o.id === orderId) ||
                Array.from(memoryPg.orders.values()).find((o: any) => o.id === orderId || o.orderNumber === orderId || o.order_number === orderId);
      }

      if (!order) {
        return res.status(404).json({ status: 'error', message: 'Order not found' });
      }

      const normalizedOrder = {
        id: order.id,
        orderNumber: order.orderNumber || order.order_number || order.id,
        customerName: order.customerName || order.customer_name || 'Customer',
        customerPhone: order.customerPhone || order.customer_phone || '',
        deliveryAddress: order.deliveryAddress || order.delivery_address || '',
        totalAmount: order.totalAmount ?? order.total_amount ?? 0,
        status: order.status,
        paymentStatus: order.paymentStatus || (order.status === 'PAID' ? 'PAID' : 'PENDING'),
        paymentId: order.paymentId || null,
        paidAt: order.paidAt || null,
        razorpayQrId: order.razorpayQrId || null,
        razorpayOrderId: order.razorpayOrderId || null,
        createdAt: order.createdAt || order.created_at || new Date().toISOString(),
        shopName: order.shopName || order.storeName || 'Central Hub'
      };

      return res.json({
        status: 'success',
        data: {
          order: normalizedOrder,
          keyId: razorpayService.getKeyId()
        }
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  }
};
