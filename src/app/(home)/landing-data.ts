// Fake-but-plausible data ported from the v2 design handoff.
// All Solana-only (EVM was stripped).

export type WalletProfile = {
  addr: string;
  label: string;
  tags: string[];
  risk: "low" | "med" | "high";
  balance: string;
  value: string;
  txCount: string;
  first: string;
  last: string;
  recent: Array<[string, string, "in" | "out", string]>;
};

export const WALLET_DATA: {
  target: WalletProfile;
  nodes: Record<string, WalletProfile>;
} = {
  target: {
    addr: "7xKXtg2CWgQnPfSZUtvfjN8M4DN3E9mPdq1vW",
    label: "TARGET",
    tags: ["SUSPECT", "DRAINER_EXIT"],
    risk: "high",
    balance: "18,422.08 SOL",
    value: "$2.73M",
    txCount: "14,091",
    first: "2024-11-02",
    last: "34s ago",
    recent: [
      ["34s", "-1,200 SOL", "out", "→ mixer"],
      ["3m", "+2,400 SOL", "in", "← 4tn2…9qa"],
      ["8m", "-800 SOL", "out", "→ Wormhole"],
      ["14m", "+1,100 SOL", "in", "← Seaport-X"],
    ],
  },
  nodes: {
    n_cex: {
      addr: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      label: "Binance Hot 9",
      tags: ["CEX"],
      risk: "low",
      balance: "412,902 SOL",
      value: "$61.1M",
      txCount: "2.1M",
      first: "2021-09-14",
      last: "12m ago",
      recent: [
        ["12m", "+8,402 SOL", "in", "← target trail"],
        ["34m", "-12,001 SOL", "out", "→ cold"],
        ["1h", "+402 SOL", "in", "← Jupiter"],
      ],
    },
    n_mixer: {
      addr: "4tn29u8TuDQpmd91Xk5gYHJRbNDZQCb6bVZ9qaKrXyP3",
      label: "Mixer Pool",
      tags: ["MIXER", "FLAGGED"],
      risk: "med",
      balance: "~unknown",
      value: "~",
      txCount: "38,210",
      first: "2023-04-01",
      last: "2m ago",
      recent: [
        ["2m", "±620 SOL", "out", "→ 8kLm…v1A"],
        ["11m", "+2,900 SOL", "in", "← target"],
        ["22m", "-2,900 SOL", "out", "→ split×3"],
      ],
    },
    n_drainer: {
      addr: "8kLmV7xCZ4rFNpYdQwHtLjUoGpz2mJvNsAeBrW9xv1AH",
      label: "Seaport-X Drainer",
      tags: ["DRAINER", "SANCTIONED"],
      risk: "high",
      balance: "6,100 SOL",
      value: "$904K",
      txCount: "1,204",
      first: "2026-01-12",
      last: "22m ago",
      recent: [
        ["22m", "-6,100 SOL", "out", "→ bridge"],
        ["31m", "+6,100 SOL", "in", "← victim"],
        ["1h", "+400 SOL", "in", "← victim"],
      ],
    },
    n_bridge: {
      addr: "wormDTUJ6AWPNvk59vGQbDvGJMqatDAKTyhYxfDvxK3f",
      label: "Wormhole Router",
      tags: ["BRIDGE"],
      risk: "low",
      balance: "—",
      value: "—",
      txCount: "9.2M",
      first: "2022-08-01",
      last: "4s ago",
      recent: [
        ["4s", "-1,800 SOL", "out", "→ ETH msg"],
        ["18s", "+1,800 SOL", "in", "← drainer"],
        ["48s", "-620 SOL", "out", "→ BASE msg"],
      ],
    },
    n_dex: {
      addr: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
      label: "Jupiter v6",
      tags: ["DEX"],
      risk: "low",
      balance: "—",
      value: "—",
      txCount: "14.8M",
      first: "2023-01-01",
      last: "<1s ago",
      recent: [
        ["<1s", "SWAP", "out", "SOL→USDC"],
        ["<1s", "SWAP", "out", "BONK→SOL"],
        ["1s", "SWAP", "out", "USDC→JTO"],
      ],
    },
    n_lp: {
      addr: "r8Ykp2JEsZvTX1C5U8XnJzCpz9mv8sQhJ2s6rMnV3xY4",
      label: "Raydium CLMM",
      tags: ["LP", "POOL"],
      risk: "low",
      balance: "8,210 SOL",
      value: "$1.22M",
      txCount: "220k",
      first: "2023-06-14",
      last: "8s ago",
      recent: [
        ["8s", "+220 SOL", "in", "deposit"],
        ["1m", "±40 SOL", "out", "fees"],
        ["2m", "-120 SOL", "out", "withdraw"],
      ],
    },
    n_dormant: {
      addr: "GhRdqKs2fV8Bpz9J4LnMNgXy3WcQRt7Hk5VuBsPz2x6L",
      label: "Dormant cluster",
      tags: ["SUSPECT"],
      risk: "med",
      balance: "3,204 SOL",
      value: "$475K",
      txCount: "42",
      first: "2022-03-19",
      last: "3m ago",
      recent: [
        ["3m", "+1,500 SOL", "in", "← mixer"],
        ["14m", "+1,700 SOL", "in", "← mixer"],
        ["1mo", "-4 SOL", "out", "test tx"],
      ],
    },
    n_fresh: {
      addr: "FrEshW411etYz6kxDqEr5A6JqTgFt7RzXbHY8cVNpKqD",
      label: "Fresh wallet",
      tags: ["NEW", "SUSPECT"],
      risk: "med",
      balance: "620 SOL",
      value: "$92K",
      txCount: "4",
      first: "2026-04-18",
      last: "1m ago",
      recent: [
        ["1m", "+620 SOL", "in", "← drainer"],
        ["2d", "+0.1 SOL", "in", "funding"],
        ["2d", "-0.01 SOL", "out", "test"],
      ],
    },
  },
};

export type LayoutNode = {
  id: string;
  x: number;
  y: number;
  r: number;
  kind: "target" | "suspect" | "default" | "cex" | "bridge" | "flagged";
  label: string | null;
  ref: "target" | keyof typeof WALLET_DATA.nodes;
};

export const TRACER_LAYOUT: LayoutNode[] = [
  { id: "target", x: 300, y: 300, r: 11, kind: "target", label: "TARGET", ref: "target" },
  { id: "n1", x: 180, y: 195, r: 6, kind: "suspect", label: "DORMANT", ref: "n_dormant" },
  { id: "n2", x: 180, y: 410, r: 6, kind: "default", label: null, ref: "n_lp" },
  { id: "n3", x: 110, y: 300, r: 5, kind: "suspect", label: "MIXER", ref: "n_mixer" },
  { id: "n4", x: 90, y: 140, r: 4, kind: "default", label: null, ref: "n_fresh" },
  { id: "n5", x: 440, y: 180, r: 7, kind: "cex", label: "CEX", ref: "n_cex" },
  { id: "n6", x: 450, y: 330, r: 6, kind: "bridge", label: "BRIDGE", ref: "n_bridge" },
  { id: "n7", x: 440, y: 460, r: 7, kind: "flagged", label: "DRAINER", ref: "n_drainer" },
  { id: "n8", x: 520, y: 110, r: 4, kind: "default", label: null, ref: "n_dex" },
  { id: "n9", x: 540, y: 240, r: 4, kind: "default", label: null, ref: "n_fresh" },
  { id: "n10", x: 540, y: 400, r: 5, kind: "default", label: null, ref: "n_fresh" },
  { id: "n11", x: 310, y: 100, r: 4, kind: "default", label: null, ref: "n_dex" },
  { id: "n12", x: 300, y: 520, r: 5, kind: "default", label: null, ref: "n_lp" },
  { id: "n13", x: 50, y: 220, r: 3, kind: "default", label: null, ref: "n_fresh" },
  { id: "n14", x: 50, y: 400, r: 3, kind: "default", label: null, ref: "n_fresh" },
];

export const TRACER_EDGES: Array<[string, string]> = [
  ["target", "n1"], ["target", "n2"], ["target", "n3"], ["target", "n5"],
  ["target", "n6"], ["target", "n7"], ["target", "n11"], ["target", "n12"],
  ["n1", "n4"], ["n1", "n11"], ["n2", "n3"], ["n2", "n12"],
  ["n3", "n13"], ["n3", "n14"], ["n4", "n13"],
  ["n5", "n8"], ["n5", "n9"], ["n6", "n9"], ["n6", "n10"],
  ["n7", "n10"], ["n7", "n6"],
];

export const HOT_EDGE_KEYS = new Set([
  "target-n6", "n6-n7", "target-n7", "target-n5",
]);

export const HOT_PATHS: string[][] = [
  ["target", "n6", "n7"],
  ["target", "n3", "n14"],
  ["target", "n5", "n8"],
  ["target", "n7", "n10"],
];

export const TICKER_ITEMS: Array<[string, string, string, "up" | "dn"]> = [
  ["SOL/USD", "148.22", "+2.14%", "up"],
  ["SLOT", "284,491,207", "live", "up"],
  ["TPS", "4,112", "+318", "up"],
  ["WALLETS", "428.6M", "+12k", "up"],
  ["FLAGGED 24h", "217", "+18", "up"],
  ["BRIDGE OUT 24h", "$48.2M", "-4.1%", "dn"],
  ["MIXER VOL", "12,400 SOL", "+9.8%", "up"],
  ["DRAINER HITS", "7", "+3", "dn"],
  ["AVG DEPTH", "14 hops", "—", "up"],
  ["RECOVERED YTD", "$412M", "+$18M", "up"],
  ["JUP SWAPS/s", "712", "+41", "up"],
  ["CNFT MINTS", "1.9M", "+12%", "up"],
];

export const PROTO_LOGOS: Record<string, string> = {
  jupiter: `<svg viewBox="0 0 48 48"><defs><linearGradient id="jup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4f87d"/><stop offset="1" stop-color="#00c46a"/></linearGradient></defs><path d="M24 6 C14 6 6 14 6 24 s8 18 18 18 s18-8 18-18 c0-4-1-7-3-10" stroke="url(#jup)" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="38" cy="14" r="3.2" fill="url(#jup)"/></svg>`,
  raydium: `<svg viewBox="0 0 48 48"><path d="M8 32 L8 16 L24 6 L40 16 L40 32 L24 42 Z" fill="none" stroke="#c084fc" stroke-width="2.2"/><path d="M16 28 L16 20 L24 15 L32 20 L32 28 L24 33 Z" fill="none" stroke="#6effe0" stroke-width="2"/><circle cx="24" cy="24" r="2.5" fill="#6effe0"/></svg>`,
  orca: `<svg viewBox="0 0 48 48"><path d="M24 8 C14 8 8 16 8 26 c0 8 6 14 14 14 c5 0 10-2 12-6" fill="none" stroke="#00ff88" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="18" r="2" fill="#00ff88"/><path d="M18 30 c 3 -3 6 -3 9 0" stroke="#00ff88" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  phoenix: `<svg viewBox="0 0 48 48"><path d="M24 6 L30 18 L42 20 L33 29 L35 42 L24 35 L13 42 L15 29 L6 20 L18 18 Z" fill="none" stroke="#ffb547" stroke-width="2"/></svg>`,
  meteora: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="8" fill="none" stroke="#00ff88" stroke-width="2"/><path d="M8 40 L22 26 M16 8 L26 22 M40 14 L28 24 M38 38 L26 26" stroke="#00ff88" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  kamino: `<svg viewBox="0 0 48 48"><path d="M10 36 L24 10 L38 36 Z" fill="none" stroke="#6effe0" stroke-width="2.5"/><path d="M18 30 L24 20 L30 30 Z" fill="#6effe0"/></svg>`,
  drift: `<svg viewBox="0 0 48 48"><path d="M6 32 Q 18 18 30 28 T 42 24" fill="none" stroke="#b478ff" stroke-width="2.5" stroke-linecap="round"/><circle cx="42" cy="24" r="3" fill="#b478ff"/><circle cx="6" cy="32" r="3" fill="#b478ff"/></svg>`,
  marginfi: `<svg viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" fill="none" stroke="#00ff88" stroke-width="2"/><path d="M14 28 L20 20 L26 26 L34 16" stroke="#00ff88" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  solend: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="none" stroke="#ffb547" stroke-width="2"/><path d="M16 22 C18 14 30 14 32 22 M16 26 C18 34 30 34 32 26" stroke="#ffb547" stroke-width="2" fill="none"/></svg>`,
  jito: `<svg viewBox="0 0 48 48"><path d="M10 14 L38 14 M10 24 L30 24 M10 34 L22 34" stroke="#00ff88" stroke-width="3" stroke-linecap="square"/><path d="M38 14 L38 34 L30 34" stroke="#00ff88" stroke-width="3" fill="none" stroke-linecap="square"/></svg>`,
  msol: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="#6effe0" stroke-width="2"/><text x="24" y="30" text-anchor="middle" fill="#6effe0" font-family="monospace" font-weight="700" font-size="13">mSOL</text></svg>`,
  bsol: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="#00ff88" stroke-width="2"/><text x="24" y="30" text-anchor="middle" fill="#00ff88" font-family="monospace" font-weight="700" font-size="13">bSOL</text></svg>`,
  wormhole: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="none" stroke="#b478ff" stroke-width="2"/><circle cx="24" cy="24" r="10" fill="none" stroke="#b478ff" stroke-width="1.5"/><circle cx="24" cy="24" r="4" fill="#b478ff"/></svg>`,
  debridge: `<svg viewBox="0 0 48 48"><path d="M6 24 L18 24 M30 24 L42 24" stroke="#ffb547" stroke-width="3" stroke-linecap="round"/><rect x="18" y="18" width="12" height="12" fill="none" stroke="#ffb547" stroke-width="2" transform="rotate(45 24 24)"/></svg>`,
  mayan: `<svg viewBox="0 0 48 48"><path d="M8 38 L24 10 L40 38 Z" fill="none" stroke="#00ff88" stroke-width="2"/><path d="M14 38 L24 22 L34 38 Z" fill="none" stroke="#00ff88" stroke-width="1.5"/><circle cx="24" cy="32" r="2" fill="#00ff88"/></svg>`,
  allbridge: `<svg viewBox="0 0 48 48"><path d="M6 32 Q 24 10 42 32" fill="none" stroke="#6effe0" stroke-width="2.5"/><circle cx="6" cy="32" r="3" fill="#6effe0"/><circle cx="42" cy="32" r="3" fill="#6effe0"/><circle cx="24" cy="20" r="2" fill="#6effe0"/></svg>`,
  tensor: `<svg viewBox="0 0 48 48"><path d="M24 8 L40 24 L24 40 L8 24 Z" fill="none" stroke="#00ff88" stroke-width="2"/><path d="M24 16 L32 24 L24 32 L16 24 Z" fill="#00ff88"/></svg>`,
  magiceden: `<svg viewBox="0 0 48 48"><circle cx="16" cy="22" r="8" fill="none" stroke="#ff4b8a" stroke-width="2"/><circle cx="32" cy="22" r="8" fill="none" stroke="#ff4b8a" stroke-width="2"/><path d="M12 36 Q 24 44 36 36" stroke="#ff4b8a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
};

export const PROTOS: Array<[string, string]> = [
  ["jupiter", "Jupiter"], ["raydium", "Raydium"], ["orca", "Orca"],
  ["phoenix", "Phoenix"], ["meteora", "Meteora"], ["kamino", "Kamino"],
  ["drift", "Drift"], ["marginfi", "MarginFi"], ["solend", "Solend"],
  ["jito", "Jito"], ["msol", "Marinade"], ["bsol", "BlazeStake"],
  ["wormhole", "Wormhole"], ["debridge", "deBridge"], ["mayan", "Mayan"],
  ["allbridge", "Allbridge"], ["tensor", "Tensor"], ["magiceden", "Magic Eden"],
];

export const TRAIL_STEPS: Array<{ label: string; id: string }> = [
  { label: "ORIGIN", id: "target" },
  { label: "HOP 1", id: "n7" },
  { label: "HOP 2", id: "n6" },
  { label: "EXIT", id: "n5" },
];
