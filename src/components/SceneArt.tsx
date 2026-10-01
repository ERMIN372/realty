import { useId, type ReactNode } from 'react'
import type { Palette, Scene } from '../types'

/** Детерминированный псевдослучайный генератор — чтобы картинки не «прыгали» между рендерами */
function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Props {
  scene: Scene
  palette: Palette
  seed?: string
  className?: string
}

export const SCENE_LABELS: Record<Scene, string> = {
  'facade-tower': 'Фасад',
  'facade-house': 'Дом',
  'facade-glass': 'Здание',
  living: 'Гостиная',
  kitchen: 'Кухня',
  bedroom: 'Спальня',
  bath: 'Ванная',
  view: 'Вид из окна',
  office: 'Рабочее пространство',
  lobby: 'Лобби',
}

export default function SceneArt({ scene, palette, seed = 'k', className }: Props) {
  const uid = useId().replace(/:/g, '')
  const r = rng(seed + scene)
  const id = (n: string) => `${uid}-${n}`
  const p = palette

  const defs = (
    <defs>
      <linearGradient id={id('wall')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.wall} />
        <stop offset="1" stopColor={p.wall2} />
      </linearGradient>
      <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.floor} stopOpacity="0.85" />
        <stop offset="1" stopColor={p.floor} />
      </linearGradient>
      <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={p.sky} />
        <stop offset="1" stopColor={p.sky2} />
      </linearGradient>
      <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={p.sky} />
        <stop offset="0.55" stopColor={p.sky2} />
        <stop offset="1" stopColor={p.accent} stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id={id('beam')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={id('glow')} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff8e8" stopOpacity="0.9" />
        <stop offset="1" stopColor="#fff8e8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('shade')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.10" />
        <stop offset="0.5" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.08" />
      </linearGradient>
    </defs>
  )

  const skyline = (x: number, y: number, w: number, h: number, color: string, opacity: number, count = 9) => {
    const parts: ReactNode[] = []
    let cx = x
    const bw = w / count
    for (let i = 0; i < count; i++) {
      const bh = h * (0.35 + r() * 0.65)
      const ww = bw * (0.7 + r() * 0.5)
      parts.push(<rect key={i} x={cx} y={y + h - bh} width={ww} height={bh} fill={color} opacity={opacity} />)
      cx += bw
    }
    return <g>{parts}</g>
  }

  const room = (children: ReactNode, horizon = 430) => (
    <>
      <rect width="800" height={horizon} fill={`url(#${id('wall')})`} />
      <rect y={horizon} width="800" height={600 - horizon} fill={`url(#${id('floor')})`} />
      <rect y={horizon - 6} width="800" height="6" fill="#fff" opacity="0.5" />
      {children}
      <rect width="800" height="600" fill={`url(#${id('shade')})`} />
    </>
  )

  const windowFrame = (x: number, y: number, w: number, h: number, cols = 2, rows = 1) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id('sky')})`} />
      {skyline(x, y + h * 0.45, w, h * 0.55, p.accent, 0.18, 10)}
      {skyline(x + 10, y + h * 0.62, w - 10, h * 0.38, p.accent, 0.28, 7)}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#fff" strokeWidth="10" />
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line key={'c' + i} x1={x + (w / cols) * (i + 1)} y1={y} x2={x + (w / cols) * (i + 1)} y2={y + h} stroke="#fff" strokeWidth="6" />
      ))}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <line key={'r' + i} x1={x} y1={y + (h / rows) * (i + 1)} x2={x + w} y2={y + (h / rows) * (i + 1)} stroke="#fff" strokeWidth="6" />
      ))}
    </g>
  )

  const plant = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-38, -18, 0, 20, 36].map((a, i) => (
        <ellipse key={i} cx={0} cy={-70} rx="14" ry="48" fill={i % 2 ? '#56705a' : '#6d8a6f'} transform={`rotate(${a} 0 0)`} />
      ))}
      <path d="M-26 0 h52 l-8 44 h-36 z" fill={p.accent2} />
    </g>
  )

  let content: ReactNode

  switch (scene) {
    case 'living':
      content = room(
        <>
          {windowFrame(70, 60, 300, 330, 2, 2)}
          <polygon points="70,430 370,430 470,600 0,600" fill={`url(#${id('beam')})`} />
          <rect x="520" y="110" width="170" height="120" fill="#fff" />
          <rect x="532" y="122" width="146" height="96" fill={p.wall2} />
          <circle cx="585" cy="170" r="28" fill={p.accent2} opacity="0.9" />
          <rect x="600" y="150" width="60" height="46" fill={p.accent} opacity="0.8" />
          {/* торшер */}
          <line x1="455" y1="430" x2="455" y2="190" stroke={p.accent} strokeWidth="4" />
          <path d="M425 190 h60 l-10 -46 h-40 z" fill="#fff" />
          <circle cx="455" cy="200" r="70" fill={`url(#${id('glow')})`} />
          {/* ковёр */}
          <ellipse cx="560" cy="520" rx="240" ry="44" fill={p.accent2} opacity="0.45" />
          {/* диван */}
          <rect x="420" y="290" width="330" height="80" rx="22" fill={p.accent} />
          <rect x="405" y="345" width="360" height="85" rx="20" fill={p.accent} />
          <rect x="440" y="340" width="145" height="40" rx="12" fill="#fff" opacity="0.12" />
          <rect x="590" y="340" width="145" height="40" rx="12" fill="#fff" opacity="0.12" />
          <rect x="470" y="305" width="54" height="44" rx="10" fill={p.accent2} />
          <rect x="420" y="428" width="8" height="16" fill={p.accent} />
          <rect x="742" y="428" width="8" height="16" fill={p.accent} />
          {/* столик */}
          <ellipse cx="560" cy="490" rx="90" ry="16" fill="#fff" />
          <rect x="556" y="490" width="8" height="40" fill={p.accent} opacity="0.7" />
          <rect x="530" y="468" width="30" height="20" rx="3" fill={p.accent2} />
          {plant(140, 430, 1)}
        </>,
      )
      break

    case 'kitchen':
      content = room(
        <>
          {windowFrame(60, 80, 230, 250, 2, 1)}
          <rect x="330" y="70" width="440" height="120" fill="#fff" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={338 + i * 108} y="78" width="100" height="104" fill={p.wall} />
              <line x1={385 + i * 108} y1="120" x2={385 + i * 108} y2="145" stroke={p.accent} strokeWidth="3" />
            </g>
          ))}
          <rect x="330" y="190" width="440" height="110" fill={p.accent2} opacity="0.25" />
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={330 + i * 40} y1="190" x2={330 + i * 40} y2="300" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
          ))}
          <rect x="320" y="300" width="460" height="14" fill="#fff" />
          <rect x="330" y="314" width="440" height="116" fill={p.accent} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={330 + i * 110} y1="314" x2={330 + i * 110} y2="430" stroke="#fff" strokeOpacity="0.15" strokeWidth="2" />
          ))}
          <rect x="500" y="250" width="110" height="50" fill="#1b1b1b" opacity="0.15" />
          {/* остров */}
          <rect x="130" y="400" width="460" height="18" fill="#fff" />
          <rect x="140" y="418" width="440" height="110" fill={p.wall2} />
          <rect x="140" y="418" width="440" height="110" fill={p.accent} opacity="0.1" />
          {[210, 330, 450].map((x) => (
            <g key={x}>
              <circle cx={x} cy="520" r="24" fill={p.accent2} />
              <line x1={x - 14} y1="540" x2={x - 22} y2="590" stroke={p.accent} strokeWidth="4" />
              <line x1={x + 14} y1="540" x2={x + 22} y2="590" stroke={p.accent} strokeWidth="4" />
            </g>
          ))}
          {/* подвесные лампы */}
          {[230, 360, 490].map((x) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x} y2="250" stroke={p.accent} strokeWidth="2" />
              <path d={`M${x - 30} 280 a30 30 0 0 1 60 0 z`} fill={p.accent} />
              <circle cx={x} cy="300" r="60" fill={`url(#${id('glow')})`} />
            </g>
          ))}
          <rect x="250" y="380" width="46" height="20" rx="4" fill={p.accent2} />
          {plant(730, 300, 0.55)}
        </>,
      )
      break

    case 'bedroom':
      content = room(
        <>
          {windowFrame(40, 70, 150, 300, 1, 2)}
          <rect x="18" y="50" width="40" height="390" fill={p.accent2} opacity="0.55" />
          <rect x="172" y="50" width="40" height="390" fill={p.accent2} opacity="0.55" />
          <path d="M600 90 a70 70 0 0 1 140 0 v200 h-140 z" fill="#fff" opacity="0.8" />
          <path d="M612 94 a58 58 0 0 1 116 0 v184 h-116 z" fill={`url(#${id('sky')})`} opacity="0.6" />
          {/* изголовье */}
          <rect x="250" y="200" width="330" height="170" rx="24" fill={p.accent} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={290 + i * 62} y1="214" x2={290 + i * 62} y2="360" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
          ))}
          <rect x="230" y="340" width="370" height="130" rx="18" fill="#fff" />
          <rect x="230" y="400" width="370" height="70" rx="14" fill={p.wall2} />
          <rect x="230" y="420" width="370" height="26" fill={p.accent2} opacity="0.8" />
          <rect x="270" y="312" width="130" height="52" rx="16" fill="#fff" stroke={p.wall2} strokeWidth="3" />
          <rect x="430" y="312" width="130" height="52" rx="16" fill="#fff" stroke={p.wall2} strokeWidth="3" />
          <rect x="225" y="468" width="10" height="20" fill={p.accent} />
          <rect x="595" y="468" width="10" height="20" fill={p.accent} />
          {/* тумбы и лампы */}
          {[170, 620].map((x) => (
            <g key={x}>
              <rect x={x} y="370" width="70" height="70" rx="6" fill={p.accent2} />
              <line x1={x + 35} y1="370" x2={x + 35} y2="320" stroke={p.accent} strokeWidth="3" />
              <path d={`M${x + 12} 320 h46 l-8 -34 h-30 z`} fill="#fff" />
              <circle cx={x + 35} cy="315" r="50" fill={`url(#${id('glow')})`} />
            </g>
          ))}
          <ellipse cx="415" cy="545" rx="260" ry="36" fill={p.accent2} opacity="0.35" />
        </>,
      )
      break

    case 'bath':
      content = room(
        <>
          {Array.from({ length: 21 }, (_, i) => (
            <line key={'v' + i} x1={i * 40} y1="0" x2={i * 40} y2="430" stroke="#fff" strokeWidth="1.5" opacity="0.55" />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={'h' + i} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="#fff" strokeWidth="1.5" opacity="0.55" />
          ))}
          <circle cx="600" cy="170" r="88" fill="#fff" />
          <circle cx="600" cy="170" r="78" fill={`url(#${id('sky')})`} opacity="0.75" />
          <rect x="500" y="300" width="200" height="16" rx="4" fill="#fff" />
          <rect x="510" y="316" width="180" height="90" rx="6" fill={p.accent} />
          <ellipse cx="600" cy="300" rx="50" ry="8" fill={p.wall2} />
          <path d="M600 262 v24 h14" fill="none" stroke={p.accent2} strokeWidth="5" strokeLinecap="round" />
          {/* ванна */}
          <path d="M70 360 h330 q0 110 -90 110 h-150 q-90 0 -90 -110 z" fill="#fff" />
          <path d="M70 360 h330" stroke={p.wall2} strokeWidth="6" />
          <rect x="115" y="470" width="10" height="22" fill={p.accent2} />
          <rect x="345" y="470" width="10" height="22" fill={p.accent2} />
          <path d="M360 360 v-120 h-40" fill="none" stroke={p.accent2} strokeWidth="6" strokeLinecap="round" />
          <rect x="720" y="220" width="46" height="130" rx="6" fill={p.accent2} opacity="0.85" />
          <line x1="712" y1="220" x2="774" y2="220" stroke={p.accent} strokeWidth="4" />
          {plant(460, 430, 0.6)}
          <polygon points="0,430 800,430 800,600 0,600" fill="#fff" opacity="0.08" />
        </>,
      )
      break

    case 'view':
      content = (
        <>
          <rect width="800" height="600" fill={`url(#${id('sky')})`} />
          <circle cx="560" cy="210" r="60" fill="#fff" opacity="0.7" />
          <circle cx="560" cy="210" r="140" fill={`url(#${id('glow')})`} />
          {skyline(0, 220, 800, 180, p.accent, 0.14, 16)}
          {skyline(0, 280, 800, 170, p.accent, 0.24, 12)}
          {skyline(0, 350, 800, 140, p.accent, 0.4, 9)}
          <rect y="470" width="800" height="130" fill={p.accent} opacity="0.55" />
          <rect y="470" width="800" height="130" fill={`url(#${id('beam')})`} opacity="0.5" />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={40 + i * 95} y1={500 + (i % 3) * 22} x2={90 + i * 95} y2={500 + (i % 3) * 22} stroke="#fff" strokeOpacity="0.4" strokeWidth="2" />
          ))}
          {/* рама и перила */}
          <rect x="0" y="0" width="800" height="600" fill="none" stroke={p.wall} strokeWidth="40" />
          <line x1="400" y1="0" x2="400" y2="600" stroke={p.wall} strokeWidth="14" />
          <line x1="0" y1="440" x2="800" y2="440" stroke={p.accent} strokeWidth="5" opacity="0.8" />
          {Array.from({ length: 17 }, (_, i) => (
            <line key={'b' + i} x1={20 + i * 48} y1="440" x2={20 + i * 48} y2="600" stroke={p.accent} strokeWidth="3" opacity="0.6" />
          ))}
        </>
      )
      break

    case 'facade-tower': {
      const cols = 7
      const rows = 14
      const lit = Array.from({ length: cols * rows }, () => r() > 0.72)
      content = (
        <>
          <rect width="800" height="600" fill={`url(#${id('sky')})`} />
          {skyline(0, 260, 800, 260, p.accent, 0.1, 12)}
          <rect x="90" y="190" width="170" height="340" fill={p.accent} opacity="0.35" />
          <rect x="560" y="150" width="190" height="380" fill={p.accent} opacity="0.25" />
          {/* главный дом */}
          <rect x="270" y="60" width="290" height="470" fill={p.wall} />
          <rect x="270" y="60" width="290" height="470" fill={`url(#${id('shade')})`} />
          <rect x="262" y="52" width="306" height="14" fill={p.accent} opacity="0.85" />
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const lx = 288 + col * 38
              const ly = 84 + row * 30
              return (
                <rect
                  key={`${row}-${col}`}
                  x={lx}
                  y={ly}
                  width="24"
                  height="20"
                  fill={lit[row * cols + col] ? '#f6e3b8' : p.accent}
                  opacity={lit[row * cols + col] ? 0.95 : 0.55}
                />
              )
            }),
          )}
          <rect x="370" y="470" width="90" height="60" fill={p.accent} />
          <rect x="378" y="478" width="74" height="52" fill={`url(#${id('glass')})`} />
          {/* деревья */}
          {[80, 150, 620, 700].map((x, i) => (
            <g key={x}>
              <rect x={x - 3} y="490" width="6" height="40" fill={p.accent} opacity="0.6" />
              <circle cx={x} cy={480 - (i % 2) * 10} r={30 + (i % 2) * 8} fill="#62806a" opacity="0.9" />
            </g>
          ))}
          <rect y="530" width="800" height="70" fill={p.floor} opacity="0.7" />
          <rect y="530" width="800" height="4" fill="#fff" opacity="0.6" />
        </>
      )
      break
    }

    case 'facade-house':
      content = (
        <>
          <rect width="800" height="600" fill={`url(#${id('sky')})`} />
          <circle cx="640" cy="130" r="50" fill="#fff" opacity="0.6" />
          {Array.from({ length: 12 }, (_, i) => {
            const x = i * 72 + r() * 20
            const h = 140 + r() * 120
            return <polygon key={i} points={`${x},440 ${x + 30},${440 - h} ${x + 60},440`} fill="#4c6a55" opacity={0.35 + r() * 0.3} />
          })}
          <rect y="430" width="800" height="170" fill="#8fa684" />
          <rect y="430" width="800" height="170" fill={`url(#${id('beam')})`} opacity="0.4" />
          {/* дом */}
          <polygon points="150,250 330,130 510,250" fill={p.accent} />
          <rect x="170" y="250" width="320" height="200" fill={p.wall} />
          <rect x="490" y="300" width="200" height="150" fill={p.wall2} />
          <rect x="480" y="290" width="220" height="14" fill={p.accent} />
          <rect x="200" y="290" width="120" height="160" fill={`url(#${id('glass')})`} />
          <line x1="260" y1="290" x2="260" y2="450" stroke={p.accent} strokeWidth="4" />
          <rect x="350" y="290" width="110" height="80" fill={`url(#${id('glass')})`} />
          <rect x="515" y="330" width="150" height="120" fill={`url(#${id('glass')})`} />
          <line x1="590" y1="330" x2="590" y2="450" stroke={p.accent} strokeWidth="4" />
          <rect x="290" y="170" width="80" height="60" fill={`url(#${id('glass')})`} />
          <rect x="170" y="440" width="520" height="12" fill={p.accent2} />
          <path d="M395 452 L360 600 L440 600 L410 452 z" fill={p.floor} opacity="0.8" />
          <circle cx="230" cy="400" r="70" fill={`url(#${id('glow')})`} opacity="0.7" />
          {[90, 730].map((x) => (
            <g key={x}>
              <rect x={x - 4} y="400" width="8" height="50" fill={p.accent} opacity="0.6" />
              <circle cx={x} cy="385" r="42" fill="#5f7d66" />
            </g>
          ))}
        </>
      )
      break

    case 'facade-glass':
      content = (
        <>
          <rect width="800" height="600" fill={`url(#${id('sky')})`} />
          {skyline(0, 220, 800, 300, p.accent, 0.12, 10)}
          <polygon points="250,40 560,80 560,500 250,500" fill={`url(#${id('glass')})`} />
          <polygon points="560,80 640,110 640,500 560,500" fill={p.accent} opacity="0.55" />
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={250 + i * 31} y1={40 + i * 4} x2={250 + i * 31} y2="500" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <line key={'h' + i} x1="250" y1={70 + i * 29} x2="560" y2={70 + i * 29 + 4} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
          ))}
          <polygon points="250,40 560,80 560,200 250,120" fill="#fff" opacity="0.18" />
          <rect x="200" y="440" width="480" height="90" fill={p.accent} />
          <rect x="220" y="455" width="440" height="75" fill={`url(#${id('glass')})`} opacity="0.85" />
          {[330, 440, 550].map((x) => (
            <line key={x} x1={x} y1="455" x2={x} y2="530" stroke={p.accent} strokeWidth="5" />
          ))}
          <rect x="200" y="430" width="480" height="12" fill={p.accent2} />
          <rect y="530" width="800" height="70" fill={p.floor} opacity="0.6" />
          <rect y="530" width="800" height="4" fill="#fff" opacity="0.6" />
          {[120, 740].map((x) => (
            <g key={x}>
              <rect x={x - 3} y="490" width="6" height="40" fill={p.accent} opacity="0.6" />
              <circle cx={x} cy="480" r="32" fill="#62806a" />
            </g>
          ))}
        </>
      )
      break

    case 'office':
      content = room(
        <>
          {windowFrame(0, 50, 800, 300, 6, 1)}
          {[120, 280, 440, 600].map((x) => (
            <g key={x}>
              <rect x={x} y="12" width="90" height="8" rx="4" fill="#fff" />
              <ellipse cx={x + 45} cy="30" rx="80" ry="18" fill={`url(#${id('glow')})`} />
            </g>
          ))}
          {[0, 1].map((row) => (
            <g key={row}>
              <rect x={80 + row * 30} y={400 + row * 90} width={620 - row * 60} height="14" rx="3" fill="#fff" />
              <rect x={100 + row * 30} y={414 + row * 90} width="8" height="60" fill={p.accent} />
              <rect x={680 - row * 30} y={414 + row * 90} width="8" height="60" fill={p.accent} />
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <rect x={130 + row * 30 + i * 140} y={352 + row * 90} width="70" height="46" rx="4" fill={p.accent} />
                  <rect x={134 + row * 30 + i * 140} y={356 + row * 90} width="62" height="38" rx="2" fill={`url(#${id('glass')})`} opacity="0.7" />
                  <rect x={162 + row * 30 + i * 140} y={398 + row * 90} width="6" height="4" fill={p.accent} />
                </g>
              ))}
            </g>
          ))}
          {plant(40, 430, 0.8)}
          {plant(760, 430, 0.8)}
        </>,
        400,
      )
      break

    case 'lobby':
      content = room(
        <>
          {[90, 250, 550, 710].map((x) => (
            <g key={x}>
              <rect x={x - 22} y="0" width="44" height="430" fill="#fff" opacity="0.55" />
              <rect x={x - 22} y="0" width="10" height="430" fill={p.accent} opacity="0.06" />
            </g>
          ))}
          <rect x="310" y="120" width="180" height="180" fill="none" stroke={p.accent} strokeWidth="1.5" opacity="0.35" />
          <circle cx="400" cy="210" r="46" fill="none" stroke={p.accent} strokeWidth="3" />
          <text x="400" y="228" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="52" fill={p.accent}>
            К
          </text>
          <line x1="400" y1="0" x2="400" y2="60" stroke={p.accent} strokeWidth="2" />
          <ellipse cx="400" cy="72" rx="80" ry="14" fill={p.accent2} />
          <ellipse cx="400" cy="90" rx="160" ry="40" fill={`url(#${id('glow')})`} />
          <rect x="260" y="350" width="280" height="14" fill="#fff" />
          <rect x="270" y="364" width="260" height="90" fill={p.accent} />
          <rect x="270" y="364" width="260" height="90" fill={`url(#${id('shade')})`} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={i * 100} y1="430" x2={i * 100 - 120} y2="600" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.5" />
          ))}
          <ellipse cx="400" cy="520" rx="300" ry="30" fill="#fff" opacity="0.15" />
          {plant(170, 430, 0.9)}
          {plant(630, 430, 0.9)}
        </>,
      )
      break
  }

  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={SCENE_LABELS[scene]}>
      {defs}
      {content}
    </svg>
  )
}
