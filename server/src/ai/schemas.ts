import { z } from 'zod';

// ── 1. Structured Intent Schema ──────────────────────────────────────
export const BudgetConstraintSchema = z.object({
  min: z.number().nullable().optional().default(null),
  max: z.number().nullable().optional().default(null),
  currency: z.string().default('INR')
});

export const StructuredIntentSchema = z.object({
  query: z.string().nullable().optional().transform(v => v || '').default(''),
  category: z.string().nullable().optional().default(null),
  budget: BudgetConstraintSchema.default({ min: null, max: null, currency: 'INR' }),
  attributes: z.record(z.string(), z.any()).nullable().optional().transform(val => val || {}).default({}),
  brand: z.string().nullable().optional().default(null),
  location: z.string().nullable().optional().default('Bengaluru'),
  availability_required: z.boolean().default(true),
  sort_preference: z.enum(['relevance', 'price_low_to_high', 'price_high_to_low', 'rating', 'distance']).default('relevance'),
  language: z.enum(['en', 'hi', 'hinglish', 'gu', 'other']).default('en'),
  clarification_needed: z.boolean().default(false),
  clarification_question: z.string().nullable().optional().default(null),
  inferred_need: z.string().nullable().optional().transform(v => v || '').default('')
});

export type StructuredIntent = z.infer<typeof StructuredIntentSchema>;

// ── 2. Request Schemas ───────────────────────────────────────────────
export const DiscoveryRequestSchema = z.object({
  prompt: z.string().min(1, 'Search query cannot be empty').max(500, 'Query exceeds 500 characters'),
  city: z.string().optional().default('Bengaluru'),
  conversationId: z.string().optional(),
  filters: z.object({
    category: z.string().optional(),
    maxPrice: z.number().optional(),
    inStockOnly: z.boolean().optional().default(true)
  }).optional()
});

export type DiscoveryRequest = z.infer<typeof DiscoveryRequestSchema>;

export const CompareRequestSchema = z.object({
  productIds: z.array(z.string()).min(2, 'Provide at least 2 products to compare').max(4, 'Maximum 4 products allowed'),
  city: z.string().optional().default('Bengaluru')
});

export type CompareRequest = z.infer<typeof CompareRequestSchema>;

export const AlternativesRequestSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  maxPrice: z.number().optional(),
  city: z.string().optional().default('Bengaluru')
});

export type AlternativesRequest = z.infer<typeof AlternativesRequestSchema>;

// ── 3. Discovery Match & Response Schemas ────────────────────────────
export const ProductOfferMatchSchema = z.object({
  productId: z.string(),
  title: z.string(),
  brand: z.string(),
  category: z.string(),
  imageUrl: z.string(),
  description: z.string(),
  attributes: z.record(z.string(), z.any()),
  bestOffer: z.object({
    listingId: z.string(),
    shopName: z.string(),
    shopSlug: z.string(),
    sellingPrice: z.number(),
    originalMrp: z.number().optional(),
    stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
    availableQuantity: z.number(),
    storeName: z.string(),
    storeAddress: z.string(),
    distanceKm: z.number(),
    slaMinutes: z.number()
  }),
  totalSellers: z.number(),
  priceRange: z.object({
    min: z.number(),
    max: z.number()
  }),
  matchScore: z.number(),
  matchReason: z.string()
});

export type ProductOfferMatch = z.infer<typeof ProductOfferMatchSchema>;

export const DiscoveryResponseSchema = z.object({
  conversationId: z.string(),
  intent: StructuredIntentSchema,
  message: z.string(),
  followUpSuggestions: z.array(z.string()),
  matches: z.array(ProductOfferMatchSchema),
  totalFound: z.number(),
  source: z.enum(['self_hosted', 'fallback', 'truefoundry']).default('self_hosted'),
  latencyMs: z.number(),
  unmetDemandLogged: z.boolean()
});

export type DiscoveryResponse = z.infer<typeof DiscoveryResponseSchema>;
