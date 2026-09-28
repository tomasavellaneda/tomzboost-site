import { adminConfigured, adminSessionToken, checkAdminPassword, checkAdminToken } from './admin.mjs'
import { createPixTransaction, getTransaction, mockMarkPaid, providerDetail } from './buckpay.mjs'
import { getConfig } from './config.mjs'
import { issueLicenseKey } from './license.mjs'
import { findSlot, listSlots } from './schedule.mjs'
import { claimSlot, getBooking, listBookings, saveBooking, slotTaken, updateBooking } from './store.mjs'
import { validateBuyer } from './validate.mjs'

const hits = new Map()
const INSTALLER = 'https://github.com/tomasavellaneda/tomz-boost/releases/download/v1.0.2/Tomz-Boost-Setup-1.0.2.exe'

function paidAccess(booking) {
  const paid = booking.status === 'paid' || booking.status === 'paid_overlap'
  if (!paid) return {}
  return {
    downloadUrl: INSTALLER,
    ...(booking.licenseKey ? { licenseKey: booking.licenseKey } : {}),
  }
}

function rateLimit(ip) {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const recent = (hits.get(ip) || []).filter((time) => now - time < windowMs)
  if (recent.length >= 12) {
    hits.set(ip, recent)
    return false
  }
  recent.push(now)
  hits.set(ip, recent)
  return true
}

export function resetRateLimitForTests() {
  hits.clear()
}

function publicBooking(booking, { includePix }) {
  return {
    id: booking.id,
    status: booking.status,
    amountCents: booking.amountCents,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    expiresAt: booking.expiresAt,
    buyer: { name: booking.buyer.name },
    product: booking.product || 'full',
    ...paidAccess(booking),
    ...(includePix && booking.pix
      ? { pix: { code: booking.pix.code, qrcodeBase64: booking.pix.qrcode_base64, mime: booking.pix.mime || 'image/png' } }
      : {}),
  }
}

async function syncPayment(booking) {
  if (booking.status !== 'pending') return booking
  const remote = await getTransaction(booking.id)
  if (!remote || remote.status !== 'paid') return booking
  if (remote.total_amount != null && remote.total_amount !== booking.amountCents) return booking
  const patch = {
    status: 'paid',
    paidAt: new Date().toISOString(),
    buckpayStatus: remote.status,
  }
  if (!booking.licenseKey) patch.licenseKey = issueLicenseKey()
  return updateBooking(booking.id, patch)
}

async function remoteBooking(id) {
  try {
    const remote = await getTransaction(id)
    if (!remote) return { status: 404, body: { error: 'not_found' } }
    const paid = remote.status === 'paid'
    const isApp = id.startsWith('tbapp_')
    return {
      status: 200,
      body: {
        id,
        status: paid ? 'paid' : 'pending',
        amountCents: remote.total_amount ?? null,
        startsAt: null,
        endsAt: null,
        expiresAt: null,
        buyer: { name: '' },
        product: isApp ? 'app' : 'full',
        ...(paid ? { downloadUrl: INSTALLER } : {}),
      },
    }
  } catch {
    return { status: 404, body: { error: 'not_found' } }
  }
}

function adminView(booking) {
  return {
    id: booking.id,
    product: booking.product || 'full',
    status: booking.status,
    amountCents: booking.amountCents,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    paidAt: booking.paidAt || null,
    createdAt: booking.createdAt || null,
    licenseKey: booking.licenseKey || null,
    buyer: {
      name: booking.buyer?.name || '',
      email: booking.buyer?.email || '',
      phone: booking.buyer?.phone || '',
      discord: booking.buyer?.discord || '',
    },
  }
}

export async function dispatch({ method, pathname, body, ip = 'local', authorization = '' }) {
  if (pathname === '/api/admin/login' && method === 'POST') {
    if (!adminConfigured()) return { status: 503, body: { error: 'admin_not_configured' } }
    if (!checkAdminPassword(body?.password)) return { status: 401, body: { error: 'unauthorized' } }
    return { status: 200, body: { token: adminSessionToken() } }
  }

  if (pathname === '/api/admin/bookings' && method === 'GET') {
    if (!adminConfigured() || !checkAdminToken(authorization)) return { status: 401, body: { error: 'unauthorized' } }
    const bookings = (await listBookings())
      .filter((booking) => booking.status === 'paid' || booking.status === 'paid_overlap')
      .map(adminView)
      .sort((a, b) => {
        if (!a.startsAt && !b.startsAt) return String(b.paidAt || '').localeCompare(String(a.paidAt || ''))
        if (!a.startsAt) return -1
        if (!b.startsAt) return 1
        return String(a.startsAt).localeCompare(String(b.startsAt))
      })
    return { status: 200, body: { bookings } }
  }

  if (method === 'GET' && pathname === '/api/booking/config') {
    const config = getConfig()
    let bookings = []
    try {
      bookings = await listBookings()
    } catch {
      bookings = []
    }
    let slots = []
    try {
      slots = listSlots()
    } catch {
      slots = []
    }
    const days = slots.map((day) => ({
      date: day.date,
      weekday: day.weekday,
      slots: day.slots.map((slot) => ({
        ...slot,
        available: !slotTaken(bookings, slot.startsAt),
      })),
    }))
    return {
      status: 200,
      body: {
        amountCents: config.amountCents,
        timezone: config.timezone,
        slotMinutes: config.slotMinutes,
        holdMinutes: config.holdMinutes,
        paymentsReady: config.paymentsReady,
        mock: config.mock,
        appAmountCents: 600,
        days,
      },
    }
  }

  const bookingMatch = pathname.match(/^\/api\/bookings\/([A-Za-z0-9_-]+)$/)
  if (method === 'GET' && bookingMatch) {
    const booking = await getBooking(bookingMatch[1])
    if (!booking) return remoteBooking(bookingMatch[1])
    let current = booking
    if (current.status === 'pending') {
      try {
        current = (await syncPayment(current)) || current
      } catch {
        /* El cliente sigue viendo pending y reintenta. */
      }
    }
    if ((current.status === 'paid' || current.status === 'paid_overlap') && !current.licenseKey) {
      const licenseKey = issueLicenseKey()
      current = (await updateBooking(current.id, { licenseKey })) || { ...current, licenseKey }
    }
    return { status: 200, body: publicBooking(current, { includePix: current.status === 'pending' }) }
  }

  if (method === 'POST' && /^\/api\/bookings\/([A-Za-z0-9_-]+)\/mock-pay$/.test(pathname)) {
    if (!getConfig().mock) return { status: 404, body: { error: 'not_found' } }
    const id = pathname.split('/')[3]
    const booking = await getBooking(id)
    if (!booking) return { status: 404, body: { error: 'not_found' } }
    if (!mockMarkPaid(id)) return { status: 409, body: { error: 'provider_error' } }
    const current = await syncPayment(booking)
    return { status: 200, body: publicBooking(current, { includePix: false }) }
  }

  if (method === 'POST' && pathname === '/api/bookings') {
    if (!rateLimit(ip)) return { status: 429, body: { error: 'rate_limited' } }
    const config = getConfig()
    if (!config.paymentsReady || config.amountCents == null) {
      return { status: 503, body: { error: 'payments_not_configured' } }
    }
    const validated = validateBuyer(body?.buyer)
    if (validated.error) return { status: 400, body: { error: validated.error } }

    const product = body?.product === 'app' ? 'app' : 'full'
    const id = `${product === 'app' ? 'tbapp' : 'tb'}_${crypto.randomUUID().replace(/-/g, '')}`
    const now = new Date()
    const amountCents = product === 'app' ? 600 : config.amountCents
    const booking = {
      id,
      product,
      status: 'pending',
      amountCents,
      startsAt: null,
      endsAt: null,
      buyer: validated.buyer,
      pix: null,
      buckpayId: null,
      createdAt: now.toISOString(),
      expiresAt: null,
    }
    await saveBooking(booking)

    let pix
    try {
      const postbackUrl = config.publicBaseUrl ? `${config.publicBaseUrl}/api/webhooks/buckpay` : ''
      pix = await createPixTransaction({
        externalId: id,
        amountCents,
        buyer: validated.buyer,
        productName: product === 'app' ? 'TOMZ BOOST App' : config.productName,
        postbackUrl,
      })
    } catch (error) {
      await updateBooking(id, { status: 'cancelled' })
      return { status: 502, body: { error: 'provider_error', detail: providerDetail(error) } }
    }

    const saved = await updateBooking(id, { buckpayId: pix.id, pix: pix.pix })
    return { status: 201, body: publicBooking(saved, { includePix: true }) }
  }

  const scheduleMatch = pathname.match(/^\/api\/bookings\/([A-Za-z0-9_-]+)\/schedule$/)
  if (method === 'POST' && scheduleMatch) {
    const slot = findSlot(body?.startsAt)
    if (!slot) return { status: 400, body: { error: 'slot_invalid' } }
    const result = await claimSlot(scheduleMatch[1], slot)
    if (result.error === 'not_found') return { status: 404, body: { error: 'not_found' } }
    if (result.error === 'unpaid') return { status: 409, body: { error: 'unpaid' } }
    if (result.error === 'slot_taken') return { status: 409, body: { error: 'slot_taken' } }
    if (result.error === 'already_scheduled') {
      return { status: 200, body: publicBooking(result.booking, { includePix: false }) }
    }
    return { status: 200, body: publicBooking(result.booking, { includePix: false }) }
  }

  if (method === 'POST' && pathname === '/api/webhooks/buckpay') {
    if (body?.event !== 'transaction.processed' || body?.data?.status !== 'paid') {
      return { status: 200, body: { ok: true } }
    }
    const bookings = await listBookings()
    const booking = bookings.find((item) => item.buckpayId && item.buckpayId === body.data.id)
    if (!booking) return { status: 200, body: { ok: true } }
    try {
      await syncPayment(booking)
    } catch (error) {
      return { status: 502, body: { error: 'provider_error', detail: providerDetail(error) } }
    }
    return { status: 200, body: { ok: true } }
  }

  return null
}

export async function handleNodeRequest(req, res) {
  const host = req.headers.host || 'localhost'
  const url = new URL(req.url || '/', `http://${host}`)
  if (!url.pathname.startsWith('/api/')) return false
  try {
    return await handleApiRequest(req, res, url)
  } catch {
    if (!res.headersSent) send(res, 500, { error: 'server_error' })
    return true
  }
}

async function handleApiRequest(req, res, url) {

  let body = null
  if (req.method === 'POST') {
    const raw = await readBody(req)
    if (raw.length > 32_000) {
      send(res, 413, { error: 'body_too_large' })
      return true
    }
    if (raw.length) {
      try {
        body = JSON.parse(raw.toString('utf8'))
      } catch {
        send(res, 400, { error: 'invalid_json' })
        return true
      }
    }
  }

  const result = await dispatch({
    method: req.method || 'GET',
    pathname: url.pathname,
    searchParams: url.searchParams,
    body,
    ip: req.socket?.remoteAddress || 'local',
    authorization: req.headers.authorization || '',
  })
  if (!result) {
    send(res, 404, { error: 'not_found' })
    return true
  }
  send(res, result.status, result.body)
  return true
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function send(res, status, body) {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(payload)
}
