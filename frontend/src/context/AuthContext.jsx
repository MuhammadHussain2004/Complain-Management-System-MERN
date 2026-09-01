import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, registerRequest, getMeRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("scms_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMeRequest()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        sessionStorage.removeItem("scms_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

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
