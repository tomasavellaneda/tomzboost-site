import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'

const PAGES = {
  privacidad: {
    title: 'privacy.title',
    intro: 'privacy.intro',
    sections: [
      ['privacy.dataTitle', 'privacy.dataBody'],
      ['privacy.payTitle', 'privacy.payBody'],
    ],
  },
  terminos: {
    title: 'terms.title',
    intro: 'terms.intro',
    sections: [
      ['terms.toolTitle', 'terms.toolBody'],
      ['terms.warrantyTitle', 'terms.warrantyBody'],
    ],
  },
} as const satisfies Record<string, { title: MessageKey; intro: MessageKey; sections: [MessageKey, MessageKey][] }>

export function LegalPage({ page }: { page: keyof typeof PAGES }) {
  const { t } = useI18n()
  const copy = PAGES[page]

  return (
    <article className="legal-page section-shell">
      <p className="legal-kicker">{t('legal.draftLabel')}</p>
      <h1>{t(copy.title)}</h1>
      <p>{t(copy.intro)}</p>
      {copy.sections.map(([title, body]) => (
        <section key={title}>
          <h2>{t(title)}</h2>
          <p>{t(body)}</p>
        </section>
      ))}
      <p className="legal-draft">{t('legal.draftNotice')}</p>
    </article>
  )
}
