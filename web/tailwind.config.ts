import type { Config } from "tailwindcss";

/** Semantic tokens map to CSS variables (see src/index.css) so light/dark are tuned
 *  independently, not inverted. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        border: "var(--border)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        primary: { DEFAULT: "var(--primary)", hover: "var(--primary-hover)" },
        healthy: "var(--healthy)",
        warning: "var(--warning)",
        critical: "var(--critical)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1rem" },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35)",
        lift: "0 2px 6px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.12)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 var(--primary)" },
          "70%": { boxShadow: "0 0 0 8px rgba(79,107,237,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(79,107,237,0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        pulseRing: "pulseRing 1.8s ease-out 2",
      },
    },
  },
  plugins: [],
} satisfies Config;
