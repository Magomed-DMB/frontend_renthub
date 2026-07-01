import { useState, useEffect } from 'react';
import './HeroMorphing.css';

export default function HeroMorphing({
  items = [],
  size = 'large',
  duration = 3000,
  animationDuration = 800,
  showIndicators = true
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);

      // Ждём завершения анимации перед сменой индекса
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsAnimating(false);
      }, animationDuration);
    }, duration);

    return () => clearInterval(interval);
  }, [items.length, duration, animationDuration]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className={`hero-morphing hero-morphing--${size}`}>
      <div className="morphing__container">
        {/* Один элемент с анимацией */}
        <div
          className={`morphing__item ${isAnimating ? 'morphing__item--animating' : ''}`}
          key={currentIndex}
        >
          <MorphIcon item={currentItem} />
        </div>

        {/* Индикаторы */}
        {showIndicators && (
          <div className="morphing__indicators">
            {items.map((_, index) => (
              <span
                key={index}
                className={`morphing__indicator ${index === currentIndex ? 'morphing__indicator--active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MorphIcon({ item }) {
  if (item.type === 'image' || item.src) {
    return (
      <img
        src={item.src || item}
        alt={item.label || 'Иконка'}
        className="morph-icon__image"
        loading="eager"
      />
    );
  }

  if (item.type === 'svg' || item.component) {
    const IconComponent = item.component || item;
    return <IconComponent className="morph-icon__svg" />;
  }

  return <span className="morph-icon__emoji">{item.emoji || item}</span>;
}