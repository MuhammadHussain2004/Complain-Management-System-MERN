import { useEffect, useState } from "react";
import {
  getUsersRequest,
  approveUserRequest,
  rejectUserRequest,
  setUserStatusRequest,
  setUserRoleRequest,
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Alert from "../../components/common/Alert";
import Spinner from "../../components/common/Spinner";

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pendingReject, setPendingReject] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    getUsersRequest({ status: statusFilter || undefined, search: search || undefined })
      .then((res) => setUsers(res.data.users))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(loadUsers, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

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
        <div className="empty-state card">No users found.</div>
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
                return (
                  <tr key={u._id}>
                    <td>{u.name}</td>
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
    </div>
  );
}
