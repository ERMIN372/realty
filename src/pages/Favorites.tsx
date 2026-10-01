import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Trash2 } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import { useStore } from '../store/AppStore'
import { formatPrice, plural } from '../lib/format'

export default function Favorites() {
  const { properties, favorites, clearFavorites } = useStore()
  const items = favorites.map((id) => properties.find((p) => p.id === id)).filter((p) => p !== undefined)
  const total = items.reduce((s, p) => s + p.price, 0)

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <div className="flex flex-col justify-between gap-6 border-b border-line pb-10 md:flex-row md:items-end">
        <div>
          <div className="eyebrow">Ваша подборка</div>
          <h1 className="display-serif mt-4 text-[48px] sm:text-[68px]">Избранное</h1>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <div className="text-xs text-muted">Сохранено</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">
                {items.length} {plural(items.length, ['объект', 'объекта', 'объектов'])}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Суммарная стоимость</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{formatPrice(total)}</div>
            </div>
            <button onClick={clearFavorites} className="btn-ghost btn-sm">
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Очистить
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mx-auto flex max-w-lg flex-col items-center py-28 text-center">
          <div className="relative">
            <span className="absolute inset-0 animate-ping rounded-full bg-ink-100 [animation-duration:2.4s]" />
            <span className="relative grid h-24 w-24 place-items-center rounded-full border border-line bg-white shadow-soft">
              <Heart className="h-9 w-9 text-ink-700" strokeWidth={1.25} />
            </span>
          </div>
          <h2 className="mt-10 font-serif text-[40px] leading-tight">Здесь пока пусто</h2>
          <p className="mt-3 text-muted">
            Нажимайте на сердечко в карточке объекта — мы сохраним подборку в этом браузере, чтобы вы могли вернуться к ней
            позже.
          </p>
          <Link to="/catalog" className="btn-primary mt-10">
            Перейти в каталог
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  )
}
