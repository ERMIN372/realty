import { CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/AppStore'

export default function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="animate-pop flex items-center gap-2.5 rounded-full bg-ink-950 px-5 py-3 text-sm font-medium text-white shadow-lift">
          <CheckCircle2 className="h-4 w-4 text-gold" />
          {t.text}
        </div>
      ))}
    </div>
  )
}
