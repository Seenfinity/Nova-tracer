"use client";

import { useEffect, useState } from "react";

const KEY = "nova:tracked-wallets:v1";
const MAX_HISTORY = 8;

export type TrackedWallet = {
  address: string;
  tracedAt: number;
  nodeCount: number;
  edgeCount: number;
  cexHits: number;
};

type Store = {
  total: number;
  recent: TrackedWallet[];
};

function read(): Store {
  if (typeof window === "undefined") return { total: 0, recent: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { total: 0, recent: [] };
    const parsed = JSON.parse(raw) as Store;
    if (typeof parsed.total !== "number" || !Array.isArray(parsed.recent)) {
      return { total: 0, recent: [] };
    }
    return parsed;
  } catch {
    return { total: 0, recent: [] };
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event("nova:tracked-changed"));
  } catch {
    /* swallow quota errors */
  }
}

export function recordTrace(entry: TrackedWallet) {
  const store = read();
  const existingIndex = store.recent.findIndex(
    (r) => r.address === entry.address,
  );
  let recent: TrackedWallet[];
  if (existingIndex >= 0) {
    recent = [
      entry,
      ...store.recent.filter((r) => r.address !== entry.address),
    ];
  } else {
    recent = [entry, ...store.recent];
  }
  recent = recent.slice(0, MAX_HISTORY);
  const total =
    existingIndex >= 0 ? store.total : store.total + 1;
  write({ total, recent });
}

export function useTrackedStore(): Store {
  const [store, setStore] = useState<Store>({ total: 0, recent: [] });
  useEffect(() => {
    setStore(read());
    function onChange() {
      setStore(read());
    }
    window.addEventListener("nova:tracked-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("nova:tracked-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return store;
}
