import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "48px 16px" }}>
      <h1>404 - Page Not Found</h1>
      <p style={{ margin: "12px 0" }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}
