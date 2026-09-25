import { LINKS } from '../config'
import { useI18n } from '../i18n/I18nProvider'
import { SiteLink } from '../routing'

export function SiteFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="section-shell footer-grid">
        <div className="footer-brand">
          <SiteLink href="/" aria-label={t('nav.homeAria')}>
            <img src="/logo.png" alt="TOMZ BOOST" className="footer-logo" />
          </SiteLink>
          <p>{t('footer.tagline')}</p>
          <small>© {year} TOMZ BOOST</small>
        </div>

        <nav className="footer-col" aria-label={t('footer.col.nav')}>
          <h2>{t('footer.col.nav')}</h2>
          <ul>
            <li>
              <SiteLink href="/#beneficios">{t('nav.benefits')}</SiteLink>
            </li>
            <li>
              <SiteLink href="/#resultados">{t('footer.link.results')}</SiteLink>
            </li>
            <li>
              <SiteLink href="/#servicios">{t('nav.services')}</SiteLink>
            </li>
            <li>
              <SiteLink href="/#download">{t('footer.link.download')}</SiteLink>
            </li>
            <li>
              <SiteLink href="/comprar">{t('footer.link.buy')}</SiteLink>
            </li>
            <li>
              <SiteLink href="/#faq">{t('nav.faq')}</SiteLink>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label={t('footer.col.legal')}>
          <h2>{t('footer.col.legal')}</h2>
          <ul>
            <li>
              <SiteLink href="/terminos#politica">{t('footer.link.privacy')}</SiteLink>
            </li>
            <li>
              <SiteLink href="/terminos#termos">{t('footer.link.terms')}</SiteLink>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label={t('footer.col.social')}>
          <h2>{t('footer.col.social')}</h2>
          <ul className="footer-social">
            <li>
              <a href={LINKS.discord} target="_blank" rel="noreferrer">
                <img src="/icons/discord.svg" alt="" width={16} height={16} />
                {t('footer.social.discord')}
              </a>
            </li>
            <li>
              <a href={LINKS.whatsapp} target="_blank" rel="noreferrer">
                <img src="/icons/whatsapp.svg" alt="" width={16} height={16} />
                {t('footer.social.whatsapp')}
              </a>
            </li>
            <li>
              <a href={LINKS.instagram} target="_blank" rel="noreferrer">
                <img src="/icons/instagram.svg" alt="" width={16} height={16} />
                {t('footer.social.instagram')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
