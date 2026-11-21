# EVALIPIE — Complete REST API Specification

> **Base URL:** `https://evalipie.in/api/v1` (Local dev: `http://localhost:5000/api/v1`)  
> **Document Status:** Phase 0 — Design Specification  
> **Protocol Standards:** RESTful JSON, RFC 7807 Problem Details for HTTP APIs, JWT Bearer Auth.

---

## 1. Authentication & Identity APIs

### `POST /auth/register`
* **Description:** Register a new user account (Customer or Merchant).
* **Request:**
  ```json
  {
    "email": "sharma@electronics.in",
    "password": "StrongPassword123!",
    "fullName": "Ramesh Sharma",
    "phoneNumber": "+919876543210",
    "accountType": "MERCHANT", // or "CUSTOMER"
    "businessName": "Sharma Electronics",
    "businessType": "INDEPENDENT_SHOP" // or "RETAIL_CHAIN"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "u-456",
        "email": "sharma@electronics.in",
        "fullName": "Ramesh Sharma",
        "role": "MERCHANT_OWNER",
        "organizationId": "org-789"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### `POST /auth/login`
* **Request:** `{"email": "sharma@electronics.in", "password": "StrongPassword123!"}`
* **Response (200 OK):** Returns user profile, active permissions, and signed JWT token.

---

## 2. Public Marketplace & Catalog APIs

### `GET /products`
* **Description:** Paginated catalog of canonical products with facet filtering.
* **Query Params:** `category`, `brand`, `city`, `minPrice`, `maxPrice`, `page`, `limit`
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "page": 1,
    "totalPages": 5,
    "totalCount": 48,
    "data": [
      {
        "id": "prod-101",
        "title": "Bluetooth Wireless Headphones",
        "brand": "SoundPro",
        "category": "Electronics",
        "imageUrl": "https://evalipie.in/assets/headphones.png",
        "minPrice": 2499.00,
        "sellerCount": 3,
        "inStockInCity": true
      }
    ]
  }
  ```

### `GET /products/:id/sellers`
* **Description:** **Signature Feature:** Compare all merchant offers for a single canonical product.
* **Query Params:** `city=Bengaluru`
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "canonicalProduct": {
      "id": "prod-101",
      "title": "Bluetooth Wireless Headphones",
      "brand": "SoundPro"
    },
    "offers": [
      {
        "listingId": "list-001",
        "merchant": {
          "organizationId": "org-sharma",
          "shopName": "Sharma Electronics",
          "shopSlug": "sharma-electronics",
          "rating": 4.9
        },
        "store": {
          "storeId": "store-indiranagar",
          "name": "Indiranagar Branch",
          "city": "Bengaluru",
          "distanceKm": 1.4
        },
        "sellingPrice": 2499.00,
        "originalMrp": 3299.00,
        "stockStatus": "IN_STOCK",
        "availableQuantity": 8
      },
      {
        "listingId": "list-002",
        "merchant": {
          "organizationId": "org-patel",
          "shopName": "Patel Digital Store",
          "shopSlug": "patel-digital",
          "rating": 4.7
        },
        "store": {
          "storeId": "store-jayanagar",
          "name": "Jayanagar Branch",
          "city": "Bengaluru",
          "distanceKm": 5.2
        },
        "sellingPrice": 2699.00,
        "originalMrp": 3299.00,
        "stockStatus": "LOW_STOCK",
        "availableQuantity": 2
      }
    ]
  }
  ```

---

## 3. Evalipie AI & Search APIs

### `POST /ai/discover`
* **Description:** Natural-language intent search powered by LLM translation to OpenSearch DSL.
* **Request:**
  ```json
  {
    "prompt": "I need something for clear audio during online meetings under ₹3,000",
    "city": "Bengaluru"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "intentAnalysis": {
      "detectedCategory": "Electronics",
      "extractedTags": ["microphone", "audio", "meeting", "call", "voice", "headset"],
      "budgetConstraint": 3000.00,
      "userGoal": "Online meeting speech clarity"
    },
    "matches": [
      {
        "productId": "prod-102",
        "title": "USB Condenser Microphone",
        "brand": "HyperClear",
        "category": "Electronics",
        "bestOffer": {
          "listingId": "list-003",
          "shopName": "Patel Digital Store",
          "shopSlug": "patel-digital",
          "price": 2799.00,
          "stockStatus": "LOW_STOCK",
          "city": "Bengaluru"
        },
        "matchReason": "Directly isolates speaking voice; built-in noise filter fits meeting needs under ₹3,000."
      },
      {
        "productId": "prod-101",
        "title": "Bluetooth Wireless Headphones",
        "brand": "SoundPro",
        "category": "Electronics",
        "bestOffer": {
          "listingId": "list-001",
          "shopName": "Sharma Electronics",
          "shopSlug": "sharma-electronics",
          "price": 2499.00,
          "stockStatus": "IN_STOCK",
          "city": "Bengaluru"
        },
        "matchReason": "Includes noise-canceling dual boom microphones; priced under budget at ₹2,499."
      }
    ],
    "unmetDemandLogged": false
  }
  ```

### `GET /search`
* **Description:** Typo-tolerant catalog search powered directly by Aiven OpenSearch.
* **Query Params:** `q=blutooth hedphone&city=Bengaluru`
* **Response (200 OK):** Returns matching products with fuzzy score and city availability.

---

## 4. Public Merchant Storefront APIs

### `GET /shops/:slug`
* **Description:** Public profile, branding, and location details of an independent merchant or retail chain.
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "shop": {
      "slug": "sharma-electronics",
      "displayName": "Sharma Electronics",
      "tagline": "Indiranagar's Most Trusted Electronics Store Since 2002",
      "logoUrl": "https://evalipie.in/assets/shops/sharma-logo.png",
      "bannerUrl": "https://evalipie.in/assets/shops/sharma-banner.png",
      "rating": 4.9,
      "stores": [
        {
          "name": "Main Store",
          "address": "100ft Road, Indiranagar, Bengaluru",
          "phone": "+919876543210"
        }
      ]
    }
  }
  ```

### `GET /shops/:slug/listings`
* **Description:** All active commercial listings offered specifically by this merchant.

---

## 5. Concurrency-Safe Cart & Checkout APIs

### `POST /checkout/reserve`
* **Description:** **Critical Path:** Atomically reserves stock and creates order in a single PostgreSQL transaction.
* **Headers:** `Idempotency-Key: idemp-9876-uuid`, `Authorization: Bearer <token>`
* **Request:**
  ```json
  {
    "listingId": "list-001",
    "storeId": "store-indiranagar",
    "quantity": 1,
    "customer": {
      "fullName": "Ananya Sharma",
      "phone": "+919988776655",
      "deliveryAddress": "Flat 302, Palm Heights, Bengaluru"
    },
    "fulfillmentType": "LOCAL_DELIVERY"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "order": {
      "orderId": "ord-999",
      "orderNumber": "EVAL-202611-0001",
      "status": "CONFIRMED",
      "totalAmount": 2499.00,
      "reservedUntil": "2026-11-21T13:45:00Z"
    }
  }
  ```
* **Concurrency Failure Response (409 Conflict):**
  ```json
  {
    "type": "https://evalipie.in/errors/stock-exhausted",
    "title": "Inventory Exhausted",
    "status": 409,
    "detail": "The last remaining unit of this item was just claimed by another customer. Please choose another seller.",
    "alternativeSellers": [
      {
        "shopName": "Patel Digital Store",
        "price": 2699.00,
        "availableQuantity": 2
      }
    ]
  }
  ```

---

## 6. Merchant Console & Chain Management APIs

* `GET /merchant/dashboard` — Sales volume, pending orders count, low-stock warnings.
* `GET /merchant/listings` — List of all products listed by the authenticated organization.
* `POST /merchant/listings` — Create a new listing linked to a canonical product.
* `PUT /merchant/stores/:storeId/inventory` — Update stock levels for a specific branch (generates `inventory.changed` event).
* `GET /merchant/orders` — Incoming orders with status transition endpoints (`/orders/:id/confirm`, `/orders/:id/fulfill`).
* `GET /merchant/branches/compare` — Compare inventory and sales performance across physical branches (for retail chains).

---

## 7. Platform Admin & Operations APIs

* `GET /admin/health` — Aiven PG, Kafka, OpenSearch cluster health.
* `GET /admin/outbox/status` — Outbox queue depth, unprocessed events count.
* `POST /admin/opensearch/resync` — Manually trigger full catalog reindexing from PostgreSQL.
