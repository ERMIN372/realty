/**
 * Защита от расширений браузера (переводчики, ассистенты, блокировщики), которые
 * переносят или подменяют узлы, созданные React. Без неё при смене страницы React
 * падает с «Failed to execute 'removeChild' on 'Node'» и показывает белый экран.
 * Подход из обсуждения https://github.com/facebook/react/issues/11538
 */
export function installDomGuard() {
  if (typeof Node !== 'function' || !Node.prototype) return

  const removeChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn('[Ключ] removeChild: узел перенесён сторонним скриптом', child)
      // узел живёт в чужой обёртке — удаляем его оттуда, чтобы старая страница не осталась на экране
      if (child.parentNode) return removeChild.call(child.parentNode, child) as T
      return child
    }
    return removeChild.call(this, child) as T
  }

  const insertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) {
      console.warn('[Ключ] insertBefore: опорный узел перенесён сторонним скриптом', ref)
      return insertBefore.call(this, node, null) as T
    }
    return insertBefore.call(this, node, ref) as T
  }
}
