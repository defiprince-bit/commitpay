import type { Config } from "tailwindcss";
export default {
  darkMode: ["class", "html:not(.light)"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { bg:"rgb(var(--bg) / <alpha-value>)", mkbg:"rgb(var(--mkbg) / <alpha-value>)", surface:"rgb(var(--surface) / <alpha-value>)", surface2:"rgb(var(--surface2) / <alpha-value>)", "surface-2":"rgb(var(--surface2) / <alpha-value>)", border:"rgb(var(--line) / <alpha-value>)", text:"rgb(var(--ink) / <alpha-value>)", "text-muted":"rgb(var(--muted) / <alpha-value>)", line:"rgb(var(--line) / <alpha-value>)", ink:"rgb(var(--ink) / <alpha-value>)", muted:"rgb(var(--muted) / <alpha-value>)",
      brand:"#0070E0", "brand-soft":"#0070E01F", danger:"#E11D48", "danger-soft":"#E11D481A", ok:"#0D9488", "ok-soft":"#0D94881A" },
    borderRadius: { card: "20px" },
    boxShadow: { hero: "0 0 0 1px #0070E033, 0 12px 48px -16px #0070E066", card: "0 1px 0 0 #ffffff08 inset, 0 8px 24px -16px #00000080" },
    fontFamily: { sans: ["var(--font-geist-sans)","system-ui","sans-serif"], display: ["var(--font-geist-sans)","system-ui","sans-serif"], serif: ["var(--font-serif)","Georgia","serif"], mono: ["var(--font-geist-mono)","ui-monospace","monospace"] } } },
} satisfies Config;
