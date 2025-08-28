// src/components/NovedadCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link as RouterLink } from "react-router-dom";

export default function NovedadCard({ title, description, icon = null, to, onClick }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        border: "1px solid rgba(205,231,206,.12)",
        backgroundColor: "rgba(7,20,14,.72)",
        backdropFilter: "blur(4px)",
        boxShadow: "0 8px 24px rgba(0,0,0,.22)",
        transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 32px rgba(0,0,0,.32)",
          borderColor: "rgba(205,231,206,.18)",
        },
        "&:focus-within": {
          outline: "2px solid rgba(205,231,206,.7)",
          outlineOffset: "2px",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
        <Stack spacing={1.2} alignItems="center" textAlign="center">
          {icon && (
            <Box
              aria-hidden="true"
              sx={{ fontSize: "2rem", lineHeight: 1, opacity: 0.95, mb: 0.25 }}
            >
              {icon}
            </Box>
          )}

          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 800, letterSpacing: 0.2 }}
            gutterBottom
          >
            {title}
          </Typography>

          <Typography variant="body2" sx={{ color: "rgba(231,240,234,.9)", maxWidth: 560 }}>
            {description}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" justifyContent="center" sx={{ width: "100%" }}>
          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            component={to ? RouterLink : "button"}
            to={to}
            onClick={onClick}
            sx={{
              borderRadius: 999,
              px: 2.4,
              background: "linear-gradient(90deg, #2e7d32, #388e3c)",
              boxShadow: "0 4px 14px rgba(46,125,50,.4)",
              "&:hover": {
                background: "linear-gradient(90deg, #388e3c, #43a047)",
              },
              "&:focus-visible": {
                outline: "2px solid rgba(205,231,206,.85)",
                outlineOffset: "2px",
              },
            }}
          >
            Ver más
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
