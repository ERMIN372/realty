# «Ключ» — демо-сайт агентства недвижимости

Демо-проект для портфолио. Агентство, люди, адреса и объекты вымышлены. Бэкенда нет: авторизация, заявки, избранное и редактирование объектов имитируются на фронте (React state + `localStorage`).

**Стек:** Vite · React 19 · TypeScript · Tailwind CSS 4 · react-router-dom (HashRouter) · lucide-react.
Картинки — только SVG-иллюстрации (`src/components/SceneArt.tsx`), CSS-градиенты и иконки. Шрифты (Cormorant Garamond, Manrope) подключены локально через `@fontsource`.

## Запуск

```bash
npm install
npm run dev       # http://localhost:5173/realty/
npm run build     # сборка в dist/
npm run preview   # http://localhost:4173/realty/ — проверка собранной версии
```

## Страницы

| Страница | Адрес |
| --- | --- |
| Главная | `#/` |
| Каталог (фильтры, сортировка, плитка/список) | `#/catalog` |
| Каталог со списком | `#/catalog?view=list` |
| Карточка объекта | `#/property/k-101` (id от `k-101` до `k-303`) |
| Избранное | `#/favorites` |
| Админ-панель: объекты | `#/admin` |
| Админ-панель: заявки на просмотр | `#/admin/requests` |

Вход в админку (данные подставлены в форму): `admin@kluch.demo` / `demo2026`.
Кнопка «Сбросить демо-данные» в сайдбаре админки возвращает исходные объекты и заявки.

## Деплой на GitHub Pages

1. Имя репозитория должно совпадать с `base` в `vite.config.ts` (сейчас `'/realty/'`). Если переименуете репозиторий — поменяйте `base`.
2. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Запушьте в `main` — workflow `.github/workflows/deploy.yml` соберёт проект и опубликует `dist/`.
   Его можно запустить и вручную: **Actions → Deploy to GitHub Pages → Run workflow**.
4. Сайт будет доступен по адресу: `https://ermin372.github.io/realty/`

Роутинг сделан на `HashRouter` (адреса вида `/realty/#/catalog`), поэтому обновление любой страницы на GitHub Pages не даёт 404.

## Структура

```
src/
  data/mock.ts          # все фейковые данные: объекты, брокеры, отзывы, заявки
  store/AppStore.tsx    # состояние + localStorage (избранное, заявки, объекты, вход)
  components/           # шапка, футер, карточка, SVG-сцены, карта-схема, модалка
  pages/                # Главная, Каталог, Объект, Избранное, 404
  pages/admin/          # Админ-панель: объекты и заявки
```
