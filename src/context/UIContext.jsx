import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CTX = createContext(null);
const LS_THEME = "app_theme";

// Objeto de respaldo: no rompe si no hay Provider
const NOOP = () => {};
const FALLBACK_UI = {
  sidebarOpen: false,
  openSidebar: NOOP,
  closeSidebar: NOOP,
  toggleSidebar: NOOP,
  busy: false,
  setBusy: NOOP,
  theme: "system",
  setTheme: NOOP,
  toast: (...args) => console.log("[toast]", ...args),
};

export function UIProvider({ children }) {
  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // Busy
  const [busy, setBusy] = useState(false);

  // Theme
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(LS_THEME) || "system"; } catch { return "system"; }
  });

  useEffect(() => {
    try { localStorage.setItem(LS_THEME, theme); } catch {}
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    document.documentElement.setAttribute("data-theme", resolved);
  }, [theme]);

  const toast = (...args) => console.log("[toast]", ...args);

  const value = useMemo(
    () => ({
      sidebarOpen, openSidebar, closeSidebar, toggleSidebar,
      busy, setBusy,
      theme, setTheme,
      toast,
    }),
    [sidebarOpen, busy, theme]
  );

  return <CTX.Provider value={value}>{children}</CTX.Provider>;
}

export function useUI() {
  const ctx = useContext(CTX);
  // Antes tiraba error; ahora devolvemos un objeto de respaldo
  return ctx ?? FALLBACK_UI;
}

export default UIProvider;
