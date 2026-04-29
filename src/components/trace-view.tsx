"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  ArrowUpFromLine,
  Loader2,
  Network,
  ShieldAlert,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recordTrace } from "@/lib/tracked-store";
import type { AddressLabel, TraceResult } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="text-primary h-6 w-6 animate-spin" />
    </div>
  ),
});

type GraphNode = {
  id: string;
  depth: number;
  label?: AddressLabel;
  totalIn: number;
  totalOut: number;
};

type GraphLink = {
  source: string;
  target: string;
  amount: number;
  token: string;
};

type Props = { wallet: string };

const COLOR = {
  root: "#fbbf24",
  cex: "#22d3ee",
  mixer: "#f43f5e",
  bridge: "#a855f7",
  scammer: "#ef4444",
  defi: "#10b981",
  unknown: "#14f195",
  edge: "rgba(20, 241, 149, 0.45)",
};

export function TraceView({ wallet }: Props) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; trace: TraceResult }
    | { status: "error"; message: string }
  >({ status: "loading" });
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 520 });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetch("/api/trace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, maxHops: 2 }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
        return json as TraceResult;
      })
      .then((trace) => {
        setState({ status: "ready", trace });
        const cexHits = trace.nodes.filter(
          (n) => n.label?.category === "cex" && n.depth > 0,
        ).length;
        recordTrace({
          address: trace.rootAddress,
          tracedAt: trace.generatedAt,
          nodeCount: trace.nodes.length,
          edgeCount: trace.edges.length,
          cexHits,
        });
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        const message = err instanceof Error ? err.message : "trace failed";
        setState({ status: "error", message });
        toast.error("Trace failed", { description: message });
      });
    return () => ctrl.abort();
  }, [wallet]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: Math.max(entry.contentRect.height, 360),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(() => {
    if (state.status !== "ready") return { nodes: [], links: [] };
    const nodes: GraphNode[] = state.trace.nodes.map((n) => ({
      id: n.id,
      depth: n.depth,
      label: n.label,
      totalIn: n.totalIn,
      totalOut: n.totalOut,
    }));
    const links: GraphLink[] = state.trace.edges.map((e) => ({
      source: e.source,
      target: e.target,
      amount: e.amount,
      token: e.token,
    }));
    return { nodes, links };
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="border-primary/30 bg-card/40 flex h-[520px] items-center justify-center rounded-lg border backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            Following the money on-chain…
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Trace failed</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{state.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const { trace } = state;
  const cexExits = trace.nodes.filter(
    (n) => n.label?.category === "cex" && n.depth > 0,
  );
  const labelled = trace.nodes.filter((n) => n.label && n.depth > 0);
  const rootNode = trace.nodes.find((n) => n.depth === 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryStat
          icon={<Network className="h-4 w-4" />}
          label="Nodes mapped"
          value={trace.nodes.length}
        />
        <SummaryStat
          icon={<Target className="h-4 w-4" />}
          label="Edges traced"
          value={trace.edges.length}
        />
        <SummaryStat
          icon={<ArrowUpFromLine className="h-4 w-4" />}
          label="Outflow (root)"
          value={rootNode ? fmt(rootNode.totalOut) : "—"}
        />
        <SummaryStat
          icon={<ShieldAlert className="h-4 w-4" />}
          label="CEX exits"
          value={cexExits.length}
          accent={cexExits.length > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-primary/20 bg-card/60 overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary/90 font-mono text-xs uppercase tracking-widest">
              ▸ Flow graph
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={containerRef} className="h-[560px] w-full">
              <ForceGraph2D
                graphData={graphData}
                width={size.width}
                height={size.height}
                backgroundColor="rgba(0,0,0,0)"
                nodeRelSize={5}
                nodeColor={(n) => nodeColor(n as unknown as GraphNode)}
                nodeLabel={(n) => {
                  const node = n as unknown as GraphNode;
                  return `${node.label?.name ?? truncate(node.id)}\nin: ${fmt(node.totalIn)} · out: ${fmt(node.totalOut)}`;
                }}
                linkColor={() => COLOR.edge}
                linkLabel={(l) => {
                  const link = l as unknown as GraphLink;
                  return `${fmt(link.amount)} ${shortToken(link.token)}`;
                }}
                linkDirectionalArrowLength={4}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowColor={() => COLOR.edge}
                linkWidth={(l) =>
                  Math.min(
                    0.6 + Math.log10((l as unknown as GraphLink).amount + 1),
                    4,
                  )
                }
                cooldownTicks={80}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                Trace stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Stat label="Hops explored" value={String(trace.hopsExplored)} />
              <Stat label="Total nodes" value={String(trace.nodes.length)} />
              <Stat label="Total edges" value={String(trace.edges.length)} />
              <Stat
                label="Labelled destinations"
                value={String(labelled.length)}
              />
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                Known destinations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {labelled.length === 0 ? (
                <p className="text-muted-foreground">
                  No known CEXs, mixers, or bridges in this trace.
                </p>
              ) : (
                labelled.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate font-medium">
                      {n.label?.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className={
                        n.label?.category === "cex"
                          ? "bg-accent/20 text-accent border-accent/40"
                          : ""
                      }
                    >
                      {n.label?.category}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {rootNode?.label ? (
            <Card className="border-primary/40 bg-primary/5 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary font-mono text-xs uppercase tracking-widest">
                  Root identity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{rootNode.label.name}</p>
                <p className="text-muted-foreground text-xs">
                  This wallet itself is labelled as{" "}
                  {rootNode.label.category}.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-card/60 rounded-lg border p-4 backdrop-blur-sm ${
        accent ? "border-destructive/50" : "border-border"
      }`}
    >
      <div className="text-muted-foreground flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
        <span className={accent ? "text-destructive" : "text-primary"}>
          {icon}
        </span>
        {label}
      </div>
      <p
        className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
          accent ? "text-destructive" : ""
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function nodeColor(n: GraphNode): string {
  if (n.depth === 0) return COLOR.root;
  switch (n.label?.category) {
    case "cex":
      return COLOR.cex;
    case "mixer":
      return COLOR.mixer;
    case "bridge":
      return COLOR.bridge;
    case "scammer":
      return COLOR.scammer;
    case "defi":
      return COLOR.defi;
    default:
      return COLOR.unknown;
  }
}

function truncate(s: string): string {
  if (s.length <= 12) return s;
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function fmt(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(4);
  if (n < 1000) return n.toFixed(2);
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function shortToken(t: string): string {
  if (t === "SOL") return "SOL";
  return truncate(t);
}

