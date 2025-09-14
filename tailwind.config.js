/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Enhanced color system with CSS variables support
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Ballroom community colors
        ballroom: {
          red: '#dc2626',
          blue: '#2563eb', 
          yellow: '#eab308',
          gold: '#fbbf24',
          royal: '#4169E1',
          fierce: '#FF1493',
          crown: '#B8860B',
          stage: '#191970'
        },
        // Basquiat art-inspired palette
        basquiat: {
          yellow: '#FFD700',
          blue: '#0066CC',
          red: '#FF0000',
          black: '#000000',
          white: '#FFFFFF',
          crown: '#B8860B'
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
        display: ['Playfair Display', 'serif'],
        script: ['Dancing Script', 'cursive'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Ballroom-inspired animations
        "vogue": {
          '0%, 100%': { transform: 'rotate(-3deg) scale(1)' },
          '50%': { transform: 'rotate(3deg) scale(1.05)' },
        },
        "runway": {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        "crown-glow": {
          '0%, 100%': { boxShadow: '0 0 5px gold' },
          '50%': { boxShadow: '0 0 20px gold, 0 0 30px gold' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "vogue": "vogue 2s ease-in-out infinite",
        "runway": "runway 0.6s ease-out",
        "crown-glow": "crown-glow 2s ease-in-out infinite",
      },
      boxShadow: {
        'ballroom': '0 10px 25px rgba(255, 215, 0, 0.3)',
        'fierce': '0 5px 15px rgba(255, 20, 147, 0.4)',
        'royal': '0 8px 20px rgba(65, 105, 225, 0.3)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
