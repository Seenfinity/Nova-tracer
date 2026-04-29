import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { NarrationRequest, NarrationResponse } from "@/lib/types";

export const runtime = "nodejs";

let client: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  client = new Anthropic({ apiKey });
  return client;
}

export async function POST(req: Request) {
  const body = (await req.json()) as NarrationRequest;
  if (!body?.trace?.rootAddress) {
    return NextResponse.json({ error: "trace is required" }, { status: 400 });
  }

  getAnthropic();

  const placeholder: NarrationResponse = {
    narrative:
      "AI narration not yet implemented — wired up in a follow-up commit.",
    keyFindings: [],
  };

  return NextResponse.json(placeholder);
}
