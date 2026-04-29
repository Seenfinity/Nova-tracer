import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TraceView } from "@/components/trace-view";
import { isLikelyAddress } from "@/lib/trace";
import { ArrowLeft, AlertTriangle } from "lucide-react";

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
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              New trace
            </Button>
          </Link>
        </div>

        <header className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Tracing
          </p>
          <h1 className="font-mono text-base break-all sm:text-lg">{wallet}</h1>
        </header>

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
      </div>
    </main>
  );
}
