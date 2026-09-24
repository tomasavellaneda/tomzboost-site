import fs from 'node:fs'
import path from 'node:path'
import { getConfig } from './config.mjs'

let queue = Promise.resolve()
let memory = null

function filePath() {
  const configured = getConfig().storeFile
  if (configured) return configured
  return path.join(process.cwd(), 'data', 'bookings.json')
}

function withLock(fn) {
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
}

export function useFileStore() {
  memory = null
}

export async function listBookings() {
  return withLock(async () => {
    const { bookings, changed } = expire(readAll())
    if (changed) writeAll(bookings)
    return bookings
  })
}

export async function saveBooking(booking) {
  return withLock(async () => {
    const { bookings } = expire(readAll())
    bookings.push(booking)
    writeAll(bookings)
    return booking
  })
}

export async function claimSlot(id, slot) {
  return withLock(async () => {
    const { bookings } = expire(readAll())
    const index = bookings.findIndex((item) => item.id === id)
    if (index < 0) return { error: 'not_found' }
    const booking = bookings[index]
    if (booking.startsAt) return { error: 'already_scheduled', booking }
    if (booking.status !== 'paid') return { error: 'unpaid' }
    if (slotTaken(bookings, slot.startsAt, id)) return { error: 'slot_taken' }
    bookings[index] = {
      ...booking,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      scheduledAt: new Date().toISOString(),
    }
    writeAll(bookings)
    return { booking: bookings[index] }
  })
}

export async function updateBooking(id, patch) {
  return withLock(async () => {
    const { bookings } = expire(readAll())
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
