import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaintStatsRequest } from "../../api/complaints";
import { getUsersRequest } from "../../api/users";
import StatCard from "../../components/common/StatCard";
import Spinner from "../../components/common/Spinner";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getComplaintStatsRequest(), getUsersRequest({ status: "pending" })])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data);
        setPendingUsers(usersRes.data.users.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Complaints" value={stats.total} tone="primary" />
        <StatCard label="Pending" value={stats.pending} tone="warning" />
        <StatCard label="In Progress" value={stats.inProgress} tone="info" />
        <StatCard label="Resolved" value={stats.resolved} tone="success" />
        <StatCard label="Rejected" value={stats.rejected} tone="danger" />
        <StatCard label="Users Awaiting Approval" value={pendingUsers} tone="warning" />
      </div>

      <div className="admin-quick-links">
        <Link to="/admin/users" className="card admin-quick-link">
          <h3>Manage Users</h3>
          <p>Approve, reject, activate, deactivate accounts and manage roles.</p>
        </Link>
        <Link to="/admin/complaints" className="card admin-quick-link">
          <h3>Manage Complaints</h3>
          <p>Review, search, filter, and update complaint statuses.</p>
        </Link>
      </div>

      {stats.byCategory?.length > 0 && (
        <div className="card category-breakdown">
          <h3>Complaints by Category</h3>
          <ul>
            {stats.byCategory.map((c) => (
              <li key={c._id}>
                <span>{c._id}</span>
                <strong>{c.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
