export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        panel: "#f4f7fb",
        accent: "#b9822f",
        "accent-dark": "#8f641f",
        navy: "#12233d",
        "navy-soft": "#1c3356",
        line: "#d9e0ea",
        surface: "#f4f6f8",
        "surface-alt": "#eef2f6",
        mint: "#14b8a6",
        coral: "#f97316",
        gold: "#f59e0b",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 42, 0.08)",
        card: "0 16px 36px rgba(16, 24, 40, 0.08)",
        "card-hover": "0 22px 50px rgba(16, 24, 40, 0.13)",
        lift: "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};
