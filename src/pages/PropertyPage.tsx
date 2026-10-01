import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Clock,
  Eye,
  Hammer,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  Share2,
  Star,
  TrainFront,
  Wallet,
} from 'lucide-react'
import SceneArt, { SCENE_LABELS } from '../components/SceneArt'
import FavoriteButton from '../components/FavoriteButton'
import MapPlaceholder from '../components/MapPlaceholder'
import PropertyCard from '../components/PropertyCard'
import Avatar from '../components/Avatar'
import { agents } from '../data/mock'
import { useStore } from '../store/AppStore'
import { TYPE_LABELS, cn, formatDate, formatPrice, pricePerMeter, roomsLabel, toISODate, formatPhone } from '../lib/format'
import type { Property } from '../types'

const TIMES = ['10:00', '11:00', '12:00', '13:30', '15:00', '16:30', '18:00', '19:00']

function Gallery({ p }: { p: Property }) {
  const [i, setI] = useState(0)
  const n = p.scenes.length
  const go = (d: number) => setI((v) => (v + d + n) % n)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea,select')) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-[32px] bg-ink-50">
        {p.scenes.map((s, idx) => (
          <SceneArt
            key={s + idx}
            scene={s}
            palette={p.palette}
            seed={p.id}
            className={cn('absolute inset-0 h-full w-full transition-all duration-700 ease-out', idx === i ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0')}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink-950/45 to-transparent p-6 pt-20">
          <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-ink-900 backdrop-blur">{SCENE_LABELS[p.scenes[i]]}</span>
          <span className="rounded-full bg-ink-950/60 px-4 py-2 text-xs font-semibold tabular-nums text-white backdrop-blur">
            {i + 1} / {n}
          </span>
        </div>
        {(['prev', 'next'] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => go(dir === 'next' ? 1 : -1)}
            aria-label={dir === 'next' ? 'Следующее фото' : 'Предыдущее фото'}
            className={cn(
              'absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-950 shadow-soft backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white sm:opacity-0 sm:group-hover:opacity-100',
              dir === 'next' ? 'right-5' : 'left-5',
            )}
          >
            {dir === 'next' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-2 lg:grid-rows-3">
        {p.scenes.slice(0, 6).map((s, idx) => (
          <button
            key={s + idx}
            onClick={() => setI(idx)}
            aria-label={SCENE_LABELS[s]}
            className={cn(
              'group/t relative aspect-[4/3] overflow-hidden rounded-2xl ring-offset-2 ring-offset-paper transition-all duration-300 lg:aspect-auto lg:rounded-3xl',
              idx === i ? 'ring-2 ring-ink-900' : 'opacity-75 hover:opacity-100',
            )}
          >
            <SceneArt scene={s} palette={p.palette} seed={p.id} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover/t:scale-105" />
            <span className="absolute bottom-2.5 left-2.5 hidden rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-ink-900 lg:block">{SCENE_LABELS[s]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ViewingForm({ p }: { p: Property }) {
  const { addRequest } = useStore()
  const days = useMemo(() => {
    const base = new Date()
    return Array.from({ length: 14 }, (_, k) => {
      const d = new Date(base)
      d.setDate(base.getDate() + k + 1)
      return d
    })
  }, [])
  const [date, setDate] = useState(toISODate(days[0]))
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState<null | { date: string; time: string }>(null)

  // «занятые» слоты — детерминированно от даты
  const busy = (t: string) => (date.charCodeAt(9) + t.charCodeAt(1) + p.id.length) % 4 === 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (name.trim().length < 2) err.name = 'Укажите имя'
    if (phone.replace(/\D/g, '').length < 11) err.phone = 'Введите номер полностью'
    if (!time) err.time = 'Выберите время'
    setErrors(err)
    if (Object.keys(err).length) return
    addRequest({ propertyId: p.id, name: name.trim(), phone, date, time, comment: comment.trim() || undefined })
    setDone({ date, time })
  }

  if (done) {
    return (
      <div className="animate-pop py-4 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-900 text-white">
          <CalendarCheck2 className="h-7 w-7" strokeWidth={1.5} />
        </span>
        <h3 className="mt-6 font-serif text-[30px] leading-tight">Вы записаны на просмотр</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {formatDate(done.date, { weekday: 'long', day: 'numeric', month: 'long' })}, {done.time}. Брокер позвонит за час до встречи,
          чтобы подтвердить время.
        </p>
        <button
          onClick={() => {
            setDone(null)
            setTime('')
          }}
          className="btn-ghost mt-8 w-full"
        >
          Записаться на другое время
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-center justify-between">
        <span className="label mb-0 flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" /> Дата просмотра
        </span>
        <span className="text-xs font-medium capitalize text-ink-800">{formatDate(date, { month: 'long' })}</span>
      </div>
      <div className="-mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {days.map((d) => {
          const iso = toISODate(d)
          const active = iso === date
          const weekend = d.getDay() === 0 || d.getDay() === 6
          return (
            <button
              type="button"
              key={iso}
              onClick={() => {
                setDate(iso)
                setTime('')
              }}
              className={cn(
                'flex w-[58px] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition-all duration-200',
                active ? 'border-ink-900 bg-ink-900 text-white shadow-soft' : 'border-line bg-white hover:border-ink-400',
              )}
            >
              <span className={cn('text-[10px] font-semibold uppercase tracking-wider', active ? 'text-white/60' : weekend ? 'text-gold' : 'text-muted')}>
                {d.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </span>
              <span className="mt-1 text-lg font-semibold tabular-nums">{d.getDate()}</span>
            </button>
          )
        })}
      </div>

      <span className="label mt-5 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> Время
      </span>
      <div className="grid grid-cols-4 gap-2">
        {TIMES.map((t) => {
          const disabled = busy(t)
          return (
            <button
              type="button"
              key={t}
              disabled={disabled}
              onClick={() => setTime(t)}
              className={cn(
                'h-10 rounded-xl border text-[13px] font-medium tabular-nums transition',
                time === t ? 'border-ink-900 bg-ink-900 text-white' : 'border-line bg-white hover:border-ink-400',
                disabled && 'cursor-not-allowed border-dashed bg-transparent text-ink-200 line-through hover:border-line',
              )}
            >
              {t}
            </button>
          )
        })}
      </div>
      {errors.time && <p className="mt-2 text-xs text-red-600">{errors.time}</p>}

      <div className="mt-5 space-y-3">
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" className={cn('field', errors.name && 'border-red-400')} />
          {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value ? formatPhone(e.target.value) : '')}
            placeholder="+7 (000) 000-00-00"
            inputMode="tel"
            className={cn('field tabular-nums', errors.phone && 'border-red-400')}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий (необязательно)"
          rows={2}
          className="field h-auto resize-none py-3"
        />
      </div>

      <button type="submit" className="btn-primary mt-5 h-14 w-full">
        Записаться на просмотр
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">Это демо: заявка сохранится только в вашем браузере.</p>
    </form>
  )
}

export default function PropertyPage() {
  const { id = '' } = useParams()
  const { getProperty, properties, notify } = useStore()
  const p = getProperty(id)

  useEffect(() => window.scrollTo(0, 0), [id])

  if (!p) {
    return (
      <div className="container-x flex flex-col items-center py-32 text-center">
        <h1 className="display-serif text-5xl">Объект не найден</h1>
        <p className="mt-4 text-muted">Возможно, он уже продан или снят с публикации.</p>
        <Link to="/catalog" className="btn-primary mt-8">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const agent = agents.find((a) => a.id === p.agentId) ?? agents[0]
  const similar = properties.filter((x) => x.id !== p.id && x.type === p.type).slice(0, 3)

  const specs = [
    { icon: Maximize2, label: 'Общая площадь', value: `${p.area} м²` },
    { icon: BedDouble, label: 'Планировка', value: roomsLabel(p.rooms, p.type) },
    p.floor ? { icon: Building2, label: 'Этаж', value: `${p.floor} из ${p.floors}` } : { icon: Building2, label: 'Этажей', value: String(p.floors ?? 1) },
    { icon: Hammer, label: 'Год постройки', value: String(p.year) },
    p.kitchenArea ? { icon: ChefHat, label: 'Кухня', value: `${p.kitchenArea} м²` } : null,
    { icon: Wallet, label: 'Цена за м²', value: pricePerMeter(p.price, p.area) },
  ].filter(Boolean) as { icon: typeof Maximize2; label: string; value: string }[]

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      notify('Ссылка скопирована')
    } catch {
      notify('Не удалось скопировать ссылку')
    }
  }

  return (
    <div className="pb-24">
      <div className="container-x pt-8">
        <nav className="flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="transition hover:text-ink-950">Главная</Link>
          <span className="text-ink-200">/</span>
          <Link to="/catalog" className="transition hover:text-ink-950">Каталог</Link>
          <span className="text-ink-200">/</span>
          <span className="truncate text-ink-800">{p.title}</span>
        </nav>

        <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="chip border-ink-900 bg-ink-900 text-white">{TYPE_LABELS[p.type]}</span>
              {p.tags.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
            <h1 className="display-serif mt-5 text-[40px] sm:text-[56px] xl:text-[64px]">{p.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" strokeWidth={1.5} />{p.city}, {p.address}</span>
              {p.metro && <span className="flex items-center gap-1.5"><TrainFront className="h-4 w-4" strokeWidth={1.5} />{p.metro}</span>}
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" strokeWidth={1.5} />{p.views.toLocaleString('ru-RU')} просмотров</span>
            </div>
          </div>
          <div className="flex items-end gap-6 lg:flex-col lg:items-end lg:gap-4">
            <div className="lg:text-right">
              <div className="text-[34px] font-semibold tracking-tight sm:text-[40px]">{formatPrice(p.price)}</div>
              <div className="text-sm text-muted">{pricePerMeter(p.price, p.area)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={share} className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white transition hover:border-ink-900" aria-label="Поделиться">
                <Share2 className="h-4.5 w-4.5" strokeWidth={1.75} />
              </button>
              <FavoriteButton id={p.id} size="lg" tone="solid" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Gallery p={p} />
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 xl:gap-16">
          <div className="min-w-0 lg:col-span-8">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="bg-white p-6">
                  <s.icon className="h-5 w-5 text-ink-400" strokeWidth={1.4} />
                  <div className="mt-4 text-xs text-muted">{s.label}</div>
                  <div className="mt-1 text-lg font-semibold tracking-tight">{s.value}</div>
                </div>
              ))}
            </div>

            <section className="mt-14">
              <h2 className="display-serif text-[36px]">Об объекте</h2>
              <p className="mt-5 max-w-3xl text-[17px] leading-[1.75] text-ink-800">{p.description}</p>
            </section>

            <section className="mt-14">
              <h2 className="display-serif text-[36px]">Особенности</h2>
              <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 border-b border-line pb-4 text-[15px]">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-50">
                      <Check className="h-3.5 w-3.5 text-ink-700" strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <h2 className="display-serif text-[36px]">Расположение</h2>
                <span className="text-sm text-muted">{p.district} район</span>
              </div>
              <div className="mt-6">
                <MapPlaceholder x={p.map.x} y={p.map.y} label={p.address} district={p.district} />
              </div>
            </section>
          </div>

          <aside className="min-w-0 lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="card p-6 sm:p-7">
                <div className="flex items-center gap-4">
                  <Avatar agent={agent} className="h-16 w-16 text-xl" />
                  <div className="min-w-0">
                    <div className="text-lg font-semibold leading-tight">{agent.name}</div>
                    <div className="mt-1 text-xs leading-snug text-muted">{agent.role}</div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line py-3 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{agent.rating.toFixed(1)}</div>
                    <div className="text-[11px] text-muted">рейтинг</div>
                  </div>
                  <div>
                    <div className="font-semibold">{agent.deals}</div>
                    <div className="text-[11px] text-muted">сделок</div>
                  </div>
                  <div>
                    <div className="font-semibold">{agent.experience} лет</div>
                    <div className="text-[11px] text-muted">опыт</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">{agent.about}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a href={`tel:${agent.phone.replace(/[^\d+]/g, '')}`} className="btn-ghost btn-sm">
                    <Phone className="h-4 w-4" strokeWidth={1.75} /> Позвонить
                  </a>
                  <a href={`mailto:${agent.email}`} className="btn-ghost btn-sm">
                    <Mail className="h-4 w-4" strokeWidth={1.75} /> Написать
                  </a>
                </div>
              </div>

              <div className="card p-6 sm:p-7">
                <h3 className="font-serif text-[28px] leading-tight">Записаться на просмотр</h3>
                <p className="mt-1.5 text-sm text-muted">Выберите удобные дату и время</p>
                <div className="mt-6">
                  <ViewingForm key={p.id} p={p} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-24 border-t border-line bg-white py-20">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="display-serif text-[40px] sm:text-[48px]">Похожие объекты</h2>
              <Link to={`/catalog?type=${p.type}`} className="hidden items-center gap-2 text-sm font-semibold sm:flex">
                <ArrowLeft className="h-4 w-4 rotate-180" /> Смотреть все
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} property={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
