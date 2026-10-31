import { NextResponse } from "next/server";
import { all, get, run, setPledge, uuid } from "@/lib/db";
import { createAuthorizeOrder, demoMode } from "@/lib/paypal";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json();
  const stake = Number(b.stake_usd);
  if (!b.goal || !(stake >= 1 && stake <= 500)) return NextResponse.json({ error: "Goal and stake $1–$500 required" }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.beneficiary_email || "")) return NextResponse.json({ error: "Valid beneficiary PayPal email required" }, { status: 400 });
  const id = uuid();
  const periodEnd = new Date(Date.now() + 7 * 864e5).toISOString();
  (await run(`INSERT INTO pledges (id,user_id,goal,stake_usd,proof_type,period_end,beneficiary_type,beneficiary_email,beneficiary_label,status)
    VALUES (?,?,?,?,?,?,?,?,?,'DRAFT')`, [id, "anon", b.goal, stake, b.proof_type || "photo", periodEnd,
    b.beneficiary_type === "friend" ? "friend" : "charity", b.beneficiary_email, b.beneficiary_label || b.beneficiary_email]));
  const app = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const ret = `${app}/pledge/${id}/return`;
  const { orderId, approveUrl } = await createAuthorizeOrder(id, stake, ret, `${app}/pledge/new`);
  await setPledge(id, { status: "PENDING_AUTH", paypal_order_id: orderId });
  return NextResponse.json({ id, order_id: orderId, approve_url: approveUrl, demo: demoMode() });
}
