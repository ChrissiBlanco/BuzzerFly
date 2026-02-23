import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = "http://localhost:3001";

export default defineConfig({
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
});
