import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { downloadUrl, LINKS, RELEASE } from '../config'
import { IconDownload, IconRocket } from './Icons'

export function DownloadButton({
  className = 'button button-primary',
  label = 'Descargar ahora',
  large = false,
}: {
  className?: string
  label?: string
  large?: boolean
}) {
  const [busy, setBusy] = useState(false)

  function handleClick(_e: MouseEvent<HTMLAnchorElement>) {
    setBusy(true)
    // Indicador visual breve; el atributo download inicia la descarga.
    // Fallback: si el navegador ignora download en cross-origin, abrir en nueva pestaña.
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
          Descargando…
        </>
      ) : (
        <>
          <IconDownload /> {label}
        </>
      )}
    </a>
  )
}

export function DownloadSection() {
  return (
    <section id="download" className="download-section section-shell">
      <div className="download-panel">
        <div className="download-panel-glow" aria-hidden />
        <div className="download-copy">
          <span className="eyebrow">Descarga</span>
          <h2>Download del TOMZ BOOST</h2>
          <p>Instalá el optimizador y empezá a ganar FPS en minutos.</p>

          <ul className="release-meta">
            <li>
              <b>Versión actual</b>
              <span>v{RELEASE.version}</span>
            </li>
            <li>
              <b>Tamaño</b>
              <span>{RELEASE.size}</span>
            </li>
            <li>
              <b>Compatible</b>
              <span>{RELEASE.platforms.join(' · ')}</span>
            </li>
            <li>
              <b>Última actualización</b>
              <span>{RELEASE.updatedAt}</span>
            </li>
          </ul>

          <div className="hero-actions" style={{ marginTop: 28 }}>
            <DownloadButton className="button button-primary" label="Baixar TOMZ BOOST" large />
            <a className="button button-secondary" href={LINKS.installGuide}>
              Ver guía de instalación
            </a>
          </div>
          <small className="dl-note">Compatible con Windows 10 y Windows 11 · ajustes reversibles</small>
        </div>
        <div className="download-visual">
          <IconRocket />
          <img src="/logo.png" alt="TOMZ BOOST" />
        </div>
      </div>
    </section>
  )
}

export function FloatingSocial() {
  return (
    <div className="floating-actions">
      <a
        className="floating-button discord"
        href={LINKS.discord}
        target="_blank"
        rel="noreferrer"
        aria-label="Entrar al Discord"
      >
        <img src="/icons/discord.svg" alt="" width={22} height={22} />
      </a>
      <a
        className="floating-button whatsapp"
        href={LINKS.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Hablar por WhatsApp"
      >
        <img src="/icons/whatsapp.svg" alt="" width={22} height={22} />
      </a>
    </div>
  )
}

const GAMES = [
  { name: 'Counter-Strike 2', src: '/games/cs2.jpg' },
  { name: 'Valorant', src: '/games/valorant.svg' },
  { name: 'Fortnite', src: '/games/fortnite.svg' },
  { name: 'Call of Duty', src: '/games/cod.jpg' },
  { name: 'Apex Legends', src: '/games/apex.jpg' },
  { name: 'Rainbow Six Siege', src: '/games/r6.jpg' },
  { name: 'League of Legends', src: '/games/lol.svg' },
  { name: 'GTA V', src: '/games/gtav.jpg' },
  { name: 'Minecraft', src: '/games/minecraft.jpg' },
  { name: 'PUBG', src: '/games/pubg.jpg' },
  { name: 'Rocket League', src: '/games/rocketleague.jpg' },
  { name: 'Rust', src: '/games/rust.jpg' },
  { name: 'EA FC 26', src: '/games/eafc26.jpg' },
  { name: 'Red Dead Redemption 2', src: '/games/rdr2.jpg' },
  { name: 'Dota 2', src: '/games/dota2.jpg' },
]

export function GamesSection() {
  return (
    <section id="jogos" className="section-block section-shell games-section">
      <div className="section-heading centered">
        <span>Juegos</span>
        <h2>Compatible con tus juegos favoritos</h2>
        <p>Logos oficiales de las marcas. Del competitivo al mundo abierto.</p>
      </div>
      <div className="games-logo-grid">
        {GAMES.map((g) => (
          <article className="game-logo-card" key={g.name} title={g.name}>
            <div className="game-logo-frame">
              <img src={g.src} alt={g.name} loading="lazy" />
            </div>
            <b>{g.name}</b>
          </article>
        ))}
      </div>
    </section>
  )
}

const SHOTS = [
  { id: 'inicio', title: 'Tela Inicial', src: '/screenshots/inicio.png' },
  { id: 'tweaks', title: 'Tweaks', src: '/screenshots/tweaks.png' },
  { id: 'debloat', title: 'Debloat', src: '/screenshots/debloat.png' },
  { id: 'affinity', title: 'Affinity', src: '/screenshots/affinity.png' },
  { id: 'bios', title: 'BIOS', src: '/screenshots/bios.png' },
] as const

export function ScreenshotCarousel() {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const current = SHOTS[index]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % SHOTS.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + SHOTS.length) % SHOTS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section id="capturas" className="section-block section-shell">
      <div className="section-heading centered">
        <span>Software</span>
        <h2>Screenshots del TOMZ BOOST</h2>
        <p>La misma interfaz Adrenalin de la app: Inicio, Tweaks, Debloat, Affinity y BIOS.</p>
      </div>

      <div className="shot-carousel">
        <button
          type="button"
          className="shot-main"
          onClick={() => setLightbox(current.src)}
          aria-label={`Ampliar ${current.title}`}
        >
          <img src={current.src} alt={current.title} />
          <span className="shot-badge">{current.title}</span>
        </button>
        <div className="shot-thumbs" role="tablist" aria-label="Pantallas">
          {SHOTS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={i === index ? 'is-active' : ''}
              onClick={() => setIndex(i)}
            >
              <img src={s.src} alt="" />
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Captura ampliada" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}

const STATS = [
  { id: 'fps', prefix: '', suffix: '%', target: 22, label: 'FPS más estables', dir: 'up' as const },
  { id: 'proc', prefix: '', suffix: '%', target: 35, label: 'Procesos innecesarios', dir: 'down' as const },
  { id: 'res', prefix: '', suffix: '%', target: 28, label: 'Consumo de recursos', dir: 'down' as const },
  { id: 'perf', prefix: '', suffix: '%', target: 40, label: 'Desempeño en juegos', dir: 'up' as const },
]

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
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="stats" className="stats-band" ref={ref}>
      <div className="section-shell">
        <div className="section-heading centered">
          <span>Resultados</span>
          <h2>¿Qué hace el TOMZ BOOST?</h2>
          <p>Contadores ilustrativos del impacto típico tras optimizar el sistema.</p>
        </div>
        <div className="stats-grid">
          {STATS.map((s) => (
            <StatCard key={s.id} {...s} active={active} />
          ))}
        </div>
        <p className="disclaimer">* Valores ilustrativos. El resultado real depende de tu hardware y configuración.</p>
      </div>
    </section>
  )
}
