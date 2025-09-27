from flask import Blueprint, jsonify

bp = Blueprint("tramites", __name__, url_prefix="/api/tramites")

@bp.get("/ping")
def ping_tramites():
    return jsonify({"ok": True, "mod": "tramites"})
