import { TraceConsole } from "./trace-console";
import { isLikelyAddress } from "@/lib/trace";
import "../../(home)/landing.css";

type Params = { wallet: string };

export default async function TracePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { wallet: rawWallet } = await params;
  const wallet = decodeURIComponent(rawWallet);
  const valid = isLikelyAddress(wallet);

  if (!valid) {
    return (
      <div className="landing-page">
        <main style={{ padding: "80px 0", minHeight: "60vh" }}>
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <span
              className="eyebrow"
              style={{ borderColor: "var(--red)", color: "var(--red)" }}
            >
              ▲ INVALID TARGET
            </span>
            <h1
              className="display"
              style={{ fontSize: 48, margin: 0, textAlign: "center" }}
            >
              That doesn&apos;t look like a Solana address.
            </h1>
            <p
              style={{
                color: "var(--ink-dim)",
                fontSize: 14,
                fontFamily: "var(--mono)",
                textAlign: "center",
                maxWidth: 480,
              }}
            >
              Solana addresses are base58-encoded and 32–44 characters long.
              Double-check what you pasted, or go back to start a new trace.
            </p>
            <a className="btn primary" href="/">
              ← Back to home
            </a>
          </div>
        </main>
      </div>
    );
  }

  return <TraceConsole wallet={wallet} />;
}
