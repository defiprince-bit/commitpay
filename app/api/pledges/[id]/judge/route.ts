import { NextResponse } from "next/server";
import { all, get, getPledge, run } from "@/lib/db";
import { judgeProof } from "@/lib/ai";
import { releaseHold, captureAndPayout } from "@/lib/money";
export const runtime = "nodejs";
// Vision + anti-cheat; accept → void; reject → capture → payout
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPledge(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (p.status !== "JUDGING") return NextResponse.json({ error: `Bad state ${p.status}` }, { status: 409 });
  const proof = (await get("SELECT * FROM proofs WHERE pledge_id=? AND ai_verdict='pending' ORDER BY created_at DESC LIMIT 1", [id])) as any;
  if (!proof) return NextResponse.json({ error: "No pending proof" }, { status: 409 });
  const note = (JSON.parse(proof.ai_reasons) as string[]).find((r) => r.startsWith("note:"))?.slice(5);
  const v = await judgeProof(p.goal, { storageUrl: proof.storage_url, sourceUrl: proof.source_url, note });
  (await run("UPDATE proofs SET ai_verdict=?, ai_reasons=?, critic_flags=? WHERE id=?", [v.verdict, JSON.stringify(v.reasons), JSON.stringify(v.flags), proof.id]));
  try {
    const after = v.verdict === "accept" ? await releaseHold(id) : await captureAndPayout(id);
    return NextResponse.json({ ...v, status: after.status });
  } catch (e) { return NextResponse.json({ ...v, error: String(e) }, { status: 502 }); }
}
