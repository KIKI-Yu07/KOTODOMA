import type { Config } from "tailwindcss";

export default {
  darkMode: false,
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)", "primary-subtle": "var(--color-primary-subtle)",
        bg: "var(--color-bg)", surface: "var(--color-surface)", "surface-subtle": "var(--color-surface-subtle)",
        main: "var(--color-text)", sub: "var(--color-text-secondary)", hint: "var(--color-text-tertiary)",
        border: "var(--color-border)",
        success: "var(--color-success)", "success-subtle": "var(--color-success-subtle)",
        warning: "var(--color-warning)", "warning-subtle": "var(--color-warning-subtle)",
        danger: "var(--color-danger)", "danger-subtle": "var(--color-danger-subtle)",
      },
      fontFamily: {
        serif: ["'Noto Serif JP'", "'Noto Sans JP'", "serif"],
        sans: ["'Noto Sans JP'", "'Noto Sans SC'", "system-ui", "sans-serif"],
      },
      borderRadius: { lg: "20px", md: "14px", sm: "10px" },
    },
  },
  plugins: [],
} satisfies Config;
