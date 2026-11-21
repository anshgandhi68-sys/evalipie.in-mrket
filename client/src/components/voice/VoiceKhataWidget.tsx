"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Check, X, RotateCcw, 
  ArrowRight, ShieldCheck, Zap, ChevronRight, AlertCircle, RefreshCw,
  Play, Square, MessageSquare, History
} from 'lucide-react';
import { api } from '../../services/api.js';
import { VoiceSessionState, LedgerEntry } from '../../../../shared/types.js';

interface ChatTurn {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  stage?: string;
  latencyMs?: number;
}

export const VoiceKhataWidget: React.FC<{ onEntrySaved?: () => void }> = ({ onEntrySaved }) => {
  // Voice & Session States
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // Transcripts & State Machine
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [state, setState] = useState<VoiceSessionState | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('indic-auto');

  // Audio References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize session on mount with Mandatory Indic AI Disclosure
  useEffect(() => {
    // Check initial microphone permission if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as any }).then((result) => {
        setMicPermission(result.state as any);
        result.onchange = () => setMicPermission(result.state as any);
      }).catch(() => {});
    }

    // Start Voice Khata session
    api.processVoiceText('Init session').then((res: any) => {
      setState(res);
      if (res.spokenResponse) {
        addHistory('assistant', res.spokenResponse);
        if (res.audioBase64) {
          playAudioBase64(res.audioBase64);
        }
      }
    }).catch((err) => {
      console.warn('Voice session init fallback:', err);
    });

    return () => {
      stopMicrophoneStream();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  const addHistory = (sender: 'user' | 'assistant', text: string, latency?: number) => {
    setHistory((prev) => [
      ...prev,
      {
        id: `turn-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latencyMs: latency,
      },
    ]);
  };

  // Play real WAV synthetic speech from Gnani Timbre
  const playAudioBase64 = (base64Audio: string) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play().catch((err) => {
        console.warn('Autoplay prevented or interrupted:', err);
        setIsSpeaking(false);
      });
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  };

  // ── Web Audio Analyser & Live Waveform Canvas ──────────────
  const startCanvasWaveform = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 32);
      let x = 0;

      for (let i = 0; i < 32; i++) {
        // Average sample over bin
        const index = Math.floor(i * (bufferLength / 32));
        const val = dataArray[index] || 0;
        const percent = val / 255;
        const barHeight = Math.max(4, percent * canvas.height * 0.95);

        // Gradient from Emerald Teal to Signal
        const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        grad.addColorStop(0, '#14B8A6');
        grad.addColorStop(1, '#0F766E');

        ctx.fillStyle = grad;
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 3, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  const stopMicrophoneStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // ── Start Recording via Real Microphone ─────────────────────
  const startRecording = async () => {
    setErrorMsg(null);
    stopAudioPlayback();
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setMicPermission('granted');
      micStreamRef.current = stream;

      // Initialize Web Audio Context for Live Waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      sourceNode.connect(analyser);
      analyserRef.current = analyser;

      startCanvasWaveform(analyser);

      // Initialize MediaRecorder for Audio Transmission
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100); // 100ms chunks
      setIsListening(true);
      setCurrentTranscript('Listening to your voice...');
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMicPermission('denied');
      setErrorMsg('Microphone access was denied or is unavailable. Please grant microphone permissions in your browser.');
    }
  };

  // ── Stop Recording & Transcribe via Gnani Prisma v3.0 ───────
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !isListening) return;

    setIsListening(false);
    setIsTranscribing(true);
    setCurrentTranscript('Transcribing with Gnani Prisma v3.0...');

    mediaRecorderRef.current.onstop = async () => {
      stopMicrophoneStream();

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      audioChunksRef.current = [];

      const startTime = performance.now();

      try {
        // Send real audio to backend proxy for Gnani Prisma STT & Timbre TTS
        const result = await api.processVoiceAudio(audioBlob, state?.sessionId, selectedLanguage);
        const totalDuration = Math.round(performance.now() - startTime);

        setLatencyMs(totalDuration);
        setIsTranscribing(false);

        if (result.transcript) {
          setCurrentTranscript(result.transcript);
          addHistory('user', result.transcript);
        }

        setState(result);

        if (result.spokenResponse) {
          addHistory('assistant', result.spokenResponse, result.sttLatencyMs);
          if (result.audioBase64) {
            playAudioBase64(result.audioBase64);
          }
        }

        if (result.stage === 'COMPLETED' && onEntrySaved) {
          onEntrySaved();
        }
      } catch (err: any) {
        console.error('Gnani Voice processing error:', err);
        setErrorMsg(err.message || 'Error communicating with Gnani AI service');
        setIsTranscribing(false);
      }
    };

    mediaRecorderRef.current.stop();
  };

  // Send textual speech command directly (fallback or quick chips)
  const sendVoiceText = async (text: string) => {
    if (!text.trim()) return;
    setErrorMsg(null);
    stopAudioPlayback();
    setIsThinking(true);
    setCurrentTranscript(text);
    addHistory('user', text);

    const startTime = performance.now();

    try {
      const result: any = await api.processVoiceText(text, state?.sessionId);
      const totalDuration = Math.round(performance.now() - startTime);
      setLatencyMs(totalDuration);

      setState(result);

      if (result.spokenResponse) {
        addHistory('assistant', result.spokenResponse, totalDuration);
        if (result.audioBase64) {
          playAudioBase64(result.audioBase64);
        }
      }

      if (result.stage === 'COMPLETED' && onEntrySaved) {
        onEntrySaved();
      }
    } catch (err: any) {
      console.error('Error processing voice text:', err);
      setErrorMsg(err.message || 'Error processing speech command');
    } finally {
      setIsThinking(false);
    }
  };

  const sampleChips = [
    { label: 'Ramesh ka 340 rupaye udhaar likh do', desc: 'Credit entry' },
    { label: 'Ramesh ne 200 rupaye diye', desc: 'Payment received' },
    { label: 'Nahi, 340 nahi, 430 likho', desc: 'Spoken correction' },
    { label: 'Indiranagar wale', desc: 'Disambiguation choice' },
    { label: 'Aaj kitna udhaar gaya?', desc: 'Daily total query' },
    { label: 'Ramesh ka hisab batao', desc: 'Customer balance query' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#E5EAF0] shadow-2xl overflow-hidden p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#167D73] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              Gnani AI Voice Technology
            </span>
            <span className="text-[11px] font-mono text-gray-500 font-bold">
              Prisma v3.0 (STT) ✦ Timbre v2.5 (TTS)
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F1412] tracking-tight">
            Voice Khata Assistant
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Hands-free Indic bookkeeping for local merchants. Speak naturally in Hindi, English, Gujarati, Kannada, or Hinglish.
          </p>
        </div>

        {/* Language & Latency Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-[#167D73]"
          >
            <option value="indic-auto">Auto Detect (Indic Code-Mix)</option>
            <option value="hi-IN">Hindi (hi-IN)</option>
            <option value="en-IN">English (en-IN)</option>
            <option value="gu-IN">Gujarati (gu-IN)</option>
            <option value="kn-IN">Kannada (kn-IN)</option>
          </select>

          {latencyMs !== null && (
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>{latencyMs}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Permission Denied Alert */}
      {micPermission === 'denied' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>Microphone access was blocked. Please enable microphone permissions in your browser bar to speak live to Gnani AI.</span>
        </div>
      )}

      {/* 3. Live Microphone Interaction Canvas */}
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200/80 shadow-inner relative space-y-6">
        {/* Real Live Waveform Canvas */}
        <div className="w-full max-w-md h-20 bg-gray-900 rounded-2xl flex items-center justify-center overflow-hidden relative shadow-md">
          <canvas
            ref={canvasRef}
            width={400}
            height={80}
            className="w-full h-full object-cover"
          />
          {!isListening && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-gray-400 text-xs font-mono font-semibold gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isSpeaking ? 'Gnani Timbre is speaking...' : 'Real Audio Analyser Ready'}</span>
            </div>
          )}
        </div>

        {/* Primary Interactive Push-to-Talk / Toggle Button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={isListening ? stopRecording : startRecording}
            disabled={isTranscribing || isThinking}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95 outline-none relative group ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 ring-8 ring-red-100 animate-pulse'
                : 'bg-[#167D73] hover:bg-[#105B55] ring-8 ring-emerald-50 hover:shadow-2xl'
            }`}
            aria-label={isListening ? 'Stop recording voice' : 'Start speaking voice command'}
          >
            {isListening ? (
              <Square className="w-8 h-8 fill-white" />
            ) : isTranscribing || isThinking ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          {isSpeaking && (
            <button
              onClick={stopAudioPlayback}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-300 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Stop Speaking"
            >
              <VolumeX className="w-4 h-4 text-red-500" />
              <span>Stop Voice</span>
            </button>
          )}
        </div>

        {/* Status Prompt & Current Transcript Display */}
        <div className="text-center space-y-2 max-w-xl">
          <p className="text-xs uppercase font-extrabold tracking-widest text-gray-400">
            {isListening ? (
              <span className="text-red-600 animate-pulse font-black">
                ● Recording microphone audio · Release or tap to send
              </span>
            ) : isTranscribing ? (
              <span className="text-[#167D73] font-bold">
                Transcribing audio via Gnani Prisma v3.0...
              </span>
            ) : isThinking ? (
              <span className="text-[#7657E8] font-bold">
                Analyzing NLU intent & extracting amounts...
              </span>
            ) : isSpeaking ? (
              <span className="text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-bounce text-[#167D73]" />
                Gnani Timbre synthetic voice playing back...
              </span>
            ) : (
              'Click microphone to start recording in Hindi / Hinglish'
            )}
          </p>

          {currentTranscript && (
            <div className="text-base font-extrabold text-gray-900 bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm inline-block max-w-lg">
              "{currentTranscript}"
            </div>
          )}
        </div>

        {/* 4. Spoken Response & Consequential Confirmation Preview */}
        {state && state.spokenResponse && (
          <div className="w-full max-w-xl bg-white border-2 border-[#167D73]/30 rounded-3xl p-6 text-left space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#167D73] uppercase tracking-wider">
                <Volume2 className="w-4 h-4 text-[#167D73]" />
                <span>Gnani Assistant Response:</span>
              </div>
              {state.audioBase64 && (
                <button
                  onClick={() => playAudioBase64(state.audioBase64!)}
                  className="text-xs font-bold text-[#167D73] hover:underline flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-[#167D73]" />
                  <span>Replay Audio</span>
                </button>
              )}
            </div>

            <p className="text-base font-black text-gray-900 leading-snug">
              "{state.spokenResponse}"
            </p>

            {/* Pending Transaction Preview Card */}
            {state.pendingTransaction && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-500 uppercase tracking-wide">Transaction Preview</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                    state.pendingTransaction.type === 'CREDIT' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {state.pendingTransaction.type === 'CREDIT' ? 'Udhaar (Credit Given)' : 'Jama (Payment Received)'}
                  </span>
                </div>

                <div className="flex justify-between items-end pt-1">
                  <div>
                    <div className="text-xs text-gray-500">Customer</div>
                    <div className="text-base font-black text-gray-900">{state.pendingTransaction.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="text-xl font-black text-[#167D73]">₹{state.pendingTransaction.amount?.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Explicit Consequential Confirmation Buttons */}
                {state.stage === 'AWAITING_CONFIRMATION' && (
                  <div className="pt-2 flex flex-wrap gap-2.5 border-t border-emerald-200/60">
                    <button
                      onClick={() => sendVoiceText('Haan, save kar do')}
                      className="bg-[#167D73] hover:bg-[#105B55] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Save</span>
                    </button>
                    <button
                      onClick={() => sendVoiceText('Nahi, amount galat hai')}
                      className="bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-300 transition-all flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Correct Amount</span>
                    </button>
                  </div>
                )}

                {/* Disambiguation Choices if Multiple Customers Match */}
                {state.stage === 'DISAMBIGUATING' && state.pendingTransaction.disambiguationOptions && (
                  <div className="pt-2 space-y-2 border-t border-emerald-200/60">
                    <span className="text-xs font-bold text-gray-600">Which customer did you mean?</span>
                    <div className="flex flex-wrap gap-2">
                      {state.pendingTransaction.disambiguationOptions.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => sendVoiceText(`${tag} wale`)}
                          className="bg-[#7657E8] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#6342db] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>{tag} wale</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 5. Preset Test Voice Commands */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            Real Voice Test Cases (Speak Aloud or Click)
          </span>
          <span className="text-[10px] font-bold text-[#167D73] bg-[#E9F7F3] px-2.5 py-0.5 rounded-full">
            Prisma NLU & Timbre Tested
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {sampleChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendVoiceText(chip.label)}
              className="p-3 bg-gray-50 hover:bg-[#E9F7F3] border border-gray-200 hover:border-[#167D73] rounded-2xl text-left transition-all text-xs group"
            >
              <div className="font-extrabold text-gray-900 group-hover:text-[#167D73] leading-snug">
                "{chip.label}"
              </div>
              <div className="text-[10px] text-gray-400 mt-1">{chip.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Conversation History Audit Log */}
      {history.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-wider">
            <History className="w-4 h-4 text-gray-400" />
            <span>Voice Session Transcript Log</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {history.map((h) => (
              <div
                key={h.id}
                className={`p-3 rounded-2xl text-xs flex justify-between items-start gap-4 ${
                  h.sender === 'user'
                    ? 'bg-gray-100 ml-8 text-gray-900 font-semibold'
                    : 'bg-[#E9F7F3]/70 mr-8 text-[#0F766E] border border-[#167D73]/20'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block mb-0.5">
                    {h.sender === 'user' ? 'Merchant (Microphone)' : 'Gnani Voice Assistant'}
                  </span>
                  <span>{h.text}</span>
                </div>
                <div className="text-[10px] font-mono text-gray-400 shrink-0 text-right">
                  <div>{h.timestamp}</div>
                  {h.latencyMs && <div className="text-emerald-700 font-bold">{h.latencyMs}ms</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Safety, Disclosure & Ethical Notice */}
      <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-gray-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-gray-500 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#167D73] shrink-0" />
          <span>Gnani PS2 Compliance: Mandatory turn-1 AI disclosure active. Web Audio API streaming. Zero voice cloning. ACID transactional ledger commit.</span>
        </div>
        <div className="text-[10px] font-mono text-gray-400 shrink-0">
          Merchant Tenant: <strong>Sharma Electronics (org-sharma)</strong>
        </div>
      </div>
    </div>
  );
};

export default VoiceKhataWidget;
