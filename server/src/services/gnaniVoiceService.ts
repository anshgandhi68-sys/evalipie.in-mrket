import { config } from '../config.js';
import dotenv from 'dotenv';
dotenv.config();

export interface PrismaSttResult {
  success: boolean;
  transcript: string;
  detectedLanguage: string;
  processingTimeMs: number;
  model: string;
  requestId?: string;
}

export interface TimbreTtsOptions {
  voice?: string;
  language?: string;
  model?: 'timbre-v3.0' | 'timbre-v2.5';
  sampleRate?: number;
}

// Curated Catalogue Vocabulary for Gnani Prisma Key-Term Biasing
export const CATALOGUE_KEY_TERMS = [
  'boAt', 'Rockerz', 'Sony', 'WH-1000XM5', 'Apple', 'iPhone', 'iPhone 16',
  'Lenovo', 'ThinkPad', 'Ryzen', 'Keychron', 'Keychron K2', 'Mechanical Keyboard',
  'Nike', 'Air Zoom Pegasus', 'Running Shoes', 'ChefMax', 'Air Fryer',
  'ErgoFlex', 'Office Chair', 'Ergonomic', 'Smartwatch', 'Series 10',
  'Headphones', 'Earbuds', 'Wireless', 'Bluetooth', 'Noise Cancelling', 'ANC',
  'Bengaluru', 'Indiranagar', 'Jayanagar', 'Koramangala', 'Whitefield',
  'Sharma Electronics', 'Patel Digital', 'Apex Audio', 'Modern Living'
];

// Spoken Word Corrections for Indian E-Commerce Nuances
const SPOKEN_CORRECTIONS: Record<string, string> = {
  'ek aur': 'add one more',
  'pehla wala': 'first product',
  'doosra wala': 'second product',
  'dusra wala': 'second product',
  'teesra wala': 'third product',
  'dedh hazaar': '1500',
  'dhai hazaar': '2500',
  'paanch hazaar': '5000',
  'dus hazaar': '10000',
  'beas hazaar': '20000',
  'pachaas hazaar': '50000',
  'saath hazaar': '60000'
};

export class GnaniVoiceService {
  private apiKey: string;
  private sttRestUrl: string;
  private ttsUrl: string;

  constructor() {
    this.apiKey = process.env.GNANI_API_KEY || (config as any).gnaniApiKey || '';
    this.sttRestUrl = process.env.GNANI_STT_REST_URL || 'https://api.vachana.ai/stt/v3';
    this.ttsUrl = process.env.GNANI_TTS_URL || 'https://api.vachana.ai/api/v1/tts/inference';
  }

  /**
   * Transcribe Audio buffer using Gnani Prisma v3.0 STT
   * Includes key-term catalogue biasing & multi-language detection
   */
  async transcribe(
    audioBuffer: Buffer,
    languageCode: string = 'hi-IN',
    customTerms: string[] = []
  ): Promise<PrismaSttResult> {
    const startTime = Date.now();

    if (!this.apiKey) {
      throw new Error('GNANI_API_KEY is not configured on the server.');
    }

    try {
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('audio_file', audioBlob, 'speech.wav');
      formData.append('model', 'prisma-v3.0');
      formData.append('language_code', languageCode);

      // Add key-terms for domain biasing (up to 200 terms supported by Prisma v3.0)
      const combinedTerms = Array.from(new Set([...CATALOGUE_KEY_TERMS, ...customTerms])).slice(0, 50);
      if (combinedTerms.length > 0) {
        formData.append('key_terms', combinedTerms.join(','));
      }

      const response = await fetch(this.sttRestUrl, {
        method: 'POST',
        headers: {
          'X-API-Key-ID': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Gnani Prisma Error ${response.status}]:`, errorText);
        throw new Error(`Gnani Prisma STT failed (${response.status}): ${errorText}`);
      }

      const result = await response.json() as any;
      const processingTimeMs = Date.now() - startTime;

      let transcript = result.transcript || '';

      // Apply vocabulary normalization
      for (const [key, replacement] of Object.entries(SPOKEN_CORRECTIONS)) {
        if (transcript.toLowerCase().includes(key)) {
          transcript = transcript.replace(new RegExp(key, 'gi'), replacement);
        }
      }

      return {
        success: result.success ?? true,
        transcript: transcript.trim(),
        detectedLanguage: result.detected_language_code || languageCode,
        processingTimeMs,
        model: result.model || 'prisma-v3.0',
        requestId: result.request_id
      };
    } catch (err: any) {
      console.error('[Gnani STT Failure]:', err.message);
      throw err;
    }
  }

  /**
   * Synthesize Natural Voice Speech using Gnani Timbre v3.0 TTS
   * Returns audio WAV Buffer
   */
  async synthesize(
    text: string,
    options: TimbreTtsOptions = {}
  ): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('GNANI_API_KEY is not configured on the server.');
    }

    const {
      voice = 'Shivani', // Supported high-clarity female voice for timbre-v3.0
      language = 'hi-IN',
      model = 'timbre-v3.0',
      sampleRate = 24000
    } = options;

    // Currency & Number Spoken Preprocessing
    const spokenText = this.preprocessSpokenText(text);

    const payload = {
      text: spokenText,
      voice,
      model,
      language,
      audio_config: {
        sample_rate: sampleRate,
        encoding: 'linear_pcm',
        container: 'wav'
      }
    };

    const response = await fetch(this.ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': this.apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gnani Timbre Error ${response.status}]:`, errorText);
      throw new Error(`Gnani Timbre TTS failed (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Preprocess prices, numbers, and abbreviations for natural Indian speech pronunciation
   */
  private preprocessSpokenText(text: string): string {
    return text
      // Currency symbols: ₹1999 -> 1999 rupaye
      .replace(/₹\s?(\d[\d,]*)/g, (_, num) => `${num.replace(/,/g, '')} rupaye`)
      .replace(/Rs\.?\s?(\d[\d,]*)/gi, (_, num) => `${num.replace(/,/g, '')} rupaye`)
      // Spec units
      .replace(/(\d+)\s?GB/gi, '$1 GB')
      .replace(/(\d+)\s?MB/gi, '$1 MB')
      // Short clean pauses
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const gnaniVoiceService = new GnaniVoiceService();
