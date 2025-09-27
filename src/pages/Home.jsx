import React, { useEffect, useRef, useState, useMemo } from "react";
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

const tryPlay = (v) => v?.play?.().catch(() => { /* autoplay puede bloquearse; ignorar */ });

/** Hook simple para revelar elementos al hacer scroll */
function useReveal(selector = "[data-reveal]", rootMargin = "0px 0px -12% 0px") {
  useEffect(() => {
    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduce) return; // no animar si el usuario lo pide

    const els = Array.from(document.querySelectorAll(selector));
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          obs.unobserve(e.target);
        }
      }
    }, { rootMargin, threshold: 0.08 });

    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [selector, rootMargin]);
}

export default function Home() {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Activa el video un instante después para evitar "flash" del poster
  useEffect(() => {
    const tm = setTimeout(() => setShowVideo(true), 300); // delay corto
    return () => clearTimeout(tm);
  }, []);

  // Reintentar reproducir al tener datos y al volver a la pestaña
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const reduceM = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const wantsMotion = !(reduceM && reduceM.matches);

    const onLoadedData = () => {
      setVideoReady(true);
      if (wantsMotion) tryPlay(v);
    };
    const onVisibility = () => {
      if (!document.hidden && wantsMotion) tryPlay(v);
    };

    v.addEventListener("loadeddata", onLoadedData);
    document.addEventListener("visibilitychange", onVisibility);

    if (v.readyState >= 2 && wantsMotion) {
      setVideoReady(true);
      tryPlay(v);
    }

    return () => {
      v.removeEventListener("loadeddata", onLoadedData);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [showVideo]);

  // Revelar secciones en scroll
  useReveal();

  const prefersReduce = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );

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
          // Fallback: poster + gradiente mientras el video no está listo
          backgroundImage: !videoReady
            ? `linear-gradient(rgba(14,26,19,.55), rgba(14,26,19,.7)), url("/imagen/hero_poster.jpg")`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Video (se monta luego de un pequeño delay para evitar parpadeos) */}
        {showVideo && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/imagen/hero_poster.jpg"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(1.02)",
              opacity: videoReady ? 1 : 0,               // desvanecido
              transition: "opacity 520ms ease",
              zIndex: 0,
            }}
          >
            <source src="/video.mp4" type="video/mp4" />
            Tu navegador no soporta video en HTML5.
          </video>
        )}

        {/* Overlay para legibilidad */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(14,26,19,.48) 0%, rgba(14,26,19,.44) 45%, rgba(14,26,19,.70) 100%)",
          }}
        />

        {/* Contenido */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Stack
            spacing={2.25}
            alignItems="center"
            textAlign="center"
            data-reveal
            sx={{
              opacity: 0,
              transform: "translateY(10px)",
              transition: prefersReduce ? "none" : "opacity .6s ease, transform .6s ease",
              "&.is-revealed": { opacity: 1, transform: "none" },
            }}
          >
            {/* Kicker compacto con leve brillo */}
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
                boxShadow: "0 0 0 0 rgba(46,125,50,.0)",
                animation: prefersReduce ? "none" : "pulseGlow 3.6s ease-in-out infinite",
                "@keyframes pulseGlow": {
                  "0%,100%": { boxShadow: "0 0 0 0 rgba(46,125,50,.0)" },
                  "50%": { boxShadow: "0 0 18px 2px rgba(46,125,50,.25)" },
                },
              }}
            />

            {/* Glass content sutil */}
            <Paper
              elevation={0}
              sx={{
                px: { xs: 2, md: 3 },
                py: { xs: 1.4, md: 2 },
                borderRadius: 4,
                border: "1px solid rgba(205,231,206,.12)",
                backgroundColor: "rgba(7,20,14,.32)",
                backdropFilter: "blur(4px)",
                maxWidth: "min(760px, 100%)",
              }}
            >
              <Typography
                id="home-hero-title"
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 0.2,
                  textShadow: "0 1px 2px rgba(0,0,0,.25)",
                  fontSize: "clamp(1.7rem, 4.3vw, 2.6rem)",
                  mb: 0.6,
                }}
              >
                Seccional Gran Buenos Aires Sud
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: 720,
                  mx: "auto",
                  color: "rgba(231,240,234,.9)",
                  lineHeight: 1.55,
                }}
              >
                Ayudando a las y los compañeros, trabajando junto a la{" "}
                <strong>Lista Verde</strong>. Cercanía, gestión y compromiso.
              </Typography>
            </Paper>

            {/* Acciones con micro-interacciones */}
            <Grid
              container
              spacing={1.2}
              sx={{ maxWidth: 760, mx: "auto" }}
              justifyContent="center"
            >
              {[
                {
                  to: "/afiliados",
                  label: "👥 Ir a Afiliados",
                  variant: "contained",
                },
                {
                  to: "/afiliados/buscar",
                  label: "🔍 Consultar por DNI",
                  variant: "outlined",
                },
                {
                  to: "/tramites",
                  label: "🗂️ Iniciar Trámite",
                  variant: "outlined",
                },
                {
                  to: "/contacto",
                  label: "🗣️ Contanos cómo estás",
                  variant: "contained",
                  sx: {
                    bgcolor: "#f74f8a",
                    "&:hover": { bgcolor: "#f75c92" },
                    boxShadow: "0 10px 28px rgba(247,79,138,.25)",
                  },
                },
              ].map((btn, i) => (
                <Grid key={i} item xs={12} sm={6}>
                  <Button
                    component={RouterLink}
                    to={btn.to}
                    fullWidth
                    variant={btn.variant}
                    size="large"
                    sx={{
                      borderRadius: 2,
                      transform: "translateY(0)",
                      transition: prefersReduce ? "none" : "transform .18s ease, box-shadow .18s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 24px rgba(0,0,0,.18)",
                      },
                      ...(btn.sx || {}),
                    }}
                  >
                    {btn.label}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.95 }}>
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
            data-reveal
            sx={{
              fontWeight: 800,
              mb: 2.5,
              textAlign: "center",
              opacity: 0,
              transform: "translateY(10px)",
              transition: prefersReduce ? "none" : "opacity .6s ease, transform .6s ease",
              "&.is-revealed": { opacity: 1, transform: "none" },
            }}
          >
            Últimas Novedades
          </Typography>

          <Grid container spacing={2}>
            {novedades.map((n, i) => (
              <Grid
                key={i}
                item
                xs={12}
                sm={6}
                md={4}
                data-reveal
                style={{ opacity: 0, transform: "translateY(12px)" }}
                className="reveal-card"
              >
                <NovedadCard title={n.title} description={n.description} />
              </Grid>
            ))}
          </Grid>

          <Stack
            alignItems="center"
            sx={{ mt: 3 }}
            data-reveal
            style={{ opacity: 0, transform: "translateY(10px)" }}
          >
            <Link component={RouterLink} to="/novedades" underline="hover" color="text.secondary">
              Ver más novedades →
            </Link>
          </Stack>
        </Container>
      </Box>

      {/* Estilos puntuales para revelar cards */}
      <style>{`
        .is-revealed { opacity: 1 !important; transform: none !important; }
        .reveal-card.is-revealed { transition: opacity .55s ease, transform .55s ease; }
      `}</style>
    </>
  );
}
