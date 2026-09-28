import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** Igual que la app de escritorio. La clave sale de acá; no hay llamada al bot. */
const LICENSE_SECRET = 'tomz-boost-license-v1-7f3c9a1e4b8d2065'
const UNBOUND = 'UNBOUND'

export function normalizeHwid(raw) {
  return String(raw ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

function formatKey(body) {
  const chunks = body.match(/.{1,4}/g) ?? [body]
  return `TOMZ-${chunks.join('-')}`
}

function sign(id, tag) {
  return createHmac('sha256', LICENSE_SECRET)
    .update(Buffer.concat([id, Buffer.from(`|${tag}`, 'utf8')]))
    .digest()
    .subarray(0, 3)
}

export function generateLicenseKey(hwid) {
  const id = randomBytes(5)
  const tag = normalizeHwid(hwid) || UNBOUND
  return formatKey(Buffer.concat([id, sign(id, tag)]).toString('hex').toUpperCase())
}

export function isValidLicenseKey(raw, hwid) {
  const compact = String(raw ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  if (!compact.startsWith('TOMZ')) return false
  const hex = compact.slice(4)
  if (!/^[0-9A-F]{16}$/.test(hex)) return false
  const bytes = Buffer.from(hex, 'hex')
  const id = bytes.subarray(0, 5)
  const sig = bytes.subarray(5, 8)
  const candidates = [UNBOUND]
  const bound = normalizeHwid(hwid)
  if (bound) candidates.push(bound)
  return candidates.some((tag) => {
    const expected = sign(id, tag)
    return expected.length === sig.length && timingSafeEqual(expected, sig)
  })
}

/** Clave de la app, sin atar a un equipo. Se guarda una sola vez en el pedido. */
export function issueLicenseKey() {
  return generateLicenseKey()
}
