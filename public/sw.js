/* Service worker de Tomz Boost: Web Push del panel de administración. */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = {}
  if (event.data) {
    try {
      payload = event.data.json()
    } catch {
      payload = { body: event.data.text() }
    }
  }

  const title = typeof payload.title === 'string' && payload.title ? payload.title : 'Tomz Boost'
  const options = {
    body: typeof payload.body === 'string' ? payload.body : '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: typeof payload.tag === 'string' ? payload.tag : undefined,
    data: { url: typeof payload.url === 'string' && payload.url ? payload.url : '/admin' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/admin', self.location.origin).href

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus()
          if ('navigate' in client) {
            try {
              await client.navigate(target)
            } catch {
              /* Si no se puede navegar, al menos queda enfocada. */
            }
          }
          return
        }
      }
      await self.clients.openWindow(target)
    })(),
  )
})
