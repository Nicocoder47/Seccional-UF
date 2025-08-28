// src/theme.js
import { createTheme } from "@mui/material/styles";

const palette = {
  bg: "#0e1a13",
  bg2: "#1c3a2a",
  accent: "#2e7d32",
  text: "#e7f0ea",
  text2: "#cde7ce",
  header: "#163023",
  divider: "rgba(205,231,206,.18)",
  border: "rgba(205,231,206,.14)",
  glow: "rgba(46,125,50,.35)",
};

const theme = createTheme({
  // Si tu MUI lo soporta, mantené esta línea. Si da error, eliminála.
  cssVariables: true,

  palette: {
    mode: "dark",
    primary: { main: palette.accent },
    background: {
      default: palette.bg,
      paper: palette.bg2,
    },
    text: {
      primary: palette.text,
      secondary: palette.text2,
    },
    divider: palette.divider,
  },

  shape: { borderRadius: 14 },

  // Sombras suavizadas y coherentes
  shadows: [
    "none",
    "0 1px 2px rgba(0,0,0,.18)",
    "0 2px 6px rgba(0,0,0,.2)",
    "0 4px 10px rgba(0,0,0,.22)",
    ...Array(21).fill("0 6px 18px rgba(0,0,0,.24)"),
  ],

  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Helvetica Neue", sans-serif',
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": { boxSizing: "border-box" },
        "::selection": { background: "rgba(46,125,50,.35)" },
        ":focus-visible": {
          outline: `2px solid ${palette.accent}`,
          outlineOffset: "2px",
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
          paddingBlock: 10,
        },
        containedPrimary: {
          boxShadow: `0 6px 18px ${palette.glow}`,
        },
      },
      variants: [
        {
          props: { variant: "soft" },
          style: {
            backgroundColor: "#22422f",
            color: palette.text,
            border: `1px solid ${palette.border}`,
            "&:hover": { backgroundColor: "#1e3b2a" },
          },
        },
      ],
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${palette.border}`,
          backgroundImage: "none",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderBottom: `1px solid ${palette.border}`,
          backdropFilter: "saturate(120%) blur(6px)",
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${palette.border}`,
          borderRadius: 14,
        },
        columnHeaders: {
          backgroundColor: palette.header,
          borderBottom: `1px solid ${palette.border}`,
        },
        row: {
          "&:hover": {
            backgroundColor: "rgba(46,125,50,.08)",
          },
        },
      },
      defaultProps: {
        density: "comfortable",
      },
    },

    MuiTextField: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1f3b2b",
          border: `1px solid ${palette.border}`,
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          color: palette.text2,
          textDecorationColor: "rgba(205,231,206,.45)",
          "&:hover": { color: palette.text, textDecorationColor: palette.text },
        },
      },
    },
  },
});

export default theme;
