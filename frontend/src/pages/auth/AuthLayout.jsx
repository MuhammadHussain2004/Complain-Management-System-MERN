import { IconShieldCheck, IconCheckCircle } from "../../components/common/icons";
import "./AuthPages.css";

const HIGHLIGHTS = [
  "Role-based dashboards for users and admins",
  "Live status tracking — no manual refresh needed",
  "Approval-gated accounts keep access accountable",
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-shell">
        <div className="auth-brand-panel">
          <div className="auth-brand-mark">
            <IconShieldCheck size={26} />
          </div>
          <h2 className="auth-brand-title">Complain Management System</h2>
          <p className="auth-brand-tagline">
            Submit complaints, track their progress, and get resolutions — all in one place.
          </p>
          <ul className="auth-brand-points">
            {HIGHLIGHTS.map((point) => (
              <li key={point}>
                <IconCheckCircle size={16} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <h1>{title}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
