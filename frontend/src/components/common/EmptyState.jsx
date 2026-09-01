import "./EmptyState.css";

export default function EmptyState({ icon: Icon, message }) {
  return (
    <div className="empty-state card">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={22} />
        </div>
      )}
      <p>{message}</p>
    </div>
  );
}
