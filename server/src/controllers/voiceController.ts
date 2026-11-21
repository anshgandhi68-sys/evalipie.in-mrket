import { Request, Response } from 'express';
import { gnaniVoiceService } from '../services/gnaniVoiceService.js';
import { voiceShoppingOrchestrator } from '../services/voiceShoppingOrchestrator.js';

export class VoiceController {
  /**
   * POST /api/voice/chat
   * Full end-to-end voice shopping conversation turn:
   * Accepts text or raw base64 audio, transcribes with Prisma,
   * executes orchestration, and synthesizes audio with Timbre.
   */
  async chat(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const {
        sessionId = `vs-${Date.now()}`,
        message,
        text,
        audioBase64,
        language = 'hi-IN',
        city = 'Bengaluru'
      } = req.body;

      let userInput = (text || message || '').trim();
      let transcriptionLatencyMs = 0;
      let detectedLanguage = language;

      // 1. If audio is supplied, transcribe with Gnani Prisma v3.0
      if (audioBase64 && !userInput) {
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const sttResult = await gnaniVoiceService.transcribe(audioBuffer, language);
        userInput = sttResult.transcript;
        detectedLanguage = sttResult.detectedLanguage;
        transcriptionLatencyMs = sttResult.processingTimeMs;
      }

      if (!userInput) {
        return res.status(400).json({
          status: 'error',
          error: 'Either text or audioBase64 is required.'
        });
      }

      // 2. Process interaction through state machine
      const sessionState = await voiceShoppingOrchestrator.processInteraction(
        sessionId,
        userInput,
        detectedLanguage,
        city
      );

      const totalLatencyMs = Date.now() - startTime;

      return res.json({
        status: 'success',
        sessionId: sessionState.sessionId,
        transcript: userInput,
        detectedLanguage,
        stage: sessionState.stage,
        spokenResponse: sessionState.spokenResponse,
        audioBase64: sessionState.audioBase64,
        state: sessionState,
        latency: {
          transcriptionMs: transcriptionLatencyMs,
          totalMs: totalLatencyMs
        }
      });
    } catch (err: any) {
      console.error('[VoiceController Error]:', err);
      return res.status(500).json({
        status: 'error',
        error: 'Voice processing failed: ' + err.message
      });
    }
  }

  /**
   * POST /api/voice/transcribe
   * Dedicated speech-to-text with Gnani Prisma v3.0
   */
  async transcribe(req: Request, res: Response) {
    try {
      const { audioBase64, language = 'hi-IN' } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'audioBase64 is required.' });
      }

      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const result = await gnaniVoiceService.transcribe(audioBuffer, language);

      return res.json({
        status: 'success',
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/voice/synthesize
   * Dedicated text-to-speech with Gnani Timbre v3.0
   */
  async synthesize(req: Request, res: Response) {
    try {
      const { text, voice = 'Shivani', language = 'hi-IN' } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'text is required.' });
      }

      const audioBuffer = await gnaniVoiceService.synthesize(text, {
        voice,
        language,
        model: 'timbre-v3.0'
      });

      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.length);
      return res.send(audioBuffer);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/voice/session/:id
   */
  getSession(req: Request, res: Response) {
    const session = voiceShoppingOrchestrator.getSession(req.params.id);
    return res.json({ status: 'success', data: session });
  }

  /**
   * POST /api/voice/order/confirm
   * Direct visual confirmation button fallback
   */
  async confirmOrder(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required.' });
      }

      const session = voiceShoppingOrchestrator.getSession(sessionId);
      session.stage = 'CONFIRMATION_PENDING';
      const updated = await voiceShoppingOrchestrator.processInteraction(
        sessionId,
        'Haan, order place kar do',
        session.language,
        session.city
      );

      return res.json({ status: 'success', data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const voiceController = new VoiceController();
