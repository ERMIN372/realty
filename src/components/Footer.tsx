import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink-950 text-white">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo light />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
            Городская и загородная недвижимость с персональным брокером. Подбираем, проверяем и сопровождаем сделку до
            передачи ключей.
          </p>
        </div>
        <div className="md:col-span-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Разделы</div>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li><Link className="transition hover:text-white" to="/catalog">Каталог объектов</Link></li>
            <li><Link className="transition hover:text-white" to="/catalog?type=house">Загородные дома</Link></li>
            <li><Link className="transition hover:text-white" to="/catalog?type=commercial">Коммерческая</Link></li>
            <li><Link className="transition hover:text-white" to="/favorites">Избранное</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Контакты</div>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-white/40" strokeWidth={1.5} />+7 (000) 000-00-00</li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-white/40" strokeWidth={1.5} />hello@kluch.demo</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-white/40" strokeWidth={1.5} />Новоградск, ул. Янтарная, 1, офис 3</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 «Ключ». Все данные вымышлены.</span>
          <span className="text-[11px]">Демо-проект</span>
        </div>
      </div>
    </footer>
  )
}
