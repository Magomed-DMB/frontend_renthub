import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import useSettings from '../../hooks/useSettings';
import './Admin.css';

export default function AdminLayout({ title, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const menu = [
    { path: '/admin', label: '📊 Дашборд', exact: true },
    { path: '/admin/products', label: '📦 Товары' },
    { path: '/admin/categories', label: '📂 Категории' },
    { path: '/admin/messengers', label: '💬 Мессенджеры' },
    { path: '/admin/settings', label: '⚙️ Настройки' }
  ];

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <Logo settings={settings} to="/admin" size="small" />
        <nav className="admin__nav">
          {menu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={
                item.exact
                  ? location.pathname === item.path ? 'active' : ''
                  : location.pathname.startsWith(item.path) ? 'active' : ''
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin__sidebar-footer">
          <Link to="/" target="_blank">🌐 На сайт</Link>
          <button onClick={logout} className="admin__logout">🚪 Выйти</button>
        </div>
      </aside>

      <main className="admin__main">
        <header className="admin__header">
          <h1>{title}</h1>
        </header>
        <div className="admin__content">
          {children}
        </div>
      </main>
    </div>
  );
}