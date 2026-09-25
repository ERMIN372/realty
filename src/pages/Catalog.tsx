import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownUp, LayoutGrid, List, RotateCcw, SearchX, SlidersHorizontal, X } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import { CITIES } from '../data/mock'
import { useStore } from '../store/AppStore'
import { TYPE_LABELS, cn, plural } from '../lib/format'
import type { Property, PropertyType } from '../types'

const SORTS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'new', label: 'Сначала новые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'area-desc', label: 'По площади' },
] as const

const ROOM_OPTIONS = [
  { value: '0', label: 'Студия' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
]

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])
const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined)

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-line py-6 first:pt-0 last:border-0 last:pb-0">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">{title}</div>
      {children}
    </div>
  )
}

function Check({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          'grid h-5 w-5 place-items-center rounded-md border transition-all peer-focus-visible:ring-4 peer-focus-visible:ring-ink-100',
          checked ? 'border-ink-900 bg-ink-900' : 'border-ink-200 bg-white group-hover:border-ink-500',
        )}
      >
        <svg viewBox="0 0 12 12" className={cn('h-3 w-3 text-white transition', checked ? 'opacity-100' : 'opacity-0')}>
          <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={cn('flex-1 transition-colors', checked ? 'text-ink-950' : 'text-ink-800')}>{label}</span>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </label>
  )
}

function RangeInputs({
  from,
  to,
  onFrom,
  onTo,
  unit,
}: {
  from?: number
  to?: number
  onFrom: (v?: number) => void
  onTo: (v?: number) => void
  unit: string
}) {
  const parse = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(',', '.')))
  return (
    <div className="grid grid-cols-2 gap-2">
      {(
        [
          ['от', from, onFrom],
          ['до', to, onTo],
        ] as const
      ).map(([ph, v, set]) => (
        <div key={ph} className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">{ph}</span>
          <input
            inputMode="decimal"
            value={v ?? ''}
            onChange={(e) => {
              const n = parse(e.target.value)
              if (n === undefined || !Number.isNaN(n)) set(n)
            }}
            className="field h-11 pl-9 pr-12"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">{unit}</span>
        </div>
      ))}
    </div>
  )
}

export default function Catalog() {
  const { properties } = useStore()
  const [params, setParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const f = {
    city: params.get('city') ?? '',
    types: list(params.get('type')) as PropertyType[],
    rooms: list(params.get('rooms')),
    districts: list(params.get('district')),
    priceFrom: num(params.get('priceFrom')),
    priceTo: num(params.get('priceTo')),
    areaFrom: num(params.get('areaFrom')),
    areaTo: num(params.get('areaTo')),
    sort: (params.get('sort') ?? 'popular') as (typeof SORTS)[number]['value'],
    view: params.get('view') === 'list' ? 'list' : 'grid',
  }

  const update = (patch: Record<string, string | number | undefined | string[]>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      const val = Array.isArray(v) ? v.join(',') : v
      if (val === undefined || val === '') next.delete(k)
      else next.set(k, String(val))
    }
    setParams(next, { replace: true })
  }

  const toggleIn = (key: string, arr: string[], value: string) =>
    update({ [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] })

  const cityScoped = useMemo(() => properties.filter((p) => !f.city || p.city === f.city), [properties, f.city])

  const districts = useMemo(() => {
    const m = new Map<string, number>()
    cityScoped.forEach((p) => m.set(p.district, (m.get(p.district) ?? 0) + 1))
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ru'))
  }, [cityScoped])

  const results = useMemo(() => {
    const million = 1_000_000
    const matches = (p: Property) => {
      if (f.types.length && !f.types.includes(p.type)) return false
      if (f.rooms.length) {
        if (p.type === 'commercial') return false
        const key = p.rooms >= 4 ? '4' : String(p.rooms)
        if (!f.rooms.includes(key)) return false
      }
      if (f.districts.length && !f.districts.includes(p.district)) return false
      if (f.priceFrom !== undefined && p.price < f.priceFrom * million) return false
      if (f.priceTo !== undefined && p.price > f.priceTo * million) return false
      if (f.areaFrom !== undefined && p.area < f.areaFrom) return false
      if (f.areaTo !== undefined && p.area > f.areaTo) return false
      return true
    }
    const out = cityScoped.filter(matches)
    const sorters: Record<string, (a: Property, b: Property) => number> = {
      popular: (a, b) => Number(b.featured) - Number(a.featured) || b.views - a.views,
      new: (a, b) => b.createdAt.localeCompare(a.createdAt),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'area-desc': (a, b) => b.area - a.area,
    }
    return [...out].sort(sorters[f.sort] ?? sorters.popular)
  }, [cityScoped, f.types, f.rooms, f.districts, f.priceFrom, f.priceTo, f.areaFrom, f.areaTo, f.sort])

  const chips: { label: string; clear: () => void }[] = [
    ...(f.city ? [{ label: f.city, clear: () => update({ city: undefined, district: undefined }) }] : []),
    ...f.types.map((t) => ({ label: TYPE_LABELS[t], clear: () => toggleIn('type', f.types, t) })),
    ...f.rooms.map((r) => ({
      label: r === '0' ? 'Студия' : r === '4' ? '4+ комнат' : `${r}-комн.`,
      clear: () => toggleIn('rooms', f.rooms, r),
    })),
    ...f.districts.map((d) => ({ label: d, clear: () => toggleIn('district', f.districts, d) })),
    ...(f.priceFrom !== undefined || f.priceTo !== undefined
      ? [{ label: `${f.priceFrom ?? 0}–${f.priceTo ?? '∞'} млн ₽`, clear: () => update({ priceFrom: undefined, priceTo: undefined }) }]
      : []),
    ...(f.areaFrom !== undefined || f.areaTo !== undefined
      ? [{ label: `${f.areaFrom ?? 0}–${f.areaTo ?? '∞'} м²`, clear: () => update({ areaFrom: undefined, areaTo: undefined }) }]
      : []),
  ]

  const reset = () => {
    const next = new URLSearchParams()
    if (params.get('view')) next.set('view', params.get('view')!)
    if (params.get('sort')) next.set('sort', params.get('sort')!)
    setParams(next, { replace: true })
  }

  const typeCount = (t: PropertyType) => cityScoped.filter((p) => p.type === t).length

  const filters = (
    <div>
      <Section title="Город">
        <div className="flex flex-wrap gap-2">
          {['', ...CITIES].map((c) => (
            <button
              key={c || 'all'}
              onClick={() => update({ city: c || undefined, district: undefined })}
              className={cn(
                'h-9 rounded-full border px-4 text-[13px] font-medium transition',
                f.city === c ? 'border-ink-900 bg-ink-900 text-white' : 'border-line bg-white text-ink-800 hover:border-ink-400',
              )}
            >
              {c || 'Все'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Тип объекта">
        {(Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => (
          <Check key={t} label={TYPE_LABELS[t]} count={typeCount(t)} checked={f.types.includes(t)} onChange={() => toggleIn('type', f.types, t)} />
        ))}
      </Section>

      <Section title="Комнаты">
        <div className="grid grid-cols-[1.7fr_repeat(4,1fr)] gap-1.5">
          {ROOM_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => toggleIn('rooms', f.rooms, r.value)}
              className={cn(
                'h-10 rounded-xl border text-[13px] font-medium transition',
                f.rooms.includes(r.value) ? 'border-ink-900 bg-ink-900 text-white' : 'border-line bg-white text-ink-800 hover:border-ink-400',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Цена, млн ₽">
        <RangeInputs from={f.priceFrom} to={f.priceTo} onFrom={(v) => update({ priceFrom: v })} onTo={(v) => update({ priceTo: v })} unit="млн" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[15, 30, 50].map((v) => (
            <button key={v} onClick={() => update({ priceFrom: undefined, priceTo: v })} className="chip transition hover:border-ink-400">
              до {v} млн
            </button>
          ))}
        </div>
      </Section>

      <Section title="Площадь, м²">
        <RangeInputs from={f.areaFrom} to={f.areaTo} onFrom={(v) => update({ areaFrom: v })} onTo={(v) => update({ areaTo: v })} unit="м²" />
      </Section>

      <Section title="Район">
        {districts.map(([d, c]) => (
          <Check key={d} label={d} count={c} checked={f.districts.includes(d)} onChange={() => toggleIn('district', f.districts, d)} />
        ))}
      </Section>
    </div>
  )

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <div className="flex flex-col justify-between gap-6 border-b border-line pb-10 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">Каталог</div>
          <h1 className="display-serif mt-4 text-[48px] sm:text-[68px]">Недвижимость</h1>
        </div>
        <p className="max-w-md text-muted md:text-right">
          Квартиры, дома и коммерческие помещения в Новоградске и области. Каждый объект проверен юристом «Ключа».
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr] xl:gap-14">
        {/* Фильтры — десктоп */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                Фильтры
              </div>
              {chips.length > 0 && (
                <button onClick={reset} className="flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink-950">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Сбросить
                </button>
              )}
            </div>
            <div className="card p-6">{filters}</div>
          </div>
        </aside>

        {/* Фильтры — мобильные */}
        {mobileFilters && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-serif text-2xl">Фильтры</span>
              <button onClick={() => setMobileFilters(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Закрыть">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{filters}</div>
            <div className="flex gap-3 border-t border-line p-4">
              <button onClick={reset} className="btn-ghost flex-1">
                Сбросить
              </button>
              <button onClick={() => setMobileFilters(false)} className="btn-primary flex-[2]">
                Показать {results.length}
              </button>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-[40px] font-medium leading-none">{results.length}</span>
              <span className="text-sm text-muted">
                {plural(results.length, ['объект найден', 'объекта найдено', 'объектов найдено'])} из {properties.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setMobileFilters(true)} className="btn-ghost btn-sm lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Фильтры{chips.length ? ` · ${chips.length}` : ''}
              </button>
              <label className="relative flex h-10 items-center gap-2 rounded-full border border-line bg-white pl-4 pr-3 text-[13px] font-medium">
                <ArrowDownUp className="h-3.5 w-3.5 text-muted" />
                <select
                  value={f.sort}
                  onChange={(e) => update({ sort: e.target.value === 'popular' ? undefined : e.target.value })}
                  className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
                  aria-label="Сортировка"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex h-10 rounded-full border border-line bg-white p-1" role="group" aria-label="Вид">
                {(
                  [
                    ['grid', LayoutGrid, 'Плиткой'],
                    ['list', List, 'Списком'],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    onClick={() => update({ view: v === 'grid' ? undefined : v })}
                    aria-pressed={f.view === v}
                    title={label}
                    className={cn(
                      'grid w-9 place-items-center rounded-full transition',
                      f.view === v ? 'bg-ink-900 text-white' : 'text-muted hover:text-ink-950',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c.label} onClick={c.clear} className="chip group transition hover:border-ink-900">
                  {c.label}
                  <X className="h-3 w-3 text-muted transition group-hover:text-ink-950" />
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <div className="card mt-8 flex flex-col items-center px-6 py-20 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-ink-50">
                <SearchX className="h-7 w-7 text-ink-500" strokeWidth={1.5} />
              </span>
              <h3 className="mt-6 font-serif text-3xl">Ничего не нашлось</h3>
              <p className="mt-2 max-w-sm text-sm text-muted">Попробуйте расширить диапазон цены или убрать часть фильтров.</p>
              <button onClick={reset} className="btn-primary mt-8">
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className={cn('mt-8 grid gap-6', f.view === 'grid' ? 'sm:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1')}>
              {results.map((p) => (
                <PropertyCard key={p.id} property={p} view={f.view as 'grid' | 'list'} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
