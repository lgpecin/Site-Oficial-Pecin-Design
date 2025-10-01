// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // IMPORTANTe para GitHub Pages (project page):
  base: mode === "production" ? "/Site-Oficial-Pecin-Design/" : "/",

  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Opcional: publica na pasta docs/ (facilita o Pages apontando para main/docs)
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
}));
