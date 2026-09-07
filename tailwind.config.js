export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        academic: {
          navy: '#0B1F3A',
          'navy-dark': '#071527',
          'navy-light': '#143158',
          'navy-muted': '#1C3E6E',
          accent: '#2563EB',
          'accent-hover': '#1D4ED8',
          gold: '#D97706',
          'gold-dark': '#B45309',
          'gold-light': '#F59E0B',
          bg: '#F8F9FB',
          border: '#E5E7EB',
          'border-dark': '#CBD5E1',
          text: '#111827',
          'text-secondary': '#4B5563',
          'text-muted': '#6B7280',
        },
        ink: '#111827',
        navy: '#0B1F3A',
        'navy-soft': '#143158',
        line: '#E5E7EB',
        surface: '#F8F9FB',
        'surface-alt': '#F1F5F9',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 2px 6px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -1px rgb(0 0 0 / 0.04)',
        elevated: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};
