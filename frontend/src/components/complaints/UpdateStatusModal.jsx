import { useState } from "react";
import { COMPLAINT_STATUSES } from "../../constants";
import "./UpdateStatusModal.css";

export default function UpdateStatusModal({ complaint, onSave, onClose, saving }) {
  const [status, setStatus] = useState(complaint.status);
  const [adminRemarks, setAdminRemarks] = useState(complaint.adminRemarks || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(complaint._id, { status, adminRemarks });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
        <h3>{complaint.title}</h3>
        <p className="modal-desc">{complaint.description}</p>
        <p className="modal-meta">
          Submitted by {complaint.user?.name} ({complaint.user?.email}) &middot; {complaint.category} &middot;{" "}
          {complaint.priority} priority
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="adminRemarks">Admin Remarks</label>
            <textarea
              id="adminRemarks"
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="Optional note visible to the user"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
