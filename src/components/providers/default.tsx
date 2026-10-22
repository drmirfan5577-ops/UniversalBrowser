import { Toaster } from "sonner";
import { QueryClientProvider } from "./query-client.tsx";

export function DefaultProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <Toaster position="top-center" richColors />
      {children}
    </QueryClientProvider>
  );
}
