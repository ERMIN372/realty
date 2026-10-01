import { Link } from 'react-router-dom'
import { cn } from '../lib/format'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <circle cx="16" cy="18" r="6.5" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M21 22.5 L31 32.5 M27.5 29 L30.5 26 M24.5 26 L27 23.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="Ключ — на главную">
      <LogoMark className={cn('h-9 w-9 transition-transform duration-500 group-hover:-rotate-6', light ? 'text-white/15' : 'text-ink-900')} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-serif text-[26px] font-semibold tracking-tight', light ? 'text-white' : 'text-ink-950')}>Ключ</span>
        <span className={cn('mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em]', light ? 'text-white/50' : 'text-muted')}>
          недвижимость
        </span>
      </span>
    </Link>
  )
}
