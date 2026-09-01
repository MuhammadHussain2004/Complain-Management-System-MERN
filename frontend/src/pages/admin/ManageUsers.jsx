import { useEffect, useState } from "react";
import {
  getUsersRequest,
  approveUserRequest,
  rejectUserRequest,
  setUserStatusRequest,
  setUserRoleRequest,
  updateUserNameRequest,
  deleteUserRequest,
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import useInterval from "../../hooks/useInterval";
import { POLL_INTERVAL_MS } from "../../constants";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Alert from "../../components/common/Alert";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { IconUsers } from "../../components/common/icons";

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pendingReject, setPendingReject] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingNameId, setEditingNameId] = useState(null);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  const loadUsers = (silent = false) => {
    if (!silent) setLoading(true);
    getUsersRequest({ status: statusFilter || undefined, search: search || undefined })
      .then((res) => setUsers(res.data.users))
      .catch(() => {
        if (!silent) setError("Failed to load users");
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    const timeout = setTimeout(() => loadUsers(false), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  // Background refresh so changes made here (or by another admin) show up
  // without a manual reload. Paused while a row is actively being edited so
  // an in-flight refresh can't wipe out unsaved input.
  useInterval(() => {
    if (editingNameId || pendingReject || pendingDelete) return;
    loadUsers(true);
  }, POLL_INTERVAL_MS);

  const updateLocalUser = (updated) => {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
  };

  const handleApprove = async (id) => {
    setError("");
    try {
      const res = await approveUserRequest(id);
      updateLocalUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve user");
    }
  };

  const handleRejectConfirm = async () => {
    if (!pendingReject) return;
    try {
      const res = await rejectUserRequest(pendingReject._id);
      updateLocalUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject user");
    } finally {
      setPendingReject(null);
    }
  };

  const handleToggleStatus = async (u) => {
    setError("");
    const newStatus = u.status === "active" ? "deactivated" : "active";
    try {
      const res = await setUserStatusRequest(u._id, newStatus);
      updateLocalUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleRoleChange = async (u, role) => {
    setError("");
    try {
      const res = await setUserRoleRequest(u._id, role);
      updateLocalUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const startEditName = (u) => {
    setEditingNameId(u._id);
    setNameDraft(u.name);
  };

  const handleSaveName = async (id) => {
    if (!nameDraft.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setSavingName(true);
    setError("");
    try {
      const res = await updateUserNameRequest(id, nameDraft.trim());
      updateLocalUser(res.data.user);
      setEditingNameId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setError("");
    setDeleting(true);
    try {
      await deleteUserRequest(pendingDelete._id);
      setUsers((prev) => prev.filter((u) => u._id !== pendingDelete._id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Manage Users</h1>
      </div>

      <Alert type="error">{error}</Alert>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState icon={IconUsers} message="No users found." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser.id;
                const isEditingName = editingNameId === u._id;
                return (
                  <tr key={u._id}>
                    <td>
                      {isEditingName ? (
                        <div className="inline-edit">
                          <input
                            type="text"
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            autoFocus
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={savingName}
                            onClick={() => handleSaveName(u._id)}
                          >
                            {savingName ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={savingName}
                            onClick={() => setEditingNameId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-edit">
                          <span>{u.name}</span>
                          <button className="btn btn-outline btn-sm" onClick={() => startEditName(u)}>
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <StatusBadge value={u.status} />
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions-cell">
                        {u.status === "pending" && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(u._id)}>
                              Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setPendingReject(u)}>
                              Reject
                            </button>
                          </>
                        )}
                        {(u.status === "active" || u.status === "deactivated") && !isSelf && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(u)}>
                            {u.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                        )}
                        {!isSelf && (
                          <button className="btn btn-danger btn-sm" onClick={() => setPendingDelete(u)}>
                            Delete
                          </button>
                        )}
                        {isSelf && <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>You</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pendingReject && (
        <ConfirmDialog
          title="Reject Account"
          message={`Reject the account request for "${pendingReject.name}"?`}
          confirmLabel="Reject"
          onConfirm={handleRejectConfirm}
          onCancel={() => setPendingReject(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete User"
          message={`Permanently delete "${pendingDelete.name}" (${pendingDelete.email})? This also deletes all of their complaints. This is only allowed if none of their complaints are still Pending or In Progress. This cannot be undone.`}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          confirmDisabled={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
