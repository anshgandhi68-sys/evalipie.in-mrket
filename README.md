# EVALIPIE — Every Shop. One Intelligent Marketplace.

> **Official Domain:** [https://evalipie.in](https://evalipie.in)  
> **Brand Vision:** Bridging traditional neighbourhood retail and modern e-commerce across India.  
> **GitHub Repository:** [https://github.com/anshgandhi68-sys/evalipie.in-mrket](https://github.com/anshgandhi68-sys/evalipie.in-mrket)

---

## 1. Executive Product Overview

Evalipie is a production-oriented, multi-merchant commerce and voice-first retail operating system. It bridges physical retail businesses—from local kirana shopkeepers to multi-branch regional chains—and online shoppers through five interconnected pillars:

1. **Pillar 1 — Customer Marketplace (`/`)**: Discover and purchase products from participating stores across Bengaluru. Features our signature **3D Door-Hero** opening reveal, category exploration, and geolocation proximity.
2. **Pillar 2 — Evalipie Business (`/business`)**: Operating system for merchants. Standalone shopkeepers launch their own branded digital storefront (e.g. `evalipie.in/shop/sharma-electronics`), while retail chains manage multiple physical branches (Indiranagar, Jayanagar, Whitefield) from a single unified console.
3. **Pillar 3 — Evalipie AI (`/ai`)**: Natural-language conversational discovery. Shoppers describe their needs (e.g. *"I need something for clear audio during online meetings under ₹3,000"*); Evalipie AI parses intent into structured filters and discovers real matching products with **zero hallucinations**.
4. **Pillar 4 — Evalipie Voice Khata (`/business/voice-khata`)**: Voice-first merchant ledger built for the **Gnani Voice Hackathon (PS2 Kirana Track)**. Shopkeepers speak naturally (*"Ramesh ka 340 udhaar likh do"*), correct amounts mid-speech (*"Nahi, 430 tha"*), resolve duplicate customer names, and ask spoken balance queries (*"Aaj kitna udhaar gaya?"*) with audio feedback and $< 2.0$s response latency.
5. **Pillar 5 — Platform Operations & Observability (`/admin`)**: Real-time cluster health monitoring, Transactional Outbox telemetry, and an **Interactive Live Concurrency Race Runner** proving zero overselling when two buyers compete for the last item.

---

## 2. Dual-Track Hackathon Alignment

```
+---------------------------------------------------------------------------------------------------+
| TRACK A: THE ONLINE STORE CHALLENGE (AIVEN TRACK)                                                 |
| - Aiven PostgreSQL: ACID single source of truth & atomic row-level locking (SELECT ... FOR UPDATE) |
| - Aiven Apache Kafka: Transactional outbox event publishing (order.placed, inventory.changed)      |
| - Aiven OpenSearch: Sub-millisecond typo-tolerant catalog discovery ("blutooth hedphone")          |
| - Concurrency Guarantee: Zero overselling under simultaneous checkouts on stock = 1               |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| TRACK B: GNANI VOICE HACKATHON (PS2 VOICE KHATA FOR KIRANA STORES)                                |
| - Gnani Prisma v3.0: WebSocket streaming speech-to-text (STT) supporting Indic/Hinglish code-mix  |
| - Gnani Timbre v3.0: Neural text-to-speech (TTS) audio feedback stream                            |
| - Custom State Machine: Credit/payment extraction, number parsing, disambiguation & corrections   |
| - Responsible AI: Mandatory first-turn AI disclosure, zero telephony, zero voice cloning         |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 18 + TypeScript + Tailwind CSS)"]
        UI_Home["Door Hero & Marketplace (evalipie.in)"]
        UI_Shop["Merchant Digital Storefront (/shop/:slug)"]
        UI_Voice["Voice Khata Push-to-Talk Console"]
        UI_Admin["Operations & Concurrency Telemetry"]
    end

    subgraph Server ["Backend Core (Node.js + Express + TypeScript + WebSockets)"]
        API["REST API Router (/api/v1)"]
        WS["WebSocket Gateway (/ws/voice-khata)"]
        NLU["Voice Khata State Machine"]
        AI_Parser["AI Intent Extractor (Zero Hallucination)"]
        Outbox["Transactional Outbox Relay Worker"]
    end

    subgraph Aiven ["Aiven Cloud Services"]
        PG[("Aiven PostgreSQL\n(ACID Source of Truth & Row Locks)")]
        Kafka{{"Aiven Apache Kafka\n(Event Streams: order.placed, inventory.changed)"}}
        OpenSearch[("Aiven OpenSearch\n(Typo-Tolerant Edge-Ngram Index)")]
    end

    subgraph Gnani ["Gnani Voice Platform"]
        Prisma["Prisma v3.0 Streaming STT"]
        Timbre["Timbre v3.0 Neural TTS"]
    end

    UI_Home -->|REST| API
    UI_Shop -->|REST| API
    UI_Voice -->|WebAudio / WS| WS
    UI_Admin -->|REST| API

    WS --> Prisma
    WS --> Timbre
    WS --> NLU
    NLU --> PG

    API --> AI_Parser
    AI_Parser --> OpenSearch
    AI_Parser --> PG

    API -->|Atomic SELECT FOR UPDATE| PG
    PG -->|Outbox Pattern| Outbox
    Outbox --> Kafka
    Kafka -->|Sync Consumer| OpenSearch
```

---

## 4. Key Architectural Differentiators

### A. Canonical Product vs. Merchant Listing
Universal products (e.g. *SoundPro Bluetooth Headphones*) are modeled once globally. Multiple merchants create independent listings with custom selling prices and branch stock. Shoppers can compare all local offers side-by-side.

### B. Overselling Resistance & Concurrency Protection
PostgreSQL protects inventory at checkout using atomic transactions with row-level locks:
```sql
BEGIN;
SELECT quantity, reserved_quantity FROM store_inventory WHERE listing_id = $1 AND store_id = $2 FOR UPDATE;
-- If stock is available, decrement and write order + outbox event:
UPDATE store_inventory SET quantity = quantity - 1 WHERE id = $id;
INSERT INTO orders (...) VALUES (...);
INSERT INTO outbox_events (...) VALUES ('evalipie.inventory.changed', ...);
COMMIT;
```
If two buyers checkout simultaneously when `stock = 1`, exactly 1 succeeds (HTTP 201) and 1 receives an immediate HTTP 409 Conflict with alternative seller recommendations.

### C. Voice Khata Conversational Intelligence (Gnani PS2)
- **Mandatory Turn-1 AI Disclosure:** *"Namaste! Main Evalipie ka AI Voice Khata Assistant hoon. Main aapke udhaar aur payments record karne mein madad karunga."*
- **Colloquial Number Parsing:** Accurately converts *"teen sau chaalis"* $\rightarrow 340$, *"barah sau pachaas"* $\rightarrow 1250$, and *"dedh sau"* $\rightarrow 150$.
- **Spoken Correction:** Multi-turn conversational edits (*"Nahi, 430 tha"*) update pending amounts before saving without duplicate records.
- **Duplicate Customer Disambiguation:** Asks clarifying questions (*"Do Ramesh hain. Indiranagar wale ya Jayanagar wale?"*) to prevent ledger collisions.

---

## 5. Getting Started & Development Setup

### Prerequisites
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/anshgandhi68-sys/evallipie_market.git
   cd evallipie_market
   ```

2. Install dependencies across workspaces:
   ```bash
   npm install
   ```

3. Environment Configuration:
   Create a `.env` file in the root directory (optional; the platform boots out-of-the-box in `DEV_FALLBACK_MODE` if credentials are not yet supplied):
   ```env
   PORT=5000
   NODE_ENV=development

   # Aiven Cloud Services (Optional for production cloud connection)
   AIVEN_PG_URL=postgres://user:password@pg-evalipie.aivencloud.com:port/defaultdb?sslmode=require
   AIVEN_KAFKA_BROKERS=kafka-evalipie.aivencloud.com:port
   AIVEN_OPENSEARCH_URL=https://user:password@os-evalipie.aivencloud.com:port

   # Gnani Voice Platform (Optional for live Gnani gateway)
   GNANI_API_KEY=your_gnani_api_key
   GNANI_TOKEN=your_gnani_token

   # AI Provider
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Running the Full-Stack Application
Start both the backend API server and Vite React client simultaneously:
```bash
npm run dev
```
* **Customer Marketplace:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
* **Voice Khata WebSocket:** `ws://localhost:5000/ws/voice-khata`

---

## 6. Verification & Automated Test Suites

### 1. Concurrency & Overselling Stress Test
Fires two simultaneous checkout requests for an item with `stock = 1`:
```bash
npm run test:concurrency
```
**Expected Output:**
```
Initial Stock for Sharma Electronics Headphones: 1 unit.
Simulating 2 concurrent checkout requests at the exact same millisecond...
[Buyer 1] => SUCCESS: EVAL-925809-811
[Buyer 2] => REJECTED: StockExhausted: Insufficient inventory
Final Stock Remaining in Database: 0
✅ TEST PASSED: Exactly 1 order succeeded, 1 rejected. ZERO OVERSELLING.
```

### 2. Voice Khata Benchmark Suite (Gnani PS2)
Tests conversational state machine, number parsing, corrections, disambiguation, and latency:
```bash
npm run test:voice
```
**Expected Output:**
```
[PASS] Test 1: Mandatory AI Disclosure
[PASS] Test 2: Credit Entry Intent & Amount (340 parsed)
[PASS] Test 3: Customer Disambiguation (Indiranagar vs Jayanagar Ramesh)
[PASS] Test 4: Disambiguation Selection
[PASS] Test 5: Spoken Correction (340 -> 430)
[PASS] Test 6: Transaction Confirmation
[PASS] Test 7: Colloquial Number Parsing (teen sau chaalis, dedh sau)
[PASS] Test 8: Daily Aggregates Query ("Aaj kitna udhaar gaya?")
BENCHMARK SUMMARY: 8/8 TESTS PASSED. Measured Latency: < 250ms (well under 2.0s Gnani target).
```

---

## 7. Demo Workflows for Judges

### Live Demo Flow A: The Online Store (Aiven Track)
1. **The Door Hero Reveal:** Visit [http://localhost:5173](http://localhost:5173) and scroll down; watch the 3D shop doors swing open into the marketplace.
2. **Typo-Tolerant Search:** Search `"blutooth hedphone"` in the search bar. OpenSearch returns *SoundPro Bluetooth Headphones* in $< 50$ms.
3. **Multi-Seller Comparison:** Click **"Compare Offers"** on SoundPro Headphones. View *Sharma Electronics* (₹2,499 - 1.4km away) vs *Patel Digital* (₹2,699) vs *City Supermarket* (₹2,799).
4. **Shopkeeper Sovereignty:** Click on Sharma Electronics to view their sovereign digital storefront at `/shop/sharma-electronics`.
5. **Concurrency Test:** Go to `/admin` and click **"Trigger Live Concurrency Race"**. Watch Buyer A confirm and Buyer B get rejected with 409 Conflict live on screen!

### Live Demo Flow B: Gnani Voice Khata (PS2 Track)
1. Open [http://localhost:5173/business/voice-khata](http://localhost:5173/business/voice-khata).
2. Note the initial turn-1 spoken disclosure: *"Namaste! Main Evalipie ka AI Voice Khata Assistant hoon..."*.
3. Hold the Push-to-Talk button or click the test prompt chip: *"Ramesh ka 340 udhaar likh do"*.
4. System detects 2 customers named Ramesh and asks: *"Do Ramesh hain. Indiranagar wale ya Jayanagar wale?"*.
5. Speak or click: *"Indiranagar wale"*.
6. Correct the amount mid-speech: *"Nahi, 430 tha"*. Assistant updates amount to ₹430.
7. Say *"Haan, save kar do"*. Entry commits to ledger; view balance update to ₹1,630.
8. Ask balance query: *"Aaj kitna udhaar gaya?"*. Assistant answers today's credit total aloud with $< 250$ms latency!

---

## 8. License & Acknowledgments

Built for the **Aiven Online Store Challenge** and **Gnani Voice Hackathon (PS2)**.  
Designed and engineered with pride by the Evalipie development team.
