import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Silently swallow or print clean minimal warnings for common socket resets/disconnects
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
              console.warn(`[Vite Proxy] Backend offline or reset connection (${err.code})`);
            } else {
              console.error('[Vite Proxy Error]', err);
            }
          });
        }
      }
    }
  }
})
