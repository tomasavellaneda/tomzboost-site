/**
 * Cliente mínimo para Upstash Redis vía API REST. Sin dependencias.
 *
 * Las variables las inyecta la integración de Upstash en Vercel. Se aceptan
 * también los nombres viejos de Vercel KV para no atarse a uno solo.
 */

function config() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/+$/, '')
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || ''
  return url && token ? { url, token } : null
}

export function redisConfigured() {
  return Boolean(config())
}

async function post(path, body) {
  const cfg = config()
  if (!cfg) throw new Error('redis_not_configured')
  const response = await fetch(`${cfg.url}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`redis_http_${response.status}`)
  return response.json()
}

/** Ejecuta varios comandos en una sola ida y vuelta. Devuelve solo los resultados. */
export async function pipeline(commands) {
  if (!commands.length) return []
  const data = await post('/pipeline', commands)
  const items = Array.isArray(data) ? data : []
  return items.map((item) => {
    if (item && item.error) throw new Error(`redis_${item.error}`)
    return item?.result ?? null
  })
}

export async function command(...args) {
  const [result] = await pipeline([args])
  return result
}

const RELEASE = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end"

/**
 * Lock distribuido simple. Si no consigue el lock en el tiempo previsto, corre
 * igual: preferimos un riesgo mínimo de carrera antes que fallar una compra.
 */
export async function withLock(fn, { key = 'tomz:store:lock', ttlMs = 5000, tries = 40, waitMs = 75 } = {}) {
  const token = globalThis.crypto.randomUUID()
  for (let attempt = 0; attempt < tries; attempt++) {
    let acquired = false
    try {
      acquired = (await command('SET', key, token, 'NX', 'PX', String(ttlMs))) === 'OK'
    } catch {
      return fn()
    }
    if (acquired) {
      try {
        return await fn()
      } finally {
        try {
          await command('EVAL', RELEASE, '1', key, token)
        } catch {
          await command('DEL', key).catch(() => {})
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  return fn()
}
