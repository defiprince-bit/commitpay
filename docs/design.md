# CommitPay — system design

**Owner:** Architecture and design nerd  
**Stack:** Next.js App Router · PayPal REST (sandbox) · free LLM vision · SQLite / Vercel Postgres  
**Never cut:** authorize → void/capture → payouts · AI reject path · webhook verify

---

## 1. Money flow (PayPal)

```
Create pledge
    → POST /v2/checkout/orders  intent=AUTHORIZE
    → buyer approves (PayPal checkout / JS SDK)
    → POST …/orders/{id}/authorize
    → status AUTHORIZED  (funds held, not captured)

Proof / escape hatch
    ├─ AI ACCEPT or escape PASS
    │     → POST …/authorizations/{id}/void
    │     → status VOIDED  (buyer released)
    └─ AI REJECT or escape FAIL / second use
          → POST …/authorizations/{id}/capture
          → status CAPTURED
          → POST /v1/payments/payouts  (beneficiary email)
          → status PAYOUT_SENT | PAYOUT_FAILED
```

**Rules**
- One authorization per pledge. Never capture twice; never void after capture.
- Capture amount = full stake (no partials for hackathon).
- Payout = same USD amount to beneficiary PayPal email (sandbox).
- All money mutations only from verified webhooks **or** our own API after a successful PayPal call, then reconciled by webhook.
- Sandbox only for demo/judges (matches `devops.md`).

---

## 2. Pledge state machine

| Status | Meaning | Allowed next |
|--------|---------|--------------|
| `DRAFT` | Form filled, no PayPal yet | → `PENDING_AUTH` |
| `PENDING_AUTH` | Order created, waiting buyer | → `AUTHORIZED` / `AUTH_FAILED` |
| `AUTHORIZED` | Hold live | → `JUDGING` / `ESCAPE` / `EXPIRED` |
| `JUDGING` | Proof uploaded, AI running | → `VOIDED` / `CAPTURING` |
| `ESCAPE` | Escape interview in progress | → `VOIDED` / `CAPTURING` |
| `VOIDED` | Hold released | terminal |
| `CAPTURING` | Capture requested | → `CAPTURED` / `CAPTURE_FAILED` |
| `CAPTURED` | Funds taken | → `PAYING_OUT` |
| `PAYING_OUT` | Payout batch sent | → `PAYOUT_SENT` / `PAYOUT_FAILED` |
| `PAYOUT_SENT` | Beneficiary paid | terminal |
| `EXPIRED` | Auth window lapsed (optional) | terminal / re-auth later |

`escape_used: boolean` — set true after one attempt; UI disables “Life happened”.

---

## 3. Data model

### `pledges`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid pk | |
| `user_id` | text | hackathon: session / wallet-less email or anon cookie |
| `goal` | text | |
| `stake_usd` | numeric | display + PayPal amount |
| `currency` | text | `USD` |
| `proof_type` | enum | `photo` \| `link` \| `screenshot` |
| `period_end` | timestamptz | |
| `beneficiary_type` | enum | `charity` \| `friend` |
| `beneficiary_email` | text | PayPal receiver |
| `beneficiary_label` | text | charity name or friend label |
| `status` | text | state machine above |
| `escape_used` | bool | default false |
| `paypal_order_id` | text | |
| `paypal_auth_id` | text | authorization id |
| `paypal_capture_id` | text | nullable |
| `paypal_payout_batch_id` | text | nullable |
| `created_at` / `updated_at` | timestamptz | |

### `proofs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid pk | |
| `pledge_id` | fk | |
| `kind` | enum | `photo` \| `link` \| `screenshot` |
| `storage_url` | text | blob / public URL |
| `source_url` | text | nullable (Strava/GitHub/etc.) |
| `ai_verdict` | enum | `accept` \| `reject` \| `pending` |
| `ai_reasons` | json | string[] for UI bullets |
| `critic_flags` | json | stock / reused / ai-gen / day-mismatch |
| `created_at` | timestamptz | |

### `escape_sessions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid pk | |
| `pledge_id` | fk | unique per pledge |
| `transcript` | json | [{role, content}] |
| `verdict` | enum | `pass` \| `fail` \| `pending` |
| `created_at` | timestamptz | |

### `webhook_events`
| Column | Type | Notes |
|--------|------|-------|
| `paypal_event_id` | text pk | idempotency key |
| `event_type` | text | |
| `payload` | json | |
| `processed_at` | timestamptz | |

### `payout_log` (feeds AG Grid)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `pledge_id` | fk | |
| `amount_usd` | numeric | |
| `receiver` | text | |
| `status` | text | |
| `paypal_batch_id` | text | |
| `created_at` | timestamptz | |

---

## 4. API routes (App Router)

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/pledges` | Create draft + PayPal order (`intent=AUTHORIZE`); return `approve_url` / order id |
| `POST` | `/api/pledges/[id]/capture-auth` | After buyer return: authorize order → set `AUTHORIZED` + `paypal_auth_id` |
| `POST` | `/api/pledges/[id]/proof` | Upload / URL → create `proofs` row → enqueue judge |
| `POST` | `/api/pledges/[id]/judge` | Run vision + anti-cheat; accept → void; reject → capture → payout |
| `POST` | `/api/pledges/[id]/escape/start` | Start interview if `!escape_used` |
| `POST` | `/api/pledges/[id]/escape/message` | Next quiz turn; on final verdict void or capture+payout |
| `GET` | `/api/pledges/[id]` | Status for UI polling |
| `GET` | `/api/dashboard` | Rows for AG Grid (pledges + proofs + payout_log) |
| `POST` | `/api/paypal/webhook` | Verify signature → idempotent state updates |

**Client never calls void/capture/payout directly.** Only server routes + webhook.

---

## 5. Webhooks (align with `devops.md`)

**URL:** `https://<app>/api/paypal/webhook`  
**Verify:** PayPal `verify-webhook-signature` with `PAYPAL_WEBHOOK_ID` before any DB write.  
**Idempotent:** insert `webhook_events.paypal_event_id`; duplicate → 200 no-op.

| Event | App action |
|-------|------------|
| `PAYMENT.AUTHORIZATION.CREATED` | Confirm `AUTHORIZED` if not already |
| `PAYMENT.AUTHORIZATION.VOIDED` | Set `VOIDED` |
| `PAYMENT.CAPTURE.COMPLETED` | Set `CAPTURED`; if payout not started, start payout |
| `PAYMENT.CAPTURE.DENIED` / failed | Set `CAPTURE_FAILED`; surface in UI |
| `PAYMENT.PAYOUTSBATCH.*` / item events | Set `PAYOUT_SENT` or `PAYOUT_FAILED`; append `payout_log` |

Webhook is source of truth for terminal money states; API may optimistically set `CAPTURING` / `PAYING_OUT`.

---

## 6. AI judge + anti-cheat (U1)

**Input:** goal text, proof image/URL, optional EXIF day vs `period_end`.  
**Output JSON:** `{ verdict: accept|reject, reasons: string[], flags: { stock?, reused?, aiGenerated?, dayMismatch? } }`.  
**Policy:** any hard flag (stock / ai-gen / wrong day) → **reject** even if goal “looks” matched.  
**Cut if behind:** drop EXIF; keep vision critic only.

Accept → void auth. Reject → capture → payout (same path as escape fail).

---

## 7. Escape hatch (U2)

- At most one `escape_sessions` row per pledge.
- Short multi-turn quiz (3–5 questions). Pass → void. Fail → capture + payout.
- Second click when `escape_used` → refuse in API (`409`); UI already disabled.

---

## 8. Security / integrity

- PayPal secrets and LLM keys server-only.
- Webhook signature required; reject unsigned.
- Authorize amount must match `pledges.stake_usd` before capture.
- Beneficiary email validated; no user-controlled PayPal API URLs.
- File uploads: size/type cap; store outside git; scan optional later.

---

## 9. Demo mapping (money beats)

| Demo beat | System path |
|-----------|-------------|
| Fake gym photo → loss | proof → critic reject → capture → payout |
| Escape once → release | escape pass → void |
| Real proof → release | proof accept → void |
| Dashboard | `GET /api/dashboard` → AG Grid |

---

## Deliverable

This file: `/workspace/commitpay/design.md`  
Next (after kickoff): scaffold routes + PayPal client matching §4–5; DevOps owns env/webhook registration.
