import { useEffect, useState } from "react";
import { getAllComplaintsRequest, updateComplaintStatusRequest } from "../../api/complaints";
import { CATEGORIES, PRIORITIES, COMPLAINT_STATUSES, POLL_INTERVAL_MS } from "../../constants";
import StatusBadge from "../../components/common/StatusBadge";
import UpdateStatusModal from "../../components/complaints/UpdateStatusModal";
import Alert from "../../components/common/Alert";
import Spinner from "../../components/common/Spinner";
import useInterval from "../../hooks/useInterval";

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", search: "" });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadComplaints = (silent = false) => {
    if (!silent) setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getAllComplaintsRequest(params)
      .then((res) => setComplaints(res.data.complaints))
      .catch(() => {
        if (!silent) setError("Failed to load complaints");
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    const timeout = setTimeout(() => loadComplaints(false), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Background refresh so newly submitted complaints (or status/edits made
  // by the user) show up without a manual reload. Paused while the review
  // modal is open so it can't change the list out from under it.
  useInterval(() => {
    if (selected) return;
    loadComplaints(true);
  }, POLL_INTERVAL_MS);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveStatus = async (id, data) => {
    setSaving(true);
    setError("");
    try {
      const res = await updateComplaintStatusRequest(id, data);
      setComplaints((prev) => prev.map((c) => (c._id === id ? { ...res.data.complaint, user: c.user } : c)));
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Manage Complaints</h1>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search title or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
        <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
          <option value="">All Statuses</option>
          {COMPLAINT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <div className="empty-state card">No complaints match these filters.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.user?.name}</td>
                  <td>{c.category}</td>
                  <td>{c.priority}</td>
                  <td>
                    <StatusBadge value={c.status} />
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(c)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <UpdateStatusModal
          complaint={selected}
          onSave={handleSaveStatus}
          onClose={() => setSelected(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
