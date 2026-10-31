"use client";
import { motion, MotionConfig, useReducedMotion, useSpring, useTransform, animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
export const spring = { type: "spring", stiffness: 260, damping: 26 } as const;
export const ease = [0.22, 1, 0.36, 1] as const;
export function MotionRoot({ children }: { children: React.ReactNode }) { return <MotionConfig reducedMotion="user">{children}</MotionConfig>; }
export function Page({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>{children}</motion.div>;
}
export function FadeIn({ children, className = "", delay = 0, stagger = 0.07 }: { children: React.ReactNode; className?: string; delay?: number; stagger?: number }) {
  return <motion.div className={className} initial="h" animate="s" variants={{ h: {}, s: { transition: { staggerChildren: stagger, delayChildren: delay } } }}>{children}</motion.div>;
}
export const item = { h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0, transition: { duration: 0.42, ease } } };
export function Item({ children, className = "", as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const C: any = as === "li" ? motion.li : motion.div; return <C className={className} variants={item}>{children}</C>;
}
export function Lift({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div className={className} variants={item} whileHover={{ y: -3 }} transition={spring}>{children}</motion.div>;
}
export function Press({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div className={className} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring}>{children}</motion.div>;
}
export function CountUp({ value, prefix = "$", className = "" }: { value: number; prefix?: string; className?: string }) {
  const reduce = useReducedMotion(); const [v, setV] = useState(reduce ? value : 0);
  useEffect(() => { if (reduce) { setV(value); return; } const c = animate(0, value, { duration: 0.9, ease, onUpdate: (x) => setV(x) }); return () => c.stop(); }, [value, reduce]);
  const n = Number(value) % 1 ? v.toFixed(2) : Math.round(v).toString();
  return <span className={className}>{prefix}{n}</span>;
}
export { motion };
