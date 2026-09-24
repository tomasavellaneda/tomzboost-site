import { handleNodeRequest } from '../server/api.mjs'

/** Vercel ejecuta cada ruta /api/* en esta función. El sitio estático sale de `vite build`. */
export default async function handler(req, res) {
  const url = req.url || '/'
  if (!url.startsWith('/api/')) {
    const path = url.startsWith('/') ? url : `/${url}`
    req.url = path.startsWith('/api/') ? path : `/api${path}`
  }
  const handled = await handleNodeRequest(req, res)
  if (!handled && !res.headersSent) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'not_found' }))
  }
}
