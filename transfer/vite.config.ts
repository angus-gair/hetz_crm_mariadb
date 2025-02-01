import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { themeConfig } from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    themeConfig(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
