import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = (await all(`SELECT p.id,p.goal,p.stake_usd,p.status,p.escape_used,p.beneficiary_label,p.updated_at,
     (SELECT ai_verdict FROM proofs WHERE pledge_id=p.id ORDER BY created_at DESC LIMIT 1) AS proof_verdict,
     (SELECT ai_reasons FROM proofs WHERE pledge_id=p.id ORDER BY created_at DESC LIMIT 1) AS proof_reasons
     FROM pledges p WHERE p.status!='DRAFT' ORDER BY p.updated_at DESC`)) as any[];
  const payouts = (await all("SELECT * FROM payout_log ORDER BY created_at DESC"));
  const atRisk = rows.filter((r) => ["AUTHORIZED", "JUDGING", "ESCAPE"].includes(r.status)).reduce((s, r) => s + r.stake_usd, 0);
  const paidOut = (payouts as any[]).reduce((s, r) => s + r.amount_usd, 0);
  let streak = 0;
  for (const r of rows) { if (r.status === "VOIDED") streak++; else if (["CAPTURED", "PAYING_OUT", "PAYOUT_SENT"].includes(r.status)) break; }
  return NextResponse.json({ stats: { atRisk, paidOut, streak },
    rows: rows.map((r) => ({ ...r, escape_used: !!r.escape_used, proof_reasons: r.proof_reasons ? JSON.parse(r.proof_reasons) : [] })), payouts });
}
