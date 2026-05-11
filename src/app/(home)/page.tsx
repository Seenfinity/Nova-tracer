"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  HOT_EDGE_KEYS,
  HOT_PATHS,
  PROTOS,
  PROTO_LOGOS,
  TICKER_ITEMS,
  TRACER_EDGES,
  TRACER_LAYOUT,
  TRAIL_STEPS,
  WALLET_DATA,
  type LayoutNode,
  type WalletProfile,
} from "./landing-data";

import "./landing.css";

const SOL_GLYPH = (
  <svg className="g" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="g-sol-mini" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#00ff88" />
        <stop offset="1" stopColor="#6effe0" />
      </linearGradient>
    </defs>
    <path
      d="M5 6 L19 6 L17 9 L3 9 Z M5 11 L19 11 L17 14 L3 14 Z M5 16 L19 16 L17 19 L3 19 Z"
      fill="url(#g-sol-mini)"
    />
  </svg>
);

function formatAddr(a: string): string {
  if (a.length < 20) return a;
  return a.slice(0, 6) + "…" + a.slice(-6);
}

function dataFor(id: string): WalletProfile | null {
  const n = TRACER_LAYOUT.find((x) => x.id === id);
  if (!n) return null;
  return n.ref === "target"
    ? WALLET_DATA.target
    : (WALLET_DATA.nodes as Record<string, WalletProfile>)[n.ref] ?? null;
}

export default function HomePage() {
  const router = useRouter();
  const [traceValue, setTraceValue] = useState(WALLET_DATA.target.addr);

  // mark body active so landing.css scoped rules apply
  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  function submitTrace(addr: string) {
    const trimmed = addr.trim();
    if (!trimmed) return;
    router.push(`/trace/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="landing-page">
      <NavBar onLaunch={() => submitTrace(traceValue)} />

      <main>
        <Hero
          traceValue={traceValue}
          setTraceValue={setTraceValue}
          onSubmit={() => submitTrace(traceValue)}
        />

        <Ticker />

        <ConsoleSection />

        <FeaturesSection />

        <ProtocolsSection />

        <ApiSection />
      </main>

      <CtaStrip onLaunch={() => submitTrace(traceValue)} />

      <FooterSection />
    </div>
  );
}

/* =====================================================================
   NAV
   ===================================================================== */
function NavBar({ onLaunch }: { onLaunch: () => void }) {
  return (
    <nav className="top">
      <div className="logo">
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
      </div>
      <div className="links">
        <a>Product</a>
        <a>Graph</a>
        <a>Intel</a>
        <a>API</a>
        <a>Cases</a>
        <a>Pricing</a>
      </div>
      <div className="right">
        <span className="status-pill">
          <span className="pulse"></span>SLOT 284,491,207
        </span>
        <a
          className="btn primary"
          onClick={onLaunch}
          role="button"
          tabIndex={0}
        >
          Launch console →
        </a>
      </div>
    </nav>
  );
}

/* =====================================================================
   HERO
   ===================================================================== */
function Hero({
  traceValue,
  setTraceValue,
  onSubmit,
}: {
  traceValue: string;
  setTraceValue: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-left">
            <span className="eyebrow">
              Solana · On-chain investigation
            </span>
            <h1 className="title">
              Every wallet
              <br />
              leaves a <span className="glow">trail</span>.
              <br />
              <span className="out">WE FOLLOW IT.</span>
            </h1>
            <p className="sub">
              NOVA Tracer maps the movement of funds across Solana in real
              time — decoded, deanonymized, and ready for evidence. Find the
              exit wallet before the bridge clears.
            </p>

            <form
              className="trace-bar"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <div className="chain-mini">
                {SOL_GLYPH}
                <span>SOL</span>
              </div>
              <input
                value={traceValue}
                onChange={(e) => setTraceValue(e.target.value)}
                placeholder="Paste a wallet, signature, token, or program id…"
              />
              <button type="submit" className="btn primary">
                Trace →
              </button>
            </form>

            <div className="hero-suggest">
              <span className="lbl">Recent:</span>
              <span className="chip">drainer.sol</span>
              <span className="chip">FTX Hot #4</span>
              <span className="chip">BONK rug · Apr 12</span>
              <span className="chip">Wormhole exit</span>
              <span className="chip">Cypher cluster</span>
            </div>

            <div className="hero-metrics">
              <div className="m">
                <div className="k">Wallets indexed</div>
                <div className="v">
                  428.6<span className="u">M</span>
                </div>
              </div>
              <div className="m">
                <div className="k">TX/sec ingested</div>
                <div className="v">
                  4,112<span className="u">/s</span>
                </div>
              </div>
              <div className="m">
                <div className="k">Flagged entities</div>
                <div className="v">19,204</div>
              </div>
              <div className="m">
                <div className="k">Recovered</div>
                <div className="v">
                  $412<span className="u">M</span>
                </div>
              </div>
            </div>
          </div>

          <Tracer />
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   INTERACTIVE TRACER
   ===================================================================== */
function Tracer() {
  const tracerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const hudHopsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const tracerEl = tracerRef.current;
    const wc = cardRef.current;
    const trail = trailRef.current;
    if (!svg || !tracerEl || !wc || !trail) return;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const gE = svg.querySelector<SVGGElement>("#hero-edges")!;
    const gN = svg.querySelector<SVGGElement>("#hero-nodes")!;
    const gP = svg.querySelector<SVGGElement>("#hero-packets")!;

    let pinnedId: string | null = null;
    let selectedId: string | null = null;
    let panX = 0,
      panY = 0;
    let isPanning = false;
    let panStartX = 0,
      panStartY = 0;
    let panStartPX = 0,
      panStartPY = 0;
    let rafs: number[] = [];

    function render() {
      gE.innerHTML = "";
      gN.innerHTML = "";
      gP.innerHTML = "";

      TRACER_EDGES.forEach(([a, b]) => {
        const p1 = TRACER_LAYOUT.find((n) => n.id === a);
        const p2 = TRACER_LAYOUT.find((n) => n.id === b);
        if (!p1 || !p2) return;
        const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 18;
        const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 18;
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`);
        const key = `${a}-${b}`;
        const rev = `${b}-${a}`;
        let cls = "edge";
        if (HOT_EDGE_KEYS.has(key) || HOT_EDGE_KEYS.has(rev)) cls += " hot";
        else if (Math.random() < 0.3) cls += " faint";
        path.setAttribute("class", cls);
        path.dataset.a = a;
        path.dataset.b = b;
        gE.appendChild(path);
      });

      TRACER_LAYOUT.forEach((n) => {
        const g = document.createElementNS(SVG_NS, "g");
        let cls = `node ${n.kind}`;
        if (n.kind === "target") cls += " live";
        g.setAttribute("class", cls);
        g.setAttribute("transform", `translate(${n.x},${n.y})`);
        g.dataset.id = n.id;

        const halo = document.createElementNS(SVG_NS, "circle");
        halo.setAttribute("class", "halo");
        halo.setAttribute("r", String(n.r + 2));
        g.appendChild(halo);

        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("class", "core");
        c.setAttribute("r", String(n.r));
        g.appendChild(c);

        if (n.label) {
          const t = document.createElementNS(SVG_NS, "text");
          t.setAttribute("class", "lbl");
          t.setAttribute("y", String(-n.r - 6));
          t.textContent = n.label;
          g.appendChild(t);
        }
        gN.appendChild(g);
      });

      HOT_PATHS.forEach((pth, i) => {
        const packet = document.createElementNS(SVG_NS, "circle");
        packet.setAttribute("class", i % 2 ? "pkt cyan" : "pkt");
        packet.setAttribute("r", "2.4");
        gP.appendChild(packet);
        animatePacket(packet, pth, 3800 + i * 700, i * 600);
      });

      renderTrail();
    }

    function animatePacket(
      el: SVGCircleElement,
      path: string[],
      dur: number,
      delay: number,
    ) {
      const pts = path
        .map((id) => TRACER_LAYOUT.find((n) => n.id === id))
        .filter((n): n is LayoutNode => Boolean(n));
      if (pts.length < 2) return;
      let start: number | null = null;
      function frame(t: number) {
        if (start === null) start = t - delay;
        const elapsed = (((t - start) % dur) + dur) % dur;
        const f = elapsed / dur;
        const segs = pts.length - 1;
        const segF = f * segs;
        const i = Math.min(Math.floor(segF), segs - 1);
        const local = segF - i;
        const a = pts[i];
        const b = pts[i + 1];
        el.setAttribute("cx", String(a.x + (b.x - a.x) * local));
        el.setAttribute("cy", String(a.y + (b.y - a.y) * local));
        rafs.push(requestAnimationFrame(frame));
      }
      rafs.push(requestAnimationFrame(frame));
    }

    function renderTrail() {
      const active = selectedId || "target";
      const html =
        `<div class="trail-head">FOLLOW · <b>4 HOPS</b></div>` +
        TRAIL_STEPS.map((s) => {
          const d = dataFor(s.id);
          const a = d ? formatAddr(d.addr) : "—";
          return `<div class="step ${s.id === active ? "active" : ""}">
            <div>
              <div class="label">${s.label} · ${d ? d.label : ""}</div>
              <div class="addr">${a}</div>
            </div>
          </div>`;
        }).join("");
      trail!.innerHTML = html;
    }

    function showCard(id: string, evt: MouseEvent | null, pin = false) {
      const d = dataFor(id);
      if (!d) {
        wc!.style.display = "none";
        return;
      }
      const tags = d.tags
        .map((t) => {
          let cls = "";
          if (/DRAINER|SANCTIONED|FLAGGED/.test(t)) cls = "danger";
          else if (/MIXER|SUSPECT|NEW/.test(t)) cls = "flag";
          else if (/CEX|BRIDGE/.test(t)) cls = "hot";
          return `<span class="tag ${cls}">${t}</span>`;
        })
        .join("");
      const recent = d.recent
        .map(
          ([t, a, dir, note]) => `
        <div class="r">
          <span class="d">${t}</span>
          <span class="a ${dir}">${a}</span>
          <span class="d" style="max-width:110px; overflow:hidden; text-overflow:ellipsis">${note}</span>
        </div>`,
        )
        .join("");
      wc!.innerHTML = `
        <div class="head">
          <span class="lbl">${d.label}</span>
          <span class="risk ${d.risk}">${d.risk.toUpperCase()} RISK</span>
        </div>
        <div class="addr">${d.addr}</div>
        <div>${tags}</div>
        <div class="stats">
          <div><div class="k">Balance</div><div class="v">${d.balance}</div></div>
          <div><div class="k">Value</div><div class="v">${d.value}</div></div>
          <div><div class="k">TX count</div><div class="v">${d.txCount}</div></div>
          <div><div class="k">Last tx</div><div class="v">${d.last}</div></div>
        </div>
        <div class="recent">
          <div class="t">Recent activity</div>
          ${recent}
        </div>
      `;
      wc!.style.display = "block";
      wc!.classList.toggle("pinned", pin);
      positionCard(evt, id);
    }

    function positionCard(evt: MouseEvent | null, id: string) {
      const rect = tracerEl!.getBoundingClientRect();
      let x: number, y: number;
      if (evt) {
        x = evt.clientX - rect.left;
        y = evt.clientY - rect.top;
      } else {
        const n = TRACER_LAYOUT.find((n) => n.id === id);
        if (!n) return;
        const svgRect = svg!.getBoundingClientRect();
        const scale = svgRect.width / 600;
        x = n.x * scale + panX;
        y = n.y * scale + panY;
      }
      const cardW = 280;
      const cardH = wc!.offsetHeight || 240;
      if (x + cardW + 20 > rect.width) x = x - cardW - 20;
      if (y + cardH + 20 > rect.height) y = y - cardH - 20;
      wc!.style.left = Math.max(10, x) + "px";
      wc!.style.top = Math.max(10, y) + "px";
    }

    function hideCard() {
      if (pinnedId) return;
      wc!.style.display = "none";
    }

    function highlight(id: string) {
      const neighbors = new Set<string>([id]);
      TRACER_EDGES.forEach(([a, b]) => {
        if (a === id) neighbors.add(b);
        if (b === id) neighbors.add(a);
      });
      Array.from(gN.querySelectorAll<SVGGElement>(".node")).forEach((g) => {
        const gid = g.dataset.id;
        if (!gid) return;
        g.classList.toggle("dim", !neighbors.has(gid));
        g.classList.toggle("selected", gid === id);
      });
      Array.from(gE.querySelectorAll<SVGPathElement>(".edge")).forEach((p) => {
        const a = p.dataset.a;
        const b = p.dataset.b;
        const touches = a === id || b === id;
        p.classList.toggle("dim", !touches);
      });
    }
    function unhighlight() {
      Array.from(gN.querySelectorAll<SVGGElement>(".node")).forEach((g) =>
        g.classList.remove("dim", "selected"),
      );
      Array.from(gE.querySelectorAll<SVGPathElement>(".edge")).forEach((p) =>
        p.classList.remove("dim"),
      );
    }

    function onMouseMove(e: MouseEvent) {
      if (pinnedId) return;
      const target = (e.target as Element).closest<SVGGElement>(".node");
      if (target && target.dataset.id) {
        const id = target.dataset.id;
        highlight(id);
        showCard(id, e, false);
      } else {
        unhighlight();
        hideCard();
      }
    }
    function onClick(e: MouseEvent) {
      const target = (e.target as Element).closest<SVGGElement>(".node");
      if (target && target.dataset.id) {
        const id = target.dataset.id;
        if (pinnedId === id) {
          pinnedId = null;
          selectedId = null;
          wc!.classList.remove("pinned");
          hideCard();
          unhighlight();
        } else {
          pinnedId = id;
          selectedId = id;
          highlight(id);
          showCard(id, e, true);
        }
        renderTrail();
      } else {
        pinnedId = null;
        selectedId = null;
        wc!.classList.remove("pinned");
        hideCard();
        unhighlight();
        renderTrail();
      }
    }

    function onMouseDown(e: MouseEvent) {
      if ((e.target as Element).closest(".node")) return;
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartPX = panX;
      panStartPY = panY;
    }
    function onWindowMove(e: MouseEvent) {
      if (!isPanning) return;
      panX = panStartPX + (e.clientX - panStartX);
      panY = panStartPY + (e.clientY - panStartY);
      const bound = 80;
      panX = Math.max(-bound, Math.min(bound, panX));
      panY = Math.max(-bound, Math.min(bound, panY));
      svg!.style.transform = `translate(${panX}px, ${panY}px)`;
    }
    function onWindowUp() {
      isPanning = false;
    }

    svg.addEventListener("mousemove", onMouseMove);
    svg.addEventListener("click", onClick);
    svg.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onWindowMove);
    window.addEventListener("mouseup", onWindowUp);

    // tool buttons
    const toolButtons =
      tracerEl.querySelectorAll<HTMLSpanElement>(".tracer-foot .tb");
    function onToolClick(e: Event) {
      const tb = e.currentTarget as HTMLSpanElement;
      const tool = tb.dataset.tool;
      if (tool === "fit") {
        panX = 0;
        panY = 0;
        svg!.style.transform = "";
      } else if (tool === "expand") {
        for (let i = 0; i < 3; i++) {
          const g = document.createElementNS(SVG_NS, "circle");
          g.setAttribute("cx", String(50 + Math.random() * 500));
          g.setAttribute("cy", String(50 + Math.random() * 500));
          g.setAttribute("r", String(2 + Math.random() * 2));
          g.setAttribute("fill", "#00ff88");
          g.setAttribute("opacity", "0");
          gN.appendChild(g);
          g.animate(
            [{ opacity: 0 }, { opacity: 0.8 }, { opacity: 0.3 }],
            { duration: 1600, fill: "forwards" },
          );
        }
        if (hudHopsRef.current) {
          hudHopsRef.current.textContent = String(
            Math.floor(142 + Math.random() * 20),
          );
        }
      } else if (tool === "export") {
        tb.textContent = "✓ EXPORTED";
        setTimeout(() => {
          tb.textContent = "↗ EXPORT";
        }, 1400);
      }
    }
    toolButtons.forEach((tb) => tb.addEventListener("click", onToolClick));

    render();

    return () => {
      rafs.forEach((id) => cancelAnimationFrame(id));
      svg.removeEventListener("mousemove", onMouseMove);
      svg.removeEventListener("click", onClick);
      svg.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("mouseup", onWindowUp);
      toolButtons.forEach((tb) => tb.removeEventListener("click", onToolClick));
    };
  }, []);

  return (
    <div className="tracer" id="tracer" ref={tracerRef}>
      <div className="bgGrid"></div>
      <div className="scanline"></div>
      <div className="vignette"></div>

      <div className="tracer-hud">
        <div className="col">
          <div>
            TGT · <span className="val mono">7xKXtg2C…Pdq1vW</span>
          </div>
          <div>
            DEPTH 06 · HOPS{" "}
            <span className="val" ref={hudHopsRef}>
              142
            </span>
          </div>
          <div>
            CLUSTER <span className="val">#A-331</span>
          </div>
        </div>
        <div className="col r">
          <div>
            CHAIN · <span className="val">SOLANA · MAINNET</span>
          </div>
          <div>
            CONFIDENCE <span className="val">0.94</span>
          </div>
          <div>
            LAT <span className="val">38ms</span> · OK
          </div>
        </div>
      </div>

      <div className="trail" ref={trailRef}></div>

      <svg
        className="graph"
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMid meet"
        ref={svgRef}
      >
        <g id="hero-edges"></g>
        <g id="hero-nodes"></g>
        <g id="hero-packets"></g>
      </svg>

      <div
        ref={cardRef}
        className="wallet-card"
        style={{ display: "none" }}
      ></div>

      <div className="tracer-foot">
        <div className="l">
          <span>
            <span className="blink">●</span> TRACING · LIVE
          </span>
          <span>FIG. 01 · ENTITY GRAPH</span>
          <span className="hint">
            <kbd>hover</kbd> wallet · <kbd>click</kbd> pin · <kbd>drag</kbd>{" "}
            canvas
          </span>
        </div>
        <div className="tools">
          <span className="tb" data-tool="fit" title="Fit to view">
            ◻ FIT
          </span>
          <span className="tb" data-tool="expand" title="Expand depth">
            ＋ EXPAND
          </span>
          <span className="tb" data-tool="export" title="Export">
            ↗ EXPORT
          </span>
        </div>
      </div>

      <div className="frame-corner fc-tl"></div>
      <div className="frame-corner fc-tr"></div>
      <div className="frame-corner fc-bl"></div>
      <div className="frame-corner fc-br"></div>
    </div>
  );
}

/* =====================================================================
   TICKER
   ===================================================================== */
function Ticker() {
  return (
    <div className="ticker">
      <div className="row">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map(([k, v, d, cls], i) => (
          <div className="cell" key={i}>
            <span className="k">{k}</span>
            <span className="v">{v}</span>
            <span className={`d ${cls}`}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
   CONSOLE SECTION
   ===================================================================== */
function ConsoleSection() {
  const cEdgesRef = useRef<SVGGElement>(null);
  const cNodesRef = useRef<SVGGElement>(null);
  const cPacketsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const gE = cEdgesRef.current;
    const gN = cNodesRef.current;
    const gP = cPacketsRef.current;
    if (!gE || !gN || !gP) return;

    const SVG_NS = "http://www.w3.org/2000/svg";
    type ConsoleNode = {
      id: string;
      x: number;
      y: number;
      r: number;
      kind: string;
      label: string | null;
    };

    const nodes: ConsoleNode[] = [
      { id: "t", x: 360, y: 310, r: 11, kind: "target", label: "TARGET" },
    ];
    const ringCounts = [7, 12, 16];
    const ringR = [110, 200, 280];
    let id = 1;
    ringCounts.forEach((cnt, ri) => {
      for (let i = 0; i < cnt; i++) {
        const a = (i / cnt) * Math.PI * 2 + ri * 0.4;
        const x = 360 + Math.cos(a) * ringR[ri] * (0.85 + Math.random() * 0.3);
        const y = 310 + Math.sin(a) * ringR[ri] * (0.55 + Math.random() * 0.3);
        const kind =
          ri === 2 && Math.random() < 0.15
            ? "flagged"
            : ri === 1 && Math.random() < 0.2
            ? "suspect"
            : "default";
        const labelable = ri === 2 && Math.random() < 0.3;
        nodes.push({
          id: "n" + id,
          x,
          y,
          r: ri === 0 ? 5 : ri === 1 ? 4 : 3.5,
          kind,
          label: labelable
            ? ["CEX", "BRIDGE", "MIXER", "POOL", "DEX"][
                Math.floor(Math.random() * 5)
              ]
            : null,
        });
        id++;
      }
    });

    const edges: Array<[string, string]> = [];
    const ringStart = [
      1,
      1 + ringCounts[0],
      1 + ringCounts[0] + ringCounts[1],
    ];
    for (let i = 0; i < ringCounts[0]; i++) edges.push(["t", "n" + (i + 1)]);
    for (let i = 0; i < ringCounts[0]; i++) {
      const a = "n" + (i + 1);
      for (let k = 0; k < 2; k++) {
        const tIdx = Math.floor(Math.random() * ringCounts[1]) + 1;
        edges.push([a, "n" + (ringStart[1] - 1 + tIdx)]);
      }
    }
    for (let i = 0; i < ringCounts[1]; i++) {
      const a = "n" + (ringStart[1] - 1 + i + 1);
      const count = Math.random() < 0.5 ? 1 : 2;
      for (let k = 0; k < count; k++) {
        const tIdx = Math.floor(Math.random() * ringCounts[2]) + 1;
        edges.push([a, "n" + (ringStart[2] - 1 + tIdx)]);
      }
    }
    for (let k = 0; k < 6; k++) {
      const a =
        "n" + (ringStart[1] - 1 + Math.floor(Math.random() * ringCounts[1]) + 1);
      const b =
        "n" + (ringStart[1] - 1 + Math.floor(Math.random() * ringCounts[1]) + 1);
      if (a !== b) edges.push([a, b]);
    }

    const pos = (idv: string) => nodes.find((n) => n.id === idv);

    edges.forEach(([a, b]) => {
      const p1 = pos(a),
        p2 = pos(b);
      if (!p1 || !p2) return;
      const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 20;
      const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 20;
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`);
      const hot = a === "t" && Math.random() < 0.4;
      path.setAttribute(
        "class",
        "edge" + (hot ? " hot" : Math.random() < 0.55 ? " faint" : ""),
      );
      gE.appendChild(path);
    });

    nodes.forEach((n) => {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute(
        "class",
        "node " + n.kind + (n.kind === "target" ? " live" : ""),
      );
      g.setAttribute("transform", `translate(${n.x},${n.y})`);
      const halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("class", "halo");
      halo.setAttribute("r", String(n.r + 2));
      g.appendChild(halo);
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("class", "core");
      c.setAttribute("r", String(n.r));
      g.appendChild(c);
      if (n.label) {
        const t = document.createElementNS(SVG_NS, "text");
        t.setAttribute("class", "lbl");
        t.setAttribute("y", String(-n.r - 5));
        t.textContent = n.label;
        g.appendChild(t);
      }
      gN.appendChild(g);
    });

    const rafs: number[] = [];
    function animate(
      el: SVGCircleElement,
      pts: ConsoleNode[],
      dur: number,
      delay: number,
    ) {
      if (pts.length < 2) return;
      let start: number | null = null;
      function frame(t: number) {
        if (start === null) start = t - delay;
        const elapsed = (((t - start) % dur) + dur) % dur;
        const f = elapsed / dur;
        const segs = pts.length - 1;
        const segF = f * segs;
        const i = Math.min(Math.floor(segF), segs - 1);
        const local = segF - i;
        const a = pts[i];
        const b = pts[i + 1];
        el.setAttribute("cx", String(a.x + (b.x - a.x) * local));
        el.setAttribute("cy", String(a.y + (b.y - a.y) * local));
        rafs.push(requestAnimationFrame(frame));
      }
      rafs.push(requestAnimationFrame(frame));
    }

    for (let i = 0; i < 5; i++) {
      const outer =
        ringStart[2] - 1 + Math.floor(Math.random() * ringCounts[2]) + 1;
      const mid =
        ringStart[1] - 1 + Math.floor(Math.random() * ringCounts[1]) + 1;
      const inner = Math.floor(Math.random() * ringCounts[0]) + 1;
      const path = ["t", "n" + inner, "n" + mid, "n" + outer]
        .map((id) => pos(id))
        .filter((n): n is ConsoleNode => Boolean(n));
      const packet = document.createElementNS(SVG_NS, "circle");
      packet.setAttribute("class", i % 2 ? "pkt cyan" : "pkt");
      packet.setAttribute("r", "2");
      gP.appendChild(packet);
      animate(packet, path, 4200 + i * 600, i * 500);
    }

    return () => {
      rafs.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div className="l">
            <span className="eyebrow">Section · 02</span>
            <h2>
              See every hop. <em>Decoded.</em>
            </h2>
            <p>
              Our graph decodes CPI calls, flash swaps, wrapped transfers, MEV
              bundles, and bridge message hashes in a single canvas — so
              obfuscation loops collapse into a clean path from source to exit.
            </p>
          </div>
          <div className="r">
            <span className="idx">/ 02</span>
            <span>Investigation console</span>
            <span>graph · intel · evidence</span>
          </div>
        </div>

        <div className="console-shell">
          <div className="console-topbar">
            <span className="mono" style={{ color: "var(--neon)" }}>
              ◼ investigation.sol
            </span>
            <div className="tabs">
              <span className="t active">Graph</span>
              <span className="t">Flows</span>
              <span className="t">Entities</span>
              <span className="t">Timeline</span>
              <span className="t">Evidence</span>
            </div>
            <div className="right">
              <span className="dot"></span>
              <span>AUTO-TRACE · DEPTH 6</span>
              <span>EXPORT PDF ↗</span>
            </div>
          </div>

          <div className="console-body">
            <ConsoleLeft />

            <div className="cb-center">
              <svg
                viewBox="0 0 720 620"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <g ref={cEdgesRef}></g>
                <g ref={cNodesRef}></g>
                <g ref={cPacketsRef}></g>
              </svg>

              <div
                style={{
                  position: "absolute",
                  left: 20,
                  top: 18,
                  border: "1px solid var(--neon)",
                  background: "rgba(0,0,0,0.9)",
                  padding: "12px 14px",
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  width: 236,
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    color: "var(--neon)",
                    letterSpacing: "0.15em",
                    marginBottom: 8,
                  }}
                >
                  ▲ SELECTED NODE
                </div>
                <div
                  style={{
                    color: "var(--ink)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Binance Hot Wallet 9
                </div>
                <div
                  style={{
                    color: "var(--ink-mute)",
                    marginTop: 4,
                    wordBreak: "break-all",
                  }}
                >
                  9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 10,
                    borderTop: "1px solid var(--line-soft)",
                    paddingTop: 8,
                  }}
                >
                  <SelectedStat label="IN (24h)" value="+14,220 SOL" color="var(--neon)" />
                  <SelectedStat label="OUT (24h)" value="-12,001 SOL" color="var(--red)" />
                  <SelectedStat label="FIRST SEEN" value="2021-09-14" color="var(--ink)" />
                  <SelectedStat label="LAST TX" value="12 min ago" color="var(--ink)" />
                </div>
              </div>

              <Legend />
            </div>

            <ConsoleRight />
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectedStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          color: "var(--ink-mute)",
          fontSize: 9,
          letterSpacing: "0.15em",
        }}
      >
        {label}
      </div>
      <div style={{ color }}>{value}</div>
    </div>
  );
}

function Legend() {
  const items: Array<[string, string, string]> = [
    ["Target", "var(--neon)", "var(--neon)"],
    ["Suspect", "rgba(255,181,71,0.2)", "var(--amber)"],
    ["Flagged", "rgba(255,75,104,0.2)", "var(--red)"],
    ["CEX", "rgba(110,255,224,0.15)", "var(--cyan)"],
    ["Bridge", "rgba(180,120,255,0.18)", "var(--purple)"],
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
        zIndex: 2,
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
              boxShadow: label === "Target" ? `0 0 4px ${bg}` : undefined,
            }}
          ></span>
          {label}
        </div>
      ))}
    </div>
  );
}

function ConsoleLeft() {
  const filterRows: Array<[string, string, boolean]> = [
    ["Native SOL", "428", true],
    ["SPL tokens", "1.2k", true],
    ["NFT / cNFT", "37", true],
    ["DEX swaps", "88", false],
    ["Bridge out", "14", true],
    ["CEX deposit", "6", false],
  ];
  return (
    <div className="cb-left">
      <div className="filter-group">
        <div className="gt">
          <span>Filters</span>
          <b>12 active</b>
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
          <span>Value threshold</span>
          <b>&gt; 50 SOL</b>
        </div>
        <div
          style={{
            height: 3,
            background: "var(--line-soft)",
            position: "relative",
            margin: "10px 0 6px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "28%",
              right: "18%",
              top: 0,
              bottom: 0,
              background: "var(--neon)",
              boxShadow: "0 0 8px var(--neon)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              left: "28%",
              top: -3,
              width: 2,
              height: 9,
              background: "var(--neon)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              right: "18%",
              top: -3,
              width: 2,
              height: 9,
              background: "var(--neon)",
            }}
          ></div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "var(--ink-mute)",
            fontSize: 9.5,
          }}
        >
          <span>0</span>
          <span>50 SOL</span>
          <span>5k SOL</span>
        </div>
      </div>
      <div className="filter-group">
        <div className="gt">
          <span>Tags</span>
          <b>+ add</b>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {[
            ["DRAINER", "var(--amber)"],
            ["SANCTIONED", "var(--red)"],
            ["CEX", "var(--neon)"],
            ["MIXER", "var(--ink-dim)"],
            ["BRIDGE", "var(--ink-dim)"],
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
    </div>
  );
}

function ConsoleRight() {
  type Entity = {
    tag: string;
    tagCls: string;
    name: string;
    short: string;
    amt: string;
    amtColor?: string;
    when: string;
  };
  const entities: Entity[] = [
    {
      tag: "CEX",
      tagCls: "ok",
      name: "Binance Hot 9",
      short: "DfpMH…6xP",
      amt: "+8,402 SOL",
      when: "3 min ago",
    },
    {
      tag: "MIXER",
      tagCls: "flag",
      name: "Unknown Pool",
      short: "4tn2…9qa",
      amt: "±2,900 SOL",
      amtColor: "var(--amber)",
      when: "11 min ago",
    },
    {
      tag: "DRAINER",
      tagCls: "danger",
      name: "Seaport-X Cluster",
      short: "8kLm…v1A",
      amt: "-6,100 SOL",
      amtColor: "var(--red)",
      when: "22 min ago",
    },
    {
      tag: "BRIDGE",
      tagCls: "ok",
      name: "Wormhole Router",
      short: "worm…rtr",
      amt: "-1,800 SOL",
      when: "31 min ago",
    },
    {
      tag: "DEX",
      tagCls: "",
      name: "Jupiter Aggregator",
      short: "JUP…6V",
      amt: "±440 SOL",
      when: "48 min ago",
    },
    {
      tag: "LP",
      tagCls: "",
      name: "Raydium CLMM Pool",
      short: "r8Yk…p2",
      amt: "+220 SOL",
      when: "1 h ago",
    },
  ];
  return (
    <div className="cb-right">
      <div className="filter-group">
        <div className="gt">
          <span>Entities · 14</span>
          <b style={{ color: "var(--neon)" }}>sorted ▾</b>
        </div>
        <div className="entity-list">
          {entities.map((e) => (
            <div className="e" key={e.name}>
              <div>
                <span className={`tag ${e.tagCls}`}>{e.tag}</span>
                <br />
                <span className="nm">{e.name}</span>
                <div className="sub">{e.short}</div>
              </div>
              <div
                className="v"
                style={{ textAlign: "right", color: e.amtColor }}
              >
                {e.amt}
                <br />
                <span className="sub">{e.when}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="filter-group" style={{ marginTop: 20 }}>
        <div className="gt">
          <span>AI Analyst</span>
          <b style={{ color: "var(--neon)" }}>●</b>
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
          <span style={{ color: "var(--neon)" }}>NOVA:</span> Funds split
          across 3 mixer outputs, consolidated in a previously-dormant wallet,
          then bridged via Wormhole to ETH. 94% match to{" "}
          <b style={{ color: "var(--neon)" }}>DRAINER-X</b> cluster.
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   FEATURES
   ===================================================================== */
function FeaturesSection() {
  return (
    <section style={{ paddingTop: 20 }}>
      <div className="container">
        <div className="section-head">
          <div className="l">
            <span className="eyebrow">Section · 03</span>
            <h2>
              Built for the <em>hunt.</em>
            </h2>
            <p>
              Six capabilities that separate investigators from observers.
              Every one tuned for Solana&apos;s 400ms block times and
              cross-chain bridge chaos.
            </p>
          </div>
          <div className="r">
            <span className="idx">/ 03</span>
            <span>Capabilities</span>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature big">
            <span className="corner">◼</span>
            <span className="idx">
              FEATURE · <span className="n">01</span>
            </span>
            <h3>Real-time transaction graph with sub-slot latency.</h3>
            <p>
              Ingest every Solana slot as it lands. Nodes and edges update
              live as funds move — you watch the exit happen, not the
              post-mortem.
            </p>
            <div className="viz">
              <svg width="220" height="140" viewBox="0 0 220 140">
                <g
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.6"
                >
                  <path d="M20 70 L80 40" strokeDasharray="3 3" />
                  <path d="M20 70 L80 100" strokeDasharray="3 3" />
                  <path d="M80 40 L150 20" />
                  <path d="M80 40 L150 60" />
                  <path d="M80 100 L150 80" />
                  <path d="M80 100 L150 120" />
                  <path d="M150 60 L200 40" />
                  <path d="M150 80 L200 90" />
                </g>
                <g fill="currentColor">
                  <circle cx="20" cy="70" r="5" />
                  <circle cx="80" cy="40" r="3" />
                  <circle cx="80" cy="100" r="3" />
                  <circle cx="150" cy="20" r="3" />
                  <circle cx="150" cy="60" r="3" />
                  <circle cx="150" cy="80" r="3" />
                  <circle cx="150" cy="120" r="3" />
                  <circle cx="200" cy="40" r="4" />
                  <circle cx="200" cy="90" r="4" />
                </g>
              </svg>
            </div>
          </div>
          <FeatureCard
            n="02"
            title="Entity deanonymization."
            body="Clustered labels across 19k+ known entities — exchanges, DAOs, mixers, drainer kits, sanctioned addrs."
          />
          <FeatureCard
            n="03"
            title="Drainer & scam detection."
            body="Pattern-match signatures against known drainer kits within 2 slots of first outflow."
          />
          <FeatureCard
            n="04"
            title="Cross-chain bridge tracking."
            body="Follow flows through Wormhole, deBridge, Mayan, Allbridge. SOL ⇄ EVM reconciled by message hash."
          />
          <FeatureCard
            n="05"
            title="Evidence-grade exports."
            body="PDFs, signed hashes, CSV timelines — chain of custody built in, admissible in proceedings."
          />
          <FeatureCard
            n="06"
            title="Webhook & alert engine."
            body="Wake up when the wallet wakes up. Millisecond alerts on movement, swaps, or bridge exits."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="feature">
      <span className="corner">◼</span>
      <span className="idx">
        FEATURE · <span className="n">{n}</span>
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

/* =====================================================================
   PROTOCOLS
   ===================================================================== */
function ProtocolsSection() {
  return (
    <section style={{ paddingTop: 20 }}>
      <div className="container">
        <div className="section-head">
          <div className="l">
            <span className="eyebrow">Section · 04</span>
            <h2>
              Indexed across the <em>Solana surface.</em>
            </h2>
            <p>
              Every major program, bridge, DEX, lending protocol, and liquid
              staking derivative. New integrations ship weekly — if it settles
              on Solana, we read it.
            </p>
          </div>
          <div className="r">
            <span className="idx">/ 04</span>
            <span>142 protocols</span>
            <span style={{ color: "var(--neon)" }}>+ 6 this week</span>
          </div>
        </div>

        <div className="proto-strip">
          {PROTOS.map(([k, n]) => (
            <div className="proto" key={k} title={n}>
              <div
                className="pl"
                dangerouslySetInnerHTML={{ __html: PROTO_LOGOS[k] }}
              ></div>
              {n}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--mono)",
            fontSize: 10,
            color: "var(--ink-mute)",
            letterSpacing: "0.14em",
          }}
        >
          <span>
            COMPRESSED NFTs · TOKEN-2022 · STAKE POOLS · WORMHOLE VAA · DEBRIDGE
            DLN
          </span>
          <a
            style={{
              color: "var(--neon)",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            VIEW FULL COVERAGE MAP ↗
          </a>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   API
   ===================================================================== */
function ApiSection() {
  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div className="l">
            <span className="eyebrow">Section · 05</span>
            <h2>
              The same intel — <em>through your pipe.</em>
            </h2>
            <p>
              A GraphQL + REST surface on top of the same engine that powers
              our console. Stream traces into your SIEM, your compliance
              stack, or your MEV agent.
            </p>
          </div>
          <div className="r">
            <span className="idx">/ 05</span>
            <span>Developer platform</span>
          </div>
        </div>

        <div className="api-wrap">
          <div className="code-panel">
            <div className="code-topbar">
              <div className="dots">
                <span className="d"></span>
                <span className="d"></span>
                <span className="d g"></span>
              </div>
              <span className="file">trace.ts</span>
              <span className="right" style={{ color: "var(--neon)" }}>
                ● CONNECTED
              </span>
            </div>
            <pre
              className="code"
              dangerouslySetInnerHTML={{
                __html: `<span class="c">// nova-tracer / @v2.4 / solana-native</span>
<span class="k">import</span> { Nova } <span class="k">from</span> <span class="s">"@nova/tracer"</span>;

<span class="k">const</span> nova = <span class="k">new</span> <span class="f">Nova</span>({ key: process.env.<span class="n">NOVA_KEY</span> });

<span class="k">const</span> trace = <span class="k">await</span> nova.<span class="f">trace</span>({
  target:   <span class="s">"7xKXtg2CWgQnPfSZUtvfj…9mPdq1vW"</span>,
  chain:    <span class="s">"solana"</span>,
  depth:    <span class="n">6</span>,
  filter:   { minValue: <span class="n">50</span>, tokens: [<span class="s">"SOL"</span>, <span class="s">"USDC"</span>] },
  labels:   [<span class="s">"cex"</span>, <span class="s">"mixer"</span>, <span class="s">"bridge"</span>, <span class="s">"drainer"</span>],
  crossChain: <span class="n">true</span>,    <span class="c">// reconcile Wormhole / deBridge hops</span>
});

<span class="c">// → 142 hops, 14 entities, 3 bridge exits, 1 sanctioned</span>
trace.nodes.<span class="f">filter</span>(n => n.<span class="p">tags</span>.includes(<span class="s">"sanctioned"</span>));

<span class="k">await</span> nova.<span class="f">subscribe</span>(trace.id, event => {
  <span class="k">if</span> (event.type === <span class="s">"bridge_exit"</span>) <span class="f">alert</span>(event);
});`,
              }}
            />
          </div>

          <div>
            <div className="api-bullets">
              <ApiBullet
                n="01"
                title="gRPC streaming from the first slot."
                body="Subscribe to entity-level events with <40ms end-to-end latency. Your listener sees the exit before the block explorer does."
              />
              <ApiBullet
                n="02"
                title="Native cNFT & compression support."
                body="Full decode of state-compressed accounts, including Merkle proofs and concurrent leaf updates."
              />
              <ApiBullet
                n="03"
                title="Cross-chain VAA reconciliation."
                body="One trace ID spans SOL ⇄ ETH ⇄ Base ⇄ Arbitrum. Bridge hops collapse automatically."
              />
              <ApiBullet
                n="04"
                title="Compliance-ready responses."
                body="Signed, hashed, timestamped payloads suitable for SAR filing and law-enforcement chain of custody."
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <a className="btn primary">Read the docs →</a>
              <a className="btn ghost">curl example</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApiBullet({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="api-bullet">
      <span className="n">{n}</span>
      <div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </div>
  );
}

/* =====================================================================
   CTA STRIP
   ===================================================================== */
function CtaStrip({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="cta-strip">
      <div className="container">
        <span
          className="eyebrow"
          style={{ marginBottom: 24, display: "inline-flex" }}
        >
          All targets eventually move.
        </span>
        <h2>
          When they do — <em>you&apos;ll see it first.</em>
        </h2>
        <p>
          Start tracing any wallet in under 30 seconds. No card. No pitch deck.
          Just the graph.
        </p>
        <div className="cta-btns">
          <a
            className="btn primary"
            onClick={onLaunch}
            role="button"
            tabIndex={0}
          >
            Launch the console →
          </a>
          <a className="btn ghost">Book a briefing</a>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   FOOTER
   ===================================================================== */
function FooterSection() {
  return (
    <footer>
      <div className="container" style={{ padding: 0 }}>
        <div className="top">
          <div>
            <div className="logo">
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
            </div>
            <p className="blurb">
              On-chain investigation infrastructure for Solana. Built by
              security researchers, used by exchanges, DAOs, and law
              enforcement.
            </p>
          </div>
          <div>
            <h5>Product</h5>
            <ul>
              <li><a>Graph Console</a></li>
              <li><a>Entity Intel</a></li>
              <li><a>Alerts &amp; Webhooks</a></li>
              <li><a>Evidence Export</a></li>
              <li><a>API &amp; SDK</a></li>
            </ul>
          </div>
          <div>
            <h5>Use cases</h5>
            <ul>
              <li><a>Exchange compliance</a></li>
              <li><a>DeFi security</a></li>
              <li><a>Hack response</a></li>
              <li><a>Law enforcement</a></li>
              <li><a>Whale tracking</a></li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li><a>Case studies</a></li>
              <li><a>Threat reports</a></li>
              <li><a>Docs</a></li>
              <li><a>Status</a></li>
              <li><a>Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <span>© 2026 NOVA LABS · SOC 2 · SOLANA NATIVE</span>
          <span>
            v2.4.12 · NODE EU-FR-02 · SLOT{" "}
            <span style={{ color: "var(--neon)" }}>284,491,207</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
