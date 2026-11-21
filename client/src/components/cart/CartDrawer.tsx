import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { api } from '../../services/api.js';

export const CartDrawer: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, closeCart, totalAmount } = useCart();
  const [customerName, setCustomerName] = useState('Ananya Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 99887 76655');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 302, Palm Heights, Indiranagar, Bengaluru');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [concurrencyError, setConcurrencyError] = useState<any>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setConcurrencyError(null);

    const primaryItem = items[0]; // Initial phase supports 1 merchant checkout

    try {
      const res = await api.reserveCheckout({
        listingId: primaryItem.listingId,
        storeId: primaryItem.storeId,
        quantity: primaryItem.quantity,
        customerName,
        customerPhone,
        deliveryAddress
      });

      setOrderResult(res.order);
      clearCart();
    } catch (err: any) {
      if (err.status === 409 || err.data?.code === 'STOCK_EXHAUSTED') {
        setConcurrencyError(err.data || { message: 'Stock was just claimed by another buyer.' });
      } else {
        alert(err.message || 'Checkout failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#167D73]" />
              <h2 className="font-extrabold text-gray-900 text-lg">Your Cart</h2>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                {items.length}
              </span>
            </div>
            <button 
              onClick={() => { closeCart(); setOrderResult(null); setConcurrencyError(null); }}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {orderResult ? (
              /* Success Screen */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Order Confirmed!</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Stock was atomically reserved in PostgreSQL and event published to Aiven Kafka.
                </p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left text-xs space-y-1.5">
                  <div><b>Order Number:</b> {orderResult.orderNumber}</div>
                  <div><b>Merchant:</b> {orderResult.shopName}</div>
                  <div><b>Total Amount:</b> ₹{orderResult.totalAmount.toLocaleString('en-IN')}</div>
                  <div><b>Status:</b> <span className="text-emerald-700 font-bold uppercase">{orderResult.status}</span></div>
                </div>
                <button
                  onClick={() => { closeCart(); setOrderResult(null); }}
                  className="w-full bg-[#167D73] text-white py-3 rounded-xl font-bold text-sm shadow hover:bg-[#105B55] transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : concurrencyError ? (
              /* Concurrency Collision 409 Screen */
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Stock Exhausted!</h3>
                <p className="text-xs text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                  {concurrencyError.message || 'The last remaining unit of this item was just claimed by another customer.'}
                </p>
                <div className="text-left text-xs text-gray-600 space-y-2">
                  <p className="font-bold text-gray-800">Alternative Sellers with Stock in Bengaluru:</p>
                  {(concurrencyError.alternativeSellers || []).map((alt: any) => (
                    <div key={alt.listingId} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900">{alt.merchant.shopName}</div>
                        <div className="text-[11px] text-gray-400">{alt.store.name} ({alt.store.distanceKm} km away)</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-[#111827]">₹{alt.sellingPrice}</div>
                        <span className="text-[10px] text-emerald-700 font-bold">{alt.availableQuantity} in stock</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setConcurrencyError(null)}
                  className="w-full bg-gray-800 text-white py-2.5 rounded-xl font-bold text-xs"
                >
                  Back to Cart
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center space-y-3 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-sm font-semibold">Your shopping cart is empty.</p>
              </div>
            ) : (
              /* Cart Items List */
              <>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.listingId} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 items-center">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-14 h-14 object-cover rounded-lg border bg-white" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-[#167D73] uppercase">{item.shopName}</div>
                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                        <div className="text-xs font-extrabold text-gray-900 mt-1">₹{item.price.toLocaleString('en-IN')}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden text-xs">
                          <button 
                            onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100 font-bold"
                          >-</button>
                          <span className="px-2 font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100 font-bold"
                          >+</button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.listingId)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Information Form */}
                <div className="pt-4 border-t border-gray-200 space-y-3 text-xs">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Delivery Coordinates (Bengaluru)</h4>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Customer Full Name</label>
                    <input 
                      type="text" 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[#167D73]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={customerPhone} 
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[#167D73]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Delivery Address</label>
                    <textarea 
                      rows={2}
                      value={deliveryAddress} 
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[#167D73]"
                    />
                  </div>
                </div>

                <div className="bg-[#E9F7F3] p-3 rounded-xl border border-[#167D73]/20 flex items-center gap-2 text-[11px] text-[#105B55] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#167D73] shrink-0" />
                  <span>Protected by PostgreSQL atomic row lock (`SELECT FOR UPDATE`). Zero overselling guaranteed.</span>
                </div>
              </>
            )}
          </div>

          {/* Footer & Order Button */}
          {!orderResult && items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-semibold">Order Subtotal</span>
                <span className="text-xl font-black text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleCheckout}
                className="w-full bg-[#167D73] hover:bg-[#105B55] disabled:bg-gray-400 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <span>Reserving Stock in PostgreSQL...</span>
                ) : (
                  <>
                    <span>Confirm Order (Reserve Stock)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
