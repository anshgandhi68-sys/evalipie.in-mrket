import { Request, Response } from 'express';
import { db } from '../db/connection.js';
import { voiceKhataStateMachine } from '../services/voiceKhataStateMachine.js';
import { transcribeAudioWithPrisma, synthesizeSpeechWithTimbre } from '../services/gnaniVoiceService.js';

export const voiceKhataController = {
  // GET /api/ledger/customers
  getCustomers: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const customers = Array.from(db.ledgerCustomers.values())
      .filter(c => c.organizationId === orgId)
      .sort((a, b) => b.currentBalance - a.currentBalance);
    res.json({ status: 'success', data: customers });
  },

  // GET /api/ledger/entries
  getEntries: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const customerId = req.query.customerId as string;
    
    let entries = db.ledgerEntries.filter(e => e.organizationId === orgId);
    if (customerId) {
      entries = entries.filter(e => e.customerId === customerId);
    }

    res.json({ status: 'success', data: entries });
  },

  // GET /api/ledger/summary
  getSummary: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const customers = Array.from(db.ledgerCustomers.values()).filter(c => c.organizationId === orgId);
    const totalOutstandingUdhaar = customers.reduce((sum, c) => sum + c.currentBalance, 0);

    const today = new Date().toISOString().split('T')[0];
    const todayEntries = db.ledgerEntries.filter(e => e.organizationId === orgId && e.createdAt.startsWith(today));
    const todayCreditGiven = todayEntries.filter(e => e.entryType === 'CREDIT').reduce((sum, e) => sum + e.amount, 0);
    const todayPaymentReceived = todayEntries.filter(e => e.entryType === 'PAYMENT').reduce((sum, e) => sum + e.amount, 0);

    res.json({
      status: 'success',
      data: {
        totalOutstandingUdhaar,
        todayCreditGiven,
        todayPaymentReceived,
        totalActiveCustomers: customers.length
      }
    });
  },

  // POST /api/voice/process-text (Voice Command Processor via REST with Gnani Timbre Audio Response)
  processVoiceText: async (req: Request, res: Response) => {
    try {
      const { sessionId, orgId } = req.body;
      const text = req.body.text || req.body.transcript;
      if (!text) {
        return res.status(400).json({ status: 'error', message: 'Voice text is required' });
      }

      const sId = sessionId || `vs-rest-${Date.now()}`;
      const state = await voiceKhataStateMachine.processTranscript(sId, text, orgId || 'org-sharma');
      
      // Synthesize response audio using Gnani Timbre
      let audioBase64 = '';
      if (state.spokenResponse) {
        try {
          const audioBuf = await synthesizeSpeechWithTimbre(state.spokenResponse, 'Nalini', 'hi-IN');
          audioBase64 = audioBuf.toString('base64');
        } catch (ttsErr: any) {
          console.warn('Gnani Timbre TTS generation error in processVoiceText:', ttsErr.message);
        }
      }

      res.json({ 
        status: 'success', 
        data: {
          ...state,
          audioBase64
        } 
      });
    } catch (err: any) {
      console.error('Error in processVoiceText:', err);
      res.status(500).json({ status: 'error', message: err.message || 'Internal voice processor error' });
    }
  },

  // POST /api/voice/process-audio (End-to-End Real Audio Processing: Prisma STT + State Machine + Timbre TTS)
  processVoiceAudio: async (req: Request, res: Response) => {
    try {
      const { sessionId, audioBase64, languageCode, orgId } = req.body;
      
      let audioBuffer: Buffer;
      if (Buffer.isBuffer(req.body)) {
        audioBuffer = req.body;
      } else if (audioBase64) {
        audioBuffer = Buffer.from(audioBase64, 'base64');
      } else {
        return res.status(400).json({ status: 'error', message: 'Audio buffer or audioBase64 is required' });
      }

      const sId = sessionId || `vs-audio-${Date.now()}`;

      // 1. Transcribe with Gnani Prisma v3.0
      const sttResult = await transcribeAudioWithPrisma(audioBuffer, languageCode || 'indic-auto');
      
      // 2. Process intent with state machine
      const state = await voiceKhataStateMachine.processTranscript(sId, sttResult.transcript, orgId || 'org-sharma');

      // 3. Synthesize speech response with Gnani Timbre
      let responseAudioBase64 = '';
      if (state.spokenResponse) {
        try {
          const audioBuf = await synthesizeSpeechWithTimbre(state.spokenResponse, 'Nalini', 'hi-IN');
          responseAudioBase64 = audioBuf.toString('base64');
        } catch (ttsErr: any) {
          console.warn('Gnani Timbre TTS error in processVoiceAudio:', ttsErr.message);
        }
      }

      res.json({
        status: 'success',
        data: {
          ...state,
          transcript: sttResult.transcript,
          detectedLanguage: sttResult.detectedLanguage,
          sttLatencyMs: sttResult.processingTimeMs,
          audioBase64: responseAudioBase64
        }
      });
    } catch (err: any) {
      console.error('Error in processVoiceAudio:', err);
      res.status(500).json({ status: 'error', message: err.message || 'Error processing speech audio' });
    }
  },

  // GET /api/voice/tts-stream (Direct Audio Stream for <audio> elements)
  streamTts: async (req: Request, res: Response) => {
    try {
      const text = (req.query.text as string) || '';
      const voice = (req.query.voice as string) || 'Nalini';
      const language = (req.query.language as string) || 'hi-IN';

      if (!text.trim()) {
        return res.status(400).send('Text parameter is required');
      }

      const audioBuf = await synthesizeSpeechWithTimbre(text, voice, language);
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuf.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(audioBuf);
    } catch (err: any) {
      console.error('Error streaming TTS audio:', err);
      res.status(500).send('Error generating TTS audio');
    }
  }
};
