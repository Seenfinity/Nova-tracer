"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AddressLabel, TraceResult } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
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

export function TraceView({ wallet }: Props) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; trace: TraceResult }
    | { status: "error"; message: string }
  >({ status: "loading" });
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 480 });

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
      .then((trace) => setState({ status: "ready", trace }))
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
      <div className="flex h-[480px] items-center justify-center rounded-lg border">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Tracing fund flow on-chain…
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
  const labelled = trace.nodes.filter((n) => n.label);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Flow graph</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={containerRef} className="h-[520px] w-full">
            <ForceGraph2D
              graphData={graphData}
              width={size.width}
              height={size.height}
              nodeRelSize={5}
              nodeColor={(n) => nodeColor(n as unknown as GraphNode)}
              nodeLabel={(n) => {
                const node = n as unknown as GraphNode;
                return `${node.label?.name ?? truncate(node.id)}\nin: ${fmt(node.totalIn)} · out: ${fmt(node.totalOut)}`;
              }}
              linkLabel={(l) => {
                const link = l as unknown as GraphLink;
                return `${fmt(link.amount)} ${shortToken(link.token)}`;
              }}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              linkWidth={(l) =>
                Math.min(
                  0.5 + Math.log10((l as unknown as GraphLink).amount + 1),
                  4,
                )
              }
              cooldownTicks={80}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Stat label="Hops explored" value={String(trace.hopsExplored)} />
            <Stat label="Nodes" value={String(trace.nodes.length)} />
            <Stat label="Edges" value={String(trace.edges.length)} />
            <Stat
              label="Labelled destinations"
              value={String(labelled.length)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
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
                <div key={n.id} className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{n.label?.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {n.label?.category}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
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
  if (n.depth === 0) return "#f59e0b";
  if (n.label?.category === "cex") return "#3b82f6";
  if (n.label?.category === "mixer") return "#ef4444";
  if (n.label?.category === "bridge") return "#a855f7";
  return "#64748b";
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
