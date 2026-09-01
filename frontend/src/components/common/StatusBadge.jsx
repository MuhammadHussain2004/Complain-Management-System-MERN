import "./StatusBadge.css";

const CLASS_MAP = {
  pending: "badge-warning",
  Pending: "badge-warning",
  active: "badge-success",
  "In Progress": "badge-info",
  Resolved: "badge-success",
  rejected: "badge-danger",
  Rejected: "badge-danger",
  deactivated: "badge-danger",
  admin: "badge-info",
  user: "badge-neutral",
};

export default function StatusBadge({ value }) {
  const cls = CLASS_MAP[value] || "badge-neutral";
  return <span className={`badge ${cls}`}>{value}</span>;
}
