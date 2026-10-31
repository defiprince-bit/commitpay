# CommitPay — visual system (v2)

**Direction:** Between **Stark** and **PayPal-blue**. Clean, calm, roomy — money language stays honest, UI stays friendly and uncluttered.

**Owner approval:** Douglas, Oct 31 2026  
**Inspired by:** owner refs in `brand/refs/` (layout hierarchy only — not crypto neon)

---

## One-line
Light-on-dark fintech calm: soft charcoal surfaces, **PayPal blue** for trust actions, **rose** only when money leaves. Lots of air. One job per screen.

---

## Color

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#0B1220` | App background (deep navy-charcoal, not pure black) |
| `surface` | `#121A2B` | Cards / panels |
| `surface-2` | `#1A2438` | Nested / table header |
| `border` | `#2A3548` | Hairlines only |
| `text` | `#F4F7FB` | Primary copy |
| `text-muted` | `#8B97AB` | Labels, hints |
| `brand` | `#0070E0` | PayPal-adjacent blue — primary CTA, links, active nav |
| `brand-soft` | `#0070E01F` | Soft fill behind active item / highlight chip |
| `danger` | `#E11D48` | Reject, capture, money out |
| `danger-soft` | `#E11D481A` | Reject banner wash |
| `ok` | `#0D9488` | Hold released / void (teal, not neon green) |
| `ok-soft` | `#0D94881A` | Success wash |

**Do not use:** lime neon, multi-color gradients on cards, rainbow charts.

---

## Type & space

- Font: Inter (or system UI). Amounts: tabular lining figures, **display size** on stake/status.
- Page padding: 24–32px. Card gap: 16–20px. Max content width ~1120px.
- **Density rule:** if a screen has more than one primary CTA or more than ~6 form fields visible, split or progressive-disclose.
- Sidebar (desktop): narrow, ~220px; soft active state with `brand-soft` + left bar — from refs, not glass blur stacks.

---

## Components

- **Cards:** 16px radius, 1px `border`, no heavy shadow. Optional very subtle blue glow only on the *money-at-risk* hero card.
- **Buttons:** Primary = `brand` fill, white text. Secondary = ghost border. Danger = `danger` fill.
- **Status chips:** `AUTHORIZED` (blue soft), `VOIDED` (ok soft), `CAPTURED` / `PAYOUT` (danger soft).
- **Tables (AG Grid):** surface-2 header, zebra optional, generous row height — never cramped sparklines circus.
- **Proof / reject:** danger banner + short reason list; no emoji clutter.

---

## Tone of copy (UI)

Still blunt, but not hostile:
- “$20 on hold” ✓  
- “Proof didn’t clear — $20 goes to {beneficiary}” ✓  
- Avoid “Oops!” and avoid all-caps shout walls.

---

## What we take from the refs / what we drop

| Take | Drop |
|------|------|
| Left nav + clear sections | Crypto ticker spam |
| Big metric numbers | Neon green glow stacks |
| Soft rounded cards | Congested multi-panel walls |
| One accent color family | Glass-on-glass blur soup |

---

## Screens

Screen list + demo path still live in `/workspace/commitpay/ui-screen-map.md` — tokens there should match this file (updated to v2).

## v3 — denser fintech (2026-10-31)
- Desktop (md+): **left sidebar 220px required** — sections (Overview / Pledges / Learn), active item = `brand-soft` pill + 2px brand inset bar. Top header strip with breadcrumb + one "New pledge" CTA.
- Mobile: slim sticky top bar (logo + New + Dashboard). No bottom tab bar.
- Cards: `shadow-card` subtle depth; `.card-hero` adds brand radial glow — max one hero per screen.
- Big metrics: `.eyebrow` label (11px uppercase) + 5xl–7xl tabular number + 1-line muted caption.
- Verdict banners: danger/ok soft wash + matching soft colored shadow; calm copy.
- Motion: 150–180ms colour/translate on hover/focus; page fade+4px rise. No neon, no tickers, no glass-on-glass.

## v4 — Type, icons, motion (2026-10-31)
- Fonts: Geist Sans (UI + display, via `geist` next/font, `--font-geist-sans`) + Geist Mono (amounts, tabular, `.amount`). Inter removed. Headlines tracking -0.035 to -0.045em, weight 600.
- Icons: lucide-react everywhere (nav, CTAs, card eyebrows, reasons). Wordmark = blue 32px rounded square with ShieldCheck + "CommitPay".
- Motion: framer-motion via `components/motion.tsx` (MotionRoot w/ reducedMotion="user", FadeIn/Item stagger, Lift hover -3px spring, Press tap 0.97, CountUp amounts). Route enter fade/slide 350ms. Durations 200–450ms, ease [0.22,1,0.36,1]. CSS honors prefers-reduced-motion.
- Verdict: staged — hero scales in → icon springs → title → count-up amount → reasons stagger (accent bar + X/Check icon, hover nudge) → CTAs. Status chip soft-pulses.
- Colors unchanged.

## v5 — Keel story + iOS
- **Two shells.** Marketing `/` (`app/(marketing)`): full-bleed, near-black #050505, no sidebar, a floating glass capsule bar (MarketingNav). App (`app/(app)`: /dashboard, /pledge/*; /app redirects to /dashboard): AppShell on #0B1220 with a frosted sidebar and sticky header.
- **Type.** Geist Sans (light, tight tracking for display) + Geist Mono (uppercase, 0.18em tracking for eyebrows and badges) + Instrument Serif italic (`.mk-em`, #0070E0) on one punchline per headline.
- **Particle orb** (`components/ParticleOrb.tsx`): a 2D canvas Fibonacci sphere of about 1600 dots (white/grey plus about 7% brand-blue large dots), a tilted brand ring and a radial blue glow. It rotates slowly, follows the pointer with parallax and a slight pull, and fades in. Shows a static orb under reduced motion.
- **Story.** Chapters sit on a vertical hairline spine with glowing brand dots, revealed on scroll (`Reveal`): problem → how (`Steps` accordion + stat card) → referee → PayPal → FAQ → ender CTA.
- **Feature lists** use hairline two-column rows, not cards. Pills: white filled primary, hairline ghost. Stats use big extralight numerals.
- **App.** Card radius is 20px, with frosted chrome. No Keel red and no neon.
