import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import webpush from 'web-push'
import { getConfig } from './config.mjs'
import { command, pipeline, redisConfigured } from './redis.mjs'

const PREFIX = 'tomz:push:'
const INDEX = 'tomz:push:index'
const FILE = 'push-subscriptions.json'

let memory = null
let forceMemory = false

function redisEnabled() {
  return !forceMemory && redisConfigured()
}

function storeDir() {
  const configured = getConfig().storeFile
  if (configured) return path.dirname(configured)
  return path.join(process.cwd(), 'data')
}

function filePath() {
  return path.join(storeDir(), FILE)
}

function storageKey(endpoint) {
  return `${PREFIX}${createHash('sha256').update(endpoint).digest('hex')}`
}

function parseJson(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ *
 * Backend de archivo: desarrollo local y tests.
 * ------------------------------------------------------------------ */

function readFileAll() {
  if (memory) return memory
  const file = filePath()
  if (!fs.existsSync(file)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeFileAll(subscriptions) {
  if (memory) {
    memory = subscriptions
    return
  }
  const file = filePath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(subscriptions, null, 2))
  fs.renameSync(tmp, file)
}

/* ------------------------------------------------------------------ *
 * VAPID.
 * ------------------------------------------------------------------ */

export function vapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim() || ''
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || ''
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:tomzboost@tomzboost.online'
  if (!publicKey || !privateKey) return null
  return { publicKey, privateKey, subject }
}

export function pushConfigured() {
  return Boolean(vapidConfig())
}

export function pushPublicKey() {
  return vapidConfig()?.publicKey || ''
}

/* ------------------------------------------------------------------ *
 * Suscripciones.
 * ------------------------------------------------------------------ */

export function isValidPushSubscription(subscription) {
  if (!subscription || typeof subscription !== 'object') return false
  const endpoint = subscription.endpoint
  if (typeof endpoint !== 'string' || endpoint.length < 12 || endpoint.length > 4096) return false
  try {
    const url = new URL(endpoint)
    if (url.protocol !== 'https:') return false
  } catch {
    return false
  }
  const keys = subscription.keys
  return Boolean(
    keys &&
      typeof keys === 'object' &&
      typeof keys.p256dh === 'string' &&
      keys.p256dh.length > 0 &&
      typeof keys.auth === 'string' &&
      keys.auth.length > 0,
  )
}

/** Guarda (o actualiza) una suscripción. La clave es el sha256 del endpoint. */
export async function savePushSubscription(subscription) {
  const record = { ...subscription, savedAt: new Date().toISOString() }
  const key = storageKey(subscription.endpoint)
  if (redisEnabled()) {
    await pipeline([
      ['SET', key, JSON.stringify(record)],
      ['SADD', INDEX, key],
    ])
    return record
  }
  const all = readFileAll()
  const index = all.findIndex((item) => item?.endpoint === subscription.endpoint)
  if (index >= 0) all[index] = record
  else all.push(record)
  writeFileAll(all)
  return record
}

export async function listPushSubscriptions() {
  if (!redisEnabled()) return readFileAll()
  const keys = (await command('SMEMBERS', INDEX)) || []
  if (!keys.length) return []
  const rows = (await command('MGET', ...keys)) || []
  return rows.map(parseJson).filter(Boolean)
}

export async function countPushSubscriptions() {
  if (redisEnabled()) {
    const count = await command('SCARD', INDEX)
    return Number(count) || 0
  }
  return readFileAll().length
}

async function removePushSubscriptionKeys(keys) {
  if (!keys.length) return
  if (redisEnabled()) {
    const commands = []
    for (const key of keys) {
      commands.push(['DEL', key])
      commands.push(['SREM', INDEX, key])
    }
    await pipeline(commands)
    return
  }
  const endpoints = new Set(keys)
  writeFileAll(readFileAll().filter((item) => !endpoints.has(storageKey(item?.endpoint))))
}

export async function removePushSubscription(endpoint) {
  if (typeof endpoint !== 'string' || !endpoint) return
  await removePushSubscriptionKeys([storageKey(endpoint)])
}

export function resetPushForTests() {
  memory = []
  forceMemory = true
}

/* ------------------------------------------------------------------ *
 * Envío.
 * ------------------------------------------------------------------ */

function money(cents) {
  if (!Number.isFinite(cents)) return ''
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}

function productLabel(product) {
  return product === 'app' ? 'App Tomz Boost' : 'Optimización 1 a 1'
}

function scheduleLabel(startsAt) {
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) return String(startsAt)
  try {
    const formatted = new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: getConfig().timezone,
    }).format(date)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  } catch {
    return date.toISOString()
  }
}

/**
 * Manda un payload a todas las suscripciones. Nunca lanza: los errores de
 * envío se cuentan y las suscripciones vencidas (404/410) se borran.
 */
export async function sendPushToAll(payload) {
  const config = vapidConfig()
  let subscriptions = []
  try {
    subscriptions = await listPushSubscriptions()
  } catch {
    return { sent: 0, failed: 0, configured: Boolean(config), subscriptions: 0 }
  }
  if (!config || !subscriptions.length) {
    return { sent: 0, failed: 0, configured: Boolean(config), subscriptions: subscriptions.length }
  }

  try {
    webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey)
  } catch {
    return { sent: 0, failed: 0, configured: true, subscriptions: subscriptions.length }
  }
  const body = JSON.stringify(payload)
  let sent = 0
  let failed = 0
  const gone = []

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, body, { TTL: 3600, timeout: 5000 })
        sent += 1
      } catch (error) {
        failed += 1
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          gone.push(storageKey(subscription.endpoint))
        }
      }
    }),
  )

  if (gone.length) {
    try {
      await removePushSubscriptionKeys(gone)
    } catch {
      /* La limpieza no debe afectar al pago ni a la reserva. */
    }
  }

  return { sent, failed, configured: true, subscriptions: subscriptions.length }
}

export async function notifyPayment(booking) {
  const name = booking?.buyer?.name || 'Cliente'
  return sendPushToAll({
    title: 'Venta confirmada',
    body: `${productLabel(booking?.product)} · ${money(booking?.amountCents)} · ${name}`,
    url: '/admin',
    tag: `sale-${booking?.id || Date.now()}`,
  })
}

export async function notifySchedule(booking) {
  const name = booking?.buyer?.name || 'Cliente'
  return sendPushToAll({
    title: 'Sesión agendada',
    body: `${scheduleLabel(booking?.startsAt)} · ${name}`,
    url: '/admin',
    tag: `session-${booking?.id || Date.now()}`,
  })
}
