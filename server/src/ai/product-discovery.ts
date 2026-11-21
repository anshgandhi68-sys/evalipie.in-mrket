import { v4 as uuidv4 } from 'uuid';
import { intentParser } from './intent-parser.js';
import { searchProducts } from './tools/search-products.js';
import { productRankingEngine } from './product-ranking.js';
import { responseGenerator } from './response-generator.js';
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
   * Full pipeline: Parse Intent -> Controlled Search -> Deterministic Rank -> Grounded Synthesis.
   */
  async discover(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    const startTime = Date.now();
    const conversationId = request.conversationId || uuidv4();
    const city = request.city || 'Bengaluru';

    // 1. Retrieve or create session context
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
   * Get historical context of a conversation
   */
  getConversation(id: string): ConversationSession | null {
    return this.sessions.get(id) || null;
  }
}

export const productDiscoveryOrchestrator = new ProductDiscoveryOrchestrator();
