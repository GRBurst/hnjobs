import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import preload from 'vite-plugin-preload'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), preload()],
  assetsInclude: ['/comments.json'],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
