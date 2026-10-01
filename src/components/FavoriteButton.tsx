import { Heart } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { cn } from '../lib/format'

export default function FavoriteButton({
  id,
  className,
  size = 'md',
  tone = 'glass',
}: {
  id: string
  className?: string
  size?: 'md' | 'lg'
  tone?: 'glass' | 'solid'
}) {
  const { isFavorite, toggleFavorite } = useStore()
  const active = isFavorite(id)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(id)
      }}
      aria-pressed={active}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      className={cn(
        'grid place-items-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95',
        size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : tone === 'solid'
            ? 'border-line bg-white text-ink-900 hover:border-ink-900'
            : 'border-white/60 bg-white/95 text-ink-900 hover:bg-white',
        className,
      )}
    >
      <Heart className={cn(size === 'lg' ? 'h-5 w-5' : 'h-4 w-4', active && 'fill-current')} strokeWidth={1.75} />
    </button>
  )
}
