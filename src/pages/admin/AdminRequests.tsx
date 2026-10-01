import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronDown, MessageSquareText, Phone, Search } from 'lucide-react'
import { AdminHeader } from './AdminLayout'
import SceneArt from '../../components/SceneArt'
import { coverScene } from '../../components/PropertyCard'
import { useStore } from '../../store/AppStore'
import { STATUS_LABELS, cn, formatDate, toISODate } from '../../lib/format'
import type { RequestStatus } from '../../types'

const STATUS_STYLE: Record<RequestStatus, string> = {
  new: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-ink-50 text-ink-800 ring-ink-200',
  done: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-zinc-100 text-zinc-500 ring-zinc-200',
}
const DOT: Record<RequestStatus, string> = {
  new: 'bg-amber-500',
  confirmed: 'bg-ink-600',
  done: 'bg-emerald-500',
  cancelled: 'bg-zinc-400',
}

const STATUSES = Object.keys(STATUS_LABELS) as RequestStatus[]

export default function AdminRequests() {
  const { requests, properties, setRequestStatus, notify } = useStore()
  const [filter, setFilter] = useState<'' | RequestStatus>('')
  const [q, setQ] = useState('')
  const today = toISODate(new Date())

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return requests
      .filter((r) => !filter || r.status === filter)
      .filter((r) => {
        if (!s) return true
        const p = properties.find((x) => x.id === r.propertyId)
        return [r.name, r.phone, p?.title ?? '', p?.address ?? ''].some((v) => v.toLowerCase().includes(s))
      })
      .sort((a, b) => {
        // сначала предстоящие (ближайшие сверху), затем прошедшие (свежие сверху)
        const fa = a.date >= today ? 0 : 1
        const fb = b.date >= today ? 0 : 1
        if (fa !== fb) return fa - fb
        const cmp = (a.date + a.time).localeCompare(b.date + b.time)
        return fa === 0 ? cmp : -cmp
      })
  }, [requests, properties, filter, q, today])

  const count = (s?: RequestStatus) => (s ? requests.filter((r) => r.status === s).length : requests.length)
  const upcoming = requests.filter((r) => r.date >= today && (r.status === 'new' || r.status === 'confirmed')).length

  return (
    <>
      <AdminHeader title="Заявки на просмотр" subtitle={`${upcoming} предстоящих просмотров · сегодня ${formatDate(today, { day: 'numeric', month: 'long' })}`} />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? '' : s)}
            className={cn('card p-5 text-left transition hover:shadow-soft', filter === s && 'border-ink-900 ring-1 ring-ink-900')}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <span className={cn('h-2 w-2 rounded-full', DOT[s])} />
              {STATUS_LABELS[s]}
            </div>
            <div className="mt-3 text-[30px] font-semibold tracking-tight">{count(s)}</div>
          </button>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center">
          <div className="flex flex-wrap rounded-full border border-line bg-paper p-1">
            {(['', ...STATUSES] as const).map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setFilter(s)}
                className={cn('h-9 rounded-full px-4 text-[13px] font-medium transition', filter === s ? 'bg-white text-ink-950 shadow-soft' : 'text-muted hover:text-ink-950')}
              >
                {s ? STATUS_LABELS[s] : 'Все'} <span className="ml-1 text-[11px] text-muted">{count(s || undefined)}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Клиент, телефон или объект" className="field h-11 pl-11" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                <th className="px-5 py-4 font-semibold">Клиент</th>
                <th className="px-5 py-4 font-semibold">Объект</th>
                <th className="px-5 py-4 font-semibold">Просмотр</th>
                <th className="px-5 py-4 font-semibold">Комментарий</th>
                <th className="px-5 py-4 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = properties.find((x) => x.id === r.propertyId)
                const isToday = r.date === today
                return (
                  <tr key={r.id} className={cn('border-b border-line transition last:border-0 hover:bg-paper', r.status === 'cancelled' && 'opacity-60')}>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{r.name}</div>
                      <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} className="mt-0.5 flex items-center gap-1.5 text-xs text-muted tabular-nums hover:text-ink-950">
                        <Phone className="h-3 w-3" /> {r.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      {p ? (
                        <Link to={`/property/${p.id}`} className="flex items-center gap-3 hover:text-ink-600">
                          <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg">
                            <SceneArt scene={coverScene(p)} palette={p.palette} seed={p.id} className="absolute inset-0 h-full w-full" />
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 max-w-[280px] font-medium">{p.title}</span>
                            <span className="block text-xs text-muted">{p.address}</span>
                          </span>
                        </Link>
                      ) : (
                        <span className="text-muted">Объект удалён</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-medium">
                        <CalendarClock className="h-4 w-4 text-ink-300" strokeWidth={1.5} />
                        {formatDate(r.date, { day: 'numeric', month: 'short', weekday: 'short' })}, {r.time}
                      </div>
                      {isToday && <span className="mt-1 inline-block rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-semibold text-white">Сегодня</span>}
                      <div className="mt-1 text-[11px] text-muted">создана {formatDate(r.createdAt, { day: 'numeric', month: 'short' })}</div>
                    </td>
                    <td className="max-w-[260px] px-5 py-4 text-[13px] text-muted">
                      {r.comment ? (
                        <span className="flex gap-2">
                          <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
                          <span className="line-clamp-2">{r.comment}</span>
                        </span>
                      ) : (
                        <span className="text-ink-200">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <label className={cn('relative inline-flex h-9 items-center gap-2 rounded-full pl-3 pr-8 text-xs font-semibold ring-1', STATUS_STYLE[r.status])}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', DOT[r.status])} />
                        <select
                          value={r.status}
                          onChange={(e) => {
                            setRequestStatus(r.id, e.target.value as RequestStatus)
                            notify(`Статус: ${STATUS_LABELS[e.target.value as RequestStatus]}`)
                          }}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label="Статус заявки"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                        {STATUS_LABELS[r.status]}
                        <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 opacity-60" />
                      </label>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted">Заявок нет</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
