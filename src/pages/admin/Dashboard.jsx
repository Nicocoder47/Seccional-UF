// src/pages/admin/Dashboard.jsx
import { Grid, Paper, Typography, Box } from "@mui/material";

function KPI({ title, value, hint }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="overline" sx={{ opacity: .8 }}>{title}</Typography>
      <Typography variant="h4" sx={{ mb: .5, fontWeight: 800 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{hint}</Typography>
    </Paper>
  );
}

export default function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Tablero</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}><KPI title="Afiliados" value="9.4k" hint="Total en padrón" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KPI title="Activos" value="7.8k" hint="Con datos completos" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KPI title="Pendientes" value="1.2k" hint="Faltan verificar" /></Grid>
        <Grid item xs={12} sm={6} md={3}><KPI title="Últ. sync" value="hoy" hint="Base actualizada" /></Grid>
      </Grid>
    </Box>
  );
}
