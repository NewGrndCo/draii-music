import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vendor chunk splitting keeps the initial JS small. Heavy libraries
        // that are only used by lazy routes (recharts in /admin, etc.) get
        // their own chunks so the public home page never downloads them.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("react-router") || id.includes("scheduler") || id.includes("react-dom") || id.includes("/react/")) return "react";
          return "vendor";
        },
      },
    },
  },
}));
