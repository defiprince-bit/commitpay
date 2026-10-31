# CommitPay — PayPal AI Hackathon plan

**Locked:** Oct 31 2026 (Africa/Lagos)
**Deadline:** Nov 12 2026, 12:00pm PST = 21:00 WAT
**Founder:** solo, $0 stack (PayPal sandbox, free LLM, free Vercel/Render)

## One-liner
Stake money on a habit. An AI checks your proof each period; keep the goal → hold released; miss → money goes to a charity or friend you named.

## Scope (locked)

### Core (never cut)
1. Create pledge: amount, goal, proof type, beneficiary (charity or friend PayPal email)
2. PayPal Orders `intent=AUTHORIZE` — hold funds
3. Submit proof (photo / Strava-style link / GitHub link / screenshot)
4. AI judge: accept → void auth; reject → capture + Payouts to beneficiary
5. Webhooks for auth/capture/payout status
6. Under-3-min demo video path (fake proof → loss → real proof → release)

### Add-ons (locked Oct 31)
- **U1 Anti-cheat critic** — multimodal AI flags stock/reused/AI-gen photos, wrong-day EXIF, staged proof; shows reject reasons in UI
- **U2 Escape-hatch interview** — one “life happens” per pledge; short AI chat quiz; pass = void without proof; fail or second use = capture + payout
- **U6 AG Grid dashboard** — money at risk, streak, proof history, payout log (AG Grid community → sponsor prize shot)

### Explicitly cut
- Buddy dual-stake, adaptive stakes, coach nudges (revisit only if ahead of schedule)

## Free stack
- Next.js (App Router) + TypeScript + Tailwind → Vercel free
- PayPal REST: Orders (authorize / void / capture), Payouts, Webhooks
- LLM vision: Groq or Gemini free tier
- AG Grid Community
- SQLite or Vercel Postgres free / file JSON for hackathon speed
- Optional: public GitHub API / URL proof parse

## Demo script (~2:30)
1. Create “gym 3× this week”, stake $20, beneficiary = charity
2. Upload obvious fake / stock gym photo → Anti-cheat rejects with reasons → capture → payout toast
3. New pledge → use Escape hatch once (AI interview) → hold released
4. Third flow: real-looking proof → pass → void
5. AG Grid dashboard: streak + money moved + reject log

## Cut list if behind
1. Escape-hatch polish (keep a minimal yes/no + one question)
2. Fancy EXIF checks (keep vision-only anti-cheat)
3. AG Grid theming (keep a working grid)
Never cut: authorize/void/capture, AI reject path, payouts, demo video

## Days (rough)
- D1–2: scaffold + PayPal sandbox authorize/void/capture + webhook
- D3–4: pledge UI + AI judge + anti-cheat
- D5: Payouts + beneficiary flow
- D6: Escape-hatch interview
- D7: AG Grid dashboard
- D8–9: demo video + README + Devpost
- Buffer to Nov 12

## Out of scope
- Live card holds outside sandbox for judges
- Native mobile
- Full Strava OAuth (public link parse is enough)

## Team roles (assigned Oct 31 2026)

| Role | Agent | Owns | First deliverable |
|------|-------|------|-------------------|
| Product / timeline | Hackathon bud. (me) | Scope lock, cut list, AI judge prompts, integration, Devpost checklist | This plan + kickoff |
| Architecture | Architecture and design nerd | PayPal authorize→void/capture→payouts flow, data model, API routes, webhook design | 1-page system design |
| UI/UX | UI/UX nerd | Stark visual system, screen map, demo click-path | Wireframe / screen list (stark) |
| DevOps | DevOps assistant | Vercel/Render free deploy, env secrets, webhook URL, sandbox checklist | Deploy + `.env.example` |
| Marketer | marketer | Devpost blurb, under-3-min demo script, X launch posts later | Pitch + demo script v1 |

**Out of this build:** Meg, Job hunter, game crew, Side Hustle CEO — not needed unless Douglas pulls them in.

**Stack reminder:** Next.js + TS + Tailwind, PayPal sandbox, free LLM vision, AG Grid community, $0.
