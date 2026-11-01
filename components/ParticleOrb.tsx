"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme";

/** Fibonacci-sphere particle orb with Saturn-style dotted rings that rotate with the globe. */
export function ParticleOrb({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const th = useRef(theme);
  th.current = theme;

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Sphere points
    const N = 1800;
    const pts: { x: number; y: number; z: number; r: number; b: boolean }[] = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const t = g * i;
      const b = Math.random() < 0.08;
      pts.push({
        x: Math.cos(t) * rad,
        y,
        z: Math.sin(t) * rad,
        r: b ? 2.1 : 0.7 + Math.random() * 0.9,
        b,
      });
    }

    // Saturn rings: dotted particles on tilted ellipses (unit sphere coords, then scaled)
    type RingDot = { a: number; rScale: number; y: number; size: number; deep: boolean };
    const rings: RingDot[] = [];
    const makeRing = (count: number, rScale: number, y: number, deep: boolean) => {
      for (let i = 0; i < count; i++) {
        rings.push({
          a: (i / count) * Math.PI * 2 + Math.random() * 0.02,
          rScale: rScale * (0.97 + Math.random() * 0.06),
          y: y + (Math.random() - 0.5) * 0.04,
          size: deep ? 1.7 + Math.random() * 1.4 : 1.15 + Math.random() * 1.0,
          deep,
        });
      }
    };
    // Inner bright ring + outer deep-blue Saturn ring (denser)
    makeRing(120, 1.28, 0, false);
    makeRing(220, 1.48, 0.02, true);
    makeRing(160, 1.62, -0.02, true);

    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0;
    const t0 = performance.now();
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      m.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      m.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const rot = (x: number, y: number, z: number, ca: number, sa: number, ct: number, st: number) => {
      const x1 = x * ca - z * sa;
      const z1 = x * sa + z * ca;
      const y1 = y * ct - z1 * st;
      const z2 = y * st + z1 * ct;
      return { x: x1, y: y1, z: z2 };
    };

    const draw = (now: number) => {
      const el = (now - t0) / 1000;
      const fade = Math.min(1, el / 1.4);
      m.x += (m.tx - m.x) * 0.05;
      m.y += (m.ty - m.y) * 0.05;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2,
        R = Math.min(w, h) * 0.43;
      const L = th.current === "light";

      // Soft brand glow behind orb
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.85);
      gl.addColorStop(0, L ? "rgba(0,112,224,0.18)" : "rgba(0,112,224,0.28)");
      gl.addColorStop(0.55, L ? "rgba(0,112,224,0.05)" : "rgba(0,112,224,0.08)");
      gl.addColorStop(1, "rgba(0,112,224,0)");
      ctx.globalAlpha = fade;
      ctx.fillStyle = gl;
      ctx.fillRect(0, 0, w, h);

      // Continuous spin (Keel-like) + pointer tilt
      const spin = reduce ? 0.55 : el * 0.22;
      const a = spin + m.x * 0.35;
      const tl = 0.42 + m.y * 0.22;
      const ca = Math.cos(a),
        sa = Math.sin(a),
        ct = Math.cos(tl),
        st = Math.sin(tl);
      // Ring plane tilt (Saturn angle) — also slowly precesses
      const ringTilt = -0.55 + Math.sin(el * 0.15) * 0.04 + m.x * 0.06;
      const cr = Math.cos(ringTilt),
        sr = Math.sin(ringTilt);

      type Dot = { sx: number; sy: number; z: number; r: number; fill: string; a: number };
      const back: Dot[] = [];
      const front: Dot[] = [];

      // Ring dots in local ring plane (xz), then rotate with globe
      for (const d of rings) {
        const lx = Math.cos(d.a + spin * 1.15) * d.rScale;
        const lz = Math.sin(d.a + spin * 1.15) * d.rScale;
        const ly = d.y;
        // tilt ring around x
        const ry = ly * cr - lz * sr;
        const rz = ly * sr + lz * cr;
        const p = rot(lx, ry, rz, ca, sa, ct, st);
        const depth = (p.z + 1) / 2;
        const sx = cx + p.x * R;
        const sy = cy + p.y * R;
        const fill = d.deep
          ? L
            ? depth > 0.45
              ? "#003A8C"
              : "#0050B8"
            : depth > 0.45
              ? "#5EB0FF"
              : "#2E8BFF"
          : L
            ? "#0070E0"
            : "#8EC5FF";
        const alpha = fade * (d.deep ? (L ? 0.35 + depth * 0.65 : 0.55 + depth * 0.45) : (L ? 0.45 + depth * 0.55 : 0.65 + depth * 0.35));
        (p.z < 0 ? back : front).push({ sx, sy, z: p.z, r: d.size * (0.7 + depth * 0.55), fill, a: alpha });
      }

      // Sphere particles
      for (const p0 of pts) {
        const p = rot(p0.x, p0.y, p0.z, ca, sa, ct, st);
        const pull = 1 + 0.05 * Math.max(0, 1 - Math.hypot(p.x - m.x, p.y - m.y));
        const depth = (p.z + 1) / 2;
        const sx = cx + p.x * R * pull;
        const sy = cy + p.y * R * pull;
        const fill = p0.b
          ? L
            ? "#0070E0"
            : "#2E8BFF"
          : L
            ? depth > 0.5
              ? "#0B1220"
              : "#5C6B80"
            : depth > 0.5
              ? "#F4F7FB"
              : "#8B97AB";
        const alpha = fade * (L ? 0.28 + depth * 0.72 : 0.18 + depth * 0.82);
        (p.z < 0 ? back : front).push({
          sx,
          sy,
          z: p.z,
          r: p0.r * (0.65 + depth * 0.6),
          fill,
          a: alpha,
        });
      }

      const paint = (list: Dot[]) => {
        list.sort((u, v) => u.z - v.z);
        for (const d of list) {
          ctx.globalAlpha = d.a;
          ctx.fillStyle = d.fill;
          ctx.beginPath();
          ctx.arc(d.sx, d.sy, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      paint(back);
      // Soft solid ellipse guide under outer ring (very faint)
      ctx.globalAlpha = fade * (L ? 0.18 : 0.4);
      ctx.strokeStyle = L ? "rgba(0,58,140,0.55)" : "rgba(94,176,255,0.55)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 1.55, R * 0.38, ringTilt + a * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      paint(front);

      ctx.globalAlpha = 1;
      if (!reduce || el < 1.7) raf = requestAnimationFrame(draw);
    };

    size();
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", move);
    };
  }, [theme]);

  return <canvas ref={ref} aria-hidden className={`block w-full h-full ${className}`} />;
}
