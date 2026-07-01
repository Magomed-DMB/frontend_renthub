import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import useSettings from '../hooks/useSettings';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search.value.trim();
    if (q) navigate(`/catalog?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Logo settings={settings} to="/" size="default" />

        <form className="header__search" onSubmit={handleSearch}>
          <input
            type="search"
            name="search"
            placeholder="Что ищем? Например, дрель..."
            aria-label="Поиск товаров"
          />
          <button type="submit" className="header__search-btn">🔍</button>
        </form>

        <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Главная</Link>
          <Link to="/catalog" onClick={() => setMenuOpen(false)}>Каталог</Link>
          <Link to="/catalog?tab=conditions" onClick={() => setMenuOpen(false)}>Условия проката</Link>
          <Link to="/catalog?tab=delivery" onClick={() => setMenuOpen(false)}>Доставка</Link>
        </nav>

        <button
          className={`burger ${menuOpen ? 'burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}