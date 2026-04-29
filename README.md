# NOVA Tracer

> Forensic fund tracing for Solana scam victims — paste a stolen-from wallet, follow the money.

**Status:** WIP for Solana Frontier hackathon.

## What it does

A scam victim pastes a Solana wallet address. NOVA Tracer:

1. Traces multi-hop fund flow with Helius Enhanced Transactions.
2. Labels destinations — known CEX hot wallets, mixers, bridges.
3. Generates a narrative report via the Claude API explaining what happened
   and where the funds ended up.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix + Nova preset)
- **react-force-graph-2d** for the transaction graph
- **helius-sdk** for on-chain data
- **@anthropic-ai/sdk** for AI narration
- **lucide-react** icons, **sonner** toasts

## Quick start

```bash
# 1. Install
npm install

# 2. Configure secrets
cp .env.local.example .env.local
# fill in HELIUS_API_KEY and ANTHROPIC_API_KEY

# 3. Run
npm run dev
# open http://localhost:3030
```

## Project layout

```
src/
  app/
    (home)/page.tsx          # landing — wallet input
    trace/[wallet]/page.tsx  # results — graph + narrative
    api/
      trace/route.ts         # POST: BFS trace via Helius
      narrate/route.ts       # POST: Claude-narrated summary
  lib/
    helius.ts                # Helius client singleton
    labels.ts                # known-address dictionary
    types.ts                 # TraceNode / TraceEdge / TraceResult
  components/ui/             # shadcn primitives
docs/
  ARCHITECTURE.md
  ROADMAP.md
```

## Status

See [docs/ROADMAP.md](docs/ROADMAP.md). Currently end of Phase 0 (scaffold).
