import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#050506",
        deep: "#020203",
        elevated: "#0a0a0c",
        foreground: "#EDEDEF",
        muted: "#8A8F98",
        accent: "#5E6AD2"
      },
      fontFamily: {
        sans: ["Inter", "Geist Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glass:
          "0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)",
        glassHover:
          "0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5), 0 0 80px rgba(94,106,210,0.1)"
      }
    }
  },
  plugins: []
};

export default config;
