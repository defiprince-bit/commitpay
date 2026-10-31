import { getPledge, setPledge, db, uuid } from "./db";
import { voidAuthorization, captureAuthorization, sendPayout, demoMode } from "./paypal";

/** Accept / escape pass → void. Never void after capture. */
export async function releaseHold(id: string) {
  const p = getPledge(id)!;
  if (["VOIDED", "CAPTURING", "CAPTURED", "PAYING_OUT", "PAYOUT_SENT"].includes(p.status)) return p;
  await voidAuthorization(p.paypal_auth_id!);
  setPledge(id, { status: "VOIDED" });
  return getPledge(id)!;
}
/** Reject / escape fail → capture full stake → payout to beneficiary. Never capture twice. */
export async function captureAndPayout(id: string) {
  const p = getPledge(id)!;
  if (p.paypal_capture_id || p.status === "VOIDED") return p;
  setPledge(id, { status: "CAPTURING" });
  try {
    const c = await captureAuthorization(p.paypal_auth_id!, p.stake_usd);
    setPledge(id, { status: "CAPTURED", paypal_capture_id: c.captureId });
  } catch (e) { setPledge(id, { status: "CAPTURE_FAILED" }); throw e; }
  setPledge(id, { status: "PAYING_OUT" });
  try {
    const po = await sendPayout(id, p.beneficiary_email, p.stake_usd, `CommitPay: "${p.goal}" missed`);
    // Live: webhook is source of truth for PAYOUT_SENT. Demo: mark sent immediately.
    setPledge(id, { paypal_payout_batch_id: po.batchId, ...(demoMode() ? { status: "PAYOUT_SENT" } : {}) });
    db().prepare("INSERT INTO payout_log (id,pledge_id,amount_usd,receiver,status,paypal_batch_id) VALUES (?,?,?,?,?,?)")
      .run(uuid(), id, p.stake_usd, p.beneficiary_email, demoMode() ? "SUCCESS" : po.status, po.batchId);
  } catch (e) { setPledge(id, { status: "PAYOUT_FAILED" }); throw e; }
  return getPledge(id)!;
}
