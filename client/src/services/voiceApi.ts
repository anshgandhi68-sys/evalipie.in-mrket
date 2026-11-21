/**
 * Evalipie Voice API Client
 * Connects browser microphone & audio to Gnani Prisma v3.0 & Timbre v3.0
 */

export interface VoiceChatResponse {
  status: string;
  sessionId: string;
  transcript: string;
  detectedLanguage: string;
  stage: string;
  spokenResponse?: string;
  audioBase64?: string;
  state: any;
  latency?: {
    transcriptionMs: number;
    totalMs: number;
  };
}

export class VoiceApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_URL || '';
  }

  /**
   * Send text or base64 audio turn to Voice Assistant
   */
  async sendTurn(params: {
    sessionId: string;
    text?: string;
    audioBase64?: string;
    language?: string;
    city?: string;
  }): Promise<VoiceChatResponse> {
    const res = await fetch(`${this.baseUrl}/api/voice/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Voice processing failed' }));
      throw new Error(err.error || `Voice request failed with status ${res.status}`);
    }

    return res.json();
  }

  /**
   * Dedicated Transcribe endpoint (Prisma v3.0)
   */
  async transcribeAudio(audioBase64: string, language: string = 'hi-IN'): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/voice/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ audioBase64, language })
    });

    if (!res.ok) {
      throw new Error('Transcription failed');
    }

    return res.json();
  }

  /**
   * Dedicated Synthesize endpoint (Timbre v3.0)
   */
  async synthesizeSpeech(text: string, voice: string = 'Shivani', language: string = 'hi-IN'): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/api/voice/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, voice, language })
    });

    if (!res.ok) {
      throw new Error('Speech synthesis failed');
    }

    return res.blob();
  }

  /**
   * Confirm order button fallback
   */
  async confirmOrder(sessionId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/voice/order/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });

    if (!res.ok) {
      throw new Error('Order confirmation failed');
    }

    return res.json();
  }

  /**
   * Play synthesized WAV audio from Base64 or Blob
   */
  playAudio(audioBase64: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audio.onended = () => resolve(audio);
        audio.onerror = (e) => reject(e);
        audio.play().catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const voiceApi = new VoiceApiClient();
