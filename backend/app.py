# backend/app.py
import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)

    # JSON y orden de claves (más legible)
    app.config["JSON_SORT_KEYS"] = False

    # Detrás de proxy (Render/heroku-like)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)  # type: ignore

    # CORS
    origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
    CORS(
        app,
        resources={r"/*": {"origins": origins}},
        supports_credentials=True,
        expose_headers=["Content-Range"],
    )

    # Blueprints
    from routes.afiliados import bp as afiliados_bp
    app.register_blueprint(afiliados_bp, url_prefix="/api/afiliados")

    # -------- Health / Ready --------
    @app.get("/healthz")
    def healthz():
        return jsonify(ok=True, service="seccional-backend")

    @app.get("/readyz")
    def readyz():
        # chequeo mínimo de envs críticos para Supabase
        missing = [k for k in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY") if not os.getenv(k)]
        return (
            jsonify(status="ready" if not missing else "degraded", missing=missing),
            200 if not missing else 503,
        )

    # Raíz informativa
    @app.get("/")
    def root():
        return jsonify(
            ok=True,
            links={
                "healthz": "/healthz",
                "readyz": "/readyz",
                "afiliados_list": "/api/afiliados/?page_size=5",
                "afiliados_schema": "/api/afiliados/schema",
            },
        )

    # After-request: headers útiles
    @app.after_request
    def add_headers(resp):
        # Evitar caches agresivos para API
        resp.headers.setdefault("Cache-Control", "no-store")
        return resp

    # -------- Error handlers JSON --------
    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error="not_found", path=request.path), 404

    @app.errorhandler(Exception)
    def on_error(e):
        logger.exception("Unhandled error")
        return jsonify(error="internal_error", detail=str(e)), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
