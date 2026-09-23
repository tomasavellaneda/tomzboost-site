import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { detectLocale } from './detect'
import { messages, type MessageKey } from './messages'
import { LOCALE_STORAGE_KEY, type Locale } from './types'

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale())

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    document.documentElement.lang = locale
    const dict = messages[locale]
    document.title = dict['meta.title']
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', dict['meta.description'])
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', dict['meta.ogTitle'])
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', dict['meta.ogDescription'])
  }, [locale])

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => messages[locale][key] ?? messages.es[key] ?? key,
    }),
    [locale],
  )

  return createElement(I18nContext.Provider, { value }, children)
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
