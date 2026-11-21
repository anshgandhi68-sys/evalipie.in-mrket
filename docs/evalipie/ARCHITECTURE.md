# EVALIPIE — Complete System Architecture Specification

> **Document Status:** Phase 0 — Technical Architecture Blueprint  
> **Target Platform:** React (Vite/TypeScript) + Node.js (Express/TypeScript) + Aiven Cloud (PostgreSQL, Kafka, OpenSearch)

---

## 1. Core Architectural Tenets

1. **PostgreSQL is the Sole Source of Truth:** OpenSearch is an ephemeral, read-optimized search index. Apache Kafka is an asynchronous event distribution backbone. Neither OpenSearch nor Kafka can independently authorize orders or approve stock reservations. All balance, inventory, and order state mutations occur strictly within PostgreSQL ACID transactions.
2. **Zero Overselling via Pessimistic Row Locking:** Checkouts validate and reserve stock using atomic database transactions with row-level locks (`SELECT ... FOR UPDATE`). No two concurrent transactions can claim the same physical inventory unit.
3. **Dual-Write Elimination via Transactional Outbox:** To prevent distributed inconsistencies between PostgreSQL and Kafka/OpenSearch, state changes and event envelopes are written to the database in a single atomic transaction. An independent outbox publisher worker drains this table and pushes to Kafka with at-least-once delivery guarantees.
4. **Catalogue-Grounded AI (Zero Hallucination):** The LLM acts strictly as a semantic translator—converting fuzzy human needs into structured search parameters (categories, budget, tags). The actual catalog search, price display, and stock verification are executed against OpenSearch and PostgreSQL records.
5. **Unified Multi-Tenant Domain:** Single codebase and schema serving both standalone independent merchants and multi-branch retail chains through hierarchical organization and store modeling.

---

## 2. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph Client_Layer ["Client Tier (React + TypeScript)"]
        UI_Home["Marketplace Home & Door Hero (/)\nevalipie.in"]
        UI_AI["Evalipie AI Natural Language Search"]
        UI_Shop["Merchant Digital Storefront (/shop/:slug)"]
        UI_Prod["Product Comparison & Seller Drawer"]
        UI_Dash["Merchant & Retail Chain Console (/merchant)"]
    end

    subgraph API_Gateway ["API Gateway & Application Server (Node.js + Express + TS)"]
        MW_Auth["Auth & Tenant Context Middleware"]
        MW_Rate["Rate Limiting & Idempotency Filter"]
        
        CTRL_AI["AI Discovery Controller"]
        CTRL_Search["Catalog Search Controller"]
        CTRL_Order["Order & Checkout Controller"]
        CTRL_Merchant["Merchant & Store Management Controller"]
        
        SRV_LLM["LLM Semantic Parser Service\n(Gemini / OpenAI / Heuristic Fallback)"]
        SRV_Stock["Stock Reservation Service (Pessimistic Locking)"]
        SRV_Outbox["Transactional Outbox Relay Worker"]
    end

    subgraph Aiven_Cloud ["Aiven Cloud Managed Infrastructure"]
        subgraph Aiven_PG ["Aiven PostgreSQL 15+"]
            DB_Master[("PostgreSQL Master (ACID Truth)")]
            TBL_Outbox[("outbox_events Table")]
            TBL_Stock[("store_inventory Table (Row Locks)")]
        end

        subgraph Aiven_Kafka ["Aiven Apache Kafka"]
            TOPIC_Order["Topic: order.placed"]
            TOPIC_Stock["Topic: inventory.changed"]
            TOPIC_Listing["Topic: listing.updated"]
        end

        subgraph Aiven_OS ["Aiven OpenSearch"]
            IDX_Catalog[("Index: evalipie_catalog\n(Fuzzy / N-Gram / Location Filters)")]
        end
    end

    subgraph Background_Workers ["Distributed Asynchronous Consumers"]
        WORKER_OS_Sync["OpenSearch Index Synchronizer"]
        WORKER_Notify["Merchant Notification & Alerts"]
        WORKER_Analytics["Demand Insights & Aggregations"]
    end

    %% Client Interactions
    UI_Home -->|REST API| MW_Rate
    UI_AI -->|Natural Language Prompt| CTRL_AI
    UI_Shop -->|Get Listings by Slug| CTRL_Merchant
    UI_Prod -->|Fetch Sellers & Prices| CTRL_Search
    UI_Dash -->|Manage Products & Stock| CTRL_Merchant

    MW_Rate --> MW_Auth
    MW_Auth --> CTRL_AI & CTRL_Search & CTRL_Order & CTRL_Merchant

    %% AI Pipeline
    CTRL_AI --> SRV_LLM
    SRV_LLM -->|Structured Search Params| CTRL_Search
    CTRL_Search -->|Fuzzy Filter Query| IDX_Catalog
    CTRL_Search -->|Verify Live Stock & Prices| DB_Master

    %% Order & Concurrency Pipeline
    CTRL_Order --> SRV_Stock
    SRV_Stock -->|BEGIN Tx -> SELECT FOR UPDATE -> UPDATE| TBL_Stock
    SRV_Stock -->|INSERT Event Envelope in same Tx -> COMMIT| TBL_Outbox

    %% Outbox to Kafka
    SRV_Outbox -->|Poll Unsent Events| TBL_Outbox
    SRV_Outbox -->|Publish with Ack| TOPIC_Order & TOPIC_Stock & TOPIC_Listing
    SRV_Outbox -->|Mark Dispatched| TBL_Outbox

    %% Kafka Consumers
    TOPIC_Stock --> WORKER_OS_Sync
    TOPIC_Listing --> WORKER_OS_Sync
    TOPIC_Order --> WORKER_Notify & WORKER_Analytics
    WORKER_OS_Sync -->|Update Document Stock/Price| IDX_Catalog
```

---

## 3. Transactional Outbox & Event Streaming Architecture

To guarantee that inventory adjustments and order placements never diverge from the OpenSearch catalog, Evalipie implements the **Transactional Outbox Pattern**:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant API as Order Service
    participant PG as PostgreSQL (Aiven)
    participant OutboxWorker as Outbox Relay Worker
    participant Kafka as Aiven Apache Kafka
    participant Consumer as OpenSearch Sync Consumer
    participant OS as Aiven OpenSearch

    Customer->>API: POST /api/v1/checkout/reserve (listing_id, store_id, qty=1)
    activate API
    Note over API,PG: Step 1: Atomic ACID Transaction
    API->>PG: BEGIN TRANSACTION
    API->>PG: SELECT quantity, reserved_quantity FROM store_inventory WHERE listing_id=$1 AND store_id=$2 FOR UPDATE
    Note over PG: Row locked. Other concurrent checkouts queue or fail.
    alt Stock Available (quantity - reserved >= 1)
        API->>PG: UPDATE store_inventory SET quantity = quantity - 1 WHERE id=$id
        API->>PG: INSERT INTO orders (...) VALUES (...)
        API->>PG: INSERT INTO outbox_events (topic, payload) VALUES ('inventory.changed', {listing_id, store_id, new_stock: 0})
        API->>PG: COMMIT TRANSACTION
        API-->>Customer: 200 OK (Order Confirmed, Stock Reserved)
    else Out of Stock
        API->>PG: ROLLBACK TRANSACTION
        API-->>Customer: 409 Conflict ("Item sold out by another buyer")
    end
    deactivate API

    Note over OutboxWorker,Kafka: Step 2: Reliable Event Streaming
    loop Every 200ms
        OutboxWorker->>PG: SELECT * FROM outbox_events WHERE dispatched_at IS NULL ORDER BY created_at ASC LIMIT 50 FOR UPDATE SKIP LOCKED
        OutboxWorker->>Kafka: Publish to 'inventory.changed'
        Kafka-->>OutboxWorker: Ack (Kafka Partition Offset)
        OutboxWorker->>PG: UPDATE outbox_events SET dispatched_at = NOW() WHERE id IN (...)
    end

    Note over Consumer,OS: Step 3: Asynchronous Search Index Update
    Consumer->>Kafka: Poll 'inventory.changed'
    Kafka-->>Consumer: Event: {listing_id, store_id, new_stock: 0}
    Consumer->>OS: POST /evalipie_catalog/_update/{id} (doc: {in_stock: false, stock_count: 0})
    OS-->>Consumer: 200 OK (Index Synchronized)
    Consumer->>Kafka: Commit Offset
```

---

## 4. Frontend Architecture (Client Application)

* **Framework:** React 18+ with TypeScript, bundled with Vite for rapid HMR and optimized tree-shaken builds.
* **Styling & Tokens:** Tailwind CSS with centralized design tokens adhering to the Evalipie aesthetic:
  - Typography: `Plus Jakarta Sans`, `-apple-system`, `sans-serif`
  - Color Palette: Deep Navy (`#111827`), Teal Accent (`#167D73`), Mint (`#E9F7F3`), AI Violet (`#7657E8`), Alert Amber (`#E9A23B`), Error Red (`#DC4444`).
* **State Management:**
  - Client / UI State: Zustand for lightweight, decoupled store management (Cart drawer, User location/city preference, Notification toasts).
  - Server Cache & Revalidation: TanStack Query (React Query) for automatic caching, background polling, and optimistic updates.
* **Core View Hierarchy:**
  1. `DoorHeroView`: Scroll-driven or gesture-based 3D CSS perspective door reveal.
  2. `MarketplaceView`: AI search bar, category chips, trending cards with real-time stock tags, store proximity cards.
  3. `ShopStorefrontView`: Dynamic routing `/shop/:slug` featuring independent shop banner, address, verified badges, and catalog.
  4. `ProductComparisonModal`: Multi-seller comparison drawer listing all merchants selling the active canonical item.
  5. `MerchantConsoleView`: Tabular inventory management with inline stock steppers and order status transitions.

---

## 5. Backend Architecture (API Service)

* **Runtime:** Node.js 20+ with TypeScript (`strict: true`).
* **Framework:** Express.js structured in clean architectural layers:
  - `controllers/`: HTTP request validation, status codes, and JSON response formatting.
  - `services/`: Core business logic (Stock calculation, AI prompt structuring, Order lifecycle).
  - `repositories/`: Direct database queries utilizing parameterized SQL and connection pools.
  - `workers/`: Independent event dispatchers and Kafka consumer threads.
  - `middleware/`:
    - `tenantContext.ts`: Resolves `organization_id` and authorized `store_id` from JWT claims.
    - `idempotency.ts`: Checks Redis/Postgres for repeat request keys to prevent duplicate payments.
    - `rateLimiter.ts`: Sliding-window rate limiter guarding AI and checkout endpoints.

---

## 6. Aiven Infrastructure Integration

### A. Aiven PostgreSQL
* **Role:** Single source of ACID truth.
* **Configuration:** High-availability cluster with PgBouncer connection pooling enabled.
* **Isolation Level:** `READ COMMITTED` by default; explicit `SELECT ... FOR UPDATE` row locking during stock-critical transactions.

### B. Aiven Apache Kafka
* **Role:** Scalable, durable event spine decoupling the synchronous web tier from asynchronous indexers and notification services.
* **Topics Plan:**
  - `evalipie.order.placed` (Partitions: 3, Retention: 7 days) — Keys partitioned by `organization_id`.
  - `evalipie.inventory.changed` (Partitions: 3, Retention: 3 days) — Keys partitioned by `listing_id`.
  - `evalipie.listing.updated` (Partitions: 3, Retention: 3 days) — Keys partitioned by `listing_id`.
* **Idempotent Consumers:** Consumers track processed Kafka message offsets and record event IDs in a local `processed_events` table to eliminate duplicate execution under network reconnects.

### C. Aiven OpenSearch
* **Role:** Sub-millisecond, typo-tolerant search and facet aggregation engine.
* **Index Strategy:** Single denormalized index `evalipie_catalog` joining product specifications, merchant listings, store locations, and real-time stock status.
* **Analyzer Configuration:** Custom edge-ngram analyzer combined with English stemmer and fuzzy levenshtein matching (`fuzziness: "AUTO"`).

---

## 7. Multi-Tenant Security & Data Isolation

```mermaid
flowchart LR
    subgraph Security_Perimeter ["Security Perimeter"]
        Req[Incoming HTTP Request] --> JWT[JWT Verification]
        JWT --> Claims{Extract Claims}
        Claims -->|Role: CUSTOMER| Scope_Cust[Scope: Public Marketplace Only]
        Claims -->|Role: MERCHANT_OWNER| Scope_Org[Scope: organization_id = claims.orgId]
        Claims -->|Role: STORE_MANAGER| Scope_Store[Scope: store_id = claims.storeId]
        Claims -->|Role: SUPER_ADMIN| Scope_All[Scope: Unrestricted System Access]
    end

    subgraph Data_Layer ["PostgreSQL Query Enforcement"]
        Scope_Org --> Query1["SELECT * FROM listings WHERE organization_id = :orgId"]
        Scope_Store --> Query2["SELECT * FROM store_inventory WHERE store_id = :storeId"]
    end
```

* **Authentication:** Stateless signed JWTs with 15-minute access token lifespan and secure HTTP-only refresh tokens.
* **Tenant Isolation:** Every merchant-scoped query mandatorily binds `organization_id` derived from the verified token—never accepted blindly from client request body parameters.
* **Role-Based Access Control (RBAC):**
  - `SUPER_ADMIN`: Platform operations, Kafka monitoring, global catalog creation.
  - `MERCHANT_OWNER`: Full control over organization, branches, digital storefront, and bank payouts.
  - `STORE_MANAGER`: Operational control over designated store branch inventory and order fulfillment.
  - `CUSTOMER`: Public catalog browsing, authenticated order placement, and personal order history.
