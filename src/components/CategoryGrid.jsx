import { Link } from 'react-router-dom';
import './CategoryGrid.css';

export default function CategoryGrid({ categories }) {
  return (
    <div className="category-grid">
      {categories.map(cat => {
        const hasImage = cat.image || cat.icon_url;
        const imageUrl = cat.image || cat.icon_url;

        return (
          <Link
            key={cat.id}
            to={`/catalog/${cat.slug}`}
            className="category-grid__item card"
          >
            <div className="category-grid__image-wrap">
              {hasImage ? (
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="category-grid__image"
                  loading="lazy"
                />
              ) : (
                <div className="category-grid__icon">
                  {cat.icon || '📦'}
                </div>
              )}
            </div>
            <h3 className="category-grid__title">{cat.name}</h3>
            <span className="category-grid__count">
              {cat.products_count || 0} товаров
            </span>
          </Link>
        );
      })}
    </div>
  );
}