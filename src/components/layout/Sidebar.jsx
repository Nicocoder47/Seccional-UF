// src/components/layout/Sidebar.jsx
import { useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Toolbar, Typography, Stack, Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import ShieldIcon from "@mui/icons-material/Shield";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "@/context/AuthContext";

const drawerWidth = 280;

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isAdmin = useMemo(() => {
    const r = String(user?.role || user?.rol || "").toLowerCase();
    return r === "admin";
  }, [user]);

  const navPublic = [
    { to: "/", icon: <HomeIcon />, label: "Inicio" },
    { to: "/novedades", icon: <NewspaperIcon />, label: "Novedades" },
    { to: "/afiliados", icon: <GroupsIcon />, label: "Afiliados" },
    { to: "/afiliados/buscar", icon: <SearchIcon />, label: "Buscar por DNI" },
  ];

  const navAdmin = [
    { to: "/admin", icon: <SpaceDashboardIcon />, label: "Panel" },
    { to: "/admin/afiliados", icon: <GroupsIcon />, label: "Afiliados (Admin)" },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(205,231,206,.14)",
        },
      }}
    >
      <Toolbar>
        <Stack
          component={Link}
          to="/"
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ textDecoration: "none", color: "inherit" }}
          onClick={onClose}
        >
          <ShieldIcon />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Seccional UF
          </Typography>
        </Stack>
      </Toolbar>

      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          Navegación
        </Typography>
        <List sx={{ mb: 1 }}>
          {navPublic.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={onClose}
              selected={location.pathname === item.to}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        {isAuthenticated && isAdmin && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              Administración
            </Typography>
            <List sx={{ mb: 1 }}>
              {navAdmin.map((item) => (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  onClick={onClose}
                  selected={location.pathname === item.to}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Sesión */}
        {!isAuthenticated ? (
          <Button
            component={Link}
            to="/login"
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={onClose}
            sx={{ borderRadius: 2 }}
          >
            Ingresar
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              to="/perfil"
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={onClose}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              Perfil
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => {
                logout?.();
                onClose?.();
              }}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              Salir
            </Button>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
