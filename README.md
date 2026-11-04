# CommitPay

Stake money on a habit. PayPal **authorizes** a hold; an AI referee judges proof.
Accept → **void**. Reject → **capture** + **Payouts** to the beneficiary.
One “Life happened” escape interview per pledge.

**Live demo:** https://commitpay-theta.vercel.app  
**Stack:** Next.js · PayPal sandbox (authorize / void / capture / Payouts) · Groq AI · AG Grid · Turso · Vercel Hobby

Docs: [`docs/plan.md`](docs/plan.md) · [`docs/design.md`](docs/design.md) · [`docs/ui-screen-map.md`](docs/ui-screen-map.md) · [`docs/brand/visual-system.md`](docs/brand/visual-system.md) · [`docs/devops.md`](docs/devops.md)

Requires **Node 20** (`.nvmrc`).

## Production status

Production runs on Vercel with:

- PayPal **sandbox** REST app (`PAYPAL_CLIENT_ID` / `SECRET`, `PAYPAL_MODE=sandbox`, webhook registered)
- **Groq** (`GROQ_API_KEY`) for the proof judge and escape interview (text model `qwen/qwen3.8-27b` by default)
- Turso (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`) — do not set `DATABASE_URL` on Vercel

The AI path is live when `GROQ_API_KEY` (or `GEMINI_API_KEY`) is set. Without those keys, local runs fall back to a filename heuristic so the UI still works offline — that fallback is **not** what production uses.

## Run locally
```bash
cp .env.example .env.local
# fill PAYPAL_* and GROQ_API_KEY for a full sandbox + AI loop
npm install
npm run dev   # http://localhost:3000
```

Local DB defaults to a SQLite file (`DATABASE_URL=file:./commitpay.db`), created on first request.

### Env (see `.env.example`)

| Variable | Purpose |
|---|---|
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Sandbox REST app |
| `PAYPAL_MODE` | `sandbox` |
| `PAYPAL_WEBHOOK_ID` | From PayPal webhook registration |
| `NEXT_PUBLIC_APP_URL` | Public HTTPS origin (no trailing slash) |
| `GROQ_API_KEY` | AI judge + escape interview |
| `GROQ_TEXT_MODEL` | Optional override (default `qwen/qwen3.8-27b`) |
| `GROQ_VISION_MODEL` | Optional; set if your Groq key has a vision model |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Production DB only |
| `SESSION_SECRET` | Long random string |
| `FEATURE_ANTI_CHEAT` / `FEATURE_ESCAPE_HATCH` | Defaults on (`1`) |

## How the money loop works

1. Create pledge → PayPal **authorize** hold  
2. Submit proof → Groq AI judges (anti-cheat flags stock / reused / AI-gen / day mismatch)  
3. Accept → **void** hold · Reject → **capture** + **Payouts** to beneficiary  
4. Optional once: “Life happened” escape interview → pass voids, fail still pays out  
5. Dashboard (AG Grid) shows at-risk / paid-out / streak

Webhook: `POST /api/paypal/webhook` moves payout status to `PAYOUT_SENT` / `PAYOUT_FAILED` from verified events.

## Local offline mode (optional)

If you leave PayPal and AI keys blank, the app still boots for UI work:

- PayPal calls return mock ids (no checkout redirect)
- AI uses a filename heuristic (`stock`, `fake`, `getty`, `unsplash`, `sample`, `ai-gen` → reject)
- Webhook signature checks are relaxed only in that mode

Use this for screens only. Judges should use the **hosted demo** or a local run with real sandbox + Groq keys.

## Code map

- `lib/paypal.ts` — authorize / void / capture / payouts / verify-webhook  
- `lib/money.ts` — void vs capture+payout (no double capture)  
- `lib/ai.ts` — Groq/Gemini judge, anti-cheat, escape interview  
- `lib/db.ts` — schema  
- Screens: `/` · `/pledge/new` · `/pledge/[id]` · `/pledge/[id]/proof` · `/pledge/[id]/verdict` · `/pledge/[id]/escape` · `/dashboard`

## Deploy ($0): Turso + Vercel Hobby

1. Create a free Turso DB; set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` on Vercel (no `DATABASE_URL`).  
2. Import `defiprince-bit/commitpay` on Vercel; set PayPal sandbox, `GROQ_API_KEY`, `SESSION_SECRET`, feature flags.  
3. Set `NEXT_PUBLIC_APP_URL` to the deployment URL and redeploy.  
4. Register PayPal webhook → `https://<app>.vercel.app/api/paypal/webhook` → set `PAYPAL_WEBHOOK_ID` → redeploy.  

Proof images are stored inline (data URL); keep uploads ≲3 MB (Vercel body limit ~4.5 MB).

## License

MIT — see [`LICENSE`](LICENSE).
