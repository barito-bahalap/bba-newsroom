import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Style
import "@barito-bahalap/styles";
import "./styles/app.css";
// App
import App from "./app/App";
import { AuthProvider } from "@/hooks/useAuth";
import { configMissing } from "@/lib/supabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = createRoot(document.getElementById("root") as HTMLElement);

if (configMissing) {
  root.render(
    <div className="card-narrow">
      <h1>Configuration missing</h1>
      <p>
        Set <code>VITE_SUPABASE_URL</code> and{" "}
        <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env</code> (see{" "}
        <code>.env.example</code>) and restart.
      </p>
    </div>,
  );
} else {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}
