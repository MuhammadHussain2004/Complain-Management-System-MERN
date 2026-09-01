import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loginRequest, registerRequest, getMeRequest } from "../api/auth";
import useInterval from "../hooks/useInterval";
import { POLL_INTERVAL_MS } from "../constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!sessionStorage.getItem("scms_token")) return;
    try {
      const res = await getMeRequest();
      setUser(res.data.user);
    } catch {
      sessionStorage.removeItem("scms_token");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // One-time cleanup: earlier versions of this app stored the token in
    // localStorage (shared across tabs); purge any leftover from before the
    // switch to sessionStorage so it doesn't sit around unused.
    localStorage.removeItem("scms_token");

    const token = sessionStorage.getItem("scms_token");
    if (!token) {
      setLoading(false);
      return;
    }

    refreshUser().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the logged-in user's name/role/status in sync (e.g. Navbar) if an
  // admin edits them elsewhere, without needing a manual page reload.
  useInterval(refreshUser, user ? POLL_INTERVAL_MS : null);

  const login = async (email, password) => {
    const res = await loginRequest({ email, password });
    sessionStorage.setItem("scms_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await registerRequest({ name, email, password });
    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem("scms_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
