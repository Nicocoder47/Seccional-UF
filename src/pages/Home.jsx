import React, { useEffect, useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import NovedadCard from "@/components/NovedadCard";

// MUI
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Paper,
  Grid,
  Link,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";

const tryPlay = (v) => v?.play?.().catch(() => { /* autoplay may be blocked; ignore */ });

export default function Home() {
  const videoRef = useRef(null);

  // Reintenta reproducir al tener datos y al volver a la pestaña
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const reduceM = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const onLoadedData = () => {
      if (!reduceM?.matches) tryPlay(v);
    };

    const onVisibility = () => {
      if (!document.hidden && !reduceM?.matches) tryPlay(v);
    };

    v.addEventListener("loadeddata", onLoadedData);
    document.addEventListener("visibilitychange", onVisibility);

    // si ya está listo cuando montamos
    if (v.readyState >= 2 && !reduceM?.matches) {
      tryPlay(v);
    }

    return () => {
      v.removeEventListener("loadeddata", onLoadedData);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const novedades = [
    {
      title: "Vení a conocer nuestras instalaciones",
      description:
        "Abrimos las puertas para que todos los afiliados y sus familias recorran la seccional.",
    },
    {
      title: "Calendario Guardapolvo",
      description:
        "Consultá el cronograma para retirar tu guardapolvo escolar de manera organizada.",
    },
    {
      title: "Día del Niño",
      description:
        "Un festejo especial para los más chicos con juegos, regalos y sorpresas.",
    },
  ];

  return (
    <>
      {/* ======= HERO con VIDEO de fondo ======= */}
      <Box
        component="section"
        aria-labelledby="home-hero-title"
        onPointerDown={() => tryPlay(videoRef.current)} // fallback por gesto del usuario
        sx={{
          position: "relative",
          minHeight: { xs: "78vh", md: "86vh" },
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          isolation: "isolate", // crea stacking context propio
        }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/imagen/fondo_01.jpg" // opcional
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.02)",
            zIndex: 0, // base
          }}
        >
          <source src="/video.mp4" type="video/mp4" />
          Tu navegador no soporta video en HTML5.
        </video>

        {/* Overlay para legibilidad */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1, // encima del video
            background:
              "linear-gradient(180deg, rgba(14,26,19,.76) 0%, rgba(14,26,19,.62) 40%, rgba(14,26,19,.84) 100%)",
          }}
        />

        {/* Contenido */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            {/* Kicker (oculto en xs para no duplicar marca con AppBar) */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                bgcolor: "rgba(46,125,50,.14)",
                border: "1px solid rgba(205,231,206,.14)",
                width: "fit-content",
                mx: "auto",
              }}
            >
              <ShieldIcon fontSize="small" />
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                Seccional UF
              </Typography>
            </Stack>

            {/* Glass content */}
            <Paper
              elevation={3}
              sx={{
                px: { xs: 2.2, md: 4 },
                py: { xs: 1.8, md: 3 },
                borderRadius: 3,
                border: "1px solid rgba(205,231,206,.14)",
                backgroundImage: "none",
                backgroundColor: "color-mix(in oklab, var(--bg-2, #1c3a2a), white 3%)",
              }}
            >
              <Typography
                id="home-hero-title"
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  textShadow: "0 1px 2px rgba(0,0,0,.25)",
                  fontSize: "clamp(2rem, 5.2vw, 3.4rem)",
                }}
              >
                Seccional Gran Buenos Aires Sud
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 760, mx: "auto", mt: 1.3 }}
              >
                Comprometidos con tus derechos. Gestionamos afiliaciones, trámites y
                beneficios con calidez humana.
              </Typography>
            </Paper>

            {/* Acciones */}
            <Grid
              container
              spacing={1.2}
              sx={{ maxWidth: 760, mx: "auto" }}
              justifyContent="center"
            >
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/afiliados"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  👥 Ir a Afiliados
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/afiliados/buscar"
                  fullWidth
                  variant="outlined"
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  🔍 Consultar por DNI
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/tramites"
                  fullWidth
                  variant="outlined"
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  🗂️ Iniciar Trámite
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to="/contacto"
                  fullWidth
                  size="large"
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#f74f8a",
                    "&:hover": { bgcolor: "#f75c92" },
                    boxShadow: "0 10px 28px rgba(247,79,138,.25)",
                  }}
                >
                  🗣️ Contanos cómo estás
                </Button>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.9 }}>
              📍 Remedios de Escalada, Buenos Aires
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* ======= NOVEDADES ======= */}
      <Box component="section" aria-labelledby="news-title" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography
            id="news-title"
            variant="h5"
            sx={{ fontWeight: 800, mb: 2.5, textAlign: "center" }}
          >
            Últimas Novedades
          </Typography>

        <Grid container spacing={2}>
            {novedades.map((n, i) => (
              <Grid key={i} item xs={12} sm={6} md={4}>
                <NovedadCard title={n.title} description={n.description} />
              </Grid>
            ))}
          </Grid>

          <Stack alignItems="center" sx={{ mt: 3 }}>
            <Link component={RouterLink} to="/novedades" underline="hover" color="text.secondary">
              Ver más novedades →
            </Link>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
