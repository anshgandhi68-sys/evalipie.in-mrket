# EVALIPIE — Product Overview & System Vision

> **Official Domain:** [https://evalipie.in](https://evalipie.in)  
> **Tagline / Brand Positioning:** *Every Shop. One Intelligent Marketplace.*  
> **Product Category:** Multi-Merchant E-Commerce Marketplace + AI-Powered Product Discovery + Distributed Retail Management Platform.  
> **Document Status:** Phase 0 — Pre-Development Architecture & Strategy Document.

---

## 1. Executive Summary & Big Vision

Across India and emerging retail markets, millions of physical shopkeepers—from standalone neighbourhood mom-and-pop stores (Kiranas, electronics shops, boutique apparel) to expanding regional retail chains—are trapped in a stark digital divide. Traditional e-commerce monopolies force retailers into rigid, commoditized listing pages where they surrender customer relationships, profit margins, and local brand identity. Conversely, building and operating an independent e-commerce website is prohibitively expensive, operationally complex, and yields virtually zero organic footfall or discovery.

**EVALIPIE** transforms this dynamic by creating a unified, multi-merchant intelligent commerce ecosystem.

Evalipie provides every merchant—regardless of technical capability—an instant, Amazon-grade digital storefront under their own identity (e.g., `evalipie.in/shop/sharma-electronics`). Simultaneously, Evalipie aggregates all participating merchants into a high-performance, single-search customer marketplace (`evalipie.in`).

Crucially, Evalipie solves the discovery bottleneck through **Evalipie AI**, an intent-understanding discovery engine that allows customers to describe everyday needs in conversational language (e.g., *"I need something for clear audio during online meetings under ₹3,000"*), mapping them deterministically to real physical inventory without ever hallucinating catalog data.

```
       +--------------------------------------------------------------+
       |                         EVALIPIE.IN                          |
       |                "Every Shop. One Intelligent Marketplace."    |
       +--------------------------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
+-------------------------------+                         +-------------------------------+
|     CUSTOMER MARKETPLACE      |                         |      MERCHANT ECOSYSTEM       |
|  - Door Hero Brand Metaphor   |                         |  - Independent Shopkeepers    |
|  - Evalipie AI Discovery      |                         |  - Multi-Branch Retail Chains |
|  - Typo-Tolerant OpenSearch   |                         |  - Branded Digital Storefronts|
|  - Same-Product Price Compare |                         |  - Real-Time Branch Inventory |
|  - City-Aware Availability    |                         |  - Order Fulfillment & Alerts |
+-------------------------------+                         +-------------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |             DISTRIBUTED TRANSACTION & EVENT CORE             |
       |  - Aiven PostgreSQL: ACID Source of Truth & Concurrency Guard|
       |  - Aiven Apache Kafka: Event-Driven Order/Inventory Streaming|
       |  - Aiven OpenSearch: Sub-millisecond Typo-Tolerant Discovery |
       +--------------------------------------------------------------+
```

---

## 2. Problem Statement & Market Friction

The modern retail ecosystem suffers from four core structural problems:

### A. The "Nameless Need" Discovery Gap
Traditional e-commerce search relies strictly on lexical matching (exact keywords, brand names, or technical model numbers). In real life, consumers often know **what problem they have**, not **the technical name of the product**. A user searching *"device to stop laptop from overheating on bed"* may fail to match an *"Aluminum Ergonomic Riser with Dual Axial Fans"*. Existing chatbots hallucinate fictional products, prices, or dead links. Evalipie AI bridges natural human language to structured catalog filters with zero hallucination.

### B. The Physical Merchant Identity Dilemma
When an independent merchant sells on conventional aggregator marketplaces, their shop identity is buried in fine print. They cannot build brand equity or drive repeat local patronage. Evalipie provides dedicated digital storefronts (`/shop/<slug>`) complete with custom branding, local pickup signals, and transparent store profiles, preserving local merchant pride.

### C. The Multi-Branch Inventory Disconnect
Regional retail chains operating across physical store branches (e.g., Koramangala, Indiranagar, and Jayanagar in Bengaluru) struggle with fragmented stock management. Often, an online order is accepted for an item physically located 20 kilometers away, or worse, out of stock entirely. Evalipie models a unified organization with physical branch-specific inventory, allowing localized routing and accurate city-wise availability.

### D. Concurrency Overselling & Dual-Write Inconsistencies
When physical stores and online marketplaces collide, inventory latency causes devastating overselling—two buyers simultaneously ordering the last physical unit. Evalipie guarantees inventory integrity at the database engine level using PostgreSQL row-level locks, outbox patterns, and Kafka event streaming to propagate stock changes across all search indexes within milliseconds.

---

## 3. Product Personas & Use Cases

### Persona 1: The Everyday Shopper ("The Problem Solver")
* **Identity:** Ananya, 24, Remote Software Consultant, Bengaluru.
* **Pain Point:** Frequently works in noisy coffee shops; needs clear microphone isolation for client standups but does not understand condenser polar patterns or USB gain stages. Budget is strictly ₹3,000.
* **Evalipie Journey:**
  1. Lands on `evalipie.in`, opens the hero door.
  2. Types into Evalipie AI: *"I need something for clear audio during online meetings under ₹3,000"*.
  3. Evalipie AI extracts intent: Category = `Electronics / Audio`, Tags = `["microphone", "headset", "call", "voice"]`, Max Price = `3000`.
  4. Returns grounded matches: A USB Condenser Microphone from *Patel Digital Store* (Jayanagar) at ₹2,799 and Bluetooth Headset from *Sharma Electronics* (Indiranagar) at ₹2,499.
  5. Selects Patel Digital Store, sees location-wise availability, and completes checkout with atomic stock reservation.

### Persona 2: The Independent Shopkeeper ("The Local Champion")
* **Identity:** Ramesh Sharma, 48, Owner of *Sharma Electronics*, Indiranagar, Bengaluru.
* **Pain Point:** Has run a physical shop for 22 years. Loses younger customers to quick-commerce and megastores. Cannot afford web developers or monthly SaaS fees.
* **Evalipie Journey:**
  1. Onboards via Evalipie Business in under 5 minutes.
  2. Claims slug `evalipie.in/shop/sharma-electronics`, uploads shop photo and logo.
  3. Links common canonical products from the global master catalog (e.g., Sony WH-1000XM5, Boat Airdopes) and sets his local selling price and shelf stock.
  4. Receives real-time order alerts on his merchant console.
  5. Customer picks up in-store or receives local delivery; inventory automatically decrements across the entire marketplace.

### Persona 3: The Retail Chain Operations Director ("The Scale Operator")
* **Identity:** Priya Nair, 36, VP of Operations at *City Supermarket Retail Group*.
* **Pain Point:** Operates 3 physical stores across Bengaluru (Indiranagar, Jayanagar, Whitefield). Central inventory spreadsheets are always desynchronized, leading to canceled customer orders.
* **Evalipie Journey:**
  1. Registers single organization: *City Supermarket Pvt Ltd*.
  2. Creates 3 physical store branches with individual store managers.
  3. Manages a master product catalog once, while each store manager updates localized stock levels.
  4. Online customers in Jayanagar see stock strictly from the Jayanagar branch, while central leadership monitors combined sales analytics and branch performance side-by-side.

---

## 4. Fundamental Architectural Concepts

To guarantee clean domain modeling, Evalipie establishes strict boundaries between entities:

| Concept | Definition | Example |
| :--- | :--- | :--- |
| **Organization** | The parent business entity, legal merchant, or company. | *Sharma Retail Ltd* or *City Supermarket Corp* |
| **Physical Store** | A real-world physical branch/warehouse with coordinates and address. | *City Supermarket — Indiranagar Branch* |
| **Digital Shop** | The public-facing customer storefront with custom URL and branding. | `evalipie.in/shop/city-supermarket` |
| **Canonical Product** | Global master catalog item representing universal product identity. | *Boat Rockerz 450 Bluetooth Headphone (Black)* |
| **Merchant Listing** | A specific merchant's commercial offer for a canonical product. | *Sharma Electronics' listing at ₹1,499* |
| **Store Inventory** | Physical, real-time quantity of a listing at a specific physical store. | *4 units on shelf at Indiranagar Branch* |

```
[Organization]
      |
      +---> [Digital Shop] (Public Storefront: /shop/sharma-electronics)
      |
      +---> [Physical Stores] (Store A: Indiranagar, Store B: Jayanagar)
                  |
                  v (Holds)
            [Store Inventory] (Location-specific physical stock)
                  ^
                  | (References)
            [Merchant Listing] (Price: ₹1,499, Active: true)
                  |
                  v (Fulfills)
            [Canonical Product] (Global Master Catalog: EAN / Title / Brand)
```

---

## 5. Core Product Modules

1. **Marketplace Storefront (`/`)**:
   - Signature Door-Hero opening animation revealing the marketplace.
   - Natural language AI input with instant conversational chips.
   - Category exploration and city-filtered trending products.
   - "Shops Near You" geolocation discovery.
2. **Dedicated Merchant Storefronts (`/shop/:slug`)**:
   - Independent branding, shop address, operating hours, ratings, and active listings.
3. **Canonical Product & Seller Comparison Hub (`/product/:id`)**:
   - Canonical specifications, customer reviews, and comparative seller drawer showcasing offers, store distance, price, and stock levels.
4. **Merchant Management Console (`/merchant`)**:
   - Dual-mode dashboard supporting single-shop owners and multi-branch chain managers.
   - Fast listing creator linked to master catalog.
   - Real-time stock adjustor with low-stock warnings.
   - Order management and status updates (Pending -> Confirmed -> Ready for Pickup -> Fulfilled).
5. **Evalipie AI Engine (`/api/v1/ai/discover`)**:
   - LLM-powered intent parsing into structured OpenSearch search DSL filters.
   - PostgreSQL availability validation and ranking.
6. **Distributed Event & Outbox Pipeline**:
   - PostgreSQL transactional outbox table emitting to Aiven Kafka topics.
   - Dedicated consumer updating Aiven OpenSearch indices in real time.

---

## 6. MVP Scope vs. Future Vision

```
+-------------------------------------------------------------------------+
| MVP (Phase 1) - P0 Core Hackathon & Launch Scope                        |
| - Unified Organization/Store/Shop/Listing Data Architecture             |
| - Signature Door Hero + React Marketplace UI                            |
| - Dedicated Merchant Digital Storefronts (/shop/:slug)                  |
| - Canonical Product Page with Multi-Seller Offer Comparison             |
| - Evalipie AI Natural Language Intent Extraction (Zero Hallucination)   |
| - Aiven OpenSearch Typo-Tolerant Catalog Search                         |
| - Aiven PostgreSQL ACID Checkout with SELECT FOR UPDATE Concurrency     |
| - Aiven Kafka Event-Driven Outbox Pipeline (order.placed, stock.changed)|
| - Single-merchant-per-order Checkout Flow                              |
+-------------------------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
| Post-MVP Enhancements (Phase 2) - P1                                    |
| - Multi-branch inventory transfer and centralized chain performance     |
| - Unmet Search Demand Insights for merchants (what users couldn't find) |
| - SMS / WhatsApp order notifications for shopkeepers                    |
| - Platform Admin Event stream inspector & index resync portal           |
+-------------------------------------------------------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
| Long-Term Vision (Phase 3) - P2                                         |
| - Multimodal Image Search (Upload broken part photo -> Find local shop) |
| - Multi-seller unified checkout with split logistics routing            |
| - Automated merchant payout settlements and escrow protection           |
| - Hyperlocal 30-minute delivery partner API integrations                |
+-------------------------------------------------------------------------+
```
