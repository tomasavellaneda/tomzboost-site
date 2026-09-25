import { handleNodeRequest } from '../server/api.mjs'

/** Una sola función: Vercel no publica el catch-all en más de un segmento. */
function apiUrl(req) {
  const raw = req.url || '/'
  const queryRoute = req.query?.route
  const route = Array.isArray(queryRoute) ? queryRoute.join('/') : queryRoute
  if (route && !String(route).startsWith('dispatch')) {
    return `/api/${route}`
  }
  if (raw.startsWith('/api/') && !raw.startsWith('/api/dispatch')) return raw
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
