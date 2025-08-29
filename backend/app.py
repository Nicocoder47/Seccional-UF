# backend/app.py — REST Supabase (sin ORM)
from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv, find_dotenv

# Importa el blueprint con las rutas de afiliados (modo REST)
from backend.routes.afiliados import bp as afiliados_bp


def create_app():
    # Carga variables desde el .env más cercano (por ej. backend/.env)
    load_dotenv(find_dotenv(usecwd=True))

    app = Flask(__name__)

    # ===== CORS =====
    # Orígenes permitidos: localhost (Vite) + dominio de Vercel (prod)
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://seccional-uf.vercel.app",
        "https://*.vercel.app",
    ]
    # Permitir override con CORS_ORIGINS="https://foo.com,https://bar.com"
    extra = os.environ.get("CORS_ORIGINS", "")
    if extra.strip():
        default_origins += [o.strip() for o in extra.split(",") if o.strip()]

    CORS(
        app,
        resources={r"/api/*": {"origins": default_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        max_age=86400,
    )

    # ===== Blueprints (API) =====
    app.register_blueprint(afiliados_bp, url_prefix="/api/afiliados")

    # ===== Healthchecks =====
    @app.get("/api/health")
    def health():
        ok = bool(os.getenv("SUPABASE_URL")) and bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        status = 200 if ok else 500
        return jsonify(ok=ok, supabase_url=bool(os.getenv("SUPABASE_URL"))), status

    @app.get("/ping")
    def ping():
        return jsonify(message="pong"), 200

    return app


# WSGI entrypoint (gunicorn: "gunicorn backend.app:app")
app = create_app()

if __name__ == "__main__":
    # Desarrollo local
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
