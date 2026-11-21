import { selfHostedAiClient } from './client.js';
import { aiConfig } from './config.js';
import { StructuredIntent, StructuredIntentSchema } from './schemas.js';
import { INTENT_PARSER_SYSTEM_PROMPT, INTENT_FEW_SHOTS } from './prompts/product-discovery.js';

export class IntentParser {
  /**
   * Parse user natural language query into a validated StructuredIntent.
   * Leverages self-hosted open-weight LLM (Qwen2.5) with fallback to deterministic heuristic parsing.
   */
  async parse(prompt: string): Promise<{ intent: StructuredIntent; source: 'self_hosted' | 'fallback'; latencyMs: number }> {
    const startTime = Date.now();

    // 1. Try Self-Hosted Open-Weight LLM Inference
    try {
      const messages = [
        { role: 'system' as const, content: INTENT_PARSER_SYSTEM_PROMPT },
        ...INTENT_FEW_SHOTS.map(s => ({ role: s.role as 'user' | 'assistant', content: s.content })),
        { role: 'user' as const, content: prompt }
      ];

      const response = await selfHostedAiClient.chatCompletion(messages, {
        temperature: 0.1,
        responseFormatJson: true,
        maxTokens: 500
      });

      if (response.content) {
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

        // Query-anchored category refinement
        const pLower = prompt.toLowerCase();
        if (
          pLower.includes('iphone') ||
          pLower.includes('ipone') ||
          pLower.includes('galaxy') ||
          pLower.includes('s24') ||
          pLower.includes('s23') ||
          pLower.includes('samsung') ||
          pLower.includes('powervolt') ||
          pLower.includes('smartphone') ||
          ((pLower.includes('phone') || pLower.includes('mobile')) &&
            !pLower.includes('headphone') &&
            !pLower.includes('microphone') &&
            !pLower.includes('earphone'))
        ) {
          validated.category = 'Mobiles & Accessories';
        } else if (
          pLower.includes('keyboard') ||
          pLower.includes('keybord') ||
          pLower.includes('mouse') ||
          pLower.includes('laptop') ||
          pLower.includes('leptop') ||
          pLower.includes('thinkpad') ||
          pLower.includes('peripheral') ||
          pLower.includes('logitech') ||
          pLower.includes('keychron') ||
          pLower.includes('vipertech') ||
          pLower.includes('keycraft') ||
          pLower.includes('patel digital')
        ) {
          validated.category = 'Computers & Laptops';
        } else if (
          pLower.includes('headphone') ||
          pLower.includes('headfone') ||
          pLower.includes('earphone') ||
          pLower.includes('microphone') ||
          pLower.includes('soundpro') ||
          pLower.includes('boat') ||
          pLower.includes('hyperclear') ||
          pLower.includes('bluetooth audio') ||
          pLower.includes('sharma electronics') ||
          (/\bmic\b/i.test(pLower))
        ) {
          validated.category = 'Electronics';
        } else if (
          pLower.includes('running shoe') ||
          pLower.includes('shoos') ||
          pLower.includes('sneaker') ||
          pLower.includes('pegasus') ||
          pLower.includes('road running') ||
          pLower.includes('jogging') ||
          pLower.includes('marathon')
        ) {
          validated.category = 'Sports & Fitness';
        } else if (
          pLower.includes('woodland') ||
          pLower.includes('casual footwear') ||
          pLower.includes('leather shoe') ||
          pLower.includes('casual shoe') ||
          pLower.includes('t-shirt') ||
          pLower.includes('tshirt') ||
          pLower.includes('hoodie') ||
          pLower.includes('denim') ||
          pLower.includes('parka') ||
          pLower.includes('apparel') ||
          pLower.includes('boutique') ||
          pLower.includes('cotton')
        ) {
          validated.category = 'Boutique Apparel';
        } else if (
          pLower.includes('chair') ||
          pLower.includes('cher') ||
          pLower.includes('air fryer') ||
          pLower.includes('fryer') ||
          pLower.includes('desk caddy') ||
          pLower.includes('organiser') ||
          pLower.includes('caddy') ||
          pLower.includes('furniture') ||
          pLower.includes('modern living') ||
          pLower.includes('ergoflex') ||
          pLower.includes('chefmax') ||
          pLower.includes('moderne')
        ) {
          validated.category = 'Home & Kitchen';
        } else if (
          pLower.includes('basmati') ||
          pLower.includes('atta') ||
          pLower.includes('aata') ||
          pLower.includes('chawal') ||
          pLower.includes('chokha') ||
          pLower.includes('sunflower') ||
          pLower.includes('sunflowr') ||
          pLower.includes('cooking oil') ||
          pLower.includes('cleaner') ||
          pLower.includes('disinfectant') ||
          pLower.includes('daawat') ||
          pLower.includes('fortune') ||
          pLower.includes('forchun') ||
          pLower.includes('oyl') ||
          pLower.includes('aashirvaad') ||
          pLower.includes('sharma general kirana') ||
          pLower.includes('city supermarket') ||
          pLower.includes('grocery') ||
          pLower.includes('groceries') ||
          pLower.includes('kirana') ||
          pLower.includes('staple') ||
          (/\btel\b/i.test(pLower)) ||
          (/\boil\b/i.test(pLower) && !pLower.includes('engine')) ||
          (/\btea\b/i.test(pLower))
        ) {
          validated.category = 'Kirana & Groceries';
        } else if (pLower.includes('shoe') && !pLower.includes('horse')) {
          validated.category = 'Sports & Fitness';
        } else if (validated.category) {
          const c = validated.category.toLowerCase();
          if (c.includes('grocer') || c.includes('kirana') || c.includes('staple') || c.includes('food')) {
            validated.category = 'Kirana & Groceries';
          } else if (c.includes('chair') || c.includes('furnitur') || c.includes('kitchen') || c.includes('appliance') || c.includes('home')) {
            validated.category = 'Home & Kitchen';
          } else if (c.includes('shoe') || c.includes('footwear') || c.includes('sport') || c.includes('fitness')) {
            validated.category = 'Sports & Fitness';
          } else if (c.includes('tshirt') || c.includes('shirt') || c.includes('apparel') || c.includes('cloth') || c.includes('fashion')) {
            validated.category = 'Boutique Apparel';
          } else if (c.includes('laptop') || c.includes('computer') || c.includes('keyboard') || c.includes('mouse') || c.includes('peripheral')) {
            validated.category = 'Computers & Laptops';
          } else if (c.includes('headphone') || c.includes('mic') || c.includes('audio') || c.includes('sound') || c.includes('electronic')) {
            validated.category = 'Electronics';
          } else if (c.includes('phone') || c.includes('mobile') || c.includes('smartphone') || c.includes('charger')) {
            validated.category = 'Mobiles & Accessories';
          }
        }

        return {
          intent: validated,
          source: 'self_hosted',
          latencyMs: Date.now() - startTime
        };
      }
    } catch (err: any) {
      console.warn(`[SelfHostedAI] Intent parsing via LLM encountered an issue, falling back to heuristic:`, err.message);
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

    // D. Number before "ke andar" / "ke niche" / "ma" / "me"
    const hindiBudgetMatch = clean.match(/(\d[\d,]*)\s*(?:ke\s*andar|ke\s*niche|tak|me|ma)\b/i);
    if (hindiBudgetMatch && !maxBudget) {
      maxBudget = parseInt(hindiBudgetMatch[1].replace(/,/g, ''), 10);
    }

    // E. Standard "under 60000" / "below 2000" / "₹3000"
    const standardMatch = clean.match(/(?:under|below|less than|up to|max|maximum|budget|₹|rs\.?)\s*:?\s*(\d[\d,]*)/i);
    if (standardMatch && !maxBudget) {
      maxBudget = parseInt(standardMatch[1].replace(/,/g, ''), 10);
    }

    // 3. Category & Attribute Mapping
    let category: string | null = null;
    const attributes: Record<string, any> = {};

    if (clean.includes('headphone') || clean.includes('earphone') || clean.includes('tws') || clean.includes('airpod') || clean.includes('mic') || clean.includes('microphone') || clean.includes('audio')) {
      category = 'Electronics';
      if (clean.includes('wireless') || clean.includes('bluetooth') || clean.includes('bina taar')) attributes.wireless = true;
      if (clean.includes('anc') || clean.includes('noise')) attributes.noise_cancelling = true;
    } else if (clean.includes('laptop') || clean.includes('keyboard') || clean.includes('mouse') || clean.includes('monitor') || clean.includes('computer')) {
      category = 'Computers & Laptops';
      if (clean.includes('programming') || clean.includes('coding') || clean.includes('developer')) attributes.usage = 'programming';
      if (clean.includes('gaming')) attributes.usage = 'gaming';
    } else if (clean.includes('phone') || clean.includes('mobile') || clean.includes('smartphone') || clean.includes('charger') || clean.includes('cable') || clean.includes('samsung') || clean.includes('iphone')) {
      category = 'Mobiles & Accessories';
      if (clean.includes('128gb')) attributes.storage = '128GB';
      if (clean.includes('256gb')) attributes.storage = '256GB';
      if (clean.includes('5g')) attributes.connectivity = '5G';
    } else if (clean.includes('shoe') || clean.includes('sneaker') || clean.includes('boot') || clean.includes('running')) {
      category = 'Sports & Fitness';
      if (clean.includes('running')) attributes.activity = 'running';
    } else if (clean.includes('chair') || clean.includes('fryer') || clean.includes('desk') || clean.includes('caddy') || clean.includes('kitchen') || clean.includes('home')) {
      category = 'Home & Kitchen';
      if (clean.includes('ergonomic') || clean.includes('mesh')) attributes.type = 'ergonomic';
    } else if (clean.includes('rice') || clean.includes('oil') || clean.includes('tea') || clean.includes('atta') || clean.includes('grocer') || clean.includes('kirana') || clean.includes('cleaner') || clean.includes('disinfectant')) {
      category = 'Kirana & Groceries';
    } else if (clean.includes('shirt') || clean.includes('denim') || clean.includes('jacket') || clean.includes('hoodie') || clean.includes('sweater') || clean.includes('apparel') || clean.includes('fashion')) {
      category = 'Boutique Apparel';
    }

    // 4. Brand Extraction
    const knownBrands = ['Apple', 'Samsung', 'Lenovo', 'Nike', 'Logitech', 'Sony', 'boAt', 'Woodland', 'Tata Tea', 'Daawat', 'Fortune', 'Aashirvaad', 'EcoClean', 'ChefMax', 'Keychron', 'Audio-Technica', 'UrbanKnit', 'ErgoFlex'];
    let brand: string | null = null;
    for (const b of knownBrands) {
      if (clean.includes(b.toLowerCase())) {
        brand = b;
        break;
      }
    }

    // 5. Build Clean Core Query
    const query = clean
      .replace(/(?:under|below|less than|up to|max|maximum|budget|₹|rs\.?)\s*:?\s*(\d[\d,]*)/gi, '')
      .replace(/(\d[\d,]*)\s*(?:ke\s*andar|ke\s*niche|tak|me|ma)\b/gi, '')
      .replace(/(\d+)\s*(?:hazar|hazaar|lakh|lac|k)\b/gi, '')
      .replace(/\b(?:mujhe|chahiye|dikhao|dikhaye|batao|ka|ke|liye|in|bengaluru|bangalore|mane|joie|che|saras|saaru|mate|best|good|achha|sasta)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      query: query || clean,
      category,
      budget: { min: minBudget, max: maxBudget, currency: 'INR' },
      attributes,
      brand,
      location: 'Bengaluru',
      availability_required: true,
      sort_preference: 'relevance',
      language,
      clarification_needed: false,
      clarification_question: null,
      inferred_need: `Customer is seeking ${category || 'products'} matching "${clean}".`
    };
  }
}

export const intentParser = new IntentParser();
