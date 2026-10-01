import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BedDouble, Building2, MapPin, Maximize2 } from 'lucide-react'
import SceneArt from './SceneArt'
import FavoriteButton from './FavoriteButton'
import type { Property } from '../types'
import { TYPE_LABELS, cn, formatPrice, pricePerMeter, roomsLabel } from '../lib/format'

/** Обложка карточки: явно заданная в данных или первый кадр галереи */
export const coverScene = (p: Property) => p.cover ?? (p.type === 'apartment' ? (p.scenes[1] ?? p.scenes[0]) : p.scenes[0])

function PropertyCard({ property: p, view = 'grid' }: { property: Property; view?: 'grid' | 'list' }) {
  const list = view === 'list'
  return (
    <Link
      to={`/property/${p.id}`}
      className={cn(
        'group card relative flex overflow-hidden transition-all duration-500 [content-visibility:auto] [contain-intrinsic-size:auto_560px] hover:-translate-y-1 hover:border-ink-200 hover:shadow-lift',
        list ? 'flex-col sm:flex-row' : 'flex-col',
      )}
    >
      <div className={cn('relative overflow-hidden bg-ink-50', list ? 'aspect-[4/3] sm:aspect-auto sm:w-[42%] sm:shrink-0' : 'aspect-[4/3]')}>
        <SceneArt
          scene={coverScene(p)}
          palette={p.palette}
          seed={p.id}
          className="absolute inset-0 h-full w-full transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-ink-900">{TYPE_LABELS[p.type]}</span>
            {p.isNew && <span className="rounded-full bg-ink-900 px-3 py-1 text-[11px] font-semibold text-white">Новое</span>}
          </div>
          <FavoriteButton id={p.id} />
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col', list ? 'p-6 sm:p-8' : 'p-6')}>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
          {p.city}, {p.district}
        </div>
        <h3 className={cn('mt-2.5 font-serif font-medium leading-[1.15] text-ink-950', list ? 'text-[28px]' : 'line-clamp-2 min-h-[2.3em] text-[24px]')}>
          {p.title}
        </h3>
        {list && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{p.description}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-800">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
            {roomsLabel(p.rooms, p.type)}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize2 className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
            {p.area} м²
          </span>
          {p.floor && p.floors && (
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
              {p.floor}/{p.floors} эт.
            </span>
          )}
        </div>

        <div className="mt-auto pt-6">
        <div className="flex items-end justify-between gap-4 border-t border-line pt-5">
          <div>
            <div className="text-[22px] font-semibold tracking-tight text-ink-950">{formatPrice(p.price)}</div>
            <div className="mt-0.5 text-xs text-muted">{pricePerMeter(p.price, p.area)}</div>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-900 transition-all duration-300 group-hover:border-ink-900 group-hover:bg-ink-900 group-hover:text-white">
            <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
        </div>
        </div>
      </div>
    </Link>
  )
}

export default memo(PropertyCard)
