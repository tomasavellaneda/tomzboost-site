import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { dispatch, resetRateLimitForTests } from './api.mjs'
import { resetBuckpayForTests } from './buckpay.mjs'
import { resetStoreForTests } from './store.mjs'
import { normalizePhone, validateBuyer } from './validate.mjs'

const buyer = {
  name: 'Ana Souza',
  email: 'ana@example.com',
  phone: '11999998888',
  document: '10233019111',
  discord: 'ana#1',
}

beforeEach(() => {
  process.env.BUCKPAY_MOCK = '1'
  process.env.BOOKING_AMOUNT_CENTS = '15000'
  process.env.BUCKPAY_TOKEN = ''
  process.env.BUCKPAY_USER_AGENT = ''
  process.env.PUBLIC_BASE_URL = ''
  process.env.SCHEDULE_TZ = 'America/Sao_Paulo'
  process.env.SCHEDULE_DAYS = '1,2,3,4,5,6,7'
  process.env.SCHEDULE_START = '00:00'
  process.env.SCHEDULE_END = '23:00'
  process.env.SLOT_MINUTES = '60'
  process.env.HOLD_MINUTES = '20'
  process.env.LEAD_HOURS = '1'
  process.env.HORIZON_DAYS = '3'
  resetStoreForTests()
  resetBuckpayForTests()
  resetRateLimitForTests()
})

afterEach(() => {
  delete process.env.BUCKPAY_MOCK
})

test('normaliza teléfono brasileño a 55 + DDD', () => {
  assert.equal(normalizePhone('(11) 99999-8888'), '5511999998888')
  assert.equal(normalizePhone('5511999998888'), '5511999998888')
  assert.equal(normalizePhone('123'), null)
})

test('exige nombre y apellido', () => {
  assert.equal(validateBuyer({ ...buyer, name: 'Ana' }).error, 'invalid_name')
  assert.equal(validateBuyer(buyer).buyer.name, 'Ana Souza')
})

test('el PIX impago no ocupa un horario; el turno se elige después de pagar', async () => {
  const before = await dispatch({ method: 'GET', pathname: '/api/booking/config' })
  const slot = before.body.days[0].slots[0]
  const created = await dispatch({
    method: 'POST',
    pathname: '/api/bookings',
    body: { buyer },
  })
  assert.equal(created.status, 201)
  assert.equal(created.body.status, 'pending')
  assert.equal(created.body.startsAt, null)
  assert.match(created.body.pix.code, /^00020126MOCK/)

  const during = await dispatch({ method: 'GET', pathname: '/api/booking/config' })
  assert.equal(during.body.days[0].slots[0].available, true)

  const early = await dispatch({
    method: 'POST',
    pathname: `/api/bookings/${created.body.id}/schedule`,
    body: { startsAt: slot.startsAt },
  })
  assert.equal(early.status, 409)
  assert.equal(early.body.error, 'unpaid')

  const paid = await dispatch({ method: 'POST', pathname: `/api/bookings/${created.body.id}/mock-pay` })
  assert.equal(paid.status, 200)
  assert.equal(paid.body.status, 'paid')
  assert.equal(paid.body.startsAt, null)

  const scheduled = await dispatch({
    method: 'POST',
    pathname: `/api/bookings/${created.body.id}/schedule`,
    body: { startsAt: slot.startsAt },
  })
  assert.equal(scheduled.status, 200)
  assert.equal(scheduled.body.startsAt, slot.startsAt)

  const after = await dispatch({ method: 'GET', pathname: '/api/booking/config' })
  assert.equal(after.body.days[0].slots[0].available, false)

  const other = await dispatch({
    method: 'POST',
    pathname: '/api/bookings',
    body: { buyer: { ...buyer, email: 'otro@example.com' } },
  })
  await dispatch({ method: 'POST', pathname: `/api/bookings/${other.body.id}/mock-pay` })
  const clash = await dispatch({
    method: 'POST',
    pathname: `/api/bookings/${other.body.id}/schedule`,
    body: { startsAt: slot.startsAt },
  })
  assert.equal(clash.status, 409)
  assert.equal(clash.body.error, 'slot_taken')
})

test('el webhook solo confirma si BuckPay dice que está pago', async () => {
  const created = await dispatch({
    method: 'POST',
    pathname: '/api/bookings',
    body: { buyer },
  })
  const pending = await getStored(created.body.id)
  const early = await dispatch({
    method: 'POST',
    pathname: '/api/webhooks/buckpay',
    body: { event: 'transaction.processed', data: { id: pending.buckpayId, status: 'paid' } },
  })
  assert.equal(early.status, 200)
  assert.equal((await dispatch({ method: 'GET', pathname: `/api/bookings/${created.body.id}` })).body.status, 'pending')

  const { mockMarkPaid } = await import('./buckpay.mjs')
  assert.equal(mockMarkPaid(created.body.id), true)
  await dispatch({
    method: 'POST',
    pathname: '/api/webhooks/buckpay',
    body: { event: 'transaction.processed', data: { id: pending.buckpayId, status: 'paid' } },
  })
  const view = await dispatch({ method: 'GET', pathname: `/api/bookings/${created.body.id}` })
  assert.equal(view.body.status, 'paid')
})

test('sin credenciales ni modo prueba no cobra', async () => {
  process.env.BUCKPAY_MOCK = '0'
  delete process.env.BOOKING_AMOUNT_CENTS
  const config = await dispatch({ method: 'GET', pathname: '/api/booking/config' })
  assert.equal(config.body.paymentsReady, false)
  const created = await dispatch({
    method: 'POST',
    pathname: '/api/bookings',
    body: { buyer },
  })
  assert.equal(created.status, 503)
})

async function getStored(id) {
  const { listBookings } = await import('./store.mjs')
  const all = await listBookings()
  return all.find((item) => item.id === id)
}
