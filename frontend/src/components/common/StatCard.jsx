import "./StatCard.css";

export default function StatCard({ label, value, tone = "neutral" }) {
  return (
    <div className={`stat-card stat-${tone} card`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
