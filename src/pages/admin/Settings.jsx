import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

export default function AdminSettings() {
  const [form, setForm] = useState({
    site_name: '',
    site_logo: '',
    hero_tag: '',
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: '',
    hero_button_link: '',
    hero_secondary_button_text: '',
    hero_secondary_button_link: '',
    hero_image: '',
    rent_conditions: '',
    delivery_info: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    footer_description: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings')
      .then(r => {
        setForm(r.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Ошибка загрузки настроек');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    // ✅ ИСПРАВЛЕНО: Добавляем ВСЕ поля, включая пустые строки
    Object.entries(form).forEach(([key, value]) => {
      // Отправляем всё, кроме null и undefined
      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    // Добавляем логотип если выбран
    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      await api.put('/settings', data);
      toast.success('Настройки сохранены');
      setLogoFile(null);

      // Перезагружаем настройки с сервера
      const { data: newSettings } = await api.get('/settings');
      setForm(newSettings);
    } catch (err) {
      toast.error('Ошибка: ' + (err.response?.data?.error || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Настройки сайта">
        <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Настройки сайта">
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>

        {/* Основные настройки */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>🏪 Основные настройки</h3>

          <div className="form-group">
            <label>Название сайта</label>
            <input
              value={form.site_name}
              onChange={e => setForm({ ...form, site_name: e.target.value })}
              placeholder="RentHub"
            />
          </div>

          <div className="form-group">
            <label>Логотип</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setLogoFile(e.target.files[0])}
            />
            {form.site_logo && !logoFile && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Текущий логотип:
                </p>
                <img
                  src={form.site_logo}
                  alt="Логотип"
                  style={{
                    height: '50px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                />
              </div>
            )}
            {logoFile && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '8px' }}>
                  Новый логотип:
                </p>
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Новый логотип"
                  style={{
                    height: '50px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Hero секция */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>🎯 Главная страница (Hero)</h3>

          <div className="form-group">
            <label>Тег над заголовком</label>
            <input
              value={form.hero_tag}
              onChange={e => setForm({ ...form, hero_tag: e.target.value })}
              placeholder="🎯 Прокат №1 в городе"
            />
          </div>

          <div className="form-group">
            <label>Главный заголовок (поддерживает HTML)</label>
            <textarea
              rows="2"
              value={form.hero_title}
              onChange={e => setForm({ ...form, hero_title: e.target.value })}
              placeholder='Арендуйте <span class="text-accent">всё</span>, что нужно'
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Можно использовать HTML, например: &lt;span class="text-accent"&gt;всё&lt;/span&gt;
            </small>
          </div>

          <div className="form-group">
            <label>Подзаголовок</label>
            <textarea
              rows="3"
              value={form.hero_subtitle}
              onChange={e => setForm({ ...form, hero_subtitle: e.target.value })}
              placeholder="Инструменты, техника, спортинвентарь и многое другое..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Текст главной кнопки</label>
              <input
                value={form.hero_button_text}
                onChange={e => setForm({ ...form, hero_button_text: e.target.value })}
                placeholder="Открыть каталог →"
              />
            </div>
            <div className="form-group">
              <label>Ссылка главной кнопки</label>
              <input
                value={form.hero_button_link}
                onChange={e => setForm({ ...form, hero_button_link: e.target.value })}
                placeholder="#cataloghow"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Текст второй кнопки</label>
              <input
                value={form.hero_secondary_button_text}
                onChange={e => setForm({ ...form, hero_secondary_button_text: e.target.value })}
                placeholder="Как это работает"
              />
            </div>
            <div className="form-group">
              <label>Ссылка второй кнопки</label>
              <input
                value={form.hero_secondary_button_link}
                onChange={e => setForm({ ...form, hero_secondary_button_link: e.target.value })}
                placeholder="#how"
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL изображения Hero (необязательно)</label>
            <input
              value={form.hero_image}
              onChange={e => setForm({ ...form, hero_image: e.target.value })}
              placeholder="https://example.com/image.png"
            />
          </div>
        </div>

        {/* Условия и доставка */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>📋 Условия и доставка</h3>

          <div className="form-group">
            <label>Условия проката</label>
            <textarea
              rows="4"
              value={form.rent_conditions}
              onChange={e => setForm({ ...form, rent_conditions: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Информация о доставке</label>
            <textarea
              rows="4"
              value={form.delivery_info}
              onChange={e => setForm({ ...form, delivery_info: e.target.value })}
            />
          </div>
        </div>

        {/* Контакты и Footer */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>📞 Контакты и Footer</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Телефон</label>
              <input
                value={form.contact_phone}
                onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="+7 (900) 123-45-67"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                value={form.contact_email}
                onChange={e => setForm({ ...form, contact_email: e.target.value })}
                placeholder="info@renthub.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Адрес</label>
            <input
              value={form.contact_address}
              onChange={e => setForm({ ...form, contact_address: e.target.value })}
              placeholder="г. Москва, ул. Примерная, 1"
            />
          </div>

          <div className="form-group">
            <label>Описание для Footer</label>
            <textarea
              rows="2"
              value={form.footer_description}
              onChange={e => setForm({ ...form, footer_description: e.target.value })}
              placeholder="Прокат товаров на каждый день. Просто, быстро, выгодно."
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '16px 32px', fontSize: '1.1rem' }}
        >
          {loading ? '💾 Сохранение...' : '💾 Сохранить настройки'}
        </button>
      </form>
    </AdminLayout>
  );
}