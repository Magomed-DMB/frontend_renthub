import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';  // ✅ Добавлен useLocation
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductPage from './pages/ProductPage';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminMessengers from './pages/admin/Messengers';
import AdminSettings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import useSettings from './hooks/useSettings';

// Компонент для динамического обновления заголовка вкладки
function TitleUpdater() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const pageTitles = {
      '/': 'Главная',
      '/catalog': 'Каталог',
      '/admin': 'Админ-панель',
      '/admin/login': 'Вход в админку',
      '/admin/products': 'Товары',
      '/admin/categories': 'Категории',
      '/admin/messengers': 'Мессенджеры',
      '/admin/settings': 'Настройки'
    };

    // Проверяем, является ли путь страницей товара
    let pageTitle = pageTitles[location.pathname];

    if (!pageTitle && location.pathname.startsWith('/product/')) {
      pageTitle = 'Товар';
    }
    if (!pageTitle && location.pathname.startsWith('/catalog/')) {
      pageTitle = 'Каталог';
    }

    const siteName = settings.site_name || 'RentHub';

    document.title = pageTitle
      ? `${pageTitle} — ${siteName}`
      : siteName;
  }, [location, settings.site_name]);

  return null;
}

export default function App() {
  return (
    <div className="app">
      <TitleUpdater />
      <Routes>
        {/* Админ-страницы без общего layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute><AdminProducts /></ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute><AdminCategories /></ProtectedRoute>
        } />
        <Route path="/admin/messengers" element={
          <ProtectedRoute><AdminMessengers /></ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute><AdminSettings /></ProtectedRoute>
        } />

        {/* Публичные страницы */}
        <Route path="*" element={
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:category" element={<Catalog />} />
                <Route path="/product/:slug" element={<ProductPage />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}