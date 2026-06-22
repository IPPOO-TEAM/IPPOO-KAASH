import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

const FALLBACK_BALANCE = 1845000;

let cached: number | null = null;
const listeners = new Set<(b: number) => void>();

function publish(value: number) {
  cached = value;
  for (const l of listeners) l(value);
}

export async function refreshBalance(): Promise<number> {
  try {
    const { balance } = await api.getBalance();
    publish(balance);
    return balance;
  } catch {
    if (cached == null) publish(FALLBACK_BALANCE);
    return cached ?? FALLBACK_BALANCE;
  }
}

export function useBalance() {
  const [balance, setBalance] = useState<number>(cached ?? FALLBACK_BALANCE);
  const [loading, setLoading] = useState<boolean>(cached == null);

  useEffect(() => {
    listeners.add(setBalance);
    if (cached == null) {
      refreshBalance().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => { listeners.delete(setBalance); };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { await refreshBalance(); } finally { setLoading(false); }
  }, []);

  return { balance, loading, refresh };
}
