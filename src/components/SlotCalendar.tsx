import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'

type Slot = { start: string; startsAt: string; endsAt: string; available: boolean }
export type CalendarDay = { date: string; weekday: number; slots: Slot[] }

function weekStartsOn(localeTag: string) {
  try {
    const locale = new Intl.Locale(localeTag) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
    }
    const first = locale.getWeekInfo?.().firstDay ?? 1
    return first === 7 ? 0 : first
  } catch {
    return localeTag.startsWith('pt') || localeTag.startsWith('en') ? 0 : 1
  }
}

function addMonths(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 + 1 }
}

function monthOf(iso: string) {
  const [year, month] = iso.split('-').map(Number)
  return { year, month }
}

function formatInUtc(iso: string, localeTag: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(localeTag, {
    ...options,
    timeZone: 'UTC',
  })
}

export function SlotCalendar({
  days,
  date,
  localeTag,
  timezone,
  onSelect,
}: {
  days: CalendarDay[]
  date: string
  localeTag: string
  timezone: string
  onSelect: (day: CalendarDay) => void
}) {
  const { t } = useI18n()
  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days])
  const selectedMonth = monthOf(date || days[0]?.date || '2026-01-01')
  const [browse, setBrowse] = useState<{ year: number; month: number } | null>(null)
  const cursor =
    browse && (browse.year !== selectedMonth.year || browse.month !== selectedMonth.month) ? browse : selectedMonth

  const startDow = weekStartsOn(localeTag)
  const labels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const jsDay = (startDow + index) % 7
        return new Intl.DateTimeFormat(localeTag, { weekday: 'narrow', timeZone: 'UTC' }).format(
          new Date(Date.UTC(2024, 0, 7 + jsDay)),
        )
      }),
    [localeTag, startDow],
  )

  const cells = useMemo(() => {
    const firstDow = new Date(Date.UTC(cursor.year, cursor.month - 1, 1)).getUTCDay()
    const lead = (firstDow - startDow + 7) % 7
    const count = new Date(Date.UTC(cursor.year, cursor.month, 0)).getUTCDate()
    const items: Array<{ date: string; dayNum: number } | null> = Array.from({ length: lead }, () => null)
    for (let dayNum = 1; dayNum <= count; dayNum += 1) {
      const iso = `${cursor.year}-${String(cursor.month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      items.push({ date: iso, dayNum })
    }
    return items
  }, [cursor, startDow])

  const bookable = useMemo(() => {
    const keys = new Set<number>()
    for (const day of days) {
      const month = monthOf(day.date)
      keys.add(month.year * 12 + month.month)
    }
    return keys
  }, [days])

  const currentKey = cursor.year * 12 + cursor.month
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const title = formatInUtc(`${cursor.year}-${String(cursor.month).padStart(2, '0')}-01`, localeTag, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="slot-calendar">
      <div className="slot-calendar-head">
        <button
          type="button"
          aria-label={t('book.prevMonth')}
          disabled={![...bookable].some((key) => key < currentKey)}
          onClick={() => setBrowse(addMonths(cursor.year, cursor.month, -1))}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>
        <strong>{title}</strong>
        <button
          type="button"
          aria-label={t('book.nextMonth')}
          disabled={![...bookable].some((key) => key > currentKey)}
          onClick={() => setBrowse(addMonths(cursor.year, cursor.month, 1))}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="slot-calendar-week" aria-hidden>
        {labels.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="slot-calendar-grid" role="grid" aria-label={t('book.day')}>
        {cells.map((cell, index) => {
          if (!cell) return <span key={`empty-${index}`} />
          const day = byDate.get(cell.date)
          const open = day?.slots.some((slot) => slot.available) ?? false
          const selected = cell.date === date
          return (
            <button
              key={cell.date}
              type="button"
              role="gridcell"
              disabled={!open}
              aria-pressed={selected}
              aria-label={formatInUtc(cell.date, localeTag, { weekday: 'long', day: 'numeric', month: 'long' })}
              className={[selected ? 'is-active' : '', open ? 'is-open' : '', cell.date === today ? 'is-today' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (day) onSelect(day)
              }}
            >
              {cell.dayNum}
            </button>
          )
        })}
      </div>
    </div>
  )
}
