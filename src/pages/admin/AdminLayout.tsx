import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowUpRight, Building2, ClipboardList, KeyRound, LogOut, Menu, RotateCcw, X } from 'lucide-react'
import Logo from '../../components/Logo'
import { DEMO_ADMIN } from '../../data/mock'
import { useStore } from '../../store/AppStore'
import { cn } from '../../lib/format'

function Login() {
  const { login } = useStore()
  const [email, setEmail] = useState(DEMO_ADMIN.email)
  const [password, setPassword] = useState(DEMO_ADMIN.password)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // имитация запроса к серверу
    setTimeout(() => {
      if (!login(email, password)) setError('Неверный e-mail или пароль')
      setLoading(false)
    }, 600)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[720px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(47_70_121/0.45),transparent)]" />
        <div className="relative"><Logo light /></div>
        <div className="relative">
          <h1 className="display-serif text-[64px]">Рабочее место брокера</h1>
          <p className="mt-6 max-w-md text-white/55">Управляйте объектами, отвечайте на заявки и следите за просмотрами в одном окне.</p>
        </div>
        <div className="relative text-xs text-white/35">Демо-проект · данные хранятся в localStorage</div>
      </div>

      <div className="flex items-center justify-center bg-paper p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="lg:hidden"><Logo /></div>
          <span className="mt-10 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-white lg:mt-0">
            <KeyRound className="h-6 w-6 text-ink-700" strokeWidth={1.5} />
          </span>
          <h2 className="mt-8 font-serif text-[40px] leading-tight">Вход в админ-панель</h2>
          <p className="mt-2 text-sm text-muted">Демо-доступ уже подставлен — просто нажмите «Войти».</p>

          <label className="label mt-8">E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="username" />
          <label className="label mt-4">Пароль</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoComplete="current-password" />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 h-14 w-full">
            {loading ? 'Проверяем…' : 'Войти'}
          </button>
          <div className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white p-4 text-xs leading-relaxed text-muted">
            Логин: <b className="text-ink-900">{DEMO_ADMIN.email}</b>
            <br />
            Пароль: <b className="text-ink-900">{DEMO_ADMIN.password}</b>
          </div>
          <Link to="/" className="mt-6 inline-block text-sm font-medium text-muted hover:text-ink-950">← Вернуться на сайт</Link>
        </form>
      </div>
    </div>
  )
}

const NAV = [
  { to: '/admin', label: 'Объекты', icon: Building2, end: true },
  { to: '/admin/requests', label: 'Заявки на просмотр', icon: ClipboardList },
]

export function AdminHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-5 border-b border-line pb-8 md:flex-row md:items-end">
      <div>
        <div className="eyebrow">Админ-панель</div>
        <h1 className="display-serif mt-3 text-[44px] sm:text-[52px]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export default function AdminLayout() {
  const { isAdmin, logout, requests, resetDemo, notify } = useStore()
  const [open, setOpen] = useState(false)
  if (!isAdmin) return <Login />

  const newCount = requests.filter((r) => r.status === 'new').length

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-7 pt-7"><Logo light /></div>
      <nav className="mt-12 flex flex-col gap-1 px-4">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">Управление</div>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <n.icon className="h-4.5 w-4.5" strokeWidth={1.6} />
            <span className="flex-1">{n.label}</span>
            {n.to === '/admin/requests' && newCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-ink-950">{newCount}</span>
            )}
          </NavLink>
        ))}
        <Link to="/" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/55 transition hover:bg-white/5 hover:text-white">
          <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={1.6} />
          Открыть сайт
        </Link>
      </nav>

      <div className="mt-auto space-y-3 p-4">
        <button
          onClick={() => {
            if (confirm('Вернуть демо-данные к исходному состоянию?')) {
              resetDemo()
              notify('Демо-данные восстановлены')
            }
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-white/40 transition hover:bg-white/5 hover:text-white/80"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.6} />
          Сбросить демо-данные
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-ink-500 to-gold font-serif text-white">А</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">Администратор</div>
            <div className="truncate text-[11px] text-white/40">{DEMO_ADMIN.email}</div>
          </div>
          <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Выйти" title="Выйти">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-paper lg:pl-[272px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] bg-ink-950 lg:block">{sidebar}</aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-5 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Меню">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="animate-pop w-[280px] bg-ink-950">{sidebar}</div>
          <button className="flex-1 bg-ink-950/40" onClick={() => setOpen(false)} aria-label="Закрыть меню">
            <X className="ml-auto mr-5 mt-5 h-6 w-6 text-white" />
          </button>
        </div>
      )}

      <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
        <Outlet />
        <div className="mt-16 text-[11px] text-muted">Демо-проект</div>
      </main>
    </div>
  )
}
