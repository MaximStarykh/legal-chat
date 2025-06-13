/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        secondary: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
        },
        background: {
          DEFAULT: "#F9FAFB",
          dark: "#F3F4F6",
        },
        text: {
          DEFAULT: "#1F2937",
          light: "#6B7280",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [
    typography,
    forms,
  ],
}
