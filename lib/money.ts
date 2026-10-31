import { all, get, getPledge, run, setPledge, uuid } from "./db";
import { voidAuthorization, captureAuthorization, sendPayout, demoMode } from "./paypal";

/** Accept / escape pass → void. Never void after capture. */
export async function releaseHold(id: string) {
  const p = (await getPledge(id))!;
  if (["VOIDED", "CAPTURING", "CAPTURED", "PAYING_OUT", "PAYOUT_SENT"].includes(p.status)) return p;
  await voidAuthorization(p.paypal_auth_id!);
  await setPledge(id, { status: "VOIDED" });
  return (await getPledge(id))!;
}
/** Reject / escape fail → capture full stake → payout to beneficiary. Never capture twice. */
export async function captureAndPayout(id: string) {
  const p = (await getPledge(id))!;
  if (p.paypal_capture_id || p.status === "VOIDED") return p;
  await setPledge(id, { status: "CAPTURING" });
  try {
    const c = await captureAuthorization(p.paypal_auth_id!, p.stake_usd);
    await setPledge(id, { status: "CAPTURED", paypal_capture_id: c.captureId });
  } catch (e) { await setPledge(id, { status: "CAPTURE_FAILED" }); throw e; }
  await setPledge(id, { status: "PAYING_OUT" });
  try {
    const po = await sendPayout(id, p.beneficiary_email, p.stake_usd, `CommitPay: "${p.goal}" missed`);
    // Live: webhook is source of truth for PAYOUT_SENT. Demo: mark sent immediately.
    await setPledge(id, { paypal_payout_batch_id: po.batchId, ...(demoMode() ? { status: "PAYOUT_SENT" } : {}) });
    (await run("INSERT INTO payout_log (id,pledge_id,amount_usd,receiver,status,paypal_batch_id) VALUES (?,?,?,?,?,?)", [uuid(), id, p.stake_usd, p.beneficiary_email, demoMode() ? "SUCCESS" : po.status, po.batchId]));
  } catch (e) { await setPledge(id, { status: "PAYOUT_FAILED" }); throw e; }
  return (await getPledge(id))!;
}
