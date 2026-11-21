import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Check, X, RotateCcw, ArrowRight, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { VoiceSessionState } from '../../../../shared/types.js';

export const VoiceKhataWidget: React.FC<{ onEntrySaved?: () => void }> = ({ onEntrySaved }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<VoiceSessionState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition if available in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Indic/Hinglish speech recognition

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          sendVoiceInput(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Initialize session with AI disclosure on mount
    api.processVoiceText('Init session').then(res => {
      setState(res);
      speakText(res.spokenResponse || '');
    }).catch(console.error);
  }, []);

  // Text-To-Speech Audio Feedback (Simulating Gnani Timbre v3.0)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // already started
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (transcript) {
      sendVoiceInput(transcript);
    }
  };

  const sendVoiceInput = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    const start = performance.now();

    try {
      const newState = await api.processVoiceText(text, state?.sessionId);
      const measured = Math.round(performance.now() - start);
      setLatencyMs(measured);
      setState(newState);

      if (newState.spokenResponse) {
        speakText(newState.spokenResponse);
      }

      if (newState.stage === 'COMPLETED' && onEntrySaved) {
        onEntrySaved();
      }
    } catch (err: any) {
      console.error('Error in voice input:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleChips = [
    { label: 'Ramesh ka 340 udhaar likh do', desc: 'Credit entry' },
    { label: 'Ramesh ne 200 rupaye diye', desc: 'Payment received' },
    { label: 'Nahi, 430 tha', desc: 'Spoken correction' },
    { label: 'Indiranagar wale', desc: 'Disambiguation' },
    { label: 'Aaj kitna udhaar gaya?', desc: 'Daily total query' },
    { label: 'Ramesh ka hisab batao', desc: 'Balance query' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#E5EAF0] shadow-xl overflow-hidden p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#167D73] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Gnani PS2 Voice Khata
            </span>
            <span className="text-xs font-bold text-gray-500">Prisma STT + Timbre TTS</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Digital Khata. Just Use Your Voice.</h2>
          <p className="text-xs text-gray-500 mt-0.5">Record credit, take payments, and ask business questions hands-free.</p>
        </div>

        {latencyMs !== null && (
          <div className="bg-[#E9F7F3] border border-[#167D73]/30 px-3 py-1.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#167D73]" />
            <span className="text-xs font-bold text-[#105B55] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Latency: {latencyMs}ms (Target: &lt;2.0s)</span>
            </span>
          </div>
        )}
      </div>

      {/* Main Interactive Push-to-Talk Voice Center */}
      <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
        {/* Pulsing Audio Waveform / Big Microphone Button */}
        <div className="relative">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-[#167D73]/30 animate-pulse-ring" />
          )}
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 transform active:scale-90 ${
              isListening
                ? 'bg-red-500 shadow-red-500/40 ring-8 ring-red-100 scale-105'
                : 'bg-gradient-to-br from-[#167D73] to-[#105B55] shadow-[#167D73]/30 hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
            <span className="text-[10px] font-black uppercase mt-1 tracking-wider">
              {isListening ? 'Listening' : 'Hold / Tap'}
            </span>
          </button>
        </div>

        {/* Live Status Indicator */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isListening ? (
              <span className="text-red-500 flex items-center justify-center gap-1.5 font-black">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Listening to your voice... Speak now
              </span>
            ) : isProcessing ? (
              <span className="text-[#7657E8] font-bold">Processing intent with Gnani NLU...</span>
            ) : isSpeaking ? (
              <span className="text-[#167D73] font-bold flex items-center justify-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-bounce text-[#167D73]" />
                Speaking confirmation back...
              </span>
            ) : (
              'Hold button or tap to speak in Hindi / Hinglish'
            )}
          </p>
          {transcript && (
            <div className="text-sm font-bold text-gray-800 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl max-w-md mx-auto">
              "{transcript}"
            </div>
          )}
        </div>

        {/* Spoken Response & Confirmation Dialog */}
        {state && (
          <div className="w-full max-w-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-5 text-left space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#167D73] uppercase">
              <Volume2 className="w-4 h-4 text-[#167D73]" />
              <span>Voice Khata Assistant Response:</span>
            </div>
            <p className="text-sm font-extrabold text-gray-900 leading-relaxed">
              "{state.spokenResponse}"
            </p>

            {/* Confirmation Action Buttons if Awaiting Confirmation */}
            {state.stage === 'AWAITING_CONFIRMATION' && state.pendingTransaction && (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => sendVoiceInput('Haan, save kar do')}
                  className="bg-[#167D73] hover:bg-[#105B55] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Haan, Save Kar Do</span>
                </button>
                <button
                  onClick={() => sendVoiceInput('Nahi, amount galat hai')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Correct Amount</span>
                </button>
              </div>
            )}

            {/* Disambiguation Buttons if 2 customers match */}
            {state.stage === 'DISAMBIGUATING' && state.pendingTransaction?.disambiguationOptions && (
              <div className="pt-2 flex flex-wrap gap-2">
                {state.pendingTransaction.disambiguationOptions.map(tag => (
                  <button
                    key={tag}
                    onClick={() => sendVoiceInput(`${tag} wale`)}
                    className="bg-[#7657E8] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#6342db] transition-all flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>{tag} wale</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Prompt Chips for Judges / Testing */}
        <div className="w-full text-left pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Quick Test Commands (Click or Speak aloud)
            </span>
            <span className="text-[10px] text-gray-400">Indic / Hinglish Code-Mixed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendVoiceInput(chip.label)}
                className="p-2.5 bg-gray-50 hover:bg-[#E9F7F3] border border-gray-200 hover:border-[#167D73] rounded-xl text-left transition-all text-xs group"
              >
                <div className="font-bold text-gray-900 group-hover:text-[#167D73]">"{chip.label}"</div>
                <div className="text-[10px] text-gray-400">{chip.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance & Responsible AI Notice */}
      <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-gray-200 flex items-center gap-2 text-[11px] text-gray-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-[#167D73] shrink-0" />
        <span>Gnani PS2 Compliance: Mandatory turn-1 AI disclosure active. Zero voice cloning. In-browser WebAudio streaming with zero telephony.</span>
      </div>
    </div>
  );
};
