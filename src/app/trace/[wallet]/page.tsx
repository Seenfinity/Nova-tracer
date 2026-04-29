import Link from "next/link";
import { ArrowLeft, AlertTriangle, Radar } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TraceView } from "@/components/trace-view";
import { isLikelyAddress } from "@/lib/trace";

type Params = { wallet: string };

export default async function TracePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { wallet: rawWallet } = await params;
  const wallet = decodeURIComponent(rawWallet);
  const valid = isLikelyAddress(wallet);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,oklch(0.86_0.21_152/0.18),transparent_70%)]" />

      <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              New trace
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs tracking-wider">
            <Radar className="text-primary h-3.5 w-3.5" />
            <span className="text-muted-foreground">NOVA</span>
            <span className="text-primary">TRACER</span>
          </div>
        </div>

        <header className="mt-8 space-y-2">
          <p className="text-primary/80 font-mono text-[10px] uppercase tracking-[0.25em]">
            ▸ Tracing target
          </p>
          <h1 className="font-mono text-base break-all sm:text-xl">{wallet}</h1>
        </header>

        <section className="mt-8">
          {valid ? (
            <TraceView wallet={wallet} />
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Invalid Solana address</AlertTitle>
              <AlertDescription>
                The address in the URL doesn&apos;t look like a base58 Solana
                public key (32–44 chars). Try again from the home page.
              </AlertDescription>
            </Alert>
          )}
        </section>
      </div>
    </main>
  );
}
