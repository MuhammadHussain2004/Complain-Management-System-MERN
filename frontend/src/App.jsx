import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Spinner from "./components/common/Spinner";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserDashboard from "./pages/user/UserDashboard";
import SubmitComplaint from "./pages/user/SubmitComplaint";
import MyComplaints from "./pages/user/MyComplaints";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageComplaints from "./pages/admin/ManageComplaints";
import NotFound from "./pages/NotFound";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute role="user">
            <AppLayout>
              <UserDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/submit-complaint"
        element={
          <ProtectedRoute role="user">
            <AppLayout>
              <SubmitComplaint />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/my-complaints"
        element={
          <ProtectedRoute role="user">
            <AppLayout>
              <MyComplaints />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <AppLayout>
              <ManageUsers />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute role="admin">
            <AppLayout>
              <ManageComplaints />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
