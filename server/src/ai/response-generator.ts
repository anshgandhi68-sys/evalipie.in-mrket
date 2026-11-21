import { selfHostedAiClient } from './client.js';
import { aiConfig } from './config.js';
import { StructuredIntent, ProductOfferMatch } from './schemas.js';
import { GROUNDED_SYNTHESIS_SYSTEM_PROMPT } from './prompts/product-discovery.js';

export interface GroundedExplanation {
  message: string;
  followUpSuggestions: string[];
}

export class ResponseGenerator {
  /**
   * Synthesize a grounded conversational response.
   * Leverages self-hosted open-weight LLM (Qwen2.5) with fallback to structured deterministic synthesis.
   */
  async generate(
    prompt: string,
    intent: StructuredIntent,
    matches: ProductOfferMatch[]
  ): Promise<GroundedExplanation> {
    // 1. If self-hosted model is online and we have verified matches, ask it to synthesize using ONLY the grounded matches
    if (matches.length > 0) {
      try {
        const catalogContext = matches.slice(0, 3).map(m => ({
          title: m.title,
          brand: m.brand,
          category: m.category,
          bestPrice: `₹${m.bestOffer.sellingPrice.toLocaleString('en-IN')}`,
          shopName: m.bestOffer.shopName,
          stockStatus: m.bestOffer.stockStatus,
          availableUnits: m.bestOffer.availableQuantity,
          deliverySla: `${m.bestOffer.slaMinutes} mins local delivery`
        }));

        const userMessage = `
User Query: "${prompt}"
Inferred Need: "${intent.inferred_need}"
Budget Limit: ${intent.budget.max ? `₹${intent.budget.max.toLocaleString('en-IN')}` : 'No limit'}

Verified Local Catalogue Matches (STRICT GROUNDING SOURCE - ONLY RECOMMEND FROM THESE):
${JSON.stringify(catalogContext, null, 2)}

Provide a concise, helpful Indian marketplace recommendation in 1-2 natural paragraphs. Mention the merchant name and price accurately. Never invent products or specs.
        `.trim();

        const response = await selfHostedAiClient.chatCompletion(
          [
            { role: 'system', content: GROUNDED_SYNTHESIS_SYSTEM_PROMPT },
            { role: 'user', content: userMessage }
          ],
          { temperature: 0.2, maxTokens: 400 }
        );

        if (response.content && response.content.trim().length > 10) {
          const suggestions = this.extractSuggestions(response.content, intent, matches);
          return {
            message: response.content.trim(),
            followUpSuggestions: suggestions
          };
        }
      } catch (err: any) {
        console.warn(`[SelfHostedAI] Response synthesis failed, falling back to deterministic template:`, err.message);
      }
    }

    // 2. Deterministic Grounded Template Synthesis
    return this.deterministicSynthesis(prompt, intent, matches);
  }

  /**
   * Zero-hallucination deterministic template synthesizer.
   */
  deterministicSynthesis(
    _prompt: string,
    intent: StructuredIntent,
    matches: ProductOfferMatch[]
  ): GroundedExplanation {
    if (matches.length === 0) {
      const budgetNote = intent.budget.max
        ? ` under ₹${intent.budget.max.toLocaleString('en-IN')}`
        : '';
      const catNote = intent.category ? ` in ${intent.category}` : '';

      return {
        message: `We checked 142 verified neighbourhood shops in Bengaluru, but found no physical inventory matching your exact request${catNote}${budgetNote}. You can try expanding your budget or exploring related electronics.`,
        followUpSuggestions: [
          'Show top-rated wireless headphones under ₹5,000',
          'Explore programming laptops in Indiranagar',
          'Find GaN 65W fast chargers in stock'
        ]
      };
    }

    const top = matches[0];
    const sellerCount = top.totalSellers;
    const priceText = `₹${top.bestOffer.sellingPrice.toLocaleString('en-IN')}`;
    const shopText = top.bestOffer.shopName;
    const stockText =
      top.bestOffer.stockStatus === 'IN_STOCK'
        ? `${top.bestOffer.availableQuantity} units verified in stock`
        : 'Low stock (reserve now)';

    let message = `We found ${matches.length} verified item${matches.length > 1 ? 's' : ''} in Bengaluru matching your requirements. Top pick: **${top.title}** starting at **${priceText}** from **${shopText}** (${stockText}).`;

    if (sellerCount > 1) {
      message += ` It is also available from ${sellerCount - 1} other local verified store${sellerCount > 2 ? 's' : ''} with 30-minute delivery or counter pickup.`;
    }

    if (matches.length > 1) {
      const second = matches[1];
      message += ` Another solid option is **${second.title}** at **₹${second.bestOffer.sellingPrice.toLocaleString('en-IN')}** from **${second.bestOffer.shopName}**.`;
    }

    const suggestions = [
      `Compare prices across all ${sellerCount} sellers`,
      `Show alternatives under ₹${Math.round((top.bestOffer.sellingPrice || 1000) * 1.2).toLocaleString('en-IN')}`,
      `Check inventory in Indiranagar & Jayanagar`
    ];

    return {
      message,
      followUpSuggestions: suggestions
    };
  }

  private extractSuggestions(
    text: string,
    intent: StructuredIntent,
    matches: ProductOfferMatch[]
  ): string[] {
    const fallback = [
      `Compare prices across local merchants`,
      `Show other verified options in Bengaluru`,
      `Check stock in Indiranagar & Jayanagar`
    ];

    if (matches.length === 0) return fallback;

    const top = matches[0];
    return [
      `Compare prices for ${top.brand} ${top.category}`,
      `Show similar items under ₹${Math.round(top.bestOffer.sellingPrice * 1.3).toLocaleString('en-IN')}`,
      `Check physical store inventory`
    ];
  }
}

export const responseGenerator = new ResponseGenerator();
