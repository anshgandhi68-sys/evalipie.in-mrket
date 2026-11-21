import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { gnaniVoiceService } from './gnaniVoiceService.js';
import { voiceShoppingOrchestrator } from './voiceShoppingOrchestrator.js';

export function setupVoiceWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname === '/ws/voice' || pathname === '/api/voice/stream') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    const sessionId = `vs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const session = voiceShoppingOrchestrator.getSession(sessionId);

    // Initial Welcome Message
    const welcomeSpoken = 'Namaste! Main Evalipie Voice Assistant hoon. Aap bolkar koi bhi product dhoond sakte hain, cart mein add kar sakte hain aur order place kar sakte hain.';
    
    // Pre-synthesize welcome greeting
    gnaniVoiceService.synthesize(welcomeSpoken, { voice: 'Shivani', language: 'hi-IN' })
      .then(buf => {
        ws.send(JSON.stringify({
          type: 'SESSION_INITIALIZED',
          sessionId,
          state: session,
          spokenResponse: welcomeSpoken,
          audioBase64: buf.toString('base64')
        }));
      })
      .catch(err => {
        ws.send(JSON.stringify({
          type: 'SESSION_INITIALIZED',
          sessionId,
          state: session,
          spokenResponse: welcomeSpoken
        }));
      });

    const audioChunks: Buffer[] = [];

    ws.on('message', async (data) => {
      try {
        // Control JSON Message
        if (typeof data === 'string' || (data instanceof Buffer && data[0] === 123 /* '{' */)) {
          const message = JSON.parse(data.toString());

          // A: Client finished recording audio and sends command to transcribe & process
          if (message.type === 'PROCESS_AUDIO_COMPLETE') {
            const completeAudio = Buffer.concat(audioChunks);
            audioChunks.length = 0; // reset buffer

            const audioToProcess = message.audioBase64
              ? Buffer.from(message.audioBase64, 'base64')
              : completeAudio;

            if (audioToProcess.length === 0) {
              ws.send(JSON.stringify({ type: 'ERROR', error: 'No audio data received.' }));
              return;
            }

            // Step 1: Transcribe with Prisma v3.0
            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              stage: 'TRANSCRIBING',
              partialTranscript: 'Transcribing speech with Gnani Prisma v3.0...'
            }));

            const sttResult = await gnaniVoiceService.transcribe(
              audioToProcess,
              message.languageCode || session.language || 'hi-IN'
            );

            // Step 2: Feed transcript to Voice Shopping State Machine
            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              stage: 'PROCESSING',
              transcript: sttResult.transcript,
              detectedLanguage: sttResult.detectedLanguage
            }));

            const updatedSession = await voiceShoppingOrchestrator.processInteraction(
              sessionId,
              sttResult.transcript,
              sttResult.detectedLanguage,
              message.city || session.city
            );

            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              stage: updatedSession.stage,
              transcript: sttResult.transcript,
              detectedLanguage: sttResult.detectedLanguage,
              spokenResponse: updatedSession.spokenResponse,
              audioBase64: updatedSession.audioBase64,
              state: updatedSession
            }));
            return;
          }

          // B: Direct Text Spoken Input Message
          if (message.type === 'SPOKEN_INPUT' || message.type === 'PROCESS_TEXT') {
            const transcript = String(message.text || message.transcript || '').trim();
            if (!transcript) return;

            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              stage: 'PROCESSING',
              transcript
            }));

            const updatedSession = await voiceShoppingOrchestrator.processInteraction(
              sessionId,
              transcript,
              message.languageCode || session.language || 'hi-IN',
              message.city || session.city
            );

            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              stage: updatedSession.stage,
              transcript,
              spokenResponse: updatedSession.spokenResponse,
              audioBase64: updatedSession.audioBase64,
              state: updatedSession
            }));
            return;
          }
        } else if (data instanceof Buffer) {
          // Binary audio chunk streaming from microphone
          audioChunks.push(data);
          ws.send(JSON.stringify({
            type: 'AUDIO_CHUNK_ACK',
            chunkSize: data.length,
            totalBuffered: audioChunks.reduce((acc, c) => acc + c.length, 0)
          }));
        }
      } catch (err: any) {
        console.error('[Voice WS Handler Error]:', err);
        ws.send(JSON.stringify({
          type: 'ERROR',
          error: err.message || 'Error processing voice session.'
        }));
      }
    });

    ws.on('close', () => {
      audioChunks.length = 0;
    });
  });

  return wss;
}
