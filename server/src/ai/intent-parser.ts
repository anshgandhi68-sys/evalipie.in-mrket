import { trueFoundryClient } from './client.js';
import { aiConfig } from './config.js';
import { StructuredIntent, StructuredIntentSchema } from './schemas.js';
import { INTENT_PARSER_SYSTEM_PROMPT, INTENT_FEW_SHOTS } from './prompts/product-discovery.js';

export class IntentParser {
  /**
   * Parse user natural language query into a validated StructuredIntent.
   * Leverages TrueFoundry AI Gateway with fallback to deterministic heuristic parsing.
   */
  async parse(prompt: string): Promise<{ intent: StructuredIntent; source: 'truefoundry' | 'fallback'; latencyMs: number }> {
    const startTime = Date.now();

    // 1. Try TrueFoundry AI Gateway if configured
    if (aiConfig.isConfigured) {
      try {
        const messages = [
          { role: 'system' as const, content: INTENT_PARSER_SYSTEM_PROMPT },
          ...INTENT_FEW_SHOTS.map(s => ({ role: s.role as 'user' | 'assistant', content: s.content })),
          { role: 'user' as const, content: prompt }
        ];

        const response = await trueFoundryClient.chatCompletion(messages, {
          temperature: 0.1,
          responseFormatJson: true,
          maxTokens: 500
        });

        // Strip any potential markdown code blocks
        let cleanJson = response.content.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.slice(7);
        }
        if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith('```')) {
          cleanJson = cleanJson.slice(0, -3);
        }
        cleanJson = cleanJson.trim();

        const rawParsed = JSON.parse(cleanJson);
        const validated = StructuredIntentSchema.parse(rawParsed);

        return {
          intent: validated,
          source: 'truefoundry',
          latencyMs: Date.now() - startTime
        };
      } catch (err: any) {
        console.warn(`[AI Engine] TrueFoundry intent parsing failed, falling back to heuristic:`, err.message);
      }
    }

    // 2. Deterministic Multilingual Fallback Parser
    const fallbackIntent = this.heuristicFallbackParse(prompt);
    return {
      intent: fallbackIntent,
      source: 'fallback',
      latencyMs: Date.now() - startTime
    };
  }

  /**
   * Robust deterministic heuristic parser supporting English, Hindi, Hinglish, Gujarati.
   */
  heuristicFallbackParse(prompt: string): StructuredIntent {
    const clean = prompt.toLowerCase().trim();

    // 1. Detect Language
    let language: StructuredIntent['language'] = 'en';
    const hindiWords = ['chahiye', 'mujhe', 'andar', 'ka', 'ke', 'liye', 'sasta', 'achha', 'kam', 'batao', 'dikhao', 'dikhaye', 'me'];
    const gujaratiWords = ['mane', 'joie', 'che', 'saras', 'saaru', 'mate', 'ma'];

    if (gujaratiWords.some(w => clean.includes(w))) {
      language = 'gu';
    } else if (hindiWords.some(w => clean.includes(w))) {
      language = 'hinglish';
    }

    // 2. Extract Budget (supports: "under 2000", "below 50k", "60,000 ke andar", "1500 ke niche", "6 hazar", "4000 me", "70000 ma")
    let maxBudget: number | null = null;
    let minBudget: number | null = null;

    // A. Lakhs (e.g. "1.5 lakh", "1 lakh")
    const lakhMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
    if (lakhMatch) {
      maxBudget = Math.round(parseFloat(lakhMatch[1]) * 100000);
    }

    // B. Thousands ("hazar" / "hazaar", e.g. "6 hazar")
    const hazarMatch = clean.match(/(\d+)\s*(?:hazar|hazaar)/i);
    if (hazarMatch && !maxBudget) {
      maxBudget = parseInt(hazarMatch[1], 10) * 1000;
    }

    // C. "K" abbreviation (e.g. "below 3k", "60k")
    const kMatch = clean.match(/(?:under|below|<|\s|^)\s*(\d+)\s*k\b/i);
    if (kMatch && !maxBudget) {
      maxBudget = parseInt(kMatch[1], 10) * 1000;
    }

    // D. Suffix patterns: "60,000 ke andar", "1500 ke niche", "4000 me", "70000 ma", "1200 rs", "5000 rupees", "6000 tak"
    const suffixMatch = clean.match(/(\d[\d,]*)\s*(?:ke\s*andar|ke\s*niche|me\b|ma\b|tak\b|rs\b|rupees\b|ke\s*budget\s*me)/i);
    if (suffixMatch && !maxBudget) {
      maxBudget = parseInt(suffixMatch[1].replace(/,/g, ''), 10);
    }

    // E. Prefix patterns: "under 5000", "below ₹1,500", "budget 20000"
    const prefixMatch = clean.match(/(?:₹|rs\.?\s?|under\s+|below\s+|budget\s*(?:is|of)?\s*)(\d[\d,]*)/i);
    if (prefixMatch && !maxBudget) {
      maxBudget = parseInt(prefixMatch[1].replace(/,/g, ''), 10);
    }

    // 3. Category Detection with precise precedence and whole-word matching
    const categoryRules: Array<{ category: string; keywords: string[] }> = [
      {
        category: 'Computers & Laptops',
        keywords: [
          'keyboard', 'keyboards', 'mouse', 'laptop', 'laptops', 'lapotp', 'leptop',
          'thinkpad', 'macbook', 'coding', 'programming', 'desktop', 'monitor', 'pc',
          'gaming equipment', 'gaming mouse'
        ]
      },
      {
        category: 'Home & Kitchen',
        keywords: [
          'air fryer', 'fryer', 'kitchen', 'appliance', 'appliances', 'coffee', 'aeropress',
          'cook', 'blender', 'organizer', 'desk organiser', 'desk organizer'
        ]
      },
      {
        category: 'Mobiles & Accessories',
        keywords: [
          'charger', 'chargers', 'fast charger', 'fast chargers', 'gan', 'phone', 'phones', 'smartphone', 'smartphones',
          'galaxy', 's23', 'mobile', 'adapter', 'type-c', 'iphone', 'iphones', 'oneplus', 'cables'
        ]
      },
      {
        category: 'Electronics',
        keywords: [
          'headphone', 'headphones', 'headfone', 'headfones', 'earphone', 'earphones',
          'mic', 'microphone', 'microphones', 'audio', 'sound', 'anc', 'smartwatch', 'speaker',
          'studio mic', 'electronics'
        ]
      },
      {
        category: 'Boutique Apparel',
        keywords: [
          'jacket', 'jackets', 'parka', 'denim', 'knit', 'sweater', 'hoodie', 'apparel', 'fashion'
        ]
      }
    ];

    let detectedCategory: string | null = null;
    for (const rule of categoryRules) {
      if (rule.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(clean))) {
        detectedCategory = rule.category;
        break;
      }
    }

    // 4. Brand Detection
    const brands = ['Sony', 'Apple', 'Lenovo', 'Samsung', 'Philips', 'Anker', 'Razer', 'Røde', 'OnePlus', 'Logitech', 'Loom', 'Nordic'];
    let detectedBrand: string | null = null;
    for (const b of brands) {
      if (clean.includes(b.toLowerCase()) || (b === 'Sony' && clean.includes('soni')) || (b === 'Philips' && clean.includes('phillps')) || (b === 'Anker' && clean.includes('ankr')) || (b === 'Apple' && clean.includes('macbok'))) {
        detectedBrand = b === 'Apple' || clean.includes('macbok') ? 'Apple' : b;
        break;
      }
    }

    // Special brand category inference
    if (!detectedCategory && detectedBrand) {
      if (detectedBrand === 'Razer') detectedCategory = 'Computers & Laptops';
    }

    // 5. Clean Search Keywords
    const stopWords = new Set([
      'i', 'need', 'something', 'for', 'a', 'the', 'in', 'under', 'with', 'and', 'to',
      'during', 'my', 'is', 'find', 'suggest', 'product', 'looking', 'show', 'me', 'give',
      'mujhe', 'chahiye', 'ke', 'liye', 'andar', 'wala', 'wali', 'batao', 'dikhao', 'che', 'joie',
      'mate', 'tak', 'niche', 'sasta', 'achha', 'kam', 'saras', 'stores'
    ]);

    const keywords = clean
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w) && isNaN(Number(w)));

    return {
      query: keywords.join(' ') || clean,
      category: detectedCategory,
      budget: {
        min: minBudget,
        max: maxBudget,
        currency: 'INR'
      },
      attributes: {},
      brand: detectedBrand,
      location: 'Bengaluru',
      availability_required: true,
      sort_preference: 'relevance',
      language,
      clarification_needed: false,
      clarification_question: null,
      inferred_need: `Shopper is looking for ${detectedBrand || ''} ${detectedCategory || 'items'} matching "${keywords.join(' ')}"${maxBudget ? ` within budget of ₹${maxBudget.toLocaleString('en-IN')}` : ''}.`
    };
  }
}

export const intentParser = new IntentParser();
