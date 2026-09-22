/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        panel: "var(--color-panel)",
        panelStrong: "var(--color-panel-strong)",
        signal: "var(--color-signal)",
        urgent: "var(--color-urgent)",
        informative: "var(--color-informative)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        console: "0 24px 70px rgba(0, 0, 0, 0.28)",
        focus: "0 0 0 3px rgba(155, 227, 212, 0.25)",
      },
    },
  },
  plugins: [],
};
