# NOVA Tracer

> Forensic fund tracing for Solana scam victims — paste a stolen-from wallet, follow the money.

**Status:** WIP for the Solana Frontier hackathon 

## What it does

A scam victim pastes a Solana wallet address. NOVA Tracer:

1. Traces multi-hop fund flow with the **Helius Enhanced Transactions API** (BFS, bounded depth + per-node fanout).
2. Labels destinations — known **CEX hot wallets**, **mixers**, **bridges** (static dictionary first; expanding).
3. Renders an interactive **force-directed graph** of the flow (`react-force-graph-2d`).
4. Generates a narrative report via the **Claude API** explaining what happened and where the funds ended up. *(in progress)*

## Stack

- **Next.js 15** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix + Nova preset)
- **react-force-graph-2d** — transaction graph
- **helius-sdk** + REST (`/v0/addresses/{addr}/transactions`)
- **@anthropic-ai/sdk** — Claude narration
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
# open http://localhost:4040
```

Required env vars:
- `HELIUS_API_KEY` — get one at https://dev.helius.xyz/dashboard
- `ANTHROPIC_API_KEY` — get one at https://console.anthropic.com/

## Project layout

```
src/
  app/
    (home)/page.tsx          # landing — wallet input
    trace/[wallet]/page.tsx  # results — graph + (soon) narrative
    api/
      trace/route.ts         # POST: BFS trace via Helius
      narrate/route.ts       # POST: Claude-narrated summary
  lib/
    helius.ts                # Helius v0 REST helper
    trace.ts                 # BFS engine + base58 validator
    labels.ts                # known-address dictionary
    types.ts                 # TraceNode / TraceEdge / TraceResult
  components/
    trace-view.tsx           # client graph + stats
    ui/                      # shadcn primitives
docs/
  ARCHITECTURE.md
  ROADMAP.md
```

## How tracing works

`POST /api/trace { wallet, maxHops? }` runs a breadth-first walk over outgoing
transfers (native SOL + SPL tokens) extracted from each address's recent
parsed transactions. The walk is bounded by:

- `maxHops` — depth limit (default 2, clamped 1–3)
- `perNodeLimit` — top-N outgoing transfers per node, by amount (default 8)
- `txLimit` — recent txs per address fetched from Helius (default 100)

Nodes with a known **CEX** label are not expanded further (funds have left the
on-chain trail). The result is a graph of `TraceNode` + `TraceEdge` with totals,
labels, and signatures.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md). Currently end of **Phase 2** (visualization).

## Development

Built end-to-end with [Claude Code](https://claude.com/claude-code) as part of
the Agentic Engineering Grant workflow. The full session transcript is
preserved separately as proof of agentic development.

## License

MIT
