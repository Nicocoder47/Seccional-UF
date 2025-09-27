# backend/app.py
import os
import time
import uuid
import logging
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv

load_dotenv()

# ===== Blueprints =====
from routes.afiliados import bp as afiliados_bp  # requerido

# Opcionales: no fallar si no existen
try:
    from routes.tramites import bp as tramites_bp  # type: ignore
except Exception:
    tramites_bp = None  # type: ignore

try:
    from routes.solicitudes import bp as solicitudes_bp  # type: ignore
except Exception:
    solicitudes_bp = None  # type: ignore

try:
    from routes.ping import bp as ping_bp  # type: ignore
except Exception:
    ping_bp = None  # type: ignore

# (para deep health opcional)
try:
    from routes.afiliados import _get_session as _supa_session
except Exception:
    _supa_session = None


def create_app():
    app = Flask(__name__)

    # ---------- Config ----------
    app.config["JSON_SORT_KEYS"] = False
    app.config["JSONIFY_PRETTYPRINT_REGULAR"] = False
    app.config["PROPAGATE_EXCEPTIONS"] = False

    APP_NAME = os.getenv("APP_NAME", "seccional-backend")
    APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

    # Respetar X-Forwarded-* (Render/NGINX)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)  # type: ignore

    # ---------- CORS ----------
    origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    CORS(
        app,
        origins=[o.strip() for o in origins if o.strip()],
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        expose_headers=["Content-Range", "X-Request-ID"],
        max_age=86400,
    )

    # ---------- Logging ----------
    if not logging.getLogger().handlers:
        logging.basicConfig(
            level=os.getenv("LOG_LEVEL", "INFO"),
            format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        )
    start_ts = time.time()

    # ---------- Hooks ----------
    @app.before_request
    def _add_request_id():
        g.request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

    @app.after_request
    def _add_headers(resp):
        # Seguridad básica
        resp.headers.setdefault("X-Content-Type-Options", "nosniff")
        resp.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        resp.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        # Observabilidad
        resp.headers["X-Request-ID"] = g.get("request_id", "-")
        # Cache control mínimo para JSON
        if (getattr(resp, "mimetype", None) or "").startswith("application/json"):
            resp.headers.setdefault("Cache-Control", "no-store")
        return resp

    # ---------- Salud ----------
    @app.get("/")
    def root():
        return {"ok": True, "service": APP_NAME, "version": APP_VERSION}

    @app.get("/api/health")
    def health():
        uptime_s = int(time.time() - start_ts)
        return {"ok": True, "service": APP_NAME, "version": APP_VERSION, "uptime_s": uptime_s}

    @app.get("/api/health/deep")
    def deep_health():
        if not _supa_session:
            return jsonify({"ok": True, "supabase": "skip"}), 200
        supa_url, table, sess = _supa_session()
        if not sess:
            return jsonify({"ok": True, "supabase": "not_configured"}), 200
        try:
            r = sess.get(
                f"{supa_url}/rest/v1/{table}",
                params=[("select", "id"), ("limit", "1")],
                timeout=5
            )
            r.raise_for_status()
            return jsonify({"ok": True, "supabase": "ok"}), 200
        except Exception as e:
            return jsonify({"ok": False, "supabase": "error", "detail": str(e)[:180]}), 500

    # ---------- Manejadores de error ----------
    @app.errorhandler(404)
    def _not_found(_):
        return jsonify({"error": "not_found"}), 404

    @app.errorhandler(500)
    def _server_error(e):
        app.logger.exception("Unhandled error: %s", e)
        return jsonify({"error": "server_error"}), 500

    # ---------- Blueprints ----------
    app.logger.info("Registrando blueprint: afiliados")
    app.register_blueprint(afiliados_bp)

    if ping_bp is not None:
        app.logger.info("Registrando blueprint: ping")
        app.register_blueprint(ping_bp)
    else:
        app.logger.warning("Blueprint 'ping' no encontrado. Saltando registro.")

    if tramites_bp is not None:
        app.logger.info("Registrando blueprint: tramites")
        app.register_blueprint(tramites_bp)
    else:
        app.logger.warning("Blueprint 'tramites' no encontrado. Saltando registro.")

    if solicitudes_bp is not None:
        app.logger.info("Registrando blueprint: solicitudes")
        app.register_blueprint(solicitudes_bp)
    else:
        app.logger.warning("Blueprint 'solicitudes' no encontrado. Saltando registro.")

    return app


app = create_app()
