import './InfoBlock.css';

export default function InfoBlock({ icon, title, text, color }) {
  return (
    <div className="info-block card" style={{ '--accent-color': color }}>
      <div className="info-block__icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}