import "./ConfirmDialog.css";

export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onCancel, confirmDisabled }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={confirmDisabled}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
