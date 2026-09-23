import {
  IconAffinity,
  IconBox,
  IconChip,
  IconGamepad,
  IconHome,
  IconSettings,
  IconTrash,
} from './Icons'

export type PreviewScreen = 'inicio' | 'tweaks' | 'juegos'

interface AppPreviewProps {
  screen?: PreviewScreen
  flat?: boolean
  className?: string
}

const GENERAL = [
  { key: 'inicio', label: 'Inicio', Icon: IconHome },
  { key: 'tweaks', label: 'Tweaks', Icon: IconSettings },
  { key: 'instaladores', label: 'Instaladores', Icon: IconBox },
  { key: 'juegos', label: 'Juegos', Icon: IconGamepad },
] as const

const AJUSTES = [
  { key: 'affinity', label: 'Affinity', Icon: IconAffinity },
  { key: 'debloat', label: 'Debloat', Icon: IconTrash },
  { key: 'bios', label: 'Bios', Icon: IconChip },
] as const

const GAUGES = [
  { label: 'CPU', value: 18 },
  { label: 'GPU', value: 42 },
  { label: 'RAM', value: 36 },
  { label: 'Disco', value: 54 },
  { label: 'CPU °C', value: 48, display: '48°' },
  { label: 'GPU °C', value: 61, display: '61°' },
]

const CHART = [42, 55, 40, 68, 52, 78, 70, 88, 74, 92]

function Gauge({ value, label, display }: { value: number; label: string; display?: string }) {
  const size = 52
  const radius = size / 2 - 4
  const c = 2 * Math.PI * radius
  const dash = c * (value / 100)
  return (
    <div className="gauge-item">
      <div className="gauge-ring">
        <svg viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#2a2a2a" strokeWidth="3.5" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f2f2f2"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ animation: 'gauge-draw 1s cubic-bezier(0.22, 1, 0.36, 1) both' }}
          />
        </svg>
        <strong>{display ?? `${value}%`}</strong>
      </div>
      <div className="label">{label}</div>
    </div>
  )
}

function InicioBody() {
  return (
    <>
      <div className="live-panel">
        <div className="live-head">
          <b>Rendimiento en vivo</b>
          <span>Ryzen 7 5800X · RTX 3070</span>
        </div>
        <div className="gauges">
          {GAUGES.map((g) => (
            <Gauge key={g.label} {...g} />
          ))}
        </div>
      </div>

      <div className="cols-2">
        <div className="mini-panel">
          <div className="ph">
            <b>Sistema</b>
            <span>Windows 11</span>
          </div>
          <div className="row">
            <div className="meta">
              <b>Máquina</b>
              <span>DESKTOP-TOMZ</span>
            </div>
            <div className="val">x64</div>
          </div>
          <div className="row">
            <div className="meta">
              <b>Procesador</b>
              <span>8 núcleos · 16 hilos</span>
            </div>
            <div className="val">3.8 GHz</div>
          </div>
          <div className="row">
            <div className="meta">
              <b>Red</b>
              <span>Ethernet · DNS 1.1.1.1</span>
            </div>
            <div className="val">12 ms</div>
          </div>
        </div>

        <div className="mini-panel">
          <div className="ph">
            <b>Hardware</b>
            <span>Detalles</span>
          </div>
          <div className="hw-grid">
            <div className="hw-cell">
              <div className="k">GPU</div>
              <div className="v">RTX 3070</div>
              <div className="s">1725 MHz</div>
            </div>
            <div className="hw-cell">
              <div className="k">VRAM</div>
              <div className="v">3.2 / 8.0 GB</div>
              <div className="s">En uso</div>
            </div>
            <div className="hw-cell">
              <div className="k">CPU</div>
              <div className="v">Ryzen 7 5800X</div>
              <div className="s">AMD</div>
            </div>
            <div className="hw-cell">
              <div className="k">RAM</div>
              <div className="v">11.5 / 32 GB</div>
              <div className="s">36%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-panel">
        <div className="ph">
          <b>Rendimiento</b>
          <span>1 min</span>
        </div>
        <div className="chart-line">
          {CHART.map((h, i) => (
            <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.04}s` }} />
          ))}
        </div>
      </div>
    </>
  )
}

function TweaksBody() {
  const rows = [
    { title: 'Desactivar telemetría', desc: 'Reduce procesos en segundo plano', on: true },
    { title: 'Modo alto rendimiento', desc: 'Plan de energía para juegos', on: true },
    { title: 'Prioridad de red para juegos', desc: 'QoS y latencia más baja', on: false },
    { title: 'Perfil NVIDIA competitivo', desc: 'Baja latencia + máximo rendimiento', on: true },
    { title: 'Servicios innecesarios', desc: 'Pausa servicios que no usás', on: false },
  ]
  return (
    <>
      <div className="tabs">
        <span className="active">General</span>
        <span>GPU</span>
        <span>Red</span>
        <span>Seguridad</span>
        <span>Juegos</span>
      </div>
      <div className="live-panel tweak-list">
        {rows.map((r) => (
          <div className="setting" key={r.title}>
            <div>
              <b>{r.title}</b>
              <span>{r.desc}</span>
            </div>
            <div className={`switch ${r.on ? 'on' : ''}`} />
          </div>
        ))}
      </div>
    </>
  )
}

function JuegosBody() {
  const games = [
    { name: 'Counter-Strike 2', profile: 'FPS' },
    { name: 'Valorant', profile: 'Net' },
    { name: 'Fortnite', profile: 'Clean' },
  ]
  return (
    <div className="live-panel tweak-list">
      <div className="live-head" style={{ marginBottom: 4 }}>
        <b>Tus juegos</b>
        <span>+ Agregar .exe</span>
      </div>
      {games.map((g) => (
        <div className="setting" key={g.name}>
          <div>
            <b>{g.name}</b>
            <span>Perfil {g.profile} · Auto affinity</span>
          </div>
          <div className="switch on" />
        </div>
      ))}
    </div>
  )
}

const TITLES: Record<PreviewScreen, { kicker: string; title: string }> = {
  inicio: { kicker: 'Vista general', title: 'Vista General del Sistema' },
  tweaks: { kicker: 'Rendimiento', title: 'Tweaks de Rendimiento' },
  juegos: { kicker: 'Perfiles', title: 'Juegos' },
}

export default function AppPreview({ screen = 'inicio', flat = false, className = '' }: AppPreviewProps) {
  const active = screen === 'juegos' ? 'juegos' : screen
  const titles = TITLES[screen]

  return (
    <div className={`app-window ${flat ? 'flat' : ''} ${className}`.trim()} aria-label="Interfaz de Tomz Boost">
      <div className="app-titlebar">
        <span>Tomz Boost</span>
        <div className="dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="app-shell-preview">
        <aside className="app-sidebar">
          <div className="brand">
            <img src="/logo.png" alt="TOMZ BOOST" />
          </div>
          <div className="nav-group">General</div>
          {GENERAL.map(({ key, label, Icon }) => (
            <div key={key} className={`app-nav ${active === key ? 'is-active' : ''}`}>
              <Icon />
              <span>{label}</span>
            </div>
          ))}
          <div className="nav-group">Ajustes</div>
          {AJUSTES.map(({ key, label, Icon }) => (
            <div key={key} className="app-nav">
              <Icon />
              <span>{label}</span>
            </div>
          ))}
          <div className="app-user">
            <div className="avatar">
              T<span className="led" />
            </div>
            <div className="who">
              <b>Tomz</b>
              <small>Bienvenido</small>
            </div>
          </div>
        </aside>
        <div className="app-main">
          <div className="app-topbar">
            <div className="titles">
              <small>{titles.kicker}</small>
              <b>{titles.title}</b>
            </div>
            <div className="cta">Ejecutar limpieza</div>
          </div>
          <div className="app-content">
            {screen === 'inicio' && <InicioBody />}
            {screen === 'tweaks' && <TweaksBody />}
            {screen === 'juegos' && <JuegosBody />}
          </div>
        </div>
      </div>
    </div>
  )
}
