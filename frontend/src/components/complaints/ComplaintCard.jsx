import StatusBadge from "../common/StatusBadge";
import ComplaintForm from "./ComplaintForm";
import "./ComplaintCard.css";

export default function ComplaintCard({ complaint, isEditing, onEditStart, onEditCancel, onEditSave, onDelete, savingEdit }) {
  const canModify = complaint.status === "Pending";

  if (isEditing) {
    return (
      <div className="complaint-card card">
        <ComplaintForm
          initialValues={complaint}
          submitLabel="Save Changes"
          submitting={savingEdit}
          onSubmit={(values) => onEditSave(complaint._id, values)}
        />
        <button className="btn btn-outline btn-sm" onClick={onEditCancel} style={{ marginTop: 8 }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="complaint-card card">
      <div className="complaint-card-header">
        <h3>{complaint.title}</h3>
        <StatusBadge value={complaint.status} />
      </div>

      <p className="complaint-card-desc">{complaint.description}</p>

      <div className="complaint-card-meta">
        <span>{complaint.category}</span>
        <StatusBadge value={complaint.priority} />
        <span>Submitted {new Date(complaint.createdAt).toLocaleDateString()}</span>
      </div>

      {complaint.adminRemarks && (
        <div className="complaint-card-remarks">
          <strong>Admin Remarks:</strong> {complaint.adminRemarks}
        </div>
      )}

      {canModify && (
        <div className="actions-cell">
          <button className="btn btn-outline btn-sm" onClick={() => onEditStart(complaint._id)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(complaint)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
