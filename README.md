# CommitPay — app

Stake money on a habit. PayPal **authorizes** a hold; an AI referee judges proof.
Accept → **void**. Reject → **capture** + **Payouts** to the beneficiary. One "Life happened" escape interview per pledge.

Docs: [`docs/plan.md`](docs/plan.md) · [`docs/design.md`](docs/design.md) · [`docs/ui-screen-map.md`](docs/ui-screen-map.md) · [`docs/brand/visual-system.md`](docs/brand/visual-system.md) · [`docs/devops.md`](docs/devops.md)

Requires **Node 20** (`.nvmrc`). `@libsql/client` is a native module; it builds on `npm install` (prebuilt binaries for Linux/macOS x64/arm64).

## Run
```bash
cp .env.example .env.local   # leave PayPal/AI keys blank for demo mode
npm install
npm run dev                  # http://localhost:3000
```
SQLite file from `DATABASE_URL` (default `file:./commitpay.db`) is created on first request, parent dir auto-created (schema = docs/design.md §3, in `lib/db.ts`).

## Demo mode (no keys)
- **PayPal:** no `PAYPAL_CLIENT_ID/SECRET` → `lib/paypal.ts` returns mock ORDER/AUTH/CAP/BATCH ids; "Authorize" skips PayPal checkout.
- **AI:** no `GROQ_API_KEY`/`GEMINI_API_KEY` → `lib/ai.ts` heuristic: image filename/URL containing `stock`, `fake`, `getty`, `unsplash`, `sample`, `ai-gen` → **reject**; anything else → accept. Escape: 3 questions; any answer < 4 words or "lazy/forgot/idk" → fail, else pass.
- **Webhook:** no `PAYPAL_WEBHOOK_ID` → signature check accepted only in demo mode; with live creds and no webhook id → 401.

Demo walk: New pledge → Authorize → Submit proof (`stock-gym.jpg`) → rejected, $20 → charity · New pledge → Life happened → specific answers → released · Dashboard (AG Grid).

## Sandbox (live)
Fill `PAYPAL_CLIENT_ID/SECRET` (sandbox app), `NEXT_PUBLIC_APP_URL`. Create → redirects to PayPal approve → returns to `/pledge/[id]/return` → server authorizes.
Payout receivers must be sandbox PayPal emails (edit `CHARITIES` in `app/pledge/new/page.tsx`). Webhooks need public HTTPS (`/api/paypal/webhook`, see docs/devops.md); payout status becomes `PAYOUT_SENT` from webhook in live mode.

## Map
- `lib/paypal.ts` authorize / void / capture / payouts / verify-webhook · `lib/money.ts` void vs capture+payout (no double capture) · `lib/ai.ts` judge + anti-cheat + escape · `lib/db.ts` schema
- API: `POST /api/pledges`, `POST /api/pledges/[id]/{capture-auth,proof,judge,escape/start,escape/message}`, `GET /api/pledges/[id]`, `GET /api/dashboard`, `POST /api/paypal/webhook`
- Screens: `/` S0 · `/pledge/new` S1 · `/pledge/[id]` S2 · `/pledge/[id]/proof` S3 · `/pledge/[id]/verdict` S4a/S4b · `/pledge/[id]/escape` S5 · `/dashboard` S6

## Deploy ($0): Turso free + Vercel Hobby
Local dev keeps a plain SQLite file (`DATABASE_URL=file:./commitpay.db`). Production uses a free Turso (hosted libSQL) DB so data survives serverless cold starts. No card needed for either. Vercel Hobby is "non-commercial" — fine for a hackathon demo.

1. **Turso DB** (pick one):
   - Vercel route (easiest): after step 2, Vercel project → **Storage → Marketplace → Turso → Create** (free plan) → connect to project. It injects the DB URL + token; make sure the names are `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (rename in Settings → Environment Variables if Vercel used a different prefix).
   - Turso direct: sign up at https://turso.tech (GitHub login, free) → Create Database `commitpay` (any region near the US, e.g. `aws-us-east-1`) → copy the `libsql://…turso.io` URL → **Create Token** (read/write). CLI alternative: `turso db create commitpay && turso db show commitpay --url && turso db tokens create commitpay`.
   - Tables are created automatically on first request (`CREATE TABLE IF NOT EXISTS`).
2. **Vercel**: https://vercel.com/new → Import GitHub `defiprince-bit/commitpay` → Framework Next.js, defaults → add env vars (Production):
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `PAYPAL_MODE=sandbox`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (US Business sandbox app), `GROQ_API_KEY` or `GEMINI_API_KEY`, `SESSION_SECRET` (long random string), `FEATURE_ANTI_CHEAT=1`, `FEATURE_ESCAPE_HATCH=1`. Do **not** set `DATABASE_URL` on Vercel. → **Deploy**.
3. Copy the production URL (`https://commitpay-xxx.vercel.app`) → set `NEXT_PUBLIC_APP_URL` to it (no trailing slash) → Deployments → **Redeploy**.
4. **PayPal webhook**: Developer Dashboard → sandbox app → Webhooks → Add `https://<your-app>.vercel.app/api/paypal/webhook` (PAYMENT.* + PAYOUTS events) → copy Webhook ID → set `PAYPAL_WEBHOOK_ID` on Vercel → Redeploy.
5. Smoke test: create pledge → authorize → proof → verdict → `/dashboard`; check rows in Turso dashboard → Data/Shell.

Notes: proof images are stored inline (data URL) in the DB; Vercel caps request bodies at ~4.5 MB, so keep uploads ≲3 MB. Fallbacks/costs: see `docs/devops.md`.
