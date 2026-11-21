import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  CreditCard, 
  ArrowRight, 
  Clock, 
  Store, 
  Receipt, 
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../../../shared/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // QR & Payment state
  const [qrData, setQrData] = useState<{
    qrId: string;
    qrImageUrl: string;
    paymentAmount: number;
    razorpayOrderId: string;
    keyId: string;
  } | null>(null);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string;
    paidAt: string;
    amount: number;
  } | null>(null);

  // Status polling & expiration timer
  const [pollingStatus, setPollingStatus] = useState<'IDLE' | 'LISTENING' | 'CONFIRMED'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds
  const [copiedId, setCopiedId] = useState(false);
  const pollIntervalRef = useRef<any>(null);

  // 1. Fetch Order details
  useEffect(() => {
    let isMounted = true;
    if (!orderId) {
      setError('No Order ID specified for payment.');
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await api.getOrderPayment(orderId);
        if (!isMounted) return;

        if (res.order) {
          setOrder(res.order);
          // If already paid
          if (res.order.paymentStatus === 'PAID' || (res.order.status as string) === 'PAID') {
            setPaymentSuccess(true);
            setPaymentDetails({
              paymentId: res.order.paymentId || 'pay_confirmed',
              paidAt: res.order.paidAt || res.order.createdAt,
              amount: res.order.totalAmount
            });
            setLoading(false);
            return;
          }

          // Generate or fetch QR code
          await initQrCode(res.order, res.keyId);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load order payment info:', err);
        setError(err.message || 'Unable to retrieve order details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // 2. Generate Real-time UPI QR Code via Razorpay
  const initQrCode = async (currentOrder: Order, fallbackKeyId?: string) => {
    try {
      setGeneratingQr(true);
      const res = await api.createPaymentQr(
        currentOrder.id,
        currentOrder.totalAmount,
        currentOrder.customerName
      );

      setQrData({
        qrId: res.qrId,
        qrImageUrl: res.qrImageUrl,
        paymentAmount: res.paymentAmount,
        razorpayOrderId: res.razorpayOrderId,
        keyId: res.keyId || fallbackKeyId || 'rzp_live_U2yDp78ktOoy4A'
      });
      setPollingStatus('LISTENING');
    } catch (err: any) {
      console.error('Failed to create Razorpay QR Code:', err);
      setError(err.message || 'Failed to generate live Razorpay QR code.');
    } finally {
      setGeneratingQr(false);
    }
  };

  // 3. Real-Time Auto Polling for QR Payment Completion
  useEffect(() => {
    if (!qrData?.qrId || paymentSuccess) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    // Poll every 2500ms
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.checkPaymentStatus(qrData.qrId, orderId);
        if (res.paid) {
          clearInterval(pollIntervalRef.current);
          setPaymentSuccess(true);
          setPollingStatus('CONFIRMED');
          setPaymentDetails({
            paymentId: res.paymentId || 'pay_live_verified',
            paidAt: new Date().toISOString(),
            amount: res.amountReceived || qrData.paymentAmount
          });
          if (res.order) setOrder(res.order);
        }
      } catch (e) {
        // Silent catch during periodic status checks
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [qrData?.qrId, paymentSuccess, orderId]);

  // 4. Server-Sent Events listener for instant webhook/broadcast detection
  useEffect(() => {
    if (paymentSuccess) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/events/stream');
      eventSource.addEventListener('order-paid', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.orderId === orderId) {
            setPaymentSuccess(true);
            setPollingStatus('CONFIRMED');
            setPaymentDetails({
              paymentId: payload.paymentId,
              paidAt: payload.paidAt || new Date().toISOString(),
              amount: payload.amount
            });
          }
        } catch (err) {
          console.error('Error parsing SSE payment event:', err);
        }
      });
    } catch (e) {
      console.warn('SSE stream not available, falling back strictly to polling:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [orderId, paymentSuccess]);

  // 5. Expiration Countdown (15 minutes)
  useEffect(() => {
    if (paymentSuccess) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentSuccess]);

  // 6. Razorpay Standard Checkout SDK Fallback
  const handleOpenStandardCheckout = () => {
    if (!qrData || !order) return;

    if (typeof window.Razorpay === 'undefined') {
      alert('Razorpay Checkout SDK is still loading. Please retry in a moment.');
      return;
    }

    const options = {
      key: qrData.keyId,
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      name: 'Evalipie Marketplace',
      description: `Payment for Order #${order.orderNumber || order.id}`,
      order_id: qrData.razorpayOrderId,
      prefill: {
        name: order.customerName,
        contact: order.customerPhone
      },
      theme: {
        color: '#167D73'
      },
      handler: async (response: any) => {
        try {
          setLoading(true);
          const verification = await api.verifyPayment({
            orderId: order.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          if (verification.paid) {
            setPaymentSuccess(true);
            setPollingStatus('CONFIRMED');
            setPaymentDetails({
              paymentId: response.razorpay_payment_id,
              paidAt: new Date().toISOString(),
              amount: order.totalAmount
            });
          }
        } catch (err: any) {
          alert(`Payment verification failed: ${err.message || 'Signature mismatch'}`);
        } finally {
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleCopyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber || order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading && !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FBF7EF]">
        <div className="w-10 h-10 border-2 border-[#167D73] border-t-transparent animate-spin rounded-full mb-4" />
        <p className="font-mono text-xs uppercase tracking-wider text-[#687385]">
          CONNECTING TO RAZORPAY GATEWAY...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FBF7EF]">
        <div className="max-w-md w-full bg-white border border-[#E5EAF0] p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h2 className="font-sans font-bold text-lg text-[#111827]">Order Payment Unavailable</h2>
          <p className="text-xs text-[#687385] font-sans leading-relaxed">
            {error || 'Unable to load payment credentials for this order.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-[#111827] hover:bg-[#167D73] text-white py-3 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EF] pt-6 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Breadcrumb / Top Meta */}
        <div className="flex items-center justify-between text-xs font-mono text-[#687385]">
          <Link to="/" className="hover:text-[#167D73] flex items-center gap-1.5 transition-colors">
            <span>Marketplace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#111827] font-semibold">Payment Terminal</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#167D73]" />
            <span className="uppercase tracking-wider">Razorpay 256-Bit SSL Secured</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-[#E5EAF0] shadow-sm overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-[#105B55] text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-emerald-200">
                EVALIPIE HYPERLOCAL CHECKOUT
              </p>
              <h1 className="text-lg font-bold tracking-tight mt-0.5">
                {paymentSuccess ? 'Order Payment Verified' : 'Complete Real-Time Payment'}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block">Total Due</span>
              <span className="font-mono text-2xl font-bold tracking-tight">
                ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* SUCCESS RECEIPT STATE */}
          {paymentSuccess ? (
            <div className="p-8 sm:p-10 text-center space-y-6">
              <div className="w-16 h-16 bg-[#E9F7F3] border-2 border-[#167D73] text-[#167D73] flex items-center justify-center mx-auto rounded-full shadow-sm">
                <CheckCircle2 className="w-9 h-9 stroke-[2]" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-mono uppercase font-bold tracking-wider mb-2">
                  TRANSACTION CONFIRMED
                </span>
                <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
                  Payment Received Successfully
                </h2>
                <p className="text-xs text-[#687385] mt-1 max-w-md mx-auto leading-relaxed">
                  Razorpay confirmed the transaction in real time. Physical inventory is locked and your order has been dispatched to the merchant.
                </p>
              </div>

              {/* Receipt Details Box */}
              <div className="bg-[#FBF7EF] border border-[#E5EAF0] p-6 text-left max-w-lg mx-auto space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#E5EAF0] pb-2.5">
                  <span className="text-[#687385]">ORDER NO:</span>
                  <span className="font-bold text-[#111827]">{order.orderNumber || order.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#E5EAF0] pb-2.5">
                  <span className="text-[#687385]">RAZORPAY PAYMENT ID:</span>
                  <span className="font-bold text-[#167D73] text-[11px] break-all">
                    {paymentDetails?.paymentId || order.paymentId || 'pay_live_captured'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#E5EAF0] pb-2.5">
                  <span className="text-[#687385]">MERCHANT:</span>
                  <span className="font-bold text-[#111827]">{order.shopName || 'Evalipie Verified Store'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#E5EAF0] pb-2.5">
                  <span className="text-[#687385]">AMOUNT PAID:</span>
                  <span className="font-bold text-[#111827]">
                    INR {order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#E5EAF0] pb-2.5">
                  <span className="text-[#687385]">TIMESTAMP:</span>
                  <span className="text-[#111827]">
                    {new Date(paymentDetails?.paidAt || order.paidAt || Date.now()).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#687385]">POSTGRESQL STATUS:</span>
                  <span className="text-[#167D73] font-bold uppercase">STOCK ALLOCATED & ROW LOCKED</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
                <Link
                  to="/account"
                  className="flex-1 bg-[#105B55] hover:bg-[#167D73] text-white py-3 px-6 text-center font-mono text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  View in My Orders
                </Link>
                <Link
                  to="/"
                  className="flex-1 bg-white hover:bg-[#FBF7EF] text-[#111827] border border-[#E5EAF0] py-3 px-6 text-center font-mono text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* ACTIVE PAYMENT STATE: UPI QR + STANDARD CHECKOUT */
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Order Meta Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FBF7EF] p-4 border border-[#E5EAF0] text-xs font-mono">
                <div>
                  <span className="text-[#687385] block text-[10px] uppercase">Order ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-[#111827]">{order.orderNumber || order.id}</span>
                    <button 
                      type="button" 
                      onClick={handleCopyOrderId} 
                      className="text-[#687385] hover:text-[#111827] transition-colors"
                      title="Copy Order ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[#687385] block text-[10px] uppercase">Customer</span>
                  <span className="font-bold text-[#111827] block mt-0.5">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-[#687385] block text-[10px] uppercase">Fulfillment</span>
                  <span className="font-bold text-[#167D73] block mt-0.5">LOCAL STORE PICKUP / DELIVERY</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#105B55] text-[11px] font-mono uppercase font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-Time Payment Detection Active</span>
                </div>

                <h3 className="font-sans font-bold text-lg text-[#111827]">
                  Scan QR with any UPI App
                </h3>
                <p className="text-xs text-[#687385] max-w-sm font-sans leading-relaxed">
                  Open Google Pay, PhonePe, Paytm, BHIM, or any banking app to scan and approve. The screen will automatically confirm once paid.
                </p>

                {/* QR Code Card */}
                <div className="relative p-5 bg-white border-2 border-[#167D73] shadow-md inline-block">
                  {generatingQr ? (
                    <div className="w-[220px] h-[220px] flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-2 border-[#167D73] border-t-transparent animate-spin rounded-full" />
                      <span className="text-[11px] font-mono text-[#687385]">Generating Dynamic QR...</span>
                    </div>
                  ) : qrData ? (
                    <div className="flex flex-col items-center">
                      {qrData.qrImageUrl ? (
                        <img 
                          src={qrData.qrImageUrl} 
                          alt="Razorpay Live UPI QR Code" 
                          className="w-[220px] h-[220px] object-contain"
                        />
                      ) : (
                        <QRCodeSVG
                          value={`upi://pay?pa=evalipie@razorpay&pn=EvalipieMarketplace&am=${order.totalAmount}&cu=INR&tn=Order-${order.orderNumber || order.id}`}
                          size={220}
                          level="M"
                          includeMargin={true}
                        />
                      )}
                      
                      {/* Price overlay at bottom */}
                      <div className="mt-2 text-center">
                        <span className="font-mono text-sm font-bold text-[#111827]">
                          ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center text-xs text-red-500 font-mono">
                      Failed to load QR code.
                    </div>
                  )}
                </div>

                {/* Expiration Timer & Refresh */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#687385]">
                  <Clock className="w-3.5 h-3.5 text-[#167D73]" />
                  <span>QR expires in: <b className="text-[#111827]">{formatTimer(timeLeft)}</b></span>
                  <span>·</span>
                  <button 
                    type="button"
                    onClick={() => initQrCode(order)}
                    disabled={generatingQr}
                    className="hover:text-[#167D73] inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${generatingQr ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Supported Payment Logos / Badges */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase text-[#687385] tracking-wider block mb-2">
                    SUPPORTED PAYMENT APPS
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred', 'Amazon Pay'].map((app) => (
                      <span 
                        key={app}
                        className="px-2.5 py-1 bg-[#FBF7EF] border border-[#E5EAF0] text-[#111827] text-[11px] font-medium"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mobile Intent Deep Link */}
                <div className="block sm:hidden w-full pt-2">
                  <a
                    href={`upi://pay?pa=evalipie@razorpay&pn=EvalipieMarketplace&am=${order.totalAmount}&cu=INR&tn=Order-${order.orderNumber || order.id}`}
                    className="w-full bg-[#167D73] text-white py-3 px-4 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open UPI App on This Phone
                  </a>
                </div>
              </div>

              {/* Divider with "OR" */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5EAF0]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-mono">
                  <span className="bg-white px-3 text-[#687385]">OR PAY VIA CARDS / NETBANKING</span>
                </div>
              </div>

              {/* Standard Razorpay Checkout Button */}
              <div className="max-w-md mx-auto text-center space-y-3">
                <button
                  type="button"
                  onClick={handleOpenStandardCheckout}
                  disabled={!qrData}
                  className="w-full bg-[#111827] hover:bg-[#105B55] text-white py-3.5 px-6 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay via Credit / Debit Card / Netbanking</span>
                </button>
                <p className="text-[11px] text-[#687385] font-sans">
                  Supports Visa, Mastercard, RuPay, Netbanking across all Indian banks, and Wallets.
                </p>
              </div>

              {/* Trust Footer */}
              <div className="border-t border-[#E5EAF0] pt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#687385] gap-2">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#167D73]" />
                  <span>Merchant: <b>{order.shopName || 'Central Hub'}</b></span>
                </div>
                <div>
                  <span>Stock reserved in PostgreSQL FOR UPDATE</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Help Note */}
        <p className="text-center text-xs text-[#687385] font-sans">
          Having trouble with payment? Contact Evalipie Support at support@evalipie.in or call 1800-EVALIPIE.
        </p>

      </div>
    </div>
  );
};

export default PaymentPage;
