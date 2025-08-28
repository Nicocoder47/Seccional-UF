import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Tus wrappers enterprise (MUI por dentro)
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import Card from "@/components/common/Card";
import Spinner from "@/components/common/Spinner";

// ===== Helpers =====
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [localErr, setLocalErr] = useState("");

  const errors = useMemo(() => {
    const e = {};
    if (form.email && !emailOk(form.email)) e.email = "Email inválido";
    if (form.password && form.password.length < 6) e.password = "Mínimo 6 caracteres";
    return e;
  }, [form]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setLocalErr("");
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      return setLocalErr("Completá email y contraseña.");
    }
    if (Object.keys(errors).length) {
      return setLocalErr("Revisá los datos ingresados.");
    }

    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate("/perfil");
    } catch (err) {
      setLocalErr(err?.message || "Login fallido");
    }
  }

  return (
    <section
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "min(440px, 100%)" }}>
        <Card
          title="Ingresar"
          sx={{
            backgroundImage: "none",
            backgroundColor: "color-mix(in oklab, var(--bg-2, #1c3a2a), white 3%)",
          }}
        >
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              error={errors.email}
              placeholder="tu@correo.com"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              error={errors.password}
              placeholder="********"
            />

            {(error || localErr) && (
              <Alert severity="error">
                {error || localErr}
              </Alert>
            )}

            <div style={{ display: "grid", gap: 8 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ borderRadius: 2, paddingBlock: 1.2, fontWeight: 700 }}
              >
                {loading ? "Ingresando…" : "Entrar"}
              </Button>

              {/* feedback opcional mientras loading */}
              {loading ? <Spinner inline size={20} thickness={5} /> : null}
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
