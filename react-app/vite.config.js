import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Each scraped dataset JSON  →  its own lazy chunk (keeps main bundle small)
          if (id.includes("dataset_") && id.endsWith(".json")) {
            return "scraped-datasets";
          }
          // Core vendor libraries
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
