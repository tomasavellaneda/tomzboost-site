import { createRequire } from 'node:module'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const { handleNodeRequest } = createRequire(import.meta.url)('./server/api.mjs') as {
  handleNodeRequest: (req: IncomingMessage, res: ServerResponse) => Promise<boolean>
}

function bookingApi(): Plugin {
  return {
    name: 'booking-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next()
          return
        }
        try {
          await handleNodeRequest(req, res)
        } catch (error) {
          next(error)
        }
      })
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
