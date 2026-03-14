import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [react()],
  resolve: {
    alias: {
      "@": "../src",
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
