# QA Loop Ledger & Test Iteration Log

This ledger documents every test iteration, failures encountered, root causes, fixes applied, and re-verification results across all phases.

---

## Iteration Ledger

| Iteration | Target Base URL | Total Tests | Passed | Failed | Status | Key Focus |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0 (Baseline)** | `https://frontend-1y4s17f3m-httplocalhost5173planner.vercel.app` | 75 | 5 | 70 | FAILED | Reproduce Failures A-K in headless Chromium. Documented in `docs/browser-repro-before.md`. |

---

## Detailed Failure Log (Iteration 0 - Baseline)

### Failure A: Hub Sections Empty & "â€”" Placeholders
- **Page**: `/models`
- **Action**: Load page and wait for settlement.
- **Expected**: Stat counters display real counts (e.g. 19 Capabilities, 261 Families, 484 Models). Browse by Capability / Family / Organization / Research Area display populated cards.
- **Actual**: Counters show `â€”`. Heading text has `â€”`. Browse sections have 0 cards. Directory shows `0 Models`.
- **Console / Network**: HTTP 404 on `/api/v1/models/facets`. Uncaught `Error: API error: 404 - Model not found`.
- **Root Cause**: Route `/api/v1/models/facets` missing; caught by `[slug]/route.ts`. Garbled UTF-8 character sequences in string templates.

### Failure B: Corrupted Paper Records
- **Page**: `/papers/gpt-4-technical-report---2303.08774`
- **Action**: Inspect paper metadata.
- **Expected**: Authors: OpenAI (or landmark report authors). Date: March 2023. Real abstract and official URLs.
- **Actual**: Authors: Ernest K. Ryu, Gregor Reiter, Diego García-Martín. Date: June 23, 2024. Nonsense TL;DR: "State-of-the-art research on How to Score Experts for One-Shot MoE Ex...". Project URL: github.com/Qiskit/qiskit.
- **Root Cause**: Corrupted/mock data in `papers` and `paper_authors` Postgres tables.

### Failure C & D: Listing Filters & Client Hydration Errors
- **Page**: `/models/chat`, `/models/coding`, `/models/[slug]`
- **Action**: Select filters, search, view toggling.
- **Actual**: Header counts mismatch active filters (481 vs 146). Junk models (timm, sentence-transformers) pollute Chat/Reasoning cards.
- **Root Cause**: Blanket model capability tagging and missing dynamic server facet computation.

### Failure E: Sentinel Negative Prices
- **Model**: "TypeSafe: Jev Router"
- **Actual**: Shows `$-1000000.0000`.
- **Root Cause**: Negative OpenRouter router/variable sentinels not normalized to null/"Varies".

### Failure G & H: Openness & Paper Mapping Roles
- **Models**: Gemma 4, Qwen3, Nemotron marked Proprietary.
- **Papers**: GPT-6/Claude 5 linked to older generation papers with role "introduced" and confidence 0.99.
- **Root Cause**: Lack of multi-tier openness inference and lack of "introduced" vs "family" role distinction.
