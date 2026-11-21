import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Trash2, ShoppingBag, ShieldCheck, AlertCircle, CheckCircle2, 
  ArrowRight, QrCode, Tag, Check, MapPin, Plus 
} from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { UserAddress, CouponItem } from '../../../../shared/types.js';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, closeCart, totalAmount } = useCart();
  const { user } = useAuth();

  // Customer Delivery Info
  const [customerName, setCustomerName] = useState('Dominik Doudny');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Prestige Palms, 100ft Road, Indiranagar, Bengaluru');
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);

  // Coupon Engine state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalTotal: number;
    coupon: CouponItem;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Checkout submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [concurrencyError, setConcurrencyError] = useState<any>(null);

  // Sync user profile if available
  useEffect(() => {
    if (user) {
      setCustomerName(user.fullName);
      api.getAddresses(user.id).then(addrs => {
        if (Array.isArray(addrs) && addrs.length > 0) {
          setSavedAddresses(addrs);
          const def = addrs.find(a => a.isDefault) || addrs[0];
          setDeliveryAddress(`${def.line1}, ${def.city} - ${def.postalCode}`);
          setCustomerPhone(def.phone);
        }
      }).catch(() => {});
    }
  }, [user]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await api.validateCoupon(code, totalAmount);
      setAppliedCoupon(res);
      setCouponCode(code);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or ineligible coupon code.');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const finalPayableAmount = appliedCoupon ? appliedCoupon.finalTotal : totalAmount;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setConcurrencyError(null);

    try {
      const orderPayload = {
        items: items.map(item => ({
          listingId: item.listingId,
          storeId: item.storeId || 'store-apex-indira',
          quantity: item.quantity
        })),
        customerName: customerName || 'Valued Customer',
        customerPhone: customerPhone || '+91 9988776655',
        deliveryAddress: deliveryAddress || 'Bengaluru Local Dispatch Hub',
        deliveryCity: 'Bengaluru',
        idempotencyKey: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      };

      const res = await api.createOrder(orderPayload);
      setOrderResult(res);
      
      // Clear cart and redirect directly to verified Razorpay UPI QR payment page
      clearCart();
      setTimeout(() => {
        closeCart();
        navigate(`/payment/${res.id}`);
      }, 700);

    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err.status === 409 || err.data?.code === 'STOCK_EXHAUSTED') {
        setConcurrencyError(err.data || { message: 'HTTP 409: Inventory stock was locked or claimed by a concurrent checkout.' });
      } else {
        alert(err.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      
      {/* Slide-over Drawer Panel */}
      <div 
        className="w-full max-w-md bg-white border-l border-gray-200 shadow-2xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-250 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#FBF7EF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#105B55]" />
            <h2 className="font-bold text-sm tracking-wide uppercase text-gray-900">
              Shopping Cart
            </h2>
            <span className="text-[11px] bg-[#105B55] text-white px-2 py-0.5 rounded-full font-mono font-bold">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <button 
            type="button"
            onClick={() => { closeCart(); setOrderResult(null); setConcurrencyError(null); }}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {orderResult ? (
            /* Order Confirmed Screen */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto rounded-full">
                <CheckCircle2 className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-gray-900">
                Order Reserved!
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Stock atomically locked in the database. Transferring directly to Razorpay UPI QR payment...
              </p>
              
              <div className="bg-[#FBF7EF] p-4 border border-[#E5EAF0] text-left text-xs space-y-2 rounded-xl">
                <div><span className="text-gray-500">Order ID:</span> <b className="font-mono text-gray-900">{orderResult.id}</b></div>
                <div><span className="text-gray-500">Total Payable:</span> <b className="font-mono text-emerald-800">₹{orderResult.totalAmount?.toLocaleString('en-IN')}</b></div>
                <div><span className="text-gray-500">Status:</span> <span className="font-bold text-amber-700 uppercase">PENDING PAYMENT</span></div>
              </div>

              <button
                type="button"
                onClick={() => { closeCart(); navigate(`/payment/${orderResult.id}`); }}
                className="w-full bg-[#105B55] hover:bg-[#0c4742] text-white py-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Open Instant UPI QR Payment</span>
              </button>
            </div>
          ) : concurrencyError ? (
            /* Concurrency Conflict Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto rounded-full">
                <AlertCircle className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-lg text-red-700">
                Inventory Stock Exhausted
              </h3>
              <div className="p-3 bg-red-50 border border-red-200 text-left text-xs text-red-800 space-y-1 rounded-lg">
                <p className="font-bold">Concurrency Lock Safeguard</p>
                <p className="text-[11px] leading-relaxed">
                  Another customer secured the final unit milliseconds before this checkout. The concurrency engine prevented overselling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConcurrencyError(null)}
                className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg text-xs font-semibold"
              >
                Return to Cart
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto stroke-[1.2]" />
              <p className="text-sm font-semibold text-gray-700">Your cart is empty</p>
              <p className="text-xs text-gray-400">Discover items from our 180-product catalogue.</p>
              <button
                type="button"
                onClick={() => { closeCart(); navigate('/products'); }}
                className="mt-4 px-5 py-2 rounded-lg bg-[#105B55] text-white text-xs font-semibold hover:bg-[#0c4742] transition-colors"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.listingId} className="py-3.5 flex gap-3.5">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-18 h-18 object-cover rounded-lg border border-gray-200 bg-[#FBF7EF] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-gray-900 line-clamp-2">
                            {item.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.listingId)}
                            className="text-gray-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#105B55] font-medium mt-0.5">
                          {item.shopName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 rounded-l transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-mono font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 rounded-r transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── COUPON PROMOTION CODE ENGINE ─────────────────────── */}
              <div className="p-3.5 bg-[#FBF7EF] border border-[#E5EAF0] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#105B55]" />
                    Promotional Coupon
                  </span>
                  {appliedCoupon && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ₹{appliedCoupon.discountAmount} OFF APPLIED
                    </span>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <div>
                      <span className="font-mono font-bold text-emerald-800">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-emerald-600 mt-0.5">{appliedCoupon.coupon.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE (e.g. WELCOME100)"
                        className="flex-1 px-3 py-1.5 text-xs font-mono uppercase bg-white border border-gray-300 rounded-lg outline-none focus:border-[#105B55]"
                      />
                      <button
                        type="button"
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        onClick={() => handleApplyCoupon()}
                        className="px-3.5 py-1.5 bg-[#105B55] hover:bg-[#0c4742] text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isValidatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>

                    {/* Quick Coupon Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['WELCOME100', 'EVALIPIE20', 'SUPERFEST'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleApplyCoupon(c)}
                          className="px-2 py-0.5 bg-white border border-gray-200 hover:border-[#105B55] text-[10px] font-mono font-semibold text-gray-700 rounded transition-colors cursor-pointer"
                        >
                          +{c}
                        </button>
                      ))}
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* ── DELIVERY DETAILS ─────────────────────────────────── */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#105B55]" />
                    Delivery Destination
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">EXPRESS 2-HR</span>
                </div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone Number for Delivery SMS"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none font-mono"
                />
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Full Delivery Address"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {items.length > 0 && !orderResult && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#FBF7EF] space-y-3">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-mono font-semibold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Local Express Delivery</span>
                <span className="text-emerald-700 font-semibold uppercase text-[11px]">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm sm:text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="font-mono text-[#105B55]">₹{finalPayableAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-[#105B55] hover:bg-[#0c4742] text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{isSubmitting ? 'RESERVING INVENTORY...' : 'PROCEED TO SECURE UPI PAYMENT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-mono text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Powered by Live Razorpay · Dynamic UPI QR</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
