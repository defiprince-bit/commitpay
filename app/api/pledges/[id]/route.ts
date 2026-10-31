import { NextResponse } from "next/server";
import { db, getPledge } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPledge(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const proof = db().prepare("SELECT id,kind,source_url,ai_verdict,ai_reasons,critic_flags,created_at FROM proofs WHERE pledge_id=? ORDER BY created_at DESC LIMIT 1").get(id) as any;
  const esc = db().prepare("SELECT * FROM escape_sessions WHERE pledge_id=?").get(id) as any;
  return NextResponse.json({ pledge: { ...p, escape_used: !!p.escape_used },
    proof: proof && { ...proof, ai_reasons: JSON.parse(proof.ai_reasons), critic_flags: JSON.parse(proof.critic_flags) },
    escape: esc && { ...esc, transcript: JSON.parse(esc.transcript) } });
}
