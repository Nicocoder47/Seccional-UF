// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CTX = createContext(null);
const LS_TOKEN = "auth_token";
const LS_USER = "auth_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(LS_TOKEN) || ""; } catch { return ""; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_USER) || "null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAuthenticated = !!token;

  useEffect(() => {
    try {
      token ? localStorage.setItem(LS_TOKEN, token) : localStorage.removeItem(LS_TOKEN);
      user ? localStorage.setItem(LS_USER, JSON.stringify(user)) : localStorage.removeItem(LS_USER);
    } catch {}
  }, [token, user]);

  // Stubs para funcionar sin backend
  async function login({ email, password }) {
    setLoading(true); setError("");
    try {
      // TODO: reemplazar por llamada real al backend
      if (!email || !password) throw new Error("Completá email y contraseña.");
      const fakeToken = "demo.token.123";
      const fakeUser = { id: 1, name: "Usuario Demo", email, role: "admin" };
      setToken(fakeToken);
      setUser(fakeUser);
      return { token: fakeToken, user: fakeUser };
    } catch (e) {
      setError(e?.message || "No se pudo iniciar sesión"); throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() { setToken(""); setUser(null); }
  async function refresh() { /* opcional */ return true; }
  async function getProfile() { /* opcional */ return user; }

  const value = useMemo(() => ({
    token, user, isAuthenticated, loading, error,
    login, logout, refresh, getProfile, setUser, setToken, setError,
  }), [token, user, isAuthenticated, loading, error]);

  return <CTX.Provider value={value}>{children}</CTX.Provider>;
}

export function useAuth() {
  const ctx = useContext(CTX);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

export default AuthProvider;
