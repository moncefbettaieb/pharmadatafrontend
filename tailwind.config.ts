import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        "indigo-600": "#4F46E5",
        "aqua-500": "#06B6D4",
      },
      backgroundImage: {
        logo: "url('/branding/logo-icon.svg')",
      },
    },
  },
  plugins: [],
} satisfies Config;
