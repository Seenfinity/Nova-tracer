"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Radar, Search, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrackedStore } from "@/lib/tracked-store";

export default function HomePage() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const { total, recent } = useTrackedStore();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = wallet.trim();
    if (!trimmed) return;
    router.push(`/trace/${trimmed}`);
  }

  const sumNodes = recent.reduce((acc, r) => acc + r.nodeCount, 0);
  const sumCex = recent.reduce((acc, r) => acc + r.cexHits, 0);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,oklch(0.86_0.21_152/0.22),transparent_70%)]" />

      <div className="mx-auto flex max-w-5xl flex-col px-6 py-10 sm:py-14">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-sm tracking-wider">
            <Radar className="text-primary h-4 w-4" />
            <span className="text-muted-foreground">NOVA</span>
            <span className="text-primary">TRACER</span>
          </div>
          <div className="text-muted-foreground hidden font-mono text-xs uppercase tracking-widest sm:block">
            On-chain forensic ops · Solana
          </div>
        </header>

        <section className="mt-16 flex flex-col items-center text-center sm:mt-24">
          <span className="border-primary/30 bg-primary/10 text-primary mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest">
            <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            Live · Helius enhanced trace
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Trace stolen funds on{" "}
            <span className="text-primary text-glow">Solana</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base sm:text-lg">
            Paste a victim wallet. NOVA Tracer follows the money across hops,
            detects exits to known CEXs, mixers and bridges, and renders the
            full flow as a graph.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <Input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Paste a Solana wallet address"
              className="border-primary/40 bg-card/60 h-12 flex-1 font-mono text-sm backdrop-blur"
              autoFocus
            />
            <Button type="submit" size="lg" className="glow-primary h-12">
              <Search className="mr-2 h-4 w-4" />
              Trace funds
            </Button>
          </form>
          <p className="text-muted-foreground/80 mt-3 font-mono text-xs">
            Multi-hop graph · CEX & mixer detection · No login required
          </p>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Wallets tracked"
            value={total}
            hint="In this browser"
          />
          <Stat label="Nodes mapped" value={sumNodes} hint="Across recent traces" />
          <Stat
            label="CEX exits flagged"
            value={sumCex}
            hint="Known hot wallets hit"
            accent
          />
        </section>

        {recent.length > 0 ? (
          <section className="mt-12">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Recent traces
              </h2>
              <span className="text-muted-foreground/70 font-mono text-[10px] uppercase tracking-widest">
                local-only
              </span>
            </div>
            <ul className="border-border bg-card/40 divide-border divide-y rounded-lg border backdrop-blur-sm">
              {recent.map((r) => (
                <li key={r.address}>
                  <Link
                    href={`/trace/${r.address}`}
                    className="hover:bg-primary/5 flex items-center justify-between gap-4 px-4 py-3 transition-colors"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {r.cexHits > 0 ? (
                        <ShieldAlert className="text-destructive h-4 w-4 shrink-0" />
                      ) : (
                        <Radar className="text-primary h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate font-mono text-xs sm:text-sm">
                        {r.address}
                      </span>
                    </div>
                    <div className="text-muted-foreground hidden gap-4 font-mono text-xs sm:flex">
                      <span>{r.nodeCount} nodes</span>
                      <span>{r.edgeCount} edges</span>
                      <span>
                        {r.cexHits > 0
                          ? `${r.cexHits} CEX`
                          : "no CEX hit"}
                      </span>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="text-muted-foreground/70 mt-20 text-center font-mono text-[10px] uppercase tracking-widest">
          Built for the Solana Frontier hackathon · Helius + Claude Code
        </footer>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`border-border bg-card/40 rounded-lg border p-5 backdrop-blur-sm ${
        accent ? "border-primary/40" : ""
      }`}
    >
      <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${
          accent ? "text-primary text-glow" : ""
        }`}
      >
        {value.toLocaleString()}
      </p>
      {hint ? (
        <p className="text-muted-foreground/70 mt-1 text-xs">{hint}</p>
      ) : null}
    </div>
  );
}
