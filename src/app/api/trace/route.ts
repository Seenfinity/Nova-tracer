import { NextResponse } from "next/server";
import { isLikelyAddress, traceWallet } from "@/lib/trace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { wallet?: string; maxHops?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const wallet = body.wallet?.trim();
  if (!wallet || !isLikelyAddress(wallet)) {
    return NextResponse.json(
      { error: "wallet is missing or not a valid Solana address" },
      { status: 400 },
    );
  }

  const maxHops = Math.min(Math.max(Number(body.maxHops) || 2, 1), 3);

  try {
    const result = await traceWallet(wallet, { maxHops });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "trace failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
