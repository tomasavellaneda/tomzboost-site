import { useEffect, useState, type FormEvent } from 'react'
import { PRICES } from '../config'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'

type Pix = { code: string; qrcodeBase64: string; mime: string }
type Order = {
  id: string
  status: string
  amountCents: number
  pix?: Pix
  downloadUrl?: string
}

const ERROR_KEYS: Record<string, MessageKey> = {
  invalid_name: 'book.error.invalid_name',
  invalid_email: 'book.error.invalid_email',
  invalid_phone: 'book.error.invalid_phone',
  invalid_document: 'book.error.invalid_document',
  payments_not_configured: 'book.error.payments_not_configured',
  provider_error: 'book.error.provider_error',
  rate_limited: 'book.error.rate_limited',
}

function formatBrl(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function AppCheckout() {
  const { t } = useI18n()
  const [ready, setReady] = useState(false)
  const [mock, setMock] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [document, setDocument] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/booking/config', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return
        setReady(Boolean(data.paymentsReady))
        setMock(Boolean(data.mock))
      })
      .catch(() => {
        if (!cancelled) setReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!order || order.status !== 'pending') return
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/bookings/${order.id}`)
      if (!response.ok) return
      const next = (await response.json()) as Order
      setOrder((current) => ({ ...next, pix: next.pix ?? current?.pix }))
    }, 4000)
    return () => window.clearInterval(timer)
  }, [order?.id, order?.status])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'app', buyer: { name, email, phone, document } }),
      })
      const payload = (await response.json()) as Order & { error?: string; detail?: string }
      if (!response.ok) {
        const key = payload.error ? ERROR_KEYS[payload.error] : undefined
        setError(key ? t(key) : payload.detail || t('book.error.generic'))
        return
      }
      setOrder(payload)
    } catch {
      setError(t('book.error.generic'))
    } finally {
      setBusy(false)
    }
  }

  async function simulatePay() {
    if (!order) return
    setBusy(true)
    try {
      const response = await fetch(`/api/bookings/${order.id}/mock-pay`, { method: 'POST' })
      if (!response.ok) return
      setOrder((await response.json()) as Order)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="comprar" className="section-block section-shell booking-section">
      <div className="section-heading centered">
        <span>{t('appbuy.eyebrow')}</span>
        <h2>{t('appbuy.title')}</h2>
        <p>{t('appbuy.body')}</p>
      </div>

      {!order && (
        <form className="booking-card" onSubmit={submit}>
          <div className="booking-meta">
            <strong>{formatBrl(PRICES.appCents)}</strong>
          </div>
          {!ready && <p className="booking-alert">{t('book.unavailable')}</p>}
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
              {t('book.document')} <em>{t('book.optional')}</em>
              <input value={document} onChange={(event) => setDocument(event.target.value)} inputMode="numeric" />
            </label>
          </div>
          {error && <p className="booking-alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={busy || !ready}>
            {busy ? t('book.submitting') : t('book.submit')}
          </button>
        </form>
      )}

      {order?.status === 'pending' && order.pix && (
        <div className="booking-card booking-pix">
          <h3>{t('book.pixTitle')}</h3>
          <p>{formatBrl(order.amountCents)}</p>
          {mock && <p className="booking-alert">{t('book.mock')}</p>}
          <img alt="PIX" src={`data:${order.pix.mime || 'image/png'};base64,${order.pix.qrcodeBase64}`} />
          <p className="booking-code">{order.pix.code}</p>
          <p>{t('book.pixHint')}</p>
          <div className="booking-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(order.pix?.code || '')
                setCopied(true)
              }}
            >
              {copied ? t('book.copied') : t('book.copy')}
            </button>
            {mock && (
              <button className="button button-secondary" type="button" onClick={simulatePay} disabled={busy}>
                {t('book.mockPay')}
              </button>
            )}
          </div>
          <p className="booking-waiting">{t('book.waiting')}</p>
        </div>
      )}

      {order?.status === 'paid' && (
        <div className="booking-card booking-done">
          <h3>{t('appbuy.paidTitle')}</h3>
          <p>{t('appbuy.paidBody')}</p>
          <a className="button button-primary" href={order.downloadUrl || '/downloads/TomzBoost-Setup.zip'}>
            {t('appbuy.download')}
          </a>
        </div>
      )}
    </section>
  )
}
