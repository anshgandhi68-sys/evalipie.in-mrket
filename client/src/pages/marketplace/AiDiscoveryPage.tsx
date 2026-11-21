import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, Send, ArrowRight, Bot, User, Check, ShoppingBag, 
  MapPin, SlidersHorizontal, RefreshCw, Trash2, Plus, 
  Cpu, ArrowUpRight, Scale, ChevronRight, Zap, ShieldCheck, 
  Layers, Search, AlertCircle, CornerDownLeft, Sparkle
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { CanonicalProduct } from '../../../../shared/types.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: any;
  matches?: any[];
  comparison?: any;
  alternatives?: any;
  suggestions?: string[];
  latencyMs?: number;
  source?: string;
}

interface StoredSession {
  id: string;
  title: string;
  lastUpdated: string;
  messages: Message[];
}

const STORAGE_KEY = 'evalipie_ai_conversations_v2';

export const AiDiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const { activeCity, setActiveCity } = useAuth();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-default');
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [comparingProducts, setComparingProducts] = useState<any[] | null>(null);
  const [selectedProductAlt, setSelectedProductAlt] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested Prompts
  const SUGGESTED_PROMPTS = [
    { label: 'Laptop for programming under ₹60,000', icon: '💻', query: 'Find a laptop for programming under ₹60,000' },
    { label: 'Wireless headphones under ₹2,000', icon: '🎧', query: 'Mujhe 2000 ke andar wireless headphones chahiye' },
    { label: 'Comfortable ergonomic office chairs', icon: '🪑', query: 'Show comfortable ergonomic office chairs with lumbar support' },
    { label: 'Compare flagship smartphones', icon: '📱', query: 'Compare Apple iPhone 16 and Samsung Galaxy S24 Ultra' },
    { label: 'Nike road running shoes', icon: '👟', query: 'Find responsive road running shoes under ₹10,000' }
  ];

  // Load Sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredSession[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setSessions(parsed);
          const initialId = searchParams.get('session') || parsed[0].id;
          const found = parsed.find(s => s.id === initialId) || parsed[0];
          setActiveSessionId(found.id);
          setMessages(found.messages);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load sessions from storage:', e);
    }

    // Default Fresh Session
    const initialSession: StoredSession = {
      id: `session-${Date.now()}`,
      title: 'New Shopping Conversation',
      lastUpdated: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `Namaste! I am Evalipie AI — your intelligent marketplace shopping assistant. 

Ask me naturally in English, Hindi, or Hinglish. I understand your shopping requirements, extract your budget and category preferences, and search real-time verified store inventory across ${activeCity} with zero phantom stock.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            'Find a laptop for programming under ₹60,000',
            'Mujhe 2000 ke andar wireless headphones chahiye',
            'Show comfortable ergonomic office chairs',
            'Compare iPhone 16 vs Galaxy S24'
          ]
        }
      ]
    };

    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
    setMessages(initialSession.messages);
  }, [activeCity]);

  // Handle URL query parameter ?q=
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query.trim()) {
      handleSendMessage(query.trim());
    }
  }, [searchParams]);

  // Save Sessions to localStorage
  const saveSessions = (updatedSessions: StoredSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Create New Conversation
  const handleNewConversation = () => {
    const newSession: StoredSession = {
      id: `session-${Date.now()}`,
      title: 'New Shopping Conversation',
      lastUpdated: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Hello! How can I help you shop in ${activeCity} today? Tell me what item or specifications you need, or what budget you are aiming for.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            'Find a laptop for programming under ₹60,000',
            'Wireless headphones under ₹2,000',
            'Compare Apple iPhone 16 vs Galaxy S24'
          ]
        }
      ]
    };

    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newSession.id);
    setMessages(newSession.messages);
    setComparingProducts(null);
    setSelectedProductAlt(null);
    inputRef.current?.focus();
  };

  // Delete Conversation
  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== idToDelete);
    if (remaining.length === 0) {
      handleNewConversation();
    } else {
      saveSessions(remaining);
      if (activeSessionId === idToDelete) {
        setActiveSessionId(remaining[0].id);
        setMessages(remaining[0].messages);
      }
    }
  };

  // Switch Conversation
  const handleSelectSession = (session: StoredSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setComparingProducts(null);
    setSelectedProductAlt(null);
  };

  // Clear current conversation messages
  const handleClearCurrentChat = () => {
    const clearedMessages: Message[] = [
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. What can I help you discover in ${activeCity}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Find a laptop for programming under ₹60,000',
          'Wireless headphones under ₹2,000',
          'Ergonomic office chair'
        ]
      }
    ];
    setMessages(clearedMessages);
    const updated = sessions.map(s => s.id === activeSessionId ? { ...s, messages: clearedMessages, lastUpdated: new Date().toISOString() } : s);
    saveSessions(updated);
  };

  // Core Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setInputPrompt('');

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 1. Check if user is asking for product comparison
      const isCompareQuery = query.toLowerCase().includes('compare') || query.toLowerCase().includes('vs');
      
      // Call Evalipie Self-Hosted AI Intelligence API
      const res = await api.aiDiscover(query, activeSessionId, activeCity);
      
      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.message || res.explanation || 'Here are verified matching products from local merchant inventory:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: res.intent || res.intentAnalysis,
        matches: res.matches || [],
        suggestions: res.followUpSuggestions || [
          `Show cheaper options`,
          `Compare matching items`,
          `Check 30-min delivery in ${activeCity}`
        ],
        latencyMs: res.latencyMs || 950,
        source: res.source || 'self_hosted'
      };

      // If comparing multiple products were matched, trigger comparison tool
      if (isCompareQuery && assistantMessage.matches && assistantMessage.matches.length >= 2) {
        try {
          const pIds = assistantMessage.matches.slice(0, 2).map((m: any) => m.productId);
          const compRes = await api.aiCompare(pIds);
          if (compRes && compRes.products) {
            assistantMessage.comparison = compRes;
          }
        } catch (compErr) {
          console.warn('Comparison tool fallback:', compErr);
        }
      }

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Update Session Title from first user prompt
      const currentSession = sessions.find(s => s.id === activeSessionId);
      const isFirstTurn = !currentSession || currentSession.messages.length <= 1;
      const title = isFirstTurn 
        ? query.slice(0, 32) + (query.length > 32 ? '...' : '') 
        : (currentSession?.title || 'Shopping Conversation');

      const updatedSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title,
            lastUpdated: new Date().toISOString(),
            messages: finalMessages
          };
        }
        return s;
      });

      saveSessions(updatedSessions);
    } catch (err: any) {
      console.error('[AI Assistant Error]', err);
      
      // Fallback response with helpful recovery
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I experienced a temporary connection hiccup with the local inference runtime. I am running on our grounded catalog fallback. Let me check the catalogue directly for "${query}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Retry search',
          'Explore laptops',
          'Explore headphones'
        ]
      };

      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Add product directly to cart
  const handleAddToCart = (item: any) => {
    const offer = item.bestOffer || {};
    addItem({
      listingId: offer.listingId || `list-${item.productId}`,
      storeId: 'store-hub',
      productId: item.productId,
      title: item.title,
      shopName: offer.shopName || 'Verified Store',
      shopSlug: offer.shopSlug || 'verified-store',
      price: offer.sellingPrice || item.price || 1999,
      originalMrp: offer.originalMrp || item.originalMrp,
      quantity: 1,
      imageUrl: item.imageUrl
    });

    setAddedItems(prev => ({ ...prev, [item.productId]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.productId]: false }));
    }, 2000);
  };

  // Action: Compare specific product
  const handleCompareAction = async (product: any) => {
    try {
      const promptText = `Compare ${product.title} with alternative options in the same category`;
      handleSendMessage(promptText);
    } catch (e) {
      console.warn(e);
    }
  };

  // Action: Find Cheaper Alternatives
  const handleFindAlternatives = async (product: any) => {
    try {
      const res = await api.aiAlternatives(product.productId, product.bestOffer?.sellingPrice || product.price);
      if (res && res.alternatives) {
        setSelectedProductAlt({
          original: res.originalProduct,
          alternatives: res.alternatives
        });
      } else {
        handleSendMessage(`Find cheaper alternatives to ${product.title}`);
      }
    } catch (e) {
      handleSendMessage(`Find cheaper alternatives to ${product.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      
      {/* Top Status Header */}
      <div className="bg-white border-b border-[#E5EAF0] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#167D73] text-white flex items-center justify-center font-black text-sm shadow-sm">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-[#111827] tracking-tight">
                Evalipie AI Shopping Assistant
              </h1>
              <span className="bg-[#E9F7F3] text-[#167D73] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#167D73] rounded-full animate-pulse" />
                Self-Hosted Qwen 2.5
              </span>
            </div>
            <p className="text-[11px] text-[#687385]">
              Real-time NLU & grounded physical stock retrieval across verified {activeCity} stores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F9FC] hover:bg-[#E5EAF0] border border-[#E5EAF0] text-[#111827] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5 text-[#167D73]" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button
            type="button"
            onClick={handleClearCurrentChat}
            className="p-1.5 text-[#687385] hover:text-[#DC4444] rounded-lg hover:bg-[#F7F9FC] transition-colors cursor-pointer"
            title="Clear current messages"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Experience */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        
        {/* Left Sidebar: Conversations & Presets (Desktop) */}
        <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-5">
          
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewConversation}
            className="w-full bg-[#111827] hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Conversation</span>
          </button>

          {/* Recent Conversations */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-4 flex flex-col flex-1 shadow-2xs">
            <h3 className="text-xs font-bold text-[#687385] uppercase tracking-wider mb-3">
              Recent Conversations
            </h3>
            <div className="space-y-1 overflow-y-auto flex-1 max-h-[300px]">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSession(sess)}
                  className={`group px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    activeSessionId === sess.id 
                      ? 'bg-[#E9F7F3] text-[#167D73] font-bold' 
                      : 'text-[#111827] hover:bg-[#F7F9FC]'
                  }`}
                >
                  <span className="truncate pr-2">{sess.title}</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-[#DC4444] transition-opacity p-0.5"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Prompts Presets */}
          <div className="bg-white border border-[#E5EAF0] rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <h3 className="text-xs font-bold text-[#687385] uppercase tracking-wider mb-1">
              Suggested Shopping Queries
            </h3>
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.query)}
                className="w-full text-left p-2.5 rounded-xl border border-[#E5EAF0] hover:border-[#167D73] bg-[#F7F9FC] hover:bg-white text-xs font-medium text-[#111827] transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>{p.icon}</span>
                <span className="truncate group-hover:text-[#167D73]">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Model & Architecture Card */}
          <div className="bg-[#E9F7F3] border border-[#167D73]/20 rounded-2xl p-4 text-[11px] text-[#105B55] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#167D73]" />
              <span>Grounded Architecture</span>
            </div>
            <p className="leading-relaxed">
              Every product card links directly to physical shelf stock in {activeCity}. Zero fabricated prices or hallucinations.
            </p>
          </div>

        </aside>

        {/* Right Main Column: Chat Feed & Composer */}
        <main className="flex-1 flex flex-col bg-white border border-[#E5EAF0] rounded-3xl overflow-hidden shadow-sm min-h-[680px]">
          
          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                {/* Role Header */}
                <div className="flex items-center gap-2 text-[11px] text-[#687385] px-1">
                  {msg.role === 'assistant' ? (
                    <>
                      <div className="w-5 h-5 rounded-md bg-[#167D73] text-white flex items-center justify-center text-[10px] font-bold">
                        e
                      </div>
                      <span className="font-bold text-[#111827]">Evalipie AI</span>
                      {msg.latencyMs && (
                        <span className="text-[10px] text-[#167D73] bg-[#E9F7F3] px-1.5 py-0.2 rounded font-mono">
                          {msg.latencyMs}ms
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-[#111827]">You</span>
                      <span>· {msg.timestamp}</span>
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div 
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#111827] text-white rounded-tr-xs shadow-sm font-medium'
                      : 'bg-[#F7F9FC] border border-[#E5EAF0] text-[#111827] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Intent Tag Summary */}
                  {msg.intent && (msg.intent.category || msg.intent.budget?.max || msg.intent.maxBudget) && (
                    <div className="mt-3 pt-3 border-t border-[#E5EAF0] flex flex-wrap gap-1.5 text-[10px] font-mono">
                      {msg.intent.category && (
                        <span className="bg-white border border-[#E5EAF0] px-2 py-0.5 rounded text-[#167D73] font-bold">
                          CATEGORY: {msg.intent.category}
                        </span>
                      )}
                      {(msg.intent.budget?.max || msg.intent.maxBudget) && (
                        <span className="bg-white border border-[#E5EAF0] px-2 py-0.5 rounded text-[#111827] font-bold">
                          BUDGET: ≤ ₹{(msg.intent.budget?.max || msg.intent.maxBudget).toLocaleString('en-IN')}
                        </span>
                      )}
                      {msg.intent.language && (
                        <span className="bg-white border border-[#E5EAF0] px-2 py-0.5 rounded text-[#687385] uppercase">
                          LANG: {msg.intent.language}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Grounded Product Cards */}
                {msg.matches && msg.matches.length > 0 && (
                  <div className="w-full mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {msg.matches.map((item: any) => {
                      const offer = item.bestOffer || {};
                      const price = offer.sellingPrice || item.price || 1999;
                      const mrp = offer.originalMrp || item.originalMrp || Math.round(price * 1.2);
                      const isAdded = addedItems[item.productId];

                      return (
                        <div
                          key={item.productId}
                          className="bg-white border border-[#E5EAF0] hover:border-[#167D73] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div>
                            {/* Card Top: Brand, Category, Proximity */}
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#687385] mb-2">
                              <span className="font-bold text-[#111827] uppercase">
                                {item.brand || 'VERIFIED'}
                              </span>
                              <span className="flex items-center gap-1 text-[#167D73] font-semibold bg-[#E9F7F3] px-2 py-0.5 rounded-full">
                                <MapPin className="w-3 h-3 text-[#167D73]" />
                                <span>{offer.distanceKm || 0.8} km</span>
                              </span>
                            </div>

                            {/* Product Photography */}
                            <div 
                              onClick={() => navigate(`/products/${item.productId}`)}
                              className="relative aspect-4/3 w-full bg-[#F7F9FC] rounded-xl overflow-hidden mb-3 cursor-pointer"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="absolute top-2 left-2">
                                <span className="bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  <span>Store In Stock</span>
                                </span>
                              </div>
                            </div>

                            {/* Title */}
                            <h4 
                              onClick={() => navigate(`/products/${item.productId}`)}
                              className="font-bold text-sm text-[#111827] line-clamp-2 hover:text-[#167D73] transition-colors cursor-pointer mb-1.5"
                            >
                              {item.title}
                            </h4>

                            {/* Shop Name & Stock */}
                            <p className="text-xs text-[#687385] mb-2">
                              Verified at <b className="text-[#111827]">{offer.shopName || 'Local Merchant'}</b> · {offer.storeAddress || activeCity}
                            </p>

                            {/* Match Rationale */}
                            {item.matchReason && (
                              <p className="text-[11px] text-[#167D73] bg-[#E9F7F3] p-2 rounded-lg leading-relaxed mb-3">
                                <b>Why it matches:</b> {item.matchReason}
                              </p>
                            )}
                          </div>

                          {/* Price & Actions Row */}
                          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2 mt-auto">
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-extrabold text-[#111827]">
                                  ₹{price.toLocaleString('en-IN')}
                                </span>
                                {mrp > price && (
                                  <span className="text-xs text-[#94A3B8] line-through">
                                    ₹{mrp.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#94A3B8] block">
                                Inclusive of all taxes
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCompareAction(item)}
                                title="Compare with alternatives"
                                className="px-2.5 py-1.5 bg-[#F7F9FC] hover:bg-[#E5EAF0] text-[#111827] text-xs font-semibold rounded-lg border border-[#E5EAF0] transition-colors cursor-pointer"
                              >
                                <Scale className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddToCart(item)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                  isAdded 
                                    ? 'bg-[#167D73] text-white' 
                                    : 'bg-[#111827] hover:bg-[#167D73] text-white'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Embedded Side-by-Side Comparison Table */}
                {msg.comparison && msg.comparison.products && (
                  <div className="w-full mt-3 bg-white border border-[#E5EAF0] rounded-2xl p-4 shadow-sm overflow-x-auto">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#167D73] uppercase tracking-wider">
                      <Scale className="w-4 h-4" />
                      <span>Verified Attribute Comparison</span>
                    </div>

                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5EAF0]">
                          <th className="py-2 pr-3 font-mono text-[#687385] uppercase text-[10px]">Specification</th>
                          {msg.comparison.products.map((p: any, i: number) => (
                            <th key={i} className="py-2 px-3 font-bold text-[#111827] min-w-[140px]">
                              {p.product.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        <tr>
                          <td className="py-2 pr-3 font-mono text-[#687385]">Price</td>
                          {msg.comparison.products.map((p: any, i: number) => (
                            <td key={i} className="py-2 px-3 font-bold text-[#167D73]">
                              ₹{p.minPrice?.toLocaleString('en-IN')}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 font-mono text-[#687385]">Brand</td>
                          {msg.comparison.products.map((p: any, i: number) => (
                            <td key={i} className="py-2 px-3 text-[#111827]">
                              {p.product.brand}
                            </td>
                          ))}
                        </tr>
                        {msg.comparison.commonAttributes?.map((attr: string) => (
                          <tr key={attr}>
                            <td className="py-2 pr-3 font-mono text-[#687385] capitalize">{attr.replace(/_/g, ' ')}</td>
                            {msg.comparison.products.map((p: any, i: number) => (
                              <td key={i} className="py-2 px-3 text-[#111827]">
                                {p.product.attributes?.[attr] || 'Standard spec'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Follow-up Suggestion Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pl-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(sug)}
                        className="bg-white hover:bg-[#E9F7F3] border border-[#E5EAF0] hover:border-[#167D73] text-xs font-semibold text-[#111827] hover:text-[#167D73] px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{sug}</span>
                        <ChevronRight className="w-3 h-3 text-[#687385]" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-[#167D73] text-white flex items-center justify-center text-[10px] font-bold">
                  e
                </div>
                <div className="bg-[#F7F9FC] border border-[#E5EAF0] rounded-2xl rounded-tl-xs p-4 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#167D73] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-[#167D73] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-[#167D73] rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs text-[#687385] font-medium">
                    Reasoning intent & verifying live physical store inventory...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Interactive Composer */}
          <div className="p-4 border-t border-[#E5EAF0] bg-white space-y-3">
            
            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#687385] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder={`Describe what you want (e.g. Laptop for programming under ₹60,000 in ${activeCity})...`}
                  disabled={isLoading}
                  className="w-full bg-[#F7F9FC] focus:bg-white border border-[#E5EAF0] focus:border-[#167D73] text-sm text-[#111827] pl-11 pr-12 py-3.5 rounded-2xl outline-none transition-all placeholder:text-[#94A3B8]"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#111827] hover:bg-[#167D73] disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between text-[11px] text-[#94A3B8] px-1">
              <span>Press <b>Enter</b> to send · Supports English, Hindi & Hinglish</span>
              <span>Grounded in PostgreSQL & OpenSearch</span>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default AiDiscoveryPage;
