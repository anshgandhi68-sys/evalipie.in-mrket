import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, X, Send, ShoppingBag, 
  Check, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, 
  MapPin, RefreshCw, ChevronRight, Store, PackageCheck
} from 'lucide-react';
import { voiceApi, VoiceChatResponse } from '../../services/voiceApi.js';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface VoiceShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceShoppingModal: React.FC<VoiceShoppingModalProps> = ({ isOpen, onClose }) => {
  const { addItem, totalCount } = useCart();
  const { activeCity } = useAuth();

  const [sessionId] = useState(() => `voice-session-${Date.now()}`);
  const [language, setLanguage] = useState<'hi-IN' | 'en-IN' | 'gu-IN' | 'kn-IN'>('hi-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  // Voice State Machine
  const [stage, setStage] = useState<string>('DISCOVERY');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! Main Evalipie Voice Assistant hoon. Aap bolkar koi bhi product dhoond sakte hain, jaise: "Mujhe 2000 ke andar wireless headphones chahiye".'
    }
  ]);
  const [lastResults, setLastResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cartState, setCartState] = useState<any>({ items: [], totalAmount: 0, totalCount: 0 });
  const [pendingDraft, setPendingDraft] = useState<any | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Web Audio API Waveform Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [history, isProcessing]);

  // Clean up audio on close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      stopAudioPlayback();
    }
  }, [isOpen]);

  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  /**
   * Start Live Microphone Audio Capture with Real-Time Web Audio Waveform
   */
  const startRecording = async () => {
    setMicError(null);
    stopAudioPlayback();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 1. Setup Web Audio API Analyser for Live Waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawWaveform();

      // 2. Setup MediaRecorder for Gnani Prisma STT
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());

        if (audioBlob.size > 1000) {
          await processRecordedAudio(audioBlob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);
    } catch (err: any) {
      console.error('[Microphone Permission Error]:', err);
      setMicError('Microphone permission denied. You can type your request below.');
      setIsRecording(false);
    }
  };

  /**
   * Stop Recording and trigger STT + Orchestration
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    setIsRecording(false);
  };

  /**
   * Draw Real Audio Waveform on Canvas using Frequency Data
   */
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        
        // Gradient color: Teal to Mint
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#105B55');
        gradient.addColorStop(1, '#16A34A');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [3, 3, 0, 0]);
        ctx.fill();

        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  /**
   * Convert Audio Blob to Base64 and send to Backend Voice API
   */
  const processRecordedAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        await sendVoiceTurn({ audioBase64: base64Data });
      };
    } catch (err: any) {
      console.error('Audio processing failed:', err);
      setIsProcessing(false);
    }
  };

  /**
   * Send Voice / Text Interaction to Backend
   */
  const sendVoiceTurn = async (params: { text?: string; audioBase64?: string }) => {
    setIsProcessing(true);
    stopAudioPlayback();

    try {
      const res: VoiceChatResponse = await voiceApi.sendTurn({
        sessionId,
        text: params.text,
        audioBase64: params.audioBase64,
        language,
        city: activeCity
      });

      // Update state
      setStage(res.stage);
      setHistory(res.state.conversationHistory || []);
      setLastResults(res.state.lastResults || []);
      setSelectedProduct(res.state.selectedProduct || null);
      setCartState(res.state.cart || { items: [], totalAmount: 0, totalCount: 0 });
      setPendingDraft(res.state.pendingOrderDraft || null);
      setConfirmedOrder(res.state.confirmedOrder || null);

      // Sync items to Main Global CartContext if items were added
      if (res.state.cart && res.state.cart.items.length > 0) {
        const lastItem = res.state.cart.items[res.state.cart.items.length - 1];
        addItem({
          listingId: lastItem.id || `voice-${lastItem.productId}`,
          storeId: 'store-voice',
          productId: lastItem.productId,
          title: lastItem.title,
          shopName: lastItem.storeName || 'Bengaluru Local Store',
          shopSlug: 'local-store',
          price: lastItem.price,
          quantity: 1,
          imageUrl: lastItem.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
        });
      }

      // Play synthesized Gnani Timbre response audio
      if (res.audioBase64) {
        setIsPlayingAudio(true);
        const audio = await voiceApi.playAudio(res.audioBase64);
        currentAudioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
      }
    } catch (err: any) {
      console.error('Turn failed:', err);
      setHistory(prev => [
        ...prev,
        { role: 'assistant', text: 'Maaf kijiye, aawaz samajhne mein dikkat aayi. Kripya dobara bolein ya type karein.' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const text = textInput.trim();
    setTextInput('');
    sendVoiceTurn({ text });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-[#E5EAF0] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── 1. MODAL TOP BAR ────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-[#E5EAF0] flex items-center justify-between bg-gradient-to-r from-[#105B55] to-[#167D73] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-lg shadow-sm border border-white/20">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base tracking-tight text-white">
                  Evalipie Voice Shopping
                </h2>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gnani Prisma v3.0
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Speak · Discover · Order in {activeCity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/20 outline-none cursor-pointer transition-colors"
            >
              <option value="hi-IN" className="text-black">हिन्दी (Hindi)</option>
              <option value="en-IN" className="text-black">English (India)</option>
              <option value="gu-IN" className="text-black">ગુજરાતી (Gujarati)</option>
              <option value="kn-IN" className="text-black">ಕನ್ನಡ (Kannada)</option>
            </select>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. GUIDED STAGE PROGRESS TRACKER ─────────────────────── */}
        <div className="bg-[#F7F9FC] border-b border-[#E5EAF0] px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-[#687385] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className={stage === 'DISCOVERY' ? 'text-[#167D73] font-extrabold flex items-center gap-1' : ''}>
              1. Discover
            </span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className={stage === 'PRODUCT_RESULTS' || stage === 'PRODUCT_SELECTED' ? 'text-[#167D73] font-extrabold flex items-center gap-1' : ''}>
              2. Select Product
            </span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className={stage === 'CART_REVIEW' ? 'text-[#167D73] font-extrabold flex items-center gap-1' : ''}>
              3. Cart ({cartState.totalCount})
            </span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className={stage === 'CONFIRMATION_PENDING' ? 'text-amber-600 font-extrabold flex items-center gap-1' : ''}>
              4. Review & Confirm
            </span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className={stage === 'ORDER_CREATED' ? 'text-green-600 font-extrabold flex items-center gap-1' : ''}>
              5. Ordered ✓
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] bg-[#E9F7F3] text-[#167D73] px-2 py-0.5 rounded-full font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero Phantom Stock</span>
          </div>
        </div>

        {/* ── 3. CONVERSATION & PRODUCT STAGE ──────────────────────── */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
          {history.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#111827] text-white rounded-tr-none'
                    : 'bg-[#F7F9FC] text-[#111827] border border-[#E5EAF0] rounded-tl-none font-medium'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 bg-[#F7F9FC] border border-[#E5EAF0] rounded-2xl rounded-tl-none text-xs text-[#687385] w-fit">
              <RefreshCw className="w-3.5 h-3.5 text-[#167D73] animate-spin" />
              <span>Gnani Prisma v3.0 & Evalipie AI processing...</span>
            </div>
          )}

          {/* Audio Speaking Indicator */}
          {isPlayingAudio && (
            <div className="flex items-center justify-between p-2.5 bg-[#E9F7F3] border border-[#A7E3D8] rounded-xl text-xs text-[#105B55]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#167D73] animate-pulse" />
                <span className="font-bold">Speaking with Gnani Timbre v3.0...</span>
              </div>
              <button
                type="button"
                onClick={stopAudioPlayback}
                className="text-[11px] font-bold text-[#167D73] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute / Interrupt</span>
              </button>
            </div>
          )}

          {/* Grounded Product Recommendations Carousel */}
          {lastResults.length > 0 && stage !== 'ORDER_CREATED' && (
            <div className="mt-4 pt-3 border-t border-[#E5EAF0]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Matching Products from {activeCity} Stores
                </h4>
                <span className="text-[10px] text-[#687385] font-semibold">
                  Say "Pehla wala dikhao" or "Add to cart"
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {lastResults.slice(0, 2).map((prod, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      sendVoiceTurn({ text: idx === 0 ? 'Pehla wala dikhao' : 'Second wala dikhao' });
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      selectedProduct?.productId === prod.productId 
                        ? 'border-[#167D73] bg-[#E9F7F3]/50 shadow-sm' 
                        : 'border-[#E5EAF0] bg-[#F7F9FC] hover:border-[#167D73]'
                    }`}
                  >
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.title} 
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border border-gray-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#111827] truncate">
                        {idx + 1}. {prod.title}
                      </p>
                      <p className="text-[11px] text-[#687385] truncate">
                        📍 {prod.storeName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-xs text-[#167D73]">
                          ₹{prod.price?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.2 rounded font-bold">
                          {prod.inStock ? 'In Stock' : 'Low Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EXPLICIT CONFIRMATION SAFEGUARD CARD ──────────────── */}
          {stage === 'CONFIRMATION_PENDING' && pendingDraft && (
            <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm mb-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Explicit Order Confirmation Required</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed mb-3">
                Order Total: <b>₹{pendingDraft.totalAmount?.toLocaleString()}</b>. Delivery to <b>42, 100ft Road, Indiranagar, Bengaluru</b>. 
                Say <b>"Haan, order place karo"</b> or click the button below to confirm.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sendVoiceTurn({ text: 'Haan, order place kar do' })}
                  className="flex-1 bg-[#167D73] hover:bg-[#105B55] text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Place Order</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendVoiceTurn({ text: 'Cancel kar do' })}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── ORDER SUCCESS CARD ─────────────────────────────────── */}
          {stage === 'ORDER_CREATED' && confirmedOrder && (
            <div className="mt-4 p-5 bg-[#E9F7F3] border-2 border-[#10B981] rounded-2xl text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-[#10B981] text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl shadow-md">
                ✓
              </div>
              <h3 className="font-extrabold text-base text-[#111827]">
                Order Confirmed Successfully!
              </h3>
              <p className="text-xs font-mono font-bold text-[#167D73] mt-1">
                Order ID: {confirmedOrder.orderId}
              </p>
              <p className="text-xs text-[#5A5852] mt-1">
                Total ₹{confirmedOrder.totalAmount?.toLocaleString()} · Paid via Cash/UPI on Delivery
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                Your order is reserved and dispatched locally from Indiranagar branch.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 px-6 py-2 bg-[#111827] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors cursor-pointer"
              >
                Close & Return to Store
              </button>
            </div>
          )}
        </div>

        {/* ── 4. LIVE WAVEFORM & MICROPHONE CONTROLS ───────────────── */}
        <div className="p-4 sm:p-5 bg-[#F7F9FC] border-t border-[#E5EAF0] flex flex-col items-center gap-3">
          
          {/* Live Frequency Canvas (Visible during recording) */}
          <div className={`w-full max-w-sm h-12 flex items-center justify-center ${isRecording ? 'block' : 'hidden'}`}>
            <canvas 
              ref={canvasRef} 
              width={340} 
              height={48} 
              className="w-full h-full rounded-xl bg-white border border-[#E5EAF0] shadow-inner"
            />
          </div>

          {/* Mic Button & Status */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer ${
                isRecording 
                  ? 'bg-[#DC2626] text-white scale-110 shadow-red-200 animate-pulse' 
                  : 'bg-[#167D73] hover:bg-[#105B55] text-white hover:scale-105 active:scale-95 shadow-teal-100'
              }`}
              aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecording ? (
                <MicOff className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>
          </div>

          <p className="text-xs font-bold text-[#111827]">
            {isRecording 
              ? 'Listening... Speak naturally (Tap again when done)' 
              : isProcessing 
              ? 'Transcribing with Gnani Prisma v3.0...' 
              : 'Tap microphone to speak (e.g. "Mujhe laptop chahiye under 60000")'}
          </p>

          {micError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {micError}
            </p>
          )}

          {/* ── 5. TEXT INPUT FALLBACK ──────────────────────────────── */}
          <form 
            onSubmit={handleTextSubmit}
            className="w-full flex items-center gap-2 mt-1"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type what you want to say in English / Hindi..."
              className="flex-1 bg-white border border-[#E5EAF0] focus:border-[#167D73] text-xs sm:text-sm text-[#111827] px-3.5 py-2.5 rounded-xl outline-none transition-colors"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="bg-[#111827] hover:bg-black disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default VoiceShoppingModal;
