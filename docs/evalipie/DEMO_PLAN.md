# EVALIPIE — Hackathon Demonstration & Judging Presentation Plan

> **Document Status:** Phase 0 — Demo Strategy & Live Script  
> **Target Audience:** Hackathon Judges, Technical Architects, Business Reviewers  
> **Demo Duration:** 5 to 7 Minutes (Punchy, High-Impact, Technical Rigor)

---

## 1. Demonstration Philosophy: "The Three Pillars"

Judges evaluate hundreds of generic hackathon pitches. To stand out and win, the Evalipie presentation is structured around three irrefutable pillars:

1. **The Visual & Emotional Hook:** The physical-to-digital neighborhood shop metaphor (The 3D Door-Hero reveal).
2. **The AI Differentiator:** Natural language discovery that solves the "I don't know the product name" problem with **zero hallucination**.
3. **The Technical Showstopper:** Live, indisputable proof of distributed systems engineering: **two simultaneous buyers competing for the last unit of stock**, backed by Aiven PostgreSQL row locks, Aiven Kafka event streaming, and sub-millisecond Aiven OpenSearch index synchronization.

---

## 2. Minute-by-Minute Live Presentation Script

```
00:00 - 01:00 | ACT 1: The Vision & The Door Hero Hook
01:00 - 02:30 | ACT 2: Evalipie AI (Natural Language Discovery)
02:30 - 03:45 | ACT 3: Typo-Tolerant Search & Canonical Seller Comparison
03:45 - 04:30 | ACT 4: Independent Merchant Storefront Sovereignty (/shop/sharma-electronics)
04:30 - 06:00 | ACT 5: THE SHOWSTOPPER — Live Concurrency & Concurrency Overselling Defeat
06:00 - 07:00 | ACT 6: The Distributed Engine (Outbox -> Aiven Kafka -> Aiven OpenSearch)
```

---

### Act 1: The Vision & The Door Hero (0:00 – 1:00)
* **Visual:** Browser opened to `evalipie.in`. Clean sky, awning, physical shop doors.
* **Speaker:**
  > *"Every neighbourhood has a Sharma Electronics or a Patel Store—merchants who know their customers personally. But in today's digital era, they are either invisible online or swallowed whole by e-commerce monopolies where they lose their identity.*  
  > *Meet **EVALIPIE**: Every Shop. One Intelligent Marketplace."*
* **Action:** Speaker scrolls down smoothly. The 3D doors swing open dynamically, pulling the camera into the vibrant Bengaluru marketplace.
* **Takeaway:** Immediate aesthetic impact, clear emotional positioning.

---

### Act 2: Evalipie AI — Natural Language Discovery (1:00 – 2:30)
* **Visual:** The Evalipie AI bar with prompt chips.
* **Speaker:**
  > *"Most customers know their problem, but not the technical product name. Traditional search fails them."*
* **Action:** Speaker clicks the chip: *"I need something for clear audio during online meetings under ₹3,000"*.
* **System Reaction:**
  1. Evalipie AI extracts intent: Category: `Electronics`, Target: `Microphone/Headset`, Max Price: `₹3,000`.
  2. Grounded catalog results appear instantly:
     - **HyperClear USB Condenser Mic** from *Patel Digital Store* (Jayanagar) at **₹2,799**.
     - **SoundPro Bluetooth Headphones** from *Sharma Electronics* (Indiranagar) at **₹2,499**.
  3. Notice the explanation pill: *"Directly isolates speaking voice; built-in noise filter fits meeting needs under ₹3,000"*.
* **Speaker:**
  > *"Zero hallucinations. Notice how the AI never invents a product. It translates human need into a structured search across participating physical stores."*

---

### Act 3: Typo-Tolerant Search & Multi-Seller Comparison (2:30 – 3:45)
* **Visual:** Search bar.
* **Action:** Speaker types a deliberate typo: `"blutooth hedphone"`.
* **System Reaction:** Sub-millisecond return from **Aiven OpenSearch** with fuzzy matching.
* **Action:** Speaker clicks on the *SoundPro Bluetooth Headphones* canonical card.
* **Drawer Reveals:**
  > *2 Sellers in Bengaluru:*
  > 1. **Sharma Electronics** — ₹2,499 (In Stock: 1 unit remaining! Only 1.4 km away).
  > 2. **Patel Digital Store** — ₹2,699 (Low Stock: 2 units).
* **Speaker:**
  > *"Evalipie separates the Canonical Product from the Merchant Listing. A customer can compare local shops for the exact same physical item in one tap."*

---

### Act 4: Shopkeeper Sovereignty (`/shop/sharma-electronics`) (3:45 – 4:30)
* **Action:** Speaker clicks *"View Shop Profile"* on Sharma Electronics.
* **Visual:** Navigates to `evalipie.in/shop/sharma-electronics`.
* **Speaker:**
  > *"This is Sharma Electronics' sovereign digital store. They have their own branding, street address on 100ft Road Indiranagar, and their own curated inventory. Even a single neighbourhood shopkeeper gets an Amazon-grade presence in 5 minutes."*

---

### Act 5: THE SHOWSTOPPER — Live Concurrency & Concurrency Race (4:30 – 6:00)
* **Visual:** Two browser windows side-by-side on screen:
  - **Left Window:** Buyer A (Mobile view / Chrome).
  - **Right Window:** Buyer B (Incognito window).
  - Both view *Sharma Electronics' Bluetooth Headphone* where **Available Stock = 1**.
* **Speaker:**
  > *"Now for the hardest problem in retail e-commerce: physical stock synchronization and concurrency. There is only ONE unit left on Sharma's shelf. What happens when two buyers click Buy at the exact same millisecond?"*
* **Action:** Speaker runs a concurrent curl/script or clicks **"Reserve & Checkout"** in both windows simultaneously!
* **System Result:**
  - **Buyer A Window:** Green checkmark: *"Order Confirmed! Order #EVAL-001. Stock Reserved"*.
  - **Buyer B Window:** Instant red notification: *"Stock Exhausted! The last remaining unit was just claimed by another customer. Would you like to buy from Patel Digital Store (2 km away) for ₹2,699?"*
* **Speaker:**
  > *"PostgreSQL executed an atomic `SELECT ... FOR UPDATE` lock. Zero overselling. Zero double-spend. 100% ACID reliability."*

---

### Act 6: The Distributed Event Engine (6:00 – 7:00)
* **Visual:** Switch to Admin Telemetry Dashboard (`evalipie.in/admin`).
* **Visual Display:**
  1. **PostgreSQL Outbox Table:** Shows the `inventory.changed` event written inside the checkout transaction.
  2. **Aiven Apache Kafka:** Shows the event published to topic `evalipie.inventory.changed` and consumed in < 80ms.
  3. **Aiven OpenSearch Telemetry:** Shows that the public catalog document for Sharma Electronics was atomically updated to `in_stock: false, stock_count: 0`.
  4. **Merchant Console:** Sharma Electronics' dashboard live-updates with incoming order #EVAL-001.
* **Closing Statement:**
  > *"Every shop gets a digital identity. Every customer gets intelligent discovery. Every order gets reliable inventory handling. This is EVALIPIE. Built with Aiven PostgreSQL, Kafka, and OpenSearch."*

---

## 3. Demo Readiness & Technical Checklist

| Item | Component | Readiness Criteria | Status |
| :--- | :--- | :--- | :--- |
| **1** | Door Hero Scroll | Smooth 60fps door rotation on desktop and tablet. | Verified in Prototype; ready for React port. |
| **2** | AI Discovery | Returns grounded results for test query in < 500ms. | Intent schema & heuristic fallback defined. |
| **3** | Typo Search | Query "blutooth hedphone" returns SoundPro headphones. | OpenSearch analyzer mapped. |
| **4** | Multi-Seller View | Shows Sharma Electronics vs Patel Digital Store offers. | Relational schema & API designed. |
| **5** | Concurrency Test | Automated script triggers 2 simultaneous requests for stock=1. | Tested SQL row-lock logic prepared. |
| **6** | Admin Dashboard | Visualizes Outbox events, Kafka stream, and OpenSearch sync. | API endpoints & UI wireframe ready. |
| **7** | Fallback Offline Mode | Works seamlessly even if conference Wi-Fi experiences lag. | In-memory Kafka & Regex intent fallback planned. |
