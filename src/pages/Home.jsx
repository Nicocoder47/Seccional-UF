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
  Chip,
} from "@mui/material";

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
          minHeight: { xs: "76vh", md: "84vh" },
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          isolation: "isolate",
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
          poster="/imagen/fondo_01.jpg"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.02)",
            zIndex: 0,
          }}
        >
          <source src="/video.mp4" type="video/mp4" />
          Tu navegador no soporta video en HTML5.
        </video>

        {/* Overlay para legibilidad (ligero) */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(14,26,19,.55) 0%, rgba(14,26,19,.48) 45%, rgba(14,26,19,.70) 100%)",
          }}
        />

        {/* Contenido */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Stack spacing={2.25} alignItems="center" textAlign="center">
            {/* Kicker compacto */}
            <Chip
              label="Tu Seccional"
              size="small"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                bgcolor: "rgba(46,125,50,.18)",
                color: "var(--text, #e7f0ea)",
                border: "1px solid rgba(205,231,206,.14)",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                backdropFilter: "blur(3px)",
              }}
            />

            {/* Glass content más sutil */}
            <Paper
              elevation={0}
              sx={{
                px: { xs: 2, md: 3 },
                py: { xs: 1.4, md: 2 },
                borderRadius: 4,
                border: "1px solid rgba(205,231,206,.12)",
                backgroundColor: "rgba(7,20,14,.32)", // más transparente
                backdropFilter: "blur(4px)",
                maxWidth: "min(720px, 100%)",
              }}
            >
              <Typography
                id="home-hero-title"
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 0.2,
                  textShadow: "0 1px 2px rgba(0,0,0,.25)",
                  fontSize: "clamp(1.6rem, 4.2vw, 2.4rem)", // más discreto
                  mb: 0.6,
                }}
              >
                Seccional Gran Buenos Aires Sud
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: 680,
                  mx: "auto",
                  color: "rgba(231,240,234,.88)",
                  lineHeight: 1.55,
                }}
              >
                Ayudando a las y los compañeros, trabajando junto a la{" "}
                <strong>Lista Verde</strong>. Cercanía, gestión y compromiso.
              </Typography>
            </Paper>

            {/* Acciones */}
            <Grid
              container
              spacing={1.2}
              sx={{ maxWidth: 720, mx: "auto" }}
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
