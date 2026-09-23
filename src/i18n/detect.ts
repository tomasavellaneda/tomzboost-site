import type { Locale } from './types'

/** Detecta idioma por navegador + zona horaria (BR / LATAM / US). */
export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem('tomz-locale') as Locale | null
    if (saved === 'es' || saved === 'pt' || saved === 'en') return saved
  } catch {
    /* ignore */
  }

  const langs = [...(navigator.languages ?? []), navigator.language]
    .filter(Boolean)
    .map((l) => l.toLowerCase())

  for (const l of langs) {
    if (l.startsWith('pt')) return 'pt'
    if (l.startsWith('en')) return 'en'
    if (l.startsWith('es')) return 'es'
  }

  // Fallback por zona horaria cuando el idioma del browser no ayuda
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (/Sao_Paulo|Fortaleza|Bahia|Belem|Manaus|Recife|Noronha|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco/i.test(tz)) {
      return 'pt'
    }
    if (/New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Honolulu|Detroit|Indiana|Kentucky|Boise/i.test(tz)) {
      return 'en'
    }
    // Resto de América → español (LATAM)
    if (/America\//i.test(tz)) return 'es'
  } catch {
    /* ignore */
  }

  return 'es'
}
