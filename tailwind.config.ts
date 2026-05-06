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
        primary: "#0F6E56",
        "primary-dark": "#0a5240",
        "primary-light": "#e8f5f1",
        background: "#f4f6f4",
        surface: "#ffffff",
        "text-primary": "#1a1a1a",
        "text-secondary": "#6b7280",
        "text-muted": "#9ca3af",
        border: "#e5e7eb",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#10b981",
        offwhite: "#f4f6f4",
        "brand-pale": "#e8f5f1",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["14px", "20px"],
        base: ["16px", "24px"],
        lg: ["18px", "28px"],
        xl: ["20px", "28px"],
        "2xl": ["24px", "32px"],
        "3xl": ["30px", "36px"],
      },
      spacing: {
        header: "56px",
        footer: "52px",
        "touch-min": "44px",
        "px-screen": "16px",
      },
      maxWidth: {
        mobile: "390px",
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;