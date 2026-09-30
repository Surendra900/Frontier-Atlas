# Browser Reproduction & Baseline Audit (Phase 1)

**Date**: 2026-09-30  
**Environment Under Audit**: `https://frontend-1y4s17f3m-httplocalhost5173planner.vercel.app`  
**Comparison Production URL**: `https://frontieratlas.co/models`  
**Methodology**: Headless Playwright (Chromium 1243) with full JavaScript execution, network request interception, browser console monitoring, DOM state inspection, and performance timers.

---

## 1. Executive Summary of Root Causes (Failures A through K)

| Failure | Description | Browser & Code Observation | Root Cause |
| :--- | :--- | :--- | :--- |
| **A. HUB** | "â€”" in stat counters and headings; empty Capability, Family, Org, Research sections; "0 Models" in Directory. | `deployed-hub-models.png` shows `â€” Capabilities â€” Model Families â€” Verified Models`. 0 cards in sections. | Missing `/api/v1/models/facets` route. Next.js router sent it to `[slug]/route.ts` where it returned `404 Not Found (Model not found)`. `facets` state stayed `null`. Unescaped dashes corrupted UTF-8 rendering. |
| **B. PAPERS** | Corrupted paper metadata on `/papers/gpt-4-technical-report---2303.08774` (wrong authors Ernest K. Ryu, nonsense TL;DR, wrong project URL Qiskit, wrong date June 2024). | Confirmed in DB `papers` table record `000aa1d5-6797-4ab4-a308-6146c6395668` and live page screenshot `paper-gpt4-corrupted.png`. | Paper records in Postgres were populated with unverified mock/hallucinated data during early scraping, never reconciled with authoritative arXiv metadata. |
| **C. FILTERS** | Filters on listing pages do not update properly or lead to inconsistent state. | URL params not fully wired to server-side facet counts and filter chips. | Mismatch between client filter chip parameter keys and backend SQL WHERE clauses. Lack of dynamic server facet counts. |
| **D. CLIENT-SIDE** | Hydration lag, 404/401 network errors. | 32 failed network requests on hub, 19-22 on listing, including repeated 404s for `/api/v1/models/facets` and 401s for worker `check-saved`. | Front-end components still querying legacy Cloudflare worker endpoints and non-existent Next.js routes. |
| **E. PRICES** | Sentinel price values like `$-1000000.0000` (OpenRouter `-1` router sentinel). | Database contains `-1` for router/variable pricing models like "TypeSafe: Jev Router". | Model ingestion and formatter did not convert negative sentinel values to `null` ("Varies" / "N/A"). |
| **F. CAPABILITIES**| Blanket tagging (`general_purpose`, `chat`, `reasoning`) and junk models (robotics, timm image classifiers, sentence-transformers in chat). | Confirmed: `timm (9)` and `sentence-transformers (8)` appear in `/models/chat` vendor filter list. | Ingestion pipeline applied default broad capability tags instead of deriving strictly from OpenRouter `supported_parameters`, models.dev flags, and HF `pipeline_tag`. |
| **G. OPENNESS** | Gemma 4, Qwen3, Nemotron marked Proprietary. | Models marked proprietary despite having open weights. | Defaulted to "Proprietary" if license was not explicitly parsed, rather than inspecting `open_weights` flag or HF repo. |
| **H. PAPER MAPPING** | Family-level links labeled "introduced" with 0.99 confidence (e.g. GPT-6 to GPT-4 report). | 64 mapped papers on Chat page, but confidence was 0.99 for all generations. | Ingestion lacked distinguishing between "introduced" (exact model paper) and "family" (prior generation lineage). |
| **I. COUNTS** | Header says "481 Models" while active filter shows 146. | On `/models/chat?capability=reasoning`, header displays total catalog count (481) instead of active filtered count (146). | Server component passed `total` of active query to client, but client header displayed unfiltered card total instead of filtered result count. |
| **J. SPEED** | Slow listing loads (TTFB > 2000ms), duplicate variant rows. | TTFB on listing was 2014ms - 2119ms. | Lack of database read pooler optimization, synchronous JSON aggregations without indexed foreign keys, and uncached server routes. |
| **K. URL** | Temporary Vercel hash domain instead of clean alias. | Current URL: `frontend-1y4s17f3m-httplocalhost5173planner.vercel.app`. | Vercel domain alias was not pointed to the production deployment. |

---

## 2. Browser Evidence & Screenshots

Captured during automated Playwright Chromium run:
- `docs/screenshots-before/deployed-hub-models.png`: Shows placeholder "â€”" in hero stats and empty Browse sections.
- `docs/screenshots-before/original-prod-hub-models.png`: Original production comparison (crashing with 500 on backend worker).
- `docs/screenshots-before/deployed-models-chat.png`: Shows Chat listing with 481 models and junk vendors (`timm`, `sentence-transformers`).
- `docs/screenshots-before/deployed-chat-reasoning.png`: Shows active filter with 146 models.
- `docs/screenshots-before/drawer-opened.png`: Shows model technical detail drawer on row click.
- `docs/screenshots-before/paper-gpt4-corrupted.png`: Shows corrupted GPT-4 paper metadata.

---

## 3. Baseline Performance Measurements (Live Deployed URL)

| Route / Endpoint | Cold TTFB | Cold Total | Warm TTFB | Warm Total | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/models` (Hub) | 461 ms | 561 ms | 148 ms | 229 ms | 200 OK |
| `/models/chat` (Listing) | 2,014 ms | 2,436 ms | 2,119 ms | 2,601 ms | 200 OK |
| `/models/chat?capability=reasoning` | 1,730 ms | 2,283 ms | 1,660 ms | 2,208 ms | 200 OK |
| `/api/v1/models?limit=50` | 2,383 ms | 2,491 ms | 256 ms | 257 ms | 200 OK |
| `/api/v1/models/card-meta?slug=chat` | 1,035 ms | 1,035 ms | 122 ms | 122 ms | 200 OK |
| `/api/v1/models/facets` | 613 ms | 614 ms | 1,145 ms | 1,145 ms | **404 Not Found** |

---

## 4. Database Shard & Source of Truth Audit

- **Authoritative Database**: Neon Postgres (Host: `ep-jolly-dust-ao1w94qg-pooler.c-2.ap-southeast-1.aws.neon.tech`, DB: `neondb`).
- **Models Table**: `public.models` (has `is_canonical`, `canonical_model_id`, `variants`, `capabilities`, `category`, `family`, `vendor`, `release_date`).
- **Papers Table**: `public.papers` and join table `public.paper_models`.
- **Target Resolution**: All APIs and Server Components will query this single Neon pooler source of truth with pooled connections, eliminating Prisma inconsistencies and dead worker fallbacks.
