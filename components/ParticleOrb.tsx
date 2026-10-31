"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme";
export function ParticleOrb({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme(); const th = useRef(theme); th.current = theme;
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = 1600, pts: { x: number; y: number; z: number; r: number; b: boolean }[] = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), t = g * i; const b = Math.random() < 0.07; pts.push({ x: Math.cos(t) * rad, y, z: Math.sin(t) * rad, r: b ? 1.9 : 0.6 + Math.random() * 0.8, b }); }
    let w = 0, h = 0, dpr = 1, raf = 0, t0 = performance.now();
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    const size = () => { dpr = Math.min(2, window.devicePixelRatio || 1); w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); m.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; m.ty = ((e.clientY - r.top) / r.height - 0.5) * 2; };
    const draw = (now: number) => {
      const el = (now - t0) / 1000, fade = Math.min(1, el / 1.6);
      m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.43, L = th.current === "light";
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6); gl.addColorStop(0, L ? "rgba(0,112,224,0.12)" : "rgba(0,112,224,0.22)"); gl.addColorStop(1, "rgba(0,112,224,0)");
      ctx.fillStyle = gl; ctx.globalAlpha = fade; ctx.fillRect(0, 0, w, h);
      const a = (reduce ? 0.6 : el * 0.12) + m.x * 0.35, tl = 0.35 + m.y * 0.25;
      const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(tl), st = Math.sin(tl);
      // ring
      ctx.strokeStyle = L ? "rgba(0,112,224,0.55)" : "rgba(0,112,224,0.45)"; ctx.lineWidth = 1; ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.32, R * 0.32, -0.38 + m.x * 0.08, 0, Math.PI * 2); ctx.stroke();
      for (const p of pts) {
        const x = p.x * ca - p.z * sa, z1 = p.x * sa + p.z * ca, y = p.y * ct - z1 * st, z = p.y * st + z1 * ct;
        const pull = 1 + 0.06 * Math.max(0, 1 - Math.hypot(x - m.x, y - m.y));
        const depth = (z + 1) / 2, sx = cx + x * R * pull, sy = cy + y * R * pull;
        ctx.globalAlpha = fade * (L ? 0.2 + depth * 0.8 : 0.15 + depth * 0.85);
        ctx.fillStyle = p.b ? (L ? "#0070E0" : "#2E8BFF") : L ? (depth > 0.5 ? "#0B1220" : "#7A8699") : depth > 0.5 ? "#F4F7FB" : "#8B97AB";
        ctx.beginPath(); ctx.arc(sx, sy, p.r * (0.6 + depth * 0.6), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce || el < 1.7) raf = requestAnimationFrame(draw);
    };
    size(); window.addEventListener("resize", size); window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); window.removeEventListener("pointermove", move); };
  }, [theme]);
  return <canvas ref={ref} aria-hidden className={`block w-full h-full ${className}`} />;
}
