import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryGrid from '../components/CategoryGrid';
import { getSearchVariants, qwertyToRussian, isRussian } from '../utils/keyboardLayout';
import './Catalog.css';


export default function Catalog() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();

  // ✅ ИСПРАВЛЕНО: Получаем searchQuery напрямую из URL (без useState)
  const searchQuery = searchParams.get('search') || '';

  // ✅ Конвертируем английский текст в русский для отображения
  const displaySearchQuery = useMemo(() => {
    if (!searchQuery) return '';
    // Если текст на английском (QWERTY), конвертируем в русский
    return isRussian(searchQuery) ? searchQuery : qwertyToRussian(searchQuery);
  }, [searchQuery]);

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const searchTimer = useRef();

  // Загрузка иерархии категорий
  useEffect(() => {
    api.get('/categories/hierarchy').then(r => setCategories(r.data));
  }, []);

  // Обработка текущей категории
  useEffect(() => {
    if (category) {
      const findCategory = (cats, slug) => {
        for (const cat of cats) {
          if (cat.slug === slug) return cat;
          if (cat.children) {
            const found = findCategory(cat.children, slug);
            if (found) return found;
          }
        }
        return null;
      };

      const found = findCategory(categories, category);
      setCurrentCategory(found);

      if (found && found.children && found.children.length > 0) {
        setSubcategories(found.children);
        setProducts([]);
      } else {
        setSubcategories([]);
      }
    } else {
      setCurrentCategory(null);
      setSubcategories([]);
    }
  }, [category, categories]);

  // ✅ Загрузка всех товаров при поиске (реагирует на изменение searchQuery)
  useEffect(() => {
    if (searchQuery) {
      setLoading(true);
      // Прокрутка наверх при новом поиске
      window.scrollTo({ top: 0, behavior: 'smooth' });

      api.get('/products', { params: { limit: 1000 } })
        .then(r => {
          setAllProducts(r.data.products || []);
        })
        .catch(err => console.error('Ошибка загрузки для поиска:', err))
        .finally(() => setLoading(false));
    } else {
      setAllProducts([]);
    }
  }, [searchQuery]); // ✅ Зависимость от searchQuery

  // ✅ Фильтрация товаров с учётом раскладки
  const displayedProducts = useMemo(() => {
    if (!searchQuery) return products;

    const searchVariants = getSearchVariants(searchQuery);

    return allProducts.filter(product => {
      return searchVariants.some(variant => {
        if (!variant) return false;
        const titleMatch = product.title?.toLowerCase().includes(variant);
        const descMatch = product.description?.toLowerCase().includes(variant);
        const categoryMatch = product.category_name?.toLowerCase().includes(variant);
        return titleMatch || descMatch || categoryMatch;
      });
    });
  }, [searchQuery, allProducts, products]);

  // Загрузка товаров (обычный режим с пагинацией)
  const loadProducts = useCallback(async (pageNum = 1, append = false) => {
    if (searchQuery) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('page', pageNum);
      params.append('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(prev => append ? [...prev, ...data.products] : data.products);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  // ✅ Перезагрузка товаров при изменении searchQuery или category
  useEffect(() => {
    if (subcategories.length === 0 && !searchQuery) {
      setPage(1);
      loadProducts(1, false);
    }
  }, [loadProducts, subcategories, searchQuery, category]);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasMore && !loading && subcategories.length === 0 && !searchQuery) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, true);
    }
  }, [inView, hasMore, loading, page, loadProducts, subcategories, searchQuery]);

  // Хлебные крошки
  const breadcrumbs = [];
  if (currentCategory) {
    breadcrumbs.push({ label: 'Все категории', path: '/catalog' });

    const findParent = (cats, targetSlug) => {
      for (const cat of cats) {
        if (cat.children) {
          const found = cat.children.find(c => c.slug === targetSlug);
          if (found) return cat;
          const deep = findParent(cat.children, targetSlug);
          if (deep) return deep;
        }
      }
      return null;
    };

    const parent = findParent(categories, category);
    if (parent) {
      breadcrumbs.push({ label: parent.name, path: `/catalog/${parent.slug}` });
    }

    breadcrumbs.push({ label: currentCategory.name, path: null });
  }

  return (
    <div className="catalog">
      <div className="container">

        {/* Хлебные крошки */}
        {breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="breadcrumbs__item">
                {crumb.path ? (
                  <Link to={crumb.path}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <span className="breadcrumbs__separator">/</span>}
              </span>
            ))}
          </div>
        )}

        {/* Заголовок */}
        <div className="catalog__head">
          <h1>
            {searchQuery
              ? `Результаты поиска: "${displaySearchQuery}"`
              : currentCategory
                ? currentCategory.name
                : 'Каталог товаров'
            }
          </h1>
          {subcategories.length === 0 && !searchQuery && (
            <p className="catalog__count">
              {products.length} {products.length === 1 ? 'товар' : 'товаров'}
            </p>
          )}
        </div>

        {/* Подкатегории (скрываем при поиске) */}
        {subcategories.length > 0 && !searchQuery && (
          <div className="catalog__section">
            <CategoryGrid categories={subcategories} />
          </div>
        )}

        {/* Товары */}
        {(subcategories.length === 0 || searchQuery) && (
          <div className="catalog__content">
            {displayedProducts.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>Ничего не найдено</h3>
                <p>
                  {searchQuery
                    ? `По запросу "${displaySearchQuery}" товаров не найдено`
                    : 'В этой категории пока нет товаров'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Счётчик результатов при поиске */}
                {searchQuery && (
                  <p className="catalog__count catalog__count--search">
                    Найдено: {displayedProducts.length}{' '}
                    {displayedProducts.length === 1
                      ? 'товар'
                      : displayedProducts.length < 5
                        ? 'товара'
                        : 'товаров'
                    }
                  </p>
                )}

                <div className="products-grid">
                  {displayedProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Пагинация только при обычном режиме (без поиска) */}
                {!searchQuery && (
                  <div ref={loadMoreRef} className="load-more">
                    {loading && (
                      <div className="spinner">
                        <div className="spinner__circle"></div>
                        <span>Загрузка...</span>
                      </div>
                    )}
                    {!hasMore && products.length > 0 && (
                      <p className="end-message">— Вы просмотрели все товары —</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}