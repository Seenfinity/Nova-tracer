# NOVA Tracer — Crowdedness Score Report

**Generated:** 2026-04-29
**Source:** Colosseum Copilot (`copilot.colosseum.com/api/v1`)
**Corpus:** 5,400+ Solana hackathon project submissions across Hyperdrive, Renaissance, Radar, Breakout, Cypherpunk

---

## Crowdedness Score: **2 / 10  —  Low**

Across 5,400+ Solana builder projects, **zero** matches NOVA Tracer's exact
positioning (B2C, post-hack forensic tracing for retail scam victims). Three
tangent projects exist — all in adjacent or different segments.

---

## Tangent projects (closest matches)

### Iknaio  — `iknaio` (Cypherpunk, Sep 2025)
> *"Discover Iknaio – the data analytics platform automating cryptoasset investigations to combat fraud, ransomware, and money laundering."*

- **Segment:** B2B — law enforcement, compliance officers, exchanges, investigators
- **Differentiation from NOVA Tracer:** Iknaio is enterprise tooling for professionals; NOVA Tracer is consumer-facing for individual scam victims who need a self-serve investigation in minutes.
- **Tags:** `crypto fraud`, `money laundering`, `ransomware`, `automated data analytics`, `blockchain forensics`

### KryptoAPI  — `kryptoapi` (Radar, Sep 2024)
> *"A fraud detection system for the Solana network holistically used to mitigate fraud related activities such as rug-pulling, wash-trading, pump-and-dump schemes, reentrancy attacks and other manipulative behaviours."*

- **Segment:** Preventive fraud detection (real-time signal scoring)
- **Differentiation:** Operates pre-incident (warning users); NOVA Tracer is post-incident forensics — *after* funds have already moved.

### Rug Raider  — `rug-raider` (Breakout, Apr 2025)
> *"AI powered Solana wallet and transaction safety tool to detect and prevent rug pulls, token scams, and malicious drainers."*

- **Segment:** Preventive — token scam / drainer detection before signing
- **Differentiation:** Same as KryptoAPI — pre-incident defense, not post-incident investigation.

---

## Other proximally-named projects (not real overlap)

| Slug | Project | Why it isn't competition |
|---|---|---|
| `wallet-tracker` | Wallet Tracker (Radar 2024) | Personal spending visualization, not forensic tracing. |
| `detectify` | DETECTIFY (Cypherpunk 2025) | Phishing-link detection in browser/wallet, pre-tx defense. |
| `pine-analytics` | Pine Analytics (Cypherpunk 2025) | General analytics platform; not forensic-specific. |
| `agent-cypher` | Agent Cypher | Anti-scam decoder, preventive. |

Top similarity score across ALL ~40 projects checked: **0.09**. Median: **0.04**.
This is consistent with a low-density space — semantic search doesn't find a
true peer.

---

## Archive evidence

Curated crypto research corpus searched (`/search/archives`):

- **Chainalysis Research**: *"Combatting Trafficking With Blockchain Analysis"*
- **Chainalysis Research**: *"Why You Can't Trace Funds Through Services Using Blockchain Analysis"* — directly addresses the CEX-exit problem NOVA Tracer surfaces.
- **Chainalysis Research**: *"Anatomy of an Address Poisoning Scam"*
- **Galaxy Research**: *"The Great Bitcoin Dusting: A 'Salomon Brothers' Client Tries to Claim Dormant Wallets"*
- **Galaxy Research**: *"A Near-Miss: How the NPM Breach Almost Wreaked Havoc for Crypto Users"*
- **Solana Repo Issue**: *"Report Hacker Wallet"* — community-level pain point flagged on the official Solana repo.

The presence of multi-firm research on the *problem* (tracing limits, scam
anatomy, CEX exits) plus zero direct B2C-tracing project matches in 5,400+
hackathon submissions implies an **unsaturated B2C niche within an
acknowledged problem space**.

---

## Differentiation summary

| Dimension | NOVA Tracer | Iknaio | KryptoAPI | Rug Raider |
|---|---|---|---|---|
| **Customer** | Individual victims | Law enforcement / exchanges | Compliance / on-chain monitoring | End users (preventive) |
| **Timing** | Post-incident | Post-incident | Pre/real-time | Pre-incident |
| **UX** | Self-serve web (paste & trace) | Enterprise dashboard | API platform | Wallet-side browser tool |
| **Output** | Visual flow graph + exit destinations | Investigation case files | Risk scores / alerts | Drain/rug warnings |
| **Surface** | Web app, free, no login | B2B sales | API integration | Wallet integration |

NOVA Tracer is the only project found in the corpus addressing the
*"I just got drained — where did my SOL go?"* moment with a free, instantly
usable tool.

---

## Methodology

- Pre-flight auth: `GET /status` → `{ authenticated: true }`
- Project search calls (`POST /search/projects`):
  - Q1: `"forensic fund tracing for scam victims, multi-hop wallet flow analysis"`
  - Q2: `"blockchain forensics transaction tracing investigations"` + `winnersOnly: true`
  - Q3: `"stolen funds recovery wallet investigation address labeling"` + `acceleratorOnly: true`
  - Q4: `"hack victim exchange exit detection on-chain investigation"`
  - Q7 (filtered): `"anti-scam wallet protection forensic Solana"` + `hackathonSlugs: ["cypherpunk"]`
- Project detail lookups (`GET /projects/by-slug/<slug>`) on the top 7 candidates.
- Archive searches (`POST /search/archives`):
  - "blockchain forensics transaction tracing chainalysis"
  - "stolen cryptocurrency recovery address attribution"

> Crowdedness assessment per Colosseum Copilot guidance: bounded by the
> available corpus. Absence of evidence is not evidence of absence — but
> a 5,400-project corpus with zero direct B2C matches is a strong signal.

---

*Built with [Claude Code](https://claude.com/claude-code) and the
[Agentic Engineering Grant](https://superteam.fun/earn/grants/agentic-engineering)
workflow.*
