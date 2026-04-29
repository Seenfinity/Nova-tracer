import { getEnhancedTransactions } from "@/lib/helius";
import { getLabel, isKnownCex } from "@/lib/labels";
import type {
  HeliusEnhancedTx,
  TraceEdge,
  TraceNode,
  TraceResult,
} from "@/lib/types";

const SOL_TOKEN = "SOL";
const LAMPORTS_PER_SOL = 1_000_000_000;
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isLikelyAddress(s: string): boolean {
  return BASE58_RE.test(s);
}

type NormalizedTransfer = {
  to: string;
  amount: number;
  token: string;
  signature: string;
  timestamp: number;
};

function extractOutgoing(
  source: string,
  txs: HeliusEnhancedTx[],
): NormalizedTransfer[] {
  const out: NormalizedTransfer[] = [];
  for (const tx of txs) {
    for (const nt of tx.nativeTransfers ?? []) {
      if (nt.fromUserAccount === source && nt.toUserAccount && nt.amount > 0) {
        out.push({
          to: nt.toUserAccount,
          amount: nt.amount / LAMPORTS_PER_SOL,
          token: SOL_TOKEN,
          signature: tx.signature,
          timestamp: tx.timestamp,
        });
      }
    }
    for (const tt of tx.tokenTransfers ?? []) {
      if (tt.fromUserAccount === source && tt.toUserAccount && tt.tokenAmount > 0) {
        out.push({
          to: tt.toUserAccount,
          amount: tt.tokenAmount,
          token: tt.mint,
          signature: tx.signature,
          timestamp: tx.timestamp,
        });
      }
    }
  }
  return out.sort((a, b) => b.amount - a.amount);
}

function makeNode(address: string, depth: number): TraceNode {
  return {
    id: address,
    address,
    label: getLabel(address),
    depth,
    totalIn: 0,
    totalOut: 0,
  };
}

export type TraceOptions = {
  maxHops: number;
  perNodeLimit: number;
  txLimit: number;
};

const DEFAULTS: TraceOptions = {
  maxHops: 2,
  perNodeLimit: 8,
  txLimit: 100,
};

export async function traceWallet(
  root: string,
  opts: Partial<TraceOptions> = {},
): Promise<TraceResult> {
  const cfg = { ...DEFAULTS, ...opts };
  const nodes = new Map<string, TraceNode>();
  const edges: TraceEdge[] = [];
  const visitedForExpansion = new Set<string>();

  nodes.set(root, makeNode(root, 0));
  const queue: Array<{ address: string; depth: number }> = [
    { address: root, depth: 0 },
  ];

  while (queue.length > 0) {
    const { address, depth } = queue.shift()!;
    if (depth >= cfg.maxHops) continue;
    if (visitedForExpansion.has(address)) continue;
    visitedForExpansion.add(address);

    let txs: HeliusEnhancedTx[];
    try {
      txs = await getEnhancedTransactions(address, { limit: cfg.txLimit });
    } catch (err) {
      if (depth === 0) throw err;
      console.error(`[trace] hop fetch failed for ${address}:`, err);
      continue;
    }

    const transfers = extractOutgoing(address, txs).slice(0, cfg.perNodeLimit);

    for (const t of transfers) {
      edges.push({
        source: address,
        target: t.to,
        amount: t.amount,
        signature: t.signature,
        timestamp: t.timestamp,
        token: t.token,
      });

      const src = nodes.get(address)!;
      src.totalOut += t.amount;

      const existing = nodes.get(t.to);
      if (existing) {
        existing.totalIn += t.amount;
      } else {
        const child = makeNode(t.to, depth + 1);
        child.totalIn = t.amount;
        nodes.set(t.to, child);
        if (depth + 1 < cfg.maxHops && !isKnownCex(t.to)) {
          queue.push({ address: t.to, depth: depth + 1 });
        }
      }
    }
  }

  return {
    rootAddress: root,
    nodes: Array.from(nodes.values()),
    edges,
    generatedAt: Date.now(),
    hopsExplored: cfg.maxHops,
  };
}
