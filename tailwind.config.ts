import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        lg: "1024px",
        xl: "1200px",
        "2xl": "1320px"
      }
    },
    extend: {
      colors: {
        ink: "#0f172a",
        cloud: "#f8fafc",
        mist: "#e2e8f0",
        accent: "#f97316",
        midnight: "#111827"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(15, 23, 42, 0.18)",
        card: "0 20px 40px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        xl: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
