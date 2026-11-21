# EVALIPIE — Implementation Status & Architecture Telemetry

> **Product:** EVALIPIE (`https://evalipie.in`)  
> **Repository:** `https://github.com/anshgandhi68-sys/evallipie_market`  
> **Last Updated:** Phase 1 Scaffolding & Core Architecture Execution

---

## 1. Overall System Scorecard

| Module / Pillar | Status | Core Technologies | Highlights |
| :--- | :--- | :--- | :--- |
| **Pillar 1: Customer Marketplace** | 🟡 In Scaffolding | React, TypeScript, Tailwind, CSS 3D | 3D Door Hero, Category Grid, Trending Feeds, Dedicated `/shop/:slug` |
| **Pillar 2: Evalipie Business** | 🟡 In Scaffolding | React, Express, PostgreSQL | Merchant console, listing manager, branch switcher, order tracking |
| **Pillar 3: Evalipie AI Discovery** | 🟡 In Scaffolding | LLM / Heuristic Regex, OpenSearch | Natural language intent extraction, grounded catalog search, zero hallucination |
| **Pillar 4: Evalipie Voice Khata** | 🟡 In Scaffolding | Gnani Prisma/Timbre, WebSockets | Hands-free Udhaar recording, amount corrections, name disambiguation, audio waveform |
| **Pillar 5: Admin & Operations** | 🟡 In Scaffolding | Express, PostgreSQL, Kafka Admin | Outbox monitor, Kafka topic stream, OpenSearch sync telemetry |
| **Database & Concurrency** | 🟢 Designed / Ready | Aiven PostgreSQL, Row Locks | Atomic `SELECT FOR UPDATE`, zero overselling under race conditions |
| **Transactional Outbox & Kafka** | 🟢 Designed / Ready | PostgreSQL Outbox, Apache Kafka | At-least-once event streaming (`order.placed`, `inventory.changed`) |
| **Typo-Tolerant OpenSearch** | 🟢 Designed / Ready | Aiven OpenSearch 2.x | Multi-field edge-ngram analyzer with Levenshtein fuzzy matching |

*Status Legend:*  
🟢 **Complete & Verified** | 🟡 **In Scaffolding / Active Implementation** | ⚪ **Planned Phase** | 🔴 **Blocked / Pending Credentials**

---

## 2. Feature-by-Feature Matrix

| Feature | Category | Track | Status | Verification Detail |
| :--- | :--- | :--- | :--- | :--- |
| **3D Door Hero Reveal** | UI/UX | Marketplace | 🟡 In Progress | Porting prototype to React component with smooth scroll & reduced motion |
| **Canonical vs Listing Model** | Data Model | Core Vision | 🟢 Designed | PostgreSQL schema decoupling universal product from merchant price/stock |
| **Multi-Seller Comparison Drawer** | Marketplace | Core Vision | 🟡 In Progress | Drawer component comparing offers across Bengaluru shops |
| **Dedicated `/shop/:slug` Pages** | Merchant | Core Vision | 🟡 In Progress | Standalone storefront rendering merchant banner, address, verified badge |
| **Atomic Concurrency Reservation** | Concurrency | Aiven Core | 🟡 In Progress | Single-transaction `SELECT FOR UPDATE` protecting stock=1 |
| **Transactional Outbox Worker** | Architecture | Aiven Core | 🟡 In Progress | Outbox poller dispatching events to Kafka topics |
| **Typo-Tolerant Catalog Search** | Search | Aiven Core | 🟡 In Progress | OpenSearch edge-ngram mapping handling typos (`blutooth hedphone`) |
| **OpenSearch Real-time Sync** | Pipeline | Aiven Core | 🟡 In Progress | Kafka consumer updating search index stock within < 500ms |
| **Evalipie AI Intent Parser** | AI Search | Core Vision | 🟡 In Progress | LLM schema parser + offline heuristic regex fallback |
| **Voice Khata Push-to-Talk UI** | Voice UI | Gnani PS2 | 🟡 In Progress | Large responsive voice button, waveform visualizer, transcript stream |
| **First-Turn AI Disclosure** | Voice Ethics | Gnani PS2 | 🟢 Designed | Prompt starts with mandatory Indic AI disclosure statement |
| **Voice Credit Entry (Udhaar)** | Voice NLU | Gnani PS2 | 🟡 In Progress | Extracts customer, amount, direction from *"Ramesh ka 340 udhaar"* |
| **Voice Payment Entry (Jama)** | Voice NLU | Gnani PS2 | 🟡 In Progress | Decrements balance from *"Ramesh ne 200 diye"* |
| **Natural Number Parsing** | Voice NLU | Gnani PS2 | 🟡 In Progress | Interprets *"teen sau chaalis"*, *"1250"*, etc. under noise |
| **Spoken Correction Workflow** | Voice NLU | Gnani PS2 | 🟡 In Progress | Handles multi-turn *"Nahi, 430 tha"* before commit |
| **Customer Disambiguation** | Voice NLU | Gnani PS2 | 🟡 In Progress | Resolves duplicate names with distinguishing tags (*"Indiranagar wale"*) |
| **Spoken Balance Queries** | Voice Analytics | Gnani PS2 | 🟡 In Progress | Real-time calculation of daily credit and customer balances in < 2.0s |
| **Auditable Manual Ledger** | Merchant Web | Gnani PS2 | 🟡 In Progress | Transparent tabular view of all credit/payment entries |
