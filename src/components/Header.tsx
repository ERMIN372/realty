import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Heart, Menu, Phone, UserRound, X } from 'lucide-react'
import Logo from './Logo'
import { useStore } from '../store/AppStore'
import { cn } from '../lib/format'

const links = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/admin', label: 'Админ-панель' },
]

export default function Header() {
  const { favorites } = useStore()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled ? 'border-line bg-white/85 backdrop-blur-xl' : 'border-transparent bg-paper',
      )}
    >
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'relative rounded-full px-4 py-2 text-[14px] font-medium transition-colors',
                  isActive ? 'text-ink-950' : 'text-muted hover:text-ink-950',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {l.to === '/favorites' && favorites.length > 0 && (
                    <span className="ml-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-ink-900 px-1.5 text-[10px] font-bold text-white">
                      {favorites.length}
                    </span>
                  )}
                  <span
                    className={cn(
                      'absolute inset-x-4 -bottom-[1px] h-px origin-left bg-ink-900 transition-transform duration-300',
                      isActive ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a href="tel:+70000000000" className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Phone className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
            +7 (000) 000-00-00
          </a>
          <NavLink to="/catalog" className="btn-primary btn-sm">
            Подобрать объект
          </NavLink>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <NavLink to="/favorites" className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-white" aria-label="Избранное">
            <Heart className="h-4.5 w-4.5" strokeWidth={1.75} />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </NavLink>
          <button onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white" aria-label="Меню">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-pop border-t border-line bg-white md:hidden">
          <nav className="container-x flex flex-col py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn('flex items-center justify-between border-b border-line py-4 font-serif text-2xl', isActive ? 'text-ink-950' : 'text-muted')
                }
              >
                {l.label}
                {l.to === '/admin' && <UserRound className="h-5 w-5" strokeWidth={1.5} />}
              </NavLink>
            ))}
            <a href="tel:+70000000000" className="mt-5 text-sm font-semibold">
              +7 (000) 000-00-00
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
