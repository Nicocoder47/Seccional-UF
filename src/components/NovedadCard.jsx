// src/components/NovedadCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
  Skeleton,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link as RouterLink } from "react-router-dom";

function isExternalUrl(to) {
  return typeof to === "string" && /^https?:\/\//i.test(to);
}

export default function NovedadCard({
  title,
  description,
  icon = null,
  to,
  onClick,
  actionLabel = "Ver más",
  meta,        // ej: "Evento", "14/09"
  image,       // url opcional de cabecera
  loading = false,
}) {
  const clickable = Boolean(to || onClick);
  const external = isExternalUrl(to);

  const actionProps = clickable
    ? external
      ? { component: "a", href: to, target: "_blank", rel: "noopener noreferrer" }
      : { component: RouterLink, to }
    : null;

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid transparent",
        background:
          "linear-gradient(rgba(7,20,14,.80), rgba(7,20,14,.72)) padding-box, " +
          "linear-gradient(180deg, rgba(205,231,206,.16), rgba(46,125,50,.25)) border-box",
        backdropFilter: "blur(4px)",
        boxShadow: "0 8px 24px rgba(0,0,0,.22)",
        transition: "transform .24s ease, box-shadow .24s ease, filter .24s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 36px rgba(0,0,0,.34)",
          filter: "saturate(1.02)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: -20,
          left: -120,
          width: 80,
          height: "200%",
          background:
            "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,.18) 50%, rgba(255,255,255,0) 100%)",
          transform: "rotate(20deg)",
          opacity: 0,
          pointerEvents: "none",
        },
        "&:hover::before": { opacity: 1, animation: "shine 1100ms linear" },
        "@keyframes shine": { "0%": { left: -120 }, "100%": { left: "120%" } },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none", boxShadow: "0 8px 24px rgba(0,0,0,.22)" },
          "&:hover::before": { animation: "none", opacity: 0 },
        },
        "&:focus-within": { outline: "2px solid rgba(205,231,206,.7)", outlineOffset: "2px" },
      }}
    >
      {clickable ? (
        <CardActionArea {...actionProps} sx={{ display: "block" }}>
          {/* Imagen opcional */}
          {image && !loading && (
            <Box
              role="img"
              aria-label={title}
              sx={{
                height: 140,
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderBottom: "1px solid rgba(205,231,206,.12)",
              }}
            />
          )}
          {loading && <Skeleton variant="rectangular" height={140} />}

          <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
            <Stack spacing={1.2} alignItems="center" textAlign="center">
              {meta && !loading && (
                <Chip
                  size="small"
                  label={meta}
                  sx={{
                    bgcolor: "rgba(46,125,50,.18)",
                    color: "var(--text, #e7f0ea)",
                    border: "1px solid rgba(205,231,206,.18)",
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                  }}
                />
              )}

              {!loading && icon && (
                <Box aria-hidden="true" sx={{ fontSize: "2rem", lineHeight: 1, opacity: 0.95 }}>
                  {icon}
                </Box>
              )}

              {loading ? (
                <>
                  <Skeleton width="70%" height={30} sx={{ borderRadius: 1 }} />
                  <Skeleton width="90%" />
                  <Skeleton width="80%" />
                </>
              ) : (
                <>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 800, letterSpacing: 0.2 }} gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(231,240,234,.9)", maxWidth: 560 }}>
                    {description}
                  </Typography>
                </>
              )}
            </Stack>
          </CardContent>
        </CardActionArea>
      ) : (
        <Box sx={{ display: "block" }}>
          {/* Imagen opcional */}
          {image && !loading && (
            <Box
              role="img"
              aria-label={title}
              sx={{
                height: 140,
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderBottom: "1px solid rgba(205,231,206,.12)",
              }}
            />
          )}
          {loading && <Skeleton variant="rectangular" height={140} />}

          <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
            <Stack spacing={1.2} alignItems="center" textAlign="center">
              {meta && !loading && (
                <Chip
                  size="small"
                  label={meta}
                  sx={{
                    bgcolor: "rgba(46,125,50,.18)",
                    color: "var(--text, #e7f0ea)",
                    border: "1px solid rgba(205,231,206,.18)",
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                  }}
                />
              )}

              {!loading && icon && (
                <Box aria-hidden="true" sx={{ fontSize: "2rem", lineHeight: 1, opacity: 0.95 }}>
                  {icon}
                </Box>
              )}

              {loading ? (
                <>
                  <Skeleton width="70%" height={30} sx={{ borderRadius: 1 }} />
                  <Skeleton width="90%" />
                  <Skeleton width="80%" />
                </>
              ) : (
                <>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 800, letterSpacing: 0.2 }} gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(231,240,234,.9)", maxWidth: 560 }}>
                    {description}
                  </Typography>
                </>
              )}
            </Stack>
          </CardContent>
        </Box>
      )}

      {/* Botón de acción */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" justifyContent="center" sx={{ width: "100%" }}>
          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            {...(to
              ? isExternalUrl(to)
                ? { component: "a", href: to, target: "_blank", rel: "noopener noreferrer" }
                : { component: RouterLink, to }
              : {})}
            onClick={onClick}
            disabled={loading}
            sx={{
              borderRadius: 999,
              px: 2.4,
              background: "linear-gradient(90deg, #2e7d32, #388e3c)",
              boxShadow: "0 4px 14px rgba(46,125,50,.4)",
              transition: "transform .18s ease, box-shadow .18s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #388e3c, #43a047)",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 24px rgba(0,0,0,.18)",
              },
              "&:focus-visible": { outline: "2px solid rgba(205,231,206,.85)", outlineOffset: "2px" },
              "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
            }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
