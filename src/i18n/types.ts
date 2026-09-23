export type Locale = 'es' | 'pt' | 'en'

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'en', label: 'English', short: 'EN' },
]

export const LOCALE_STORAGE_KEY = 'tomz-locale'
