import { useEffect, useState } from 'react'
import AppPreview, { type PreviewScreen } from './components/AppPreview'
import {
  DownloadButton,
  DownloadSection,
  FloatingSocial,
  GamesMarquee,
  GamesSection,
  ScreenshotCarousel,
  ServicesSection,
  StatsSection,
} from './components/LandingExtras'
import { LINKS } from './config'
import { useI18n } from './i18n/I18nProvider'
import type { MessageKey } from './i18n/messages'
import { LOCALES } from './i18n/types'
import {
  IconArrowRight,
  IconCheck,
  IconChevron,
  IconGauge,
  IconGamepad,
  IconLayers,
  IconMessage,
  IconPointer,
  IconSettings,
  IconShield,
  IconSparkles,
  IconStar,
  IconZap,
} from './components/Icons'

const BENEFIT_ICONS = [IconGauge, IconPointer, IconLayers, IconSparkles, IconSettings, IconGamepad] as const

const FAQ_STRUCTURE = [
  {
    group: 'faq.plan.group',
    items: [
      ['faq.plan.q1', 'faq.plan.a1'],
      ['faq.plan.q2', 'faq.plan.a2'],
    ],
  },
  {
    group: 'faq.security.group',
    items: [
      ['faq.security.q1', 'faq.security.a1'],
      ['faq.security.q2', 'faq.security.a2'],
      ['faq.security.q3', 'faq.security.a3'],
    ],
  },
  {
    group: 'faq.before.group',
    items: [
      ['faq.before.q1', 'faq.before.a1'],
      ['faq.before.q2', 'faq.before.a2'],
      ['faq.before.q3', 'faq.before.a3'],
    ],
  },
  {
    group: 'faq.schedule.group',
    items: [
      ['faq.schedule.q1', 'faq.schedule.a1'],
      ['faq.schedule.q2', 'faq.schedule.a2'],
      ['faq.schedule.q3', 'faq.schedule.a3'],
      ['faq.schedule.q4', 'faq.schedule.a4'],
    ],
  },
  {
    group: 'faq.after.group',
    items: [
      ['faq.after.q1', 'faq.after.a1'],
      ['faq.after.q2', 'faq.after.a2'],
      ['faq.after.q3', 'faq.after.a3'],
      ['faq.after.q4', 'faq.after.a4'],
    ],
  },
] as const

const TESTIMONIAL_META = [
  { name: 'Rafael M.', meta: 'Counter-Strike 2', initial: 'R', quoteKey: 'testimonials.1.quote' },
  { name: 'Lucas A.', meta: 'Fortnite + Valorant', initial: 'L', quoteKey: 'testimonials.2.quote' },
  { name: 'Matheus R.', meta: 'Windows 11', initial: 'M', quoteKey: 'testimonials.3.quote' },
] as const

function Stars() {
  return (
    <div className="stars" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} />
      ))}
    </div>
  )
}

function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  return (
    <div className="lang-switch" role="group" aria-label={t('nav.langAria')}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={locale === l.code ? 'is-active' : ''}
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          title={l.label}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}

function ShotPage({ screen }: { screen: PreviewScreen }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0a0a',
        padding: 40,
      }}
      data-shot={screen}
    >
      <AppPreview screen={screen} flat />
    </div>
  )
}

export default function App() {
  const { t } = useI18n()
  const [shot, setShot] = useState<PreviewScreen | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('shot')
    if (s === 'inicio' || s === 'tweaks' || s === 'juegos' || s === 'debloat' || s === 'affinity' || s === 'bios') {
      setShot(s)
    }
  }, [])

  if (shot) return <ShotPage screen={shot} />

  const benefits = BENEFIT_ICONS.map((Icon, i) => {
    const n = String(i + 1).padStart(2, '0')
    return {
      n,
      Icon,
      title: t(`benefits.${n}.title` as MessageKey),
      desc: t(`benefits.${n}.desc` as MessageKey),
    }
  })

  return (
    <main>
      <header className="site-header">
        <a href="#top" aria-label={t('nav.homeAria')}>
          <img src="/logo.png" alt="TOMZ BOOST" className="header-logo" />
        </a>
        <nav aria-label={t('nav.aria')}>
          <a href="#beneficios">{t('nav.benefits')}</a>
          <a href="#capturas">{t('nav.screenshots')}</a>
          <a href="#jogos">{t('nav.games')}</a>
          <a href="#servicios">{t('nav.services')}</a>
          <a href="#download">{t('nav.download')}</a>
          <a href="#faq">{t('nav.faq')}</a>
        </nav>
        <div className="header-end">
          <LanguageSwitcher />
          <DownloadButton className="header-cta" label={t('nav.cta')} />
        </div>
      </header>

      <div className="hero-top">
        <GamesMarquee />
      </div>

      <section id="top" className="hero section-shell">
        <div className="hero-copy reveal">
          <div className="eyebrow">
            <IconZap /> {t('hero.eyebrow')}
          </div>
          <h1>
            {t('hero.titleBefore')}
            <em>{t('hero.titleEm')}</em>
            {t('hero.titleAfter')}
          </h1>
          <p>{t('hero.body')}</p>
          <div className="hero-actions">
            <DownloadButton label={t('hero.ctaDownload')} />
            <a className="button button-secondary" href="#servicios">
              <IconSparkles /> {t('hero.ctaFull')}
            </a>
            <a className="button button-secondary" href={LINKS.discord} target="_blank" rel="noreferrer">
              <IconMessage /> {t('hero.ctaDiscord')}
            </a>
          </div>
          <div className="trust-row">
            <span>
              <IconShield /> {t('hero.trustReversible')}
            </span>
            <span>
              <IconCheck /> {t('hero.trustWindows')}
            </span>
          </div>
        </div>
        <div className="hero-visual reveal reveal-delay">
          <div className="preview-glow" />
          <AppPreview screen="inicio" />
        </div>
      </section>

      <StatsSection />
      <ScreenshotCarousel />

      <section id="beneficios" className="section-block section-shell">
        <div className="section-heading">
          <span>{t('benefits.eyebrow')}</span>
          <h2>
            {t('benefits.title1')}
            <br />
            {t('benefits.title2')}
          </h2>
          <p>{t('benefits.body')}</p>
        </div>
        <div className="benefit-grid">
          {benefits.map(({ n, title, desc, Icon }) => (
            <article className="benefit-card" key={n}>
              <span className="card-number">{n}</span>
              <div className="icon-box">
                <Icon />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="comparativo" className="performance-band">
        <div className="section-shell">
          <div className="section-heading centered">
            <span>{t('comparison.eyebrow')}</span>
            <h2>{t('comparison.title')}</h2>
            <p>{t('comparison.body')}</p>
          </div>
          <div className="comparison-wrap">
            <article className="compare-card before">
              <header>
                <span>{t('comparison.beforeLabel')}</span>
                <strong>{t('comparison.beforeStrong')}</strong>
              </header>
              <div className="fps-value">
                <b>120</b>
                <span>FPS</span>
              </div>
              <div className="bars" aria-hidden>
                {[45, 60, 42, 72, 51, 78, 48, 68, 56, 82].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <ul>
                <li>{t('comparison.before.1')}</li>
                <li>{t('comparison.before.2')}</li>
                <li>{t('comparison.before.3')}</li>
                <li>{t('comparison.before.4')}</li>
              </ul>
            </article>
            <div className="compare-arrow">
              <IconArrowRight />
            </div>
            <article className="compare-card after">
              <header>
                <span>{t('comparison.afterLabel')}</span>
                <strong>{t('comparison.afterStrong')}</strong>
              </header>
              <div className="fps-value">
                <b>145</b>
                <span>FPS</span>
              </div>
              <div className="bars" aria-hidden>
                {[72, 78, 75, 85, 82, 90, 86, 92, 88, 96].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <ul>
                <li>{t('comparison.after.1')}</li>
                <li>{t('comparison.after.2')}</li>
                <li>{t('comparison.after.3')}</li>
                <li>{t('comparison.after.4')}</li>
              </ul>
            </article>
          </div>
          <p className="disclaimer">{t('comparison.disclaimer')}</p>
        </div>
      </section>

      <GamesSection />

      <section className="steps-band">
        <div className="section-shell">
          <div className="section-heading">
            <span>{t('steps.eyebrow')}</span>
            <h2>{t('steps.title')}</h2>
          </div>
          <div className="steps-grid">
            {(['01', '02', '03'] as const).map((n) => (
              <article className="step" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t(`steps.${n}.title` as MessageKey)}</h3>
                  <p>{t(`steps.${n}.desc` as MessageKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="guia" className="section-block section-shell">
        <div className="section-heading centered">
          <span>{t('guide.eyebrow')}</span>
          <h2>{t('guide.title')}</h2>
          <p>{t('guide.body')}</p>
        </div>
      </section>

      <section className="section-block section-shell testimonials">
        <div className="section-heading centered">
          <span>{t('testimonials.eyebrow')}</span>
          <h2>{t('testimonials.title')}</h2>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIAL_META.map((item) => (
            <article className="testimonial" key={item.name}>
              <Stars />
              <blockquote>“{t(item.quoteKey)}”</blockquote>
              <footer>
                <span>{item.initial}</span>
                <div>
                  <b>{item.name}</b>
                  <small>{item.meta}</small>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <ServicesSection />

      <section id="faq" className="faq-band">
        <div className="section-shell faq-layout">
          <div className="section-heading">
            <span>{t('faq.eyebrow')}</span>
            <h2>{t('faq.title')}</h2>
            <p>
              {t('faq.body')}{' '}
              <a href={LINKS.whatsapp} target="_blank" rel="noreferrer">
                {t('faq.whatsapp')}
              </a>
              .
            </p>
          </div>
          <div className="faq-groups">
            {FAQ_STRUCTURE.map((group, gi) => (
              <div className="faq-group" key={group.group}>
                <h3 className="faq-group-title">{t(group.group)}</h3>
                <div className="faq-list">
                  {group.items.map(([qKey, aKey], i) => (
                    <details key={qKey} open={gi === 0 && i === 0}>
                      <summary>
                        {t(qKey)}
                        <IconChevron />
                      </summary>
                      <p>{t(aKey)}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DownloadSection />

      <footer className="site-footer section-shell">
        <img src="/logo.png" alt="TOMZ BOOST" className="footer-logo" />
        <p>{t('footer.tagline')}</p>
        <span>© {new Date().getFullYear()} TOMZ BOOST</span>
      </footer>

      <FloatingSocial />
    </main>
  )
}
