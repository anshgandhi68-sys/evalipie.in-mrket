import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_U2yDp78ktOoy4A';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '3jnWfgX2JSD96N9yQEfHrXUH';

export const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

export interface CreateOrderParams {
  amount: number; // in INR rupees
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateQrParams {
  amount: number; // in INR rupees
  orderId: string;
  customerName?: string;
  description?: string;
}

export const razorpayService = {
  getKeyId: () => RAZORPAY_KEY_ID,

  // 1. Create a Razorpay Order for standard checkout
  createOrder: async ({ amount, receipt, notes = {} }: CreateOrderParams) => {
    const amountInPaise = Math.round(amount * 100);
    const order = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt.slice(0, 40),
      notes: {
        platform: 'Evalipie',
        ...notes
      }
    });
    return order;
  },

  // 2. Create a Real-Time Dynamic UPI QR Code for instant mobile scanning
  createQrCode: async ({ amount, orderId, customerName = 'Evalipie Customer', description }: CreateQrParams) => {
    const amountInPaise = Math.round(amount * 100);
    const qr = await razorpayClient.qrCode.create({
      type: 'upi_qr',
      name: 'Evalipie Marketplace',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: amountInPaise,
      description: description || `Order #${orderId}`,
      notes: {
        orderId,
        customerName
      }
    });
    return qr;
  },

  // 3. Fetch live payment status of a QR Code
  getQrStatus: async (qrId: string) => {
    const qr: any = await razorpayClient.qrCode.fetch(qrId);

    // Also fetch associated payments to get payment ID and transaction details
    let payments: any = { items: [] };
    try {
      payments = await razorpayClient.qrCode.fetchAllPayments(qrId);
    } catch (e) {
      console.warn(`Error fetching QR payments for ${qrId}:`, e);
    }

    const isPaid = 
      (qr.payments_amount_received && qr.payments_amount_received >= qr.payment_amount) ||
      qr.status === 'closed' ||
      (payments.items && payments.items.length > 0 && payments.items[0].status === 'captured');

    const latestPayment = payments.items && payments.items.length > 0 ? payments.items[0] : null;

    return {
      isPaid: Boolean(isPaid),
      status: qr.status,
      paymentsCount: qr.payments_count_received || (payments.items ? payments.items.length : 0),
      amountReceived: (qr.payments_amount_received ? qr.payments_amount_received / 100 : 0) || (latestPayment ? latestPayment.amount / 100 : 0),
      paymentId: latestPayment?.id || null,
      paymentMethod: latestPayment?.method || 'upi',
      vpa: latestPayment?.vpa || null,
      rawQr: qr
    };
  },

  // 4. Verify HMAC SHA256 Signature for Webhook or Checkout callback
  verifyPaymentSignature: ({
    orderId,
    paymentId,
    signature
  }: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === signature;
  }
};
