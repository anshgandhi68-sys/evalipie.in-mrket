# EVALIPIE — UI/UX Design Review & Component Specification

> **Document Status:** Phase 0 — Design Review & Evolution Plan  
> **Source Prototype Reviewed:** `Evalipie — Door Hero + Marketplace.html`  
> **Target Framework:** React 18+ / Tailwind CSS / Lucide Icons / Framer Motion

---

## 1. Prototype Code Review & Gap Analysis

A forensic inspection of the prototype file (`Evalipie — Door Hero + Marketplace.html`) revealed the following strengths, friction points, and production requirements:

### Strengths (What to Retain & Celebrate)
1. **The Signature Door Metaphor:** The 3D CSS perspective door opening (`rotateY` on `.door.dl` and `.door.dr`) as the user scrolls into the marketplace is a memorable brand differentiator. It physically symbolizes "entering the digital neighborhood shop".
2. **Color Harmony & Brand Identity:** The curated palette—Deep Navy (`#111827`), Teal (`#167D73`), Mint (`#E9F7F3`), and AI Violet (`#7657E8`)—feels modern, trustworthy, and distinctly Indian without clichéd tropes.
3. **Typography & Hierarchy:** Excellent choice in `Plus Jakarta Sans`. Clean letter-spacing and strong typographic weights provide high legibility across mobile and desktop.
4. **Conversational Quick Chips:** Providing pre-populated natural language prompt chips (*"I need something for clear audio during online meetings under ₹3,000"*) reduces cognitive load for first-time visitors.

### Weaknesses & Production Gaps (What Must Be Improved)
1. **Excessive Scroll Trajectory (`480vh`):** A 4.8x viewport scroll height feels sluggish and fatiguing on trackpads and mobile glass. Users who want to browse quickly feel trapped in the door animation.
   * *Solution:* Compress scroll distance to `200vh`–`250vh`, provide a prominent "Skip to Marketplace ↓" shortcut button, and support auto-opening on explicit click.
2. **Direct DOM Mutation & Monolithic Scripting:** The prototype relies on vanilla JS string concatenation (`innerHTML += ...`), leading to layout thrashing and lack of component encapsulation.
   * *Solution:* Refactor into modular React components with declarative props and typed state.
3. **Absence of Canonical Multi-Seller View:** The prototype displays individual cards per shop without showing that *Sharma Electronics* and *Patel Digital* sell the exact same headphone.
   * *Solution:* Group listings by canonical product on the main feed, displaying a "Compare 2 Sellers from ₹2,499" drawer.
4. **Missing Dedicated Merchant Storefronts:** The prototype contains no route or template for `/shop/:slug`.
   * *Solution:* Build a dedicated merchant profile view showcasing store credentials, street address, operating hours, and seller-specific catalog.
5. **Accessibility & Reduced Motion:** The prototype does not fully respect `prefers-reduced-motion` in 3D transforms and lacks comprehensive ARIA landmark attributes for screen readers.
   * *Solution:* Provide an accessible fallback layout that presents the marketplace immediately when reduced motion is preferred.

---

## 2. Design System & Design Tokens

```css
/* Core Design Tokens */
:root {
  /* Brand Palettes */
  --color-brand-navy: #111827;
  --color-brand-teal: #167D73;
  --color-brand-deep-teal: #105B55;
  --color-brand-mint: #E9F7F3;
  --color-brand-bg: #F8FAFC;
  --color-brand-surface: #FFFFFF;
  --color-brand-border: #E2E8F0;
  
  /* AI Accent */
  --color-ai-violet: #7657E8;
  --color-ai-violet-light: #F0ECFD;

  /* Functional Status */
  --color-status-success: #16A34A;
  --color-status-warning: #E9A23B;
  --color-status-danger: #DC4444;

  /* Typography */
  --font-family-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### Typographic Scale
* **Display / Hero H1:** `clamp(32px, 5vw, 64px)` | Bold 800 | Line-height: 1.05 | Tracking: -0.035em
* **Section Heading H2:** `clamp(24px, 3.5vw, 36px)` | Bold 700 | Line-height: 1.15 | Tracking: -0.025em
* **Card Title H3:** `16px`–`18px` | SemiBold 600 | Line-height: 1.3
* **Body / Description:** `14px`–`15px` | Regular 400 & Medium 500 | Line-height: 1.5
* **Meta / Microcopy:** `12px`–`13px` | SemiBold 600 | Tracking: 0.05em (Caps)

---

## 3. Core React Reusable Component Hierarchy

```
src/
├── components/
│   ├── hero/
│   │   ├── DoorHero.tsx               // 3D Perspective scroll-driven container
│   │   ├── ShopFacade.tsx             // Branded awning, wall, windows, sign
│   │   ├── DoorPanels.tsx             // Dual swinging 3D doors (rotateY)
│   │   └── InsideMarketplacePreview.tsx// Inside reveal content before scroll completion
│   ├── ai/
│   │   ├── AiSearchBar.tsx            // Natural language input with voice/clear buttons
│   │   ├── QuerySuggestionChips.tsx   // Pre-built conversational prompts
│   │   ├── AiThinkingIndicator.tsx    // Shimmer/pulse state during LLM parsing
│   │   └── GroundedMatchCard.tsx      // Product match with explanation pill
│   ├── catalog/
│   │   ├── ProductGrid.tsx            // Responsive auto-fill grid
│   │   ├── CanonicalProductCard.tsx   // Card showing lowest price & seller count
│   │   ├── SellerComparisonDrawer.tsx // Slide-over drawer comparing all shop offers
│   │   ├── StockBadge.tsx             // "In Stock", "Low Stock", "Out of Stock"
│   │   └── CategoryNav.tsx            // Horizontal scrolling category pills
│   ├── merchant/
│   │   ├── StorefrontHeader.tsx       // Shop logo, banner, address, verified badge
│   │   ├── BranchSelector.tsx         // Dropdown to switch physical branches
│   │   ├── StockStepper.tsx           // Quick inline +/- quantity adjuster
│   │   └── OrderStatusBadge.tsx       // Pending, Confirmed, Fulfilled status pill
│   └── common/
│       ├── Header.tsx                 // Navigation, city picker, cart counter
│       ├── ToastNotification.tsx      // Transient success/error messages
│       └── EmptyState.tsx             // Unmet search & 0-result recovery screen
```

---

## 4. Key Screen Layouts & Wireframes

### Screen 1: The Canonical Product & Multi-Seller Drawer
When a customer clicks a product card on the marketplace, rather than going to a single seller's page, they see the **Canonical Comparison Drawer**:

```
+-----------------------------------------------------------------------+
|  Bluetooth Wireless Headphones                      [Close X]         |
|  Brand: SoundPro | Category: Electronics                              |
|  Universal Rating: 4.8/5 (124 reviews)                                |
+-----------------------------------------------------------------------+
|  AVAILABLE SELLERS IN BENGALURU (2 Stores Nearby):                   |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Shop Logo]  Sharma Electronics                  [BEST PRICE]   |  |
|  | Location: Indiranagar (1.4 km away)                             |  |
|  | Price: ₹2,499  (MRP: ₹3,299 - 24% off)                           |  |
|  | Stock: 8 in stock (Local Delivery Today)                        |  |
|  | [ View Shop Profile ]                     [ Select & Add to Cart ] |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Shop Logo]  Patel Digital Store                                |  |
|  | Location: Jayanagar (5.2 km away)                               |  |
|  | Price: ₹2,699  (MRP: ₹3,299 - 18% off)                           |  |
|  | Stock: Only 2 left (Order Soon)                                 |  |
|  | [ View Shop Profile ]                     [ Select & Add to Cart ] |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

### Screen 2: Dedicated Merchant Storefront (`/shop/sharma-electronics`)
A distinct, branded landing page giving the merchant complete digital sovereignty:

```
+-----------------------------------------------------------------------+
|  [ Banner Image: Inside Sharma Electronics Store, 100ft Rd Indiranagar] |
+-----------------------------------------------------------------------+
|  [Logo]  SHARMA ELECTRONICS                    [Verified Merchant ✓] |
|          "Serving Indiranagar with Trusted Electronics Since 2002"    |
|          100ft Road, Indiranagar, Bengaluru | Open: 10 AM - 9:30 PM    |
|          Phone: +91 98765 43210 | Store Rating: 4.9 ★ (88 reviews)    |
+-----------------------------------------------------------------------+
|  [Search Sharma's Stock...] [All Categories v]                        |
|                                                                       |
|  +------------------+  +------------------+  +------------------+     |
|  | Wireless Headset |  | Ergonomic Mouse  |  | USB-C Fast Cable |     |
|  | ₹2,499           |  | ₹999             |  | ₹499             |     |
|  | [In Stock]       |  | [In Stock]       |  | [Low Stock - 2]  |     |
|  | [Add to Cart]    |  | [Add to Cart]    |  | [Add to Cart]    |     |
|  +------------------+  +------------------+  +------------------+     |
+-----------------------------------------------------------------------+
```

---

## 5. Interaction & Animation Guidelines

1. **Door Opening Animation:**
   - On desktop, tied to smooth wheel/scroll interpolation with a damping ratio of 0.85.
   - On mobile, swipe gesture with an explicit "Open Doors" tactile button.
   - When doors reach 90 degrees rotation, the viewport smoothly translates into the search input.
2. **AI Search State Transitions:**
   - Idle: Clean input with pulsing violet glow and quick chips.
   - Typing / Processing: Search button transitions to spinning spark icon; chips dim to 50% opacity.
   - Success: Cards animate in via staggered fade-and-slide up (`duration: 250ms`, `stagger: 50ms`).
3. **Stock Exhaustion Feedback:**
   - If stock reservation fails due to concurrency collision (HTTP 409), the target card shakes horizontally (CSS `@keyframes shake`), badge turns red (*"Sold out just now"*), and the comparative drawer automatically surfaces alternative sellers.
