/**
 * Web Push del panel. Registra el service worker, pide permiso y guarda la
 * suscripción en el backend. En iPhone requiere la PWA instalada (iOS 16.4+).
 */

export type PushDeviceState = 'loading' | 'unsupported' | 'blocked' | 'enabled' | 'off' | 'error'

const SW_PATH = '/sw.js'

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null
  try {
    const existing = await navigator.serviceWorker.getRegistration('/')
    if (existing) return existing
    return await navigator.serviceWorker.register(SW_PATH, { scope: '/' })
  } catch {
    return null
  }
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const normalized = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

async function fetchPublicKey(): Promise<string> {
  const response = await fetch('/api/push/key', { cache: 'no-store' })
  if (!response.ok) throw new Error('push_key_unavailable')
  const data = (await response.json()) as { publicKey?: unknown }
  return typeof data.publicKey === 'string' ? data.publicKey.trim() : ''
}

export async function currentPushState(): Promise<PushDeviceState> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'
  try {
    const registration = await navigator.serviceWorker.getRegistration('/')
    const subscription = registration ? await registration.pushManager.getSubscription() : null
    return subscription ? 'enabled' : 'off'
  } catch {
    return 'error'
  }
}

/** Pide permiso y suscribe este dispositivo. Debe llamarse desde un click. */
export async function enablePush(token: string): Promise<PushDeviceState> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (permission === 'denied') return 'blocked'
  if (permission !== 'granted') return 'off'

  const registration = await registerPushServiceWorker()
  if (!registration) return 'unsupported'
  await navigator.serviceWorker.ready

  const publicKey = await fetchPublicKey()
  if (!publicKey) return 'error'

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeBase64Url(publicKey),
    })
  }

  const response = await fetch('/api/admin/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  })
  if (!response.ok) throw new Error('push_subscribe_failed')
  return 'enabled'
}

export async function fetchPushCount(token: string): Promise<number> {
  const response = await fetch('/api/admin/push/status', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('push_status_failed')
  const data = (await response.json()) as { count?: unknown }
  return typeof data.count === 'number' ? data.count : 0
}

export async function sendTestPush(token: string): Promise<{ sent: number; failed: number }> {
  const response = await fetch('/api/admin/push/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: '{}',
  })
  if (!response.ok) throw new Error('push_test_failed')
  const data = (await response.json()) as { sent?: unknown; failed?: unknown }
  return {
    sent: typeof data.sent === 'number' ? data.sent : 0,
    failed: typeof data.failed === 'number' ? data.failed : 0,
  }
}
