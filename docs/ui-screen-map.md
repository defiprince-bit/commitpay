# CommitPay — UI screen map + demo click-path

**Owner:** UI/UX nerd  
**Locked aesthetic:** **Stark × PayPal-blue** — clean, roomy, trust-blue CTAs; rose only when money leaves. Hierarchy from fintech refs; no crypto neon clutter.

**Deliverable date:** Oct 31 2026  
**Build:** wait for kickoff (this file is design-only)

---

## Visual system (v2 — stark × PayPal-blue)

Full tokens: `/workspace/commitpay/brand/visual-system.md`

| Token | Rule |
|-------|------|
| Background | Deep navy-charcoal `#0B1220` (not pure black) |
| Surface | `#121A2B` + hairline `#2A3548`, 16px radius |
| Brand | PayPal-adjacent blue `#0070E0` — primary CTAs, active nav |
| Danger | `#E11D48` only when money leaves / reject |
| Released | Teal `#0D9488` soft chip — calm, not neon |
| Type | Inter; large tabular amounts; roomy 24–32px page pad |
| Layout | One primary action per screen; max ~6 fields visible |
| Motion | 150ms fade. No confetti, no crypto neon |

**Copy tone:** honest and calm. “$20 on hold.” “Proof didn’t clear — $20 goes to {beneficiary}.”

---

## Screen map

### S0 — Landing / start
- One headline: **Stake money. Keep the habit. Or lose it.**
- Primary CTA: **Create a pledge**
- Secondary (muted): How it works (3 lines: authorize → AI checks proof → void or pay out)

### S1 — Create pledge
Fields (stark form, labels above):
1. Goal (text) — e.g. “Gym 3× this week”
2. Stake amount (USD) — large input
3. Proof type — radio: Photo · Link (Strava/GitHub/URL) · Screenshot
4. Period (simple: this week / next 7 days)
5. Beneficiary — Charity (preset list) **or** Friend PayPal email
- Footer sticky: **Authorize $X hold** → PayPal sandbox checkout
- Microcopy under CTA: “Funds held, not charged, until the AI decides.”

### S2 — Hold confirmed
- Big amount: **$20 on hold**
- Goal + beneficiary one-liners
- Status chip: `AUTHORIZED`
- Primary: **Submit proof**
- Secondary: **Life happened** (escape hatch — one use; disabled after used)
- Link: Dashboard

### S3 — Submit proof
- Goal reminder + stake amount always visible (header bar)
- Dropzone / file pick / URL field matching proof type
- Primary: **Send to AI**
- No preview fluff beyond the image/URL itself

### S4a — Anti-cheat REJECT (core demo beat)
- Full-bleed danger header: **Proof rejected**
- Stake line: **Capturing $20 → {beneficiary}**
- Reason list (from critic), plain bullets, e.g.:
  - Stock / reused photo likely
  - Does not match goal context
  - Timestamp / day mismatch (if available)
- Status: `CAPTURED` → `PAYOUT SENT` (or pending webhook)
- Primary: **View dashboard**
- No “try again on this pledge” if money already moved (create new pledge instead)

### S4b — AI ACCEPT (void)
- Stark success (not cute): **Hold released**
- **$20 returned to you**
- Status: `VOIDED`
- Primary: **Dashboard**

### S5 — Escape hatch (one per pledge)
Entry from S2 secondary.
- Title: **Life happened**
- Sub: “One honest emergency per pledge. Pass the short interview → hold released. Fail or use twice → money goes out.”
- Chat-style but stark: AI asks 2–4 short questions (yes/no + one free-text)
- Progress: `1 of 1 escape used` after start
- Outcomes:
  - **Pass** → same as S4b void
  - **Fail** → same money path as S4a (capture + payout)
  - Second attempt blocked: “Escape already used.”

### S6 — AG Grid dashboard
- Page title: **Accountability**
- Top strip (3 numbers, huge): Money at risk · Streak · Money paid out
- AG Grid Community table columns:
  - Pledge / Goal
  - Stake
  - Status (`AUTHORIZED` / `VOIDED` / `CAPTURED` / `PAYOUT`)
  - Proof result (pass / reject + short reason)
  - Escape used? (Y/N)
  - Updated
- Row click → pledge detail (S2 state for that pledge)
- Empty state: “No pledges yet.” + Create CTA

### Out of UI scope (for now)
- Buddy dual-stake, coach nudges, native mobile, fancy EXIF chrome (vision reasons text is enough)

---

## Demo click-path (under ~2:30)

Aligned with `plan.md` demo script. Film on **sandbox**, stark theme, no test badges.

| Beat | Time | Screen | Action | What judges see |
|------|------|--------|--------|-----------------|
| 1 | 0:00–0:25 | S0 → S1 → PayPal → S2 | Create “Gym 3× this week”, stake **$20**, beneficiary = charity, authorize | Hold confirmed, `$20 on hold` |
| 2 | 0:25–1:00 | S2 → S3 → **S4a** | Upload obvious fake/stock gym photo → Send to AI | Reject reasons → capture → payout toast/status |
| 3 | 1:00–1:40 | S1 → S2 → **S5** → S4b | New pledge → **Life happened** → pass interview | Hold released without proof |
| 4 | 1:40–2:10 | S1 → S3 → **S4b** | Third pledge → real-looking proof → pass | Void / money back |
| 5 | 2:10–2:30 | **S6** | Open dashboard | Streak + money moved + reject log in AG Grid |

**Cut if filming runs long:** Beat 4 (real proof) can be a 5s dashboard flash of a prior VOIDED row — never cut Beat 2 (reject → payout) or Beat 5 (grid).

---

## Build handoff (when kickoff lands)

1. Implement screens S0–S6 in this order: S1/S2 → S3/S4a → S4b → S5 → S6  
2. Wire copy strings exactly as above where possible (marketer may tighten pitch; UI stays blunt)  
3. Theme: Tailwind tokens from Visual system table — no NairaGuard glass reuse  
4. Escape hatch CTA label stays **Life happened** (product language from plan)

**File:** `/workspace/commitpay/ui-screen-map.md`
