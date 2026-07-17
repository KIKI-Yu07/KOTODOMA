import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(270 20% 88%)",
        input: "hsl(270 20% 88%)",
        ring: "hsl(265 85% 65%)",
        background: "hsl(270 30% 98%)",
        foreground: "hsl(270 15% 12%)",
        primary: {
          DEFAULT: "hsl(265 85% 65%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(270 20% 94%)",
          foreground: "hsl(270 15% 15%)",
        },
        destructive: {
          DEFAULT: "hsl(358 80% 44%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(270 15% 94%)",
          foreground: "hsl(270 10% 45%)",
        },
        accent: {
          DEFAULT: "hsl(270 50% 92%)",
          foreground: "hsl(265 85% 60%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(270 15% 12%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(270 15% 12%)",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "'PingFang SC'", "'Noto Sans JP'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
