import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backend = "http://localhost:3001";

export default defineConfig(({ mode }) => {
  const fromFiles = loadEnv(mode, __dirname, "");
  const backendUrl =
    fromFiles.VITE_BACKEND_URL?.trim() || process.env.VITE_BACKEND_URL?.trim();
  if (mode === "production" && !backendUrl) {
    throw new Error(
      "Missing VITE_BACKEND_URL for production. Add client/.env.production with VITE_BACKEND_URL=https://your-app.fly.dev (no trailing slash), or pass it in CI before npm run build."
    );
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": backend,
        "/socket.io": {
          target: backend,
          ws: true,
          changeOrigin: true,
          configure(proxy) {
            proxy.on("error", (err: NodeJS.ErrnoException) => {
              if (err.code === "ECONNREFUSED") {
                console.warn("[vite] Backend not running? Start it with: cd server && npm run dev");
              } else if (err.code === "EPIPE") {
                // Benign: connection closed (e.g. backend restarted or client disconnected)
              } else {
                console.warn("[vite] Proxy error:", err.message);
              }
            });
          },
        },
      },
    },
  };
});
