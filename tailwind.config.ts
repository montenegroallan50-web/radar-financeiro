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
        xs: ["13px", "18px"],
        sm: ["15px", "22px"],
        base: ["17px", "26px"],
        lg: ["19px", "28px"],
        xl: ["21px", "30px"],
        "2xl": ["26px", "34px"],
        "3xl": ["32px", "38px"],
      },
      boxShadow: {
        card: "0 2px 14px 0 rgba(0,0,0,0.08)",
        "card-lg": "0 4px 24px 0 rgba(0,0,0,0.11)",
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