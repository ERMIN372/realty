import { useMemo, useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Building2, ClipboardList, Eye, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { AdminHeader } from './AdminLayout'
import Modal from '../../components/Modal'
import SceneArt from '../../components/SceneArt'
import Avatar from '../../components/Avatar'
import { coverScene } from '../../components/PropertyCard'
import { CITIES, PALETTES, agents } from '../../data/mock'
import { useStore } from '../../store/AppStore'
import { TYPE_LABELS, cn, formatDate, formatMillions, formatPrice, roomsLabel, toISODate } from '../../lib/format'
import type { Property, PropertyType, Scene } from '../../types'

const DEFAULT_SCENES: Record<PropertyType, Scene[]> = {
  apartment: ['facade-tower', 'living', 'kitchen', 'bedroom', 'bath'],
  house: ['facade-house', 'living', 'kitchen', 'bedroom', 'view'],
  commercial: ['facade-glass', 'office', 'lobby', 'view'],
}

type PaletteKey = keyof typeof PALETTES

const PALETTE_NAMES: Record<PaletteKey, string> = {
  linen: 'Лён',
  fog: 'Туман',
  sand: 'Песок',
  night: 'Ночь',
  sage: 'Шалфей',
  stone: 'Камень',
  dusk: 'Закат',
}

interface FormState {
  title: string
  type: PropertyType
  city: string
  district: string
  address: string
  rooms: string
  area: string
  kitchenArea: string
  floor: string
  floors: string
  year: string
  price: string
  agentId: string
  description: string
  features: string
  tags: string
  palette: PaletteKey
  featured: boolean
  isNew: boolean
}

const paletteKeyOf = (p: Property): PaletteKey =>
  (Object.keys(PALETTES) as PaletteKey[]).find((k) => PALETTES[k].wall === p.palette.wall && PALETTES[k].accent === p.palette.accent) ?? 'linen'

const toForm = (p?: Property): FormState => ({
  title: p?.title ?? '',
  type: p?.type ?? 'apartment',
  city: p?.city ?? CITIES[0],
  district: p?.district ?? '',
  address: p?.address ?? '',
  rooms: String(p?.rooms ?? 2),
  area: p ? String(p.area) : '',
  kitchenArea: p?.kitchenArea ? String(p.kitchenArea) : '',
  floor: p?.floor ? String(p.floor) : '',
  floors: p?.floors ? String(p.floors) : '',
  year: String(p?.year ?? new Date().getFullYear()),
  price: p ? String(p.price) : '',
  agentId: p?.agentId ?? agents[0].id,
  description: p?.description ?? '',
  features: p?.features.join(', ') ?? '',
  tags: p?.tags.join(', ') ?? '',
  palette: p ? paletteKeyOf(p) : 'linen',
  featured: p?.featured ?? false,
  isNew: p?.isNew ?? true,
})

function PropertyForm({ initial, onDone }: { initial?: Property; onDone: () => void }) {
  const { saveProperty, notify, properties } = useStore()
  const [f, setF] = useState<FormState>(() => toForm(initial))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }))

  const districts = useMemo(() => [...new Set(properties.filter((p) => p.city === f.city).map((p) => p.district))], [properties, f.city])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err: typeof errors = {}
    if (f.title.trim().length < 5) err.title = 'Минимум 5 символов'
    if (!f.address.trim()) err.address = 'Укажите адрес'
    if (!f.district.trim()) err.district = 'Укажите район'
    if (!(Number(f.area) > 0)) err.area = 'Площадь > 0'
    if (!(Number(f.price) > 0)) err.price = 'Цена > 0'
    setErrors(err)
    if (Object.keys(err).length) return

    const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
    const numOrUndef = (s: string) => (s.trim() ? Number(s) : undefined)
    const p: Property = {
      id: initial?.id ?? `k-${Date.now().toString(36).slice(-5)}`,
      title: f.title.trim(),
      type: f.type,
      rooms: f.type === 'commercial' ? 0 : Number(f.rooms),
      price: Math.round(Number(f.price)),
      area: Number(f.area),
      kitchenArea: numOrUndef(f.kitchenArea),
      floor: numOrUndef(f.floor),
      floors: numOrUndef(f.floors),
      year: Number(f.year) || new Date().getFullYear(),
      city: f.city,
      district: f.district.trim(),
      address: f.address.trim(),
      metro: initial?.metro,
      featured: f.featured,
      isNew: f.isNew,
      tags: list(f.tags),
      features: list(f.features),
      description: f.description.trim() || 'Описание готовится.',
      agentId: f.agentId,
      scenes: initial && initial.type === f.type ? initial.scenes : DEFAULT_SCENES[f.type],
      palette: PALETTES[f.palette],
      map: initial?.map ?? { x: 25 + Math.round(Math.random() * 50), y: 25 + Math.round(Math.random() * 45) },
      createdAt: initial?.createdAt ?? toISODate(new Date()),
      views: initial?.views ?? 0,
    }
    saveProperty(p)
    notify(initial ? 'Изменения сохранены' : 'Объект добавлен')
    onDone()
  }

  const field = (k: keyof FormState, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label">{label}</label>
      <input
        value={f[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
        className={cn('field', errors[k] && 'border-red-400')}
        {...props}
      />
      {errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>}
    </div>
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="flex gap-5 rounded-2xl border border-line bg-paper p-4">
        <div className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-xl">
          <SceneArt scene={DEFAULT_SCENES[f.type][f.type === 'apartment' ? 1 : 0]} palette={PALETTES[f.palette]} seed={initial?.id ?? 'new'} className="absolute inset-0 h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="label">Оформление карточки</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => set('palette', k)}
                title={PALETTE_NAMES[k]}
                className={cn('h-8 w-8 rounded-full border-2 transition', f.palette === k ? 'scale-110 border-ink-900' : 'border-white shadow-soft')}
                style={{ background: `linear-gradient(135deg, ${PALETTES[k].wall} 45%, ${PALETTES[k].accent} 46%)` }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Иллюстрации генерируются автоматически по типу объекта.</p>
        </div>
      </div>

      {field('title', 'Заголовок', { placeholder: 'Например, квартира с видом на парк' })}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Тип</label>
          <select value={f.type} onChange={(e) => set('type', e.target.value as PropertyType)} className="field">
            {(Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Город</label>
          <select value={f.city} onChange={(e) => set('city', e.target.value)} className="field">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          {field('district', 'Район', { list: 'districts' })}
          <datalist id="districts">{districts.map((d) => <option key={d} value={d} />)}</datalist>
        </div>
      </div>

      {field('address', 'Адрес', { placeholder: 'ул. Янтарная, 5' })}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {f.type !== 'commercial' && (
          <div>
            <label className="label">Комнаты</label>
            <select value={f.rooms} onChange={(e) => set('rooms', e.target.value)} className="field">
              <option value="0">Студия</option>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
        {field('area', 'Площадь, м²', { inputMode: 'decimal' })}
        {field('kitchenArea', 'Кухня, м²', { inputMode: 'decimal' })}
        {field('year', 'Год постройки', { inputMode: 'numeric' })}
        {field('floor', 'Этаж', { inputMode: 'numeric' })}
        {field('floors', 'Этажей в доме', { inputMode: 'numeric' })}
        <div className="col-span-2">
          {field('price', 'Цена, ₽', { inputMode: 'numeric', placeholder: '25000000' })}
          {Number(f.price) > 0 && <p className="mt-1 text-xs text-muted">{formatPrice(Number(f.price))}</p>}
        </div>
      </div>

      <div>
        <label className="label">Ответственный брокер</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {agents.map((a) => (
            <button
              type="button"
              key={a.id}
              onClick={() => set('agentId', a.id)}
              className={cn('flex items-center gap-3 rounded-xl border p-2.5 text-left transition', f.agentId === a.id ? 'border-ink-900 bg-ink-50' : 'border-line hover:border-ink-300')}
            >
              <Avatar agent={a} className="h-9 w-9 text-xs" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{a.name}</span>
                <span className="block truncate text-[11px] text-muted">{a.role}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Описание</label>
        <textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={4} className="field h-auto resize-y py-3" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field('features', 'Особенности (через запятую)', { placeholder: 'Паркинг, Консьерж' })}
        {field('tags', 'Метки (через запятую)', { placeholder: 'Вид на воду' })}
      </div>

      <div className="flex flex-wrap gap-6">
        {(
          [
            ['featured', 'Показывать в подборке на главной'],
            ['isNew', 'Метка «Новое»'],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex cursor-pointer items-center gap-3 text-sm">
            <span className={cn('relative h-6 w-11 rounded-full transition', f[k] ? 'bg-ink-900' : 'bg-ink-100')}>
              <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all', f[k] ? 'left-6' : 'left-1')} />
            </span>
            <input type="checkbox" className="sr-only" checked={f[k]} onChange={(e) => set(k, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-line bg-white px-6 py-4 sm:-mx-8 sm:px-8">
        <button type="button" onClick={onDone} className="btn-ghost">Отмена</button>
        <button type="submit" className="btn-primary">{initial ? 'Сохранить изменения' : 'Добавить объект'}</button>
      </div>
    </form>
  )
}

export default function AdminProperties() {
  const { properties, requests, deleteProperty, notify } = useStore()
  const [q, setQ] = useState('')
  const [type, setType] = useState<'' | PropertyType>('')
  const [editing, setEditing] = useState<Property | 'new' | null>(null)

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return properties.filter(
      (p) =>
        (!type || p.type === type) &&
        (!s || [p.title, p.address, p.id, p.district, p.city].some((v) => v.toLowerCase().includes(s))),
    )
  }, [properties, q, type])

  const total = properties.reduce((s, p) => s + p.price, 0)
  const views = properties.reduce((s, p) => s + p.views, 0)
  const kpis = [
    { icon: Building2, label: 'Объектов в продаже', value: String(properties.length), hint: `${properties.filter((p) => p.featured).length} в подборке` },
    { icon: Banknote, label: 'Общая стоимость', value: formatMillions(total), hint: 'по всем объектам' },
    { icon: ClipboardList, label: 'Новых заявок', value: String(requests.filter((r) => r.status === 'new').length), hint: `всего ${requests.length}` },
    { icon: Eye, label: 'Просмотров карточек', value: views.toLocaleString('ru-RU'), hint: 'за 30 дней' },
  ]

  return (
    <>
      <AdminHeader
        title="Объекты"
        subtitle="Каталог агентства: добавление, редактирование и снятие с публикации"
        actions={
          <button onClick={() => setEditing('new')} className="btn-primary">
            <Plus className="h-4 w-4" /> Добавить объект
          </button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{k.label}</span>
              <k.icon className="h-4.5 w-4.5 text-ink-300" strokeWidth={1.5} />
            </div>
            <div className="mt-4 text-[30px] font-semibold tracking-tight">{k.value}</div>
            <div className="mt-1 text-xs text-muted">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по названию, адресу, району или ID" className="field h-11 pl-11" />
          </div>
          <div className="flex rounded-full border border-line bg-paper p-1">
            {(['', 'apartment', 'house', 'commercial'] as const).map((t) => (
              <button
                key={t || 'all'}
                onClick={() => setType(t)}
                className={cn('h-9 rounded-full px-4 text-[13px] font-medium transition', type === t ? 'bg-white text-ink-950 shadow-soft' : 'text-muted hover:text-ink-950')}
              >
                {t ? TYPE_LABELS[t] : 'Все'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                <th className="px-5 py-4 font-semibold">Объект</th>
                <th className="px-5 py-4 font-semibold">Тип</th>
                <th className="px-5 py-4 font-semibold">Площадь</th>
                <th className="px-5 py-4 font-semibold">Цена</th>
                <th className="px-5 py-4 font-semibold">Брокер</th>
                <th className="px-5 py-4 font-semibold">Добавлен</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const agent = agents.find((a) => a.id === p.agentId)
                return (
                  <tr key={p.id} className="group border-b border-line transition last:border-0 hover:bg-paper">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
                          <SceneArt scene={coverScene(p)} palette={p.palette} seed={p.id} className="absolute inset-0 h-full w-full" />
                        </div>
                        <div className="min-w-0">
                          <Link to={`/property/${p.id}`} className="line-clamp-1 max-w-[360px] font-semibold transition hover:text-ink-600">{p.title}</Link>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                            <span className="font-mono text-[11px] text-ink-300">{p.id}</span>
                            {p.city}, {p.address}
                            {p.featured && <Star className="h-3 w-3 fill-gold text-gold" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="chip">{TYPE_LABELS[p.type]}</span>
                      <div className="mt-1 text-xs text-muted">{roomsLabel(p.rooms, p.type)}</div>
                    </td>
                    <td className="px-5 py-4 tabular-nums">{p.area} м²</td>
                    <td className="px-5 py-4 font-semibold tabular-nums">{formatPrice(p.price)}</td>
                    <td className="px-5 py-4">
                      {agent && (
                        <div className="flex items-center gap-2.5">
                          <Avatar agent={agent} className="h-8 w-8 text-[11px]" />
                          <span className="text-[13px]">{agent.name.split(' ')[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-muted">{formatDate(p.createdAt, { day: 'numeric', month: 'short' })}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setEditing(p)} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white transition hover:border-ink-900" aria-label="Редактировать" title="Редактировать">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Снять с публикации «${p.title}»?`)) {
                              deleteProperty(p.id)
                              notify('Объект удалён')
                            }
                          }}
                          className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white transition hover:border-red-500 hover:text-red-600"
                          aria-label="Удалить"
                          title="Удалить"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted">По запросу «{q}» ничего не найдено</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-5 py-4 text-xs text-muted">Показано {rows.length} из {properties.length}</div>
      </div>

      {editing && (
        <Modal wide title={editing === 'new' ? 'Новый объект' : 'Редактирование'} onClose={() => setEditing(null)}>
          <PropertyForm initial={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </>
  )
}
