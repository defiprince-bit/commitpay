"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
const STEPS = [
  { n: "01", t: "Authorize a hold", d: "Pick a habit, a deadline and a stake. PayPal authorizes the amount — a hold, not a charge.", k: "$25.00", s: "Authorized · not captured" },
  { n: "02", t: "Prove it", d: "Upload proof before the deadline. The AI referee checks it’s real, fresh and yours.", k: "0.97", s: "Proof confidence" },
  { n: "03", t: "Keep it or pay it forward", d: "Pass and the hold is voided. Miss and it’s captured and paid out to your chosen charity or friend.", k: "$0.00", s: "Charged when you show up" },
];
export function Steps() {
  const [o, setO] = useState(0);
  return (<div className="grid md:grid-cols-[1fr_1fr] gap-10 items-start">
    <div className="border-t border-ink/10">{STEPS.map((s, i) => <button key={s.n} onClick={() => setO(i)} className="w-full text-left border-b border-ink/10 py-6 group">
      <div className="flex items-baseline gap-5"><span className={`mk-mono text-xs ${o === i ? "text-brand" : "text-muted/60"}`}>{s.n}</span>
        <span className={`text-xl tracking-[-0.02em] transition-colors ${o === i ? "text-ink" : "text-muted group-hover:text-ink"}`}>{s.t}</span></div>
      <AnimatePresence initial={false}>{o === i && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden pl-10 text-muted leading-relaxed"><span className="block pt-3">{s.d}</span></motion.p>}</AnimatePresence>
    </button>)}</div>
    <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-ink/[0.02] p-6 md:p-10 min-h-[240px] md:min-h-[280px] backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand/30 blur-3xl" />
      <div className="mk-mono text-[11px] text-muted">STEP {STEPS[o].n}</div>
      <AnimatePresence mode="wait"><motion.div key={o} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
        <div className="mt-14 text-6xl md:text-8xl font-extralight tracking-[-0.05em] tabular-nums">{STEPS[o].k}</div>
        <div className="mt-3 text-muted">{STEPS[o].s}</div></motion.div></AnimatePresence>
    </div></div>);
}
