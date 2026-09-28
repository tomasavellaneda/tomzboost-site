import { useEffect, useState, type FormEvent } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { IconCheck, IconCopy } from './Icons'

type Row = {
  id: string
  product: string
  status: string
  startsAt: string | null
  endsAt: string | null
  paidAt: string | null
  licenseKey: string | null
  buyer: { name: string; email: string; phone: string; discord: string }
}

const TOKEN_KEY = 'tomz-admin-token'

export function AdminPage() {
  const { locale, t } = useI18n()
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState<Row[] | null>(null)
  const localeTag = locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-AR'

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      .then(async (response) => {
        if (cancelled) return
        if (response.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY)
          setToken('')
          setRows(null)
          return
        }
        const data = (await response.json()) as { bookings?: Row[] }
        setRows(data.bookings || [])
      })
      .catch(() => {
        if (!cancelled) setError(t('book.loadError'))
      })
    return () => {
      cancelled = true
    }
  }, [token, t])

  async function login(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await response.json()) as { token?: string; error?: string }
      if (response.status === 503) {
        setError(t('admin.unconfigured'))
        return
      }
      if (!response.ok || !data.token) {
        setError(t('admin.badPassword'))
        return
      }
      sessionStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setPassword('')
    } catch {
      setError(t('book.loadError'))
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setRows(null)
  }

  function when(row: Row) {
    if (!row.startsAt) return t('admin.unscheduled')
    return new Date(row.startsAt).toLocaleString(localeTag, {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    })
  }

  const optimizations = (rows || []).filter((row) => row.product !== 'app')
  const apps = (rows || []).filter((row) => row.product === 'app')

  return (
    <section className="section-block section-shell booking-section admin-page">
      <div className="section-heading centered">
        <span>TOMZ BOOST</span>
        <h2>{t('admin.title')}</h2>
        <p>{t('admin.body')}</p>
      </div>

      {!token && (
        <form className="booking-card" onSubmit={login}>
          <label>
            {t('admin.password')}
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="booking-alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={busy}>
            {t('admin.enter')}
          </button>
        </form>
      )}

      {token && rows && (
        <div className="admin-board">
          <div className="admin-toolbar">
            <button className="button button-secondary" type="button" onClick={logout}>
              {t('admin.logout')}
            </button>
          </div>
          {optimizations.length === 0 && <p className="booking-hint">{t('admin.empty')}</p>}
          <div className="admin-list">
            {optimizations.map((row) => (
              <article className="admin-row" key={row.id}>
                <header>
                  <strong>{when(row)}</strong>
                  <span>{row.buyer.name}</span>
                </header>
                <p>
                  {row.buyer.phone}
                  {row.buyer.email ? ` · ${row.buyer.email}` : ''}
                  {row.buyer.discord ? ` · ${row.buyer.discord}` : ''}
                </p>
                {row.licenseKey && <AdminKey value={row.licenseKey} />}
              </article>
            ))}
          </div>
          {apps.length > 0 && (
            <>
              <h3 className="admin-subtitle">{t('admin.appTitle')}</h3>
              <div className="admin-list">
                {apps.map((row) => (
                  <article className="admin-row" key={row.id}>
                    <header>
                      <strong>{row.buyer.name}</strong>
                      <span>{row.buyer.email}</span>
                    </header>
                    {row.licenseKey && <AdminKey value={row.licenseKey} />}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}

function AdminKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="receipt-key admin-key">
      <code>{value}</code>
      <button
        className="receipt-copy"
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value)
          setCopied(true)
        }}
      >
        {copied ? <IconCheck /> : <IconCopy />}
      </button>
    </div>
  )
}
