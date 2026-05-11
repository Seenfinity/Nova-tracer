import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";

import { isLikelyAddress, traceWallet } from "@/lib/trace";
import { buildSummary, sha256Hex } from "@/lib/report-summary";
import { ReportDocument } from "@/lib/report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { wallet?: string; maxHops?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
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
    const trace = await traceWallet(wallet, { maxHops });
    const summary = buildSummary(trace);

    const canonical = JSON.stringify({
      rootAddress: trace.rootAddress,
      generatedAt: trace.generatedAt,
      nodes: trace.nodes,
      edges: trace.edges,
      hopsExplored: trace.hopsExplored,
    });
    const reportHash = await sha256Hex(canonical);

    const element = createElement(ReportDocument, {
      trace,
      summary,
      reportHash,
    }) as ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(element);

    const filename = `nova-trace-${wallet.slice(0, 8)}-${summary.reportId}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "pdf generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
