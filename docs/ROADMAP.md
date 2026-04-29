# NOVA Tracer — Roadmap

## Phase 0 — Scaffold (done)
- Next.js 15 + Tailwind + shadcn/ui
- Helius SDK + Anthropic SDK + react-force-graph-2d wired up
- Folder structure, env example, base routes

## Phase 1 — Tracing engine
- Helius BFS implementation in `/api/trace`
- Token transfer extraction (SOL + SPL)
- Depth + fan-out limits
- Address labels (static dictionary first pass)

## Phase 2 — Visualization
- react-force-graph-2d integration on `/trace/[wallet]`
- Node coloring by category (CEX / mixer / unknown)
- Edge thickness by amount
- Click-to-inspect side panel

## Phase 3 — AI narrative
- `/api/narrate` calls Claude with the labelled trace
- Streamed response into the UI
- Key findings extracted as bullets

## Phase 4 — Polish & ship
- Loading + error states (toasts via sonner)
- Address validation (base58, length)
- Empty / no-flow states
- Deploy to Vercel
- Submit to Solana Frontier hackathon
