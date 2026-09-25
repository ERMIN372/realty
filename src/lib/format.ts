import type { PropertyType, RequestStatus } from '../types'

const nf = new Intl.NumberFormat('ru-RU')

export const formatPrice = (v: number) => `${nf.format(v)} ₽`

export const formatMillions = (v: number) => {
  const m = v / 1_000_000
  return `${m.toLocaleString('ru-RU', { maximumFractionDigits: m >= 100 ? 0 : 1 })} млн ₽`
}

export const pricePerMeter = (price: number, area: number) => `${nf.format(Math.round(price / area))} ₽/м²`

/** plural(5, ['объект', 'объекта', 'объектов']) */
export function plural(n: number, forms: [string, string, string]) {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}

export const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Квартира',
  house: 'Дом',
  commercial: 'Коммерция',
}

export function roomsLabel(rooms: number, type: PropertyType) {
  if (type === 'commercial') return 'Свободная планировка'
  if (rooms === 0) return 'Студия'
  return `${rooms}-комн.`
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  done: 'Проведена',
  cancelled: 'Отменена',
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', opts)
}

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (!d.startsWith('7')) d = '7' + d
  d = d.slice(0, 11)
  const p = d.slice(1)
  if (!p.length) return ''
  let out = '+7'
  if (p.length) out += ' (' + p.slice(0, 3)
  if (p.length > 3) out += ') ' + p.slice(3, 6)
  if (p.length > 6) out += '-' + p.slice(6, 8)
  if (p.length > 8) out += '-' + p.slice(8, 10)
  return out
}
