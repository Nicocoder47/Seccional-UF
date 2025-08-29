# backend/routes/afiliados.py — Endpoints REST a Supabase (versión mejorada)
from __future__ import annotations

import csv
import datetime as dt
import io
import os
import re
import time
from typing import Iterable

import requests
from flask import Blueprint, Response, jsonify, request

bp = Blueprint("afiliados", __name__)

# -----------------------------
# Config / utilidades
# -----------------------------
INT_RE = re.compile(r"^\d+$")

# Whitelist de columnas (ajústala a tu tabla real)
FIELDS_ALL = [
    "id", "dni", "numero_socio", "apellido", "nombres", "sexo",
    "empresa", "sector", "lugar_trabajo",
    "direccion", "email", "celular",
    "denominacion_funcion", "denominacion_posicion", "legajo",
    "fecha_nacimiento", "fecha_primer_ingreso",
    "creado_en", "actualizado_en", "apellido_nombre",
]

DEFAULT_SELECT = ",".join([
    "id", "dni", "numero_socio", "apellido", "nombres",
    "empresa", "sector", "lugar_trabajo", "creado_en", "actualizado_en",
])

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

# Límites y timeouts
MAX_PAGE_SIZE = int(os.getenv("MAX_PAGE_SIZE", "10000"))
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "30.0"))


def _get_session():
    """
    Crea una sesión REST a Supabase.
    Usamos SERVICE_ROLE tanto para Authorization como para apikey (backend).
    """
    url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
    s_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    table = os.getenv("SUPABASE_TABLE", "afiliados_personal")
    if not url or not s_key:
        return None, None, None
    sess = requests.Session()
    sess.headers.update({
        "Authorization": f"Bearer {s_key}",
        "apikey": s_key,                   # usamos service role también como apikey
        "Content-Type": "application/json",
        "Prefer": "count=exact",           # habilita Content-Range para total
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
    # escapamos comodines y espacios extremos
    q = q.replace("%", r"\%").replace("_", r"\_").strip()
    # recortamos consultas ridículamente largas para evitar abusos
    return q[:100] or None


def _parse_total(h: str | None) -> int:
    if not h or "/" not in h:
        return 0
    try:
        return int(h.split("/")[-1])
    except Exception:
        return 0


def _parse_date(s: str | None) -> str | None:
    """Acepta YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS y devuelve ISO."""
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"):
        try:
            return dt.datetime.strptime(s, fmt).isoformat()
        except ValueError:
            pass
    return None


def _resolve_select_param(raw: str | None, fallback: str) -> str:
    if not raw:
        return fallback
    cols = [c.strip() for c in raw.split(",") if c.strip()]
    cols = [c for c in cols if c in FIELDS_ALL]
    return ",".join(cols) if cols else fallback


def _bounded_int(value: str | None, default: int, min_v: int, max_v: int) -> int:
    try:
        v = int(value) if value is not None else default
    except Exception:
        return default
    return max(min_v, min(v, max_v))


def _csv_response(rows: Iterable[dict], columns: list[str], filename: str) -> Response:
    out = io.StringIO(newline="")
    writer = csv.DictWriter(out, fieldnames=columns, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    payload = out.getvalue().encode("utf-8-sig")
    return Response(
        payload,
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# -----------------------------
# GET /api/afiliados/
# -----------------------------
@bp.get("/")
def list_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        return jsonify({"error": "config_error", "detail": "Faltan SUPABASE_URL/SERVICE_ROLE"}), 500

    t0 = time.perf_counter()

    # Filtros básicos
    q = _sanitize_like(request.args.get("q"))
    dni = _clean_dni(request.args.get("dni"))
    empresa = _sanitize_like(request.args.get("empresa"))
    sector = _sanitize_like(request.args.get("sector"))
    lugar = _sanitize_like(request.args.get("lugar_trabajo"))

    # Rangos de fecha
    created_from = _parse_date(request.args.get("created_from"))
    created_to = _parse_date(request.args.get("created_to"))
    updated_from = _parse_date(request.args.get("updated_from"))
    updated_to = _parse_date(request.args.get("updated_to"))

    # Paginación segura
    page = _bounded_int(request.args.get("page"), default=1, min_v=1, max_v=1_000_000)
    page_size = _bounded_int(request.args.get("page_size"), default=50, min_v=1, max_v=MAX_PAGE_SIZE)
    offset = (page - 1) * page_size

    # Orden
    sort = (request.args.get("sort") or "apellido").strip()
    if sort not in SAFE_SORT_FIELDS:
        sort = "apellido"
    order = "desc" if (request.args.get("order", "asc").lower().startswith("d")) else "asc"

    # Select (whitelist)
    select_param = _resolve_select_param(request.args.get("fields"), DEFAULT_SELECT)

    # Params como lista de tuplas (permite claves repetidas)
    params: list[tuple[str, str]] = [
        ("select", select_param),
        ("order", f"{sort}.{order}"),
        ("limit", str(page_size)),
        ("offset", str(offset)),
    ]
    if dni:
        params.append(("dni", f"eq.{dni}"))
    if q:
        # PostgREST OR con ILIKE escapado
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
        data = r.json()
        total = _parse_total(r.headers.get("content-range"))
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": str(e)}), 400

    # CSV opcional (stream amigable)
    if (request.args.get("format") or "").lower() == "csv":
        cols = list(data[0].keys()) if data else [c for c in select_param.split(",") if c]
        stamp = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        return _csv_response(data, cols, filename=f"afiliados_p{page}_{stamp}.csv")

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
# GET /api/afiliados/<dni> (detalle por DNI)
# -----------------------------
@bp.get("/<dni>")
def get_by_dni(dni: str):
    supa_url, table, sess = _get_session()
    if not sess:
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
        return jsonify({"error": "supa_error", "detail": str(e)}), 400

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
        return jsonify({"error": "config_error"}), 500

    try:
        r = sess.get(
            f"{supa_url}/rest/v1/{table}",
            params=[("select", "id"), ("limit", "1")],
            timeout=HTTP_TIMEOUT,
        )
        r.raise_for_status()
        total = _parse_total(r.headers.get("content-range"))
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": str(e)}), 400

    return jsonify({"total": total}), 200


# -----------------------------
# GET /api/afiliados/stats?group=empresa|sector|lugar_trabajo
# -----------------------------
@bp.get("/stats")
def stats_afiliados():
    supa_url, table, sess = _get_session()
    if not sess:
        return jsonify({"error": "config_error"}), 500

    group = (request.args.get("group") or "empresa").strip()
    if group not in {"empresa", "sector", "lugar_trabajo"}:
        group = "empresa"

    params = [
        ("select", f"{group},count:id"),
        ("group", group),
        ("order", "count.desc.nullslast"),  # más prolijo si hay nulos
        ("limit", "500"),
    ]
    try:
        r = sess.get(f"{supa_url}/rest/v1/{table}", params=params, timeout=HTTP_TIMEOUT)
        r.raise_for_status()
        data = r.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "supa_error", "detail": str(e)}), 400

    out = [{"grupo": row.get(group), "cantidad": row.get("count")} for row in data]
    return jsonify({"group_by": group, "data": out}), 200


# -----------------------------
# GET /api/afiliados/schema (diagnóstico rápido)
# -----------------------------
@bp.get("/schema")
def schema_afiliados():
    """Devuelve columnas whitelisted para front/diagnóstico."""
    return jsonify({
        "fields_all": FIELDS_ALL,
        "default_select": DEFAULT_SELECT.split(","),
        "detail_select": DETAIL_SELECT.split(","),
        "sortable": sorted(SAFE_SORT_FIELDS),
        "max_page_size": MAX_PAGE_SIZE,
    }), 200
