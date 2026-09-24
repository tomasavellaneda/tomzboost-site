import { createRequire } from 'node:module'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const { handleNodeRequest } = createRequire(import.meta.url)('./server/api.mjs') as {
  handleNodeRequest: (req: IncomingMessage, res: ServerResponse) => Promise<boolean>
}

function attachBookingApi(middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void) => void }) {
  middlewares.use((req, res, next) => {
    if (!req.url?.startsWith('/api/')) {
      next()
      return
    }
    handleNodeRequest(req, res).catch((error) => next(error))
  })
}

function bookingApi(): Plugin {
  return {
    name: 'booking-api',
    configureServer(server) {
      attachBookingApi(server.middlewares)
    },
    configurePreviewServer(server) {
      attachBookingApi(server.middlewares)
    },
  }
}

export default defineConfig({
  plugins: [react(), bookingApi()],
  server: {
    host: '0.0.0.0',
    port: 43123,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 43123,
    strictPort: true,
  },
})
