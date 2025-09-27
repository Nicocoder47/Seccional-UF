# backend/routes/afiliados.py — Endpoints REST a Supabase (refinado)
from __future__ import annotations

import datetime as dt
import os
import re
import time
from typing import Iterable

import requests
from flask import Blueprint, Response, jsonify, request, stream_with_context, current_app
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

bp = Blueprint("afiliados", __name__, url_prefix="/api/afiliados")

# -----------------------------
# Config / utilidades
# -----------------------------
INT_RE = re.compile(r"^\d+$")

FIELDS_ALL = [
    "id", "dni", "numero_socio", "apellido", "nombres", "sexo",
    "empresa", "sector", "lugar_trabajo",
    "direccion", "email", "celular",
    "denominacion_funcion", "denominacion_posicion", "legajo",
    "fecha_nacimiento", "fecha_primer_ingreso",
    "creado_en", "actualizado_en", "apellido_nombre",
]

DEFAULT_SELECT = os.getenv("DEFAULT_SELECT", "*")

DETAIL_SELECT = ",".join([
    "id", "dni", "numero_socio", "apellido", "nombres", "sexo",
    "direccion", "email", "celular",
    "empresa", "sector", "lugar_trabajo",
    "denominacion_funcion", "denominacion_posicion", "legajo",
    "fecha_nacimiento", "fecha_primer_ingreso",
    "creado_en", "actualizado_en",
])

SAFE_SORT_FIELDS = {
    "id", "dni", "numero_socio", "apellido", "nombres", "sexo",
    "empresa", "sector", "lugar_trabajo", "creado_en", "actualizado_en",
}

MAX_PAGE_SIZE = int(os.getenv("MAX_PAGE_SIZE", "10000"))
HTTP_TIMEOUT  = float(os.getenv("HTTP_TIMEOUT", "30.0"))

# En dev, si no hay Supabase, devolvemos 200 "vacío" en vez de 500
ALLOW_DEV_NO_SUPA = os.getenv("ALLOW_DEV_NO_SUPA", "1") not in {"0", "false", "False"}


def _get_session():
    url   = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    s_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    table = os.getenv("SUPABASE_TABLE", "afiliados_personal")
    if not url or not s_key:
        return None, None, None

    sess = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=0.3,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET"]),
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=20)
    sess.mount("http://", adapter)
    sess.mount("https://", adapter)

    sess.headers.update({
        "Authorization": f"Bearer {s_key}",
        "apikey": s_key,
        "Content-Type": "application/json",
        "Prefer": "count=exact",
    })
    return url, table, sess


def _clean_dni(s: str | None) -> str | None:
    if not s:
        return None
    d = "".join(ch for ch in s if ch.isdigit())
    return d or None


def _sanitize_like(q: str | None) -> str | None:
    if not q:
        return None
    q = q.replace("%", r"\%").replace("_", r"\_").strip()
    tokens = q.split()
    q = " ".join(tokens[:5])
    return q[:100] or None


def _parse_total(h: str | None) -> int:
    if not h or "/" not in h:
        return 0
    try:
        return int(h.split("/")[-1])
    except Exception:
        return 0


def _parse_date(s: str | None) -> str | None:
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"):
        try:
            return dt.datetime.strptime(s, fmt).isoformat()
        except ValueError:
            pass
    return None


def _parse_date_range_end(s: str | None) -> str | None:
    if not s:
        return None
    try:
        d = dt.datetime.strptime(s, "%Y-%m-%d")
        return (d + dt.timedelta(days=1)).isoformat()
    except ValueError:
        return _parse_date(s)


def _resolve_select_param(raw: str | None, fallback: str) -> str:
    if not raw:
        return fallback
    raw = raw.strip()
    if raw == "*":
        return "*"
    cols = [c.strip() for c in raw.split(",") if c.strip()]
    cols = [c for c in cols if c in FIELDS_ALL]
    return ",".join(cols) if cols else fallback


def _bounded_int(value: str | None, default: int, min_v: int, max_v: int) -> int:
    try:
        v = int(value) if value is not None else default
    except Exception:
        return default
    return max(min_v, min(v, max_v))


def _safe_err(e: Exception) -> str:
    s = str(e)
    return (s[:240] + "...") if len(s) > 240 else s


def _csv_stream(rows: Iterable[dict], columns: list[str]):
    yield ",".join(columns) + "\r\n"
    for row in rows:
        line = []
        for c in columns:
            v = row.get(c, "")
            s = str(v).replace('"', '""')
            if any(ch in s for ch in [',', '\n', '\r', '"']):
                s = f'"{s}"'
            line.append(s)
        yield ",".join(line) + "\r\n"


def _csv_response_stream(rows: Iterable[dict], columns: list[str], filename: str) -> Response:
    gen = stream_with_context(_csv_stream(rows, columns))
    return Response(
        gen,
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# -----------------------------
# GET /api/afiliados/
# -----------------------------
@bp.get("/")
def list_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        if ALLOW_DEV_NO_SUPA:
            return jsonify({
                "data": [],
                "page": 1,
                "page_size": 0,
                "total": 0,
                "has_next": False,
                "has_prev": False,
                "sort": {"field": "apellido", "order": "asc"},
                "duration_ms": 0,
            }), 200
        return jsonify({"error": "config_error", "detail": "Faltan SUPABASE_URL/SERVICE_ROLE"}), 500

    t0 = time.perf_counter()

    # Filtros
    q       = _sanitize_like(request.args.get("q"))
    dni     = _clean_dni(request.args.get("dni"))
    empresa = _sanitize_like(request.args.get("empresa"))
    sector  = _sanitize_like(request.args.get("sector"))
    lugar   = _sanitize_like(request.args.get("lugar_trabajo"))

    # Rangos de fecha
    created_from = _parse_date(request.args.get("created_from"))
    created_to   = _parse_date_range_end(request.args.get("created_to"))
    updated_from = _parse_date(request.args.get("updated_from"))
    updated_to   = _parse_date_range_end(request.args.get("updated_to"))

    # Paginación
    page      = _bounded_int(request.args.get("page"), default=1, min_v=1, max_v=1_000_000)
    page_size = _bounded_int(request.args.get("page_size"), default=50, min_v=1, max_v=MAX_PAGE_SIZE)
    offset    = (page - 1) * page_size

    # Orden
    sort = (request.args.get("sort") or "apellido").strip()
    if sort not in SAFE_SORT_FIELDS:
        sort = "apellido"
    order = "desc" if (request.args.get("order", "asc").lower().startswith("d")) else "asc"

    select_param = _resolve_select_param(request.args.get("fields"), DEFAULT_SELECT)

    params: list[tuple[str, str]] = [
        ("select", select_param),
        ("order", f"{sort}.{order}"),
        ("limit", str(page_size)),
        ("offset", str(offset)),
    ]
    if dni:
        params.append(("dni", f"eq.{dni}"))
    if q:
        params.append(("or", f"(apellido.ilike.*{q}*,nombres.ilike.*{q}*,apellido_nombre.ilike.*{q}*)"))
    if empresa:
        params.append(("empresa", f"ilike.*{empresa}*"))
    if sector:
        params.append(("sector", f"ilike.*{sector}*"))
    if lugar:
        params.append(("lugar_trabajo", f"ilike.*{lugar}*"))
    if created_from:
        params.append(("creado_en", f"gte.{created_from}"))
    if created_to:
        params.append(("creado_en", f"lt.{created_to}"))
    if updated_from:
        params.append(("actualizado_en", f"gte.{updated_from}"))
    if updated_to:
        params.append(("actualizado_en", f"lt.{updated_to}"))

    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=params, timeout=HTTP_TIMEOUT)
        if r.status_code in (401, 403):
            return jsonify({"error": "supa_error", "detail": "Invalid/unauthorized key (401/403)"}), 400
        r.raise_for_status()
        data  = r.json()
        total = _parse_total(r.headers.get("content-range"))
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": _safe_err(e)}), 400

    ms = int((time.perf_counter() - t0) * 1000)
    return jsonify({
        "data": data,
        "page": page,
        "page_size": page_size,
        "total": total,
        "has_next": (offset + page_size) < total,
        "has_prev": page > 1,
        "sort": {"field": sort, "order": order},
        "duration_ms": ms,
    }), 200


# -----------------------------
# GET /api/afiliados/<dni>  (detalle por DNI)
# -----------------------------
@bp.get("/<dni>")
def get_by_dni(dni: str):
    supa_url, table, sess = _get_session()
    if not sess:
        if ALLOW_DEV_NO_SUPA:
            return jsonify({"data": None, "found": False}), 200
        return jsonify({"error": "config_error", "detail": "Faltan SUPABASE_URL/SERVICE_ROLE"}), 500

    d = _clean_dni(dni)
    if not d:
        return jsonify({"error": "dni_invalido", "detail": "El DNI debe contener solo dígitos"}), 400

    select_param = _resolve_select_param(request.args.get("fields"), DETAIL_SELECT)
    params = [("select", select_param), ("dni", f"eq.{d}"), ("limit", "1")]

    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=params, timeout=HTTP_TIMEOUT)
        if r.status_code in (401, 403):
            return jsonify({"error": "supa_error", "detail": "Invalid/unauthorized key (401/403)"}), 400
        r.raise_for_status()
        rows = r.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": _safe_err(e)}), 400

    if not rows:
        return jsonify({"data": None, "found": False}), 200
    return jsonify({"data": rows[0], "found": True}), 200


# --- Alias compatibilidad: /api/afiliados/dni/<dni>
@bp.get("/dni/<dni>")
def get_by_dni_alias(dni: str):
    return get_by_dni(dni)


# --- Alias compatibilidad: /api/afiliados/apellido/<ape>
@bp.get("/apellido/<ape>")
def search_by_apellido_alias(ape: str):
    # Reutiliza list_afiliados con q=<ape>
    with current_app.test_request_context(f"/api/afiliados/?q={ape}&page=1&page_size=50"):
        return list_afiliados()


# -----------------------------
# GET /api/afiliados/count
# -----------------------------
@bp.get("/count")
def count_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        if ALLOW_DEV_NO_SUPA:
            return jsonify({"total": 0}), 200
        return jsonify({"error": "config_error"}), 500

    try:
        r = sess.get(
            f"{supa_url}/rest/v1/{table}",
            params=[("select", "id")],
            headers={"Range-Unit": "items", "Range": "0-0"},
            timeout=HTTP_TIMEOUT,
        )
        r.raise_for_status()
        total = _parse_total(r.headers.get("content-range"))
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": _safe_err(e)}), 400

    return jsonify({"total": total}), 200


# -----------------------------
# GET /api/afiliados/stats?group=empresa|sector|lugar_trabajo
# -----------------------------
@bp.get("/stats")
def stats_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        if ALLOW_DEV_NO_SUPA:
            return jsonify({"group_by": "empresa", "data": []}), 200
        return jsonify({"error": "config_error"}), 500

    group = (request.args.get("group") or "empresa").strip()
    if group not in {"empresa", "sector", "lugar_trabajo"}:
        group = "empresa"

    params = [
        ("select", f"{group},count:id"),
        ("group", group),
        ("order", "count.desc.nullslast"),
        ("limit", "500"),
    ]
    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=params, timeout=HTTP_TIMEOUT)
        r.raise_for_status()
        data = r.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": _safe_err(e)}), 400

    out = [{"grupo": row.get(group), "cantidad": row.get("count")} for row in data]
    return jsonify({"group_by": group, "data": out}), 200


# -----------------------------
# GET /api/afiliados/schema
# -----------------------------
@bp.get("/schema")
def schema_afiliados():
    return jsonify({
        "fields_all": FIELDS_ALL,
        "default_select": DEFAULT_SELECT.split(",") if DEFAULT_SELECT != "*" else ["*"],
        "detail_select": DETAIL_SELECT.split(","),
        "sortable": sorted(SAFE_SORT_FIELDS),
        "max_page_size": MAX_PAGE_SIZE,
    }), 200


# -----------------------------
# GET /api/afiliados/schema/live
# -----------------------------
@bp.get("/schema/live")
def schema_live():
    supa_url, table, sess = _get_session()
    if not sess:
        if ALLOW_DEV_NO_SUPA:
            return jsonify({"columns": []}), 200
        return jsonify({"error": "config_error"}), 500
    try:
        r = sess.get(
            f"{supa_url}/rest/v1/{table}",
            params=[("select", "*"), ("limit", "1")],
            timeout=HTTP_TIMEOUT
        )
        r.raise_for_status()
        rows = r.json()
        cols = sorted(list(rows[0].keys())) if rows else []
        return jsonify({"columns": cols}), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": _safe_err(e)}), 400


# -----------------------------
# GET /api/afiliados/_ping_supabase
# -----------------------------
@bp.get("/_ping_supabase")
def ping_supabase():
    supa_url, table, sess = _get_session()
    if not sess:
        return jsonify({"ok": False, "reason": "config"}), 500
    try:
        r = sess.get(
            f"{supa_url}/rest/v1/{table}",
            params=[("select", "id"), ("limit", "1")],
            timeout=5
        )
        ok = r.ok
        return jsonify({"ok": ok, "status": r.status_code}), 200 if ok else 500
    except Exception:
        return jsonify({"ok": False}), 500
