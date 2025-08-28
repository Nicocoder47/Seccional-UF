// src/components/layout/Footer.jsx
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Container, Grid, Stack, Typography, Link, Divider, IconButton,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import EmailIcon from "@mui/icons-material/Email";
import PlaceIcon from "@mui/icons-material/Place";

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 6, borderTop: "1px solid rgba(205,231,206,.14)" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <ShieldIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Seccional UF
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Comprometidos con tus derechos. Gestionamos afiliaciones, trámites y beneficios con calidez humana.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <IconButton size="small" aria-label="Facebook" color="inherit"><FacebookIcon fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="Instagram" color="inherit"><InstagramIcon fontSize="small" /></IconButton>
              <IconButton size="small" aria-label="X" color="inherit"><XIcon fontSize="small" /></IconButton>
            </Stack>
          </Grid>

          {/* Enlaces */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              Navegación
            </Typography>
            <Stack spacing={0.6} sx={{ mt: 1 }}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover">Inicio</Link>
              <Link component={RouterLink} to="/novedades" color="inherit" underline="hover">Novedades</Link>
              <Link component={RouterLink} to="/afiliados" color="inherit" underline="hover">Afiliados</Link>
              <Link component={RouterLink} to="/afiliados/buscar" color="inherit" underline="hover">Buscar por DNI</Link>
            </Stack>
          </Grid>

          {/* Contacto */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              Contacto
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <PlaceIcon fontSize="small" />
                <Typography variant="body2">Remedios de Escalada, Buenos Aires</Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <EmailIcon fontSize="small" />
                <Link href="mailto:contacto@seccionaluf.org" underline="hover" color="inherit">
                  contacto@seccionaluf.org
                </Link>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <ShieldIcon fontSize="small" />
                <Link component={RouterLink} to="/contacto" underline="hover" color="inherit">
                  Formulario de contacto
                </Link>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ opacity: 0.25 }} />

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Seccional UF — Todos los derechos reservados
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link component={RouterLink} to="/privacidad" underline="hover" color="text.secondary">
              Privacidad
            </Link>
            <Link component={RouterLink} to="/terminos" underline="hover" color="text.secondary">
              Términos
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
