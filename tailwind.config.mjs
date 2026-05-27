/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        asphalt: '#07090f',
        carbon: '#10131c',
        panel: '#171b26',
        line: '#303747',
        mint: '#3ff5a3',
        coral: '#ff6b5e',
        amber: '#ffc857',
        cyan: '#6ee7ff',
      },
      fontFamily: {
        display: ['Bahnschrift', 'Aptos Display', 'Segoe UI', 'sans-serif'],
        body: ['Aptos', 'Segoe UI', 'Noto Sans', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 36px rgba(63, 245, 163, 0.16)',
      },
    },
  },
  plugins: [],
};
