/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        panel: '#f4f7fb',
        brand: '#2563eb',
        night: '#0f172a',
        sidebar: '#111827',
        cloud: '#eef2f7',
        mint: '#14b8a6',
        coral: '#f97316',
        gold: '#f59e0b',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 32, 42, 0.08)',
        lift: '0 20px 60px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
