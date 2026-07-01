import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Компонент перетаскиваемой строки
function SortableCategory({ category, onEdit, onDelete, level = 0 }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  // Определяем что показывать: загруженное фото > URL иконки > эмодзи
  const renderIcon = () => {
    if (category.image) {
      return (
        <img
          src={category.image}
          alt={category.name}
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}
        />
      );
    }
    if (category.icon_url) {
      return (
        <img
          src={category.icon_url}
          alt={category.name}
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            borderRadius: '8px',
            background: 'var(--bg)',
            border: '1px solid var(--border)'
          }}
        />
      );
    }
    return (
      <div
        style={{
          width: '50px',
          height: '50px',
          background: 'var(--bg)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          border: '1px solid var(--border)'
        }}
      >
        {category.icon || '📦'}
      </div>
    );
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td {...listeners} style={{ width: '40px', textAlign: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>⋮⋮</span>
      </td>
      <td>{renderIcon()}</td>
      <td style={{ paddingLeft: `${16 + level * 32}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {level > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>↳</span>
          )}
          <strong>{category.name}</strong>
          {level > 0 && (
            <span style={{
              padding: '2px 8px',
              background: 'var(--bg)',
              borderRadius: '10px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              подкатегория
            </span>
          )}
        </div>
      </td>
      <td><code>{category.slug}</code></td>
      <td>{category.products_count || 0}</td>
      <td>{category.parent_name || '—'}</td>
      <td>
        <span className={`status-badge ${category.is_active ? 'status-badge--available' : 'status-badge--rented'}`}>
          {category.is_active ? 'Активна' : 'Скрыта'}
        </span>
      </td>
      <td>
        <div className="action-btns">
          <button className="btn btn-sm btn-outline" onClick={() => onEdit(category)}>✏️</button>
          <button
            className="btn btn-sm"
            style={{ background: '#FEE2E2', color: '#991B1B' }}
            onClick={() => onDelete(category)}
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    icon: '',
    icon_url: '',
    icon_type: 'emoji',
    description: '',
    image: null,
    delete_image: false,
    is_active: true,
    parent_id: ''
  });

  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    parent: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = () => api.get('/categories/all').then(r => setCategories(r.data));

  useEffect(() => {
    load();
  }, []);

  // Применение фильтров
  useEffect(() => {
    let result = [...categories];

    // === ПОИСК (с расширенной логикой) ===
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();

      // 1. Находим все категории, совпадающие с поиском
      const matchedIds = new Set();
      result.forEach(c => {
        if (
          c.name.toLowerCase().includes(searchLower) ||
          c.slug.toLowerCase().includes(searchLower)
        ) {
          matchedIds.add(c.id);
        }
      });

      // 2. Для каждой найденной подкатегории добавляем её родителя
      //    (чтобы была видна иерархия)
      result.forEach(c => {
        if (matchedIds.has(c.id) && c.parent_id) {
          matchedIds.add(c.parent_id);
        }
      });

      // 3. Для каждой найденной корневой категории добавляем все её подкатегории
      result.forEach(c => {
        if (matchedIds.has(c.id) && !c.parent_id) {
          result
            .filter(sub => sub.parent_id === c.id)
            .forEach(sub => matchedIds.add(sub.id));
        }
      });

      // 4. Оставляем только нужные категории
      result = result.filter(c => matchedIds.has(c.id));
    }

    // === ФИЛЬТР ПО СТАТУСУ ===
    if (filters.status) {
      result = result.filter(c =>
        c.is_active === (filters.status === 'active')
      );
    }

    // === ФИЛЬТР ПО РОДИТЕЛЮ ===
    if (filters.parent) {
      if (filters.parent === 'root') {
        result = result.filter(c => !c.parent_id);
      } else {
        const parentId = parseInt(filters.parent);
        // Показываем выбранную корневую категорию и все её подкатегории
        result = result.filter(c =>
          c.id === parentId || c.parent_id === parentId
        );
      }
    }

    // === ГРУППИРОВКА: подкатегории сразу после родителей ===
    // 1. Получаем все корневые категории из отфильтрованного списка
    const rootCats = result.filter(c => !c.parent_id);

    // 2. Сортируем корневые по sort_order
    rootCats.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // 3. Для каждой корневой находим её подкатегории
    const sortedWithChildren = [];
    rootCats.forEach(root => {
      // Добавляем корневую
      sortedWithChildren.push(root);

      // Находим все подкатегории этой корневой (из отфильтрованного списка)
      const children = result
        .filter(c => c.parent_id === root.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      // Добавляем подкатегории
      children.forEach(child => {
        sortedWithChildren.push(child);
      });
    });

    // 4. Если есть "осиротевшие" подкатегории (их родитель не прошёл фильтр),
    //    добавляем их в конец
    const addedIds = new Set(sortedWithChildren.map(c => c.id));
    result
      .filter(c => c.parent_id && !addedIds.has(c.id))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .forEach(c => sortedWithChildren.push(c));

    setFilteredCategories(sortedWithChildren);
  }, [filters, categories]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredCategories.findIndex((c) => c.id === active.id);
    const newIndex = filteredCategories.findIndex((c) => c.id === over.id);

    // Разрешаем перетаскивание только в пределах одного уровня
    if (filteredCategories[oldIndex].parent_id !== filteredCategories[newIndex].parent_id) {
      toast.error('Можно менять порядок только в пределах одного уровня');
      return;
    }

    // Сортируем только элементы того же уровня
    const sameLevelItems = filteredCategories.filter(
      c => c.parent_id === filteredCategories[oldIndex].parent_id
    );
    const oldIndexInLevel = sameLevelItems.findIndex(c => c.id === active.id);
    const newIndexInLevel = sameLevelItems.findIndex(c => c.id === over.id);
    const reordered = arrayMove(sameLevelItems, oldIndexInLevel, newIndexInLevel);

    // Обновляем sort_order
    const updatedCategories = categories.map(cat => {
      if (cat.parent_id === filteredCategories[oldIndex].parent_id) {
        const newIdx = reordered.findIndex(c => c.id === cat.id);
        return { ...cat, sort_order: newIdx + 1 };
      }
      return cat;
    });

    setCategories(updatedCategories);

    try {
      await api.put('/categories/reorder', {
        categories: updatedCategories.map(c => ({ id: c.id, sort_order: c.sort_order }))
      });
      toast.success('Порядок сохранён');
    } catch (err) {
      toast.error('Ошибка сохранения порядка');
      load();
    }
  };

  const openModal = (cat = null) => {
    if (cat) {
      setEditing(cat);
      setForm({
        name: cat.name,
        icon: cat.icon || '',
        icon_url: cat.icon_url || '',
        icon_type: cat.icon_url ? 'url' : 'emoji',
        description: cat.description || '',
        image: null,
        delete_image: false,
        is_active: Boolean(cat.is_active),
        parent_id: cat.parent_id || ''
      });
    } else {
      setEditing(null);
      setForm({
        name: '',
        icon: '',
        icon_url: '',
        icon_type: 'emoji',
        description: '',
        image: null,
        delete_image: false,
        is_active: true,
        parent_id: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append('name', form.name);
    data.append('icon', form.icon_type === 'emoji' ? form.icon : '');
    data.append('icon_url', form.icon_type === 'url' ? form.icon_url : '');
    data.append('description', form.description);
    data.append('is_active', form.is_active ? 'true' : 'false');
    data.append('delete_image', form.delete_image ? 'true' : 'false');
    data.append('parent_id', form.parent_id || '');

    if (form.image) {
      data.append('image', form.image);
    }

    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, data);
        toast.success('Обновлено');
      } else {
        await api.post('/categories', data);
        toast.success('Создано');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    }
  };

  const remove = async (category) => {
    const subcategories = categories.filter(c => c.parent_id === category.id);

    if (subcategories.length > 0) {
      toast.error(
        `Нельзя удалить: есть подкатегории (${subcategories.map(s => s.name).join(', ')})`
      );
      return;
    }

    if (!confirm(`Удалить категорию "${category.name}"?`)) return;

    try {
      await api.delete(`/categories/${category.id}`);
      toast.success('Удалено');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  const handleDeleteImage = () => {
    setForm({ ...form, image: null, delete_image: true });
  };

  const handleCancelDeleteImage = () => {
    setForm({ ...form, delete_image: false });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      parent: ''
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.parent;

  // Доступные родители (исключаем текущую категорию и её потомков)
  const availableParents = editing
    ? categories.filter(c => c.id !== editing.id)
    : categories;

  // Получаем список корневых категорий для фильтра
  const rootCategories = categories.filter(c => !c.parent_id);

  return (
    <AdminLayout title="Категории">
      {/* ФИЛЬТРЫ */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>🔍 Фильтры</h3>
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
              placeholder="Название или slug..."
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
              <option value="">Все</option>
              <option value="active">Активна</option>
              <option value="inactive">Скрыта</option>
            </select>
          </div>

          {/* Родительская категория */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              📂 Родитель
            </label>
            <select
              value={filters.parent}
              onChange={e => setFilters({ ...filters, parent: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'white'
              }}
            >
              <option value="">Все</option>
              <option value="root">Корневые категории</option>
              {rootCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon || '📦'} {cat.name}
                </option>
              ))}
            </select>
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
            {filters.status && (
              <span style={{
                padding: '4px 12px',
                background: filters.status === 'active' ? '#10B981' : '#EF4444',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Статус: {filters.status === 'active' ? 'Активна' : 'Скрыта'}
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
            {filters.parent && (
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
                Родитель: {filters.parent === 'root' ? 'Корневые' : rootCategories.find(c => c.id === parseInt(filters.parent))?.name}
                <button
                  onClick={() => setFilters({ ...filters, parent: '' })}
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

      <div className="admin-toolbar">
        <p style={{ color: 'var(--text-muted)' }}>
          Всего: {categories.length} • Показано: {filteredCategories.length} • Перетащите для изменения порядка
        </p>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Добавить категорию
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>⋮</th>
              <th>Изображение</th>
              <th>Название</th>
              <th>Slug</th>
              <th>Товаров</th>
              <th>Родитель</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {filteredCategories.map(c => (
                  <SortableCategory
                    key={c.id}
                    category={c}
                    level={c.parent_id ? 1 : 0}
                    onEdit={openModal}
                    onDelete={remove}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="admin-modal" onClick={() => setModalOpen(false)}>
          <div className="admin-modal__content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>{editing ? 'Редактировать' : 'Новая категория'}</h3>
              <button onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Родительская категория */}
              <div className="form-group">
                <label>Родительская категория</label>
                <select
                  value={form.parent_id}
                  onChange={e => setForm({ ...form, parent_id: e.target.value })}
                >
                  <option value="">— Корневая категория —</option>
                  {availableParents
                    .filter(c => !c.parent_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon || '📦'} {c.name}
                      </option>
                    ))
                  }
                </select>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                  Оставьте пустым, чтобы создать корневую категорию
                </small>
              </div>

              <div className="form-group">
                <label>Название *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Тип иконки</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="icon_type"
                      value="emoji"
                      checked={form.icon_type === 'emoji'}
                      onChange={() => setForm({ ...form, icon_type: 'emoji' })}
                    />
                    Эмодзи
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="icon_type"
                      value="url"
                      checked={form.icon_type === 'url'}
                      onChange={() => setForm({ ...form, icon_type: 'url' })}
                    />
                    Ссылка на изображение
                  </label>
                </div>

                {form.icon_type === 'emoji' ? (
                  <input
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    placeholder="🔧"
                  />
                ) : (
                  <input
                    value={form.icon_url}
                    onChange={e => setForm({ ...form, icon_url: e.target.value })}
                    placeholder="https://..."
                  />
                )}
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Изображение категории</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setForm({ ...form, image: e.target.files[0], delete_image: false })}
                />

                {editing && editing.image && !form.delete_image && (
                  <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Текущее изображение:
                    </p>
                    <img
                      src={editing.image}
                      alt="Текущее"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      style={{
                        position: 'absolute',
                        top: '28px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {form.delete_image && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ color: '#EF4444', fontSize: '0.9rem' }}>
                      ✓ Изображение будет удалено
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelDeleteImage}
                      className="btn btn-sm btn-outline"
                      style={{ marginTop: '8px' }}
                    >
                      Отменить удаление
                    </button>
                  </div>
                )}

                {form.image && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '8px' }}>
                      Новое изображение:
                    </p>
                    <img
                      src={URL.createObjectURL(form.image)}
                      alt="Новое"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }}
                    />
                  </div>
                )}
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
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: 'var(--accent)'
                    }}
                  />
                  Активна (отображается на сайте)
                </label>
              </div>

              <div className="admin-modal__actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}