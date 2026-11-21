# EVALIPIE — AI Discovery & Search Engine Design

> **Document Status:** Phase 0 — Design Specification  
> **Search Infrastructure:** Aiven OpenSearch 2.x  
> **AI Architecture:** Schema-Constrained Intent Extraction + Grounded Catalog Search (Zero Hallucination)

---

## 1. The Core Philosophy: "Zero Hallucination" Discovery

Traditional conversational AI in e-commerce fails because Large Language Models tend to fabricate product specifications, nonexistent prices, phantom merchants, and inaccurate stock availability.

**Evalipie enforces a deterministic, catalog-grounded discovery boundary:**

```
+-----------------------------------------------------------------------------------------+
| STEP 1: NATURAL LANGUAGE INPUT                                                          |
| User Prompt: "I need something for clear audio during online meetings under ₹3,000"      |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| STEP 2: INTENT & CONSTRAINT EXTRACTION (AI Translation Layer)                           |
| LLM converts fuzzy human need into strict, schema-validated JSON:                       |
| {                                                                                       |
|   "target_category": "Electronics",                                                     |
|   "search_terms": ["microphone", "headset", "audio", "voice", "call"],                  |
|   "max_price": 3000,                                                                    |
|   "user_intent": "Clear voice transmission for video conferencing"                     |
| }                                                                                       |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| STEP 3: OPENSEARCH TYPO-TOLERANT RETRIEVAL (Aiven OpenSearch)                           |
| OpenSearch executes multi-match query across titles, descriptions, categories, and tags |
| with city-level filters. Returns candidates with relevance score.                       |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| STEP 4: POSTGRESQL REAL-TIME VERIFICATION (Aiven PostgreSQL)                            |
| Validates actual live stock (quantity - reserved > 0) and current active selling price.  |
| Out-of-stock items are flagged; alternative available sellers are attached.             |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| STEP 5: GROUNDED PRESENTATION & EXPLANATION                                             |
| System renders real product cards with actual merchant names and prices.                |
| AI generates an explanation string strictly grounded in the returned attributes.        |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Structured Intent Extraction Specification

### Prompt Template for Intent Parser

```
SYSTEM PROMPT:
You are the Evalipie AI Intent Extraction Engine.
Your sole job is to analyze the user's natural language shopping request and translate it into a structured search filter JSON.
Do NOT invent product recommendations or merchant names.
Only extract:
1. "category": Best matching catalog category from: ['Mobiles & Accessories', 'Computers & Laptops', 'Electronics', 'Home & Kitchen', 'Fashion', 'Grocery', 'Sports & Fitness']
2. "keywords": Array of 3 to 6 essential keyword stems (e.g., ['mic', 'audio', 'meeting'])
3. "max_budget": Integer value in INR if the user mentioned a price limit or "under X", otherwise null.
4. "clarification_needed": Boolean true if the query is too ambiguous, along with "clarification_question".
5. "inferred_need": One sentence summarizing what problem the user wants to solve.

Always respond in strictly valid JSON conforming to the schema.
```

### Concrete Input / Output Examples

#### Example 1: Budget Meeting Gear
* **User Input:** *"I need something for clear audio during online meetings under ₹3,000 in Bengaluru"*
* **Extracted JSON:**
  ```json
  {
    "category": "Electronics",
    "keywords": ["microphone", "audio", "headset", "call", "voice", "meeting"],
    "max_budget": 3000,
    "city": "Bengaluru",
    "clarification_needed": false,
    "clarification_question": null,
    "inferred_need": "User requires audio equipment to improve voice clarity during video calls within a ₹3,000 budget."
  }
  ```

#### Example 2: Compact Apartment Appliance
* **User Input:** *"Find a compact kitchen appliance for a small apartment"*
* **Extracted JSON:**
  ```json
  {
    "category": "Home & Kitchen",
    "keywords": ["compact", "appliance", "kitchen", "cook", "small", "air fryer", "induction"],
    "max_budget": null,
    "city": null,
    "clarification_needed": true,
    "clarification_question": "What is your approximate budget, and are you looking for cooking or food preparation appliances?",
    "inferred_need": "User is looking for space-saving kitchen appliances suitable for small living spaces."
  }
  ```

---

## 3. Graceful Fallback Engine (Zero AI Downtime)

If the external LLM API is unavailable, unconfigured, or times out (> 1200ms), the application immediately activates the **Rule-Based Heuristic Parser**:

```typescript
export function heuristicIntentParser(query: string): StructuredIntent {
  const clean = query.toLowerCase();
  
  // 1. Budget extraction via Regex
  const budgetMatch = clean.match(/(?:₹|rs\.?\s?|under\s+|below\s+)(\d[\d,]*)/i);
  const maxBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : null;

  // 2. Category mapping dictionary
  const categoryKeywords: Record<string, string> = {
    'audio': 'Electronics',
    'headphone': 'Electronics',
    'mic': 'Electronics',
    'laptop': 'Computers & Laptops',
    'keyboard': 'Computers & Laptops',
    'fryer': 'Home & Kitchen',
    'kitchen': 'Home & Kitchen',
    'desk': 'Home & Kitchen'
  };

  let matchedCategory = 'Electronics'; // default
  for (const [kw, cat] of Object.entries(categoryKeywords)) {
    if (clean.includes(kw)) {
      matchedCategory = cat;
      break;
    }
  }

  // 3. Extract meaningful tokens (exclude stop words)
  const stopWords = new Set(['i', 'need', 'something', 'for', 'a', 'the', 'in', 'under', 'with', 'and', 'to']);
  const tokens = clean
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  return {
    category: matchedCategory,
    keywords: tokens,
    max_budget: maxBudget,
    city: clean.includes('bengaluru') ? 'Bengaluru' : null,
    clarification_needed: false,
    clarification_question: null,
    inferred_need: `Keyword-matched search for: ${tokens.join(', ')}`
  };
}
```

---

## 4. Aiven OpenSearch Index Design & Typo-Tolerance

### Index Mapping (`evalipie_catalog`)

```json
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "evalipie_ngram_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "evalipie_ngram_filter", "english_stop", "english_stemmer"]
        },
        "evalipie_search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "english_stop", "english_stemmer"]
        }
      },
      "filter": {
        "evalipie_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 15
        },
        "english_stemmer": {
          "type": "stemmer",
          "language": "english"
        },
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "product_id": { "type": "keyword" },
      "listing_id": { "type": "keyword" },
      "organization_id": { "type": "keyword" },
      "store_id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "evalipie_ngram_analyzer",
        "search_analyzer": "evalipie_search_analyzer",
        "fields": {
          "raw": { "type": "keyword" }
        }
      },
      "brand": { "type": "keyword" },
      "category": { "type": "keyword" },
      "description": { "type": "text", "analyzer": "english" },
      "tags": { "type": "keyword" },
      "selling_price": { "type": "float" },
      "city": { "type": "keyword" },
      "store_name": { "type": "text" },
      "shop_slug": { "type": "keyword" },
      "in_stock": { "type": "boolean" },
      "stock_count": { "type": "integer" },
      "created_at": { "type": "date" }
    }
  }
}
```

### Typo-Tolerant Multi-Match OpenSearch Query

When a customer searches with typos (e.g. *"blutooth hedphone"*):

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "blutooth hedphone",
            "fields": ["title^3", "tags^2", "brand^2", "description"],
            "fuzziness": "AUTO",
            "prefix_length": 1,
            "max_expansions": 50,
            "operator": "OR"
          }
        }
      ],
      "filter": [
        { "term": { "city": "Bengaluru" } },
        { "range": { "selling_price": { "lte": 3000 } } },
        { "term": { "in_stock": true } }
      ]
    }
  },
  "sort": [
    { "_score": { "order": "desc" } },
    { "selling_price": { "order": "asc" } }
  ]
}
```

---

## 5. Event-Driven Search Index Synchronization

To maintain high data freshness without coupling the checkout transaction to OpenSearch:

```mermaid
flowchart LR
    A[PostgreSQL Stock Update] --> B[Outbox Table]
    B --> C[Outbox Worker]
    C --> D[Kafka Topic: inventory.changed]
    D --> E[OpenSearch Sync Worker]
    E --> F[OpenSearch Document Update]
```

1. **Trigger:** Whenever an order is reserved in PostgreSQL, the `outbox_events` table receives an `inventory.changed` event containing `listing_id`, `store_id`, and `new_stock`.
2. **Streaming:** The Outbox Worker publishes this payload to Aiven Kafka topic `evalipie.inventory.changed`.
3. **Consumer Execution:** The OpenSearch Sync Worker consumes the message and executes an atomic partial update on OpenSearch:
   ```json
   POST /evalipie_catalog/_update_by_query
   {
     "script": {
       "source": "ctx._source.stock_count = params.stock; ctx._source.in_stock = (params.stock > 0)",
       "lang": "painless",
       "params": { "stock": 0 }
     },
     "query": {
       "bool": {
         "must": [
           { "term": { "listing_id": "list-001" } },
           { "term": { "store_id": "store-indiranagar" } }
         ]
       }
     }
   }
   ```
4. **Latency:** Total latency from PostgreSQL transaction commit to OpenSearch index reflection is **< 350ms**.
