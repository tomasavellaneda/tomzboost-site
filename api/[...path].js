import { handleNodeRequest } from '../server/api.mjs'

/** Vercel ejecuta cada ruta /api/* en esta función. El sitio estático sale de `vite build`. */
function apiUrl(req) {
  const raw = req.url || '/'
  if (raw.startsWith('/api/')) return raw
  const queryPath = req.query?.path
  const segments = Array.isArray(queryPath) ? queryPath.join('/') : queryPath
  if (segments) {
    const search = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
    return `/api/${segments}${search}`
  }
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return path.startsWith('/api/') ? path : `/api${path}`
}

export default async function handler(req, res) {
  req.url = apiUrl(req)
  const handled = await handleNodeRequest(req, res)
  if (!handled && !res.headersSent) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'not_found' }))
  }
}
