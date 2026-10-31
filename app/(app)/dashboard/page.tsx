"use client";
import { FadeIn, Item, Lift, Press, CountUp } from "@/components/motion";
import { Wallet, Flame, HeartHandshake, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from "ag-grid-community";
import { Chip, usd } from "@/components/ui";
ModuleRegistry.registerModules([AllCommunityModule]);
const theme = themeQuartz.withParams({ backgroundColor: "var(--grid-bg)", foregroundColor: "var(--grid-fg)", headerBackgroundColor: "var(--grid-head)",
  borderColor: "var(--grid-line)", accentColor: "#0070E0", rowHeight: 52, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", wrapperBorderRadius: 0, wrapperBorder: false, rowHoverColor: "var(--grid-head)" });
export default function Dashboard() {
  const [d, setD] = useState<any>(null); const r = useRouter();
  useEffect(() => { fetch("/api/dashboard").then((x) => x.json()).then(setD); }, []);
  const cols = useMemo<ColDef[]>(() => [
    { field: "goal", headerName: "Pledge / Goal", flex: 2 },
    { field: "stake_usd", headerName: "Stake", width: 110, valueFormatter: (p) => usd(p.value) },
    { field: "status", headerName: "Status", width: 150, cellRenderer: (p: any) => <Chip status={p.value} /> },
    { headerName: "Proof result", flex: 2, valueGetter: (p) => p.data.proof_verdict ? `${p.data.proof_verdict === "accept" ? "pass" : "reject"} — ${p.data.proof_reasons?.[0] ?? ""}` : "—" },
    { field: "escape_used", headerName: "Escape used?", width: 130, valueFormatter: (p) => (p.value ? "Y" : "N") },
    { field: "updated_at", headerName: "Updated", width: 180 },
  ], []);
  if (!d) return <p className="text-muted">Loading…</p>;
  return (<div>
    <div className="flex items-end justify-between mb-8"><div><h1 className="text-3xl font-semibold tracking-tight">Accountability</h1><p className="text-muted mt-1">Every hold, verdict and payout in one place.</p></div>
      <Link href="/pledge/new" className="btn-ghost hidden md:inline-flex !py-2 text-sm"><Plus size={15} />New pledge</Link></div>
    <FadeIn className="grid md:grid-cols-3 gap-5 mb-8">
      <Lift className="card-hero card-hover"><div className="eyebrow flex items-center gap-2"><Wallet size={14} className="text-brand" />Money at risk</div><CountUp value={d.stats.atRisk} className="block amount text-5xl md:text-6xl mt-3" /><div className="text-xs text-muted mt-2">Authorized holds, not charged</div></Lift>
      <Lift className="card card-hover"><div className="eyebrow flex items-center gap-2"><Flame size={14} className="text-brand" />Streak</div><CountUp value={d.stats.streak} prefix="" className="block amount text-5xl md:text-6xl mt-3" /><div className="text-xs text-muted mt-2">Pledges kept in a row</div></Lift>
      <Lift className="card card-hover"><div className="eyebrow flex items-center gap-2"><HeartHandshake size={14} className="text-danger" />Paid out</div><CountUp value={d.stats.paidOut} className="block amount text-5xl md:text-6xl mt-3 text-danger" /><div className="text-xs text-muted mt-2">Sent to beneficiaries</div></Lift>
    </FadeIn>
    {d.rows.length === 0 ? <div className="card text-center py-20"><div className="mx-auto mb-5 grid place-items-center w-14 h-14 rounded-2xl bg-brand-soft text-brand "><Plus size={26} /></div>
      <p className="font-medium text-lg">No pledges yet</p><p className="text-muted text-sm mt-1 mb-6">Put money behind your first habit.</p><Link href="/pledge/new" className="btn-primary">Create a pledge</Link></div>
      : <div className="card !p-0 overflow-hidden fade"><div className="flex items-center justify-between px-6 py-4 border-b border-line"><span className="font-medium">Pledges</span><span className="text-xs text-muted">{d.rows.length} total · click a row</span></div>
        <div style={{ height: 420 }}><AgGridReact theme={theme} rowData={d.rows} columnDefs={cols} onRowClicked={(e) => r.push(`/pledge/${e.data.id}`)} /></div></div>}
    {d.payouts.length > 0 && <div className="mt-8"><h2 className="eyebrow mb-3">Payout log</h2>
      <div className="card divide-y divide-line p-0">{d.payouts.map((p: any) => <div key={p.id} className="flex justify-between px-6 py-3 text-sm">
        <span>{p.receiver}</span><span className="amount">{usd(p.amount_usd)}</span><span className="text-muted">{p.status} · {p.paypal_batch_id}</span></div>)}</div></div>}
  </div>);
}
