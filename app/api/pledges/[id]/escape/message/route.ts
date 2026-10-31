import { NextResponse } from "next/server";
import { db, getPledge } from "@/lib/db";
import { escapeTurn, Turn } from "@/lib/ai";
import { releaseHold, captureAndPayout } from "@/lib/money";
export const runtime = "nodejs";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPledge(id);
  const s = db().prepare("SELECT * FROM escape_sessions WHERE pledge_id=?").get(id) as any;
  if (!p || !s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (p.status !== "ESCAPE" || s.verdict !== "pending") return NextResponse.json({ error: "Interview closed" }, { status: 409 });
  const { answer } = await req.json();
  if (!answer?.trim()) return NextResponse.json({ error: "Answer required" }, { status: 400 });
  const transcript: Turn[] = [...JSON.parse(s.transcript), { role: "user", content: String(answer).slice(0, 1000) }];
  const t = await escapeTurn(p.goal, transcript);
  if (t.question) transcript.push({ role: "assistant", content: t.question });
  else transcript.push({ role: "assistant", content: t.reason || "" });
  db().prepare("UPDATE escape_sessions SET transcript=?, verdict=? WHERE id=?").run(JSON.stringify(transcript), t.verdict || "pending", s.id);
  if (!t.verdict) return NextResponse.json({ transcript });
  try {
    const after = t.verdict === "pass" ? await releaseHold(id) : await captureAndPayout(id);
    return NextResponse.json({ transcript, verdict: t.verdict, reason: t.reason, status: after.status });
  } catch (e) { return NextResponse.json({ transcript, verdict: t.verdict, error: String(e) }, { status: 502 }); }
}
