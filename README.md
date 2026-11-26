<div align="center">

# GlassWeb
### Site-Agnostic AI Browser Co-Pilot & Dark-Pattern X-Ray

[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Primary%20AI-Gemini%20Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Groq Failover](https://img.shields.io/badge/Failover-Groq%20LPU-F55036?style=for-the-badge)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F97316?style=for-the-badge)](LICENSE)

**Team API IN REST** • **wHACKiest 2026** • **Track 2: Beyond the Browser**

</div>

---

## The Problem
Over **800M+ Indian internet users** waste 30–45 minutes bouncing across 8–15 open tabs to compare insurance policies, scholarship portals, SaaS plans, or rental agreements—and still get caught by buried fine print and the **13 deceptive dark patterns** banned under India's CCPA guidelines.

Existing tools fall short:
* **Shopping extensions** (BuyHatke, Honey) rely on hardcoded scrapers and go blind outside e-commerce.
* **AI sidebars** (ChatGPT, Copilot) are passive, single-tab chat windows that cannot highlight traps live on the page.
* **Enterprise RPA** (UiPath) depends on brittle selectors that break on every UI update.

## The Solution: GlassWeb
**GlassWeb** is a privacy-first Chrome Side Panel co-pilot that reasons over **any live DOM on the web** with zero site-specific scrapers:

1. **Cross-Tab Decision Matrix** — Synthesises hidden fees, eligibility rules, and true costs across multiple open tabs into one structured comparison table.
2. **Live Dark-Pattern & Fine-Print X-Ray** — Flags CCPA dark patterns (*Subscription Traps, Drip Pricing, False Urgency, Basket Sneaking, Hidden Clauses*) and highlights the exact clause directly on the webpage with one-click scroll-to-trap navigation.
3. **Human-in-the-Loop Action Agent** — Executes multi-step filtering and form filling from English/Hinglish prompts while pausing at a mandatory user approval gate before any submission.
4. **On-Device Privacy Shield** — Prunes **80–97% of raw HTML boilerplate** and redacts PII (emails, Indian mobile numbers, card patterns) locally inside the browser before calling the backend.

---

## Live Stage-1 Prototype Preview

![GlassWeb Live X-Ray Demo](docs/demo.jpg)

> *Live scan on Spotify Premium India: **97% DOM pruned locally**, structured promotional vs. regular pricing extracted via `gemini-flash-lite-latest`, and auto-renewal catch highlighted directly on the page.*

---

## System Architecture

```mermaid
flowchart TB
    subgraph MAIN["GlassWeb - End-to-End System Architecture"]
        direction TB

        A(["1. User Opens Any Live Webpage<br/>Pricing, Insurance, Rentals, or Terms in Chrome"])
        B["2. On-Device DOM Pruner and PII Shield<br/>Chrome MV3 (content.js) strips 97% clutter and redacts personal data locally"]
        C["3. Backend API and Schema Guard<br/>Python FastAPI + Pydantic v2 validates requests and enforces strict JSON output"]
        D["4. Primary AI Analysis Engine<br/>Google Gemini 3.5 Flash extracts key facts and flags CCPA dark patterns"]
        E["4b. Automatic Failover Layer<br/>Groq (GPT-OSS-120B) or Local Heuristic Engine ensures zero downtime"]
        F["5. GlassWeb Side Panel Interface<br/>Chrome Side Panel API (sidepanel.js) displays summary, real costs, and trap alerts"]
        G(["6. Live Webpage X-Ray Overlay<br/>content.js scrolls to the exact hidden clause and highlights it on screen"])

        A -->|"User clicks Scan and X-Ray Page"| B
        B -->|"Sends clean, PII-free text to /analyze"| C
        C -->|"Routes sanitised prompt to Primary AI"| D
        C -.->|"Triggers automatically if rate-limited or offline"| E
        D -->|"Returns validated structured JSON"| F
        E -.->|"Returns backup structured JSON"| F
        F -->|"User clicks any flagged alert card"| G
    end

    style MAIN fill:#F5EBE0,stroke:#5C3A21,stroke-width:2px,color:#2C1A12

    classDef darkBrown fill:#3E2723,stroke:#2C1A12,stroke-width:2px,color:#FFF8F0,font-weight:bold
    classDef warmBrown fill:#5C3A21,stroke:#3E2723,stroke-width:2px,color:#FFF8F0
    classDef softBrown fill:#8D6E63,stroke:#5C3A21,stroke-width:2px,color:#FFF8F0

    class A,G darkBrown
    class B,C,D,F warmBrown
    class E softBrown

    linkStyle default stroke:#2C1A12,stroke-width:2px
```