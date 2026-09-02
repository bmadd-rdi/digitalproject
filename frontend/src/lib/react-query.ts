// src/lib/react-query.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 4xx errors (auth / not found)
      retry: (failureCount, error: unknown) => {
        const status = error && typeof error === "object" && "status" in error
          ? (error as { status: number }).status
          : undefined;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      staleTime: 1000 * 30, // 30 seconds
    },
    mutations: {
      // Global mutation error is handled per-hook
    },
  },
});
