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
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#F5EBE0', 'primaryTextColor': '#2C1A12', 'primaryBorderColor': '#7F5539', 'lineColor': '#B08968', 'edgeLabelBackground': '#F5EBE0'}}}%%
flowchart TB
    subgraph CLIENT["1. Chrome Extension — On-Device Privacy Layer"]
        direction LR
        A["Active Webpage<br/>Any Live DOM"]:::beige --> B["MV3 Content Script<br/>DOM Pruner · 80-97% Smaller"]:::mocha
        B --> C["Local PII Shield<br/>Redacts Phone, Email & Cards"]:::espresso
    end

    subgraph SERVER["2. FastAPI Backend — AI Orchestration & Guardrails"]
        direction LR
        D["FastAPI + Pydantic v2<br/>Strict JSON Schema Guard"]:::espresso
        D --> E["Primary AI<br/>Gemini 3.5 Flash"]:::mocha
        D -.->|"429 Failover"| F["Backup AI<br/>Groq GPT-OSS-120B"]:::caramel
        D -.->|"Offline Mode"| G["Local Heuristic<br/>Rule Engine"]:::beige
    end

    subgraph OUTPUT["3. Visual Truth Layer — User Output"]
        direction LR
        H["Chrome Side Panel<br/>Summary, Key Facts & X-Ray Cards"]:::mocha
        I["Live Webpage Overlay<br/>Click Alert to Scroll & Highlight"]:::espresso
        H -->|"One-Click Jump"| I
    end

    C -->|"Sanitised Text Only"| D
    E --> H
    F --> H
    G --> H

    classDef espresso fill:#3E2723,stroke:#D7B899,stroke-width:2px,color:#FAF3E0,font-weight:bold
    classDef mocha fill:#6F4E37,stroke:#E6CCB2,stroke-width:2px,color:#FFF8F0
    classDef caramel fill:#9C6644,stroke:#F5EBE0,stroke-width:2px,color:#FFF8F0
    classDef beige fill:#F5EBE0,stroke:#7F5539,stroke-width:2px,color:#2C1A12

    style CLIENT fill:#EDE0D4,stroke:#7F5539,stroke-width:2px,color:#3E2723
    style SERVER fill:#E6CCB2,stroke:#7F5539,stroke-width:2px,color:#3E2723
    style OUTPUT fill:#EDE0D4,stroke:#7F5539,stroke-width:2px,color:#3E2723
```