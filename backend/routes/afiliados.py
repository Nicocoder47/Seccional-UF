# backend/routes/afiliados.py — Endpoints REST a Supabase
from __future__ import annotations

from flask import Blueprint, request, jsonify, Response
import os, re, time, io, csv, datetime as dt
import requests

bp = Blueprint("afiliados", __name__)

# -----------------------------
# Config / utilidades
# -----------------------------
INT_RE = re.compile(r"^\d+$")

# Whitelist de columnas (ajústala a tu tabla real)
FIELDS_ALL = [
    "id","dni","numero_socio","apellido","nombres","sexo",
    "empresa","sector","lugar_trabajo",
    "direccion","email","celular",
    "denominacion_funcion","denominacion_posicion","legajo",
    "fecha_nacimiento","fecha_primer_ingreso",
    "creado_en","actualizado_en","apellido_nombre",
]

DEFAULT_SELECT = ",".join([
    "id","dni","numero_socio","apellido","nombres",
    "empresa","sector","lugar_trabajo","creado_en","actualizado_en"
])

DETAIL_SELECT = ",".join([
    "id","dni","numero_socio","apellido","nombres","sexo",
    "direccion","email","celular",
    "empresa","sector","lugar_trabajo",
    "denominacion_funcion","denominacion_posicion","legajo",
    "fecha_nacimiento","fecha_primer_ingreso",
    "creado_en","actualizado_en"
])

SAFE_SORT_FIELDS = set([
    "id","dni","numero_socio","apellido","nombres","sexo",
    "empresa","sector","lugar_trabajo","creado_en","actualizado_en"
])

def _get_session():
    """
    Crea una sesión REST a Supabase.
    Usamos SERVICE_ROLE tanto para Authorization como para apikey (backend).
    """
    url   = os.getenv("SUPABASE_URL")
    s_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    table = os.getenv("SUPABASE_TABLE", "afiliados_personal")
    if not url or not s_key:
        return None, None, None
    sess = requests.Session()
    sess.headers.update({
        "Authorization": f"Bearer {s_key}",
        "apikey": s_key,                   # usamos service role también como apikey
        "Content-Type": "application/json",
        "Prefer": "count=exact",          # habilita Content-Range para total
    })
    return url.rstrip("/"), table, sess

def _clean_dni(s: str|None) -> str|None:
    if not s: return None
    d = "".join(ch for ch in s if ch.isdigit())
    return d or None

def _sanitize_like(q: str|None) -> str|None:
    if not q: return None
    return q.replace("%", r"\%").replace("_", r"\_").strip() or None

def _parse_total(h: str|None) -> int:
    if not h or "/" not in h: return 0
    try: return int(h.split("/")[-1])
    except Exception: return 0

def _parse_date(s: str|None) -> str|None:
    """Acepta YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS y devuelve ISO."""
    if not s: return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"):
        try:
            return dt.datetime.strptime(s, fmt).isoformat()
        except ValueError:
            pass
    return None

def _resolve_select_param(raw: str|None, fallback: str) -> str:
    if not raw:
        return fallback
    cols = [c.strip() for c in raw.split(",") if c.strip()]
    cols = [c for c in cols if c in FIELDS_ALL]
    return ",".join(cols) if cols else fallback

# -----------------------------
# GET /api/afiliados/
# -----------------------------
@bp.get("/")
def list_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        return jsonify({"error":"config_error","detail":"Faltan SUPABASE_URL/SERVICE_ROLE"}), 500

    t0 = time.perf_counter()

    # Filtros básicos
    q       = _sanitize_like(request.args.get("q"))
    dni     = _clean_dni(request.args.get("dni"))
    empresa = _sanitize_like(request.args.get("empresa"))
    sector  = _sanitize_like(request.args.get("sector"))
    lugar   = _sanitize_like(request.args.get("lugar_trabajo"))

    # Rangos de fecha
    created_from = _parse_date(request.args.get("created_from"))
    created_to   = _parse_date(request.args.get("created_to"))
    updated_from = _parse_date(request.args.get("updated_from"))
    updated_to   = _parse_date(request.args.get("updated_to"))

    # Paginación
    try: page = max(1, int(request.args.get("page", 1)))
    except: page = 1
    try: page_size = max(1, min(int(request.args.get("page_size", 50)), 10000))
    except: page_size = 50
    offset = (page - 1) * page_size

    # Orden
    sort  = (request.args.get("sort") or "apellido").strip()
    if sort not in SAFE_SORT_FIELDS: sort = "apellido"
    order = "desc" if (request.args.get("order","asc").lower().startswith("d")) else "asc"

    # Select (whitelist)
    select_param = _resolve_select_param(request.args.get("fields"), DEFAULT_SELECT)

    # Armamos params como lista de tuplas para permitir keys repetidas (rangos)
    params: list[tuple[str,str]] = [
        ("select", select_param),
        ("order", f"{sort}.{order}"),
        ("limit", str(page_size)),
        ("offset", str(offset)),
    ]
    if dni:      params.append(("dni", f"eq.{dni}"))
    if q:        params.append(("or", f"(apellido.ilike.*{q}*,nombres.ilike.*{q}*,apellido_nombre.ilike.*{q}*)"))
    if empresa:  params.append(("empresa", f"ilike.*{empresa}*"))
    if sector:   params.append(("sector", f"ilike.*{sector}*"))
    if lugar:    params.append(("lugar_trabajo", f"ilike.*{lugar}*"))
    if created_from: params.append(("creado_en", f"gte.{created_from}"))
    if created_to:   params.append(("creado_en", f"lt.{created_to}"))
    if updated_from: params.append(("actualizado_en", f"gte.{updated_from}"))
    if updated_to:   params.append(("actualizado_en", f"lt.{updated_to}"))

    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=params, timeout=30)
        if r.status_code in (401, 403):
            return jsonify({"error":"supa_error","detail":"Invalid/unauthorized key (401/403)"}), 400
        r.raise_for_status()
        data = r.json()
        total = _parse_total(r.headers.get("content-range"))
    except requests.exceptions.RequestException as e:
        return jsonify({"error":"supa_error","detail":str(e)}), 400

    # CSV opcional
    if (request.args.get("format") or "").lower() == "csv":
        out = io.StringIO()
        cols = list(data[0].keys()) if data else select_param.split(",")
        writer = csv.DictWriter(out, fieldnames=cols)
        writer.writeheader()
        writer.writerows(data)
        return Response(
            out.getvalue().encode("utf-8-sig"),
            mimetype="text/csv",
            headers={"Content-Disposition": f'attachment; filename="afiliados_p{page}.csv"'}
        )

    ms = int((time.perf_counter() - t0) * 1000)
    return jsonify({
        "data": data,
        "page": page,
        "page_size": page_size,
        "total": total,
        "has_next": offset + page_size < total,
        "has_prev": page > 1,
        "sort": {"field": sort, "order": order},
        "duration_ms": ms
    }), 200

# -----------------------------
# GET /api/afiliados/<dni> (detalle por DNI)
# -----------------------------
@bp.get("/<dni>")
def get_by_dni(dni: str):
    supa_url, table, sess = _get_session()
    if not sess:
        return jsonify({"error":"config_error","detail":"Faltan SUPABASE_URL/SERVICE_ROLE"}), 500

    d = _clean_dni(dni)
    if not d:
        return jsonify({"error":"DNI inválido"}), 400

    select_param = _resolve_select_param(request.args.get("fields"), DETAIL_SELECT)
    params = [("select", select_param), ("dni", f"eq.{d}"), ("limit", "1")]

    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=params, timeout=30)
        if r.status_code in (401, 403):
            return jsonify({"error":"supa_error","detail":"Invalid/unauthorized key (401/403)"}), 400
        r.raise_for_status()
        rows = r.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error":"supa_error","detail":str(e)}), 400

    if not rows:
        return jsonify({"data": None, "found": False}), 200
    return jsonify({"data": rows[0], "found": True}), 200

# -----------------------------
# GET /api/afiliados/count (total rápido)
# -----------------------------
@bp.get("/count")
def count_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        return jsonify({"error":"config_error"}), 500

    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=[("select","id"),("limit","1")], timeout=30)
        r.raise_for_status()
        total = _parse_total(r.headers.get("content-range"))
    except requests.exceptions.RequestException as e:
        return jsonify({"error":"supa_error","detail":str(e)}), 400

    return jsonify({"total": total}), 200

# -----------------------------
# GET /api/afiliados/stats?group=empresa|sector|lugar_trabajo
# -----------------------------
@bp.get("/stats")
def stats_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        return jsonify({"error":"config_error"}), 500

    group = (request.args.get("group") or "empresa").strip()
    if group not in {"empresa","sector","lugar_trabajo"}:
        group = "empresa"

    params = [("select", f"{group},count:id"), ("group", group), ("order", "count.desc"), ("limit", "200")]
    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error":"supa_error","detail":str(e)}), 400

    out = [{"grupo": row.get(group), "cantidad": row.get("count")} for row in data]
    return jsonify({"group_by": group, "data": out}), 200
