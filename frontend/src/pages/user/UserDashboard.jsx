import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyComplaintsRequest } from "../../api/complaints";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/common/StatCard";
import Spinner from "../../components/common/Spinner";

export default function UserDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyComplaintsRequest()
      .then((res) => setComplaints(res.data.complaints))
      .finally(() => setLoading(false));
  }, []);

  const count = (status) => complaints.filter((c) => c.status === status).length;

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user.name}</h1>
        <Link to="/user/submit-complaint" className="btn btn-primary">
          + Submit Complaint
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Complaints" value={complaints.length} tone="primary" />
        <StatCard label="Pending" value={count("Pending")} tone="warning" />
        <StatCard label="In Progress" value={count("In Progress")} tone="info" />
        <StatCard label="Resolved" value={count("Resolved")} tone="success" />
        <StatCard label="Rejected" value={count("Rejected")} tone="danger" />
      </div>

      <p>
        Track the progress of every complaint you've submitted from{" "}
        <Link to="/user/my-complaints">My Complaints</Link>.
      </p>
    </div>
  );
}
