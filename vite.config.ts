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
    // NOTE: do not add custom manualChunks here. Splitting recharts/d3 (and
    // other interdependent vendors) into separate chunks broke module init
    // order in production ("Cannot access 'T' before initialization"),
    // causing a fully blank published site. Vite's default chunking plus the
    // lazy-loaded /admin route already keeps charts off the public page.
  },
}));
