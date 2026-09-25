import { LINKS } from '../config'
import { legalCopy, type LegalCopy } from '../content/legal'
import { useI18n } from '../i18n/I18nProvider'

function ChapterList({ chapters }: { chapters: LegalCopy['privacy'] }) {
  return (
    <>
      {chapters.map((chapter) => (
        <section key={chapter.title}>
          <h3>{chapter.title}</h3>
          {chapter.blocks.map((block, i) =>
            block.kind === 'ul' ? (
              <ul key={i}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
        </section>
      ))}
    </>
  )
}

export function LegalPage() {
  const { locale, t } = useI18n()
  const copy = legalCopy[locale]

  return (
    <article className="legal-page section-shell">
      <h1>{copy.pageTitle}</h1>

      <section id="politica" className="legal-doc">
        <h2>{copy.privacyTitle}</h2>
        <p>{copy.privacyIntro}</p>
        <ChapterList chapters={copy.privacy} />
      </section>

      <section id="termos" className="legal-doc">
        <h2>{copy.termsTitle}</h2>
        <p>{copy.termsIntro}</p>
        <ChapterList chapters={copy.terms} />
      </section>

      <p className="legal-contact">{copy.contact}</p>
      <ul className="legal-channels">
        <li>
          <a href={LINKS.discord} target="_blank" rel="noreferrer">
            {t('footer.social.discord')}
          </a>
        </li>
        <li>
          <a href={LINKS.whatsapp} target="_blank" rel="noreferrer">
            {t('footer.social.whatsapp')}
          </a>
        </li>
        <li>
          <a href={LINKS.instagram} target="_blank" rel="noreferrer">
            {t('footer.social.instagram')}
          </a>
        </li>
      </ul>
    </article>
  )
}
