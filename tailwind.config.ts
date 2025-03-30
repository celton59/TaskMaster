import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif']
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Paleta de neón
        neon: {
          dark: "#061621",
          darker: "#020B10",
          medium: "#0C2840",
          light: "#0E3A5A",
          accent: "#00E1FF",
          hover: "#00D1FF",
          text: "#E0F8FF",
          // Colores neón adicionales
          purple: "#bb00ff",
          pink: "#ff00e6",
          green: "#00ff9d",
          yellow: "#ffea00",
          orange: "#ff6d00",
          red: "#ff2d6d"
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "gold-shimmer": {
          "0%, 100%": {
            backgroundPosition: "0% 50%"
          },
          "50%": {
            backgroundPosition: "100% 50%"
          }
        },
        "neon-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(0, 225, 255, 0.5)",
            borderColor: "rgba(0, 225, 255, 0.8)"
          },
          "50%": {
            boxShadow: "0 0 15px rgba(0, 225, 255, 0.8)",
            borderColor: "rgba(0, 225, 255, 1)"
          }
        },
        "neon-glow-purple": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(187, 0, 255, 0.5)",
            borderColor: "rgba(187, 0, 255, 0.8)"
          },
          "50%": {
            boxShadow: "0 0 15px rgba(187, 0, 255, 0.8)",
            borderColor: "rgba(187, 0, 255, 1)"
          }
        },
        "neon-glow-pink": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(255, 0, 230, 0.5)",
            borderColor: "rgba(255, 0, 230, 0.8)"
          },
          "50%": {
            boxShadow: "0 0 15px rgba(255, 0, 230, 0.8)",
            borderColor: "rgba(255, 0, 230, 1)"
          }
        },
        "neon-glow-green": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(0, 255, 157, 0.5)",
            borderColor: "rgba(0, 255, 157, 0.8)"
          },
          "50%": {
            boxShadow: "0 0 15px rgba(0, 255, 157, 0.8)",
            borderColor: "rgba(0, 255, 157, 1)"
          }
        },
        "neon-flicker": {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": {
            opacity: "1",
            filter: "brightness(1)"
          },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": {
            opacity: "0.6",
            filter: "brightness(0.8)"
          }
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: "1"
          },
          "50%": {
            opacity: "0.7"
          }
        },
        "scanning-line": {
          "0%": {
            transform: "translateY(-100%)"
          },
          "100%": {
            transform: "translateY(500%)"
          }
        },
        "rotate-slow": {
          "0%": {
            transform: "rotate(0deg)"
          },
          "100%": {
            transform: "rotate(360deg)"
          }
        },
        "data-flow": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(100%)"
          }
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-up": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "slide-right": {
          "0%": {
            transform: "translateX(-20px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gold-shimmer": "gold-shimmer 3s ease infinite",
        "neon-glow": "neon-glow 2s ease-in-out infinite",
        "neon-glow-purple": "neon-glow-purple 2s ease-in-out infinite",
        "neon-glow-pink": "neon-glow-pink 2s ease-in-out infinite",
        "neon-glow-green": "neon-glow-green 2s ease-in-out infinite",
        "neon-flicker": "neon-flicker 5s linear infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "scanning-line": "scanning-line 3s linear infinite",
        "rotate-slow": "rotate-slow 8s linear infinite",
        "data-flow": "data-flow 3s linear infinite",
        "float": "float 5s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-up": "scale-up 0.4s ease-out forwards",
        "slide-right": "slide-right 0.4s ease-out forwards"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
