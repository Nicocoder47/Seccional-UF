import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";

export default function NovedadCard({ title, description }) {
  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid rgba(205,231,206,.14)",
        backgroundImage: "none",
        backgroundColor: "color-mix(in oklab, var(--bg-2, #1c3a2a), white 3%)",
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 22px rgba(0,0,0,.25)",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          Ver más
        </Button>
      </CardActions>
    </Card>
  );
}
