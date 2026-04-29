import type { AddressLabel } from "@/lib/types";

const LABELS: Record<string, AddressLabel> = {
  "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9": {
    name: "Binance Hot Wallet",
    category: "cex",
    confidence: "high",
  },
  "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM": {
    name: "Coinbase Hot Wallet",
    category: "cex",
    confidence: "high",
  },
  "2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S": {
    name: "Kraken Hot Wallet",
    category: "cex",
    confidence: "high",
  },
};

export function getLabel(address: string): AddressLabel | undefined {
  return LABELS[address];
}

export function isKnownCex(address: string): boolean {
  return LABELS[address]?.category === "cex";
}
