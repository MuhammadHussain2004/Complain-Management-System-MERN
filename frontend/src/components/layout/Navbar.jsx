import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IconShieldCheck, IconLogout } from "../common/icons";
import "./Navbar.css";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return initials.toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userLinks = [
    { to: "/user/dashboard", label: "Dashboard" },
    { to: "/user/submit-complaint", label: "Submit Complaint" },
    { to: "/user/my-complaints", label: "My Complaints" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/complaints", label: "Manage Complaints" },
  ];

  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-brand-mark">
            <IconShieldCheck size={18} />
          </span>
          <span className="navbar-brand-text">
            <span className="navbar-brand-name">Complain</span>
            <span className="navbar-brand-sub">Management System</span>
          </span>
        </NavLink>

        {user && (
          <nav className="navbar-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => "navbar-link" + (isActive ? " active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="navbar-user">
          {user ? (
            <>
              <div className="navbar-identity">
                <span className="navbar-avatar">{getInitials(user.name)}</span>
                <span className="navbar-identity-text">
                  <span className="navbar-username">{user.name}</span>
                  <span className="navbar-role">{user.role}</span>
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <IconLogout size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-outline btn-sm">
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
