import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, QrCode } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { api } from '../../services/api.js';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
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

    const primaryItem = items[0];

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
      // Trigger pipeline pulse
      window.dispatchEvent(new CustomEvent('order-placed-event'));
      clearCart();
      closeCart();
      navigate(`/payment/${res.order.id}`);
    } catch (err: any) {
      if (err.status === 409 || err.data?.code === 'STOCK_EXHAUSTED') {
        setConcurrencyError(err.data || { message: 'HTTP 409 Conflict: Stock was just claimed by a concurrent buyer.' });
      } else {
        alert(err.message || 'Checkout failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#111111]/70 backdrop-blur-xs flex justify-end">
      
      {/* Crisp Architectural Drawer */}
      <div className="w-full max-w-md bg-[#FFFFFF] border-l border-[#111111] shadow-architectural h-full flex flex-col justify-between rounded-[0px] animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E4E2DA] bg-[#F6F5F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#111111] stroke-[1.5]" />
            <h2 className="font-display font-bold text-sm tracking-wider uppercase text-[#111111]">
              SHOPPING CART
            </h2>
            <span className="text-[10px] bg-[#111111] text-white px-1.5 py-0.5 font-mono">
              {items.length} ITEMS
            </span>
          </div>
          <button 
            type="button"
            onClick={() => { closeCart(); setOrderResult(null); setConcurrencyError(null); }}
            className="text-[#5A5852] hover:text-[#111111] p-1 transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orderResult ? (
            /* Order Confirmed Screen */
            <div className="py-8 text-center space-y-4 font-mono">
              <div className="w-12 h-12 bg-[#F6F5F0] border border-[#111111] text-[#111111] flex items-center justify-center mx-auto rounded-[0px]">
                <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#111111] uppercase tracking-wide">
                ORDER RESERVED
              </h3>
              <p className="text-xs text-[#5A5852] max-w-xs mx-auto font-sans leading-relaxed">
                Stock atomically locked in PostgreSQL and order published to Aiven Kafka event log.
              </p>
              
              <div className="bg-[#F6F5F0] p-4 border border-[#E4E2DA] text-left text-xs space-y-2 rounded-[0px]">
                <div><span className="text-[#5A5852]">ORDER NO:</span> <b>{orderResult.orderNumber}</b></div>
                <div><span className="text-[#5A5852]">MERCHANT:</span> <b>{orderResult.shopName || 'Central Hub'}</b></div>
                <div><span className="text-[#5A5852]">TOTAL:</span> <b>INR {orderResult.totalAmount.toLocaleString('en-IN')}</b></div>
                <div><span className="text-[#5A5852]">STATUS:</span> <span className="text-[#111111] font-bold uppercase">{orderResult.status}</span></div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => { closeCart(); navigate(`/payment/${orderResult.id}`); }}
                  className="w-full bg-[#105B55] hover:bg-[#167D73] text-white py-3 rounded-[0px] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>PROCEED TO UPI QR PAYMENT</span>
                </button>
                <button
                  type="button"
                  onClick={() => { closeCart(); setOrderResult(null); }}
                  className="w-full bg-white hover:bg-[#F6F5F0] text-[#111111] border border-[#E4E2DA] py-2.5 rounded-[0px] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  RETURN TO CATALOG
                </button>
              </div>
            </div>
          ) : concurrencyError ? (
            /* Stock Exhaustion 409 Collision Screen */
            <div className="py-6 text-center space-y-4 font-mono">
              <div className="w-12 h-12 bg-[#F8EDE8] border border-[#B84A27] text-[#B84A27] flex items-center justify-center mx-auto rounded-[0px]">
                <AlertCircle className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#B84A27] uppercase tracking-wide">
                HTTP 409: STOCK EXHAUSTED
              </h3>
              <div className="p-3 bg-[#F8EDE8] border border-[#B84A27] text-left text-xs text-[#933B1F] space-y-1 rounded-[0px]">
                <p className="font-bold uppercase">CONCURRENCY CONFLICT DETECTED</p>
                <p className="font-sans text-[11px] leading-relaxed">
                  Another shopper reserved the final unit milliseconds before this transaction. PostgreSQL FOR UPDATE locked the row and rolled back this order to prevent overselling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConcurrencyError(null)}
                className="w-full bg-[#111111] hover:bg-[#B84A27] text-white py-2.5 rounded-[0px] font-mono text-xs uppercase tracking-wider transition-colors"
              >
                TRY ALTERNATIVE STORE
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3 font-mono">
              <ShoppingBag className="w-8 h-8 text-[#5A5852] mx-auto stroke-[1.5]" />
              <p className="text-xs uppercase text-[#5A5852] tracking-wider">YOUR CART IS CURRENTLY EMPTY</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Item Cards */}
              <div className="divide-y divide-[#E4E2DA]">
                {items.map((item) => (
                  <div key={item.listingId} className="py-3 flex gap-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-16 h-16 object-cover border border-[#E4E2DA] rounded-[0px] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#111111] line-clamp-2 font-sans">
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.listingId)}
                          className="text-[#5A5852] hover:text-[#B84A27] p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>

                      <p className="text-[10px] font-mono text-[#5A5852] uppercase">
                        STORE: {item.shopName}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          INR {(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-[#E4E2DA] rounded-[0px]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 text-xs font-mono text-[#5A5852] hover:text-[#111111] hover:bg-[#F6F5F0]"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-[#111111]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs font-mono text-[#5A5852] hover:text-[#111111] hover:bg-[#F6F5F0]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details Form */}
              <div className="p-3 bg-[#F6F5F0] border border-[#E4E2DA] space-y-2 rounded-[0px] text-xs font-mono">
                <span className="font-bold text-[#111111] text-[10px] uppercase block tracking-wider">
                  DISPATCH RECIPIENT DETAILS
                </span>
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Recipient Full Name"
                    className="w-full bg-[#FFFFFF] border border-[#E4E2DA] p-2 text-xs font-mono rounded-[0px] outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Mobile Phone"
                    className="w-full bg-[#FFFFFF] border border-[#E4E2DA] p-2 text-xs font-mono rounded-[0px] outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery Street Address"
                    className="w-full bg-[#FFFFFF] border border-[#E4E2DA] p-2 text-xs font-mono rounded-[0px] outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && !orderResult && !concurrencyError && (
          <div className="p-4 border-t border-[#E4E2DA] bg-[#F6F5F0] space-y-3 font-mono">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#5A5852]">
                <span>SUBTOTAL:</span>
                <span>INR {totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#5A5852]">
                <span>LOCAL DISPATCH:</span>
                <span className="text-[#111111] font-bold">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between text-[#111111] text-sm font-bold pt-1 border-t border-[#E4E2DA]">
                <span>TOTAL PAYABLE:</span>
                <span>INR {totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full h-12 bg-[#111111] hover:bg-[#B84A27] text-white text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 rounded-[0px] transition-colors shadow-architectural cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'ACID LOCKING ROW...' : 'ATOMIC CHECKOUT'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#5A5852]">
              <ShieldCheck className="w-3 h-3 text-[#111111] stroke-[1.5]" />
              <span>AIVEN POSTGRESQL FOR UPDATE ROW-LEVEL LOCK PROTECTED</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
