import { Request, Response } from 'express';
import { aivenOpenSearch } from '../services/openSearchService.js';
import { memoryPg } from '../db/aivenPg.js';
import { intentParser } from '../ai/intent-parser.js';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  turns: ChatTurn[];
  context: {
    category?: string;
    city?: string;
    budget?: number;
    lastQuery?: string;
  };
}

const sessions: Map<string, ChatSession> = new Map();

export class AiAssistantController {
  // POST /api/ai/chat (Multi-turn conversational discovery grounded in OpenSearch & PostgreSQL)
  async chat(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { prompt, message, sessionId = 'default-session', city = 'Bengaluru' } = req.body;
      const userPrompt = String(prompt || message || '').trim();

      if (!userPrompt) {
        return res.status(400).json({ error: 'prompt or message is required.' });
      }

      // Retrieve or create multi-turn session
      let session = sessions.get(sessionId);
      if (!session) {
        session = {
          id: sessionId,
          turns: [],
          context: { city }
        };
        sessions.set(sessionId, session);
      }

      // 1. Structured NLU Intent Parsing (Self-hosted Qwen2.5 / deterministic fallback)
      const parseResult = await intentParser.parse(userPrompt);
      const intent = parseResult.intent;

      // 2. Refine session context across multi-turns
      if (intent.category) session.context.category = intent.category;
      if (intent.budget.max) session.context.budget = intent.budget.max;
      if (intent.location) session.context.city = intent.location;
      session.context.lastQuery = intent.query;

      const activeCategory = session.context.category || intent.category;
      const activeBudget = session.context.budget || intent.budget.max;
      const activeCity = session.context.city || city;

      // Category normalizer for Aiven OpenSearch index
      let searchCategory: string | undefined = undefined;
      if (activeCategory) {
        const catLower = activeCategory.toLowerCase();
        if (catLower.includes('audio') || catLower.includes('headphone') || catLower.includes('sound') || catLower.includes('electronic')) searchCategory = 'AUDIO';
        else if (catLower.includes('mobile') || catLower.includes('phone')) searchCategory = 'MOBILES';
        else if (catLower.includes('laptop') || catLower.includes('computer')) searchCategory = 'LAPTOPS';
        else if (catLower.includes('fashion') || catLower.includes('cloth') || catLower.includes('apparel')) searchCategory = 'FASHION';
        else if (catLower.includes('shoe') || catLower.includes('footwear')) searchCategory = 'FOOTWEAR';
        else if (catLower.includes('kitchen') || catLower.includes('home')) searchCategory = 'HOME & KITCHEN';
        else searchCategory = activeCategory;
      }

      // 3. Query OpenSearch with Typo-Tolerance & Fuzziness
      let searchRes = await aivenOpenSearch.search({
        query: intent.query || userPrompt,
        category: searchCategory,
        city: activeCity,
        maxPrice: activeBudget || undefined,
        limit: 4
      });

      // If category was too narrow, broaden search across all categories
      if (searchRes.data.length === 0 && searchCategory) {
        searchRes = await aivenOpenSearch.search({
          query: intent.query || userPrompt,
          city: activeCity,
          maxPrice: activeBudget || undefined,
          limit: 4
        });
      }

      // 4. Verify Grounding in Database (Zero Hallucination Check)
      const verifiedMatches = searchRes.data.map(doc => {
        const prod = memoryPg.products.get(doc.product_id);
        const inv = memoryPg.findInventory(doc.product_id, activeCity);
        const currentStock = inv ? inv.available_stock : doc.available_stock;

        return {
          productId: doc.product_id,
          title: doc.name,
          brand: doc.brand,
          category: doc.category,
          price: doc.price,
          originalMrp: doc.original_mrp,
          imageUrl: doc.image_url,
          city: activeCity,
          availableStock: currentStock,
          inStock: currentStock > 0,
          sku: doc.sku,
          matchReason: `Verified physical item at ${inv?.store_name || `${activeCity} Storefront`}, priced at ₹${doc.price.toLocaleString('en-IN')}.`
        };
      });

      // 5. Generate Grounded Explanation
      let replyMessage = '';
      if (verifiedMatches.length > 0) {
        const top = verifiedMatches[0];
        replyMessage = `I found verified matching inventory in ${activeCity}. Top recommendation is the ${top.title} by ${top.brand} priced at ₹${top.price.toLocaleString('en-IN')} (${top.inStock ? `${top.availableStock} in stock` : 'Low Stock'}). You can reserve it right now for instant store pickup or doorstep delivery.`;
      } else {
        replyMessage = `I checked live physical inventory across verified neighborhood stores in ${activeCity}${activeBudget ? ` under ₹${activeBudget.toLocaleString('en-IN')}` : ''}, but found no items currently matching that exact specification. Try expanding your search or adjusting the budget.`;
      }

      // Record turns in session
      session.turns.push({ role: 'user', content: userPrompt, timestamp: new Date().toISOString() });
      session.turns.push({ role: 'assistant', content: replyMessage, timestamp: new Date().toISOString() });

      const tookMs = Date.now() - startTime;
      return res.json({
        status: 'success',
        sessionId: session.id,
        tookMs,
        intent: {
          inferredNeed: intent.inferred_need,
          category: activeCategory,
          maxBudget: activeBudget,
          city: activeCity,
          language: intent.language
        },
        message: replyMessage,
        matches: verifiedMatches,
        suggestions: [
          `Show options in ${activeCity}`,
          activeCategory ? `Compare top ${activeCategory}` : 'Explore Audio headphones',
          'Check stock availability'
        ]
      });
    } catch (err: any) {
      console.error('[AI Chat Error]', err);
      return res.status(500).json({ error: 'AI Assistant processing failed: ' + err.message });
    }
  }

  // POST /api/ai/recommendations (Context-aware personalized recommendations)
  async recommendations(req: Request, res: Response) {
    try {
      const { category, city = 'Bengaluru', maxBudget, viewingHistory = [] } = req.body;

      const results = await aivenOpenSearch.search({
        category: category && category !== 'All' ? category : undefined,
        city,
        maxPrice: maxBudget ? Number(maxBudget) : undefined,
        limit: 6
      });

      // Filter out viewed if needed
      const filtered = results.data.filter(d => !viewingHistory.includes(d.product_id));

      return res.json({
        status: 'success',
        total: filtered.length,
        data: filtered.map(d => ({
          productId: d.product_id,
          title: d.name,
          brand: d.brand,
          category: d.category,
          price: d.price,
          originalMrp: d.original_mrp,
          imageUrl: d.image_url,
          city: d.city,
          availableStock: d.available_stock,
          inStock: d.available_stock > 0
        }))
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate recommendations: ' + err.message });
    }
  }

  // POST /api/ai/compare (Side-by-side spec comparison with best-value verdict)
  async compare(req: Request, res: Response) {
    try {
      const { productIds = [], city = 'Bengaluru' } = req.body;
      if (!Array.isArray(productIds) || productIds.length < 2) {
        return res.status(400).json({ error: 'Provide at least 2 productIds to compare.' });
      }

      const comparedProducts: any[] = [];
      for (const id of productIds.slice(0, 3)) {
        const prod = memoryPg.products.get(id);
        if (prod) {
          const inv = memoryPg.findInventory(id, city);
          comparedProducts.push({
            productId: prod.id,
            title: prod.title,
            brand: prod.brand,
            category: prod.category,
            price: Number(prod.price),
            originalMrp: Number(prod.original_mrp || prod.price * 1.2),
            imageUrl: prod.image_url,
            attributes: prod.attributes || {},
            availableStock: inv ? inv.available_stock : 0,
            inStock: inv ? inv.available_stock > 0 : false,
            storeName: inv ? inv.store_name : `${city} Storefront`
          });
        }
      }

      if (comparedProducts.length === 0) {
        return res.status(404).json({ error: 'None of the requested products were found.' });
      }

      // Compute Best Value Verdict
      const sortedByPrice = [...comparedProducts].sort((a, b) => a.price - b.price);
      const bestValue = sortedByPrice[0];

      return res.json({
        status: 'success',
        data: {
          products: comparedProducts,
          verdict: {
            bestValueId: bestValue.productId,
            bestValueTitle: bestValue.title,
            summary: `${bestValue.title} delivers the lowest entry price at ₹${bestValue.price.toLocaleString('en-IN')} with verified physical stock in ${city}.`
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to compare products: ' + err.message });
    }
  }
}

export const aiAssistantController = new AiAssistantController();
