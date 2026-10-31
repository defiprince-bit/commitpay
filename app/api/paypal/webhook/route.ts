import { NextResponse } from "next/server";
import { db, setPledge } from "@/lib/db";
import { verifyWebhook } from "@/lib/paypal";
import { captureAndPayout } from "@/lib/money";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const event = await req.json();
  if (!(await verifyWebhook(req.headers, event))) return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  const ins = db().prepare("INSERT OR IGNORE INTO webhook_events (paypal_event_id,event_type,payload) VALUES (?,?,?)")
    .run(event.id, event.event_type, JSON.stringify(event));
  if (ins.changes === 0) return NextResponse.json({ ok: true, duplicate: true });

  const r = event.resource || {};
  const byAuth = (authId: string) => db().prepare("SELECT * FROM pledges WHERE paypal_auth_id=?").get(authId) as any;
  switch (event.event_type) {
    case "PAYMENT.AUTHORIZATION.CREATED": { const p = byAuth(r.id); if (p && p.status === "PENDING_AUTH") setPledge(p.id, { status: "AUTHORIZED" }); break; }
    case "PAYMENT.AUTHORIZATION.VOIDED": { const p = byAuth(r.id); if (p) setPledge(p.id, { status: "VOIDED" }); break; }
    case "PAYMENT.CAPTURE.COMPLETED": {
      const p = byAuth(r.supplementary_data?.related_ids?.authorization_id);
      if (p) { if (!p.paypal_capture_id) setPledge(p.id, { paypal_capture_id: r.id });
        if (!p.paypal_payout_batch_id) await captureAndPayout(p.id); else if (p.status === "CAPTURING") setPledge(p.id, { status: "CAPTURED" }); }
      break; }
    case "PAYMENT.CAPTURE.DENIED": {
      const p = byAuth(r.supplementary_data?.related_ids?.authorization_id); if (p) setPledge(p.id, { status: "CAPTURE_FAILED" }); break; }
    default:
      if (String(event.event_type).startsWith("PAYMENT.PAYOUTS")) {
        const batchId = r.batch_header?.payout_batch_id || r.payout_batch_id;
        const p = db().prepare("SELECT * FROM pledges WHERE paypal_payout_batch_id=?").get(batchId) as any;
        if (p) {
          const ok = /SUCCESS|SUCCEEDED/.test(event.event_type);
          const failed = /DENIED|FAILED|BLOCKED|RETURNED/.test(event.event_type);
          if (ok || failed) {
            setPledge(p.id, { status: ok ? "PAYOUT_SENT" : "PAYOUT_FAILED" });
            db().prepare("UPDATE payout_log SET status=? WHERE paypal_batch_id=?").run(ok ? "SUCCESS" : "FAILED", batchId);
          }
        }
      }
  }
  return NextResponse.json({ ok: true });
}
