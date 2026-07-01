import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import RentModal from '../components/RentModal';
import './ProductPage.css';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(r => setProduct(r.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>Загрузка...</div>;
  if (!product) return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <h2>Товар не найден</h2>
      <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '20px' }}>В каталог</Link>
    </div>
  );

  const isRented = product.status === 'rented';

  return (
    <div className="product-page">
      <div className="container">
        <Link to="/catalog" className="back-link">← Назад в каталог</Link>

        <div className="product-page__grid">
          <div className="product-page__image card">
            <img src={product.image || '/placeholder.jpg'} alt={product.title} />
            {isRented && <div className="product-page__badge">Арендован</div>}
          </div>

          <div className="product-page__info">
            <span className="product-page__category">{product.category_name}</span>
            <h1>{product.title}</h1>

            <div className="product-page__price">
              <div>
                <span className="product-page__price-value">{product.price_per_day}</span>
                <span className="product-page__price-unit">₽ / день</span>
              </div>
              {product.deposit && parseFloat(product.deposit) > 0 && (
                <div className="product-page__deposit">
                  <span className="product-page__deposit-label">Залог:</span>
                  <span className="product-page__deposit-value">{product.deposit} ₽</span>
                </div>
              )}
            </div>

            <div className="product-page__desc">
              <h3>Описание</h3>
              <p>{product.description || 'Описание отсутствует'}</p>
            </div>

            <div className="product-page__meta">
              <div>👁️ Просмотров: {product.views}</div>
              <div>📂 Категория: {product.category_name}</div>
            </div>

            <button
              className={`btn ${isRented ? 'btn-disabled' : 'btn-primary'} btn--lg`}
              onClick={() => !isRented && setModalOpen(true)}
              disabled={isRented}
            >
              {isRented ? '✓ Товар арендован' : '🛒 Арендовать сейчас'}
            </button>
          </div>
        </div>
      </div>

      {modalOpen && <RentModal product={product} onClose={() => setModalOpen(false)} />}
    </div>
  );
}