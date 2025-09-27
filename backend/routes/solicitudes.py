from flask import Blueprint, jsonify

bp = Blueprint("solicitudes", __name__, url_prefix="/api/solicitudes")

@bp.get("/ping")
def ping_solicitudes():
    return jsonify({"ok": True, "mod": "solicitudes"})
