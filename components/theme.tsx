"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
export type Theme = "dark" | "light";
const read = (): Theme => typeof document !== "undefined" && document.documentElement.classList.contains("light") ? "light" : "dark";
export function useTheme() {
  const [t, setT] = useState<Theme>("dark");
  useEffect(() => {
    setT(read());
    const ob = new MutationObserver(() => setT(read()));
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => ob.disconnect();
  }, []);
  const set = (n: Theme) => { document.documentElement.classList.toggle("light", n === "light"); try { localStorage.setItem("commitpay-theme", n); } catch {} };
  return { theme: t, setTheme: set, toggle: () => set(read() === "light" ? "dark" : "light") };
}
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return <button type="button" onClick={toggle} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} title="Toggle theme" className={`theme-toggle ${className}`}>
    {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>;
}
