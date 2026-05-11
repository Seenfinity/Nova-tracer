import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Rect,
  G,
} from "@react-pdf/renderer";
import type { TraceResult } from "@/lib/types";
import { fmtAmount, type ReportSummary } from "@/lib/report-summary";

const COL = {
  bg: "#000000",
  card: "#06120c",
  ink: "#e6fff0",
  inkDim: "#85a897",
  inkMute: "#4a6a58",
  neon: "#00ff88",
  neonSoft: "#7aff9e",
  cyan: "#6effe0",
  amber: "#ffb547",
  red: "#ff4b68",
  purple: "#b478ff",
  line: "#0a3a22",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: COL.bg,
    color: COL.ink,
    fontFamily: "Helvetica",
    fontSize: 9,
    padding: 0,
  },
  pageBody: {
    padding: 36,
    paddingTop: 56,
    paddingBottom: 60,
  },
  // Header / footer
  pageHeader: {
    position: "absolute",
    top: 18,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COL.inkMute,
    letterSpacing: 1.2,
  },
  pageHeaderRight: {
    color: COL.neon,
  },
  pageFooter: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: COL.inkMute,
    letterSpacing: 1,
  },
  // Watermark
  watermark: {
    position: "absolute",
    top: 200,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 64,
    color: COL.neon,
    opacity: 0.04,
    transform: "rotate(-28deg)",
    letterSpacing: 6,
    fontFamily: "Courier-Bold",
  },
  // Cover
  cover: {
    backgroundColor: COL.bg,
    padding: 48,
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverTitle: {
    fontSize: 56,
    fontFamily: "Helvetica-Bold",
    color: COL.ink,
    letterSpacing: -2,
    lineHeight: 1.02,
    marginTop: 100,
  },
  coverTitleGlow: {
    color: COL.neon,
  },
  coverSubtitle: {
    marginTop: 18,
    fontSize: 12,
    color: COL.inkDim,
    fontFamily: "Helvetica",
    letterSpacing: 0.5,
    maxWidth: 440,
    lineHeight: 1.4,
  },
  coverBlock: {
    marginTop: 36,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COL.line,
  },
  coverRow: {
    flexDirection: "row",
    marginBottom: 6,
    fontSize: 10,
  },
  coverK: {
    width: 110,
    color: COL.inkMute,
    fontFamily: "Courier",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  coverV: {
    flex: 1,
    color: COL.ink,
    fontFamily: "Courier",
    fontSize: 10,
  },
  coverV_neon: {
    color: COL.neon,
  },
  coverBrand: {
    fontFamily: "Courier-Bold",
    fontSize: 11,
    color: COL.neon,
    letterSpacing: 4,
    marginBottom: 8,
  },
  coverEyebrow: {
    fontFamily: "Courier",
    fontSize: 9,
    color: COL.inkMute,
    letterSpacing: 3,
  },
  // Section
  section: {
    marginBottom: 26,
  },
  eyebrow: {
    fontFamily: "Courier-Bold",
    fontSize: 9,
    color: COL.neon,
    letterSpacing: 2.4,
    marginBottom: 6,
  },
  h2: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: COL.ink,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  body: {
    fontSize: 10,
    color: COL.inkDim,
    lineHeight: 1.55,
  },
  // Stats grid
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COL.line,
  },
  statCell: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 0,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: COL.line,
  },
  statCellLast: {
    borderRightWidth: 0,
  },
  statK: {
    fontFamily: "Courier",
    fontSize: 7.5,
    color: COL.inkMute,
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  statV: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: COL.ink,
    letterSpacing: -0.4,
  },
  statV_neon: { color: COL.neon },
  statV_amber: { color: COL.amber },
  statV_red: { color: COL.red },
  // Tables
  table: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COL.line,
  },
  trh: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COL.line,
  },
  tr: {
    flexDirection: "row",
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COL.line,
  },
  th: {
    fontFamily: "Courier-Bold",
    fontSize: 7.5,
    color: COL.inkMute,
    letterSpacing: 1.4,
  },
  td: {
    fontFamily: "Courier",
    fontSize: 8,
    color: COL.ink,
  },
  td_neon: { color: COL.neon },
  td_amber: { color: COL.amber },
  td_red: { color: COL.red },
  td_dim: { color: COL.inkDim },
  // Callout
  callout: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COL.neon,
    backgroundColor: "#001a0d",
  },
  calloutTitle: {
    fontFamily: "Courier-Bold",
    fontSize: 8,
    color: COL.neon,
    letterSpacing: 2,
    marginBottom: 6,
  },
  calloutBody: {
    fontSize: 10,
    color: COL.ink,
    lineHeight: 1.5,
  },
  // Graph
  graphFrame: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COL.line,
    padding: 10,
    backgroundColor: COL.card,
  },
});

const SVG_VIEW = { w: 520, h: 320 };

function ringLayout(trace: TraceResult) {
  const cx = SVG_VIEW.w / 2;
  const cy = SVG_VIEW.h / 2;
  const rings = [0, 80, 140, 190];
  const byDepth: Record<number, typeof trace.nodes> = {};
  for (const n of trace.nodes) (byDepth[n.depth] ||= []).push(n);
  const out: Array<{
    id: string;
    x: number;
    y: number;
    r: number;
    color: string;
    label?: string;
    depth: number;
  }> = [];
  for (const ds of Object.keys(byDepth)) {
    const depth = Number(ds);
    const ring = rings[depth] ?? 220;
    const peers = byDepth[depth].slice().sort((a, b) => b.totalIn - a.totalIn);
    peers.forEach((n, i) => {
      let x: number, y: number;
      if (depth === 0) {
        x = cx;
        y = cy;
      } else {
        const angle = (i / peers.length) * Math.PI * 2 - Math.PI / 2;
        x = cx + Math.cos(angle) * ring;
        y = cy + Math.sin(angle) * ring * 0.62;
      }
      const cat = n.label?.category;
      const color =
        depth === 0
          ? COL.neon
          : cat === "cex"
          ? COL.cyan
          : cat === "bridge"
          ? COL.purple
          : cat === "scammer" || cat === "mixer"
          ? COL.red
          : COL.neonSoft;
      out.push({
        id: n.id,
        x,
        y,
        r: depth === 0 ? 7 : depth === 1 ? 4 : 3,
        color,
        label: depth === 0 ? "TARGET" : n.label?.name,
        depth,
      });
    });
  }
  return out;
}

function TraceMiniGraph({ trace }: { trace: TraceResult }) {
  const nodes = ringLayout(trace);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <Svg
      style={{ width: "100%", height: 280 }}
      viewBox={`0 0 ${SVG_VIEW.w} ${SVG_VIEW.h}`}
    >
      <Rect x="0" y="0" width={SVG_VIEW.w} height={SVG_VIEW.h} fill={COL.card} />
      <G>
        {trace.edges.map((e, i) => {
          const a = nodeMap.get(e.source);
          const b = nodeMap.get(e.target);
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 - 8;
          return (
            <Path
              key={i}
              d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
              stroke={COL.neon}
              strokeWidth={0.4}
              strokeOpacity={0.35}
              fill="none"
            />
          );
        })}
      </G>
      <G>
        {nodes.map((n) => (
          <G key={n.id}>
            <Path
              d={`M ${n.x} ${n.y} m -${n.r}, 0 a ${n.r},${n.r} 0 1,0 ${n.r * 2},0 a ${n.r},${n.r} 0 1,0 -${n.r * 2},0`}
              fill={n.depth === 0 ? n.color : COL.bg}
              stroke={n.color}
              strokeWidth={n.depth === 0 ? 0 : 0.8}
            />
          </G>
        ))}
      </G>
    </Svg>
  );
}

function PageChrome({
  pageId,
  pageNo,
  pageTotal,
  reportId,
  hashShort,
}: {
  pageId: string;
  pageNo: number;
  pageTotal: number;
  reportId: string;
  hashShort: string;
}) {
  return (
    <>
      <View style={s.watermark} fixed>
        <Text>NOVA · TRACER</Text>
      </View>
      <View style={s.pageHeader} fixed>
        <Text>NOVA / TRACER · FORENSIC TRACE REPORT</Text>
        <Text style={s.pageHeaderRight}>{pageId}</Text>
      </View>
      <View style={s.pageFooter} fixed>
        <Text>{reportId} · sha256:{hashShort}</Text>
        <Text>
          PAGE {pageNo} / {pageTotal} · nova-tracer.app
        </Text>
      </View>
    </>
  );
}

export function ReportDocument({
  trace,
  summary,
  reportHash,
}: {
  trace: TraceResult;
  summary: ReportSummary;
  reportHash: string;
}) {
  const hashShort = reportHash.slice(0, 16);
  const total = 4;
  const labelledPct = summary.nodeCount
    ? Math.round((summary.labelledCount / summary.nodeCount) * 100)
    : 0;

  return (
    <Document
      title={`NOVA Tracer · ${summary.reportId}`}
      author="NOVA Tracer"
      subject="Forensic Solana fund-trace report"
      creator="NOVA Tracer"
    >
      {/* PAGE 1 — COVER */}
      <Page size="LETTER" style={s.page}>
        <View style={s.watermark} fixed>
          <Text>NOVA · TRACER</Text>
        </View>
        <View style={s.cover}>
          <View>
            <Text style={s.coverBrand}>NOVA / TRACER</Text>
            <Text style={s.coverEyebrow}>FORENSIC TRACE REPORT</Text>
            <Text style={s.coverTitle}>
              Every wallet leaves a <Text style={s.coverTitleGlow}>trail.</Text>
            </Text>
            <Text style={s.coverSubtitle}>
              Multi-hop on-chain fund tracing for Solana. This report documents
              the flow of funds out of the queried wallet, identifies known
              destinations (centralized exchanges, mixers, bridges), and is
              cryptographically signed for chain-of-custody.
            </Text>
          </View>
          <View style={s.coverBlock}>
            <CoverRow k="REPORT ID" v={summary.reportId} neon />
            <CoverRow k="GENERATED" v={summary.generatedAt} />
            <CoverRow
              k="TARGET"
              v={summary.rootAddress}
            />
            {summary.rootLabel ? (
              <CoverRow k="ROOT LABEL" v={summary.rootLabel} neon />
            ) : null}
            <CoverRow k="DEPTH" v={`${summary.hopsExplored} hops`} />
            <CoverRow
              k="ENTITIES"
              v={`${summary.nodeCount} nodes / ${summary.edgeCount} flows`}
            />
            <CoverRow
              k="HASH"
              v={`sha256:${reportHash}`}
            />
          </View>
          <View>
            <Text
              style={{
                fontFamily: "Courier",
                fontSize: 8,
                color: COL.inkMute,
                letterSpacing: 1.4,
              }}
            >
              CHAIN OF CUSTODY · SOLANA · HELIUS ENHANCED TRANSACTIONS API
            </Text>
          </View>
        </View>
        <View style={s.pageFooter} fixed>
          <Text>{summary.reportId} · sha256:{hashShort}</Text>
          <Text>PAGE 1 / {total} · nova-tracer.app</Text>
        </View>
      </Page>

      {/* PAGE 2 — EXECUTIVE SUMMARY + GRAPH */}
      <Page size="LETTER" style={s.page}>
        <PageChrome
          pageId="SECTION · 01"
          pageNo={2}
          pageTotal={total}
          reportId={summary.reportId}
          hashShort={hashShort}
        />
        <View style={s.pageBody}>
          <View style={s.section}>
            <Text style={s.eyebrow}>▸ SECTION 01 · EXECUTIVE SUMMARY</Text>
            <Text style={s.h2}>What we found.</Text>
            <Text style={s.body}>{summary.narrative}</Text>
            <View style={s.statsRow}>
              <Stat label="OUTFLOW" value={fmtAmount(summary.totalOutflow)} />
              <Stat label="HOPS" value={String(summary.edgeCount)} />
              <Stat label="ENTITIES" value={String(summary.nodeCount)} />
              <Stat
                label="CEX EXITS"
                value={String(summary.cexExits.length)}
                tone={summary.cexExits.length ? "red" : undefined}
              />
              <Stat
                label="LABELLED"
                value={`${labelledPct}%`}
                tone="neon"
                last
              />
            </View>
          </View>

          {summary.fastExitFlag ? (
            <View style={s.callout}>
              <Text style={s.calloutTitle}>▲ FAST_EXIT FLAG RAISED</Text>
              <Text style={s.calloutBody}>
                More than 80% of the outflow reached known centralized-exchange
                hot wallets within a single hop. This pattern is characteristic
                of a drainer cash-out. Contact the receiving exchange&apos;s
                compliance team with this report as soon as possible.
              </Text>
            </View>
          ) : null}

          <View style={s.section}>
            <Text style={s.eyebrow}>▸ FIG. 01 · FLOW GRAPH</Text>
            <View style={s.graphFrame}>
              <TraceMiniGraph trace={trace} />
            </View>
          </View>
        </View>
      </Page>

      {/* PAGE 3 — ENTITIES + TOP TRANSFERS */}
      <Page size="LETTER" style={s.page}>
        <PageChrome
          pageId="SECTION · 02"
          pageNo={3}
          pageTotal={total}
          reportId={summary.reportId}
          hashShort={hashShort}
        />
        <View style={s.pageBody}>
          <View style={s.section}>
            <Text style={s.eyebrow}>▸ SECTION 02 · LABELLED DESTINATIONS</Text>
            <Text style={s.h2}>Where the money ends up.</Text>
            <Text style={s.body}>
              Destinations identified across {summary.hopsExplored} hops, ranked
              by inflow. Only addresses present in the on-chain entity dictionary
              are listed here — the trace also contains{" "}
              {summary.nodeCount - summary.labelledCount} unlabelled wallets.
            </Text>
            <View style={s.table}>
              <View style={s.trh}>
                <Text style={[s.th, { width: 80 }]}>CATEGORY</Text>
                <Text style={[s.th, { flex: 1 }]}>LABEL</Text>
                <Text style={[s.th, { width: 200 }]}>ADDRESS</Text>
                <Text style={[s.th, { width: 70, textAlign: "right" }]}>
                  TOTAL IN
                </Text>
                <Text style={[s.th, { width: 40, textAlign: "right" }]}>
                  DEPTH
                </Text>
              </View>
              {summary.topDestinations.length === 0 ? (
                <View style={s.tr}>
                  <Text style={[s.td, s.td_dim, { flex: 1 }]}>
                    No labelled destinations within the explored depth.
                  </Text>
                </View>
              ) : (
                summary.topDestinations.map((d, i) => {
                  const tone =
                    d.category === "cex"
                      ? s.td_neon
                      : d.category === "scammer" || d.category === "mixer"
                      ? s.td_red
                      : d.category === "bridge"
                      ? s.td_amber
                      : s.td;
                  return (
                    <View style={s.tr} key={i}>
                      <Text style={[s.td, tone, { width: 80 }]}>
                        {(d.category ?? "UNKNOWN").toUpperCase()}
                      </Text>
                      <Text style={[s.td, { flex: 1 }]}>
                        {d.label ?? "—"}
                      </Text>
                      <Text style={[s.td, s.td_dim, { width: 200 }]}>
                        {short(d.address)}
                      </Text>
                      <Text
                        style={[
                          s.td,
                          s.td_neon,
                          { width: 70, textAlign: "right" },
                        ]}
                      >
                        {fmtAmount(d.totalIn)}
                      </Text>
                      <Text
                        style={[
                          s.td,
                          s.td_dim,
                          { width: 40, textAlign: "right" },
                        ]}
                      >
                        {d.depth}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.eyebrow}>▸ SECTION 03 · TOP TRANSFERS</Text>
            <Text style={s.h2}>Hop-by-hop ledger.</Text>
            <View style={s.table}>
              <View style={s.trh}>
                <Text style={[s.th, { width: 90 }]}>FROM</Text>
                <Text style={[s.th, { width: 90 }]}>TO</Text>
                <Text style={[s.th, { width: 60, textAlign: "right" }]}>
                  AMOUNT
                </Text>
                <Text style={[s.th, { width: 60 }]}>TOKEN</Text>
                <Text style={[s.th, { flex: 1 }]}>SIGNATURE</Text>
              </View>
              {summary.topEdges.slice(0, 18).map((e, i) => (
                <View style={s.tr} key={i}>
                  <Text style={[s.td, { width: 90 }]}>{short(e.source)}</Text>
                  <Text style={[s.td, { width: 90 }]}>{short(e.target)}</Text>
                  <Text
                    style={[s.td, s.td_neon, { width: 60, textAlign: "right" }]}
                  >
                    {fmtAmount(e.amount)}
                  </Text>
                  <Text style={[s.td, s.td_dim, { width: 60 }]}>
                    {e.token === "SOL" ? "SOL" : short(e.token)}
                  </Text>
                  <Text style={[s.td, s.td_dim, { flex: 1 }]}>
                    {short(e.signature, 8)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>

      {/* PAGE 4 — METHODOLOGY + SIGNATURE */}
      <Page size="LETTER" style={s.page}>
        <PageChrome
          pageId="SECTION · 04"
          pageNo={4}
          pageTotal={total}
          reportId={summary.reportId}
          hashShort={hashShort}
        />
        <View style={s.pageBody}>
          <View style={s.section}>
            <Text style={s.eyebrow}>▸ SECTION 04 · METHODOLOGY</Text>
            <Text style={s.h2}>How this trace was generated.</Text>
            <Text style={s.body}>
              The on-chain walk was performed via a bounded breadth-first
              search over outgoing transfers extracted from the Helius
              Enhanced Transactions API (v0 endpoint). Native SOL transfers
              are normalised from lamports; SPL token transfers use the
              decimal-adjusted amount returned by Helius. The walk stops at
              nodes whose address matches a known centralized exchange — funds
              that reach a CEX have effectively left the public on-chain
              trail and require an exchange-side investigation.
            </Text>
            <View style={s.table}>
              <MethodRow k="API source" v="api.helius.xyz/v0/addresses/&lt;addr&gt;/transactions" />
              <MethodRow k="Search type" v="Breadth-first over outgoing transfers" />
              <MethodRow k="Depth cap" v={`${summary.hopsExplored} hops`} />
              <MethodRow k="Per-node cap" v="Top 8 transfers by amount" />
              <MethodRow k="Tx cap per address" v="100 most recent" />
              <MethodRow
                k="Entity dictionary"
                v="Static address-label set (CEX, bridge, mixer, scammer, DeFi)"
              />
              <MethodRow
                k="Heuristics"
                v="FAST_EXIT (>80% outflow → CEX in 1 hop)"
              />
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.eyebrow}>▸ CHAIN OF CUSTODY</Text>
            <Text style={s.h2}>This report is cryptographically signed.</Text>
            <View style={s.callout}>
              <Text style={s.calloutTitle}>SHA-256 · REPORT FINGERPRINT</Text>
              <Text
                style={{
                  fontFamily: "Courier",
                  fontSize: 9,
                  color: COL.neon,
                  letterSpacing: 1,
                }}
              >
                {reportHash}
              </Text>
              <Text style={[s.body, { marginTop: 8 }]}>
                The hash above is the SHA-256 of the canonical JSON
                representation of the underlying trace data. Any modification
                to this report invalidates the fingerprint. Generated{" "}
                {summary.generatedAt}.
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 26,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: COL.line,
            }}
          >
            <Text
              style={{
                fontFamily: "Courier",
                fontSize: 8,
                color: COL.inkMute,
                letterSpacing: 1.4,
                lineHeight: 1.6,
              }}
            >
              DISCLAIMER · This report describes on-chain fund movement based on
              publicly available transaction data. It does not assert criminal
              intent or constitute legal advice. Entity labels reflect the
              best-known association at time of generation; addresses may be
              re-used and historical labels can change. For evidentiary use,
              corroborate with the receiving exchange&apos;s compliance team
              and your local jurisdiction&apos;s requirements.
            </Text>
            <Text
              style={{
                marginTop: 14,
                fontFamily: "Courier-Bold",
                fontSize: 9,
                color: COL.neon,
                letterSpacing: 2,
              }}
            >
              NOVA TRACER · nova-tracer.app · © 2026 NOVA LABS
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function CoverRow({
  k,
  v,
  neon,
}: {
  k: string;
  v: string;
  neon?: boolean;
}) {
  return (
    <View style={s.coverRow}>
      <Text style={s.coverK}>{k}</Text>
      <Text style={[s.coverV, neon ? s.coverV_neon : {}]}>{v}</Text>
    </View>
  );
}

function Stat({
  label,
  value,
  tone,
  last,
}: {
  label: string;
  value: string;
  tone?: "neon" | "amber" | "red";
  last?: boolean;
}) {
  const toneStyle =
    tone === "neon"
      ? s.statV_neon
      : tone === "amber"
      ? s.statV_amber
      : tone === "red"
      ? s.statV_red
      : {};
  return (
    <View style={[s.statCell, last ? s.statCellLast : {}]}>
      <Text style={s.statK}>{label}</Text>
      <Text style={[s.statV, toneStyle]}>{value}</Text>
    </View>
  );
}

function MethodRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.tr}>
      <Text style={[s.td, s.td_dim, { width: 140 }]}>{k}</Text>
      <Text style={[s.td, { flex: 1 }]}>{v}</Text>
    </View>
  );
}

function short(s: string, head = 6): string {
  if (!s) return "";
  if (s.length <= head * 2 + 1) return s;
  return s.slice(0, head) + "…" + s.slice(-head);
}
