import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import preload from 'vite-plugin-preload';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        format: "esm",
      },
    },
  },
  base: "/hnjobs/",
  plugins: [react(), preload()],
  worker: {
    format: 'es',
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
