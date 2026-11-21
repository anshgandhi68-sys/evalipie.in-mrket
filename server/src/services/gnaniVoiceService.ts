import { WebSocket, WebSocketServer } from 'ws';
import { voiceKhataStateMachine } from './voiceKhataStateMachine.js';

export function setupVoiceKhataWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req) => {
    const sessionId = `vs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Turn 1: Mandated Initial AI Disclosure greeting
    const initialState = voiceKhataStateMachine.startSession(sessionId);
    ws.send(JSON.stringify({
      type: 'SESSION_INITIALIZED',
      sessionId,
      state: initialState
    }));

    ws.on('message', async (data: Buffer | string) => {
      try {
        let message: any;
        if (typeof data === 'string' || (data instanceof Buffer && data[0] === 123 /* '{' */)) {
          message = JSON.parse(data.toString());
        } else {
          // Binary audio chunk received (Simulating PCM 16kHz chunk stream to Gnani Prisma)
          message = { type: 'AUDIO_CHUNK', length: data.length };
        }

        if (message.type === 'PROCESS_TRANSCRIPT' || message.type === 'SPOKEN_INPUT') {
          const transcript = message.transcript || '';
          
          // Send processing state
          ws.send(JSON.stringify({
            type: 'STATE_UPDATE',
            state: { stage: 'PROCESSING', partialTranscript: transcript }
          }));

          const updatedState = await voiceKhataStateMachine.processTranscript(sessionId, transcript);

          ws.send(JSON.stringify({
            type: 'STATE_UPDATE',
            state: updatedState
          }));
        }
      } catch (err: any) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          error: err.message || 'Error processing voice session'
        }));
      }
    });

    ws.on('close', () => {
      // Session cleanup
    });
  });
}
