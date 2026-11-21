"use client";

import React, { useState } from 'react';
import { 
  Sparkles, X, ArrowRight, Store, CheckCircle2, ShieldCheck, 
  MapPin, SlidersHorizontal, Loader2, RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api.js';
import { CanonicalProduct } from '../../../../shared/types.js';

interface AiDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompareProduct: (product: CanonicalProduct) => void;
}

export const AiDiscoveryModal: React.FC<AiDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onCompareProduct
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; matches?: any[]; intent?: any }>>([
    {
      role: 'assistant',
      text: 'Namaste! I am your Evalipie Marketplace Discovery Assistant. Tell me what you need in English, Hindi, Hinglish, or Gujarati — I will check verified shelf inventory across local neighbourhood stores.'
    }
  ]);

  if (!isOpen) return null;

  const quickChips = [
    'Wireless headphones under ₹2,000',
    'Daawat Basmati rice and sunflower oil near Indiranagar',
    'Mujhe programming ke liye laptop chahiye 60,000 ke andar',
    'Compact digital air fryer for small apartment'
  ];

  const handleSend = async (queryText?: string) => {
    const text = (queryText || prompt).trim();
    if (!text || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await api.aiDiscover(text, conversationId || undefined);
      if (res.conversationId) {
        setConversationId(res.conversationId);
      }
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.explanation || res.intentAnalysis?.inferred_need || 'Here are verified matches from local shops:',
          matches: res.matches,
          intent: res.intentAnalysis
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, I encountered an issue checking the live store inventory. Please try asking again!'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-white to-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7657E8] to-[#906CF7] flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-gray-900">Evalipie Intelligence Engine</h2>
                <span className="bg-purple-100 text-[#7657E8] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Grounded search against verified Bengaluru local store inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat / Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm font-medium leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-[#111827] text-white rounded-br-xs shadow-xs' 
                    : 'bg-gray-50 border border-gray-200/80 text-gray-800 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>

              {/* Match Cards */}
              {m.matches && m.matches.length > 0 && (
                <div className="mt-3 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {m.matches.map((item: any) => (
                    <div 
                      key={item.productId}
                      className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">
                            {item.title}
                          </h4>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-extrabold text-[#167D73]">
                              ₹{item.bestOffer?.price?.toLocaleString('en-IN') || item.price}
                            </span>
                            {item.originalMrp && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ₹{item.originalMrp.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {item.matchReason && (
                        <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2 text-[11px] text-[#7657E8] font-semibold flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#7657E8] shrink-0 mt-0.5" />
                          <span>{item.matchReason}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[120px]">
                          📍 {item.bestOffer?.storeName || 'Indiranagar'}
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onCompareProduct({
                              id: item.productId,
                              title: item.title,
                              brand: item.brand,
                              category: item.category,
                              description: '',
                              attributes: {},
                              imageUrl: item.imageUrl
                            });
                          }}
                          className="bg-[#167D73] hover:bg-[#105B55] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          Compare Sellers
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 p-3 rounded-2xl w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking real physical catalogue across Bengaluru stores...</span>
            </div>
          )}
        </div>

        {/* Quick Chips */}
        <div className="px-6 py-2 border-t border-gray-100 bg-gray-50/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {quickChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              className="bg-white hover:bg-purple-50 hover:border-purple-200 border border-gray-200 text-gray-700 hover:text-[#7657E8] text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask in English, Hindi, Hinglish, Gujarati (e.g. Rice aur sunflower oil under 500)..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:border-[#7657E8] focus:bg-white transition-all shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || isLoading}
            className="bg-[#7657E8] hover:bg-[#6344d9] disabled:opacity-40 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-200 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Ask AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiDiscoveryModal;
