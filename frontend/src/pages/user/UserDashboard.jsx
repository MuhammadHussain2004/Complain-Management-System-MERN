import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyComplaintsRequest } from "../../api/complaints";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";
import Spinner from "../../components/common/Spinner";
import useInterval from "../../hooks/useInterval";
import { POLL_INTERVAL_MS } from "../../constants";
import { IconClipboard, IconClock, IconProgress, IconCheckCircle, IconXCircle, IconPlus } from "../../components/common/icons";

export default function UserDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadComplaints = (silent = false) => {
    getMyComplaintsRequest()
      .then((res) => setComplaints(res.data.complaints))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => loadComplaints(false), []);

  // Keeps the stat tiles current if an admin updates a status elsewhere.
  useInterval(() => loadComplaints(true), POLL_INTERVAL_MS);

  const count = (status) => complaints.filter((c) => c.status === status).length;

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user.name}</h1>
        <Link to="/user/submit-complaint" className="btn btn-primary">
          <IconPlus size={16} /> Submit Complaint
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Complaints" value={complaints.length} tone="primary" icon={IconClipboard} />
        <StatCard label="Pending" value={count("Pending")} tone="warning" icon={IconClock} />
        <StatCard label="In Progress" value={count("In Progress")} tone="info" icon={IconProgress} />
        <StatCard label="Resolved" value={count("Resolved")} tone="success" icon={IconCheckCircle} />
        <StatCard label="Rejected" value={count("Rejected")} tone="danger" icon={IconXCircle} />
      </div>

      <p>
        Track the progress of every complaint you've submitted from{" "}
        <Link to="/user/my-complaints">My Complaints</Link>.
      </p>
    </div>
  );
}
