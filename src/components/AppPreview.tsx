import { useI18n } from '../i18n/I18nProvider'
import type { MessageKey } from '../i18n/messages'
import {
  IconAffinity,
  IconBox,
  IconChip,
  IconGamepad,
  IconHome,
  IconSettings,
  IconTrash,
} from './Icons'

export type PreviewScreen = 'inicio' | 'tweaks' | 'juegos' | 'debloat' | 'affinity' | 'bios'

interface AppPreviewProps {
  screen?: PreviewScreen
  flat?: boolean
  className?: string
}

const GENERAL = [
  { key: 'inicio', labelKey: 'app.nav.inicio', Icon: IconHome },
  { key: 'tweaks', labelKey: 'app.nav.tweaks', Icon: IconSettings },
  { key: 'instaladores', labelKey: 'app.nav.instaladores', Icon: IconBox },
  { key: 'juegos', labelKey: 'app.nav.juegos', Icon: IconGamepad },
] as const

const AJUSTES = [
  { key: 'affinity', labelKey: 'app.nav.affinity', Icon: IconAffinity },
  { key: 'debloat', labelKey: 'app.nav.debloat', Icon: IconTrash },
  { key: 'bios', labelKey: 'app.nav.bios', Icon: IconChip },
] as const

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
  const { t } = useI18n()
  const gauges = [
    { label: 'CPU', value: 18 },
    { label: 'GPU', value: 42 },
    { label: 'RAM', value: 36 },
    { label: t('app.inicio.disk'), value: 54 },
    { label: 'CPU °C', value: 48, display: '48°' },
    { label: 'GPU °C', value: 61, display: '61°' },
  ]

  return (
    <>
      <div className="live-panel">
        <div className="live-head">
          <b>{t('app.inicio.live')}</b>
          <span>Ryzen 7 5800X · RTX 3070</span>
        </div>
        <div className="gauges">
          {gauges.map((g) => (
            <Gauge key={g.label} {...g} />
          ))}
        </div>
      </div>
      <div className="cols-2">
        <div className="mini-panel">
          <div className="ph">
            <b>{t('app.inicio.system')}</b>
            <span>Windows 11</span>
          </div>
          <div className="row">
            <div className="meta">
              <b>{t('app.inicio.machine')}</b>
              <span>DESKTOP-TOMZ</span>
            </div>
            <div className="val">x64</div>
          </div>
          <div className="row">
            <div className="meta">
              <b>{t('app.inicio.cpu')}</b>
              <span>{t('app.inicio.cpuMeta')}</span>
            </div>
            <div className="val">3.8 GHz</div>
          </div>
          <div className="row">
            <div className="meta">
              <b>{t('app.inicio.network')}</b>
              <span>{t('app.inicio.networkMeta')}</span>
            </div>
            <div className="val">12 ms</div>
          </div>
        </div>
        <div className="mini-panel">
          <div className="ph">
            <b>{t('app.inicio.hardware')}</b>
            <span>{t('app.inicio.details')}</span>
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
              <div className="s">{t('app.inicio.inUse')}</div>
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
          <b>{t('app.inicio.perf')}</b>
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
  const { t } = useI18n()
  const rows = [
    { title: t('app.tweaks.1.title'), desc: t('app.tweaks.1.desc'), on: true },
    { title: t('app.tweaks.2.title'), desc: t('app.tweaks.2.desc'), on: true },
    { title: t('app.tweaks.3.title'), desc: t('app.tweaks.3.desc'), on: false },
    { title: t('app.tweaks.4.title'), desc: t('app.tweaks.4.desc'), on: true },
    { title: t('app.tweaks.5.title'), desc: t('app.tweaks.5.desc'), on: false },
  ]
  return (
    <>
      <div className="tabs">
        <span className="active">{t('app.tweaks.tabGeneral')}</span>
        <span>{t('app.tweaks.tabGpu')}</span>
        <span>{t('app.tweaks.tabNet')}</span>
        <span>{t('app.tweaks.tabSecurity')}</span>
        <span>{t('app.tweaks.tabGames')}</span>
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
  const { t } = useI18n()
  const games = [
    { name: 'Counter-Strike 2', profile: 'FPS' },
    { name: 'Valorant', profile: 'Net' },
    { name: 'Fortnite', profile: 'Clean' },
  ]
  return (
    <div className="live-panel tweak-list">
      <div className="live-head" style={{ marginBottom: 4 }}>
        <b>{t('app.juegos.heading')}</b>
        <span>{t('app.juegos.add')}</span>
      </div>
      {games.map((g) => (
        <div className="setting" key={g.name}>
          <div>
            <b>{g.name}</b>
            <span>
              {t('app.juegos.profile')} {g.profile} · Auto affinity
            </span>
          </div>
          <div className="switch on" />
        </div>
      ))}
    </div>
  )
}

function DebloatBody() {
  const { t } = useI18n()
  const apps = [
    { name: 'Cortana', desc: t('app.debloat.1.desc'), on: true },
    { name: 'Xbox Game Bar', desc: t('app.debloat.2.desc'), on: true },
    { name: 'OneDrive', desc: t('app.debloat.3.desc'), on: false },
    { name: 'Widgets', desc: t('app.debloat.4.desc'), on: true },
    { name: 'Teams Chat', desc: t('app.debloat.5.desc'), on: true },
  ]
  return (
    <>
      <div className="banner-line">{t('app.debloat.banner')}</div>
      <div className="live-panel tweak-list">
        {apps.map((a) => (
          <div className="setting" key={a.name}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className={`check ${a.on ? 'on' : ''}`} />
              <div>
                <b>{a.name}</b>
                <span>{a.desc}</span>
              </div>
            </div>
            <span className="pill">{a.on ? t('app.debloat.installed') : t('app.debloat.absent')}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function AffinityBody() {
  const { t } = useI18n()
  const procs = [
    { name: 'cs2.exe', prio: t('app.affinity.prioHigh'), cpu: '22%' },
    { name: 'chrome.exe', prio: t('app.affinity.prioNormal'), cpu: '8%' },
    { name: 'discord.exe', prio: t('app.affinity.prioAbove'), cpu: '4%' },
  ]
  return (
    <>
      <div className="metric-row">
        {[
          ['CPU', '18%'],
          [t('app.affinity.threads'), '16'],
          ['GHz', '3.8'],
          ['Cores', '8'],
        ].map(([k, v]) => (
          <div className="metric-card" key={k}>
            <b>{v}</b>
            <span>{k}</span>
          </div>
        ))}
      </div>
      <div className="live-panel tweak-list" style={{ marginTop: 10 }}>
        <div className="live-head">
          <b>{t('app.affinity.processes')}</b>
          <span className="mini-cta">Auto Affinity</span>
        </div>
        {procs.map((p) => (
          <div className="setting" key={p.name}>
            <div>
              <b>{p.name}</b>
              <span>
                {t('app.affinity.priority')} {p.prio}
              </span>
            </div>
            <span className="val">{p.cpu}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function BiosBody() {
  const { t } = useI18n()
  return (
    <div className="cols-2">
      <div className="mini-panel">
        <div className="ph">
          <b>{t('app.bios.board')}</b>
          <span>WMI</span>
        </div>
        {[
          ['CPU', 'Ryzen 7 5800X'],
          ['Cores / Threads', '8 / 16'],
          ['Motherboard', 'ASUS'],
          ['Modelo', 'ROG STRIX B550'],
          ['BIOS', 'American Megatrends'],
          ['Versión', '2803'],
        ].map(([k, v]) => (
          <div className="row" key={k}>
            <div className="meta">
              <b>{k}</b>
            </div>
            <div className="val">{v}</div>
          </div>
        ))}
      </div>
      <div className="mini-panel">
        <div className="ph">
          <b>{t('app.bios.actions')}</b>
          <span>Firmware</span>
        </div>
        <div className="btn-stack">
          <div className="fake-btn primary">{t('app.bios.export')}</div>
          <div className="fake-btn">{t('app.bios.info')}</div>
          <div className="fake-btn">{t('app.bios.folder')}</div>
          <div className="fake-btn">{t('app.bios.enter')}</div>
        </div>
      </div>
    </div>
  )
}

const TITLE_KEYS: Record<PreviewScreen, { kicker: MessageKey; title: MessageKey }> = {
  inicio: { kicker: 'app.inicio.kicker', title: 'app.inicio.title' },
  tweaks: { kicker: 'app.tweaks.kicker', title: 'app.tweaks.title' },
  juegos: { kicker: 'app.juegos.kicker', title: 'app.juegos.title' },
  debloat: { kicker: 'app.debloat.kicker', title: 'app.debloat.title' },
  affinity: { kicker: 'app.affinity.kicker', title: 'app.affinity.title' },
  bios: { kicker: 'app.bios.kicker', title: 'app.bios.title' },
}

function navActive(screen: PreviewScreen, key: string) {
  return screen === key
}

export default function AppPreview({ screen = 'inicio', flat = false, className = '' }: AppPreviewProps) {
  const { t } = useI18n()
  const titles = TITLE_KEYS[screen]

  return (
    <div className={`app-window ${flat ? 'flat' : ''} ${className}`.trim()} aria-label={t('app.aria')}>
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
          <div className="nav-group">{t('app.nav.general')}</div>
          {GENERAL.map(({ key, labelKey, Icon }) => (
            <div key={key} className={`app-nav ${navActive(screen, key) ? 'is-active' : ''}`}>
              <Icon />
              <span>{t(labelKey)}</span>
            </div>
          ))}
          <div className="nav-group">{t('app.nav.settings')}</div>
          {AJUSTES.map(({ key, labelKey, Icon }) => (
            <div key={key} className={`app-nav ${navActive(screen, key) ? 'is-active' : ''}`}>
              <Icon />
              <span>{t(labelKey)}</span>
            </div>
          ))}
          <div className="app-user">
            <div className="avatar">
              T<span className="led" />
            </div>
            <div className="who">
              <b>Tomz</b>
              <small>{t('app.welcome')}</small>
            </div>
          </div>
        </aside>
        <div className="app-main">
          <div className="app-topbar">
            <div className="titles">
              <small>{t(titles.kicker)}</small>
              <b>{t(titles.title)}</b>
            </div>
            <div className="cta">{t('app.ctaCleanup')}</div>
          </div>
          <div className="app-content">
            {screen === 'inicio' && <InicioBody />}
            {screen === 'tweaks' && <TweaksBody />}
            {screen === 'juegos' && <JuegosBody />}
            {screen === 'debloat' && <DebloatBody />}
            {screen === 'affinity' && <AffinityBody />}
            {screen === 'bios' && <BiosBody />}
          </div>
        </div>
      </div>
    </div>
  )
}
