import { Client } from '@opensearch-project/opensearch';
import { memoryPg, ProductRow } from '../db/aivenPg.js';
import { SEED_PRODUCTS, CITIES } from '../db/aivenSeed.js';
import dotenv from 'dotenv';

dotenv.config();

export interface OpenSearchDoc {
  product_id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  original_mrp: number;
  city: string;
  sku: string;
  image_url: string;
  available_stock: number;
  tags: string[];
}

export interface SearchOptions {
  query?: string;
  category?: string;
  brand?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export class AivenOpenSearchService {
  private client: Client | null = null;
  public isConnected = false;
  public mode: 'aiven_opensearch' | 'embedded_fuzzy_index' = 'embedded_fuzzy_index';
  private indexName = process.env.OPENSEARCH_INDEX || 'evalipie_products';

  // Local In-Memory OpenSearch Index Replica
  private localIndex: Map<string, OpenSearchDoc> = new Map();

  constructor() {
    this.initOpenSearch();
    this.buildLocalIndex();
  }

  private async initOpenSearch() {
    const node = process.env.OPENSEARCH_NODE;
    if (node) {
      try {
        this.client = new Client({
          node,
          ssl: {
            rejectUnauthorized: false
          }
        });

        // Test cluster ping
        const info = await this.client.info();
        this.isConnected = true;
        this.mode = 'aiven_opensearch';
        console.log('[Aiven OpenSearch] Connected to cluster:', info.body.version.number);
        await this.bootstrapIndex();
      } catch (err: any) {
        console.warn('[Aiven OpenSearch] Connection failed, operating in Embedded Fuzzy Mode:', err.message);
        this.isConnected = false;
        this.mode = 'embedded_fuzzy_index';
      }
    } else {
      this.mode = 'embedded_fuzzy_index';
      console.log('[Aiven OpenSearch] No OPENSEARCH_NODE in .env; operating in High-Performance Embedded Fuzzy Index Mode.');
    }
  }

  private buildLocalIndex() {
    for (const p of SEED_PRODUCTS) {
      for (const city of CITIES) {
        const docId = `${p.id}-${city.toLowerCase()}`;
        const inv = memoryPg.findInventory(p.id, city);
        let stock = inv ? inv.available_stock : 5;
        if (p.id === 'prod-audio-boat-550' && city === 'Bengaluru') stock = 1;
        if (p.id === 'prod-mob-iphone-16' && city === 'Bengaluru') stock = 1;

        this.localIndex.set(docId, {
          product_id: p.id,
          name: p.title,
          description: p.description,
          category: p.category,
          brand: p.brand,
          price: p.price,
          original_mrp: p.originalMrp,
          city,
          sku: p.sku,
          image_url: p.imageUrl,
          available_stock: stock,
          tags: p.tags
        });
      }
    }
  }

  private async bootstrapIndex() {
    if (!this.client || !this.isConnected) return;
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (!exists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
              analysis: {
                analyzer: {
                  evalipie_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'asciifolding']
                  }
                }
              }
            },
            mappings: {
              properties: {
                product_id: { type: 'keyword' },
                name: { type: 'text', analyzer: 'evalipie_analyzer' },
                description: { type: 'text', analyzer: 'evalipie_analyzer' },
                category: { type: 'keyword' },
                brand: { type: 'keyword' },
                price: { type: 'float' },
                city: { type: 'keyword' },
                sku: { type: 'keyword' },
                image_url: { type: 'keyword' },
                available_stock: { type: 'integer' },
                tags: { type: 'keyword' }
              }
            }
          }
        });
        console.log(`[Aiven OpenSearch] Created index "${this.indexName}" with fuzzy mapping.`);

        // Populate index
        for (const doc of this.localIndex.values()) {
          await this.client.index({
            index: this.indexName,
            id: `${doc.product_id}-${doc.city.toLowerCase()}`,
            body: doc
          });
        }
      }
    } catch (err: any) {
      console.warn('[Aiven OpenSearch] Bootstrap index error:', err.message);
    }
  }

  // Real-time stock update
  syncProductStock(productId: string, city: string, stockDelta: number) {
    const docId = `${productId}-${city.toLowerCase()}`;
    const doc = this.localIndex.get(docId);
    if (doc) {
      doc.available_stock = Math.max(0, doc.available_stock + stockDelta);
      this.localIndex.set(docId, doc);
    }

    if (this.client && this.isConnected) {
      this.client.update({
        index: this.indexName,
        id: docId,
        body: {
          script: {
            source: 'ctx._source.available_stock += params.delta',
            params: { delta: stockDelta }
          }
        }
      }).catch(err => {
        console.warn('[Aiven OpenSearch] Async stock sync exception:', err.message);
      });
    }
  }

  // Fuzzy Search Implementation (Typo-Tolerant with Fuzziness: AUTO)
  async search(options: SearchOptions) {
    const startTime = Date.now();
    const city = options.city || 'Bengaluru';
    const limit = options.limit || 12;
    const page = options.page || 1;

    // ─────────────────────────────────────────────────────────────────
    // PATH A: Real Aiven OpenSearch Cluster Query
    // ─────────────────────────────────────────────────────────────────
    if (this.client && this.isConnected) {
      try {
        const mustClauses: any[] = [];
        const filterClauses: any[] = [{ term: { city } }];

        if (options.category && options.category !== 'All') {
          filterClauses.push({ term: { category: options.category.toUpperCase() } });
        }
        if (options.brand) {
          filterClauses.push({ term: { brand: options.brand } });
        }
        if (options.minPrice !== undefined || options.maxPrice !== undefined) {
          const range: any = {};
          if (options.minPrice !== undefined) range.gte = options.minPrice;
          if (options.maxPrice !== undefined) range.lte = options.maxPrice;
          filterClauses.push({ range: { price: range } });
        }
        if (options.inStockOnly) {
          filterClauses.push({ range: { available_stock: { gt: 0 } } });
        }

        if (options.query && options.query.trim()) {
          mustClauses.push({
            multi_match: {
              query: options.query,
              fields: ['name^3', 'brand^2', 'tags^2', 'description'],
              fuzziness: 'AUTO',
              prefix_length: 2
            }
          });
        } else {
          mustClauses.push({ match_all: {} });
        }

        let sortClause: any[] = ['_score'];
        if (options.sortBy === 'price_asc') sortClause = [{ price: 'asc' }];
        else if (options.sortBy === 'price_desc') sortClause = [{ price: 'desc' }];

        const osResult = await this.client.search({
          index: this.indexName,
          body: {
            from: (page - 1) * limit,
            size: limit,
            query: {
              bool: {
                must: mustClauses,
                filter: filterClauses
              }
            },
            sort: sortClause
          }
        });

        const hits = osResult.body.hits.hits.map((h: any) => h._source);
        const took = osResult.body.took || (Date.now() - startTime);
        const totalValue = typeof osResult.body?.hits?.total === 'number'
          ? osResult.body.hits.total
          : (osResult.body?.hits?.total?.value ?? hits.length);

        return {
          status: 'success',
          tookMs: took,
          engine: 'Aiven OpenSearch (fuzziness: AUTO)',
          total: totalValue,
          data: hits
        };
      } catch (err: any) {
        console.warn('[Aiven OpenSearch] Query error, using Embedded Index:', err.message);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // PATH B: High-Precision Embedded Levenshtein Fuzzy Search
    // ─────────────────────────────────────────────────────────────────
    let docs = Array.from(this.localIndex.values()).filter(d => d.city.toLowerCase() === city.toLowerCase());

    if (options.category && options.category !== 'All') {
      const cat = options.category.toUpperCase();
      docs = docs.filter(d => d.category.toUpperCase() === cat);
    }
    if (options.brand) {
      const b = options.brand.toLowerCase();
      docs = docs.filter(d => d.brand.toLowerCase().includes(b));
    }
    if (options.minPrice !== undefined) {
      docs = docs.filter(d => d.price >= (options.minPrice as number));
    }
    if (options.maxPrice !== undefined) {
      docs = docs.filter(d => d.price <= (options.maxPrice as number));
    }
    if (options.inStockOnly) {
      docs = docs.filter(d => d.available_stock > 0);
    }

    // Typo-Tolerant Scoring
    const q = (options.query || '').trim().toLowerCase();
    if (q) {
      const words = q.split(/\s+/).filter(Boolean);
      docs = docs.map(doc => {
        let score = 0;
        const text = `${doc.name} ${doc.brand} ${doc.category} ${doc.description} ${doc.tags.join(' ')}`.toLowerCase();
        
        // Exact phrase bonus
        if (text.includes(q)) score += 20;

        for (const w of words) {
          if (text.includes(w)) {
            score += 10;
          } else {
            // Levenshtein fuzzy distance check
            for (const token of text.split(/\s+/)) {
              if (token.length >= 4 && Math.abs(token.length - w.length) <= 2) {
                const dist = this.levenshtein(w, token);
                if (dist <= 2) {
                  score += 8 - dist * 2;
                }
              }
            }
          }
        }
        return { doc, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc);
    }

    // Sort
    if (options.sortBy === 'price_asc') {
      docs.sort((a, b) => a.price - b.price);
    } else if (options.sortBy === 'price_desc') {
      docs.sort((a, b) => b.price - a.price);
    }

    const tookMs = Date.now() - startTime;
    return {
      status: 'success',
      tookMs: Math.max(1, tookMs),
      engine: 'Embedded OpenSearch Replica (Fuzziness: AUTO)',
      total: docs.length,
      data: docs.slice((page - 1) * limit, page * limit)
    };
  }

  private levenshtein(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[a.length][b.length];
  }
}

export const aivenOpenSearch = new AivenOpenSearchService();
