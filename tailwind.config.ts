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
      /* ═══════════════════════════════════════════════════════════════════
         Icarus Color Palette
         Inspired by the beach at dusk: purples, ambers, sandy neutrals
         ═══════════════════════════════════════════════════════════════════ */
      colors: {
        // Primary palette - from Icarus artwork
        dusk: {
          DEFAULT: "#2a1f3d",
          light: "#3d2d5a",
        },
        twilight: "#5c4a7a",
        horizon: "#c9a227",
        sand: {
          DEFAULT: "#a08060",
          light: "#c4a882",
          pale: "#e8dcc8",
        },
        foam: "#f5f0e6",
        wave: "#3a4a5c",
        feather: "#e8e4dc",
        
        // Legacy mappings (for existing components)
        parchment: {
          DEFAULT: "#f5f0e6",
          warm: "#e8dcc8",
          dark: "#c4a882"
        },
        cream: "#fff9f0",
        ink: {
          DEFAULT: "#1a1425",
          soft: "#4a3f5c",
          light: "#6b5f7a"
        },
        gold: {
          DEFAULT: "#c9a227",
          light: "#e8c36d",
          dark: "#b8923f",
          muted: "#c9b896"
        },
        amber: {
          DEFAULT: "#d4a84b",
          light: "#e8c36d",
          glow: "rgba(201, 162, 39, 0.15)"
        },
        navy: {
          DEFAULT: "#2a1f3d",
          deep: "#1a1425",
          soft: "#3d2d5a"
        },
        sage: "#6b8f71",
        terracotta: "#a65d57",
        mist: "#e8dcc8",
        
        // Legacy compatibility
        cloud: "#f5f0e6",
        midnight: "#1a1425",
        accent: "#c9a227"
      },
      
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        body: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      
      boxShadow: {
        "soft": "0 4px 20px rgba(26, 20, 37, 0.08)",
        "card": "0 8px 32px rgba(26, 20, 37, 0.12), 0 2px 8px rgba(26, 20, 37, 0.04)",
        "elevated": "0 16px 48px rgba(26, 20, 37, 0.16), 0 4px 16px rgba(26, 20, 37, 0.08)",
        "glow": "0 0 40px rgba(201, 162, 39, 0.25)",
        "glow-strong": "0 0 60px rgba(201, 162, 39, 0.4)",
        "inner-light": "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        "button": "0 4px 14px rgba(26, 20, 37, 0.15), 0 2px 6px rgba(26, 20, 37, 0.08)",
        "button-hover": "0 8px 24px rgba(201, 162, 39, 0.25), 0 4px 12px rgba(26, 20, 37, 0.1)"
      },
      
      borderRadius: {
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      
      backgroundImage: {
        "gradient-warm": "linear-gradient(180deg, #f5f0e6 0%, #e8dcc8 100%)",
        "gradient-sky": "linear-gradient(180deg, #2a1f3d 0%, #5c4a7a 40%, #d4a84b 100%)",
        "gradient-golden": "linear-gradient(180deg, rgba(201, 162, 39, 0.1) 0%, transparent 60%)",
        "gradient-vignette": "radial-gradient(ellipse at center, transparent 0%, rgba(26, 20, 37, 0.04) 70%, rgba(26, 20, 37, 0.1) 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(248, 244, 236, 0.95) 0%, rgba(232, 220, 200, 0.9) 100%)",
        "gradient-button": "linear-gradient(135deg, #2a1f3d 0%, #3d2d5a 100%)",
        "gradient-button-gold": "linear-gradient(135deg, #c9a227 0%, #d4a84b 100%)",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(201, 162, 39, 0.1) 50%, transparent 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))"
      },
      
      animation: {
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "float": "float 5s ease-in-out infinite",
        "drift": "gentleDrift 8s ease-in-out infinite"
      },
      
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 40px rgba(201, 162, 39, 0.25)" },
          "50%": { boxShadow: "0 0 60px rgba(201, 162, 39, 0.4)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        gentleDrift: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "50%": { transform: "translateX(10px) rotate(1deg)" }
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
