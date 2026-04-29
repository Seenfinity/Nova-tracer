# NOVA Tracer — Architecture

## Overview

NOVA Tracer is a Solana-native forensic fund-tracing web app. A scam victim
pastes a wallet address, and the app traces multi-hop fund flow, labels
destinations (CEXs, mixers, bridges), and generates an AI narrative summary.

## High-level flow

```
[Browser]
   │ POST /api/trace { wallet }
   ▼
[Next.js API: /api/trace]
   │ Helius Enhanced Transactions API
   │ - getSignaturesForAddress
   │ - getEnhancedTransactions (parsed)
   │ BFS over outgoing transfers up to N hops
   ▼
[TraceResult { nodes, edges }]
   │
   ├──► [Graph view: react-force-graph-2d]
   │
   └──► POST /api/narrate { trace }
            │ Anthropic Claude API
            │ - prompt with labelled flow
            ▼
        [Narrative + key findings]
```

## Components

- **`src/app/(home)/page.tsx`** — landing with wallet input.
- **`src/app/trace/[wallet]/page.tsx`** — results page (graph + narrative).
- **`src/app/api/trace/route.ts`** — runs the BFS trace using Helius.
- **`src/app/api/narrate/route.ts`** — calls Claude to narrate the trace.
- **`src/lib/helius.ts`** — singleton Helius client.
- **`src/lib/labels.ts`** — known-address dictionary (CEXs, mixers, bridges).
- **`src/lib/types.ts`** — shared `TraceNode`, `TraceEdge`, `TraceResult`.

## Key decisions

- **Server-side tracing only.** Helius API key never leaves the server.
- **BFS, capped depth.** Default 2 hops to keep latency bounded; user can
  expand later.
- **Static label dictionary first.** Phase 2: integrate a labels API.
- **Streamed narration (planned).** Initial version: full response;
  later switch to streaming with the Anthropic SDK.

## Out of scope (for the MVP)

- Cross-chain tracing.
- Wallet clustering / heuristic ownership.
- Real-time alerts.
