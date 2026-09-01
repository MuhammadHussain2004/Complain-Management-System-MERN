import { useEffect, useState } from "react";
import {
  getMyComplaintsRequest,
  updateComplaintRequest,
  deleteComplaintRequest,
} from "../../api/complaints";
import ComplaintCard from "../../components/complaints/ComplaintCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Alert from "../../components/common/Alert";
import Spinner from "../../components/common/Spinner";
import useInterval from "../../hooks/useInterval";
import { POLL_INTERVAL_MS } from "../../constants";
import "./MyComplaints.css";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadComplaints = (silent = false) => {
    if (!silent) setLoading(true);
    getMyComplaintsRequest()
      .then((res) => setComplaints(res.data.complaints))
      .catch(() => {
        if (!silent) setError("Failed to load complaints");
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => loadComplaints(false), []);

  // Background refresh so an admin's status/remarks update shows up here
  // without a manual reload. Paused while actively editing a complaint so
  // the refresh can't overwrite unsaved edits.
  useInterval(() => {
    if (editingId || pendingDelete) return;
    loadComplaints(true);
  }, POLL_INTERVAL_MS);

  const handleEditSave = async (id, values) => {
    setSavingEdit(true);
    setError("");
    try {
      const res = await updateComplaintRequest(id, values);
      setComplaints((prev) => prev.map((c) => (c._id === id ? res.data.complaint : c)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteComplaintRequest(pendingDelete._id);
      setComplaints((prev) => prev.filter((c) => c._id !== pendingDelete._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete complaint");
    } finally {
      setPendingDelete(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>My Complaints</h1>
      </div>

      <Alert type="error">{error}</Alert>

      {complaints.length === 0 ? (
        <div className="empty-state card">You haven't submitted any complaints yet.</div>
      ) : (
        <div className="complaints-list">
          {complaints.map((c) => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              isEditing={editingId === c._id}
              onEditStart={setEditingId}
              onEditCancel={() => setEditingId(null)}
              onEditSave={handleEditSave}
              onDelete={setPendingDelete}
              savingEdit={savingEdit}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete Complaint"
          message={`Are you sure you want to delete "${pendingDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
