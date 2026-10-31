// PayPal REST helpers (sandbox). Demo mode = no credentials → deterministic mocks.
const BASE = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
export const demoMode = () => !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET;
const mockId = (p: string) => `${p}-DEMO-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

async function token() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const r = await fetch(`${BASE}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${auth}`,
    "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  if (!r.ok) throw new Error(`PayPal token ${r.status}`);
  return (await r.json()).access_token as string;
}
async function pp(path: string, body?: unknown, extra: Record<string, string> = {}) {
  const r = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${await token()}`,
    "Content-Type": "application/json", ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) throw new Error(`PayPal ${path} ${r.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

/** POST /v2/checkout/orders intent=AUTHORIZE */
export async function createAuthorizeOrder(pledgeId: string, amountUsd: number, returnUrl: string, cancelUrl: string) {
  if (demoMode()) return { orderId: mockId("ORDER"), approveUrl: returnUrl };
  const o = await pp("/v2/checkout/orders", {
    intent: "AUTHORIZE",
    purchase_units: [{ reference_id: pledgeId, amount: { currency_code: "USD", value: amountUsd.toFixed(2) } }],
    payment_source: { paypal: { experience_context: { return_url: returnUrl, cancel_url: cancelUrl, user_action: "CONTINUE" } } },
  }, { "PayPal-Request-Id": `order-${pledgeId}` });
  const approve = o.links?.find((l: { rel: string }) => l.rel === "payer-action" || l.rel === "approve")?.href;
  return { orderId: o.id as string, approveUrl: approve as string };
}
/** POST /v2/checkout/orders/{id}/authorize */
export async function authorizeOrder(orderId: string) {
  if (demoMode()) return { authId: mockId("AUTH"), amount: undefined as string | undefined };
  const o = await pp(`/v2/checkout/orders/${orderId}/authorize`, {});
  const a = o.purchase_units?.[0]?.payments?.authorizations?.[0];
  return { authId: a.id as string, amount: a.amount?.value as string | undefined };
}
/** POST /v2/payments/authorizations/{id}/void */
export async function voidAuthorization(authId: string) {
  if (demoMode()) return { ok: true };
  await pp(`/v2/payments/authorizations/${authId}/void`);
  return { ok: true };
}
/** POST /v2/payments/authorizations/{id}/capture — full stake, final */
export async function captureAuthorization(authId: string, amountUsd: number) {
  if (demoMode()) return { captureId: mockId("CAP"), status: "COMPLETED" };
  const c = await pp(`/v2/payments/authorizations/${authId}/capture`,
    { amount: { currency_code: "USD", value: amountUsd.toFixed(2) }, final_capture: true },
    { "PayPal-Request-Id": `cap-${authId}` });
  return { captureId: c.id as string, status: c.status as string };
}
/** POST /v1/payments/payouts */
export async function sendPayout(pledgeId: string, receiver: string, amountUsd: number, note: string) {
  if (demoMode()) return { batchId: mockId("BATCH"), status: "SUCCESS" };
  const p = await pp("/v1/payments/payouts", {
    sender_batch_header: { sender_batch_id: `cp-${pledgeId}`, email_subject: "CommitPay payout" },
    items: [{ recipient_type: "EMAIL", receiver, note, sender_item_id: pledgeId,
      amount: { currency: "USD", value: amountUsd.toFixed(2) } }],
  });
  return { batchId: p.batch_header?.payout_batch_id as string, status: p.batch_header?.batch_status as string };
}
/** POST /v1/notifications/verify-webhook-signature. Without PAYPAL_WEBHOOK_ID: allowed only in demo mode. */
export async function verifyWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return demoMode(); // stub: accept in demo, reject when live creds but no webhook id
  const r = await pp("/v1/notifications/verify-webhook-signature", {
    auth_algo: headers.get("paypal-auth-algo"), cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"), transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"), webhook_id: webhookId, webhook_event: event,
  });
  return r.verification_status === "SUCCESS";
}
