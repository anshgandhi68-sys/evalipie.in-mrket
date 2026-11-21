import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export interface InventoryRow {
  id: string;
  product_id: string;
  city: string;
  available_stock: number;
  reserved_stock: number;
  reorder_threshold: number;
  store_name: string;
  store_address: string;
  distance_km: number;
  updated_at: Date;
}

export interface ProductRow {
  id: string;
  title: string;
  brand: string;
  category: string;
  category_id?: string;
  sku: string;
  description: string;
  price: number;
  original_mrp: number;
  image_url: string;
  attributes: Record<string, any>;
  tags: string[];
  created_at: Date;
}

export interface OrderRow {
  id: string;
  idempotency_key: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  total_amount: number;
  status: string;
  fulfillment_type: string;
  created_at: Date;
  paymentStatus?: string;
  paymentId?: string;
  paidAt?: string;
  razorpayQrId?: string;
  razorpayOrderId?: string;
}

export interface OutboxRow {
  id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  payload: any;
  status: string;
  retry_count: number;
  published_at?: Date | null;
  created_at: Date;
}

// Memory ACID Buffer for offline/mock development when Aiven DATABASE_URL is not yet supplied
class MemoryPostgreSqlStore {
  users: Map<string, any> = new Map();
  categories: Map<string, any> = new Map();
  products: Map<string, ProductRow> = new Map();
  inventory: Map<string, InventoryRow> = new Map();
  carts: Map<string, any> = new Map();
  cart_items: Map<string, any> = new Map();
  orders: Map<string, OrderRow> = new Map();
  order_items: Map<string, any[]> = new Map();
  payments: Map<string, any> = new Map();
  outbox_events: Map<string, OutboxRow> = new Map();

  private rowLocks: Set<string> = new Set();

  async acquireRowLock(key: string, timeoutMs = 3000): Promise<() => void> {
    const start = Date.now();
    while (this.rowLocks.has(key)) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`LockTimeout: Could not acquire lock for row ${key} within ${timeoutMs}ms`);
      }
      await new Promise(r => setTimeout(r, 20));
    }
    this.rowLocks.add(key);
    return () => {
      this.rowLocks.delete(key);
    };
  }

  findInventory(productId: string, city: string): InventoryRow | undefined {
    for (const inv of this.inventory.values()) {
      if (inv.product_id === productId && inv.city.toLowerCase() === city.toLowerCase()) {
        return inv;
      }
    }
    return undefined;
  }
}

export const memoryPg = new MemoryPostgreSqlStore();

class AivenPgService {
  private pool: pg.Pool | null = null;
  public isConnected = false;
  public mode: 'aiven_postgresql' | 'memory_acid' = 'memory_acid';

  constructor() {
    this.initPool();
  }

  private initPool() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString && connectionString.startsWith('postgres')) {
      try {
        this.pool = new Pool({
          connectionString,
          ssl: {
            rejectUnauthorized: false
          },
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        });

        this.pool.on('error', (err) => {
          console.warn('[Aiven PostgreSQL] Pool error, switching to Memory ACID mode:', err.message);
          this.isConnected = false;
          this.mode = 'memory_acid';
        });

        // Test connection
        this.pool.query('SELECT NOW()')
          .then(() => {
            this.isConnected = true;
            this.mode = 'aiven_postgresql';
            console.log('[Aiven PostgreSQL] Connected successfully to Aiven Cloud DB.');
            this.bootstrapSchema();
          })
          .catch((err) => {
            console.warn('[Aiven PostgreSQL] Connection test failed, operating in Memory ACID mode:', err.message);
            this.isConnected = false;
            this.mode = 'memory_acid';
          });
      } catch (err: any) {
        console.warn('[Aiven PostgreSQL] Initialization exception:', err.message);
        this.mode = 'memory_acid';
      }
    } else {
      this.mode = 'memory_acid';
      console.log('[Aiven PostgreSQL] No DATABASE_URL in .env; operating in High-Speed ACID In-Memory Mode.');
    }
  }

  async bootstrapSchema() {
    if (!this.pool || !this.isConnected) return;
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(32),
        role VARCHAR(32) DEFAULT 'CUSTOMER',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) UNIQUE NOT NULL,
        slug VARCHAR(128) UNIQUE NOT NULL,
        description TEXT,
        icon_name VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brand VARCHAR(128) NOT NULL,
        category VARCHAR(128) NOT NULL,
        sku VARCHAR(128) UNIQUE NOT NULL,
        description TEXT,
        price NUMERIC(12, 2) NOT NULL,
        original_mrp NUMERIC(12, 2),
        image_url TEXT NOT NULL,
        attributes JSONB DEFAULT '{}'::jsonb,
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
        city VARCHAR(64) NOT NULL,
        available_stock INT NOT NULL DEFAULT 0,
        reserved_stock INT NOT NULL DEFAULT 0,
        reorder_threshold INT DEFAULT 5,
        store_name VARCHAR(255) NOT NULL,
        store_address TEXT NOT NULL,
        distance_km NUMERIC(4, 1) DEFAULT 1.0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_product_city UNIQUE (product_id, city)
      );

      CREATE INDEX IF NOT EXISTS idx_inventory_lookup ON inventory(product_id, city);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

      CREATE TABLE IF NOT EXISTS carts (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        session_id VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR(64) PRIMARY KEY,
        cart_id VARCHAR(64) REFERENCES carts(id) ON DELETE CASCADE,
        product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
        city VARCHAR(64) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_cart_item UNIQUE (cart_id, product_id, city)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        idempotency_key VARCHAR(128) UNIQUE NOT NULL,
        user_id VARCHAR(64),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(32) NOT NULL,
        delivery_address TEXT,
        city VARCHAR(64) NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(64) NOT NULL DEFAULT 'CONFIRMED',
        fulfillment_type VARCHAR(64) DEFAULT 'STORE_PICKUP',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(64) REFERENCES products(id),
        product_title VARCHAR(255) NOT NULL,
        city VARCHAR(64) NOT NULL,
        quantity INT NOT NULL,
        unit_price NUMERIC(12, 2) NOT NULL,
        total_price NUMERIC(12, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
        payment_method VARCHAR(64) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(64) NOT NULL DEFAULT 'COMPLETED',
        transaction_ref VARCHAR(128),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS outbox_events (
        id VARCHAR(64) PRIMARY KEY,
        event_type VARCHAR(128) NOT NULL,
        aggregate_type VARCHAR(128) NOT NULL,
        aggregate_id VARCHAR(128) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
        retry_count INT DEFAULT 0,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(status) WHERE status = 'PENDING';
    `;

    try {
      await this.pool.query(schemaSql);
      console.log('[Aiven PostgreSQL] Tables & Indexes bootstrapped.');
    } catch (err: any) {
      console.error('[Aiven PostgreSQL] Error bootstrapping schema:', err.message);
    }
  }

  async query(text: string, params?: any[]) {
    if (this.pool && this.isConnected) {
      return this.pool.query(text, params);
    }
    // Return empty result structure if in memory mode
    return { rows: [], rowCount: 0 };
  }

  async getClient(): Promise<pg.PoolClient | null> {
    if (this.pool && this.isConnected) {
      return this.pool.connect();
    }
    return null;
  }
}

export const aivenPg = new AivenPgService();
