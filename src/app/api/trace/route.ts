import { NextResponse } from "next/server";
import { getHeliusClient } from "@/lib/helius";
import type { TraceResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { wallet, maxHops = 2 } = (await req.json()) as {
    wallet?: string;
    maxHops?: number;
  };

  if (!wallet || typeof wallet !== "string") {
    return NextResponse.json(
      { error: "wallet is required" },
      { status: 400 },
    );
  }

  getHeliusClient();

  const result: TraceResult = {
    rootAddress: wallet,
    nodes: [],
    edges: [],
    generatedAt: Date.now(),
    hopsExplored: maxHops,
  };

  return NextResponse.json(result);
}
