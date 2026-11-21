import { v4 as uuidv4 } from 'uuid';
import { intentParser } from './intent-parser.js';
import { searchProducts } from './tools/search-products.js';
import { productRankingEngine } from './product-ranking.js';
import { responseGenerator } from './response-generator.js';
import { compareProducts } from './tools/compare-products.js';
import { findAlternatives } from './tools/find-alternatives.js';
import { DiscoveryRequest, DiscoveryResponse, StructuredIntent, ProductOfferMatch } from './schemas.js';

export interface ConversationTurn {
  id: string;
  userPrompt: string;
  intent: StructuredIntent;
  matches: ProductOfferMatch[];
  message: string;
  timestamp: string;
}

export interface ConversationSession {
  id: string;
  turns: ConversationTurn[];
  city: string;
  updatedAt: string;
}

export class ProductDiscoveryOrchestrator {
  private sessions: Map<string, ConversationSession> = new Map();

  /**
   * Main discovery entry point.
   * Full pipeline: Context Retrieval -> Parse Intent -> Controlled Search -> Deterministic Rank -> Grounded Synthesis.
   */
  async discover(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    const startTime = Date.now();
    const conversationId = request.conversationId || uuidv4();
    const city = request.city || 'Bengaluru';

    // 1. Retrieve or create session context for multi-turn shopping
    let session = this.sessions.get(conversationId);
    if (!session) {
      session = {
        id: conversationId,
        turns: [],
        city,
        updatedAt: new Date().toISOString()
      };
      this.sessions.set(conversationId, session);
    }

    // 2. Parse Multilingual Shopping Intent
    const { intent, source } = await intentParser.parse(request.prompt);

    // Multi-turn context preservation (if query is a follow-up refinement)
    if (session.turns.length > 0) {
      const lastTurn = session.turns[session.turns.length - 1];
      const isRefinement =
        request.prompt.toLowerCase().includes('more') ||
        request.prompt.toLowerCase().includes('cheaper') ||
        request.prompt.toLowerCase().includes('lighter') ||
        request.prompt.toLowerCase().includes('other') ||
        request.prompt.toLowerCase().includes('only') ||
        !intent.category;

      if (isRefinement && lastTurn.intent.category) {
        if (!intent.category) intent.category = lastTurn.intent.category;
        if (!intent.budget.max && lastTurn.intent.budget.max) intent.budget.max = lastTurn.intent.budget.max;
        if (!intent.brand && lastTurn.intent.brand) intent.brand = lastTurn.intent.brand;
      }
    }

    // Apply explicit request filters if provided
    if (request.filters?.category) {
      intent.category = request.filters.category;
    }
    if (request.filters?.maxPrice) {
      intent.budget.max = request.filters.maxPrice;
    }

    // 3. Controlled Catalogue Search
    const searchCandidates = searchProducts({
      query: intent.query,
      category: intent.category || undefined,
      brand: intent.brand || undefined,
      maxPrice: intent.budget.max || undefined,
      city,
      limit: 10
    });

    // 4. Deterministic Ranking
    const rankedMatches = productRankingEngine.rank(searchCandidates, intent, city);

    // 5. Grounded Response Synthesis
    const { message, followUpSuggestions } = await responseGenerator.generate(
      request.prompt,
      intent,
      rankedMatches
    );

    // 6. Record turn in conversation session
    session.turns.push({
      id: uuidv4(),
      userPrompt: request.prompt,
      intent,
      matches: rankedMatches,
      message,
      timestamp: new Date().toISOString()
    });
    session.updatedAt = new Date().toISOString();

    // 7. Unmet Demand Detection
    const unmetDemandLogged = rankedMatches.length === 0 && Boolean(intent.query);

    const totalLatency = Date.now() - startTime;

    return {
      conversationId,
      intent,
      message,
      followUpSuggestions,
      matches: rankedMatches,
      totalFound: rankedMatches.length,
      source,
      latencyMs: totalLatency,
      unmetDemandLogged
    };
  }

  /**
   * Compare multiple products side-by-side using authoritative records.
   */
  compare(productIds: string[], city = 'Bengaluru') {
    return compareProducts(productIds, city);
  }

  /**
   * Find verified alternatives for a given product.
   */
  alternatives(productId: string, maxPrice?: number, city = 'Bengaluru') {
    return findAlternatives(productId, maxPrice, city);
  }

  /**
   * Get historical context of a conversation session.
   */
  getConversation(id: string): ConversationSession | null {
    return this.sessions.get(id) || null;
  }

  /**
   * Clear historical context of a conversation session.
   */
  clearConversation(id: string): boolean {
    return this.sessions.delete(id);
  }
}

export const productDiscoveryOrchestrator = new ProductDiscoveryOrchestrator();
