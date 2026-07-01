import { useState } from 'react';
import { Link } from 'react-router-dom';
import RentModal from './RentModal';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [modalOpen, setModalOpen] = useState(false);
  const isRented = product.status === 'rented';
  const hasDeposit = product.deposit && parseFloat(product.deposit) > 0;
  const isFeatured = !!product.is_featured; // ✅ Преобразуем в boolean

  return (
    <>
      <article className="product-card card">
        <Link to={`/product/${product.slug}`} className="product-card__image-wrap">
          <img
            src={product.image || '../../public/icons/image-placeholder.png'}
            alt={product.title}
            loading="lazy"
            className="product-card__image"
          />

          {/* Бейдж "Хит" - правый верхний угол */}
          {!!product.is_featured && !isRented && (
            <span className="product-card__badge product-card__badge--hot">
              🔥 Хит
            </span>
          )}

          {/* Бейдж залога - правый нижний угол */}
          {hasDeposit && (
            <span className="product-card__badge product-card__badge--deposit">
              Залог {product.deposit} ₽
            </span>
          )}
        </Link>

        <div className="product-card__body">
          <span className="product-card__category">{product.category_name}</span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="product-card__title">{product.title}</h3>
          </Link>

          {/* Цена */}
          <div className="product-card__price-block">
            <div className="product-card__price">
              <span className="product-card__price-value">{product.price_per_day}</span>
              <span className="product-card__price-unit">₽/день</span>
            </div>
          </div>

          {/* Кнопка внизу */}
          <button
            className={`product-card__btn btn ${isRented ? 'btn-disabled' : 'btn-primary'}`}
            onClick={() => !isRented && setModalOpen(true)}
            disabled={isRented}
          >
            {isRented ? '✓ Арендован' : 'Арендовать'}
          </button>
        </div>
      </article>

      {modalOpen && (
        <RentModal
          product={product}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}