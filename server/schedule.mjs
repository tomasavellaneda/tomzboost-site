import { getConfig } from './config.mjs'

const WEEKDAY_TO_ISO = { Sun: 7, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function zonedParts(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  })
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]))
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour === '24' ? '00' : parts.hour,
    minute: parts.minute,
    weekday: WEEKDAY_TO_ISO[parts.weekday] ?? 0,
    date: `${parts.year}-${parts.month}-${parts.day}`,
  }
}

/** Convierte una hora de pared en `timeZone` a un Date UTC. */
export function zonedTimeToUtc(dateStr, timeStr, timeZone) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0)
  for (let i = 0; i < 4; i += 1) {
    const parts = zonedParts(new Date(utc), timeZone)
    const asUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute))
    const target = Date.UTC(year, month - 1, day, hour, minute)
    const delta = target - asUtc
    if (delta === 0) break
    utc += delta
  }
  return new Date(utc)
}

function parseClock(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return hour * 60 + minute
}

export function listSlots(now = new Date(), config = getConfig()) {
  const startMin = parseClock(config.start)
  const endMin = parseClock(config.end)
  if (startMin == null || endMin == null || endMin <= startMin) return []

  const today = zonedParts(now, config.timezone)
  const cursor = zonedTimeToUtc(today.date, '12:00', config.timezone)
  const leadMs = config.leadHours * 60 * 60 * 1000
  const days = []

  for (let i = 0; i < config.horizonDays + 1; i += 1) {
    const probe = new Date(cursor.getTime() + i * 24 * 60 * 60 * 1000)
    const parts = zonedParts(probe, config.timezone)
    if (!config.days.includes(parts.weekday)) continue
    const slots = []
    for (let minute = startMin; minute + config.slotMinutes <= endMin; minute += config.slotMinutes) {
      const hh = String(Math.floor(minute / 60)).padStart(2, '0')
      const mm = String(minute % 60).padStart(2, '0')
      const startsAt = zonedTimeToUtc(parts.date, `${hh}:${mm}`, config.timezone)
      if (startsAt.getTime() < now.getTime() + leadMs) continue
      slots.push({
        start: `${hh}:${mm}`,
        startsAt: startsAt.toISOString(),
        endsAt: new Date(startsAt.getTime() + config.slotMinutes * 60 * 1000).toISOString(),
      })
    }
    if (slots.length) days.push({ date: parts.date, weekday: parts.weekday, slots })
    if (days.length >= config.horizonDays) break
  }

  return days
}

export function findSlot(startsAt, now = new Date(), config = getConfig()) {
  const target = new Date(startsAt).getTime()
  if (Number.isNaN(target)) return null
  for (const day of listSlots(now, config)) {
    const slot = day.slots.find((item) => new Date(item.startsAt).getTime() === target)
    if (slot) return { ...slot, date: day.date }
  }
  return null
}
