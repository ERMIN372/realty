import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-36 text-center">
      <div className="font-serif text-[140px] leading-none text-ink-100">404</div>
      <h1 className="display-serif -mt-6 text-5xl">Такой страницы нет</h1>
      <p className="mt-4 text-muted">Но у нас есть много других адресов.</p>
      <Link to="/" className="btn-primary mt-8">На главную</Link>
    </div>
  )
}
