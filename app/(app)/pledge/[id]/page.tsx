"use client";
import { FadeIn, Item, Lift, CountUp } from "@/components/motion";
import { Target, HeartHandshake, Camera, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Chip, usd, usePledge } from "@/components/ui";
export default function Hold({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data } = usePledge(id); const r = useRouter();
  const p = data?.pledge;
  useEffect(() => { if (p && p.status !== "AUTHORIZED" && p.status !== "PENDING_AUTH" && p.status !== "ESCAPE") r.replace(`/pledge/${id}/verdict`);
    if (p?.status === "ESCAPE") r.replace(`/pledge/${id}/escape`); }, [p, id, r]);
  if (!data) return <p className="text-muted">Loading…</p>;
  if (!p) return <p className="text-muted">Pledge not found.</p>;
  return (<FadeIn className="max-w-2xl space-y-5">
    <Item className="card-hero !p-8"><div className="flex items-center justify-between"><span className="eyebrow">Stake on hold</span><Chip status={p.status} /></div>
      <CountUp value={p.stake_usd} className="block amount text-6xl md:text-7xl mt-4" />
      <p className="text-muted mt-2">Authorized via PayPal — not charged.</p></Item>
    <Item className="grid md:grid-cols-2 gap-5">
      <Lift className="card card-hover"><div className="eyebrow mb-2 flex items-center gap-2"><Target size={14} className="text-brand" />Goal</div><div className="font-medium text-lg">{p.goal}</div></Lift>
      <Lift className="card card-hover"><div className="eyebrow mb-2 flex items-center gap-2"><HeartHandshake size={14} className="text-danger" />If you miss</div><div className="font-medium text-lg">{p.beneficiary_label}</div></Lift></Item>
    <Item className="flex flex-col md:flex-row gap-3 pt-2">
      <Link href={`/pledge/${id}/proof`} className="btn-primary md:flex-1"><Camera size={18} />Submit proof</Link>
      <Link href={p.escape_used ? "#" : `/pledge/${id}/escape`} aria-disabled={p.escape_used}
        className={`btn-ghost md:flex-1 ${p.escape_used ? "pointer-events-none opacity-40" : ""}`}>{p.escape_used ? "Escape already used." : <><LifeBuoy size={18} />Life happened</>}</Link></Item>
    <Link href="/dashboard" className="block text-sm text-muted text-center hover:text-ink transition-colors">Back to dashboard</Link>
  </FadeIn>);
}
