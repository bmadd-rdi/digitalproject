"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { ReactNode } from "react";

/**
 * Providers — wraps the app with all client-side context providers.
 * Kept separate from layout.tsx so the root layout stays a Server Component.
 */
 export function Providers({ children }: { children: ReactNode }) {
   return (
     <QueryClientProvider client={queryClient}>
       {children}
     </QueryClientProvider>
   );
 }
