import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CategoryCard from '../components/CategoryCard';
import InfoBlock from '../components/InfoBlock';
import HeroMorphing from '../components/HeroMorphing';
import './Home.css';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    hero_tag: '🎯 Прокат №1 в городе',
    hero_title: 'Арендуйте <span class="text-accent">всё</span>, что нужно',
    hero_subtitle: 'Инструменты, техника, спортинвентарь и многое другое. Без переплат — от 1 дня.',
    hero_button_text: 'Открыть каталог →',
    hero_button_link: '#cataloghow',
    hero_secondary_button_text: 'Как это работает',
    hero_secondary_button_link: '#how',
    hero_image: '',
    rent_conditions: '',
    delivery_info: ''
  });

  // ✅ ОПРЕДЕЛЕНИЕ МАССИВА MORPHING ITEMS
  const morphingItemsUrl = [
    { type: 'image', src: '/icons/comp.png', label: 'Инструменты' },
    { type: 'image', src: '/icons/home.png', label: 'Электроника' },
    { type: 'image', src: '/icons/velosiped.png', label: 'Транспорт' },
    { type: 'image', src: '/icons/playstations.png', label: 'Спорт' }
  ];

  useEffect(() => {
    Promise.all([
      api.get('/categories/hierarchy'),
      api.get('/settings')
    ]).then(([catRes, setRes]) => {
      setCategories(catRes.data);
      setSettings(prev => ({ ...prev, ...setRes.data }));
    });
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            {settings.hero_tag && (
              <span className="hero__tag">{settings.hero_tag}</span>
            )}
            <h1 dangerouslySetInnerHTML={{ __html: settings.hero_title }} />
            <p className="hero__subtitle">
              {settings.hero_subtitle}
            </p>
            <div className="hero__actions">
              <a
                href={settings.hero_button_link || '#cataloghow'}
                className="btn btn-primary"
              >
                {settings.hero_button_text || 'Открыть каталог →'}
              </a>
              <a
                href={settings.hero_secondary_button_link || '#how'}
                className="btn btn-outline"
              >
                {settings.hero_secondary_button_text || 'Как это работает'}
              </a>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__circle hero__circle--1"></div>
            <div className="hero__circle hero__circle--2"></div>
            {/* ✅ ИСПОЛЬЗУЕМ MORPHING ITEMS */}
            <HeroMorphing
              items={morphingItemsUrl}
              size="large"           // 'small' | 'medium' | 'large'
              duration={3000}        // Интервал смены (мс)
              animationDuration={500} // Длительность анимации (мс)
              showIndicators={false}  // Показывать индикаторы
            />
          </div>
        </div>
      </section>

      {/* КАТЕГОРИИ */}
      <section className="section section--cat" id="cataloghow">
        <div className="container">
          <div className="section__head">
            <h2>Категории товаров</h2>
            <Link to="/catalog" className="section__link">Все категории →</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* УСЛОВИЯ + ДОСТАВКА */}
      <section className="section section--alt" id="how">
        <div className="container">
          <div className="info-grid">
            <InfoBlock
              icon="📋"
              title="Условия проката"
              text={settings.rent_conditions || 'Залог, паспорт, минимальный срок — 1 день. Всё просто и прозрачно.'}
              color="var(--primary)"
            />
            <InfoBlock
              icon="🚚"
              title="Доставка"
              text={settings.delivery_info || 'Доставка по городу. Самовывоз из пункта выдачи бесплатно.'}
              color="var(--accent)"
            />
          </div>
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section className="section">
        <div className="container">
          <h2 className="text-center">Как это работает</h2>
          <div className="steps-grid">
            {[
              { n: '01', icon: '🔍', title: 'Выберите товар', text: 'Найдите нужное в каталоге или через поиск' },
              { n: '02', icon: '💬', title: 'Напишите нам', text: 'Через удобный мессенджер — Telegram, WhatsApp, Viber' },
              { n: '03', icon: '✅', title: 'Получите товар', text: 'Заберите сами или закажите доставку' },
              { n: '04', icon: '🎉', title: 'Пользуйтесь', text: 'Используйте и возвращайте, когда удобно' }
            ].map(step => (
              <div key={step.n} className="step-card card">
                <div className="step-card__num">{step.n}</div>
                <div className="step-card__icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}