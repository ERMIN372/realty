import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Building, ChevronDown, Compass, Gem, Handshake, MapPin, Quote, Search, ShieldCheck, Star, Wallet } from 'lucide-react'
import SceneArt from '../components/SceneArt'
import PropertyCard from '../components/PropertyCard'
import Avatar from '../components/Avatar'
import { CITIES, PALETTES, advantages, agents, reviews, stats } from '../data/mock'
import { useStore } from '../store/AppStore'
import { formatPrice } from '../lib/format'

const ICONS = { ShieldCheck, Compass, Handshake, Gem }

const BUDGETS = [
  { value: '', label: 'Любой' },
  { value: '15', label: 'до 15 млн ₽' },
  { value: '30', label: 'до 30 млн ₽' },
  { value: '50', label: 'до 50 млн ₽' },
  { value: '80', label: 'до 80 млн ₽' },
]

function SearchSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: typeof MapPin
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="group relative flex flex-1 cursor-pointer items-center gap-4 rounded-2xl px-5 py-3.5 transition hover:bg-ink-50">
      <Icon className="h-5 w-5 shrink-0 text-ink-400" strokeWidth={1.5} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="-ml-0.5 mt-0.5 w-full cursor-pointer appearance-none bg-transparent pr-7 text-[15px] font-semibold text-ink-950 outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
      <ChevronDown className="pointer-events-none absolute right-5 h-4 w-4 text-ink-400" />
    </label>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { properties } = useStore()
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('')

  const featured = properties.filter((p) => p.featured).slice(0, 6)
  const hero = properties.find((p) => p.id === 'k-101') ?? properties[0]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams()
    if (city) q.set('city', city)
    if (type) q.set('type', type)
    if (budget) q.set('priceTo', budget)
    navigate(`/catalog${q.toString() ? `?${q}` : ''}`)
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="hairline-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="container-x relative grid items-center gap-12 pb-20 pt-10 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-16">
          <div className="animate-fade-up lg:col-span-7">
            <div className="eyebrow flex items-center gap-3">
              <span className="h-px w-10 bg-ink-300" />
              Агентство городской недвижимости
            </div>
            <h1 className="display-serif mt-7 max-w-[840px] text-[56px] text-ink-950 sm:text-[76px] xl:text-[92px]">
              Дом, в который
              <br />
              <em className="font-medium italic text-ink-600">хочется</em> возвращаться
            </h1>
            <p className="mt-8 max-w-[520px] text-[17px] leading-relaxed text-muted">
              Подбираем квартиры, дома и коммерческие помещения с проверенной историей. Один брокер ведёт вас от первого
              просмотра до передачи ключей.
            </p>

            <form
              onSubmit={submit}
              className="mt-10 flex flex-col gap-1 rounded-[28px] border border-line bg-white p-2 shadow-lift lg:flex-row lg:items-center"
            >
              <SearchSelect
                icon={MapPin}
                label="Город"
                value={city}
                onChange={setCity}
                options={[{ value: '', label: 'Все города' }, ...CITIES.map((c) => ({ value: c, label: c }))]}
              />
              <span className="mx-1 hidden h-10 w-px bg-line lg:block" />
              <SearchSelect
                icon={Building}
                label="Тип"
                value={type}
                onChange={setType}
                options={[
                  { value: '', label: 'Любой' },
                  { value: 'apartment', label: 'Квартира' },
                  { value: 'house', label: 'Дом' },
                  { value: 'commercial', label: 'Коммерция' },
                ]}
              />
              <span className="mx-1 hidden h-10 w-px bg-line lg:block" />
              <SearchSelect icon={Wallet} label="Бюджет" value={budget} onChange={setBudget} options={BUDGETS} />
              <button type="submit" className="btn-primary h-14 shrink-0 rounded-[20px] px-7 lg:ml-1">
                <Search className="h-4.5 w-4.5" strokeWidth={2} />
                Найти
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted">
              <div className="flex -space-x-3">
                {agents.map((a) => (
                  <Avatar key={a.id} agent={a} className="h-10 w-10 border-2 border-paper text-xs" />
                ))}
              </div>
              <span>
                <b className="font-semibold text-ink-950">4 брокера</b> на связи сегодня
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <b className="font-semibold text-ink-950">4,9</b> по 380 отзывам
              </span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative ml-auto aspect-[5/6] w-full max-w-[640px] overflow-hidden rounded-[36px] shadow-lift">
              <SceneArt scene="view" palette={PALETTES.night} seed="hero" className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent" />
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-white">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Объект недели</div>
                  <div className="mt-2 font-serif text-[30px] leading-tight">Серебряная набережная, 14</div>
                </div>
                <Link
                  to={`/property/${hero.id}`}
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-ink-950 transition hover:scale-105"
                  aria-label="Открыть объект"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="absolute -left-2 top-10 hidden w-[270px] overflow-hidden rounded-3xl border border-line bg-white shadow-lift sm:block lg:-left-8">
              <div className="relative aspect-[16/10]">
                <SceneArt scene="living" palette={hero.palette} seed={hero.id} className="absolute inset-0 h-full w-full" />
              </div>
              <div className="p-5">
                <div className="text-xs text-muted">3-комн. · 104 м² · 11 этаж</div>
                <div className="mt-1.5 text-lg font-semibold tracking-tight">{formatPrice(hero.price)}</div>
              </div>
            </div>

            <div className="absolute -right-2 top-1/2 hidden rounded-3xl border border-line bg-white p-5 shadow-lift sm:block lg:-right-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-50">
                  <ShieldCheck className="h-5 w-5 text-ink-700" strokeWidth={1.5} />
                </span>
                <div>
                  <div className="text-sm font-semibold">Юридически проверен</div>
                  <div className="text-xs text-muted">42 пункта чек-листа</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ПОДБОРКА */}
      <section className="border-t border-line bg-white py-24 lg:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="eyebrow">Подборка месяца</div>
              <h2 className="display-serif mt-4 text-[44px] sm:text-[60px]">Лучшие объекты</h2>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <p className="max-w-md text-muted md:text-right">
                Объекты, которые брокеры «Ключа» лично посмотрели и рекомендуют в этом месяце.
              </p>
              <Link to="/catalog" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                Весь каталог
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ПОЧЕМУ МЫ */}
      <section className="py-24 lg:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="eyebrow">Почему «Ключ»</div>
            <h2 className="display-serif mt-4 text-[44px] sm:text-[52px]">
              Спокойная сделка —
              <br />
              <em className="italic text-ink-600">это не удача</em>
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-muted">
              За пятнадцать лет мы превратили покупку недвижимости в понятный процесс с чёткими шагами и сроками.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:col-span-8">
            {advantages.map((a, i) => {
              const Icon = ICONS[a.icon]
              return (
                <div key={a.title} className="group bg-white p-8 transition-colors duration-500 hover:bg-ink-950 lg:p-10">
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line transition-colors duration-500 group-hover:border-white/15">
                      <Icon className="h-6 w-6 text-ink-700 transition-colors duration-500 group-hover:text-gold" strokeWidth={1.4} />
                    </span>
                    <span className="font-serif text-lg text-ink-300 transition-colors group-hover:text-white/30">0{i + 1}</span>
                  </div>
                  <h3 className="mt-10 font-serif text-[28px] font-medium leading-tight transition-colors duration-500 group-hover:text-white">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-white/60">{a.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* СТАТИСТИКА */}
      <section className="relative overflow-hidden bg-ink-950 py-24 text-white lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px)] [background-size:120px_100%]" />
        <div className="pointer-events-none absolute -right-60 -top-60 h-[760px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(47_70_121/0.35),transparent)]" />
        <div className="container-x relative">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">«Ключ» в цифрах</div>
            <h2 className="display-serif mt-4 text-[40px] sm:text-[52px]">Нам доверяют самое важное решение</h2>
          </div>
          <div className="mt-16 grid gap-y-12 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="lg:border-l lg:border-white/10 lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
                <div className="font-serif text-[64px] font-medium leading-none tracking-tight xl:text-[80px]">{s.value}</div>
                <div className="mt-4 text-sm text-white/55">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ОТЗЫВЫ */}
      <section className="bg-white py-24 lg:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="eyebrow">Отзывы</div>
              <h2 className="display-serif mt-4 text-[44px] sm:text-[60px]">Истории клиентов</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              Средняя оценка 4,9 из 5
            </div>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((r) => (
              <figure key={r.id} className="card flex flex-col p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                <Quote className="h-8 w-8 text-ink-200" strokeWidth={1.25} />
                <blockquote className="mt-6 flex-1 font-serif text-[21px] leading-snug text-ink-900">«{r.text}»</blockquote>
                <figcaption className="mt-8 border-t border-line pt-6">
                  <div className="font-semibold">{r.name}</div>
                  <div className="mt-1 text-xs text-muted">{r.role}</div>
                  <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink-300">{r.date}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[40px] border border-line bg-gradient-to-br from-ink-50 via-white to-[#f3efe8] p-10 sm:p-16">
            <div className="hairline-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_right,black,transparent_70%)]" />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="display-serif text-[40px] sm:text-[56px]">Продаёте недвижимость?</h2>
                <p className="mt-5 max-w-md leading-relaxed text-muted">
                  Оценим объект за 24 часа, подготовим профессиональную презентацию и найдём покупателя без лишних
                  просмотров.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to="/catalog" className="btn-primary h-14 px-8">
                  Смотреть каталог
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="tel:+70000000000" className="btn-ghost h-14 px-8">
                  Позвонить брокеру
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
