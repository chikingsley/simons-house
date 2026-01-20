import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // Vitest runs in a sandboxed environment where `.env.local` may not be readable.
  // Point Vite at an empty env dir during tests to avoid reading ignored env files.
  envDir: mode === "test" ? "test-env" : ".",
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
}));
