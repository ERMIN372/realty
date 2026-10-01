import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import Layout from './components/Layout'
import Toasts from './components/Toasts'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import PropertyPage from './pages/PropertyPage'
import Favorites from './pages/Favorites'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import AdminProperties from './pages/admin/AdminProperties'
import AdminRequests from './pages/admin/AdminRequests'
import ErrorBoundary from './components/ErrorBoundary'

// после ошибки переход на другую страницу сбрасывает экран ошибки
function AppRoutes() {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="property/:id" element={<PropertyPage />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminProperties />} />
          <Route path="requests" element={<AdminRequests />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

// HashRouter: GitHub Pages не умеет отдавать index.html на любые пути, поэтому роутинг живёт после «#»
export default function App() {
  return (
    <AppStoreProvider>
      <HashRouter>
        <AppRoutes />
        <Toasts />
      </HashRouter>
    </AppStoreProvider>
  )
}
