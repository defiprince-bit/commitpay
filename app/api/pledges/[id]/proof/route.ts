import { NextResponse } from "next/server";
import { db, uuid, getPledge, setPledge } from "@/lib/db";
export const runtime = "nodejs";
// Body: { kind, storage_url? (data: URL ≤4MB), source_url?, note? }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPledge(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (p.status !== "AUTHORIZED") return NextResponse.json({ error: `Bad state ${p.status}` }, { status: 409 });
  const b = await req.json();
  if (b.storage_url && (!/^data:image\/(png|jpe?g|webp);base64,/.test(b.storage_url) || b.storage_url.length > 5_600_000))
    return NextResponse.json({ error: "Image must be png/jpg/webp ≤4MB" }, { status: 400 });
  if (!b.storage_url && !/^https?:\/\//.test(b.source_url || "")) return NextResponse.json({ error: "Proof required" }, { status: 400 });
  const proofId = uuid();
  db().prepare("INSERT INTO proofs (id,pledge_id,kind,storage_url,source_url,ai_reasons,critic_flags) VALUES (?,?,?,?,?,?,?)")
    .run(proofId, id, b.kind || p.proof_type, b.storage_url || null, b.source_url || null, JSON.stringify(b.note ? [`note:${b.note}`] : []), "{}");
  setPledge(id, { status: "JUDGING" });
  return NextResponse.json({ proof_id: proofId, status: "JUDGING" });
}
