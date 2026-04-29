export type AddressLabel = {
  name: string;
  category: "cex" | "mixer" | "bridge" | "defi" | "scammer" | "unknown";
  confidence: "high" | "medium" | "low";
};

export type TraceNode = {
  id: string;
  address: string;
  label?: AddressLabel;
  depth: number;
  totalIn: number;
  totalOut: number;
};

export type TraceEdge = {
  source: string;
  target: string;
  amount: number;
  signature: string;
  timestamp: number;
  token: string;
};

export type TraceResult = {
  rootAddress: string;
  nodes: TraceNode[];
  edges: TraceEdge[];
  generatedAt: number;
  hopsExplored: number;
};

export type NarrationRequest = {
  trace: TraceResult;
};

export type NarrationResponse = {
  narrative: string;
  keyFindings: string[];
};

export type HeliusNativeTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
};

export type HeliusTokenTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
};

export type HeliusEnhancedTx = {
  signature: string;
  timestamp: number;
  type?: string;
  source?: string;
  fee?: number;
  feePayer?: string;
  nativeTransfers?: HeliusNativeTransfer[];
  tokenTransfers?: HeliusTokenTransfer[];
};
