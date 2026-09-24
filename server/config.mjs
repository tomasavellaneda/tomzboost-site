/** Configuración de agenda y BuckPay. Se lee en cada llamada para poder testear. */
export function getConfig() {
  const amountRaw = process.env.BOOKING_AMOUNT_CENTS?.trim() ?? ''
  const amountCents = amountRaw === '' ? null : Number(amountRaw)
  const token = process.env.BUCKPAY_TOKEN?.trim() ?? ''
  const userAgent = process.env.BUCKPAY_USER_AGENT?.trim() ?? ''
  const mock = process.env.BUCKPAY_MOCK === '1'
  const amountOk = Number.isInteger(amountCents) && amountCents >= 600 && amountCents <= 300000

  return {
    apiBase: (process.env.BUCKPAY_API_BASE || 'https://api.realtechdev.com.br').replace(/\/$/, ''),
    token,
    userAgent,
    mock,
    amountCents: amountOk ? amountCents : null,
    paymentsReady: amountOk && (mock || (token.length === 40 && userAgent.length > 0)),
    offerSlug: process.env.BOOKING_OFFER_SLUG?.trim() || '',
    productName: process.env.BOOKING_PRODUCT_NAME?.trim() || 'Otimização completa TOMZ BOOST',
    publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, ''),
    timezone: process.env.SCHEDULE_TZ || 'America/Sao_Paulo',
    days: parseDays(process.env.SCHEDULE_DAYS || '1,2,3,4,5,6'),
    start: process.env.SCHEDULE_START || '14:00',
    end: process.env.SCHEDULE_END || '22:00',
    slotMinutes: clampInt(process.env.SLOT_MINUTES, 60, 30, 180),
    holdMinutes: clampInt(process.env.HOLD_MINUTES, 20, 5, 120),
    leadHours: clampInt(process.env.LEAD_HOURS, 3, 0, 72),
    horizonDays: clampInt(process.env.HORIZON_DAYS, 14, 1, 60),
    storeFile: process.env.BOOKINGS_FILE || '',
  }
}

function clampInt(raw, fallback, min, max) {
  const n = Number(raw)
  if (!Number.isInteger(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function parseDays(raw) {
  const days = raw
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7)
  return days.length ? days : [1, 2, 3, 4, 5, 6]
}
