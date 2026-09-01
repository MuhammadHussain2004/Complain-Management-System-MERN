import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

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
        <div className="navbar-brand">Smart Complaint System</div>

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
              <span className="navbar-username">
                {user.name} <span className="navbar-role">({user.role})</span>
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
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
