# EVALIPIE — Risks, Blockers & Mitigation Strategies

> **Document Status:** Phase 0 — Technical Risk Assessment & Operational Preparedness

---

## 1. Risk Severity Matrix

| Risk ID | Risk Description | Category | Severity | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **Aiven Service Credentials Missing / Delayed** | Infrastructure | **CRITICAL** | High | Provide a local/mock emulation layer (Local PostgreSQL with Docker, in-memory Kafka emulation/Redpanda, and local OpenSearch) so development proceeds without interruption until credentials are provided. |
| **RSK-02** | **External LLM Provider Downtime / Rate Limits** | AI Integration | **HIGH** | Medium | Implement the rule-based Heuristic Regex & N-gram Intent Parser fallback. If LLM call fails or takes > 1200ms, fallback engages automatically with zero user impact. |
| **RSK-03** | **Database Concurrency Deadlocks Under High Load** | Database | **HIGH** | Medium | Strict lock acquisition ordering: always lock `store_inventory` rows ordered by primary key (`ORDER BY id ASC`). Set statement timeout `SET lock_timeout = '2s'` to prevent stalled connections. |
| **RSK-04** | **Kafka Consumer Poison Pill / Deserialization Failure** | Event Streaming | **MEDIUM** | Low | Implement Dead Letter Queue (DLQ) pattern: messages that fail deserialization or processing after 3 retries are logged into `failed_events` table and offset is committed to prevent consumer stall. |
| **RSK-05** | **Door Hero Animation Frame Drops on Mobile** | UI/UX / Performance | **MEDIUM** | High | Use GPU-accelerated CSS transforms (`translate3d`, `rotateY`, `will-change: transform`). Detect low-power devices / touch screens and offer a one-tap "Enter Marketplace" bypass. |
| **RSK-06** | **Unverified External Hackathon Brief File** | Compliance | **LOW** | Low | Explicitly document missing external document; baseline all requirements strictly against the verified project mandate and Aiven technology constraints. |
| **RSK-07** | **Dual-Write Inconsistency Between DB and Search Index** | Architecture | **HIGH** | Low | Transactional Outbox pattern strictly guarantees events are written inside the PostgreSQL transaction. OpenSearch is updated asynchronously via Kafka. |

---

## 2. In-Depth Technical Mitigation Plans

### Mitigation RSK-01: Aiven Infrastructure Readiness & Offline Dev Mode
* **Problem:** In hackathon environments, team members may face delays in provisioning Aiven Cloud credits, generating CA SSL certificates, or accessing company cloud accounts.
* **Mitigation Protocol:**
  1. The backend application initializes with a unified `config/env.ts` configuration loader.
  2. If `AIVEN_PG_URL`, `AIVEN_KAFKA_BROKERS`, or `AIVEN_OPENSEARCH_URL` are not defined, the system detects `DEV_FALLBACK_MODE=true` and seamlessly switches to:
     - PostgreSQL: Local Postgres or SQLite adapter for basic queries.
     - Kafka: In-process EventEmitter event broker replicating the Kafka producer/consumer interface.
     - OpenSearch: PostgreSQL Full-Text Search (`tsvector` / `tsquery`) with `pg_trgm` fuzzy matching.
  3. When live Aiven credentials are provided in `.env.local`, the exact same service interfaces connect directly to production Aiven services with zero application code changes.

### Mitigation RSK-02: Zero-Hallucination Fallback Architecture
* **Problem:** OpenAI or Gemini API rate limits (HTTP 429) or transient network latency during a live judging presentation could freeze the search bar.
* **Mitigation Protocol:**
  1. LLM requests execute with an aggressive 1,200ms timeout.
  2. If timeout or error occurs, the `heuristicIntentParser` immediately extracts categories and budget using pre-compiled regular expressions and keyword maps.
  3. Results are returned to the user in `< 80ms` with an indicator: *"Grounded catalog match"*.
  4. At no point does the customer experience a blank screen or broken promise.

### Mitigation RSK-03: Concurrency & Lock Contention
* **Problem:** When 20 buyers compete for the final unit of stock, naive `SELECT ... FOR UPDATE` can result in connection starvation or deadlocks.
* **Mitigation Protocol:**
  1. Implement connection pooling using `pg` with `max: 20` and `idleTimeoutMillis: 10000`.
  2. The reservation query uses `NOWAIT` or `SKIP LOCKED` where suitable, or catches PostgreSQL error code `55P03` (`lock_not_available`) and immediately returns an HTTP 409 Conflict.
  3. The response body provides real-time alternative recommendations: *"This shop's stock just ran out. Buy from Patel Digital Store (2 km away) for ₹2,699"*.

---

## 3. Items Requiring Immediate User / Stakeholder Approval

Before launching Phase 1 implementation, the following decisions must be ratified:

1. **Aiven Service Credentials:** Confirm whether active Aiven project credentials (PostgreSQL URI, Kafka SSL certs + brokers, OpenSearch URI + basic auth) are already provisioned, or if we should start by generating them / using the local fallback engine.
2. **AI Provider Key:** Confirm preferred LLM provider for intent extraction (Google Gemini API vs. OpenAI GPT-4o-mini).
3. **Repository Workspace Structure:** Confirm preference for modular folder layout in the current workspace (`client/`, `server/`, `shared/`, `docs/`).
4. **Scope Freeze:** Confirm approval of P0 scope (Aiven PG + Kafka + OpenSearch + Concurrency-Safe Checkout + Multi-Merchant Storefronts + AI Intent Parser + Door Hero) for the initial build.
