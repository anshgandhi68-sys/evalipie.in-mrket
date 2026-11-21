import { WebSocket, WebSocketServer } from 'ws';
import { config } from '../config.js';
import { voiceKhataStateMachine } from './voiceKhataStateMachine.js';

export interface PrismaSttResult {
  success: boolean;
  transcript: string;
  detectedLanguage: string;
  processingTimeMs: number;
  model: string;
}

/**
 * Transcribe speech using real Gnani Prisma v3.0 STT API
 */
export async function transcribeAudioWithPrisma(
  audioBuffer: Buffer,
  languageCode = 'indic-auto',
  model = 'prisma-v3.0'
): Promise<PrismaSttResult> {
  const startTime = Date.now();

  if (!config.gnaniApiKey) {
    throw new Error('GNANI_API_KEY is not configured on the server.');
  }

  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
  formData.append('audio_file', audioBlob, 'audio.wav');
  formData.append('model', model);
  formData.append('language_code', languageCode);

  const response = await fetch(config.gnaniSttRestUrl, {
    method: 'POST',
    headers: {
      'X-API-Key-ID': config.gnaniApiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gnani Prisma STT Error (${response.status}):`, errorText);
    throw new Error(`Gnani Prisma STT failed with status ${response.status}: ${errorText}`);
  }

  const result = await response.json() as any;
  const processingTimeMs = Date.now() - startTime;

  return {
    success: result.success ?? true,
    transcript: result.transcript || '',
    detectedLanguage: result.detected_language_code || languageCode,
    processingTimeMs,
    model: result.model || model,
  };
}

/**
 * Synthesize speech using real Gnani Timbre TTS API
 */
export async function synthesizeSpeechWithTimbre(
  text: string,
  voice = 'Nalini',
  language = 'hi-IN',
  model = 'timbre-v2.5'
): Promise<Buffer> {
  if (!config.gnaniApiKey) {
    throw new Error('GNANI_API_KEY is not configured on the server.');
  }

  const payload = {
    text,
    voice,
    model,
    language,
    audio_config: {
      sample_rate: 24000,
      encoding: 'linear_pcm',
      container: 'wav',
    },
  };

  const response = await fetch(config.gnaniTtsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key-ID': config.gnaniApiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gnani Timbre TTS Error (${response.status}):`, errorText);
    throw new Error(`Gnani Timbre TTS failed with status ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Secure Backend WebSocket Proxy for Voice Khata
 * The client connects here; the server proxies to Gnani AI securely.
 * The GNANI_API_KEY is NEVER exposed to the frontend browser!
 */
export function setupVoiceKhataWebSocket(wss: WebSocketServer) {
  wss.on('connection', async (ws: WebSocket) => {
    const sessionId = `vs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Turn 1: Mandated Initial Indic AI Disclosure greeting
    const initialState = voiceKhataStateMachine.startSession(sessionId);

    // Synthesize spoken greeting using real Gnani Timbre
    let greetingAudioBase64 = '';
    try {
      if (config.gnaniApiKey && initialState.spokenResponse) {
        const audioBuf = await synthesizeSpeechWithTimbre(initialState.spokenResponse, 'Nalini', 'hi-IN');
        greetingAudioBase64 = audioBuf.toString('base64');
      }
    } catch (err: any) {
      console.warn('Could not pre-synthesize greeting with Gnani Timbre:', err.message);
    }

    ws.send(JSON.stringify({
      type: 'SESSION_INITIALIZED',
      sessionId,
      state: initialState,
      audioBase64: greetingAudioBase64,
    }));

    // Audio accumulator for streaming audio chunks
    const audioChunks: Buffer[] = [];

    ws.on('message', async (data: Buffer | string) => {
      try {
        // 1. If JSON control message
        if (typeof data === 'string' || (data instanceof Buffer && data[0] === 123 /* '{' */)) {
          const message = JSON.parse(data.toString());

          // Client finishes recording audio and asks to process
          if (message.type === 'PROCESS_AUDIO_COMPLETE') {
            const completeAudio = Buffer.concat(audioChunks);
            audioChunks.length = 0; // reset accumulator

            if (completeAudio.length === 0 && !message.audioBase64) {
              ws.send(JSON.stringify({ type: 'ERROR', error: 'No audio data received' }));
              return;
            }

            const audioToProcess = message.audioBase64 
              ? Buffer.from(message.audioBase64, 'base64') 
              : completeAudio;

            // Step 1: Transcribe using Gnani Prisma v3.0
            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              state: { stage: 'TRANSCRIBING', partialTranscript: 'Transcribing with Gnani Prisma v3.0...' },
            }));

            const sttResult = await transcribeAudioWithPrisma(audioToProcess, message.languageCode || 'indic-auto');
            
            // Step 2: Feed into Voice Khata State Machine
            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              state: { stage: 'THINKING', finalTranscript: sttResult.transcript },
            }));

            const updatedState = await voiceKhataStateMachine.processTranscript(
              sessionId,
              sttResult.transcript,
              message.orgId || 'org-sharma'
            );

            // Step 3: Synthesize Voice Response with Gnani Timbre
            let responseAudioBase64 = '';
            if (updatedState.spokenResponse) {
              try {
                const audioBuf = await synthesizeSpeechWithTimbre(updatedState.spokenResponse, 'Nalini', 'hi-IN');
                responseAudioBase64 = audioBuf.toString('base64');
              } catch (ttsErr: any) {
                console.warn('Gnani Timbre TTS generation error:', ttsErr.message);
              }
            }

            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              state: updatedState,
              transcript: sttResult.transcript,
              detectedLanguage: sttResult.detectedLanguage,
              audioBase64: responseAudioBase64,
              sttLatencyMs: sttResult.processingTimeMs,
            }));
            return;
          }

          // Direct Text / Spoken Input message
          if (message.type === 'PROCESS_TRANSCRIPT' || message.type === 'SPOKEN_INPUT') {
            const transcript = message.transcript || '';
            
            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              state: { stage: 'THINKING', partialTranscript: transcript },
            }));

            const updatedState = await voiceKhataStateMachine.processTranscript(
              sessionId,
              transcript,
              message.orgId || 'org-sharma'
            );

            let responseAudioBase64 = '';
            if (updatedState.spokenResponse) {
              try {
                const audioBuf = await synthesizeSpeechWithTimbre(updatedState.spokenResponse, 'Nalini', 'hi-IN');
                responseAudioBase64 = audioBuf.toString('base64');
              } catch (ttsErr: any) {
                console.warn('Gnani Timbre TTS error:', ttsErr.message);
              }
            }

            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              state: updatedState,
              audioBase64: responseAudioBase64,
            }));
            return;
          }
        } else if (data instanceof Buffer) {
          // Binary audio chunk received from real-time microphone stream
          audioChunks.push(data);
          ws.send(JSON.stringify({
            type: 'AUDIO_CHUNK_ACK',
            chunkSize: data.length,
            totalBuffered: audioChunks.reduce((acc, c) => acc + c.length, 0),
          }));
        }
      } catch (err: any) {
        console.error('Error in Voice Khata WebSocket handler:', err);
        ws.send(JSON.stringify({
          type: 'ERROR',
          error: err.message || 'Error processing voice session',
        }));
      }
    });

    ws.on('close', () => {
      audioChunks.length = 0;
    });
  });
}
