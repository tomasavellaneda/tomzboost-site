import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react'

export type Page = 'home' | 'comprar' | 'agendar' | 'privacidad' | 'terminos'

export function pageFromPath(pathname: string): Page {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/comprar') return 'comprar'
  if (path === '/agendar') return 'agendar'
  if (path === '/privacidad') return 'privacidad'
  if (path === '/terminos') return 'terminos'
  return 'home'
}

function currentHref() {
  return window.location.pathname + window.location.search + window.location.hash
}

export function navigate(to: string) {
  const url = new URL(to, window.location.href)
  const next = url.pathname + url.search + url.hash
  if (next !== currentHref()) window.history.pushState(null, '', next)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function usePage() {
  const [href, setHref] = useState(() => currentHref())

  useEffect(() => {
    const sync = () => setHref(currentHref())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const url = new URL(href, window.location.origin)
  const page = pageFromPath(url.pathname)

  useEffect(() => {
    if (page !== 'home') {
      window.scrollTo(0, 0)
      return
    }
    const id = url.hash.replace('#', '')
    if (!id) {
      window.scrollTo(0, 0)
      return
    }
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [href, page, url.hash])

  return page
}

export function SiteLink({
  href,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin) return
    event.preventDefault()
    navigate(href)
  }

  return <a href={href} {...rest} onClick={handleClick} />
}
