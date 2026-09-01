import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaintStatsRequest } from "../../api/complaints";
import { getUsersRequest } from "../../api/users";
import StatCard from "../../components/common/StatCard";
import Spinner from "../../components/common/Spinner";
import useInterval from "../../hooks/useInterval";
import { POLL_INTERVAL_MS } from "../../constants";
import {
  IconClipboard,
  IconClock,
  IconProgress,
  IconCheckCircle,
  IconXCircle,
  IconUsers,
  IconArrowRight,
  IconInbox,
} from "../../components/common/icons";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboard = (silent = false) => {
    Promise.all([getComplaintStatsRequest(), getUsersRequest({ status: "pending" })])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data);
        setPendingUsers(usersRes.data.users.length);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => loadDashboard(false), []);

  useInterval(() => loadDashboard(true), POLL_INTERVAL_MS);

  if (loading || !stats) return <Spinner />;

  const maxCategoryCount = Math.max(1, ...(stats.byCategory?.map((c) => c.count) || [1]));

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Complaints" value={stats.total} tone="primary" icon={IconClipboard} />
        <StatCard label="Pending" value={stats.pending} tone="warning" icon={IconClock} />
        <StatCard label="In Progress" value={stats.inProgress} tone="info" icon={IconProgress} />
        <StatCard label="Resolved" value={stats.resolved} tone="success" icon={IconCheckCircle} />
        <StatCard label="Rejected" value={stats.rejected} tone="danger" icon={IconXCircle} />
        <StatCard label="Users Awaiting Approval" value={pendingUsers} tone="warning" icon={IconUsers} />
      </div>

      <div className="admin-quick-links">
        <Link to="/admin/users" className="card admin-quick-link">
          <div className="admin-quick-link-icon">
            <IconUsers size={22} />
          </div>
          <div className="admin-quick-link-body">
            <h3>Manage Users</h3>
            <p>Approve, reject, activate, deactivate accounts and manage roles.</p>
          </div>
          <IconArrowRight size={18} className="admin-quick-link-arrow" />
        </Link>
        <Link to="/admin/complaints" className="card admin-quick-link">
          <div className="admin-quick-link-icon">
            <IconInbox size={22} />
          </div>
          <div className="admin-quick-link-body">
            <h3>Manage Complaints</h3>
            <p>Review, search, filter, and update complaint statuses.</p>
          </div>
          <IconArrowRight size={18} className="admin-quick-link-arrow" />
        </Link>
      </div>

      {stats.byCategory?.length > 0 && (
        <div className="card category-breakdown">
          <h3>Complaints by Category</h3>
          <ul>
            {stats.byCategory.map((c) => (
              <li key={c._id}>
                <div className="category-breakdown-row">
                  <span>{c._id}</span>
                  <strong>{c.count}</strong>
                </div>
                <div className="category-breakdown-track">
                  <div
                    className="category-breakdown-bar"
                    style={{ width: `${(c.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
