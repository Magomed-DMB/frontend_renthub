import { useEffect, useState } from 'react';
import api from '../services/api';
import { MESSENGER_ICONS } from '../constants/messengerIcons';
import './RentModal.css';

export default function RentModal({ product, onClose }) {
  const [messengers, setMessengers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messengers')
      .then(r => setMessengers(r.data))
      .finally(() => setLoading(false));

    document.body.style.overflow = 'hidden';
    const onEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const orderText = encodeURIComponent(
    `Здравствуйте! Хочу арендовать товар:\n\n` +
    `📦 ${product.title}\n` +
    `💰 Цена: ${product.price_per_day} ₽/день\n` +
    `🔗 ${window.location.origin}/product/${product.slug}\n\n` +
    `Подскажите, пожалуйста, свободен ли он и как оформить заказ?`
  );

  const getMessengerUrl = (m) => {
    switch (m.type) {
      case 'telegram':
        return `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${orderText}`;
      case 'whatsapp':
        return `${m.value}?text=${orderText}`;
      case 'phone':
        return `tel:${m.value.replace(/[\s\-\(\)]/g, '')}`;
      case 'max':
        return m.value.startsWith('http') ? m.value : `https://${m.value}`;
      default:
        return m.value;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">✕</button>

        <div className="modal__header">
          <h2>Арендовать товар</h2>
          <p className="modal__product">
            <strong>{product.title}</strong> · {product.price_per_day} ₽/день
          </p>
        </div>

        <div className="modal__body">
          <p className="modal__hint">
            Выберите удобный способ связи:
          </p>

          {loading ? (
            <div className="modal__loading">Загрузка...</div>
          ) : (
            <div className="messenger-list">
              {messengers.map(m => (
                <a
                  key={m.id}
                  href={getMessengerUrl(m)}
                  target={m.type === 'phone' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className="messenger-btn"
                  style={{ '--m-color': m.color || '#1E5AA8' }}
                >
                  <span className="messenger-btn__icon">
                    <img
                      src={MESSENGER_ICONS[m.type]}
                      alt={m.label}
                      style={{
                        width: '24px',
                        height: '24px',
                        objectFit: 'contain'
                      }}
                    />
                  </span>
                  <span className="messenger-btn__label">{m.label}</span>
                  <span className="messenger-btn__arrow">→</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}