import "./StatCard.css";

export default function StatCard({ label, value, tone = "neutral", icon: Icon }) {
  return (
    <div className={`stat-card stat-${tone} card`}>
      {Icon && (
        <div className="stat-icon">
          <Icon size={18} />
        </div>
      )}
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
