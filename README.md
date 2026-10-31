# CommitPay — app

Stake money on a habit. PayPal **authorizes** a hold; an AI referee judges proof.
Accept → **void**. Reject → **capture** + **Payouts** to the beneficiary. One "Life happened" escape interview per pledge.

Parent docs (source of truth): [`../plan.md`](../plan.md) · [`../design.md`](../design.md) · [`../ui-screen-map.md`](../ui-screen-map.md) · [`../brand/visual-system.md`](../brand/visual-system.md) · [`../devops.md`](../devops.md)

## Run
```bash
cp .env.example .env.local   # leave PayPal/AI keys blank for demo mode
npm install
npm run dev                  # http://localhost:3000
```
SQLite file `commitpay.db` is created on first request (schema = design.md §3, in `lib/db.ts`).

## Demo mode (no keys)
- **PayPal:** no `PAYPAL_CLIENT_ID/SECRET` → `lib/paypal.ts` returns mock ORDER/AUTH/CAP/BATCH ids; "Authorize" skips PayPal checkout.
- **AI:** no `GROQ_API_KEY`/`GEMINI_API_KEY` → `lib/ai.ts` heuristic: image filename/URL containing `stock`, `fake`, `getty`, `unsplash`, `sample`, `ai-gen` → **reject**; anything else → accept. Escape: 3 questions; any answer < 4 words or "lazy/forgot/idk" → fail, else pass.
- **Webhook:** no `PAYPAL_WEBHOOK_ID` → signature check accepted only in demo mode; with live creds and no webhook id → 401.

Demo walk: New pledge → Authorize → Submit proof (`stock-gym.jpg`) → rejected, $20 → charity · New pledge → Life happened → specific answers → released · Dashboard (AG Grid).

## Sandbox (live)
Fill `PAYPAL_CLIENT_ID/SECRET` (sandbox app), `NEXT_PUBLIC_APP_URL`. Create → redirects to PayPal approve → returns to `/pledge/[id]/return` → server authorizes.
Payout receivers must be sandbox PayPal emails (edit `CHARITIES` in `app/pledge/new/page.tsx`). Webhooks need public HTTPS (`/api/paypal/webhook`, see devops.md); payout status becomes `PAYOUT_SENT` from webhook in live mode.

## Map
- `lib/paypal.ts` authorize / void / capture / payouts / verify-webhook · `lib/money.ts` void vs capture+payout (no double capture) · `lib/ai.ts` judge + anti-cheat + escape · `lib/db.ts` schema
- API: `POST /api/pledges`, `POST /api/pledges/[id]/{capture-auth,proof,judge,escape/start,escape/message}`, `GET /api/pledges/[id]`, `GET /api/dashboard`, `POST /api/paypal/webhook`
- Screens: `/` S0 · `/pledge/new` S1 · `/pledge/[id]` S2 · `/pledge/[id]/proof` S3 · `/pledge/[id]/verdict` S4a/S4b · `/pledge/[id]/escape` S5 · `/dashboard` S6
