# NOVA Tracer — Agentic Engineering Grant · Texto para copy-paste

> Submit at: https://superteam.fun/earn/grants/agentic-engineering · 200 USDG fixed.

This document contains **only the long-form text fields** generated for you.
Everything else (TG, wallet, X, GitHub, Proof of Work, KPI, deadline,
Crowdedness Drive link, AI transcript attach) you fill directly into the
form yourself.

---

## Step 1 · Basics

**Project Title**

> NOVA Tracer

**One Line Description**

> Forensic fund tracing for Solana scam victims — paste a wallet, follow the multi-hop money flow, identify CEX/mixer exits.

---

## Step 2 · Details

**Project Details**

> NOVA Tracer is a Solana-native web app that helps scam victims investigate where their stolen funds went. A victim pastes their wallet address, and the app runs a bounded breadth-first walk over recent on-chain transactions using the Helius Enhanced Transactions API — surfacing native SOL and SPL token transfers across multiple hops, identifying known destinations (centralized-exchange hot wallets, mixers, bridges), and rendering the full flow as an interactive force-directed graph.
>
> Today, post-hack investigation on Solana is fragmented and inaccessible. Existing tools like Iknaio target enterprise compliance teams; KryptoAPI focuses on real-time fraud signals; Rug Raider is preventive (pre-signature defense). Nothing in the Colosseum corpus of 5,400+ projects addresses the specific moment a retail user asks: *"I just got drained — where did my SOL go?"*. Chainalysis itself has published research on the difficulty of tracing past CEX deposits — that is exactly the problem NOVA Tracer surfaces clearly to a non-technical user, free, with no login.
>
> The product is built end-to-end with Claude Code as part of the Agentic Engineering workflow: from scaffolding (Next.js 15 + Tailwind v4 + shadcn/ui) to the BFS engine, force-graph visualization, label dictionary, and Solana-themed UI. The grant funds extending the labelled-address dictionary (more CEXs, Solana-native bridges like Wormhole/Allbridge, mixers, known scammer clusters), shipping a public deployment, and submitting to the Solana Frontier hackathon.

---

## Step 3 · Milestones

**Goals and Milestones**

> **M1 — Public deployment + labelled dictionary expansion (~1 week)**
> - Deploy to Vercel with custom domain
> - Expand the labelled-address dictionary to ≥30 known CEX hot wallets, Solana bridges (Wormhole, Allbridge, Mayan), and at least 5 publicly reported scammer clusters
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

**Primary KPI suggestions** *(pick one or write your own)*

> - **Operational**: 100 unique wallets traced in the first 30 days post-launch.
> - **Outcome**: 10 verifiable cases where the NOVA Tracer report was used to contact an exchange / file a case.
> - **Recognition**: Top-3 placement in the Solana Frontier hackathon track.

---

## What you fill yourself directly in the form

These fields are personal / single-link inputs — no draft text needed:

- **TG username**
- **Wallet Address**
- **Personal X Profile**
- **Personal GitHub Profile**
- **Proof of Work**
- **Deadline** (Asia/Calcutta tz)
- **Colosseum Crowdedness Score**: paste the public Drive link to `crowdedness-score.png`
- **AI Session Transcript**: attach `claude-session.jsonl`
- **Primary KPI**: pick from suggestions above

---

*Generated for Seenfinity (Dangelxp2@gmail.com). Built with Claude Code.*
