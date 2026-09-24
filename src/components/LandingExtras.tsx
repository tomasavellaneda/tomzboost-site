import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { downloadUrl, LINKS, RELEASE } from '../config'
import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import AppPreview, { type PreviewScreen } from './AppPreview'
import { IconCheck, IconChip, IconDownload, IconRocket, IconSettings, IconShield } from './Icons'

export function DownloadButton({
  className = 'button button-primary',
  label,
  large = false,
}: {
  className?: string
  label?: string
  large?: boolean
}) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const text = label ?? t('nav.cta')

  function handleClick(_e: MouseEvent<HTMLAnchorElement>) {
    setBusy(true)
    window.setTimeout(() => {
      const isAbsolute = /^https?:\/\//i.test(downloadUrl)
      if (isAbsolute) {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer')
      }
      setBusy(false)
    }, 1200)
  }

  return (
    <a
      className={`${className}${large ? ' button-large' : ''}${busy ? ' is-downloading' : ''}`}
      href={downloadUrl}
      download
      onClick={handleClick}
    >
      {busy ? (
        <>
          <span className="dl-spinner" aria-hidden />
          {t('download.busy')}
        </>
      ) : (
        <>
          <IconDownload /> {text}
        </>
      )}
    </a>
  )
}

export function DownloadSection() {
  const { t } = useI18n()
  return (
    <section id="download" className="download-section section-shell">
      <div className="download-panel download-panel-solo">
        <div className="download-panel-glow" aria-hidden />
        <div className="download-copy">
          <span className="eyebrow">{t('download.eyebrow')}</span>
          <h2>{t('download.title')}</h2>
          <p>{t('download.body')}</p>

          <ul className="release-meta">
            <li>
              <b>{t('download.meta.version')}</b>
              <span>v{RELEASE.version}</span>
            </li>
            <li>
              <b>{t('download.meta.size')}</b>
              <span>{RELEASE.size}</span>
            </li>
            <li>
              <b>{t('download.meta.compatible')}</b>
              <span>{RELEASE.platforms.join(' · ')}</span>
            </li>
            <li>
              <b>{t('download.meta.updated')}</b>
              <span>{RELEASE.updatedAt}</span>
            </li>
          </ul>

          <div className="hero-actions" style={{ marginTop: 28 }}>
            <DownloadButton className="button button-primary" label={t('download.cta')} large />
            <a className="button button-secondary" href={LINKS.installGuide}>
              {t('download.guide')}
            </a>
          </div>
          <small className="dl-note">{t('download.note')}</small>
        </div>
      </div>
    </section>
  )
}

export function FloatingSocial() {
  const { t } = useI18n()
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const section = document.getElementById('agendar')
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => setHide(entry.isIntersecting), { threshold: 0 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  if (hide) return null

  return (
    <div className="floating-actions">
      <a
        className="floating-button discord"
        href={LINKS.discord}
        target="_blank"
        rel="noreferrer"
        aria-label={t('floating.discord')}
      >
        <img src="/icons/discord.svg" alt="" width={22} height={22} />
      </a>
      <a
        className="floating-button whatsapp"
        href={LINKS.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label={t('floating.whatsapp')}
      >
        <img src="/icons/whatsapp.svg" alt="" width={22} height={22} />
      </a>
    </div>
  )
}

export function ServicesSection() {
  const { t } = useI18n()
  const services = [
    {
      id: 'app',
      badge: t('services.app.badge'),
      title: t('services.app.title'),
      desc: t('services.app.desc'),
      features: [t('services.app.f1'), t('services.app.f2'), t('services.app.f3'), t('services.app.f4')],
      cta: { label: t('services.app.cta'), href: '#download', primary: true as const },
    },
    {
      id: 'full',
      badge: t('services.full.badge'),
      title: t('services.full.title'),
      desc: t('services.full.desc'),
      features: [t('services.full.f1'), t('services.full.f2'), t('services.full.f3'), t('services.full.f4')],
      cta: { label: t('services.full.cta'), href: '#agendar', primary: true as const },
    },
  ]

  return (
    <section id="servicios" className="section-block section-shell services-section">
      <div className="section-heading centered">
        <span>{t('services.eyebrow')}</span>
        <h2>{t('services.title')}</h2>
        <p>{t('services.body')}</p>
      </div>

      <div className="services-grid">
        {services.map((s) => (
          <article className={`service-card${s.id === 'full' ? ' is-featured' : ''}`} key={s.id}>
            <div className="service-card-top">
              <span className="service-badge">{s.badge}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
            <ul className="service-features">
              {s.features.map((f) => (
                <li key={f}>
                  <IconCheck />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {'external' in s.cta && s.cta.external ? (
              <a
                className={`button ${s.cta.primary ? 'button-primary' : 'button-secondary'}`}
                href={s.cta.href}
                target="_blank"
                rel="noreferrer"
              >
                {s.cta.label}
              </a>
            ) : (
              <a className={`button ${s.cta.primary ? 'button-primary' : 'button-secondary'}`} href={s.cta.href}>
                {s.cta.label}
              </a>
            )}
          </article>
        ))}
      </div>

      <div className="services-note">
        <span>
          <IconChip /> BIOS
        </span>
        <span>
          <IconSettings /> Windows
        </span>
        <span>
          <IconRocket /> App TOMZ BOOST
        </span>
        <span>
          <IconShield /> {t('services.note.reversible')}
        </span>
      </div>
    </section>
  )
}

export const GAMES = [
  { name: 'Counter-Strike 2', short: 'Counter-Strike 2', src: '/games/cs2.svg' },
  { name: 'Valorant', short: 'Valorant', src: '/games/valorant.svg' },
  { name: 'Fortnite', short: 'Fortnite', src: '/games/fortnite.svg' },
  { name: 'Call of Duty', short: 'Call of Duty', src: '/games/cod.png' },
  { name: 'Apex Legends', short: 'Apex Legends', src: '/games/apex.png' },
  { name: 'Rainbow Six Siege', short: 'Rainbow Six Siege', src: '/games/r6.png' },
  { name: 'League of Legends', short: 'League of Legends', src: '/games/lol.svg' },
  { name: 'GTA V', short: 'GTA V', src: '/games/gtav.png' },
  { name: 'Minecraft', short: 'Minecraft', src: '/games/minecraft.png' },
  { name: 'PUBG', short: 'PUBG', src: '/games/pubg.png' },
  { name: 'Rocket League', short: 'Rocket League', src: '/games/rocketleague.png' },
  { name: 'Rust', short: 'Rust', src: '/games/rust.png' },
  { name: 'EA FC 27', short: 'EA Sports FC', src: '/games/eafc26.png' },
  { name: 'Red Dead Redemption 2', short: 'Red Dead Redemption 2', src: '/games/rdr2.png' },
  { name: 'Dota 2', short: 'Dota 2', src: '/games/dota2.png' },
]

/** Carrusel infinito: solo el logo original en monocromo, una fila. */
export function GamesMarquee() {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const items = [...GAMES, ...GAMES]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let raf = 0
    let x = 0
    let last = performance.now()
    const speed = 55

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      x -= speed * dt
      const setWidth = track.scrollWidth / 2
      if (setWidth > 0 && -x >= setWidth) {
        x += setWidth
      }
      track.style.transform = `translate3d(${x}px,0,0)`
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    start()
    const imgs = track.querySelectorAll('img')
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', start, { once: true })
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="games-marquee" aria-label={t('games.marqueeAria')}>
      <div className="games-marquee-track" ref={trackRef}>
        {items.map((g, i) => (
          <div className="games-marquee-item" key={`${g.name}-${i}`} title={g.name}>
            <img src={g.src} alt={g.name} loading="eager" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function GamesSection() {
  const { t } = useI18n()
  return (
    <section id="jogos" className="section-block section-shell games-section">
      <div className="section-heading centered">
        <span>{t('games.eyebrow')}</span>
        <h2>{t('games.title')}</h2>
        <p>{t('games.body')}</p>
      </div>
      <div className="games-logo-grid">
        {GAMES.map((g) => (
          <article className="game-logo-card" key={g.name} title={g.name}>
            <img src={g.src} alt={g.name} loading="lazy" />
            <b>{g.short}</b>
          </article>
        ))}
      </div>
    </section>
  )
}

const GAME_RESULTS = [
  { id: 'cs2', name: 'Counter-Strike 2', src: '/games/cs2.svg', before: 280, after: 365 },
  { id: 'valorant', name: 'Valorant', src: '/games/valorant.svg', before: 240, after: 336 },
  { id: 'fortnite', name: 'Fortnite', src: '/games/fortnite.svg', before: 405, after: 510 },
  { id: 'lol', name: 'League of Legends', src: '/games/lol.svg', before: 165, after: 203 },
  { id: 'apex', name: 'Apex Legends', src: '/games/apex.png', before: 144, after: 188 },
  { id: 'r6', name: 'Rainbow Six Siege', src: '/games/r6.png', before: 210, after: 275 },
  { id: 'cod', name: 'Call of Duty', src: '/games/cod.png', before: 118, after: 152 },
  { id: 'pubg', name: 'PUBG', src: '/games/pubg.png', before: 95, after: 128 },
  { id: 'gtav', name: 'GTA V', src: '/games/gtav.png', before: 82, after: 110 },
  { id: 'minecraft', name: 'Minecraft', src: '/games/minecraft.png', before: 130, after: 206 },
  { id: 'rocket', name: 'Rocket League', src: '/games/rocketleague.png', before: 240, after: 310 },
  { id: 'rust', name: 'Rust', src: '/games/rust.png', before: 78, after: 108 },
  { id: 'eafc', name: 'EA Sports FC', src: '/games/eafc26.png', before: 140, after: 182 },
  { id: 'rdr2', name: 'Red Dead Redemption 2', src: '/games/rdr2.png', before: 62, after: 84 },
  { id: 'dota', name: 'Dota 2', src: '/games/dota2.png', before: 120, after: 158 },
] as const

export function GameResultsSection() {
  const { t } = useI18n()
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section id="resultados" className="game-results-band">
      <div className="section-shell game-results-shell">
        <div className="section-heading centered">
          <span>{t('results.eyebrow')}</span>
          <h2>{t('results.title')}</h2>
          <p>{t('results.body')}</p>
        </div>

        <div className="game-results-controls">
          <button type="button" className="game-results-nav" onClick={() => scrollBy(-1)} aria-label="Previous">
            ‹
          </button>
          <button type="button" className="game-results-nav" onClick={() => scrollBy(1)} aria-label="Next">
            ›
          </button>
        </div>
      </div>

      <div className="game-results-scroller" ref={scrollerRef}>
        {GAME_RESULTS.map((g) => {
          const gain = Math.round(((g.after - g.before) / g.before) * 100)
          return (
            <article className="game-result-card" key={g.id}>
              <header>
                <div>
                  <span className="game-result-cat">{t(`results.${g.id}.cat` as MessageKey)}</span>
                  <h3>{g.name}</h3>
                </div>
                <img src={g.src} alt="" className="game-result-logo" />
              </header>

              <div className="game-result-fps">
                <div>
                  <small>{t('results.without')}</small>
                  <strong>
                    {g.before} <span>{t('results.fpsAvg')}</span>
                  </strong>
                </div>
                <div className="is-boosted">
                  <small>{t('results.with')}</small>
                  <strong>
                    {g.after} <span>{t('results.fpsAvg')}</span>
                  </strong>
                </div>
              </div>

              <div className="game-result-badge">
                +{gain}% {t('results.gain')}
              </div>
              <p>{t(`results.${g.id}.desc` as MessageKey)}</p>
            </article>
          )
        })}
      </div>

      <div className="section-shell">
        <p className="disclaimer">{t('results.disclaimer')}</p>
      </div>
    </section>
  )
}

const HERO_SHOTS = ['inicio', 'tweaks', 'debloat'] as const satisfies readonly PreviewScreen[]

export function HeroPreviewCarousel() {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SHOTS.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="preview-glow" />
      <div className="hero-carousel-stage">
        {HERO_SHOTS.map((screen, i) => (
          <div
            key={screen}
            className={`hero-carousel-slide${i === index ? ' is-active' : ''}`}
            aria-hidden={i !== index}
          >
            <AppPreview screen={screen} />
          </div>
        ))}
      </div>
      <div className="hero-carousel-dots" role="tablist" aria-label={t('screenshots.thumbsAria')}>
        {HERO_SHOTS.map((screen, i) => (
          <button
            key={screen}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={t(`screenshots.${screen}` as MessageKey)}
            className={i === index ? 'is-active' : ''}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, duration])
  return value
}

function StatCard({
  target,
  label,
  dir,
  suffix,
  active,
}: {
  target: number
  label: string
  dir: 'up' | 'down'
  suffix: string
  active: boolean
}) {
  const value = useCountUp(target, active)
  return (
    <article className="stat-card">
      <span className={`stat-dir ${dir}`}>{dir === 'up' ? '↑' : '↓'}</span>
      <b>
        {value}
        {suffix}
      </b>
      <span>{label}</span>
    </article>
  )
}

export function StatsSection() {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const stats = [
    { id: 'fps', suffix: '%', target: 22, label: t('stats.fps'), dir: 'up' as const },
    { id: 'proc', suffix: '%', target: 35, label: t('stats.processes'), dir: 'down' as const },
    { id: 'res', suffix: '%', target: 28, label: t('stats.resources'), dir: 'down' as const },
    { id: 'perf', suffix: '%', target: 40, label: t('stats.performance'), dir: 'up' as const },
  ]

  return (
    <section ref={ref} className="stats-section section-shell section-block">
      <div className="section-heading centered">
        <span>{t('stats.eyebrow')}</span>
        <h2>{t('stats.title')}</h2>
        <p>{t('stats.body')}</p>
      </div>
      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard key={s.id} {...s} active={active} />
        ))}
      </div>
      <p className="disclaimer">{t('stats.disclaimer')}</p>
    </section>
  )
}
