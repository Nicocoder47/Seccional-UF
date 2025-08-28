// src/components/admin/AfiliadosTable.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Stack, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export default function AfiliadosTable() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortModel, setSortModel] = useState([{ field: "apellido", sort: "asc" }]);
  const [query, setQuery] = useState("");

  const columns = useMemo(() => [
    { field: "dni", headerName: "DNI", width: 120 },
    { field: "numero_socio", headerName: "N° Socio", width: 120 },
    { field: "apellido", headerName: "Apellido", flex: 1, minWidth: 140 },
    { field: "nombres", headerName: "Nombres", flex: 1, minWidth: 160 },
    { field: "empresa", headerName: "Empresa", width: 160 },
    { field: "sector", headerName: "Sector", width: 140 },
    { field: "lugar_trabajo", headerName: "Lugar de trabajo", width: 180 },
    { field: "creado_en", headerName: "Creado", width: 140, valueGetter: v => v.row.creado_en?.slice(0,10) },
  ], []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const sort = sortModel[0] || {};
    const params = new URLSearchParams({
      page: String(page + 1),
      per_page: String(pageSize),
      sort_by: sort.field || "apellido",
      sort_dir: sort.sort || "asc",
    });
    if (query) params.set("q", query);

    const res = await fetch(`${API_URL}/afiliados?${params.toString()}`);
    const data = await res.json();

    setRows((data.items || data.data || []).map(it => ({ id: it.id, ...it })));
    setRowCount(Number(data.total || data.count || 0));
    setLoading(false);
  }, [page, pageSize, sortModel, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Stack gap={1}>
      <TextField
        size="small"
        placeholder="Buscar por DNI, apellido, empresa…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon /></InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setQuery("")}><ClearIcon /></IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      <div style={{ height: 620, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          sortingMode="server"
          filterMode="client"
          rowCount={rowCount}
          pageSizeOptions={[10, 25, 50, 100]}
          page={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          disableRowSelectionOnClick
        />
      </div>
    </Stack>
  );
}
