// src/app/providers/AppProviders.jsx
import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { UIProvider } from "@/context/UIContext";
import { AuthProvider } from "@/context/AuthContext";

/** ErrorBoundary simple para evitar crasheos de toda la app */
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(){ return { hasError: true }; }
  componentDidCatch(error, info){ console.error("[App ErrorBoundary]", error, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"#0e1a13", color:"#e7f0ea" }}>
          <div style={{ padding:24, borderRadius:16, border:"1px solid rgba(205,231,206,.12)", background:"linear-gradient(180deg, rgba(28,58,42,.85), rgba(14,26,19,.85))", maxWidth:560, textAlign:"center" }}>
            <h2 style={{ marginTop:0 }}>Ocurrió un error</h2>
            <p style={{ opacity:.85 }}>Algo falló al renderizar la aplicación. Probá recargar.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop:8, padding:"10px 16px", borderRadius:10, border:"1px solid rgba(205,231,206,.25)", background:"#2e7d32", color:"#fff", cursor:"pointer" }}>
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <UIProvider>
          <AuthProvider>
            <Suspense
              fallback={
                <div style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"#0e1a13", color:"#e7f0ea" }} role="status" aria-live="polite">
                  <div style={{ display:"grid", gap:12, padding:"22px 26px", borderRadius:14, border:"1px solid rgba(205,231,206,.1)", background:"linear-gradient(180deg, rgba(28,58,42,.9), rgba(14,26,19,.9))" }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", border:"3px solid rgba(205,231,206,.25)", borderTopColor:"#2e7d32", margin:"0 auto", animation:"spin .9s linear infinite" }} />
                    <span style={{ opacity:.9, textAlign:"center" }}>Inicializando módulos…</span>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
          </AuthProvider>
        </UIProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
