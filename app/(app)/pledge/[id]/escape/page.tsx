"use client";
import { motion } from "framer-motion";
import { LifeBuoy, Send } from "lucide-react";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StakeBar, usePledge } from "@/components/ui";
type Turn = { role: "assistant" | "user"; content: string };
export default function Escape({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data } = usePledge(id); const r = useRouter();
  const [t, setT] = useState<Turn[]>([]); const [a, setA] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!data?.pledge) return;
    if (data.escape) { if (data.escape.verdict !== "pending") r.replace(`/pledge/${id}/verdict`); else setT(data.escape.transcript); return; }
    if (data.pledge.escape_used) { setErr("Escape already used."); return; }
    fetch(`/api/pledges/${id}/escape/start`, { method: "POST" }).then(async (res) => { const j = await res.json(); res.ok ? setT(j.transcript) : setErr(j.error); });
  }, [data, id, r]);
  async function send() {
    if (!a.trim() || busy) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch(`/api/pledges/${id}/escape/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer: a }) });
      const j = await res.json().catch(() => ({}));
      setA("");
      if (j.transcript) setT(j.transcript);
      if (j.verdict) setTimeout(() => r.push(`/pledge/${id}/verdict`), 900);
      if (!res.ok) setErr(j.error || "Couldn’t finish that answer. Try again.");
    } catch {
      setErr("Network error — try Send again.");
    } finally {
      setBusy(false);
    }
  }
  if (!data?.pledge) return <p className="text-muted">Loading…</p>;
  const done = t.length > 0 && t.length % 2 === 0;
  return (<div className="max-w-2xl"><StakeBar p={data.pledge} />
    <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3"><LifeBuoy className="text-brand" size={28} />Life happened</h1>
    <p className="text-muted mt-2 mb-6">One use per pledge. Three short answers — be concrete. After the last one we decide in a second.</p>
    <div className="card space-y-3">{t.map((m, i) => <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className={`rounded-xl px-4 py-3 ${m.role === "assistant" ? "bg-surface2 border border-line mr-10" : "bg-brand-soft border border-brand/30 ml-10"}`}>{m.content}</motion.div>)}</div>
    {busy && t.filter((m) => m.role === "user").length >= 2 && <p className="text-muted text-sm mt-4">Judging your answers…</p>}
    {err && <p className="text-danger text-sm mt-4">{err}</p>}
    {!done && !err && t.length > 0 && <div className="mt-6 flex gap-3"><input className="input" value={a} onChange={(e) => setA(e.target.value)} onKeyDown={(e) => e.key === "Enter" && a && send()} placeholder="Your answer" />
      <button className="btn-primary" disabled={!a || busy} onClick={send}>{busy ? "…" : <><Send size={17} />Send</>}</button></div>}
  </div>);
}
