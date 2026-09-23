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

const BENEFITS = [
  { n: '01', title: 'Más FPS', desc: 'Aumentá el rendimiento de tus juegos.', Icon: IconGauge },
  { n: '02', title: 'Menos input lag', desc: 'Respuestas más rápidas en cada comando.', Icon: IconPointer },
  { n: '03', title: 'Menos procesos', desc: 'Cortá tareas innecesarias en segundo plano.', Icon: IconLayers },
  { n: '04', title: 'Optimización automática', desc: 'Limpieza y ajustes en pocos clics.', Icon: IconSparkles },
  { n: '05', title: 'Tweaks avanzados', desc: 'Configuraciones reales pensadas para gamers.', Icon: IconSettings },
  { n: '06', title: 'Interfaz simple', desc: 'El mismo lenguaje visual de la app de escritorio.', Icon: IconGamepad },
]

const FAQS = [
  { q: '¿El programa es seguro?', a: 'Sí. Los ajustes son reversibles y podés deshacer cambios cuando quieras.' },
  { q: '¿Funciona en Windows 10?', a: 'Sí.' },
  { q: '¿Funciona en Windows 11?', a: 'Sí.' },
  { q: '¿Necesito saber de informática?', a: 'No. La app está hecha para ser simple: monitoreás, aplicás y listo.' },
]

const TESTIMONIALS = [
  { quote: 'Mi CS2 quedó mucho más estable.', name: 'Rafael M.', meta: 'Counter-Strike 2', initial: 'R' },
  { quote: 'Gané rendimiento en Fortnite y Valorant.', name: 'Lucas A.', meta: 'Fortnite + Valorant', initial: 'L' },
  { quote: 'Interfaz simple y optimización rápida.', name: 'Matheus R.', meta: 'Windows 11', initial: 'M' },
]

function Stars() {
  return (
    <div className="stars" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} />
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
  const [shot, setShot] = useState<PreviewScreen | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('shot')
    if (s === 'inicio' || s === 'tweaks' || s === 'juegos' || s === 'debloat' || s === 'affinity' || s === 'bios') {
      setShot(s)
    }
  }, [])

  if (shot) return <ShotPage screen={shot} />

  return (
    <main>
      <header className="site-header">
        <a href="#top" aria-label="TOMZ BOOST — inicio">
          <img src="/logo.png" alt="TOMZ BOOST" className="header-logo" />
        </a>
        <nav aria-label="Navegación principal">
          <a href="#beneficios">Beneficios</a>
          <a href="#capturas">Capturas</a>
          <a href="#jogos">Juegos</a>
          <a href="#servicios">Servicios</a>
          <a href="#download">Download</a>
          <a href="#faq">FAQ</a>
        </nav>
        <DownloadButton className="header-cta" label="Baixar agora" />
      </header>

      <div className="hero-top">
        <GamesMarquee />
      </div>

      <section id="top" className="hero section-shell">
        <div className="hero-copy reveal">
          <div className="eyebrow">
            <IconZap /> Performance sin complicaciones
          </div>
          <h1>
            Ganá más FPS y sacá el <em>máximo</em> de tu PC
          </h1>
          <p>
            Optimizá Windows en pocos clics, reducí procesos innecesarios y aumentá el rendimiento de tus juegos
            favoritos — con la misma interfaz monocromática premium de Tomz Boost.
          </p>
          <div className="hero-actions">
            <DownloadButton label="Baixar agora" />
            <a className="button button-secondary" href="#servicios">
              <IconSparkles /> Optimización completa
            </a>
            <a className="button button-secondary" href={LINKS.discord} target="_blank" rel="noreferrer">
              <IconMessage /> Entrar al Discord
            </a>
          </div>
          <div className="trust-row">
            <span>
              <IconShield /> Ajustes reversibles
            </span>
            <span>
              <IconCheck /> Windows 10 y 11
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
          <span>Qué ganás</span>
          <h2>
            Tu PC más liviana.
            <br />
            Tu juego más fluido.
          </h2>
          <p>
            Un conjunto completo de ajustes pensado para quien quiere jugar mejor, sin perder tiempo en
            configuraciones complejas.
          </p>
        </div>
        <div className="benefit-grid">
          {BENEFITS.map(({ n, title, desc, Icon }) => (
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
            <span>Antes y después</span>
            <h2>La diferencia se siente en el juego</h2>
            <p>Menos recursos desperdiciados. Más estabilidad donde importa.</p>
          </div>
          <div className="comparison-wrap">
            <article className="compare-card before">
              <header>
                <span>SIN OPTIMIZACIÓN</span>
                <strong>Antes</strong>
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
                <li>FPS inestable</li>
                <li>Stuttering</li>
                <li>Uso excesivo de RAM</li>
                <li>Procesos innecesarios</li>
              </ul>
            </article>
            <div className="compare-arrow">
              <IconArrowRight />
            </div>
            <article className="compare-card after">
              <header>
                <span>CON TOMZ BOOST</span>
                <strong>Después</strong>
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
                <li>FPS más estable</li>
                <li>Menos travamientos</li>
                <li>Menor uso de recursos</li>
                <li>Sistema optimizado</li>
              </ul>
            </article>
          </div>
          <p className="disclaimer">
            * Comparación ilustrativa. Los resultados varían según hardware, sistema y configuración de cada juego.
          </p>
        </div>
      </section>

      <GamesSection />

      <section className="steps-band">
        <div className="section-shell">
          <div className="section-heading">
            <span>Cómo funciona</span>
            <h2>Tres pasos. Más performance.</h2>
          </div>
          <div className="steps-grid">
            <article className="step">
              <span>01</span>
              <div>
                <h3>Descargá Tomz Boost</h3>
                <p>Instalá el software en tu Windows.</p>
              </div>
            </article>
            <article className="step">
              <span>02</span>
              <div>
                <h3>Ejecutá la optimización</h3>
                <p>Aplicá limpieza y tweaks en pocos clics.</p>
              </div>
            </article>
            <article className="step">
              <span>03</span>
              <div>
                <h3>Abrí tus juegos</h3>
                <p>Jugá con el sistema listo y optimizado.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="guia" className="section-block section-shell">
        <div className="section-heading centered">
          <span>Instalación</span>
          <h2>Guía rápida</h2>
          <p>Descargá el ZIP, ejecutá el instalador como administrador y activá tu licencia.</p>
        </div>
      </section>

      <section className="section-block section-shell testimonials">
        <div className="section-heading centered">
          <span>Quién lo usa, lo siente</span>
          <h2>Hecho para jugadores de verdad</h2>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <article className="testimonial" key={t.name}>
              <Stars />
              <blockquote>“{t.quote}”</blockquote>
              <footer>
                <span>{t.initial}</span>
                <div>
                  <b>{t.name}</b>
                  <small>{t.meta}</small>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="faq-band">
        <div className="section-shell faq-layout">
          <div className="section-heading">
            <span>Dudas frecuentes</span>
            <h2>Todo lo que necesitás saber</h2>
            <p>¿Todavía necesitás ayuda? Hablá con la comunidad en Discord.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>
                  {f.q}
                  <IconChevron />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />

      <DownloadSection />

      <footer className="site-footer section-shell">
        <img src="/logo.png" alt="TOMZ BOOST" className="footer-logo" />
        <p>Performance en cada clic.</p>
        <span>© {new Date().getFullYear()} TOMZ BOOST</span>
      </footer>

      <FloatingSocial />
    </main>
  )
}
