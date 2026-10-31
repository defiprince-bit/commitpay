import { NextResponse } from "next/server";
import { all, get, getPledge, run, setPledge, uuid } from "@/lib/db";
import { ESCAPE_QUESTIONS } from "@/lib/ai";
export const runtime = "nodejs";
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.FEATURE_ESCAPE_HATCH === "0") return NextResponse.json({ error: "Disabled" }, { status: 404 });
  const { id } = await params;
  const p = await getPledge(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (p.escape_used) return NextResponse.json({ error: "Escape already used." }, { status: 409 });
  if (p.status !== "AUTHORIZED") return NextResponse.json({ error: `Bad state ${p.status}` }, { status: 409 });
  const transcript = [{ role: "assistant", content: ESCAPE_QUESTIONS[0] }];
  (await run("INSERT INTO escape_sessions (id,pledge_id,transcript) VALUES (?,?,?)", [uuid(), id, JSON.stringify(transcript)]));
  await setPledge(id, { status: "ESCAPE", escape_used: 1 });
  return NextResponse.json({ transcript });
}
