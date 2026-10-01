import type { Agent } from '../types'
import { cn } from '../lib/format'

export default function Avatar({ agent, className }: { agent: Agent; className?: string }) {
  const initials = agent.name
    .split(' ')
    .map((w) => w[0])
    .join('')
  return (
    <div
      className={cn('grid shrink-0 place-items-center rounded-full font-serif font-semibold text-white', className)}
      style={{ background: `linear-gradient(140deg, ${agent.gradient[0]}, ${agent.gradient[1]})` }}
      aria-hidden
    >
      {initials}
    </div>
  )
}
