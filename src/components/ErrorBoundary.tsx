import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** при смене значения (адреса страницы) ошибка сбрасывается */
  resetKey?: string
}
interface State {
  error: Error | null
}

/** Ловит ошибки рендера, чтобы вместо белого экрана показать понятный экран с кнопкой */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Ключ] Ошибка рендера:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="display-serif text-[44px]">Что-то пошло не так</h1>
        <p className="mt-4 max-w-md text-muted">Страница не смогла отобразиться. Обновите её — данные и избранное сохранены.</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-8">
          <RotateCcw className="h-4 w-4" />
          Обновить страницу
        </button>
        <code className="mt-10 max-w-xl break-words text-[11px] text-ink-300">{error.message}</code>
      </div>
    )
  }
}
