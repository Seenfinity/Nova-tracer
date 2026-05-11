"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import "../../(home)/landing.css";
import { buildSummary } from "@/lib/report-summary";
import type {
  AddressLabel,
  TraceEdge,
  TraceNode,
  TraceResult,
} from "@/lib/types";

type Status =
  | { kind: "loading" }
  | { kind: "ready"; trace: TraceResult; latencyMs: number }
  | { kind: "error"; message: string };

type RenderNode = {
  id: string;
  address: string;
  label?: AddressLabel;
  depth: number;
  totalIn: number;
  totalOut: number;
  x: number;
  y: number;
  r: number;
  kind: "target" | "cex" | "bridge" | "flagged" | "suspect" | "default";
};

type Props = { wallet: string };

const CANVAS = { cx: 360, cy: 310, w: 720, h: 620 };

export function TraceConsole({ wallet }: Props) {
  const [state, setState] = useState<Status>({ kind: "loading" });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardPosRef = useRef<{ x: number; y: number } | null>(null);

  // mark body active so landing.css applies
  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  // fetch trace
  useEffect(() => {
    const ctrl = new AbortController();
    const t0 = performance.now();
    setState({ kind: "loading" });
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
        setState({
          kind: "ready",
          trace,
          latencyMs: Math.round(performance.now() - t0),
        });
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        const message = err instanceof Error ? err.message : "trace failed";
        setState({ kind: "error", message });
        toast.error("Trace failed", { description: message });
      });
    return () => ctrl.abort();
  }, [wallet]);

  const renderNodes: RenderNode[] = useMemo(() => {
    if (state.kind !== "ready") return [];
    return layoutRing(state.trace.nodes);
  }, [state]);

  const labelledNodes = useMemo(() => {
    if (state.kind !== "ready") return [];
    return state.trace.nodes
      .filter((n) => n.depth > 0 && n.label)
      .sort((a, b) => b.totalIn - a.totalIn);
  }, [state]);

  const hoveredNode =
    renderNodes.find((n) => n.id === (pinnedId ?? hoveredId)) ?? null;

  function onMouseMoveCanvas(e: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cardPosRef.current = {
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top + 12,
    };
    if (cardRef.current && hoveredNode) {
      cardRef.current.style.left = cardPosRef.current.x + "px";
      cardRef.current.style.top = cardPosRef.current.y + "px";
    }
  }

  return (
    <div className="landing-page">
      <TraceNav wallet={wallet} />

      <main style={{ padding: "32px 0 80px" }}>
        <div className="container">
          <SectionHead wallet={wallet} state={state} />

          <div className="console-shell" style={{ marginTop: 28 }}>
            <ConsoleTopbar state={state} />

            <div className="console-body" ref={containerRef}>
              <FiltersSidebar state={state} />

              <div
                className="cb-center"
                onMouseMove={onMouseMoveCanvas}
                onMouseLeave={() => {
                  if (!pinnedId) setHoveredId(null);
                }}
              >
                {state.kind === "loading" ? (
                  <LoadingOverlay />
                ) : state.kind === "error" ? (
                  <ErrorOverlay message={state.message} />
                ) : state.trace.edges.length === 0 ? (
                  <EmptyOverlay />
                ) : (
                  <TraceGraph
                    nodes={renderNodes}
                    edges={state.trace.edges}
                    hoveredId={pinnedId ?? hoveredId}
                    onHover={(id) => !pinnedId && setHoveredId(id)}
                    onClick={(id) => {
                      setPinnedId((p) => (p === id ? null : id));
                      setHoveredId(id);
                    }}
                  />
                )}

                {state.kind === "ready" && hoveredNode ? (
                  <WalletCard node={hoveredNode} pinned={pinnedId !== null} cardRef={cardRef} />
                ) : null}

                {state.kind === "ready" ? <Legend /> : null}
              </div>

              <EntitiesSidebar
                state={state}
                labelled={labelledNodes}
                onPick={(id) => {
                  setPinnedId(id);
                  setHoveredId(id);
                }}
              />
            </div>
          </div>

          {state.kind === "ready" ? (
            <>
              <FlagsBar trace={state.trace} />
              <ActionBar wallet={wallet} trace={state.trace} />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/* =====================================================================
   NAV
   ===================================================================== */
function TraceNav({ wallet }: { wallet: string }) {
  return (
    <nav className="top">
      <Link
        href="/"
        className="logo"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <span className="mark">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M2 6 L11 2 L20 6 L20 16 L11 20 L2 16 Z"
              stroke="#00ff88"
              strokeWidth="1.2"
            />
            <circle cx="11" cy="11" r="2.5" fill="#00ff88" />
          </svg>
        </span>
        NOVA<span className="slash">/</span>TRACER
      </Link>
      <div className="links">
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          ← New trace
        </Link>
        <a>Graph</a>
        <a>Intel</a>
        <a>API</a>
      </div>
      <div className="right">
        <span className="status-pill">
          <span className="pulse"></span>TRACING · {formatAddr(wallet)}
        </span>
      </div>
    </nav>
  );
}

/* =====================================================================
   SECTION HEAD + HUD
   ===================================================================== */
function SectionHead({ wallet, state }: { wallet: string; state: Status }) {
  const trace = state.kind === "ready" ? state.trace : null;
  const labelled = trace
    ? trace.nodes.filter((n) => n.label).length
    : 0;
  const confidence = trace
    ? Math.min(1, labelled / Math.max(trace.nodes.length, 1))
    : 0;
  const latency = state.kind === "ready" ? state.latencyMs : 0;

  return (
    <div className="section-head" style={{ marginBottom: 18 }}>
      <div className="l">
        <span className="eyebrow">▸ TRACING TARGET</span>
        <h2
          style={{
            fontSize: 36,
            margin: "12px 0 6px",
            fontFamily: "var(--mono)",
            letterSpacing: 0,
            wordBreak: "break-all",
            lineHeight: 1.1,
          }}
        >
          {wallet}
        </h2>
        <p style={{ marginTop: 4 }}>
          {state.kind === "loading"
            ? "Querying Helius enhanced transactions…"
            : state.kind === "error"
            ? `Trace failed: ${state.message}`
            : `Mapped ${trace!.nodes.length} entities across ${trace!.edges.length} flows. ${labelled} labelled.`}
        </p>
      </div>
      <div className="r" style={{ minWidth: 220 }}>
        <span className="idx">/ INVESTIGATION</span>
        <HudStat label="Depth" value={trace ? String(trace.hopsExplored) : "—"} />
        <HudStat label="Hops" value={trace ? String(trace.edges.length) : "—"} />
        <HudStat
          label="Confidence"
          value={trace ? confidence.toFixed(2) : "—"}
        />
        <HudStat
          label="Latency"
          value={state.kind === "ready" ? `${latency}ms` : "—"}
        />
      </div>
    </div>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-mute)",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--neon)" }}>{value}</span>
    </div>
  );
}

/* =====================================================================
   CONSOLE TOPBAR
   ===================================================================== */
function ConsoleTopbar({ state }: { state: Status }) {
  return (
    <div className="console-topbar">
      <span className="mono" style={{ color: "var(--neon)" }}>
        ◼ investigation.sol
      </span>
      <div className="tabs">
        <span className="t active">Graph</span>
        <span className="t">Entities</span>
        <span className="t">Timeline</span>
        <span className="t">Evidence</span>
      </div>
      <div className="right">
        <span className="dot"></span>
        <span>
          {state.kind === "loading"
            ? "TRACING…"
            : state.kind === "ready"
            ? `AUTO-TRACE · DEPTH ${state.trace.hopsExplored}`
            : "ERROR"}
        </span>
      </div>
    </div>
  );
}

/* =====================================================================
   FILTERS SIDEBAR (left)
   ===================================================================== */
function FiltersSidebar({ state }: { state: Status }) {
  const trace = state.kind === "ready" ? state.trace : null;

  // count tokens
  let nativeCount = 0;
  let splCount = 0;
  let bridgeCount = 0;
  let cexCount = 0;
  if (trace) {
    for (const e of trace.edges) {
      if (e.token === "SOL") nativeCount++;
      else splCount++;
    }
    bridgeCount = trace.nodes.filter((n) => n.label?.category === "bridge").length;
    cexCount = trace.nodes.filter((n) => n.label?.category === "cex").length;
  }

  const filterRows: Array<[string, number, boolean]> = [
    ["Native SOL", nativeCount, true],
    ["SPL tokens", splCount, true],
    ["CEX deposit", cexCount, true],
    ["Bridge out", bridgeCount, true],
  ];

  return (
    <div className="cb-left">
      <div className="filter-group">
        <div className="gt">
          <span>Filters</span>
          <b>{filterRows.filter(([, , c]) => c).length} active</b>
        </div>
        {filterRows.map(([label, count, checked]) => (
          <div className="filter-row" key={label}>
            <span>
              <input type="checkbox" defaultChecked={checked} />
              {label}
            </span>
            <span className="count">{count}</span>
          </div>
        ))}
      </div>

      <div className="filter-group">
        <div className="gt">
          <span>Tags</span>
          <b style={{ color: "var(--neon)" }}>auto</b>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {[
            ["CEX", "var(--neon)"],
            ["BRIDGE", "var(--purple)"],
            ["MIXER", "var(--amber)"],
            ["SCAMMER", "var(--red)"],
            ["DEFI", "var(--cyan)"],
          ].map(([label, color]) => (
            <span
              key={label}
              style={{
                padding: "3px 7px",
                border: "1px solid var(--line)",
                color,
                fontSize: 9.5,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="gt">
          <span>Methodology</span>
          <b>BFS</b>
        </div>
        <div style={{ fontSize: 10.5, lineHeight: 1.55, color: "var(--ink-dim)" }}>
          Bounded breadth-first walk over outgoing transfers via Helius
          Enhanced Transactions API. CEX-labelled nodes are not expanded
          further. Cap: top-8 transfers per node by amount, 100 txs per
          address.
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   GRAPH (ring-layout SVG)
   ===================================================================== */
function TraceGraph({
  nodes,
  edges,
  hoveredId,
  onHover,
  onClick,
}: {
  nodes: RenderNode[];
  edges: TraceEdge[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const neighbors = new Set<string>();
  if (hoveredId) {
    neighbors.add(hoveredId);
    for (const e of edges) {
      if (e.source === hoveredId) neighbors.add(e.target);
      if (e.target === hoveredId) neighbors.add(e.source);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* edges */}
      <g>
        {edges.map((e, i) => {
          const a = nodeMap.get(e.source);
          const b = nodeMap.get(e.target);
          if (!a || !b) return null;
          const dim =
            hoveredId !== null && !(e.source === hoveredId || e.target === hoveredId);
          const hot = b.kind === "cex" || b.kind === "flagged";
          return (
            <path
              key={i}
              d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - 14} ${b.x} ${b.y}`}
              className={`edge${hot ? " hot" : ""}${dim ? " dim" : ""}`}
            />
          );
        })}
      </g>
      {/* nodes */}
      <g>
        {nodes.map((n) => {
          const isHovered = hoveredId === n.id;
          const dim = hoveredId !== null && !neighbors.has(n.id);
          let cls = `node ${n.kind}`;
          if (n.kind === "target") cls += " live";
          if (isHovered) cls += " selected";
          if (dim) cls += " dim";
          return (
            <g
              key={n.id}
              className={cls}
              transform={`translate(${n.x},${n.y})`}
              onMouseEnter={() => onHover(n.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(n.id)}
              style={{ cursor: "pointer" }}
            >
              <circle className="halo" r={n.r + 2} />
              <circle className="core" r={n.r} />
              {n.label || n.kind === "target" ? (
                <text className="lbl" y={-n.r - 6}>
                  {n.kind === "target"
                    ? "TARGET"
                    : n.label?.name?.toUpperCase().slice(0, 16) ??
                      n.label?.category?.toUpperCase()}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* =====================================================================
   WALLET CARD (hover popover)
   ===================================================================== */
function WalletCard({
  node,
  pinned,
  cardRef,
}: {
  node: RenderNode;
  pinned: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const risk: "low" | "med" | "high" =
    node.kind === "flagged"
      ? "high"
      : node.kind === "suspect" || node.label?.category === "mixer"
      ? "med"
      : "low";

  const tags: string[] = [];
  if (node.kind === "target") tags.push("TARGET");
  if (node.label?.category) tags.push(node.label.category.toUpperCase());
  if (node.label?.confidence)
    tags.push(`CONF · ${node.label.confidence.toUpperCase()}`);

  return (
    <div
      ref={cardRef}
      className={`wallet-card${pinned ? " pinned" : ""}`}
      style={{ display: "block", left: 20, top: 20 }}
    >
      <div className="head">
        <span className="lbl">
          {node.kind === "target"
            ? "TARGET"
            : node.label?.name ?? `DEPTH ${node.depth}`}
        </span>
        <span className={`risk ${risk}`}>{risk.toUpperCase()} RISK</span>
      </div>
      <div className="addr">{node.address}</div>
      <div>
        {tags.map((t) => {
          let cls = "";
          if (/SCAMMER|FLAGGED/.test(t)) cls = "danger";
          else if (/MIXER|SUSPECT/.test(t)) cls = "flag";
          else if (/CEX|BRIDGE/.test(t)) cls = "hot";
          return (
            <span key={t} className={`tag ${cls}`}>
              {t}
            </span>
          );
        })}
      </div>
      <div className="stats">
        <div>
          <div className="k">Total in</div>
          <div className="v in">{fmtAmount(node.totalIn)}</div>
        </div>
        <div>
          <div className="k">Total out</div>
          <div className="v out">{fmtAmount(node.totalOut)}</div>
        </div>
        <div>
          <div className="k">Depth</div>
          <div className="v">{node.depth}</div>
        </div>
        <div>
          <div className="k">Category</div>
          <div className="v">
            {node.label?.category?.toUpperCase() ?? "UNKNOWN"}
          </div>
        </div>
      </div>
      {pinned ? (
        <div className="recent">
          <div className="t">Click anywhere to unpin</div>
        </div>
      ) : null}
    </div>
  );
}

/* =====================================================================
   ENTITIES SIDEBAR (right)
   ===================================================================== */
function EntitiesSidebar({
  state,
  labelled,
  onPick,
}: {
  state: Status;
  labelled: TraceNode[];
  onPick: (id: string) => void;
}) {
  const trace = state.kind === "ready" ? state.trace : null;
  const unlabelled = trace
    ? trace.nodes.filter((n) => n.depth > 0 && !n.label).length
    : 0;

  return (
    <div className="cb-right">
      <div className="filter-group">
        <div className="gt">
          <span>Entities · {trace?.nodes.length ?? 0}</span>
          <b style={{ color: "var(--neon)" }}>sorted ▾</b>
        </div>
        <div className="entity-list">
          {state.kind === "loading"
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  className="e"
                  key={i}
                  style={{ opacity: 0.3 - i * 0.05 }}
                >
                  <div>
                    <span className="tag">···</span>
                    <br />
                    <span className="nm">loading…</span>
                  </div>
                </div>
              ))
            : labelled.length === 0
            ? (
                <div style={{ color: "var(--ink-dim)", fontSize: 11 }}>
                  No labelled entities in this trace.
                  <br />
                  <span style={{ color: "var(--ink-mute)", fontSize: 10 }}>
                    {unlabelled} unlabelled nodes.
                  </span>
                </div>
              )
            : labelled.map((n) => {
                const cat = n.label?.category ?? "";
                const cls =
                  cat === "cex"
                    ? "ok"
                    : cat === "scammer"
                    ? "danger"
                    : cat === "mixer"
                    ? "flag"
                    : "";
                return (
                  <div
                    className="e"
                    key={n.id}
                    onClick={() => onPick(n.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <span className={`tag ${cls}`}>{cat.toUpperCase()}</span>
                      <br />
                      <span className="nm">{n.label?.name}</span>
                      <div className="sub">
                        {formatAddr(n.address)} · depth {n.depth}
                      </div>
                    </div>
                    <div className="v" style={{ textAlign: "right" }}>
                      {fmtAmount(n.totalIn)}
                      <br />
                      <span className="sub">in</span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      <div className="filter-group" style={{ marginTop: 20 }}>
        <div className="gt">
          <span>AI Analyst</span>
          <b style={{ color: "var(--ink-mute)" }}>stub</b>
        </div>
        <div
          style={{
            border: "1px dashed var(--line)",
            padding: 10,
            color: "var(--ink-dim)",
            fontSize: 10.5,
            lineHeight: 1.55,
          }}
        >
          {trace ? (
            <>
              <span style={{ color: "var(--neon)" }}>NOVA:</span>{" "}
              {generateNarrative(trace)}
            </>
          ) : (
            "Analysis will appear after the trace completes."
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   OVERLAYS
   ===================================================================== */
function LoadingOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          color: "var(--neon)",
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          animation: "nova-blink 1.3s steps(2) infinite",
        }}
      >
        ● TRACING ON-CHAIN
      </div>
      <div
        style={{
          fontFamily: "var(--mono)",
          color: "var(--ink-mute)",
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Querying Helius enhanced transactions · multi-hop BFS
      </div>
    </div>
  );
}

function ErrorOverlay({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        padding: 40,
      }}
    >
      <div
        style={{
          border: "1px solid var(--red)",
          background: "rgba(255,75,104,0.05)",
          padding: 24,
          maxWidth: 480,
          fontFamily: "var(--mono)",
        }}
      >
        <div
          style={{
            color: "var(--red)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          ▲ TRACE FAILED
        </div>
        <div style={{ color: "var(--ink)", fontSize: 13, lineHeight: 1.5 }}>
          {message}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn ghost"
          style={{ marginTop: 16 }}
        >
          ↻ Retry
        </button>
      </div>
    </div>
  );
}

function EmptyOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          color: "var(--ink-mute)",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        ◌ DORMANT WALLET
        <br />
        <span
          style={{ color: "var(--ink-dim)", fontSize: 10, letterSpacing: "0.1em" }}
        >
          no outflows detected in recent transactions
        </span>
      </div>
    </div>
  );
}

function Legend() {
  const items: Array<[string, string, string]> = [
    ["Target", "var(--neon)", "var(--neon)"],
    ["CEX", "rgba(110,255,224,0.15)", "var(--cyan)"],
    ["Bridge", "rgba(180,120,255,0.18)", "var(--purple)"],
    ["Flagged", "rgba(255,75,104,0.2)", "var(--red)"],
    ["Suspect", "rgba(255,181,71,0.2)", "var(--amber)"],
    ["Unknown", "#020604", "var(--neon)"],
  ];
  return (
    <div
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
        border: "1px solid var(--line)",
        background: "rgba(0,0,0,0.85)",
        padding: "10px 12px",
        fontFamily: "var(--mono)",
        fontSize: 10,
        zIndex: 4,
      }}
    >
      <div
        style={{
          color: "var(--ink-mute)",
          letterSpacing: "0.15em",
          marginBottom: 6,
        }}
      >
        LEGEND
      </div>
      {items.map(([label, bg, border]) => (
        <div
          key={label}
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            margin: "3px 0",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: bg,
              border: `1px solid ${border}`,
            }}
          ></span>
          {label}
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
   FLAGS BAR (heuristics)
   ===================================================================== */
function FlagsBar({ trace }: { trace: TraceResult }) {
  const summary = useMemo(() => buildSummary(trace), [trace]);
  const flags: Array<{
    code: string;
    label: string;
    body: string;
    color: string;
  }> = [];

  if (summary.fastExitFlag) {
    flags.push({
      code: "FAST_EXIT",
      label: "Rapid exit to CEX",
      body: ">80% of outflow reached a known centralized exchange in a single hop. Typical of drainer cash-outs.",
      color: "var(--red)",
    });
  }
  if (summary.cexExits.length > 0) {
    flags.push({
      code: "CEX_TOUCH",
      label: `${summary.cexExits.length} CEX touchpoint${summary.cexExits.length > 1 ? "s" : ""}`,
      body: `Funds reached ${summary.cexExits.map((n) => n.label?.name).filter(Boolean).slice(0, 3).join(", ")}. Compliance contact recommended.`,
      color: "var(--neon)",
    });
  }
  if (summary.bridgeExits.length > 0) {
    flags.push({
      code: "BRIDGE_EXIT",
      label: `${summary.bridgeExits.length} bridge exit${summary.bridgeExits.length > 1 ? "s" : ""}`,
      body: "Funds left Solana via cross-chain bridge. Trace continuation requires destination-chain analysis.",
      color: "var(--purple)",
    });
  }
  if (summary.mixerHits.length > 0) {
    flags.push({
      code: "MIXER_HIT",
      label: `${summary.mixerHits.length} mixer hit${summary.mixerHits.length > 1 ? "s" : ""}`,
      body: "Funds passed through a known privacy pool. Direct tracing past this point is obfuscated.",
      color: "var(--amber)",
    });
  }

  if (flags.length === 0) {
    return (
      <div
        style={{
          marginTop: 20,
          padding: "12px 16px",
          border: "1px solid var(--line-soft)",
          fontFamily: "var(--mono)",
          fontSize: 10.5,
          letterSpacing: "0.1em",
          color: "var(--ink-mute)",
          textTransform: "uppercase",
        }}
      >
        ◌ NO FLAGS RAISED · funds remain in unlabelled wallets within explored depth
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(flags.length, 4)}, 1fr)`,
        gap: 8,
      }}
    >
      {flags.map((f) => (
        <div
          key={f.code}
          style={{
            border: `1px solid ${f.color}`,
            background: "rgba(0,0,0,0.6)",
            padding: "12px 14px",
            fontFamily: "var(--mono)",
            fontSize: 10.5,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              color: f.color,
              marginBottom: 6,
            }}
          >
            ▲ {f.code}
          </div>
          <div
            style={{
              color: "var(--ink)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {f.label}
          </div>
          <div style={{ color: "var(--ink-dim)", lineHeight: 1.4 }}>
            {f.body}
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
   ACTION BAR (export/share)
   ===================================================================== */
function ActionBar({
  wallet,
  trace,
}: {
  wallet: string;
  trace: TraceResult;
}) {
  const [pdfBusy, setPdfBusy] = useState(false);

  function copyShare() {
    const url = `${window.location.origin}/trace/${encodeURIComponent(wallet)}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(trace, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova-trace-${wallet.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported");
  }

  async function downloadPdf() {
    if (pdfBusy) return;
    setPdfBusy(true);
    const t = toast.loading("Generating forensic report…");
    try {
      const res = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, maxHops: trace.hopsExplored }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nova-trace-${wallet.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF report downloaded", { id: t });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "PDF generation failed",
        { id: t },
      );
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 16,
        display: "flex",
        gap: 8,
        alignItems: "center",
        fontFamily: "var(--mono)",
        fontSize: 11,
        color: "var(--ink-mute)",
      }}
    >
      <a
        className="btn primary"
        onClick={downloadPdf}
        style={{ opacity: pdfBusy ? 0.6 : 1, pointerEvents: pdfBusy ? "none" : "auto" }}
      >
        {pdfBusy ? "↗ GENERATING…" : "↗ EXPORT PDF"}
      </a>
      <a className="btn ghost" onClick={downloadJson}>
        {"{}"} EXPORT JSON
      </a>
      <a className="btn ghost" onClick={copyShare}>
        ⟂ SHARE LINK
      </a>
      <span style={{ marginLeft: "auto" }}>
        Generated{" "}
        <span style={{ color: "var(--neon)" }}>
          {new Date(trace.generatedAt).toISOString()}
        </span>
      </span>
    </div>
  );
}

/* =====================================================================
   HELPERS
   ===================================================================== */
function layoutRing(nodes: TraceNode[]): RenderNode[] {
  const byDepth: Record<number, TraceNode[]> = {};
  for (const n of nodes) {
    (byDepth[n.depth] ||= []).push(n);
  }

  const rings = [0, 110, 200, 260];
  const sortBy = (a: TraceNode, b: TraceNode) => b.totalIn - a.totalIn;

  const out: RenderNode[] = [];
  for (const depthStr of Object.keys(byDepth)) {
    const depth = Number(depthStr);
    const ring = rings[depth] ?? 280;
    const peers = byDepth[depth].slice().sort(sortBy);
    peers.forEach((n, i) => {
      let x: number;
      let y: number;
      if (depth === 0) {
        x = CANVAS.cx;
        y = CANVAS.cy;
      } else {
        const angle = (i / peers.length) * Math.PI * 2 - Math.PI / 2;
        x = CANVAS.cx + Math.cos(angle) * ring;
        y = CANVAS.cy + Math.sin(angle) * ring * 0.78; // squash vertically
      }
      out.push({
        id: n.id,
        address: n.address,
        label: n.label,
        depth: n.depth,
        totalIn: n.totalIn,
        totalOut: n.totalOut,
        x,
        y,
        r: depth === 0 ? 11 : depth === 1 ? 6 : 4.5,
        kind: deriveKind(n),
      });
    });
  }
  return out;
}

function deriveKind(n: TraceNode): RenderNode["kind"] {
  if (n.depth === 0) return "target";
  const cat = n.label?.category;
  if (cat === "cex") return "cex";
  if (cat === "bridge") return "bridge";
  if (cat === "scammer" || cat === "mixer") return "flagged";
  if (n.depth === 1) return "default";
  return "default";
}

function formatAddr(a: string): string {
  if (!a || a.length < 14) return a;
  return a.slice(0, 6) + "…" + a.slice(-6);
}

function fmtAmount(n: number): string {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(4);
  if (n < 1000) return n.toFixed(2);
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function generateNarrative(trace: TraceResult): string {
  const cexHits = trace.nodes.filter(
    (n) => n.label?.category === "cex" && n.depth > 0,
  );
  const bridgeHits = trace.nodes.filter(
    (n) => n.label?.category === "bridge" && n.depth > 0,
  );
  const root = trace.nodes.find((n) => n.depth === 0);
  const outflow = root?.totalOut ?? 0;

  const parts: string[] = [];
  if (root?.label) {
    parts.push(
      `Root is a known ${root.label.category.toUpperCase()} (${root.label.name}).`,
    );
  }
  parts.push(
    `${fmtAmount(outflow)} flowed across ${trace.edges.length} hops to ${trace.nodes.length - 1} downstream entities.`,
  );
  if (cexHits.length) {
    const names = cexHits
      .slice(0, 3)
      .map((n) => n.label?.name)
      .filter(Boolean)
      .join(", ");
    parts.push(`Funds reached ${cexHits.length} known CEX hot wallet${cexHits.length > 1 ? "s" : ""}${names ? ` (${names})` : ""}.`);
  }
  if (bridgeHits.length) {
    parts.push(`${bridgeHits.length} bridge exit${bridgeHits.length > 1 ? "s" : ""} detected.`);
  }
  if (!cexHits.length && !bridgeHits.length) {
    parts.push("No CEX or bridge exits detected in current depth.");
  }
  return parts.join(" ");
}
