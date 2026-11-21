import { db } from '../db/connection.js';
import { OutboxEvent } from '../../../shared/types.js';

type EventHandler = (event: OutboxEvent) => Promise<void> | void;

export class OutboxService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Map<string, EventHandler[]> = new Map();

  constructor() {
    this.setupConsumers();
    this.startWorker();
  }

  // Register Kafka topic subscriber
  subscribe(topic: string, handler: EventHandler) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic)!.push(handler);
  }

  // Setup default internal Kafka consumers
  private setupConsumers() {
    // 1. OpenSearch Sync Consumer
    this.subscribe('evalipie.inventory.changed', async (event) => {
      // Simulates real-time OpenSearch partial index update
      // In production with live Aiven OpenSearch, executes POST /evalipie_catalog/_update_by_query
      // console.log(`[Kafka Consumer -> OpenSearch Sync] Received event:`, event.payload);
    });

    // 2. Merchant Order Notification Consumer
    this.subscribe('evalipie.order.placed', async (event) => {
      // Simulates real-time merchant notification
      // console.log(`[Kafka Consumer -> Merchant Alert] Order notification:`, event.payload);
    });
  }

  // Start Outbox Poller (Polling every 500ms)
  startWorker() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      await this.drainPendingEvents();
    }, 500);
  }

  stopWorker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  // Drain pending outbox events
  async drainPendingEvents() {
    const pending = db.outbox.filter(e => !e.dispatchedAt);
    if (pending.length === 0) return;

    for (const event of pending) {
      try {
        // Stream to Kafka subscribers
        const handlers = this.subscribers.get(event.topic) || [];
        for (const handler of handlers) {
          await handler(event);
        }

        // Mark as dispatched
        event.dispatchedAt = new Date().toISOString();
      } catch (err: any) {
        event.retryCount++;
        event.lastError = err.message || 'Dispatch error';
      }
    }
  }

  // Admin stats
  getStats() {
    const total = db.outbox.length;
    const dispatched = db.outbox.filter(e => e.dispatchedAt).length;
    const pending = total - dispatched;

    return {
      totalEvents: total,
      dispatchedEvents: dispatched,
      pendingEvents: pending,
      activeTopics: ['evalipie.order.placed', 'evalipie.inventory.changed', 'evalipie.listing.updated'],
      recentEvents: db.outbox.slice(0, 10)
    };
  }
}

export const outboxService = new OutboxService();
