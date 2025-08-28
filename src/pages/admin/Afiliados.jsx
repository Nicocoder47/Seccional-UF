// src/pages/admin/Afiliados.jsx
import { Typography, Paper, Stack } from "@mui/material";
import AfiliadosTable from "@/components/admin/AfiliadosTable.jsx";

export default function Afiliados() {
  return (
    <Stack gap={2}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>Afiliados</Typography>
      <Paper sx={{ p: 2 }}>
        <AfiliadosTable />
      </Paper>
    </Stack>
  );
}
