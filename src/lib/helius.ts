import { Helius } from "helius-sdk";

let client: Helius | null = null;

export function getHeliusClient(): Helius {
  if (client) return client;
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error("HELIUS_API_KEY is not set");
  }
  client = new Helius(apiKey);
  return client;
}
