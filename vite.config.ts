import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    allowedHosts: ["school-directory.llf.org.in"],
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: "https://api.school-directory.llf.org.in", // Your backend URL
              changeOrigin: true,
              secure: false,
              credentials: "include",
            },
          }
        : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
