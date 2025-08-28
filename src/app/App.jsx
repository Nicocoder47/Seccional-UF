// src/app/App.jsx
import React, { Suspense, useEffect, useRef, useState } from "react";
import AppRoutes from "./routes";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import Spotlight from "@/components/ux/Spotlight";
import { useUI } from "@/context/UIContext";
import { useLocation } from "react-router-dom";

export default function App() {
  const { sidebarOpen, openSidebar, closeSidebar } = useUI();
  const location = useLocation();
  const mainRef = useRef(null);

  // Barra de progreso al cambiar de ruta
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // Scroll al inicio (respetando reduce-motion)
    if (!reduceMotion) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }

    // Enfocar <main> (a11y)
    const focusT = setTimeout(() => mainRef.current?.focus(), 140);

    // Loading bar con retraso para evitar parpadeos si la ruta carga instantánea
    // - aparece luego de 120ms
    // - permanece al menos 400ms visible cuando aparece
    let showTimer = null;
    let minVisibleTimer = null;

    setRouteLoading(false);
    showTimer = setTimeout(() => {
      setRouteLoading(true);
      minVisibleTimer = setTimeout(() => {
        setRouteLoading(false);
      }, 400);
    }, 120);

    // Si el componente se desmonta/cambia antes, limpiamos
    return () => {
      clearTimeout(focusT);
      clearTimeout(showTimer);
      clearTimeout(minVisibleTimer);
      // En caso de que hubiera quedado visible, lo ocultamos
      setRouteLoading(false);
    };
  }, [location.pathname]);

  return (
    <>
      {/* Luz ambiental premium que sigue al mouse */}
      <Spotlight />

      {/* Enlace para saltar directo al contenido (a11y). 
          Si no lo querés, borrá esta línea. */}

      {/* Barra de progreso superior */}
      <TopProgress visible={routeLoading} />

      <header>
        <Navbar onToggleSidebar={openSidebar} />
      </header>

      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <main
        id="app-main"
        ref={mainRef}
        tabIndex={-1}
        className="app-container"
        aria-live="polite"
        aria-busy={routeLoading ? "true" : "false"}
      >
        <Suspense fallback={<PageFallback />}>
          <AppRoutes />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

/** Fallback con esqueletos para carga de rutas */
function PageFallback() {
  return (
    <div className="page-fallback" role="status" aria-live="polite">
      <div className="skeleton title" />
      <div className="skeleton block" />
      <div className="skeleton block" />
    </div>
  );
}

/** Barra de progreso superior minimalista */
function TopProgress({ visible }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: "0 0 auto 0",
        height: visible ? 3 : 0,
        background:
          "linear-gradient(90deg, rgba(46,125,50,.2), rgba(46,125,50,.85))",
        boxShadow: visible ? "0 0 18px rgba(46,125,50,.45)" : "none",
        transform: visible ? "translateX(0)" : "translateX(-100%)",
        transition:
          "height .15s ease, transform .6s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    />
  );
}
