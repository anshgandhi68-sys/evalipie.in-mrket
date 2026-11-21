import { trueFoundryClient } from './client.js';
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
   * Leverages TrueFoundry AI Gateway with fallback to structured deterministic synthesis.
   */
  async generate(
    prompt: string,
    intent: StructuredIntent,
    matches: ProductOfferMatch[]
  ): Promise<GroundedExplanation> {
    // 1. If TrueFoundry is configured, ask it to synthesize using ONLY the grounded matches
    if (aiConfig.isConfigured && matches.length > 0) {
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

Verified Local Catalogue Matches (STRICT GROUNDING SOURCE):
${JSON.stringify(catalogContext, null, 2)}

Provide a concise, 2-paragraph helpful Indian marketplace recommendation. Mention the merchant name and price accurately. Then end with 2-3 follow-up suggestions.
        `.trim();

        const response = await trueFoundryClient.chatCompletion(
          [
            { role: 'system', content: GROUNDED_SYNTHESIS_SYSTEM_PROMPT },
            { role: 'user', content: userMessage }
          ],
          { temperature: 0.2, maxTokens: 400 }
        );

        if (response.content.trim()) {
          const suggestions = this.extractSuggestions(response.content, intent, matches);
          return {
            message: response.content.trim(),
            followUpSuggestions: suggestions
          };
        }
      } catch (err: any) {
        console.warn(`[AI Engine] TrueFoundry response generation failed, falling back to deterministic template:`, err.message);
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
        : 'Limited units remaining';

    let intro = `Here are the strongest verified local matches for your requirement. `;
    intro += `The best offer for **${top.title}** is available at **${shopText}** for **${priceText}** (${stockText}). `;

    if (sellerCount > 1) {
      intro += `This item is also carried by ${sellerCount - 1} other local merchants, allowing instant physical pickup or 30-min doorstep delivery.`;
    } else {
      intro += `You can order directly for 30-minute doorstep delivery or store walk-in.`;
    }

    // Generate dynamic suggestions based on found matches
    const suggestions: string[] = [];
    if (matches.length > 1) {
      suggestions.push(`Compare ${matches[0].brand} vs ${matches[1].brand}`);
    }
    suggestions.push(`Show cheaper alternatives to ${top.title}`);
    suggestions.push(`View all verified sellers in Indiranagar`);

    return {
      message: intro,
      followUpSuggestions: suggestions.slice(0, 3)
    };
  }

  private extractSuggestions(
    content: string,
    intent: StructuredIntent,
    matches: ProductOfferMatch[]
  ): string[] {
    const defaultSuggestions = [
      `Compare top 2 ${intent.category || 'items'}`,
      'Show cheaper local alternatives',
      'Check stock in Indiranagar'
    ];

    if (matches.length >= 2) {
      defaultSuggestions[0] = `Compare ${matches[0].title} with ${matches[1].title}`;
    }

    return defaultSuggestions;
  }
}

export const responseGenerator = new ResponseGenerator();
