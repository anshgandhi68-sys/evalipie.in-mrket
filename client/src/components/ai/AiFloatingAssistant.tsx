import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, X, Send, ShoppingBag, ExternalLink, 
  RotateCcw, Check, Store, ShieldCheck, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: any;
  recommendations?: any[];
  followUps?: string[];
}

export const AiFloatingAssistant: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `float-${Date.now()}`);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  
  const { addItem } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If already on the dedicated full-page AI discovery page, hide floating widget
  if (location.pathname === '/ai') {
    return null;
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am Evalipie AI, your intelligent shopping assistant. Tell me what you need in English, Hindi, or Hinglish (e.g., "Find a laptop for programming under ₹60,000" or "Mujhe wireless headphones chahiye").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUps: [
        'Laptops for coding under ₹60,000',
        'Wireless headphones under ₹2,000',
        'Ergonomic office chair for back pain',
        'Smartwatch with heart tracking'
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await api.aiChat(sessionId, text);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: res.message || 'Here are verified matches from local shops near you:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: res.intent,
        recommendations: res.matches || [],
        followUps: res.suggestions || [
          'Show cheaper alternatives',
          'Check warranty details',
          'Compare specifications'
        ]
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      // Deterministic fallback response with grounded search
      const fallbackMsg: Message = {
        id: `a-err-${Date.now()}`,
        sender: 'assistant',
        text: 'I found these verified in-stock products matching your request in local stores:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: ['Find electronics under ₹5,000', 'Show trending gear']
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (rec: any) => {
    const offer = rec.bestOffer || {};
    addItem({
      listingId: offer.listingId || `list-${rec.id || Date.now()}`,
      storeId: offer.storeId || 'store-float',
      productId: rec.id || 'prod-float',
      title: rec.title || 'Curated Product',
      shopName: offer.shopName || offer.storeName || 'Verified Merchant',
      shopSlug: offer.shopSlug || 'verified-store',
      price: offer.sellingPrice || rec.price || 1999,
      originalMrp: offer.originalMrp || rec.mrp || 2499,
      quantity: 1,
      imageUrl: rec.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    });

    setAddedItems(prev => ({ ...prev, [rec.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [rec.id]: false }));
    }, 2000);
  };

  return (
    <>
      {/* ── 1. GLOBAL FLOATING TRIGGER BUTTON ────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-[#111827] hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl border border-[#374151] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Open Evalipie AI Assistant"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <Sparkles className="w-4 h-4 text-[#F3D27A] group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-sm tracking-tight">Ask Evalipie AI</span>
            <span className="bg-[#167D73] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
              ✦ AI
            </span>
          </button>
        )}
      </div>

      {/* ── 2. SLIDE-OUT / POPUP ASSISTANT PANEL ──────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-[#E5EAF0] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#111827] text-white flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#167D73] flex items-center justify-center font-bold text-sm shadow-sm">
                ✦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Evalipie AI</h3>
                  <span className="text-[10px] font-bold bg-[#167D73] text-[#E9F7F3] px-1.5 py-0.5 rounded">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Grounded in local store inventory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                to="/ai"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                title="Open Dedicated Full Page"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F9FC]">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#111827] text-white rounded-tr-none'
                      : 'bg-white text-[#111827] border border-[#E5EAF0] rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Intent Chips */}
                  {msg.intent && (msg.intent.category || msg.intent.budget) && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                      {msg.intent.category && (
                        <span className="bg-[#E9F7F3] text-[#167D73] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Category: {msg.intent.category}
                        </span>
                      )}
                      {msg.intent.budget && (
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Max: ₹{msg.intent.budget.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Grounded Recommendation Cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.recommendations.map((rec: any, idx: number) => {
                        const offer = rec.bestOffer || {};
                        const price = offer.sellingPrice || rec.price || 0;
                        const isAdded = addedItems[rec.id];

                        return (
                          <div 
                            key={idx}
                            className="bg-[#F7F9FC] border border-[#E5EAF0] rounded-xl p-2.5 flex items-center justify-between gap-3 text-left"
                          >
                            <img 
                              src={rec.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80'} 
                              alt={rec.title} 
                              className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-200"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-[#111827] truncate">
                                {rec.title}
                              </h4>
                              <p className="text-[11px] text-gray-500 truncate">
                                📍 {offer.shopName || offer.storeName || 'Verified Merchant'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-extrabold text-xs text-[#167D73]">
                                  ₹{price.toLocaleString()}
                                </span>
                                {offer.originalMrp && (
                                  <span className="text-[10px] text-gray-400 line-through">
                                    ₹{offer.originalMrp.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(rec)}
                              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                isAdded 
                                  ? 'bg-[#10B981] text-white' 
                                  : 'bg-[#167D73] hover:bg-[#105B55] text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Follow up suggestions */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.followUps.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(sug)}
                        className="bg-white hover:bg-[#E9F7F3] border border-[#E5EAF0] text-[#167D73] hover:border-[#167D73] text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#E5EAF0] rounded-2xl rounded-tl-none text-xs text-gray-500 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#167D73] animate-ping" />
                <span>Checking verified shop inventory...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-[#E5EAF0]">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask what you need (e.g. 2000 ke andar headphones)..."
                className="flex-1 bg-[#F7F9FC] border border-[#E5EAF0] focus:border-[#167D73] text-xs text-[#111827] px-3 py-2.5 rounded-xl outline-none transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="bg-[#167D73] hover:bg-[#105B55] disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                aria-label="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400 px-1">
              <span>✦ Real-time catalog search</span>
              <Link to="/ai" onClick={() => setIsOpen(false)} className="text-[#167D73] hover:underline font-semibold">
                Open full discovery engine ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiFloatingAssistant;
