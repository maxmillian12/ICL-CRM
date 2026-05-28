"use client";

import { SWRConfig } from "swr";
import { tokenStorage } from "./api-client";

// Global SWR fetcher — attaches JWT to every request
async function fetcher<T>(url: string): Promise<T> {
  const token = tokenStorage.get();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    tokenStorage.clear();
    if (typeof window !== "undefined") window.location.href = "/login?reason=TOKEN_EXPIRED";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

interface SWRProviderProps { children: React.ReactNode; }

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        // Real-time sync: re-fetch every 8 seconds in background
        refreshInterval: 8000,
        // Re-fetch when user switches back to the tab
        revalidateOnFocus: true,
        // Re-fetch when network reconnects
        revalidateOnReconnect: true,
        // Don't refetch on mount if data is fresh (< 4s old)
        dedupingInterval: 4000,
        // Keep showing stale data while fetching
        keepPreviousData: true,
        // Retry failed requests 3 times with exponential backoff
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Optimistic UI: show update immediately, revert on error
        revalidateOnMount: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}

export { fetcher };
