import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  const hasImage = category.image || category.icon_url;
  const imageUrl = category.image || category.icon_url;

  return (
    <Link to={`/catalog/${category.slug}`} className="category-card card">
      <div className="category-card__image-wrap">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="category-card__image"
            loading="lazy"
          />
        ) : (
          <div className="category-card__icon">
            {category.icon || '📦'}
          </div>
        )}
      </div>
      <h3 className="category-card__title">{category.name}</h3>
      <span className="category-card__count">
        {category.total_products_count || category.products_count || 0} товаров
      </span>
    </Link>
  );
}