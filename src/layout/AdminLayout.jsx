// src/layout/AdminLayout.jsx
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Container, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import PeopleIcon from "@mui/icons-material/People";

const drawerWidth = 260;

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const nav = [
    { to: "/admin", icon: <DashboardIcon />, label: "Tablero" },
    { to: "/admin/afiliados", icon: <PeopleIcon />, label: "Afiliados" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" color="transparent" elevation={1} sx={{ backdropFilter: "saturate(120%) blur(6px)" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(v => !v)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Seccional UF · Admin</Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" open={open} sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}>
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ opacity: .8, mb: 1 }}>Panel</Typography>
          <Divider sx={{ mb: 1 }} />
          <List>
            {nav.map(item => (
              <ListItemButton key={item.to} component={Link} to={item.to}
                selected={location.pathname === item.to}
                sx={{ borderRadius: 2, mb: .5 }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
