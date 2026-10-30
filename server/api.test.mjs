import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { dispatch, resetRateLimitForTests } from './api.mjs'
import { resetBuckpayForTests } from './buckpay.mjs'
import { generateLicenseKey, isValidLicenseKey } from './license.mjs'
import { resetLicenseClaimsForTests } from './license-claims.mjs'
import { resetPushForTests } from './push.mjs'
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
  process.env.BOOKING_AMOUNT_CENTS = '14990'
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
  delete process.env.VAPID_PUBLIC_KEY
  delete process.env.VAPID_PRIVATE_KEY
  delete process.env.VAPID_SUBJECT
  resetStoreForTests()
  resetLicenseClaimsForTests()
  resetPushForTests()
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
  assert.equal(created.body.amountCents, 14990)
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
  assert.match(paid.body.licenseKey, /^TOMZ(?:-[0-9A-F]{4}){4}$/)
  assert.equal(isValidLicenseKey(paid.body.licenseKey), true)

  const scheduled = await dispatch({
    method: 'POST',
    pathname: `/api/bookings/${created.body.id}/schedule`,
    body: { startsAt: slot.startsAt },
  })
  assert.equal(scheduled.status, 200)
  assert.equal(scheduled.body.startsAt, slot.startsAt)
  assert.equal(scheduled.body.licenseKey, paid.body.licenseKey)

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

test('el PIX de la app cobra R$ 67,90 y no pide horario', async () => {
  const created = await dispatch({
    method: 'POST',
    pathname: '/api/bookings',
    body: { product: 'app', buyer },
  })
  assert.equal(created.status, 201)
  assert.equal(created.body.product, 'app')
  assert.equal(created.body.amountCents, 6790)
  assert.equal(created.body.startsAt, null)
  const paid = await dispatch({ method: 'POST', pathname: `/api/bookings/${created.body.id}/mock-pay` })
  assert.equal(paid.body.status, 'paid')
  assert.equal(
    paid.body.downloadUrl,
    'https://github.com/tomasavellaneda/tomz-boost/releases/download/v1.0.2/Tomz-Boost-Setup-1.0.2.exe',
  )
  assert.match(paid.body.licenseKey, /^TOMZ(?:-[0-9A-F]{4}){4}$/)
  assert.equal(isValidLicenseKey(paid.body.licenseKey), true)
  const again = await dispatch({ method: 'GET', pathname: `/api/bookings/${created.body.id}` })
  assert.equal(again.body.licenseKey, paid.body.licenseKey)
})

test('no hay una dirección pública que entregue claves', async () => {
  assert.equal(await dispatch({ method: 'GET', pathname: '/api/app-license' }), null)
})

test('el panel de admin muestra la optimización paga y no abre sin clave', async () => {
  process.env.ADMIN_PASSWORD = 'agenda-test-99'
  const created = await dispatch({
    method: 'POST',
    pathname: '/api/bookings',
    body: { buyer },
  })
  const locked = await dispatch({ method: 'GET', pathname: '/api/admin/bookings' })
  assert.equal(locked.status, 401)
  const bad = await dispatch({ method: 'POST', pathname: '/api/admin/login', body: { password: 'otra' } })
  assert.equal(bad.status, 401)
  const login = await dispatch({ method: 'POST', pathname: '/api/admin/login', body: { password: 'agenda-test-99' } })
  assert.equal(login.status, 200)
  await dispatch({ method: 'POST', pathname: `/api/bookings/${created.body.id}/mock-pay` })
  const slot = (await dispatch({ method: 'GET', pathname: '/api/booking/config' })).body.days[0].slots[0]
  await dispatch({
    method: 'POST',
    pathname: `/api/bookings/${created.body.id}/schedule`,
    body: { startsAt: slot.startsAt },
  })
  const list = await dispatch({
    method: 'GET',
    pathname: '/api/admin/bookings',
    authorization: `Bearer ${login.body.token}`,
  })
  assert.equal(list.status, 200)
  const row = list.body.bookings.find((item) => item.id === created.body.id)
  assert.equal(row.product, 'full')
  assert.equal(row.startsAt, slot.startsAt)
  assert.equal(isValidLicenseKey(row.licenseKey), true)
  assert.equal(row.buyer.email, buyer.email)
  delete process.env.ADMIN_PASSWORD
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

test('el panel lista todos los pedidos con su estado y su clave', async () => {
  process.env.ADMIN_PASSWORD = 'panel-test-77'
  const paid = await dispatch({ method: 'POST', pathname: '/api/bookings', body: { buyer } })
  await dispatch({ method: 'POST', pathname: `/api/bookings/${paid.body.id}/mock-pay` })
  const pending = await dispatch({ method: 'POST', pathname: '/api/bookings', body: { buyer } })

  const login = await dispatch({ method: 'POST', pathname: '/api/admin/login', body: { password: 'panel-test-77' } })
  const authorization = `Bearer ${login.body.token}`

  const locked = await dispatch({ method: 'GET', pathname: '/api/admin/orders' })
  assert.equal(locked.status, 401)

  const list = await dispatch({ method: 'GET', pathname: '/api/admin/orders', authorization })
  assert.equal(list.status, 200)
  const paidRow = list.body.orders.find((row) => row.id === paid.body.id)
  const pendingRow = list.body.orders.find((row) => row.id === pending.body.id)
  assert.equal(paidRow.status, 'paid')
  assert.equal(isValidLicenseKey(paidRow.licenseKey), true)
  assert.equal(paidRow.buyer.email, buyer.email)
  assert.equal(pendingRow.status, 'pending')
  assert.equal(pendingRow.licenseKey, null)
  delete process.env.ADMIN_PASSWORD
})

test('el panel genera keys gratis atadas a un equipo', async () => {
  process.env.ADMIN_PASSWORD = 'panel-test-88'
  const login = await dispatch({ method: 'POST', pathname: '/api/admin/login', body: { password: 'panel-test-88' } })
  const authorization = `Bearer ${login.body.token}`

  const blocked = await dispatch({ method: 'POST', pathname: '/api/admin/keys', body: { count: 1 } })
  assert.equal(blocked.status, 401)

  const free = await dispatch({
    method: 'POST',
    pathname: '/api/admin/keys',
    body: { count: 3, hwid: '9111-2222-3333-4444', note: 'sorteo' },
    authorization,
  })
  assert.equal(free.status, 201)
  assert.equal(free.body.keys.length, 3)
  assert.equal(new Set(free.body.keys.map((row) => row.key)).size, 3)
  for (const row of free.body.keys) {
    assert.equal(isValidLicenseKey(row.key, '9111-2222-3333-4444'), true)
    assert.equal(isValidLicenseKey(row.key, '1742-90E2-2B1B-6CB8'), false)
    assert.equal(row.hwid, '9111222233334444')
    assert.equal(row.note, 'sorteo')
  }

  const bound = await dispatch({
    method: 'POST',
    pathname: '/api/admin/keys',
    body: { count: 1, hwid: '1742-90E2-2B1B-6CB8' },
    authorization,
  })
  assert.equal(bound.status, 201)
  const boundKey = bound.body.keys[0].key
  assert.equal(isValidLicenseKey(boundKey, '1742-90E2-2B1B-6CB8'), true)
  assert.equal(isValidLicenseKey(boundKey, 'AAAA-1111-BBBB-2222'), false)

  const log = await dispatch({ method: 'GET', pathname: '/api/admin/keys', authorization })
  assert.equal(log.status, 200)
  assert.equal(log.body.keys.length, 4)
  delete process.env.ADMIN_PASSWORD
})

test('la agenda del panel muestra la sesión agendada', async () => {
  process.env.ADMIN_PASSWORD = 'panel-test-99'
  const created = await dispatch({ method: 'POST', pathname: '/api/bookings', body: { buyer } })
  await dispatch({ method: 'POST', pathname: `/api/bookings/${created.body.id}/mock-pay` })
  const slot = (await dispatch({ method: 'GET', pathname: '/api/booking/config' })).body.days[0].slots[0]
  await dispatch({
    method: 'POST',
    pathname: `/api/bookings/${created.body.id}/schedule`,
    body: { startsAt: slot.startsAt },
  })

  const login = await dispatch({ method: 'POST', pathname: '/api/admin/login', body: { password: 'panel-test-99' } })
  const agenda = await dispatch({
    method: 'GET',
    pathname: '/api/admin/agenda',
    authorization: `Bearer ${login.body.token}`,
  })
  assert.equal(agenda.status, 200)
  const session = agenda.body.sessions.find((row) => row.id === created.body.id)
  assert.equal(session.startsAt, slot.startsAt)
  assert.equal(session.buyer.name, buyer.name)
  assert.equal(isValidLicenseKey(session.licenseKey), true)
  delete process.env.ADMIN_PASSWORD
})

test('el endpoint de salud informa qué store está en uso', async () => {
  const health = await dispatch({ method: 'GET', pathname: '/api/health' })
  assert.equal(health.status, 200)
  assert.equal(health.body.ok, true)
  assert.equal(health.body.store, 'file')
})

test('activar una key la ata al primer equipo y rechaza los demás', async () => {
  const key = generateLicenseKey()

  const first = await dispatch({
    method: 'POST',
    pathname: '/api/license/activate',
    body: { key, hwid: '1742-90E2-2B1B-6CB8' },
  })
  assert.equal(first.status, 200)
  assert.equal(first.body.hwid, '174290E22B1B6CB8')

  const again = await dispatch({
    method: 'POST',
    pathname: '/api/license/activate',
    body: { key, hwid: '1742-90E2-2B1B-6CB8' },
  })
  assert.equal(again.status, 200)

  const other = await dispatch({
    method: 'POST',
    pathname: '/api/license/activate',
    body: { key, hwid: 'AAAA-1111-BBBB-2222' },
  })
  assert.equal(other.status, 409)
  assert.equal(other.body.error, 'already_bound')
})

test('activar rechaza keys inválidas y HWID vacío', async () => {
  const bad = await dispatch({
    method: 'POST',
    pathname: '/api/license/activate',
    body: { key: 'TOMZ-0000-0000-0000-0000', hwid: '1742-90E2-2B1B-6CB8' },
  })
  assert.equal(bad.status, 400)
  assert.equal(bad.body.error, 'invalid_key')

  const noHwid = await dispatch({
    method: 'POST',
    pathname: '/api/license/activate',
    body: { key: generateLicenseKey() },
  })
  assert.equal(noHwid.status, 400)
  assert.equal(noHwid.body.error, 'hwid_required')
})

test('la compra de la app ata la key al HWID del comprador', async () => {
  const created = await dispatch({
    method: 'POST',
    pathname: '/api/bookings',
    body: { product: 'app', buyer, hwid: '1742-90E2-2B1B-6CB8' },
  })
  assert.equal(created.status, 201)
  assert.equal(isValidLicenseKey(created.body.licenseKey), false)
  const paid = await dispatch({ method: 'POST', pathname: `/api/bookings/${created.body.id}/mock-pay` })
  assert.equal(isValidLicenseKey(paid.body.licenseKey, '1742-90E2-2B1B-6CB8'), true)
  assert.equal(isValidLicenseKey(paid.body.licenseKey, 'AAAA-1111-BBBB-2222'), false)
})

test('soporte puede liberar una clave para que se active en otro equipo', async () => {
  process.env.ADMIN_PASSWORD = 'panel-test-55'
  const key = generateLicenseKey()
  const login = await dispatch({ method: 'POST', pathname: '/api/admin/login', body: { password: 'panel-test-55' } })
  const authorization = `Bearer ${login.body.token}`

  const first = await dispatch({ method: 'POST', pathname: '/api/license/activate', body: { key, hwid: '1742-90E2-2B1B-6CB8' } })
  assert.equal(first.status, 200)

  const blocked = await dispatch({ method: 'POST', pathname: '/api/license/activate', body: { key, hwid: 'AAAA-1111-BBBB-2222' } })
  assert.equal(blocked.status, 409)

  const locked = await dispatch({ method: 'POST', pathname: '/api/admin/keys/release', body: { key } })
  assert.equal(locked.status, 401)

  const released = await dispatch({
    method: 'POST',
    pathname: '/api/admin/keys/release',
    body: { key },
    authorization,
  })
  assert.equal(released.status, 200)
  assert.equal(released.body.released, true)

  const moved = await dispatch({ method: 'POST', pathname: '/api/license/activate', body: { key, hwid: 'AAAA-1111-BBBB-2222' } })
  assert.equal(moved.status, 200)
  delete process.env.ADMIN_PASSWORD
})

test('push: sin token no se puede suscribir ni consultar el estado', async () => {
  const subscription = fakePushSubscription('https://push.example/uno')

  const subscribe = await dispatch({
    method: 'POST',
    pathname: '/api/admin/push/subscribe',
    body: { subscription },
  })
  assert.equal(subscribe.status, 401)

  const status = await dispatch({ method: 'GET', pathname: '/api/admin/push/status' })
  assert.equal(status.status, 401)

  const testPush = await dispatch({ method: 'POST', pathname: '/api/admin/push/test', body: {} })
  assert.equal(testPush.status, 401)
})

test('push: guarda y cuenta las suscripciones sin duplicar', async () => {
  process.env.ADMIN_PASSWORD = 'push-test-77'
  const login = await dispatch({ method: 'POST', pathname: '/api/admin/login', body: { password: 'push-test-77' } })
  const authorization = `Bearer ${login.body.token}`
  const subscription = fakePushSubscription('https://push.example/uno')

  const saved = await dispatch({
    method: 'POST',
    pathname: '/api/admin/push/subscribe',
    body: { subscription },
    authorization,
  })
  assert.equal(saved.status, 201)
  assert.equal(saved.body.count, 1)

  const status = await dispatch({ method: 'GET', pathname: '/api/admin/push/status', authorization })
  assert.equal(status.status, 200)
  assert.deepEqual(status.body, { count: 1 })

  const duplicate = await dispatch({
    method: 'POST',
    pathname: '/api/admin/push/subscribe',
    body: { subscription },
    authorization,
  })
  assert.equal(duplicate.status, 201)
  assert.deepEqual(
    (await dispatch({ method: 'GET', pathname: '/api/admin/push/status', authorization })).body,
    { count: 1 },
  )

  const invalid = await dispatch({
    method: 'POST',
    pathname: '/api/admin/push/subscribe',
    body: { subscription: { endpoint: 'http://no-es-https', keys: {} } },
    authorization,
  })
  assert.equal(invalid.status, 400)
  assert.equal(invalid.body.error, 'subscription_invalid')

  const testPush = await dispatch({ method: 'POST', pathname: '/api/admin/push/test', body: {}, authorization })
  assert.equal(testPush.status, 200)
  assert.equal(testPush.body.sent, 0)
  assert.equal(testPush.body.configured, false)

  delete process.env.ADMIN_PASSWORD
})

test('push: la clave pública VAPID está disponible sin token', async () => {
  process.env.VAPID_PUBLIC_KEY = 'BPUBLIC_KEY_DE_PRUEBA'
  process.env.VAPID_PRIVATE_KEY = 'PRIVATE_KEY_DE_PRUEBA'
  const response = await dispatch({ method: 'GET', pathname: '/api/push/key' })
  assert.equal(response.status, 200)
  assert.equal(response.body.publicKey, 'BPUBLIC_KEY_DE_PRUEBA')
})

async function getStored(id) {
  const { listBookings } = await import('./store.mjs')
  const all = await listBookings()
  return all.find((item) => item.id === id)
}

function fakePushSubscription(endpoint) {
  return {
    endpoint,
    expirationTime: null,
    keys: { p256dh: 'BExampleP256dhKey', auth: 'exampleAuthSecret' },
  }
}
