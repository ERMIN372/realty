import { MapPin } from 'lucide-react'

/** Схематичная карта без внешних тайлов — чистый SVG */
export default function MapPlaceholder({ x, y, label, district }: { x: number; y: number; label: string; district: string }) {
  const px = (x / 100) * 800
  const py = (y / 100) * 480
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-[#f3f4f1]">
      <svg viewBox="0 0 800 480" className="block h-auto w-full" role="img" aria-label={`Схема расположения: ${label}`}>
        <rect width="800" height="480" fill="#f3f4f1" />
        {/* парки */}
        <path d="M560 40 q90 -10 150 40 q40 60 -10 110 q-70 40 -140 -10 q-50 -60 0 -140z" fill="#dfe8da" />
        <path d="M60 330 q70 -40 140 0 q40 50 -10 100 q-90 30 -130 -20 q-30 -40 0 -80z" fill="#dfe8da" />
        {/* река */}
        <path d="M-20 360 C120 300 220 420 360 380 S600 250 820 300" fill="none" stroke="#d3e0ee" strokeWidth="46" strokeLinecap="round" />
        <path d="M-20 360 C120 300 220 420 360 380 S600 250 820 300" fill="none" stroke="#c6d6e8" strokeWidth="2" strokeDasharray="4 10" />
        {/* кварталы */}
        <g stroke="#fff" strokeWidth="10">
          {Array.from({ length: 10 }, (_, i) => (
            <line key={'v' + i} x1={i * 90 + 20} y1="-10" x2={i * 90 - 40} y2="490" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={'h' + i} x1="-10" y1={i * 75 + 20} x2="810" y2={i * 75 + 50} />
          ))}
        </g>
        <g stroke="#fff" strokeWidth="22" strokeLinecap="round">
          <path d="M-20 120 L820 200" />
          <path d="M300 -20 L230 500" />
        </g>
        <g stroke="#e3e5ea" strokeWidth="1">
          <path d="M-20 120 L820 200" />
          <path d="M300 -20 L230 500" />
        </g>
        {/* мост */}
        <path d="M252 330 L240 420" stroke="#fff" strokeWidth="26" />
        <g fontFamily="Manrope, sans-serif" fontSize="11" fontWeight="600" letterSpacing="2" fill="#9aa2b3">
          <text x="600" y="115">ПАРК</text>
          <text x="560" y="300" transform="rotate(-8 560 300)">РЕКА</text>
          <text x="80" y="90">{district.toUpperCase()}</text>
        </g>
        {/* метка */}
        <circle cx={px} cy={py} r="80" fill="#0f1c38" opacity="0.06" />
        <circle cx={px} cy={py} r="44" fill="#0f1c38" opacity="0.08" />
        <circle cx={px} cy={py} r="10" fill="#0f1c38" stroke="#fff" strokeWidth="4" />
      </svg>
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-ink-900 shadow-soft">
        <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
        {label}
      </div>
      <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-medium text-muted">Схема. Не является картой</div>
    </div>
  )
}
