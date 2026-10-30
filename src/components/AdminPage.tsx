import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { MessageKey } from '../i18n/messages'
import { useI18n } from '../i18n/I18nProvider'
import { IconCheck, IconCopy } from './Icons'

type Buyer = { name: string; email: string; phone: string; discord: string }

type Order = {
  id: string
  product: string
  status: string
  amountCents: number | null
  licenseKey: string | null
  paidAt: string | null
  createdAt: string | null
  startsAt: string | null
  endsAt: string | null
  scheduledAt: string | null
  providerStatus: string | null
  buyer: Buyer
}

type Session = {
  id: string
  product: string
  status: string
  startsAt: string
  endsAt: string | null
  licenseKey: string | null
  buyer: Buyer
}

type IssuedKey = {
  id: string
  key: string
  hwid: string | null
  note: string
  createdAt: string
  source: string
}

type Tab = 'agenda' | 'orders' | 'keys'

const TOKEN_KEY = 'tomz-admin-token'

const STATUS_KEYS: Record<string, MessageKey> = {
  paid: 'admin.statusPaid',
  paid_overlap: 'admin.statusPaid',
  pending: 'admin.statusPending',
  expired: 'admin.statusExpired',
  cancelled: 'admin.statusCancelled',
}

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
  const [tab, setTab] = useState<Tab>('agenda')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [keys, setKeys] = useState<IssuedKey[] | null>(null)

  const localeTag = locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-AR'

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* sin storage */
    }
    setToken('')
    setOrders(null)
    setSessions(null)
    setKeys(null)
  }, [])

  const load = useCallback(
    async (authToken: string) => {
      const headers = { Authorization: `Bearer ${authToken}` }
      const responses = await Promise.all([
        fetch('/api/admin/agenda', { headers, cache: 'no-store' }),
        fetch('/api/admin/orders', { headers, cache: 'no-store' }),
        fetch('/api/admin/keys', { headers, cache: 'no-store' }),
      ])
      if (responses.some((response) => response.status === 401)) {
        logout()
        return
      }
      if (!responses.every((response) => response.ok)) {
        setError(t('book.loadError'))
        return
      }
      const [agendaData, ordersData, keysData] = (await Promise.all(responses.map((response) => response.json()))) as [
        { sessions?: Session[] },
        { orders?: Order[] },
        { keys?: IssuedKey[] },
      ]
      setSessions(agendaData.sessions || [])
      setOrders(ordersData.orders || [])
      setKeys(keysData.keys || [])
    },
    [logout, t]
  )

  useEffect(() => {
    if (!token) return
    let cancelled = false
    void load(token).catch(() => {
      if (!cancelled) setError(t('book.loadError'))
    })
    return () => {
      cancelled = true
    }
  }, [token, load, t])

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
      const data = (await response.json()) as { token?: string }
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

  function money(cents: number | null): string {
    if (cents == null) return '—'
    return (cents / 100).toLocaleString(localeTag, { style: 'currency', currency: 'BRL' })
  }

  function day(value: string | null): string {
    if (!value) return t('admin.unscheduled')
    return new Date(value).toLocaleDateString(localeTag, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      timeZone: 'America/Sao_Paulo',
    })
  }

  function clock(value: string | null): string {
    if (!value) return ''
    return new Date(value).toLocaleTimeString(localeTag, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
  }

  function stamp(value: string | null): string {
    if (!value) return '—'
    return new Date(value).toLocaleString(localeTag, {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    })
  }

  function statusLabel(status: string): string {
    const key = STATUS_KEYS[status]
    return key ? t(key) : status
  }

  function productLabel(product: string): string {
    return product === 'app' ? t('admin.productApp') : t('admin.productFull')
  }

  const grouped = groupByDay(sessions || [])

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

      {token && (
        <div className="admin-board">
          <div className="admin-toolbar">
            <nav className="admin-tabs" aria-label={t('admin.title')}>
              {(['agenda', 'orders', 'keys'] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`admin-tab${tab === name ? ' is-active' : ''}`}
                  aria-current={tab === name ? 'page' : undefined}
                  onClick={() => setTab(name)}
                >
                  {t(name === 'agenda' ? 'admin.tabAgenda' : name === 'orders' ? 'admin.tabOrders' : 'admin.tabKeys')}
                  <span className="admin-tab-count">{countFor(name, sessions, orders, keys)}</span>
                </button>
              ))}
            </nav>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                void load(token).catch(() => setError(t('book.loadError')))
              }}
            >
              {t('admin.refresh')}
            </button>
            <button className="button button-secondary" type="button" onClick={logout}>
              {t('admin.logout')}
            </button>
          </div>

          {error && <p className="booking-alert">{error}</p>}

          {tab === 'agenda' && (
            <div className="admin-list">
              {sessions && sessions.length === 0 && <p className="booking-hint">{t('admin.agendaEmpty')}</p>}
              {grouped.map(([date, items]) => (
                <div className="admin-day" key={date}>
                  <h3 className="admin-subtitle">{day(date)}</h3>
                  {items.map((session) => (
                    <article className="admin-row" key={session.id}>
                      <header>
                        <strong>
                          {clock(session.startsAt)}–{clock(session.endsAt)}
                        </strong>
                        <span className="admin-badge">{productLabel(session.product)}</span>
                      </header>
                      <p>
                        {session.buyer.name}
                        {session.buyer.phone ? ` · ${session.buyer.phone}` : ''}
                        {session.buyer.email ? ` · ${session.buyer.email}` : ''}
                        {session.buyer.discord ? ` · ${session.buyer.discord}` : ''}
                      </p>
                      {session.licenseKey && <AdminKey value={session.licenseKey} />}
                    </article>
                  ))}
                </div>
              ))}
            </div>
          )}

          {tab === 'orders' && (
            <div className="admin-list">
              {orders && orders.length === 0 && <p className="booking-hint">{t('admin.ordersEmpty')}</p>}
              {orders?.map((order) => (
                <article className="admin-row" key={order.id}>
                  <header>
                    <strong>{order.buyer.name || t('admin.unscheduled')}</strong>
                    <span className={`admin-status is-${order.status}`}>{statusLabel(order.status)}</span>
                  </header>
                  <p>
                    {productLabel(order.product)} · {money(order.amountCents)} · {stamp(order.createdAt)}
                    {order.startsAt ? ` · ${day(order.startsAt)} ${clock(order.startsAt)}` : ''}
                  </p>
                  <p>
                    {order.buyer.email || '—'}
                    {order.buyer.phone ? ` · ${order.buyer.phone}` : ''}
                    {order.buyer.discord ? ` · ${order.buyer.discord}` : ''}
                  </p>
                  {order.licenseKey ? (
                    <AdminKey value={order.licenseKey} />
                  ) : (
                    <p className="admin-muted">{t('admin.noKey')}</p>
                  )}
                </article>
              ))}
            </div>
          )}

          {tab === 'keys' && (
            <KeysTab
              token={token}
              keys={keys}
              onIssued={(issued) => setKeys((current) => [...issued, ...(current || [])])}
              onError={(message) => setError(message)}
            />
          )}
        </div>
      )}
    </section>
  )
}

function KeysTab({
  token,
  keys,
  onIssued,
  onError,
}: {
  token: string
  keys: IssuedKey[] | null
  onIssued: (keys: IssuedKey[]) => void
  onError: (message: string) => void
}) {
  const { locale, t } = useI18n()
  const [count, setCount] = useState('1')
  const [hwid, setHwid] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const localeTag = locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-AR'

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ count: Number(count) || 1, hwid: hwid.trim(), note: note.trim() }),
      })
      const data = (await response.json()) as { keys?: IssuedKey[] }
      if (!response.ok || !data.keys) {
        onError(t('admin.keyError'))
        return
      }
      onIssued(data.keys)
      setNote('')
    } catch {
      onError(t('admin.keyError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-keys">
      <form className="admin-keyform" onSubmit={submit}>
        <h3>{t('admin.generateTitle')}</h3>
        <p className="admin-muted">{t('admin.generateBody')}</p>
        <div className="admin-keyform-grid">
          <label>
            {t('admin.count')}
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </label>
          <label>
            {t('admin.hwid')}
            <input
              value={hwid}
              onChange={(event) => setHwid(event.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              spellCheck={false}
            />
          </label>
        </div>
        <label>
          {t('admin.note')}
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('admin.noteHint')} />
        </label>
        <p className="admin-muted">{t('admin.hwidHint')}</p>
        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? t('admin.generating') : t('admin.generate')}
        </button>
      </form>

      <div className="admin-list">
        {keys && keys.length === 0 && <p className="booking-hint">{t('admin.keysEmpty')}</p>}
        {keys?.map((entry) => (
          <article className="admin-row" key={entry.id}>
            <header>
              <strong>{entry.note || t('admin.freeKey')}</strong>
              <span className="admin-muted">
                {new Date(entry.createdAt).toLocaleString(localeTag, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                  timeZone: 'America/Sao_Paulo',
                })}
              </span>
            </header>
            <AdminKey value={entry.key} />
            <p className="admin-muted">{entry.hwid ? `${t('admin.boundTo')} ${formatHwid(entry.hwid)}` : t('admin.unbound')}</p>
          </article>
        ))}
      </div>
    </div>
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
        aria-label="copy"
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

function countFor(name: Tab, sessions: Session[] | null, orders: Order[] | null, keys: IssuedKey[] | null): number {
  if (name === 'agenda') return sessions?.length ?? 0
  if (name === 'orders') return orders?.length ?? 0
  return keys?.length ?? 0
}

function formatHwid(compact: string): string {
  const body = compact.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return (body.match(/.{1,4}/g) ?? [body]).join('-')
}

function groupByDay(sessions: Session[]): Array<[string, Session[]]> {
  const buckets = new Map<string, Session[]>()
  for (const session of sessions) {
    const day = new Date(session.startsAt).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const list = buckets.get(day)
    if (list) list.push(session)
    else buckets.set(day, [session])
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b))
}
