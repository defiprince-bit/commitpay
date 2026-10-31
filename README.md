# CommitPay — app

Stake money on a habit. PayPal **authorizes** a hold; an AI referee judges proof.
Accept → **void**. Reject → **capture** + **Payouts** to the beneficiary. One "Life happened" escape interview per pledge.

Docs: [`docs/plan.md`](docs/plan.md) · [`docs/design.md`](docs/design.md) · [`docs/ui-screen-map.md`](docs/ui-screen-map.md) · [`docs/brand/visual-system.md`](docs/brand/visual-system.md) · [`docs/devops.md`](docs/devops.md)

Requires **Node 20** (`.nvmrc`). `better-sqlite3` is a native module; it builds on `npm install` (prebuilt binaries for Linux/macOS x64/arm64).

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

## Deploy on Render
Uses `better-sqlite3` → needs a long-running Node server + disk (not Vercel serverless).

1. Render Dashboard → **New → Blueprint** → connect GitHub `defiprince-bit/commitpay` → it reads `render.yaml` (web service `commitpay`, Node 20, disk `/data`, `DATABASE_URL=file:/data/commitpay.db`).
   - Manual alternative: New → Web Service · Build `npm ci && npm run build` · Start `npm start` · env `NODE_VERSION=20` · Disks → mount `/data` (1 GB).
   - Persistent disks need a paid instance (Starter). On **Free**, set plan free and remove the disk; data resets on deploy/spin-down.
2. Fill the prompted secrets (dashboard only, never in git): `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (US Business sandbox app), `GROQ_API_KEY` or `GEMINI_API_KEY` (optional), `NEXT_PUBLIC_APP_URL=https://<service>.onrender.com`. `SESSION_SECRET` is auto-generated. Blank PayPal/AI keys = demo mode.
3. Deploy → open `https://<service>.onrender.com`.
4. PayPal Developer → your sandbox app → Webhooks → add `https://<service>.onrender.com/api/paypal/webhook` (all events or PAYMENT.* / PAYOUTS*) → copy Webhook ID → set `PAYPAL_WEBHOOK_ID` → Manual Deploy / restart.
5. Smoke test: create pledge → authorize → proof → verdict → `/dashboard`.
