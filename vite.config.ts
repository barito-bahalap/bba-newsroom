import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  // The kit reads import.meta.env at import time, so it must be served as source,
  // not pre-bundled, or the env values are undefined.
  optimizeDeps: {
    exclude: ["@barito-bahalap/supabase"],
  },
});
