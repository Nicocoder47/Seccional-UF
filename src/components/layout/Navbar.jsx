// src/components/layout/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Button, Box, Stack, Menu, MenuItem, Avatar, Tooltip, Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "@/context/AuthContext";

function NavButton({ to, icon, label, end = false }) {
  return (
    <Button
      component={NavLink}
      to={to}
      end={end}
      startIcon={icon}
      color="inherit"
      sx={{
        borderRadius: 3,
        px: 1.5,
        "&.active": {
          backgroundColor: "rgba(46,125,50,.16)",
          boxShadow: "inset 0 0 0 1px rgba(46,125,50,.25)",
        },
        "&:focus-visible": {
          outline: "2px solid rgba(205,231,206,.75)",
          outlineOffset: "2px",
        },
      }}
    >
      {label}
    </Button>
  );
}

export default function Navbar({ onToggleSidebar }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const open = Boolean(anchorEl);

  const initials = useMemo(() => {
    const n = user?.name || user?.nombre || "U";
    return n.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
  }, [user]);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={1}
      sx={{
        backdropFilter: "saturate(120%) blur(6px)",
        borderBottom: "1px solid rgba(205,231,206,.14)",
      }}
      role="navigation"
      aria-label="Barra de navegación principal"
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: 1, minHeight: 64, px: { xs: 1, sm: 2 } }}>
          {/* Toggle sidebar (mobile) */}
          <Tooltip title="Menú">
            <IconButton
              edge="start"
              color="inherit"
              onClick={onToggleSidebar}
              sx={{ mr: 1 }}
              aria-label="Abrir menú lateral"
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* Brand */}
          <Stack
            component={Link}
            to="/"
            direction="row"
            alignItems="center"
            spacing={1.2}
            sx={{
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
          >
            {logoError ? (
              <Avatar
                alt="Logo Seccional"
                sx={{
                  width: 44,
                  height: 44,
                  fontSize: 14,
                  bgcolor: "rgba(46,125,50,.35)",
                  fontWeight: 800,
                }}
              >
                SG
              </Avatar>
            ) : (
              <Box
                component="img"
                src="/imagen/logo.png"
                alt="Logo Seccional GBAS"
                onError={() => setLogoError(true)}
                sx={{
                  width: 44,
                  height: 44,
                  objectFit: "contain",
                  borderRadius: "50%", // quitá esto si lo querés cuadrado
                  boxShadow: "0 0 0 1px rgba(205,231,206,.18)",
                }}
              />
            )}

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: ".2px",
                whiteSpace: "nowrap",
                ml: 0.3, // respira un poquito con el logo grande
              }}
            >
              Seccional GBAS
            </Typography>
          </Stack>

          <Box sx={{ flex: 1 }} />

          {/* Nav principal (desktop) */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <NavButton to="/" icon={<HomeIcon />} label="Inicio" end />
            <NavButton to="/novedades" icon={<NewspaperIcon />} label="Novedades" />
            <NavButton to="/afiliados" icon={<GroupsIcon />} label="Afiliados" />
            <NavButton to="/afiliados/buscar" icon={<SearchIcon />} label="Buscar por DNI" />
          </Stack>

          {/* Usuario */}
          <Box sx={{ ml: 1 }}>
            {isAuthenticated ? (
              <>
                <Button
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  color="inherit"
                  startIcon={
                    <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                      {initials}
                    </Avatar>
                  }
                  sx={{ borderRadius: 3 }}
                  aria-haspopup="menu"
                  aria-controls={open ? "menu-usuario" : undefined}
                  aria-expanded={open ? "true" : undefined}
                >
                  {user?.name || user?.nombre || "Mi cuenta"}
                </Button>
                <Menu
                  id="menu-usuario"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem component={Link} to="/perfil" onClick={() => setAnchorEl(null)}>
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Perfil
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      logout?.();
                    }}
                  >
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Salir
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 999,
                  px: 2.2,
                  boxShadow: "0 6px 18px rgba(46,125,50,.35)",
                  "&:focus-visible": {
                    outline: "2px solid rgba(205,231,206,.75)",
                    outlineOffset: "2px",
                  },
                }}
              >
                Ingresar
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
