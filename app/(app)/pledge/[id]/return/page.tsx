"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
// PayPal return_url (or demo shortcut): authorize the order server-side.
export default function Return({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const r = useRouter(); const [err, setErr] = useState("");
  useEffect(() => { fetch(`/api/pledges/${id}/capture-auth`, { method: "POST" }).then(async (res) => {
    if (res.ok) r.replace(`/pledge/${id}`); else setErr((await res.json()).error); }); }, [id, r]);
  return <div className="card max-w-xl">{err ? <p className="text-danger">Authorization failed: {err}</p> : <p className="text-muted">Placing hold with PayPal…</p>}</div>;
}
