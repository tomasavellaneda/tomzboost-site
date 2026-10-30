import fs from 'node:fs'
import path from 'node:path'
import { getConfig } from './config.mjs'
import { command, pipeline, redisConfigured, withLock } from './redis.mjs'

const BOOKING_PREFIX = 'tomz:booking:'
const BOOKING_INDEX = 'tomz:bookings'
const KEY_LOG = 'tomz:keys:log'
const KEY_LOG_FILE = 'keys.json'

let queue = Promise.resolve()
let memory = null
let keyMemory = []
let forceMemory = false

function useRedis() {
  return !forceMemory && redisConfigured()
}

/* ------------------------------------------------------------------ *
 * Backend de archivo: desarrollo local y tests.
 * ------------------------------------------------------------------ */

function filePath() {
  const configured = getConfig().storeFile
  if (configured) return configured
  return path.join(process.cwd(), 'data', 'bookings.json')
}

function withFileLock(fn) {
  const run = queue.then(fn, fn)
  queue = run.then(
    () => {},
    () => {},
  )
  return run
}

function readAll() {
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

function writeAll(bookings) {
  if (memory) {
    memory = bookings
    return
  }
  const file = filePath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(bookings, null, 2))
  fs.renameSync(tmp, file)
}

function keyLogPath() {
  return path.join(path.dirname(filePath()), KEY_LOG_FILE)
}

function readKeyLog() {
  if (memory) return keyMemory
  const file = keyLogPath()
  if (!fs.existsSync(file)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeKeyLog(entries) {
  if (memory) {
    keyMemory = entries
    return
  }
  const file = keyLogPath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(entries, null, 2))
  fs.renameSync(tmp, file)
}

/* ------------------------------------------------------------------ *
 * Backend Redis: producción en Vercel.
 * ------------------------------------------------------------------ */

function bookingKey(id) {
  return `${BOOKING_PREFIX}${id}`
}

function parseJson(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function redisReadAll() {
  const ids = (await command('SMEMBERS', BOOKING_INDEX)) || []
  if (!ids.length) return []
  const [rows] = await pipeline([['MGET', ...ids.map(bookingKey)]])
  return (rows || []).map(parseJson).filter(Boolean)
}

async function redisWrite(booking) {
  await pipeline([
    ['SET', bookingKey(booking.id), JSON.stringify(booking)],
    ['SADD', BOOKING_INDEX, booking.id],
  ])
}

async function redisWriteMany(bookings) {
  if (!bookings.length) return
  const commands = []
  for (const booking of bookings) {
    commands.push(['SET', bookingKey(booking.id), JSON.stringify(booking)])
    commands.push(['SADD', BOOKING_INDEX, booking.id])
  }
  await pipeline(commands)
}

/* ------------------------------------------------------------------ *
 * Capa común.
 * ------------------------------------------------------------------ */

async function readBookings() {
  return useRedis() ? redisReadAll() : readAll()
}

async function persistOne(booking) {
  if (useRedis()) return redisWrite(booking)
  const bookings = readAll()
  const index = bookings.findIndex((item) => item.id === booking.id)
  if (index >= 0) bookings[index] = booking
  else bookings.push(booking)
  writeAll(bookings)
}

async function persistMany(bookings) {
  if (useRedis()) return redisWriteMany(bookings)
  writeAll(bookings)
}

function mutate(fn) {
  if (useRedis()) return withLock(fn)
  return withFileLock(fn)
}

function expire(bookings, now = Date.now()) {
  let changed = false
  const next = bookings.map((booking) => {
    if (booking.status === 'pending' && booking.startsAt && new Date(booking.expiresAt).getTime() <= now) {
      changed = true
      return { ...booking, status: 'expired' }
    }
    return booking
  })
  return { bookings: changed ? next : bookings, changed }
}

export function resetStoreForTests() {
  memory = []
  keyMemory = []
  forceMemory = true
}

export function useFileStore() {
  memory = null
  forceMemory = false
}

export async function listBookings() {
  const bookings = await readBookings()
  const { bookings: next, changed } = expire(bookings)
  if (changed) await persistMany(next)
  return next
}

export async function saveBooking(booking) {
  return mutate(async () => {
    await persistOne(booking)
    return booking
  })
}

export async function claimSlot(id, slot) {
  return mutate(async () => {
    const bookings = await readBookings()
    const index = bookings.findIndex((item) => item.id === id)
    if (index < 0) return { error: 'not_found' }
    const booking = bookings[index]
    if (booking.startsAt) return { error: 'already_scheduled', booking }
    if (booking.status !== 'paid') return { error: 'unpaid' }
    if (slotTaken(bookings, slot.startsAt, id)) return { error: 'slot_taken' }
    const next = {
      ...booking,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      scheduledAt: new Date().toISOString(),
    }
    await persistOne(next)
    return { booking: next }
  })
}

export async function updateBooking(id, patch) {
  return mutate(async () => {
    if (useRedis()) {
      const current = parseJson(await command('GET', bookingKey(id)))
      if (!current) return null
      const next = { ...current, ...patch }
      await redisWrite(next)
      return next
    }
    const bookings = readAll()
    const index = bookings.findIndex((item) => item.id === id)
    if (index < 0) return null
    bookings[index] = { ...bookings[index], ...patch }
    writeAll(bookings)
    return bookings[index]
  })
}

export async function getBooking(id) {
  const bookings = await listBookings()
  return bookings.find((item) => item.id === id) ?? null
}

export function slotTaken(bookings, startsAt, ignoreId) {
  if (!startsAt) return false
  const target = new Date(startsAt).getTime()
  if (Number.isNaN(target)) return false
  return bookings.some((booking) => {
    if (!booking.startsAt || booking.id === ignoreId) return false
    if (booking.status !== 'paid' && booking.status !== 'paid_overlap') return false
    return new Date(booking.startsAt).getTime() === target
  })
}

/* ------------------------------------------------------------------ *
 * Registro de keys emitidas desde el panel.
 * ------------------------------------------------------------------ */

export async function saveIssuedKey(record) {
  if (useRedis()) {
    await pipeline([
      ['LPUSH', KEY_LOG, JSON.stringify(record)],
      ['LTRIM', KEY_LOG, '0', '499'],
    ])
    return record
  }
  const entries = readKeyLog()
  entries.unshift(record)
  writeKeyLog(entries.slice(0, 500))
  return record
}

export async function listIssuedKeys(limit = 200) {
  if (useRedis()) {
    const rows = await command('LRANGE', KEY_LOG, '0', String(Math.max(0, limit - 1)))
    return (rows || []).map(parseJson).filter(Boolean)
  }
  return readKeyLog().slice(0, limit)
}
