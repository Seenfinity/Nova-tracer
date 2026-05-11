import type { TraceEdge, TraceNode, TraceResult } from "@/lib/types";

export type ReportSummary = {
  reportId: string;
  generatedAt: string;
  rootAddress: string;
  rootLabel?: string;
  hopsExplored: number;
  nodeCount: number;
  edgeCount: number;
  labelledCount: number;
  cexExits: TraceNode[];
  bridgeExits: TraceNode[];
  mixerHits: TraceNode[];
  totalOutflow: number;
  topDestinations: Array<{
    address: string;
    label?: string;
    category?: string;
    totalIn: number;
    depth: number;
  }>;
  topEdges: TraceEdge[];
  fastExitFlag: boolean;
  narrative: string;
};

export function buildSummary(trace: TraceResult): ReportSummary {
  const root = trace.nodes.find((n) => n.depth === 0);
  const totalOutflow = root?.totalOut ?? 0;

  const cexExits = trace.nodes.filter(
    (n) => n.label?.category === "cex" && n.depth > 0,
  );
  const bridgeExits = trace.nodes.filter(
    (n) => n.label?.category === "bridge" && n.depth > 0,
  );
  const mixerHits = trace.nodes.filter(
    (n) => n.label?.category === "mixer" && n.depth > 0,
  );
  const labelled = trace.nodes.filter((n) => n.label).length;

  const cexOutflow = cexExits.reduce((acc, n) => acc + n.totalIn, 0);
  const fastExitFlag =
    totalOutflow > 0 &&
    cexOutflow / totalOutflow > 0.8 &&
    cexExits.every((n) => n.depth === 1);

  const topDestinations = trace.nodes
    .filter((n) => n.depth > 0)
    .sort((a, b) => b.totalIn - a.totalIn)
    .slice(0, 10)
    .map((n) => ({
      address: n.address,
      label: n.label?.name,
      category: n.label?.category,
      totalIn: n.totalIn,
      depth: n.depth,
    }));

  const topEdges = trace.edges
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 30);

  const narrativeParts: string[] = [];
  if (root?.label) {
    narrativeParts.push(
      `The queried wallet itself is labelled as a ${root.label.category} (${root.label.name}).`,
    );
  }
  narrativeParts.push(
    `${fmt(totalOutflow)} flowed outward across ${trace.edges.length} on-chain transfers, reaching ${trace.nodes.length - 1} downstream entities at up to depth ${trace.hopsExplored}.`,
  );
  if (cexExits.length) {
    const top3 = cexExits
      .slice(0, 3)
      .map((n) => n.label?.name)
      .filter(Boolean)
      .join(", ");
    narrativeParts.push(
      `${cexExits.length} known centralized-exchange hot wallet${cexExits.length > 1 ? "s were" : " was"} touched${top3 ? ` (${top3})` : ""}.`,
    );
  }
  if (bridgeExits.length) {
    narrativeParts.push(
      `${bridgeExits.length} cross-chain bridge exit${bridgeExits.length > 1 ? "s were" : " was"} observed.`,
    );
  }
  if (mixerHits.length) {
    narrativeParts.push(
      `${mixerHits.length} known mixer / privacy pool node${mixerHits.length > 1 ? "s were" : " was"} encountered along the path.`,
    );
  }
  if (fastExitFlag) {
    narrativeParts.push(
      `FAST_EXIT flag: more than 80% of the outflow reached known CEX hot wallets within a single hop — typical signature of a drainer cash-out.`,
    );
  }
  if (!cexExits.length && !bridgeExits.length) {
    narrativeParts.push(
      `No known CEX or bridge exits were detected within the explored depth. Funds remain on-chain in unlabelled wallets — further investigation at greater depth is recommended.`,
    );
  }
  const narrative = narrativeParts.join(" ");

  return {
    reportId: deterministicId(trace.rootAddress, trace.generatedAt),
    generatedAt: new Date(trace.generatedAt).toISOString(),
    rootAddress: trace.rootAddress,
    rootLabel: root?.label?.name,
    hopsExplored: trace.hopsExplored,
    nodeCount: trace.nodes.length,
    edgeCount: trace.edges.length,
    labelledCount: labelled,
    cexExits,
    bridgeExits,
    mixerHits,
    totalOutflow,
    topDestinations,
    topEdges,
    fastExitFlag,
    narrative,
  };
}

function fmt(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(4);
  if (n < 1000) return n.toFixed(2);
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function fmtAmount(n: number): string {
  return fmt(n);
}

function deterministicId(addr: string, ts: number): string {
  // Short deterministic id based on addr + ts (no crypto, OK for human-facing ID)
  const seed = addr + String(ts);
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `NT-${ts.toString(36).toUpperCase().slice(-4)}-${h.toString(36).toUpperCase().slice(0, 6)}`;
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
