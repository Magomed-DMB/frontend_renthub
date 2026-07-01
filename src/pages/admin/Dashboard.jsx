import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, rented: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1'),
      api.get('/categories'),
      api.get('/products?status=rented&limit=1')
    ]).then(([p, c, r]) => {
      setStats({
        products: p.data.total,
        categories: c.data.length,
        rented: r.data.total
      });
    });
  }, []);

  return (
    <AdminLayout title="Панель управления">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Всего товаров</div>
          <div className="stat-card__value">{stats.products}</div>
        </div>
        <div className="stat-card stat-card--accent">
          <div className="stat-card__label">Категорий</div>
          <div className="stat-card__value">{stats.categories}</div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-card__label">В аренде</div>
          <div className="stat-card__value">{stats.rented}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Доступно</div>
          <div className="stat-card__value">{stats.products - stats.rented}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>Быстрые действия</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/admin/products" className="btn btn-primary">+ Добавить товар</a>
          <a href="/admin/categories" className="btn btn-outline">Управление категориями</a>
          <a href="/admin/messengers" className="btn btn-outline">Контакты мессенджеров</a>
        </div>
      </div>
    </AdminLayout>
  );
}