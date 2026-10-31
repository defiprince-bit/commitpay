# CommitPay — DevOps (free deploy + webhooks + sandbox)

**Target (decided Oct 31 WAT, revised):** **Turso free + Vercel Hobby — $0, persistent data.** `lib/db.ts` uses `@libsql/client`: local `file:./commitpay.db`, prod `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.  
**Stack:** Next.js App Router · PayPal sandbox · free LLM · $0.

## Primary: Turso + Vercel ($0)

1. Turso (free, no card): create DB `commitpay` + token — or Vercel → Storage → Marketplace → Turso. Env: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
2. Vercel → Import `defiprince-bit/commitpay` → Next.js defaults → paste env (see `env.example`; don't set `DATABASE_URL` in prod) → Deploy.
3. Set `NEXT_PUBLIC_APP_URL=https://<project>.vercel.app` → Redeploy.
4. PayPal webhook → `https://<project>.vercel.app/api/paypal/webhook` → `PAYPAL_WEBHOOK_ID` → Redeploy.
5. Schema bootstraps itself on first request.

Vercel Hobby is non-commercial-use only — fine for the hackathon. Caveat: request bodies max ~4.5 MB on Vercel functions (proof images are data URLs).

## Webhook URL plan

PayPal needs a public HTTPS endpoint. Local `localhost` will not receive events.

| Environment | Webhook URL |
|-------------|-------------|
| Production (Vercel) | `https://<project>.vercel.app/api/paypal/webhook` |
| Preview (optional) | Prefer production only for sandbox demos, or register a second webhook for a stable preview URL |
| Local | Use [ngrok](https://ngrok.com/) or `vercel dev` + tunnel: `https://<tunnel>/api/paypal/webhook` |

**Dashboard steps (PayPal Developer → Sandbox → Webhooks):**
1. Add webhook URL above.
2. Subscribe at least: `PAYMENT.AUTHORIZATION.CREATED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.AUTHORIZATION.VOIDED`, and Payouts events you use (`PAYMENT.PAYOUTSBATCH.*` / item-level as available).
3. Copy **Webhook ID** → `PAYPAL_WEBHOOK_ID`.
4. Verify signatures in the route (PayPal verify-webhook-signature API) before mutating DB state.

**Idempotency:** store PayPal `id` / event `id`; ignore duplicates. Never capture twice.

## Sandbox checklist

- [ ] PayPal Developer app created (Sandbox).
- [ ] Sandbox Business + Personal accounts noted (buyer for authorize, business for capture/payouts).
- [ ] `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` in Vercel + `.env.local`.
- [ ] Orders: `intent=AUTHORIZE` succeeds; buyer sees hold.
- [ ] Void path: AI accept → authorization voided → buyer funds released.
- [ ] Capture path: AI reject → capture → funds leave buyer.
- [ ] Payouts: captured amount (or stake) sent to beneficiary PayPal email (sandbox).
- [ ] Webhook registered on production URL; test event or real flow updates app status.
- [ ] Signature verification on; unsigned payloads rejected.
- [ ] `NEXT_PUBLIC_APP_URL` matches the deployed origin (no trailing slash mismatch).
- [ ] No live/client secret in git; `.env*` gitignored except `env.example`.
- [ ] Demo video filmed against **sandbox** (judges expect sandbox, not live card holds).

## Local quick start (after scaffold)

```bash
cp env.example .env.local
# fill PayPal + AI keys
pnpm i && pnpm dev
# tunnel for webhooks if testing money webhooks locally
```

## Cut / don’t cut (ops)

Never cut: authorize → void/capture, webhook verify, payouts.  
OK to defer: custom domain, preview webhooks, fancy observability.

## Deliverable paths

- `/workspace/commitpay/env.example`
- `/workspace/commitpay/devops.md` (this file)

---

## Alternatives considered (Oct 31 WAT)

- **Render Starter + disk (~$7/mo): OFF THE TABLE** — cost. `render.yaml` removed from the repo.
- **Render Free:** no persistent disk → SQLite wipes on every deploy/spin-down (~15 min idle). Last resort only (e.g. Turso outage); you'd lose all pledges. With libSQL you could instead point Render Free at Turso — persistent, but cold starts make PayPal webhooks retry.
- **Railway Free:** $1/mo credit + 0.5 GB volume, but an always-on Next.js server burns past $1 quickly. Optional only if Douglas still has Railway Hobby credit left over from NairaGuard.
- **Primary = Turso + Vercel.**
