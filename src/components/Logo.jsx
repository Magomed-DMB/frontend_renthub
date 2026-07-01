import { Link } from 'react-router-dom';

export default function Logo({
  settings = {},
  to = '/',
  size = 'default',
  showText = true
}) {
  const { site_name = 'RentHub', site_logo = '' } = settings;

  const sizes = {
    small: { height: '32px', fontSize: '1.2rem' },
    default: { height: '40px', fontSize: '1.5rem' },
    large: { height: '50px', fontSize: '2rem' }
  };

  const currentSize = sizes[size] || sizes.default;

  const content = site_logo ? (
    <img
      src={site_logo}
      alt={site_name}
      style={{
        height: currentSize.height,
        width: 'auto',
        objectFit: 'contain'
      }}
    />
  ) : (
    <>
      <span className="logo__icon">🏪</span>
      <span className="logo__text" style={{ fontSize: currentSize.fontSize }}>
        {site_name}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="logo">
        {content}
      </Link>
    );
  }

  return <div className="logo">{content}</div>;
}