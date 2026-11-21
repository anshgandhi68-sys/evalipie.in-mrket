import { Request, Response } from 'express';

export class SseEventStream {
  private clients: Set<Response> = new Set();

  handleConnection(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    this.clients.add(res);

    // Initial connection acknowledgment
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clients: this.clients.size, timestamp: new Date().toISOString() })}\n\n`);

    // Keep-alive heartbeat every 20 seconds
    const interval = setInterval(() => {
      res.write(':keepalive\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(interval);
      this.clients.delete(res);
    });
  }

  broadcast(eventType: string, data: any) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  getClientCount() {
    return this.clients.size;
  }
}

export const sseEventStream = new SseEventStream();
