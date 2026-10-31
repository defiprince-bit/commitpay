"use client";
import Link from "next/link";
import { use } from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2, Sparkles, X, Check, Plus, LayoutDashboard, HeartHandshake, Receipt } from "lucide-react";
import { Chip, isLost, usePledge } from "@/components/ui";
import { CountUp, FadeIn, Item, Press, ease, spring } from "@/components/motion";
export default function Verdict({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data } = usePledge(id);
  if (!data?.pledge) return <p className="text-muted">Loading…</p>;
  const { pledge: p, proof, escape } = data; const lost = isLost(p.status);
  const viaEscape = escape && escape.verdict !== "pending";
  const reasons: string[] = viaEscape ? [escape.transcript.at(-1)?.content].filter(Boolean) : proof?.ai_reasons ?? [];
  const tone = lost ? { c: "text-danger", bg: "bg-danger-soft", b: "border-danger/40", bar: "bg-danger", glow: "#E11D48" } : { c: "text-ok", bg: "bg-ok-soft", b: "border-ok/40", bar: "bg-ok", glow: "#0D9488" };
  const Icon = lost ? XCircle : CheckCircle2; const RowIcon = lost ? X : Check;
  const title = lost ? (viaEscape ? "Escape didn’t clear" : "Proof rejected") : (viaEscape ? "Life happens. Hold released." : "Proof accepted");
  return (<div className="max-w-2xl">
    <motion.section initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.45, ease }}
      className={`relative overflow-hidden rounded-[20px] border ${tone.b} ${tone.bg} p-8 md:p-10`} style={{ boxShadow: `0 20px 60px -28px ${tone.glow}` }}>
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: tone.glow }} />
      <div className="flex items-center justify-between">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 0.1 }}
          className={`grid place-items-center w-14 h-14 rounded-full ${tone.bg} border ${tone.b} ${tone.c}`}><Icon size={28} strokeWidth={2.2} /></motion.div>
        <span className={`pulse-chip rounded-full ${tone.c}`}><Chip status={p.status} /></span>
      </div>
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.15 }}
        className={`mt-6 text-4xl md:text-5xl font-semibold tracking-[-0.04em] leading-[1.02] ${tone.c}`}>{title}</motion.h1>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.25 }} className="mt-6">
        {lost ? <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-muted text-lg">{p.status === "PAYOUT_SENT" ? "Paid" : "Capturing"}</span>
            <CountUp value={p.stake_usd} className="amount text-5xl md:text-6xl text-ink" />
            <span className="text-muted text-lg flex items-center gap-2"><HeartHandshake size={18} className="text-danger" />{p.beneficiary_label}</span></div>
          : <div className="flex flex-wrap items-baseline gap-x-3"><CountUp value={p.stake_usd} className="amount text-5xl md:text-6xl text-ink" /><span className="text-muted text-lg">released — you keep it.</span></div>}
        <p className="text-muted mt-3 max-w-md leading-relaxed">{lost ? `The referee didn’t accept this one. Your stake goes to ${p.beneficiary_label} — next pledge, fresh start.` : "Your PayPal hold was voided. Nothing was charged."}</p>
      </motion.div>
    </motion.section>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.35 }} className="card mt-6 !p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-line">
        <span className="flex items-center gap-2 font-medium"><Sparkles size={16} className="text-brand" />{viaEscape ? "Interview verdict" : "Why the AI decided"}</span>
        <span className="text-xs text-muted">{reasons.length} {reasons.length === 1 ? "reason" : "reasons"}</span></div>
      <FadeIn delay={0.5} stagger={0.1} className="p-3 space-y-1.5">
        {reasons.map((r, i) => <Item key={i}><motion.div whileHover={{ x: 3 }} transition={spring}
          className="relative flex gap-3 items-start rounded-xl bg-surface2/60 hover:bg-surface2 pl-5 pr-4 py-3.5 transition-colors">
          <span className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${tone.bar}`} />
          <span className={`mt-0.5 grid place-items-center w-6 h-6 shrink-0 rounded-full ${tone.bg} ${tone.c}`}><RowIcon size={14} strokeWidth={2.6} /></span>
          <span className="leading-relaxed">{r}</span></motion.div></Item>)}
      </FadeIn>
      {p.paypal_payout_batch_id && <div className="flex items-center gap-2 px-6 py-3 border-t border-line text-xs text-muted font-mono"><Receipt size={13} />Payout batch {p.paypal_payout_batch_id}</div>}
    </motion.div>
    <FadeIn delay={0.7} className="flex gap-3 mt-8">
      <Item className="flex-1"><Press><Link href="/pledge/new" className="btn-primary w-full"><Plus size={18} />New pledge</Link></Press></Item>
      <Item className="flex-1"><Press><Link href="/dashboard" className="btn-ghost w-full"><LayoutDashboard size={18} />Dashboard</Link></Press></Item>
    </FadeIn>
  </div>);
}
