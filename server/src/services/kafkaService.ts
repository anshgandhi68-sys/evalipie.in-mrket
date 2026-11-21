import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { aivenPg, memoryPg, OutboxRow } from '../db/aivenPg.js';
import { sseEventStream } from '../controllers/eventsController.js';
import { aivenOpenSearch } from './openSearchService.js';
import dotenv from 'dotenv';

dotenv.config();

export interface KafkaLogMessage {
  id: string;
  topic: string;
  direction: 'PRODUCED' | 'CONSUMED';
  key?: string;
  payload: any;
  timestamp: string;
}

export class KafkaService {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  public isConnected = false;
  public mode: 'aiven_kafka' | 'embedded_event_bus' = 'embedded_event_bus';

  public eventLog: KafkaLogMessage[] = [];
  private processedEventIds: Set<string> = new Set();
  private relayTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initKafka();
    this.startOutboxRelay();
  }

  private async initKafka() {
    const brokersStr = process.env.KAFKA_BROKERS;
    if (brokersStr) {
      try {
        const brokers = brokersStr.split(',').map(b => b.trim());
        const sslConfig = process.env.KAFKA_SSL === 'false' ? false : {
          rejectUnauthorized: false
        };

        this.kafka = new Kafka({
          clientId: process.env.KAFKA_CLIENT_ID || 'evalipie-stocksync',
          brokers,
          ssl: sslConfig,
          logLevel: logLevel.WARN
        });

        this.producer = this.kafka.producer();
        await this.producer.connect();

        this.consumer = this.kafka.consumer({
          groupId: process.env.KAFKA_GROUP_ID || 'evalipie-consumer-group'
        });
        await this.consumer.connect();

        // Subscribe to all transactional topics
        await this.consumer.subscribe({
          topics: [
            'orders.placed',
            'inventory.updated',
            'orders.confirmed',
            'notifications.send',
            'search.index.sync'
          ],
          fromBeginning: false
        });

        this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            const raw = message.value?.toString();
            if (!raw) return;
            try {
              const payload = JSON.parse(raw);
              await this.handleIncomingMessage(topic, payload);
            } catch (err: any) {
              console.error(`[Kafka Consumer Error on ${topic}]:`, err.message);
            }
          }
        });

        this.isConnected = true;
        this.mode = 'aiven_kafka';
        console.log('[Aiven Kafka] Connected successfully to brokers:', brokers.join(', '));
      } catch (err: any) {
        console.warn('[Aiven Kafka] Connection failed, switching to Embedded Event Bus:', err.message);
        this.isConnected = false;
        this.mode = 'embedded_event_bus';
      }
    } else {
      this.mode = 'embedded_event_bus';
      console.log('[Aiven Kafka] No KAFKA_BROKERS in .env; operating in High-Reliability Embedded Event Bus Mode.');
    }
  }

  // Publish message to Kafka topic
  async publish(topic: string, payload: any, key?: string) {
    const eventId = payload.orderId || payload.id || `evt-${Date.now()}`;
    const logItem: KafkaLogMessage = {
      id: eventId,
      topic,
      direction: 'PRODUCED',
      key,
      payload,
      timestamp: new Date().toISOString()
    };
    this.recordLog(logItem);

    if (this.producer && this.isConnected) {
      try {
        await this.producer.send({
          topic,
          messages: [
            {
              key: key || eventId,
              value: JSON.stringify(payload),
              timestamp: String(Date.now())
            }
          ]
        });
        return;
      } catch (err: any) {
        console.warn(`[Aiven Kafka] Producer error on ${topic}, falling back to local dispatch:`, err.message);
      }
    }

    // Embedded dispatch
    setTimeout(() => {
      this.handleIncomingMessage(topic, payload);
    }, 10);
  }

  // Idempotent consumer message handler
  private async handleIncomingMessage(topic: string, payload: any) {
    const dedupeKey = `${topic}:${payload.orderId || payload.id || JSON.stringify(payload).slice(0, 50)}`;
    if (this.processedEventIds.has(dedupeKey)) {
      return; // Deduplicated
    }
    this.processedEventIds.add(dedupeKey);

    this.recordLog({
      id: payload.orderId || payload.id || `rx-${Date.now()}`,
      topic,
      direction: 'CONSUMED',
      payload,
      timestamp: new Date().toISOString()
    });

    // 1. Sync inventory changes to OpenSearch
    if (topic === 'orders.placed' || topic === 'inventory.updated') {
      if (payload.items && Array.isArray(payload.items)) {
        for (const item of payload.items) {
          aivenOpenSearch.syncProductStock(item.productId, item.city, -item.quantity);
        }
      }
    }

    // 2. Broadcast to Server-Sent Events stream
    if (topic === 'orders.placed') {
      sseEventStream.broadcast('orders.placed', payload);
      sseEventStream.broadcast('notifications.send', {
        id: `notif-${Date.now()}`,
        orderId: payload.orderId,
        message: `Order #${(payload.orderId || '').slice(-6).toUpperCase()} confirmed for ₹${(payload.totalAmount || 0).toLocaleString('en-IN')}`,
        customerName: payload.customerName,
        status: 'CONFIRMED',
        timestamp: new Date().toISOString()
      });
    } else if (topic === 'notifications.send') {
      sseEventStream.broadcast('notifications.send', payload);
    }
  }

  private recordLog(log: KafkaLogMessage) {
    this.eventLog.unshift(log);
    if (this.eventLog.length > 100) {
      this.eventLog.pop();
    }
  }

  // Outbox Relay Worker: polls outbox_events and publishes to Kafka with retry
  private startOutboxRelay() {
    this.relayTimer = setInterval(async () => {
      // 1. PostgreSQL Outbox
      if (aivenPg.isConnected) {
        try {
          const pending = await aivenPg.query(
            "SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 10"
          );
          for (const row of pending.rows) {
            try {
              await this.publish(row.event_type, typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload, row.aggregate_id);
              await aivenPg.query(
                "UPDATE outbox_events SET status = 'PUBLISHED', published_at = NOW() WHERE id = $1",
                [row.id]
              );
            } catch (pubErr) {
              await aivenPg.query(
                "UPDATE outbox_events SET retry_count = retry_count + 1 WHERE id = $1",
                [row.id]
              );
            }
          }
        } catch (err: any) {
          // ignore transient poll error
        }
      }

      // 2. Memory Outbox
      for (const [id, row] of memoryPg.outbox_events.entries()) {
        if (row.status === 'PENDING') {
          row.status = 'PUBLISHED';
          row.published_at = new Date();
          memoryPg.outbox_events.set(id, row);
        }
      }
    }, 2000);
  }

  getMetrics() {
    return {
      mode: this.mode,
      isConnected: this.isConnected,
      totalEventsLogged: this.eventLog.length,
      topics: [
        'orders.placed',
        'inventory.updated',
        'orders.confirmed',
        'notifications.send',
        'search.index.sync'
      ],
      recentEvents: this.eventLog.slice(0, 15)
    };
  }
}

export const kafkaEventProducer = new KafkaService();
