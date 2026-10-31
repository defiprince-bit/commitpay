"use client";
import { useEffect, useState, useCallback } from "react";
export const usd = (n: number) => `$${Number(n).toFixed(Number(n) % 1 ? 2 : 0)}`;
export function Chip({ status }: { status: string }) {
  const s = status === "PAYOUT_SENT" || status === "PAYING_OUT" ? "PAYOUT" : status;
  const cls = s === "VOIDED" ? "bg-ok-soft text-ok" : ["CAPTURED", "PAYOUT", "CAPTURING", "CAPTURE_FAILED", "PAYOUT_FAILED", "AUTH_FAILED"].includes(s)
    ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand";
  return <span className={`inline-block inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide ${cls}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{s}</span>;
}
export type PledgeData = { pledge: any; proof?: any; escape?: any };
export function usePledge(id: string) {
  const [data, setData] = useState<PledgeData | null>(null);
  const reload = useCallback(() => fetch(`/api/pledges/${id}`).then((r) => r.json()).then(setData), [id]);
  useEffect(() => { reload(); }, [reload]);
  return { data, reload };
}
export function StakeBar({ p }: { p: any }) {
  return <div className="card-hero flex items-center justify-between mb-8"><div><div className="eyebrow mb-1">Goal</div><div className="font-medium">{p.goal}</div></div>
    <div className="text-right"><div className="eyebrow mb-1">On hold</div><div className="amount text-3xl">{usd(p.stake_usd)}</div></div></div>;
}
export const isLost = (s: string) => ["CAPTURING", "CAPTURED", "PAYING_OUT", "PAYOUT_SENT", "PAYOUT_FAILED"].includes(s);
