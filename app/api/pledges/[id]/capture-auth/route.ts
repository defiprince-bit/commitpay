import { NextResponse } from "next/server";
import { getPledge, setPledge } from "@/lib/db";
import { authorizeOrder } from "@/lib/paypal";
export const runtime = "nodejs";
// After buyer approval: authorize order → AUTHORIZED + paypal_auth_id
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPledge(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (p.status === "AUTHORIZED") return NextResponse.json({ status: p.status });
  if (p.status !== "PENDING_AUTH") return NextResponse.json({ error: `Bad state ${p.status}` }, { status: 409 });
  try {
    const a = await authorizeOrder(p.paypal_order_id!);
    if (a.amount && Number(a.amount) !== p.stake_usd) throw new Error("Authorized amount mismatch");
    setPledge(id, { status: "AUTHORIZED", paypal_auth_id: a.authId });
    return NextResponse.json({ status: "AUTHORIZED" });
  } catch (e) {
    setPledge(id, { status: "AUTH_FAILED" });
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
