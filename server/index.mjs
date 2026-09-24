import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { handleNodeRequest } from './api.mjs'

const port = Number(process.env.PORT || 43123)
const dist = path.join(process.cwd(), 'dist')

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
}

const server = http.createServer(async (req, res) => {
  if (await handleNodeRequest(req, res)) return
  const url = new URL(req.url || '/', 'http://localhost')
  const requested = path.normalize(decodeURIComponent(url.pathname))
  const rel = requested === '/' ? '/index.html' : requested
  const file = path.join(dist, rel)
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const fallback = path.join(dist, 'index.html')
    if (fs.existsSync(fallback)) {
      res.statusCode = 200
      res.setHeader('Content-Type', types['.html'])
      fs.createReadStream(fallback).pipe(res)
      return
    }
    res.statusCode = 404
    res.end('Not found')
    return
  }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
  fs.createReadStream(file).pipe(res)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Tomz Boost escuchando en http://127.0.0.1:${port}`)
})
