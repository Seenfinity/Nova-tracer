import type { HeliusEnhancedTx } from "@/lib/types";

const BASE_URL = "https://api.helius.xyz/v0";

function getApiKey(): string {
  const key = process.env.HELIUS_API_KEY;
  if (!key) throw new Error("HELIUS_API_KEY is not set");
  return key;
}

export async function getEnhancedTransactions(
  address: string,
  opts: { limit?: number; before?: string } = {},
): Promise<HeliusEnhancedTx[]> {
  const params = new URLSearchParams({
    "api-key": getApiKey(),
    limit: String(opts.limit ?? 100),
  });
  if (opts.before) params.set("before", opts.before);

  const url = `${BASE_URL}/addresses/${address}/transactions?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Helius getEnhancedTransactions ${res.status}: ${await res.text()}`,
    );
  }
  return (await res.json()) as HeliusEnhancedTx[];
}
