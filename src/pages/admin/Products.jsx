import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';


export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: ''
  });

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    description: '',
    price_per_day: '',
    deposit: '',
    image: null,
    is_featured: false
  });

  const load = () => {
    Promise.all([
      api.get('/products?limit=1000'),
      api.get('/categories')
    ]).then(([productsRes, categoriesRes]) => {
      setProducts(productsRes.data.products);
      setFilteredProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  // Применение фильтров
  useEffect(() => {
    let result = [...products];

    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по категории
    if (filters.category) {
      result = result.filter(p =>
        p.category_id === parseInt(filters.category) ||
        p.category_slug === filters.category
      );
    }

    // Фильтр по статусу
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }

    // Фильтр по минимальной цене
    if (filters.minPrice) {
      result = result.filter(p => p.price_per_day >= parseFloat(filters.minPrice));
    }

    // Фильтр по максимальной цене
    if (filters.maxPrice) {
      result = result.filter(p => p.price_per_day <= parseFloat(filters.maxPrice));
    }

    setFilteredProducts(result);
  }, [filters, products]);

  const openModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({
        title: product.title,
        category_id: product.category_id,
        description: product.description || '',
        price_per_day: product.price_per_day,
        deposit: product.deposit || '',
        image: null,
        is_featured: !!product.is_featured
      });
    } else {
      setEditing(null);
      setForm({
        title: '',
        category_id: '',
        description: '',
        price_per_day: '',
        deposit: '',
        image: null,
        is_featured: false
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== '') data.append(k, v);
    });

    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, data);
        toast.success('Товар обновлён');
      } else {
        await api.post('/products', data);
        toast.success('Товар создан');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    }
  };

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'available' ? 'rented' : 'available';
    try {
      await api.patch(`/products/${product.id}/status`, { status: newStatus });
      toast.success(`Статус: ${newStatus === 'rented' ? 'Арендован' : 'Доступен'}`);
      load();
    } catch (err) {
      toast.error('Ошибка изменения статуса');
    }
  };

  const remove = async (id) => {
    if (!confirm('Удалить товар?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Удалено');
    load();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.status || filters.minPrice || filters.maxPrice;

  return (
    <AdminLayout title="Товары">
      {/* ФИЛЬТРЫ */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Фильтр</h3>
          {hasActiveFilters && (
            <button className="btn btn-sm btn-outline" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {/* Поиск */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              🔎 Поиск
            </label>
            <input
              type="text"
              placeholder="Название товара..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Категория */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              📂 Категория
            </label>
            <select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'white'
              }}
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Статус */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              📊 Статус
            </label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'white'
              }}
            >
              <option value="">Любой</option>
              <option value="available">Доступен</option>
              <option value="rented">Арендован</option>
            </select>
          </div>

          {/* Минимальная цена */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              💰 Цена от, ₽
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              value={filters.minPrice}
              onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Максимальная цена */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              💰 Цена до, ₽
            </label>
            <input
              type="number"
              placeholder="∞"
              min="0"
              step="0.01"
              value={filters.maxPrice}
              onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>

        {/* Активные фильтры */}
        {hasActiveFilters && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Активные фильтры:
            </span>
            {filters.search && (
              <span style={{
                padding: '4px 12px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Поиск: {filters.search}
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span style={{
                padding: '4px 12px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Категория: {categories.find(c => c.id === parseInt(filters.category))?.name}
                <button
                  onClick={() => setFilters({ ...filters, category: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span style={{
                padding: '4px 12px',
                background: filters.status === 'available' ? '#10B981' : '#EF4444',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Статус: {filters.status === 'available' ? 'Доступен' : 'Арендован'}
                <button
                  onClick={() => setFilters({ ...filters, status: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span style={{
                padding: '4px 12px',
                background: '#8B5CF6',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Цена: {filters.minPrice || 0} - {filters.maxPrice || '∞'} ₽
                <button
                  onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* СТАТИСТИКА */}
      <div className="admin-toolbar">
        <p style={{ color: 'var(--text-muted)' }}>
          Всего: {products.length} • Показано: {filteredProducts.length}
        </p>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Добавить товар
        </button>
      </div>

      {/* ТАБЛИЦА ТОВАРОВ - АДАПТИВНАЯ */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Цена / Залог</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                {/* Товар: Фото + Название + Категория */}
                <td data-label="Товар">
                  <div className="product-cell">
                    <img
                      src={p.image || '../../../public/icons/image-placeholder.png'}
                      alt={p.title}
                      onError={(e) => { e.target.src = '../../../public/icons/image-placeholder.png'; }}
                      className="product-cell__image"
                    />
                    <div className="product-cell__info">
                      <div className="product-cell__title">
                        <strong>{p.title}</strong>
                        {!!p.is_featured && (
                          <span className="hit-badge">Хит</span>
                        )}
                      </div>
                      <div className="product-cell__category">
                        {p.category_name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Цена и залог */}
                <td data-label="Цена / Залог">
                  <div className="price-cell">
                    <div className="price-cell__main">
                      {p.price_per_day} ₽
                      <span className="price-cell__unit">/день</span>
                    </div>
                    {p.deposit && parseFloat(p.deposit) > 0 ? (
                      <div className="price-cell__deposit">
                        Залог: {p.deposit} ₽
                      </div>
                    ) : (
                      <div className="price-cell__no-deposit">
                        Без залога
                      </div>
                    )}
                  </div>
                </td>

                {/* Статус */}
                <td data-label="Статус">
                  <span className={`status-badge status-badge--${p.status}`}>
                    {p.status === 'rented' ? '🔒 Арендован' : '✓ Доступен'}
                  </span>
                </td>

                {/* Кнопки действий */}
                <td data-label="Действия">
                  <div className="action-btns">
                    <button
                      className={`btn btn-sm ${p.status === 'rented' ? 'btn-outline' : 'btn-secondary'}`}
                      onClick={() => toggleStatus(p)}
                      title={p.status === 'rented' ? 'Вернуть' : 'Отметить как арендованный'}
                    >
                      {p.status === 'rented' ? 'Доступен' : 'Арендован'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => openModal(p)}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => remove(p.id)}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredProducts.length && (
              <tr>
                <td colSpan="4" style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'var(--text-muted)'
                }}>
                  {hasActiveFilters ? (
                    <div>
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                      <p>Товары не найдены</p>
                      <button className="btn btn-sm btn-outline" onClick={resetFilters}>
                        Сбросить фильтры
                      </button>
                    </div>
                  ) : (
                    'Товаров пока нет'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      {modalOpen && (
        <div className="admin-modal" onClick={() => setModalOpen(false)}>
          <div className="admin-modal__content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>{editing ? 'Редактировать товар' : 'Новый товар'}</h3>
              <button onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Категория *</label>
                <select
                  required
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">Выберите...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Цена в день, ₽ *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price_per_day}
                  onChange={e => setForm({ ...form, price_per_day: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Залог, ₽ (необязательно)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={form.deposit}
                  onChange={e => setForm({ ...form, deposit: e.target.value })}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                  Оставьте пустым, если залог не требуется
                </small>
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Изображение {editing && '(оставьте пустым, чтобы не менять)'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setForm({ ...form, image: e.target.files[0] })}
                />
              </div>
              <div className="form-group">
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500
                }}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: 'var(--accent)'
                    }}
                  />
                  Хит продаж
                </label>
              </div>
              <div className="admin-modal__actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}