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
        ponsse: {
          yellow: "#FFCD00",
          black: "#0A0A0A",
          dark: "#1A1A1A",
          gray: "#2A2A2A",
          light: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
