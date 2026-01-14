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
        /* Core palette - warm parchment meets deep ink */
        parchment: {
          DEFAULT: "#faf6f0",
          warm: "#f5efe5",
          dark: "#e8e0d4"
        },
        cream: "#fff9f0",
        ink: {
          DEFAULT: "#1a1612",
          soft: "#2d2620",
          light: "#4a4238"
        },
        
        /* Accent colors - golden hour warmth */
        gold: {
          DEFAULT: "#d4a853",
          light: "#e8c97a",
          dark: "#b8923f",
          muted: "#c9b896"
        },
        amber: {
          DEFAULT: "#c67b2e",
          glow: "rgba(212, 168, 83, 0.15)"
        },
        
        /* Deep tones - Rembrandt shadows */
        navy: {
          DEFAULT: "#1e2a3a",
          deep: "#141c26",
          soft: "#2a3a4d"
        },
        
        /* Muted accents */
        sage: "#7a8b7a",
        terracotta: "#c4785a",
        mist: "#e8e4dc",
        
        /* Legacy compatibility */
        cloud: "#faf6f0",
        midnight: "#1a1612",
        accent: "#d4a853"
      },
      fontFamily: {
        display: ["Avenir Next", "Avenir", "Georgia", "serif"],
        body: ["Avenir Next", "Avenir", "Helvetica Neue", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        "soft": "0 4px 20px rgba(26, 22, 18, 0.06)",
        "card": "0 8px 32px rgba(26, 22, 18, 0.08), 0 2px 8px rgba(26, 22, 18, 0.04)",
        "elevated": "0 16px 48px rgba(26, 22, 18, 0.12), 0 4px 16px rgba(26, 22, 18, 0.06)",
        "glow": "0 0 40px rgba(212, 168, 83, 0.2)",
        "glow-strong": "0 0 60px rgba(212, 168, 83, 0.35)",
        "inner-light": "inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        "button": "0 4px 14px rgba(26, 22, 18, 0.15), 0 2px 6px rgba(26, 22, 18, 0.08)",
        "button-hover": "0 8px 24px rgba(212, 168, 83, 0.25), 0 4px 12px rgba(26, 22, 18, 0.1)"
      },
      borderRadius: {
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      backgroundImage: {
        "gradient-warm": "linear-gradient(135deg, #faf6f0 0%, #fff9f0 50%, #f5efe5 100%)",
        "gradient-golden": "linear-gradient(180deg, rgba(212, 168, 83, 0.08) 0%, transparent 60%)",
        "gradient-vignette": "radial-gradient(ellipse at center, transparent 0%, rgba(26, 22, 18, 0.03) 70%, rgba(26, 22, 18, 0.08) 100%)",
        "gradient-light-beam": "linear-gradient(135deg, rgba(255, 249, 240, 0.9) 0%, rgba(212, 168, 83, 0.1) 50%, transparent 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 246, 240, 0.95) 100%)",
        "gradient-button": "linear-gradient(135deg, #1a1612 0%, #2d2620 100%)",
        "gradient-button-gold": "linear-gradient(135deg, #d4a853 0%, #b8923f 100%)",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(212, 168, 83, 0.1) 50%, transparent 100%)"
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "shimmer": "shimmer 2s infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite"
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 168, 83, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 168, 83, 0.4)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)"
      }
    }
  },
  plugins: []
};

export default config;
