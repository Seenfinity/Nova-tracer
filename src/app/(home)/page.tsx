"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = wallet.trim();
    if (!trimmed) return;
    router.push(`/trace/${trimmed}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            NOVA Tracer
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Forensic fund tracing for Solana scam victims. Paste a stolen-from
            wallet, follow the money.
          </p>
        </header>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="Enter a Solana wallet address"
            className="h-12 flex-1 font-mono text-sm"
            autoFocus
          />
          <Button type="submit" size="lg" className="h-12">
            <Search className="mr-2 h-4 w-4" />
            Trace funds
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-xs">
          Multi-hop transaction graph · CEX & mixer detection · AI-narrated
          report
        </p>
      </div>
    </main>
  );
}
