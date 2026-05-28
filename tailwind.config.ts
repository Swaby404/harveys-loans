import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f7",
          100: "#d5e0ee",
          200: "#abbfdd",
          300: "#7a9bc8",
          400: "#4f79b2",
          500: "#1e3a5f",
          600: "#182f4d",
          700: "#12233a",
          800: "#0c1827",
          900: "#060c14",
        },
        gold: {
          50: "#fefbeb",
          100: "#fdf3c8",
          200: "#fae78a",
          300: "#f7d44c",
          400: "#f4c21a",
          500: "#d4a20d",
          600: "#a87e09",
          700: "#7d5c06",
          800: "#533d04",
          900: "#2a1f02",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"],
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(135deg, #0c1827 0%, #1e3a5f 50%, #12233a 100%)",
      },
      boxShadow: {
        gold: "0 4px 24px rgba(244,194,26,0.15)",
        card: "0 2px 16px rgba(12,24,39,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
