import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { MESSENGER_ICONS, TYPE_LABELS, DEFAULT_COLORS, normalizeType } from '../../constants/messengerIcons';

export default function AdminMessengers() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    type: 'telegram',
    label: '',
    value: '',
    color: '#0088cc',
    sort_order: 0,
    is_active: true
  });

  const load = () => api.get('/messengers/all').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      // ✅ Нормализуем тип при загрузке
      const normalizedType = normalizeType(item.type);
      setForm({
        type: normalizedType,
        label: item.label || '',
        value: item.value || '',
        color: item.color || DEFAULT_COLORS[normalizedType] || '#1E5AA8',
        sort_order: item.sort_order || 0,
        is_active: Boolean(item.is_active)
      });
    } else {
      setEditing(null);
      setForm({
        type: 'telegram',
        label: '',
        value: '',
        color: DEFAULT_COLORS['telegram'],
        sort_order: 0,
        is_active: true
      });
    }
    setModalOpen(true);
  };

  // При смене типа обновляем цвет по умолчанию и placeholder
  const handleTypeChange = (newType) => {
    setForm({
      ...form,
      type: newType,
      color: DEFAULT_COLORS[newType] || form.color,
      label: form.label || TYPE_LABELS[newType] || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/messengers/${editing.id}`, form);
        toast.success('Сохранено');
      } else {
        await api.post('/messengers', form);
        toast.success('Добавлено');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error('Ошибка: ' + (err.response?.data?.error || 'Неизвестная ошибка'));
    }
  };

  const remove = async (id) => {
    if (!confirm('Удалить контакт?')) return;
    await api.delete(`/messengers/${id}`);
    toast.success('Удалено');
    load();
  };

  // Получаем placeholder для поля значения
  const getValuePlaceholder = () => {
    switch (form.type) {
      case 'phone': return '+7 (900) 123-45-67';
      case 'telegram': return 'https://t.me/username';
      case 'whatsapp': return 'https://wa.me/79001234567';
      case 'max': return 'https://max.ru/username';
      default: return 'https://...';
    }
  };

  // Получаем label для поля значения
  const getValueLabel = () => {
    return form.type === 'phone' ? 'Номер телефона *' : 'Ссылка *';
  };

  // Получаем подсказку
  const getValueHint = () => {
    switch (form.type) {
      case 'phone': return 'Формат: +7 (900) 123-45-67';
      case 'telegram': return 'Формат: https://t.me/username';
      case 'whatsapp': return 'Формат: https://wa.me/79001234567';
      case 'max': return 'Укажите ссылку на профиль';
      default: return '';
    }
  };

  return (
    <AdminLayout title="Мессенджеры и контакты">
      <div className="admin-toolbar">
        <p style={{ color: 'var(--text-muted)' }}>Эти кнопки увидят клиенты в окне заказа</p>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Добавить контакт</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Тип</th>
              <th>Название</th>
              <th>Ссылка / Номер</th>
              <th>Порядок</th>
              <th>Активен</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map(m => {
              const normalizedType = normalizeType(m.type);
              return (
                <tr key={m.id}>
                  {/* Тип с иконкой */}
                  <td>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {/* Иконка */}
                      <img
                        src={MESSENGER_ICONS[normalizedType]}
                        alt={TYPE_LABELS[normalizedType]}
                        style={{
                          width: '24px',
                          height: '24px',
                          objectFit: 'contain'
                        }}
                      />
                      {/* Название типа */}
                      <span style={{
                        padding: '4px 12px',
                        background: m.color || DEFAULT_COLORS[normalizedType] || '#1E5AA8',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {TYPE_LABELS[normalizedType] || normalizedType}
                      </span>
                    </div>
                  </td>
                  {/* Название */}
                  <td><strong>{m.label}</strong></td>
                  {/* Ссылка */}
                  <td>
                    <code style={{
                      fontSize: '0.8rem',
                      background: 'var(--bg)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {m.value}
                    </code>
                  </td>
                  {/* Порядок */}
                  <td>{m.sort_order}</td>
                  {/* Активен */}
                  <td>
                    <span style={{ fontSize: '1.2rem' }}>
                      {m.is_active ? '✅' : '❌'}
                    </span>
                  </td>
                  {/* Действия */}
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-outline" onClick={() => openModal(m)}>✏️</button>
                      <button
                        className="btn btn-sm"
                        style={{ background: '#FEE2E2', color: '#991B1B' }}
                        onClick={() => remove(m.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Контактов пока нет
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
              <h3>{editing ? 'Редактировать контакт' : 'Новый контакт'}</h3>
              <button onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Тип */}
              <div className="form-group">
                <label>Тип *</label>
                <select
                  value={form.type}
                  onChange={e => handleTypeChange(e.target.value)}
                >
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Телефон (звонок)</option>
                  <option value="max">Max</option>
                </select>
              </div>

              {/* Предпросмотр */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--bg)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <span style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: form.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={MESSENGER_ICONS[form.type]}
                    alt={TYPE_LABELS[form.type]}
                    style={{
                      width: '24px',
                      height: '24px',
                      objectFit: 'contain'
                    }}
                  />
                </span>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {TYPE_LABELS[form.type] || form.type}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Цвет: {form.color}
                  </div>
                </div>
              </div>

              {/* Название */}
              <div className="form-group">
                <label>Название (отображается клиенту) *</label>
                <input
                  required
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder={TYPE_LABELS[form.type] || 'Название'}
                />
              </div>

              {/* Ссылка / Номер - ДИНАМИЧЕСКИЙ LABEL */}
              <div className="form-group">
                <label>{getValueLabel()}</label>
                <input
                  required
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value })}
                  placeholder={getValuePlaceholder()}
                />
                {getValueHint() && (
                  <small style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    display: 'block',
                    marginTop: '4px'
                  }}>
                    {getValueHint()}
                  </small>
                )}
              </div>

              {/* Цвет */}
              <div className="form-group">
                <label>Цвет кнопки</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', border: '2px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* Порядок */}
              <div className="form-group">
                <label>Порядок сортировки</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Активен */}
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
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: 'var(--accent)'
                    }}
                  />
                  Активна (отображается клиентам)
                </label>
              </div>

              <div className="admin-modal__actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}