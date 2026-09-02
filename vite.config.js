import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Serve swe.notebook.assets as /swe-assets/ static route
    {
      name: 'swe-assets-middleware',
      configureServer(server) {
        const ASSETS_ROOT = path.resolve(import.meta.dirname, 'src/swe.notebook.assets')
        server.middlewares.use('/swe-assets', (req, res, next) => {
          const filePath = path.join(ASSETS_ROOT, req.url)
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase()
            const contentTypes = {
              '.svg': 'image/svg+xml',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.json': 'application/json',
            }
            res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    hmr: {
      // Suppress Vite 8 ErrorOverlay bug: "split is not a function"
      // triggered when err.id is non-string. HMR itself still works.
      overlay: false,
    },
  },
})
