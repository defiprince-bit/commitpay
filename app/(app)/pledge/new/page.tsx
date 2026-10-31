"use client";
import { FadeIn, Item, Lift, Press } from "@/components/motion";
import { Wallet, Target, HeartHandshake, Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
const CHARITIES = [
  { label: "Sandbox Business US (payout)", email: "sb-xpusw50161321@business.example.com" },
  { label: "GiveDirectly (placeholder)", email: "sb-xpusw50161321@business.example.com" },
];
export default function NewPledge() {
  const r = useRouter();
  const [f, setF] = useState({ goal: "Gym 3× this week", stake: "20", proof_type: "photo", period: "week", btype: "charity", charity: 0, friend: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  async function submit() {
    setBusy(true); setErr("");
    const c = CHARITIES[f.charity];
    const res = await fetch("/api/pledges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      goal: f.goal, stake_usd: Number(f.stake), proof_type: f.proof_type, beneficiary_type: f.btype,
      beneficiary_email: f.btype === "charity" ? c.email : f.friend, beneficiary_label: f.btype === "charity" ? c.label : f.friend }) });
    const j = await res.json();
    if (!res.ok) { setErr(j.error); setBusy(false); return; }
    if (j.demo) r.push(`/pledge/${j.id}/return`); else window.location.href = j.approve_url;
  }
  const seg = (on: boolean) => `seg ${on ? "seg-on" : ""}`;
  return (<FadeIn className="max-w-2xl pb-32">
    <Item className="mb-8"><h1 className="text-3xl font-semibold tracking-tight">Create pledge</h1><p className="text-muted mt-2">Pick a goal, put money on it, choose who gets it if you miss.</p></Item>
    <Item className="card-hero mb-5"><div className="eyebrow mb-3 flex items-center gap-2"><Wallet size={14} className="text-brand" />Stake</div>
      <div className="flex items-baseline gap-2"><span className="amount text-4xl text-muted">$</span>
        <input aria-label="Stake (USD)" className="amount text-6xl bg-transparent outline-none w-full" inputMode="decimal" value={f.stake} onChange={(e) => set("stake", e.target.value)} /></div>
      <div className="flex gap-2 mt-4">{["10", "20", "50", "100"].map((v) => <button key={v} onClick={() => set("stake", v)} className={`rounded-full px-3 py-1 text-sm border transition-colors duration-150 ${f.stake === v ? "border-brand bg-brand-soft" : "border-line text-muted hover:text-ink"} active:scale-95`}>${v}</button>)}</div></Item>
    <Item className="card card-hover space-y-6 mb-5"><div className="eyebrow flex items-center gap-2"><Target size={14} className="text-brand" />The goal</div>
      <div><label className="label">Goal</label><input className="input" value={f.goal} onChange={(e) => set("goal", e.target.value)} /></div>
      <div className="grid md:grid-cols-2 gap-5">
        <div><label className="label">Proof type</label><div className="flex gap-2">{[["photo", "Photo"], ["link", "Link"], ["screenshot", "Shot"]].map(([v, l]) =>
          <button key={v} onClick={() => set("proof_type", v)} className={seg(f.proof_type === v)}>{l}</button>)}</div></div>
        <div><label className="label">Period</label><select className="input" value={f.period} onChange={(e) => set("period", e.target.value)}><option value="week">This week (next 7 days)</option></select></div></div></Item>
    <Item className="card card-hover space-y-4"><div className="eyebrow flex items-center gap-2"><HeartHandshake size={14} className="text-danger" />If you miss, the money goes to</div>
      <div className="flex gap-2">{[["charity", "Charity"], ["friend", "Friend"]].map(([v, l]) =>
        <button key={v} onClick={() => set("btype", v)} className={seg(f.btype === v)}>{l}</button>)}</div>
      {f.btype === "charity"
        ? <select className="input" value={f.charity} onChange={(e) => set("charity", Number(e.target.value))}>{CHARITIES.map((c, i) => <option key={i} value={i}>{c.label}</option>)}</select>
        : <input className="input" placeholder="friend@paypal.com" value={f.friend} onChange={(e) => set("friend", e.target.value)} />}
      {err && <p className="text-danger text-sm">{err}</p>}</Item>
    <div className="fixed bottom-0 right-0 left-0 md:left-[220px] z-10 border-t border-line bg-bg/90 backdrop-blur"><div className="mx-auto max-w-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-3">
      <p className="text-xs text-muted md:flex-1 order-2 md:order-1 text-center md:text-left">Funds held, not charged, until the AI decides.</p>
      <button className="btn-primary w-full md:w-auto md:px-8 order-1 md:order-2" disabled={busy} onClick={submit}><Lock size={17} />Authorize ${f.stake || 0} hold</button></div></div>
  </FadeIn>);
}
