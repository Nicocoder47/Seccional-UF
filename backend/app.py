# backend/app.py — Modo REST Supabase (sin SQLAlchemy/MySQL)
from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv, find_dotenv

# Importa el blueprint que usa la API REST de Supabase
# (Asegurate de tener la versión REST de afiliados.py que te pasé)
from backend.routes.afiliados import bp as afiliados_bp

def create_app():
    # Cargar variables desde backend/.env
    load_dotenv(find_dotenv())

    app = Flask(__name__)

    # CORS: permitir front local (Vite)
    default_origins = "http://localhost:5173,http://127.0.0.1:5173"
    origins = os.getenv("CORS_ORIGINS", default_origins).split(",")
    origins = [o.strip() for o in origins if o.strip()]
    CORS(app, origins=origins, supports_credentials=True)

    # Registrar rutas (REST Supabase)
    app.register_blueprint(afiliados_bp, url_prefix="/api/afiliados")

    # Healthchecks
    @app.get("/api/health")
    def health():
        # mini verificación de envs críticas
        ok = bool(os.getenv("SUPABASE_URL")) and bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        return jsonify(ok=ok), (200 if ok else 500)

    @app.get("/ping")
    def ping():
        return jsonify(message="pong"), 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
