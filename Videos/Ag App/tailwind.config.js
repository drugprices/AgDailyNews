/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        card: "#FFFFFF",
        textPrimary: "#111827",
        textMuted: "#6B7280",
        accentGreen: "#10B981",
        accentRed: "#EF4444",
        ctaBlue: "#2563EB"
      }
    }
  },
  plugins: []
};
