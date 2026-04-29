# NOVA Tracer — Agentic Engineering Grant Application

> **Submit at**: https://superteam.fun/earn/grants/agentic-engineering
> **Grant amount**: 200 USDG (fixed)

This document is structured exactly like the 3-step form. Fields marked
**[ FILL ]** are personal data you'll add directly. Everything else is
copy-paste ready.

---

## Step 1 · Basics

**Project Title**
> NOVA Tracer

**One Line Description**
> Forensic fund tracing for Solana scam victims — paste a wallet, follow the multi-hop money flow, identify CEX/mixer exits.

**TG username**
> [ FILL — e.g. t.me/seenfinity ]

**Wallet Address**
> [ FILL — your Solana address to receive 200 USDG ]

---

## Step 2 · Details

### Project Details

> NOVA Tracer is a Solana-native web app that helps scam victims investigate where their stolen funds went. A victim pastes their wallet address, and the app runs a bounded breadth-first walk over recent on-chain transactions using the Helius Enhanced Transactions API — surfacing native SOL and SPL token transfers across multiple hops, identifying known destinations (centralized-exchange hot wallets, mixers, bridges), and rendering the full flow as an interactive force-directed graph.
>
> Today, post-hack investigation on Solana is fragmented and inaccessible. Existing tools like Iknaio target enterprise compliance teams; KryptoAPI focuses on real-time fraud signals; Rug Raider is preventive (pre-signature defense). Nothing in the Colosseum corpus of 5,400+ projects addresses the specific moment a retail user asks: *"I just got drained — where did my SOL go?"*. Chainalysis itself has published research on the difficulty of tracing past CEX deposits — that's the exact problem NOVA Tracer surfaces clearly to a non-technical user, free, with no login.
>
> The product is built end-to-end with Claude Code as part of the Agentic Engineering workflow: from scaffolding (Next.js 15 + Tailwind v4 + shadcn/ui) to the BFS engine, force-graph visualization, label dictionary, and Solana-themed UI. The grant funds extending the labelled-address dictionary (more CEXs, Solana-native bridges like Wormhole/Allbridge, mixers, known scammer clusters), shipping a public deployment, and submitting to the Solana Frontier hackathon.

### Deadline

> [ FILL — target ship date in Asia/Calcutta tz, e.g. 30 May 2026 ]

### Proof of Work

> - **GitHub repo (public)**: https://github.com/Seenfinity/Nova-tracer
> - **Working MVP** with multi-hop trace + labelled CEX detection. Verified end-to-end against Binance Hot Wallet (`5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9`): 25 nodes, 64 edges, root identity auto-labelled.
> - **Architecture & roadmap** documented at [`docs/ARCHITECTURE.md`](https://github.com/Seenfinity/Nova-tracer/blob/main/docs/ARCHITECTURE.md) and [`docs/ROADMAP.md`](https://github.com/Seenfinity/Nova-tracer/blob/main/docs/ROADMAP.md).
> - **Crowdedness Score report** generated via Colosseum Copilot (5,400+ project corpus): score 2/10 — see [`docs/CROWDEDNESS_REPORT.md`](https://github.com/Seenfinity/Nova-tracer/blob/main/docs/CROWDEDNESS_REPORT.md) and the visual report at [`public/crowdedness-report.html`](https://github.com/Seenfinity/Nova-tracer/blob/main/public/crowdedness-report.html).
> - **6 commits** with conventional messages, all authored as Seenfinity, demonstrating phased agentic build (scaffold → BFS engine → UI revamp → docs → research).
> - **AI session transcript** (Claude Code) attached: `claude-session.jsonl` — full ~2.7 MB record of the build conversation.

### Personal X Profile

> [ FILL — e.g. x.com/seenfinity ]

### Personal GitHub Profile

> https://github.com/Seenfinity

### Colosseum Crowdedness Score

> [ FILL — paste the public Google Drive link to the screenshot of `crowdedness-score.png` ]
>
> Summary: **Crowdedness 2 / 10 (Low)**. Zero direct competitors found in 5,400+ Solana hackathon projects for B2C, post-hack, retail-victim forensic tracing. Three tangent projects (Iknaio, KryptoAPI, Rug Raider) differ in customer, timing, or UX.

### AI Session Transcript

> Attach the file `claude-session.jsonl` from this submission folder.

---

## Step 3 · Milestones

### Goals and Milestones

> **M1 — Public deployment + labelled dictionary expansion (~1 week)**
> - Deploy to Vercel with custom domain
> - Expand `src/lib/labels.ts` to ≥30 known CEX hot wallets, Solana bridges (Wormhole, Allbridge, Mayan), and at least 5 publicly reported scammer clusters
> - Edge-case handling: zero-flow wallets, address poisoning detection, validation feedback in UI
>
> **M2 — Trace UX polish + sharing (~1 week)**
> - Permalinks per trace (URL params for the trace inputs)
> - Export trace as JSON / shareable static page
> - Mobile-responsive graph rendering
> - Empty/no-flow and error states with actionable copy
>
> **M3 — Hackathon readiness (~1 week)**
> - Demo video (Remotion / screen-recorded walkthrough using a real laundering case)
> - Submission package: pitch summary, project description, demo wallet
> - Submit to Solana Frontier hackathon
> - First public round of social posts

### Primary KPI

> [ FILL — pick or refine one. Suggested options: ]
>
> - **Operational**: 100 unique wallets traced in the first 30 days post-launch.
> - **Outcome**: 10 verifiable cases where the NOVA Tracer report was used to contact an exchange / file a case.
> - **Recognition**: Top-3 placement in the Solana Frontier hackathon track.

### Final Tranche Checkbox — Reminder

> ✅ I understand that to receive the **final tranche**, I will need to submit:
> - The Colosseum project link (after submitting the project there)
> - The GitHub repo link (already public: https://github.com/Seenfinity/Nova-tracer)
> - The receipt for my AI subscription (Claude / Anthropic invoice)

---

## Files to upload to Google Drive (public link)

| File | What it is |
|---|---|
| `crowdedness-score.png` | Visual Crowdedness Score report (the screenshot the form asks for) |
| `claude-session.jsonl` | Full Claude Code session transcript — proof of agentic development |

Make the Drive folder (or each file individually) **public — anyone with link can view**, then paste that link into the *Colosseum Crowdedness Score* field of the form.

---

*Generated for Seenfinity (`Dangelxp2@gmail.com`). Built with Claude Code.*
