import { getConfig } from './config.mjs'

const mockTransactions = new Map()

export function resetBuckpayForTests() {
  mockTransactions.clear()
}

function mockQr() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="#ffffff"/><rect x="16" y="16" width="56" height="56" fill="#111"/><rect x="168" y="16" width="56" height="56" fill="#111"/><rect x="16" y="168" width="56" height="56" fill="#111"/><text x="120" y="128" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#111">PIX TEST</text></svg>'
  return Buffer.from(svg).toString('base64')
}

async function request(path, { method, body }) {
  const config = getConfig()
  const response = await fetch(`${config.apiBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'User-Agent': config.userAgent,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  })
  const text = await response.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { error: { message: 'invalid_response', detail: text.slice(0, 300) } }
    }
  }
  if (!response.ok) {
    const error = new Error('buckpay_error')
    error.status = response.status
    error.payload = payload
    throw error
  }
  return payload
}

export async function createPixTransaction({ externalId, amountCents, buyer, postbackUrl }) {
  const config = getConfig()
  if (config.mock) {
    const id = crypto.randomUUID()
    const tx = {
      id,
      status: 'pending',
      payment_method: 'pix',
      total_amount: amountCents,
      pix: { code: `00020126MOCK${externalId}`, qrcode_base64: mockQr(), mime: 'image/svg+xml' },
    }
    mockTransactions.set(externalId, tx)
    return tx
  }

  const payload = {
    external_id: externalId,
    payment_method: 'pix',
    amount: amountCents,
    buyer: {
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      ...(buyer.document ? { document: buyer.document } : {}),
    },
    product: { name: config.productName },
    offer: config.offerSlug ? { slug: config.offerSlug } : { name: config.productName, quantity: 1 },
    ...(buyer.discord ? { tracking: { sck: `discord:${buyer.discord}` } } : {}),
    ...(postbackUrl ? { postbackUrl } : {}),
  }

  const result = await request('/v1/transactions', { method: 'POST', body: payload })
  const data = result?.data
  if (!data?.id || !data?.pix?.code) {
    const error = new Error('buckpay_error')
    error.status = 502
    error.payload = result
    throw error
  }
  return {
    id: data.id,
    status: data.status || 'pending',
    total_amount: data.total_amount,
    pix: { code: data.pix.code, qrcode_base64: data.pix.qrcode_base64 || '', mime: 'image/png' },
  }
}

export async function getTransaction(externalId) {
  const config = getConfig()
  if (config.mock) {
    const tx = mockTransactions.get(externalId)
    if (!tx) return null
    return { id: tx.id, status: tx.status, total_amount: tx.total_amount }
  }
  try {
    const result = await request(`/v1/transactions/external_id/${encodeURIComponent(externalId)}`, { method: 'GET' })
    return result?.data ?? null
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}

export function mockMarkPaid(externalId) {
  const tx = mockTransactions.get(externalId)
  if (!tx) return false
  tx.status = 'paid'
  return true
}

export function providerDetail(error) {
  const detail = error?.payload?.error?.detail
  const message = error?.payload?.error?.message
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object') {
    const first = Object.values(detail).flat()[0]
    if (typeof first === 'string') return first
  }
  if (typeof message === 'string') return message
  return 'BuckPay no respondió.'
}
