import { Link } from 'react-router-dom';
import Logo from './Logo';
import useSettings from '../hooks/useSettings';
import './Footer.css';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo settings={settings} to="/" size="default" />
          <p>{settings.footer_description || 'Прокат товаров на каждый день. Просто, быстро, выгодно.'}</p>
        </div>

        <div className="footer__col">
          <h4>Навигация</h4>
          <Link to="/">Главная</Link>
          <Link to="/catalog">Каталог</Link>
          <Link to="/catalog?tab=conditions">Условия проката</Link>
          <Link to="/catalog?tab=delivery">Доставка</Link>
        </div>

        <div className="footer__col">
          <h4>Контакты</h4>
          {settings.contact_phone && (
            <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}>
              📞 {settings.contact_phone}
            </a>
          )}
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`}>
              ✉️ {settings.contact_email}
            </a>
          )}
          {settings.contact_address && (
            <p>📍 {settings.contact_address}</p>
          )}
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          {new Date().getFullYear()} {settings.site_name}
        </div>
      </div>
    </footer>
  );
}