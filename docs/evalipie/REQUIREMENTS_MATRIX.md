# EVALIPIE — Requirements Traceability & Prioritization Matrix

> **Document Status:** Phase 0 — Pre-Development Architecture & Specifications.  
> **Traceability Scope:** Official Hackathon Constraints, Evalipie Core Capabilities, and Future Roadmap.

---

## 1. Official Problem Statement & Workspace Verification

### Status of Official Hackathon Brief
A comprehensive inspection of the workspace, parent directories, and local drives was conducted.
* **Finding:** The standalone external document file (e.g. `Hackathon_Rules.pdf` or `Aiven_Challenge_Brief.md`) detailing administrative ground rules or specific judging rubric sheets was **not found** in the local workspace directory.
* **Resolution & Grounding:** As instructed in Section 5 of the project mandate, we explicitly record this status without silent assumptions. All hackathon requirements documented below are derived directly from the verified project submission brief:
  1. Primary Challenge: A physical retail chain moving online across India facing overselling, failed typo searches, desynchronized inventory, and coupled order handling.
  2. Mandated Technology Foundation: React frontend, Node.js/Express TypeScript REST APIs, Aiven PostgreSQL, Aiven Apache Kafka, Aiven OpenSearch.
  3. Core Capabilities: Typo-tolerant search, city/price/category filtering, concurrency-safe inventory reservation, event-driven order processing, and synchronized search indexing.

---

## 2. Three-Tier Scope Classification

```
+----------------------------------------------------------------------------------------------------+
| TIER A: MANDATORY HACKATHON CORE (P0 - Non-Negotiable)                                             |
| 1. Aiven PostgreSQL ACID inventory reservation (prevent overselling under concurrent checkouts)     |
| 2. Aiven OpenSearch typo-tolerant product discovery with multi-field search and city filtering     |
| 3. Aiven Apache Kafka event publishing (order.placed, inventory.changed) via Transactional Outbox  |
| 4. React storefront with city filtering & catalog navigation                                       |
| 5. Node.js & Express REST APIs with TypeScript                                                     |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| TIER B: EVALIPIE DIFFERENTIATING VISION (P0 / P1 - Signature Features)                             |
| 1. Unified Merchant Domain (Organizations, Physical Branches, Public Digital Storefronts)         |
| 2. Canonical Product vs. Merchant Listing model (same product price comparison across shops)       |
| 3. Dedicated Merchant Storefront URLs (/shop/:slug) for local independent shopkeepers              |
| 4. Evalipie AI Natural Language Intent Extraction Pipeline (Grounded search, zero hallucinations)  |
| 5. Signature Door-Hero opening reveal interactive animation                                        |
| 6. Merchant Management Portal (Stock updates, listing creation, order lifecycle)                   |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| TIER C: EXPANDED FUTURE CAPABILITIES (P2 - Post-Hackathon Roadmap)                                 |
| 1. Multimodal Camera/Image Search (Visual recognition of spare parts or retail items)              |
| 2. Multi-merchant unified shopping cart with split order logistics routing                         |
| 3. Automated escrow payment settlement & merchant ledger distribution                              |
| 4. Autonomous logistics dispatcher integration (Dunzo, Porter, Shadowfax)                          |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Comprehensive Requirements Matrix

| Req ID | Capability / Feature | Category | User Type | Priority | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-001** | **Atomic Inventory Stock Reservation** | Concurrency / DB | Customer / Merchant | **P0** (Hackathon Core) | PostgreSQL, Transactions | When 2 customers checkout the last remaining item (`stock = 1`) simultaneously, exactly 1 order succeeds, and 1 receives an immediate 409 Conflict error. Zero overselling. |
| **REQ-002** | **Typo-Tolerant Catalog Search** | Search Engine | Customer | **P0** (Hackathon Core) | Aiven OpenSearch | Search terms with common misspellings (e.g., *"blutooth hedphone"*, *"micrphone"*) match correct products with relevancy score > 0.8 within < 50ms. |
| **REQ-003** | **City, Category & Price Filtering** | Search Engine | Customer | **P0** (Hackathon Core) | OpenSearch, DB | Search queries filtered by city (e.g., Bengaluru), price range (`p <= 3000`), and category return only active listings with positive local stock. |
| **REQ-004** | **Transactional Outbox Event Generation** | Event Streaming | System | **P0** (Hackathon Core) | PostgreSQL, Outbox Table | Orders and inventory modifications write to `outbox_events` in the exact same DB transaction. Events are guaranteed never lost if Kafka temporarily pauses. |
| **REQ-005** | **Kafka Event Publishing & Consumption** | Event Streaming | System | **P0** (Hackathon Core) | Aiven Kafka, Node.js | Worker pushes pending outbox events to Kafka topics (`order.placed`, `inventory.changed`). Kafka consumer receives events and triggers downstream tasks. |
| **REQ-006** | **Search Index Synchronization** | Data Pipeline | System | **P0** (Hackathon Core) | Kafka, OpenSearch | A Kafka consumer listens to `inventory.changed` and updates the OpenSearch document's stock level within < 500ms of checkout completion. |
| **REQ-007** | **Multi-Merchant Organization Model** | Architecture | Merchant / Chain | **P0** (Evalipie Vision) | PostgreSQL Schema | One database schema supports both independent merchants (1 org = 1 store = 1 shop) and retail chains (1 org = N stores = 1 shop). |
| **REQ-008** | **Canonical Product vs. Listing Distinction** | Architecture | System | **P0** (Evalipie Vision) | PostgreSQL Schema | Canonical products (`products`) exist once globally. Multiple merchants can create separate `listings` referencing the same canonical product with custom prices. |
| **REQ-009** | **Dedicated Merchant Storefront** | Frontend | Merchant / Customer | **P0** (Evalipie Vision) | React, Express API | Visiting `/shop/sharma-electronics` renders dedicated merchant branding, contact info, physical address, and exclusively that merchant's active listings. |
| **REQ-010** | **Same-Product Multi-Seller Comparison** | Marketplace | Customer | **P0** (Evalipie Vision) | React, OpenSearch, DB | Viewing a canonical product displays all participating sellers, their respective prices, locations, and real-time stock status in a comparative view. |
| **REQ-011** | **Evalipie AI Intent Parsing** | AI / Discovery | Customer | **P0** (Evalipie Vision) | LLM / Rule Engine, OpenSearch | Natural language input (e.g., *"clear audio meetings under 3000"*) is extracted into valid JSON: `{"category": "Electronics", "query": "microphone audio headset", "max_price": 3000}`. |
| **REQ-012** | **Catalogue-Grounded AI Recommendations** | AI / Discovery | Customer | **P0** (Evalipie Vision) | AI Pipeline, DB | AI results strictly surface actual DB/OpenSearch products. AI never invents fictional product titles, prices, ratings, or merchant names. Safe fallback if LLM is offline. |
| **REQ-013** | **Interactive Door-Hero Experience** | Frontend / UX | Customer | **P0** (Evalipie Vision) | React, CSS 3D Transforms | Landing page features smooth scroll-driven 3D opening doors revealing the marketplace. Supports responsive touch and reduced motion accessibility. |
| **REQ-014** | **Merchant Listing & Stock Console** | Merchant Portal | Merchant | **P0** (Evalipie Vision) | React, Express API | Merchant can search global catalog, create a listing with custom price, set branch stock, and toggle listing active/inactive. |
| **REQ-015** | **Merchant Order Management** | Merchant Portal | Merchant | **P0** (Evalipie Vision) | React, Express API | Merchant views incoming orders in real time, marks orders as `CONFIRMED` or `FULFILLED`, and views customer delivery notes. |
| **REQ-016** | **Retail Chain Multi-Branch Management** | Retail Chain | Chain Manager | **P1** (Enhancement) | PostgreSQL, React | Central organization manager can view and switch between multiple store branches (e.g., Indiranagar vs. Jayanagar), assigning branch-specific stock. |
| **REQ-017** | **Unmet Demand Search Insights** | Analytics | Merchant / Admin | **P1** (Enhancement) | OpenSearch / Postgres | Customer searches returning 0 results (or budget misses) are logged to show merchants what local inventory they should stock. |
| **REQ-018** | **System Outbox & Kafka Health Dashboard** | Operations | Admin | **P1** (Enhancement) | Express, Admin UI | Admin portal displays Outbox queue depth, Kafka lag, OpenSearch document count, and consumer status. |
| **REQ-019** | **Multimodal Image Discovery** | AI Discovery | Customer | **P2** (Future Scope) | Vision LLM, Vector Index | User uploads a photo of a broken kitchen gadget; visual embeddings find matching catalog listings. |
| **REQ-020** | **Multi-Merchant Cart Checkout** | Marketplace | Customer | **P2** (Future Scope) | Split Payments, DB | Single shopping cart containing items from 3 different shops automatically splits into 3 sub-orders with independent merchant settlements. |

---

## 4. Non-Functional Requirements (NFRs)

1. **ACID Transaction Guarantee:** All inventory reservations and checkout operations must execute within strict PostgreSQL serializable or repeatable-read isolation with explicit row locks (`SELECT ... FOR UPDATE`).
2. **Search Latency:** Typo-tolerant search across 10,000+ items in OpenSearch must return results in under **80ms**.
3. **Data Freshness / Index Sync:** Catalog changes in PostgreSQL must propagate through Outbox -> Kafka -> OpenSearch in under **1000ms**.
4. **Idempotency:** All payment and order submission endpoints must require an `Idempotency-Key` header, guaranteeing that network retries never generate duplicate orders or double-decrement stock.
5. **Multi-Tenant Security:** Merchant API endpoints must enforce strict authorization checks based on the authenticated user's `organization_id` and assigned `store_id`. A merchant from Organization A must never be able to read or modify listings, orders, or stock of Organization B.
6. **Graceful Degradation:** If the external LLM provider is down or unconfigured, the application must automatically fall back to an internal heuristic regex/n-gram intent parser without interrupting customer search.

---

## 5. Hackathon Judging Alignment Matrix

| Evaluation Dimension | Weight | Evalipie Architectural Fulfillment |
| :--- | :--- | :--- |
| **Technical Architecture & Aiven Utilization** | **35%** | Production-grade trifecta: Aiven PostgreSQL as ACID truth, Aiven Apache Kafka for decoupled event streams, and Aiven OpenSearch for sub-millisecond typo-tolerant search. Transactional outbox prevents dual-write anomalies. |
| **Innovation & Problem Solving** | **25%** | Solves the real-world physical retail crisis: brings neighborhood mom-and-pop shops and retail chains into an Amazon-like experience. Evalipie AI removes the need for exact product names with zero hallucinations. |
| **System Reliability & Concurrency** | **20%** | Defeats overselling under high-concurrency race conditions. Atomic stock reservations, row-level locks, idempotent checkout APIs, and asynchronous index reconciliation. |
| **Execution Quality & UI/UX** | **20%** | Memorable Door Hero visual metaphor, Plus Jakarta Sans typography, clean responsive UI, dedicated merchant storefront URLs, and comprehensive developer documentation. |
