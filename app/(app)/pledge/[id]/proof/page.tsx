"use client";
import { FadeIn, Item } from "@/components/motion";
import { Camera, Sparkles, Loader2 } from "lucide-react";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { StakeBar, usePledge } from "@/components/ui";
export default function Proof({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { data } = usePledge(id); const r = useRouter();
  const [img, setImg] = useState<string>(""); const [name, setName] = useState(""); const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  if (!data?.pledge) return <p className="text-muted">Loading…</p>;
  const p = data.pledge; const isLink = p.proof_type === "link";
  function pick(file?: File) { if (!file) return; if (file.size > 4e6) return setErr("Max 4MB");
    setName(file.name); const fr = new FileReader(); fr.onload = () => setImg(String(fr.result)); fr.readAsDataURL(file); }
  async function send() {
    setBusy(true); setErr("");
    const res = await fetch(`/api/pledges/${id}/proof`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: p.proof_type, storage_url: isLink ? undefined : img, source_url: isLink ? url : undefined, note: name }) });
    if (!res.ok) { setErr((await res.json()).error); setBusy(false); return; }
    await fetch(`/api/pledges/${id}/judge`, { method: "POST" });
    r.push(`/pledge/${id}/verdict`);
  }
  return (<FadeIn className="max-w-2xl"><Item><StakeBar p={p} /></Item><Item>
    <h1 className="text-3xl font-semibold tracking-tight">Submit proof</h1><p className="text-muted mt-2 mb-6">The AI referee checks for stock, reused or generated images.</p></Item><Item>
    {isLink ? <input className="input" placeholder="https://strava.com/… or https://github.com/…" value={url} onChange={(e) => setUrl(e.target.value)} />
      : <label className="card border-dashed border-2 flex flex-col items-center justify-center gap-2 min-h-64 cursor-pointer text-muted hover:border-brand hover:bg-brand-soft transition-all duration-300 group"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
          {img ? <img src={img} alt="proof" className="max-h-72 rounded-xl" /> : <><span className="grid place-items-center w-14 h-14 rounded-full bg-surface2 text-brand transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"><Camera size={24} /></span><span className="text-ink">Drop a {p.proof_type}</span><span className="text-xs">or click to choose · PNG, JPG, WEBP · 4MB</span></>}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} /></label>}</Item>
    {err && <p className="text-danger text-sm mt-3">{err}</p>}
    <button className="btn-primary w-full mt-6" disabled={busy || (isLink ? !url : !img)} onClick={send}>{busy ? <><Loader2 size={18} className="animate-spin" />AI is checking…</> : <><Sparkles size={18} />Send to AI</>}</button>
  </FadeIn>);
}
