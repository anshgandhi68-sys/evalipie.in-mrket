# EVALIPIE — Dual-Brief Requirements Traceability & Prioritization Matrix

> **Traceability Structure:**
> Section 1: Brief A — Official Online Store Challenge Requirements (Aiven Track)  
> Section 2: Brief B — Official Gnani Voice Hackathon Requirements (PS2 Voice Khata Track)  
> Section 3: Section 3 — Additional Evalipie Long-Term Product Vision  
> **Rule:** Neither track's requirements are falsely presented as mandatory for the other. Each competition track can be isolated or presented independently.

---

## SECTION 1: OFFICIAL ONLINE STORE CHALLENGE REQUIREMENTS (BRIEF A - AIVEN TRACK)

*Focus: A physical retail chain moving online across India facing overselling, failed typo searches, desynchronized inventory, and coupled order handling.*

| Req ID | Capability / Feature | Category | Mandatory For | Technology Constraint | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-A1** | **Atomic Inventory Stock Reservation** | Concurrency / DB | Brief A (P0) | Aiven PostgreSQL (`SELECT ... FOR UPDATE`) | Two concurrent buyers checking out the last unit (`stock = 1`) simultaneously: exactly 1 succeeds, 1 receives immediate 409 Conflict rejection. Zero overselling. |
| **REQ-A2** | **Typo-Tolerant Product Search** | Search Engine | Brief A (P0) | Aiven OpenSearch (Fuzzy Match, Levenshtein) | Misspelled queries like `"blutooth hedphone"` match Bluetooth Headphones within < 80ms with high relevance score. |
| **REQ-A3** | **City, Category & Price Filtering** | Search Engine | Brief A (P0) | Aiven OpenSearch / PostgreSQL | Search queries filtered by city (Bengaluru), category (Electronics), and price range (`<= ₹3,000`) return active local stock. |
| **REQ-A4** | **Transactional Outbox Event Generation** | Event Streaming | Brief A (P0) | Aiven PostgreSQL (`outbox_events` table) | Orders and stock mutations write to the outbox table in the exact same ACID transaction. Zero dual-write loss. |
| **REQ-A5** | **Kafka Order & Inventory Event Distribution** | Event Streaming | Brief A (P0) | Aiven Apache Kafka (`order.placed`, `inventory.changed`) | Outbox worker publishes events to Kafka topics with at-least-once delivery; consumer idempotency prevents duplicate execution. |
| **REQ-A6** | **Search Index Synchronization** | Data Pipeline | Brief A (P0) | Kafka Consumer $\rightarrow$ Aiven OpenSearch | Stock reservation events consumed from Kafka update OpenSearch document stock within < 500ms of checkout completion. |
| **REQ-A7** | **Physical Retail Store Online Presence** | Full-Stack | Brief A (P0) | React Frontend + Node.js/Express REST API | Web storefront displaying physical retail locations, city stock availability, and working cart/checkout. |

---

## SECTION 2: OFFICIAL GNANI VOICE HACKATHON REQUIREMENTS (BRIEF B - PS2 VOICE KHATA)

*Focus: PS2 — Voice Khata for Kirana Stores. A hands-free, voice-first merchant ledger for recording customer credit and payments while attending to customers across the counter.*

| Req ID | Capability / Feature | Category | Mandatory For | Technology Constraint | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-B1** | **Gnani Prisma v3.0 Speech-to-Text (STT)** | Voice AI | Brief B (P0) | Gnani API Platform (WebSocket Streaming) | Continuous streaming audio capture from browser converted to partial and final Hindi/Hinglish transcripts. |
| **REQ-B2** | **Gnani Timbre v3.0 Text-to-Speech (TTS)** | Voice AI | Brief B (P0) | Gnani API Platform (Audio Synthesis) | Spoken responses synthesized in natural Indic neural voice with clear pronunciations. |
| **REQ-B3** | **Voice Credit (Udhaar) Recording** | Ledger NLU | Brief B (P0) | Custom Orchestration State Machine | Spoken input like *"Ramesh ka 340 udhaar likh do"* extracts Customer: Ramesh, Amount: ₹340, Type: CREDIT, and adds to ledger. |
| **REQ-B4** | **Voice Payment (Jama) Recording** | Ledger NLU | Brief B (P0) | Custom Orchestration State Machine | Spoken input like *"Ramesh ne 200 rupaye diye"* extracts Customer: Ramesh, Amount: ₹200, Type: PAYMENT, and decrements balance. |
| **REQ-B5** | **Natural Numbers Under Retail Noise** | Voice NLU | Brief B (P0) | Colloquial Number Parser | Correctly parses numeric and colloquial numbers: *"340"*, *"teen sau chaalis"*, *"barah sau pachaas"*, *"dedh sau"* with $\ge 98\%$ accuracy. |
| **REQ-B6** | **Spoken Corrections Multi-Turn Flow** | Conversational | Brief B (P0) | State Machine Rollback | When shopkeeper says *"Nahi, 430"*, pending amount updates to ₹430 before final confirmation without double-logging. |
| **REQ-B7** | **Duplicate Customer Disambiguation** | Conversational | Brief B (P0) | PostgreSQL Customer Tag Query | When 2 customers share the name Ramesh, agent asks: *"Do Ramesh hain. Indiranagar wale ya Jayanagar wale?"*. |
| **REQ-B8** | **Spoken Balance & Daily Queries** | Voice Analytics | Brief B (P0) | PostgreSQL Ledger Aggregates | Spoken query *"Aaj kitna udhaar gaya?"* calculates real sum of today's credit entries and answers within $\le 2.0$ seconds. |
| **REQ-B9** | **Mandatory AI Disclosure in Turn 1** | Safety / Ethics | Brief B (P0) | Spoken / Visual Disclosure | Agent announces in its first turn: *"Namaste! Main Evalipie ka AI Voice Khata Assistant hoon..."*. |
| **REQ-B10** | **Prohibited Capabilities Compliance** | Policy | Brief B (P0) | Hard Constraint | Zero telephony/phone calls, zero voice cloning, zero healthcare workflows, synthetic test data only. |
| **REQ-B11** | **Auditable Manual Ledger Interface** | Web UI | Brief B (P0) | React Web Console | Visual ledger table allowing shopkeepers to inspect, verify, search, and audit every voice-entered transaction. |

---

## SECTION 3: ADDITIONAL EVALIPIE PRODUCT VISION (UNIFIED PLATFORM)

*Focus: The combined long-term vision uniting independent shopkeepers, retail chains, and AI-first customer marketplace.*

| Req ID | Capability / Feature | Category | Priority | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-V1** | **Unified Multi-Merchant Organization Model** | Architecture | **P0** | PostgreSQL Schema | 1 schema supports independent shopkeepers (1 org = 1 shop) and multi-branch retail chains (1 org = N branches). |
| **REQ-V2** | **Canonical Product vs. Merchant Listing** | Architecture | **P0** | PostgreSQL Schema | Multiple merchants offer independent prices for the exact same canonical catalog item. |
| **REQ-V3** | **Dedicated Merchant Storefronts (`/shop/:slug`)** | Marketplace | **P0** | React + Express API | Dedicated branded URL giving independent merchants digital sovereignty (logo, banner, location, catalog). |
| **REQ-V4** | **Same-Product Multi-Seller Comparison Drawer** | Marketplace | **P0** | React UI | Shopper can compare all shops selling the same headphone (prices, distances, stock) in a single drawer. |
| **REQ-V5** | **Evalipie AI Natural Language Discovery** | Customer AI | **P0** | LLM / Heuristic + OpenSearch | Shopper types problem statement (*"clear audio meetings under 3000"*); returns grounded products with zero hallucination. |
| **REQ-V6** | **Signature 3D Door-Hero Visual Experience** | Frontend / UX | **P0** | React + CSS 3D Transforms | High-fidelity scroll/gesture-driven 3D shop door opening into the marketplace with accessible fallback. |
| **REQ-V7** | **Retail Chain Multi-Branch Management** | Retail SaaS | **P1** | React + PostgreSQL | Central chain operations manager can switch branches, manage branch-specific stock, and view combined analytics. |
| **REQ-V8** | **Unmet Demand Search Insights** | Merchant BI | **P1** | Search Logs / OpenSearch | Logs 0-result customer searches to inform merchants what local inventory to stock. |
| **REQ-V9** | **Multimodal Image Product Discovery** | Customer AI | **P2** | Vision LLM / Vector Index | Upload photo of broken part to discover matching local shop inventory. |
| **REQ-V10** | **Multi-Merchant Split Order Checkout** | Marketplace | **P2** | Split Payments / Logistics | Single cart containing items from multiple stores automatically split into independent merchant deliveries. |
