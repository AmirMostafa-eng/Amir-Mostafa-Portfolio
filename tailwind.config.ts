import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-mid": "var(--bg-mid)",
        "bg-glow": "var(--bg-glow)",
        text: "var(--text)",
        muted: "var(--muted)",
        link: "var(--link)",
        btn: "var(--btn)",
        "btn-text": "var(--btn-text)",
        card: "var(--card)",
        line: "var(--line)",
        deep: "var(--deep)",
        chip: "var(--chip)",
        warn: "var(--warn)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
