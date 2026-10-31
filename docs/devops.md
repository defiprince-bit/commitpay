# CommitPay — DevOps (free deploy + webhooks + sandbox)

**Target (decided Oct 31 WAT):** Render Web Service + persistent disk `/data` (`render.yaml` in repo). Vercel only after DB moves off better-sqlite3 (Turso/Postgres) — see "Decision" below.  
**Stack:** Next.js App Router · PayPal sandbox · free LLM · $0.

## (Deferred) Vercel — not used while on better-sqlite3

1. New GitHub repo `commitpay` (public or private; judges need read access if private).
2. Import into Vercel → Framework Preset **Next.js** → root directory `/`.
3. Set env vars from `env.example` (Production + Preview).
4. Deploy. Note the production URL: `https://<project>.vercel.app` (or custom domain later).
5. Set `NEXT_PUBLIC_APP_URL` to that exact HTTPS origin and redeploy once.

**Why Vercel:** free HTTPS, serverless routes for PayPal webhooks, zero cost for hackathon traffic.

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

## Decision (Oct 31 WAT): **Render** (not Vercel yet)

**Why:** app uses `better-sqlite3` (`lib/db.ts`). Vercel serverless can’t use a local SQLite file without migrating to Turso/libSQL or Postgres. Render free web service + **persistent disk** keeps current DB code and gives public HTTPS for PayPal webhooks tonight.

**Turso + Vercel** stays the upgrade path if we migrate `lib/db.ts` off `better-sqlite3` later — don’t block webhook/demo on that.

### Render checklist
1. New Web Service from GitHub `commitpay` (or deploy from `/workspace/commitpay/app`).
2. Build: `npm install && npm run build` · Start: `npm start` · Node 20.
3. Attach a 1 GB persistent disk at `/data`; set `DATABASE_URL=file:/data/commitpay.db`. **Disks need a paid instance (Starter ~$7/mo)**; on Free, omit the disk — DB is ephemeral and resets on deploy/spin-down.
   Easiest: Dashboard → New → **Blueprint** → repo → uses `render.yaml`.
4. Env: US Business sandbox `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` (not the locked NG Default Application), `NEXT_PUBLIC_APP_URL=https://<service>.onrender.com`, AI keys, `SESSION_SECRET`.
5. After first deploy: PayPal Dashboard → Webhooks → `https://<service>.onrender.com/api/paypal/webhook` → copy ID → `PAYPAL_WEBHOOK_ID` → redeploy/restart.
6. Cold starts on free tier: hit the URL before demo; webhooks may retry if the instance was asleep.

**Hold:** do not create the Vercel project until DB is Turso/Postgres.
