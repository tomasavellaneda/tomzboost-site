import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import { BookingPlan, BookingSteps } from './CheckoutChrome'
import { IconCheck } from './Icons'

type Slot = { start: string; startsAt: string; endsAt: string; available: boolean }
type Day = { date: string; weekday: number; slots: Slot[] }
type Config = {
  amountCents: number | null
  timezone: string
  slotMinutes: number
  holdMinutes: number
  paymentsReady: boolean
  mock: boolean
  days: Day[]
}
type Pix = { code: string; qrcodeBase64: string; mime: string }
type Booking = {
  id: string
  status: 'pending' | 'paid' | 'paid_overlap' | 'expired' | 'cancelled'
  amountCents: number
  startsAt: string | null
  endsAt: string | null
  expiresAt: string
  pix?: Pix
}

const ERROR_KEYS: Record<string, MessageKey> = {
  slot_taken: 'book.error.slot_taken',
  slot_invalid: 'book.error.slot_invalid',
  invalid_name: 'book.error.invalid_name',
  invalid_email: 'book.error.invalid_email',
  invalid_phone: 'book.error.invalid_phone',
  invalid_document: 'book.error.invalid_document',
  invalid_discord: 'book.error.invalid_discord',
  payments_not_configured: 'book.error.payments_not_configured',
  provider_error: 'book.error.provider_error',
  rate_limited: 'book.error.rate_limited',
  unpaid: 'book.error.unpaid',
}

function formatBrl(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function BookingSection() {
  const { locale, t } = useI18n()
  const [config, setConfig] = useState<Config | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [date, setDate] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [discord, setDiscord] = useState('')
  const [document, setDocument] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    let attempt = 0

    async function load() {
      while (!cancelled && attempt < 4) {
        attempt += 1
        try {
          const response = await fetch('/api/booking/config', { cache: 'no-store' })
          const data = (await response.json()) as Config
          if (!response.ok || !Array.isArray(data.days)) throw new Error('config')
          if (cancelled) return
          setConfig(data)
          setLoadError(false)
          return
        } catch {
          if (cancelled) return
          if (attempt >= 4) {
            setLoadError(true)
            return
          }
          await new Promise((resolve) => window.setTimeout(resolve, 500 * attempt))
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!booking || booking.status !== 'pending') return
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/bookings/${booking.id}`)
      if (!response.ok) return
      const next = (await response.json()) as Booking
      setBooking((current) => ({ ...next, pix: next.pix ?? current?.pix }))
    }, 4000)
    return () => window.clearInterval(timer)
  }, [booking?.id, booking?.status])

  const day = config?.days.find((item) => item.date === date)
  const slot = day?.slots.find((item) => item.startsAt === startsAt)
  const localeTag = locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-AR'

  const dateLabel = useMemo(() => {
    return (value: string) => {
      const [year, month, dayNum] = value.split('-').map(Number)
      return new Date(Date.UTC(year, month - 1, dayNum, 15)).toLocaleDateString(localeTag, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      })
    }
  }, [localeTag])

  useEffect(() => {
    if (!booking || booking.status !== 'paid' || booking.startsAt) return
    let cancelled = false
    fetch('/api/booking/config')
      .then((response) => response.json() as Promise<Config>)
      .then((data) => {
        if (cancelled) return
        setConfig(data)
        const first = data.days.find((day) => day.slots.some((slot) => slot.available)) ?? data.days[0]
        if (!first) return
        setDate(first.date)
        const open = first.slots.find((slot) => slot.available)
        if (open) setStartsAt(open.startsAt)
      })
      .catch(() => {
        /* La agenda ya cargada sigue visible. */
      })
    return () => {
      cancelled = true
    }
  }, [booking?.id, booking?.status, booking?.startsAt])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer: { name, email, phone, discord, document },
        }),
      })
      const payload = (await response.json()) as Booking & { error?: string; detail?: string }
      if (!response.ok) {
        const key = payload.error ? ERROR_KEYS[payload.error] : undefined
        setError(key ? t(key) : payload.detail || t('book.error.generic'))
        return
      }
      setBooking(payload)
    } catch {
      setError(t('book.error.generic'))
    } finally {
      setBusy(false)
    }
  }

  async function confirmSlot(event: FormEvent) {
    event.preventDefault()
    if (!booking || !startsAt || busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/bookings/${booking.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startsAt }),
      })
      const payload = (await response.json()) as Booking & { error?: string }
      if (!response.ok) {
        const key = payload.error ? ERROR_KEYS[payload.error] : undefined
        setError(key ? t(key) : t('book.error.generic'))
        if (payload.error === 'slot_taken' || payload.error === 'slot_invalid') {
          const fresh = await fetch('/api/booking/config').then((item) => item.json() as Promise<Config>)
          setConfig(fresh)
        }
        return
      }
      setBooking(payload)
    } catch {
      setError(t('book.error.generic'))
    } finally {
      setBusy(false)
    }
  }

  async function simulatePay() {
    if (!booking) return
    setBusy(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}/mock-pay`, { method: 'POST' })
      if (!response.ok) return
      setBooking((await response.json()) as Booking)
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setBooking(null)
    setError('')
    fetch('/api/booking/config')
      .then((response) => response.json() as Promise<Config>)
      .then((data) => {
        setConfig(data)
        const first = data.days.find((item) => item.slots.some((entry) => entry.available))
        if (!first) return
      })
      .catch(() => setLoadError(true))
  }

  const when =
    booking?.startsAt
      ? new Date(booking.startsAt).toLocaleString(localeTag, {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: config?.timezone || 'America/Sao_Paulo',
      })
    : ''

  return (
    <section id="agendar" className="section-block section-shell booking-section">
      <div className="section-heading centered">
        <span>{t('book.eyebrow')}</span>
        <h2>{t('book.title')}</h2>
        <p>{t('book.body')}</p>
      </div>

      {loadError && <p className="booking-alert">{t('book.loadError')}</p>}

      {config && !booking && (
        <form className="booking-card" onSubmit={submit}>
          <BookingSteps step={1} />
          <BookingPlan
            badge={t('services.full.badge')}
            title={t('services.full.title')}
            points={[t('services.full.f1'), t('services.full.f2'), t('services.full.f3')]}
            price={config.amountCents != null ? formatBrl(config.amountCents) : '—'}
            notes={
              <>
                <span>{t('book.tz')}</span>
                <span>{t('book.session')}</span>
              </>
            }
          />

          {!config.paymentsReady && <p className="booking-alert">{t('book.unavailable')}</p>}

          <div className="booking-fields">
            <label>
              {t('book.name')}
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </label>
            <label>
              {t('book.email')}
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
            </label>
            <label>
              {t('book.phone')}
              <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" required />
            </label>
            <label>
              {t('book.discord')} <em>{t('book.optional')}</em>
              <input value={discord} onChange={(event) => setDiscord(event.target.value)} />
            </label>
            <label>
              {t('book.document')} <em>{t('book.optional')}</em>
              <input value={document} onChange={(event) => setDocument(event.target.value)} inputMode="numeric" />
            </label>
          </div>

          {error && <p className="booking-alert">{error}</p>}

          <button className="button button-primary" type="submit" disabled={busy || !config.paymentsReady}>
            {busy ? t('book.submitting') : t('book.submit')}
          </button>
        </form>
      )}

      {booking && booking.status === 'pending' && booking.pix && (
        <div className="booking-card booking-pix">
          <BookingSteps step={2} />
          <div className="booking-pix-head">
            <h3>{t('book.pixTitle')}</h3>
            <p>{formatBrl(booking.amountCents)}</p>
          </div>
          {config?.mock && <p className="booking-alert">{t('book.mock')}</p>}
          <div className="booking-qr">
            <img alt="" src={`data:${booking.pix.mime || 'image/png'};base64,${booking.pix.qrcodeBase64}`} />
          </div>
          <div className="booking-pay-code">
            <p className="booking-code">{booking.pix.code}</p>
            <div className="booking-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(booking.pix?.code || '')
                  setCopied(true)
                }}
              >
                {copied ? t('book.copied') : t('book.copy')}
              </button>
              {config?.mock && (
                <button className="button button-secondary" type="button" onClick={simulatePay} disabled={busy}>
                  {t('book.mockPay')}
                </button>
              )}
            </div>
          </div>
          <p className="booking-hint">{t('book.pixHint')}</p>
          <p className="booking-waiting">{t('book.waiting')}</p>
        </div>
      )}

      {booking && booking.status === 'paid' && !booking.startsAt && config && (
        <form className="booking-card" onSubmit={confirmSlot}>
          <BookingSteps step={3} />
          <h3>{t('book.pickTitle')}</h3>
          <p>{t('book.pickBody')}</p>
          <p>{formatBrl(booking.amountCents)}</p>
          {config.days.length === 0 ? (
            <p className="booking-alert">{t('book.empty')}</p>
          ) : (
            <>
              <fieldset>
                <legend>{t('book.day')}</legend>
                <div className="booking-days">
                  {config.days.map((item) => (
                    <button
                      key={item.date}
                      type="button"
                      className={item.date === date ? 'is-active' : ''}
                      onClick={() => {
                        setDate(item.date)
                        const open = item.slots.find((entry) => entry.available) ?? item.slots[0]
                        if (open) setStartsAt(open.startsAt)
                      }}
                    >
                      {dateLabel(item.date)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>{t('book.time')}</legend>
                <div className="booking-times">
                  {day?.slots.map((item) => {
                    const clock: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
                    const scheduleLabel = new Date(item.startsAt).toLocaleTimeString(localeTag, {
                      ...clock,
                      timeZone: config.timezone,
                    })
                    const local = new Date(item.startsAt).toLocaleTimeString(localeTag, clock)
                    const showLocal = scheduleLabel !== local
                    return (
                      <button
                        key={item.startsAt}
                        type="button"
                        disabled={!item.available}
                        className={item.startsAt === startsAt ? 'is-active' : ''}
                        onClick={() => setStartsAt(item.startsAt)}
                      >
                        {item.start}
                        {showLocal && <small>{local}</small>}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </>
          )}
          {error && <p className="booking-alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={busy || !slot?.available}>
            {busy ? t('book.confirming') : t('book.confirmSlot')}
          </button>
        </form>
      )}

      {booking && booking.startsAt && (booking.status === 'paid' || booking.status === 'paid_overlap') && (
        <div className={`booking-card booking-done${booking.status === 'paid_overlap' ? ' is-overlap' : ''}`}>
          <BookingSteps step={3} done />
          {booking.status === 'paid' && (
            <div className="booking-check" aria-hidden>
              <IconCheck />
            </div>
          )}
          <h3>{t('book.paidTitle')}</h3>
          <p>{when}</p>
          <p>{booking.status === 'paid_overlap' ? t('book.overlap') : t('book.paidBody')}</p>
        </div>
      )}

      {booking && (booking.status === 'expired' || booking.status === 'cancelled') && (
        <div className="booking-card">
          <BookingSteps step={2} />
          <p className="booking-alert">{t('book.expired')}</p>
          <button className="button button-secondary" type="button" onClick={reset}>
            {t('book.retry')}
          </button>
        </div>
      )}
    </section>
  )
}
