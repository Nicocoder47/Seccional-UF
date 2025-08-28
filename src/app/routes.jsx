import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Páginas base (lazy)
const Home = lazy(() => import("@/pages/Home.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));
const Perfil = lazy(() => import("@/pages/Perfil.jsx"));
const NotFound = lazy(() => import("@/pages/NotFound.jsx"));

// Afiliados (públicos y protegidos)
const ListadoAfiliados = lazy(() => import("@/features/afiliados/pages/ListadoAfiliados.jsx"));
const BuscarAfiliado = lazy(() => import("@/features/afiliados/pages/BuscarAfiliado.jsx"));
const DetalleAfiliado = lazy(() => import("@/features/afiliados/pages/DetalleAfiliado.jsx"));
const AfiliadoForm = lazy(() => import("@/features/afiliados/components/AfiliadoForm.jsx"));

// Admin (enterprise layout + páginas internas)
import AdminLayout from "@/layout/AdminLayout.jsx";
import AdminDashboard from "@/pages/admin/Dashboard.jsx";
import Afiliados from "@/pages/admin/Afiliados.jsx";

/** Wrapper para setear título/SEO por ruta */
function WithTitle({ title, children }) {
  React.useEffect(() => {
    if (title) document.title = `${title} · Seccional UF`;
  }, [title]);
  return children;
}

/** Guard simple: requiere sesión */
function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: "auth_required" }}
      />
    );
  }
  return <Outlet />;
}

/** Guard por rol/es: "admin" por defecto */
function RequireRole({ roles = ["admin"] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: "auth_required" }}
      />
    );
  }

  const urole = String(user?.role || user?.rol || "").toLowerCase();
  const ok = roles.map(String).map(r => r.toLowerCase()).includes(urole);

  return ok ? <Outlet /> : (
    <Navigate
      to="/"
      replace
      state={{ from: location.pathname, reason: "forbidden" }}
    />
  );
}

const Fallback = () => <div style={{ padding: 16 }}>Cargando…</div>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Públicas */}
        <Route
          path="/"
          element={<WithTitle title="Inicio"><Home /></WithTitle>}
        />
        <Route
          path="/login"
          element={<WithTitle title="Ingresar"><Login /></WithTitle>}
        />

        {/* Afiliados (públicas) */}
        <Route
          path="/afiliados"
          element={<WithTitle title="Afiliados"><ListadoAfiliados /></WithTitle>}
        />
        <Route
          path="/afiliados/buscar"
          element={<WithTitle title="Buscar Afiliado"><BuscarAfiliado /></WithTitle>}
        />
        <Route
          path="/afiliados/:id"
          element={<WithTitle title="Detalle de Afiliado"><DetalleAfiliado /></WithTitle>}
        />

        {/* Afiliados (protegidas) */}
        <Route element={<RequireAuth />}>
          <Route
            path="/afiliados/nuevo"
            element={<WithTitle title="Nuevo Afiliado"><AfiliadoForm /></WithTitle>}
          />
          <Route
            path="/afiliados/:id/editar"
            element={<WithTitle title="Editar Afiliado"><AfiliadoForm /></WithTitle>}
          />
        </Route>

        {/* Área usuario */}
        <Route element={<RequireAuth />}>
          <Route
            path="/perfil"
            element={<WithTitle title="Mi Perfil"><Perfil /></WithTitle>}
          />
        </Route>

        {/* Admin → requiere rol + usa layout enterprise */}
        <Route element={<RequireRole roles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<WithTitle title="Panel Admin"><AdminDashboard /></WithTitle>}
            />
            <Route
              path="/admin/afiliados"
              element={<WithTitle title="Afiliados Admin"><Afiliados /></WithTitle>}
            />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="/404"
          element={<WithTitle title="No encontrado"><NotFound /></WithTitle>}
        />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
