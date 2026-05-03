# Photostudio Platform

## Rules for Claude

- Always check latest docs before writing code — use WebFetch/WebSearch for Next.js, Supabase, Paystack, Cloudflare R2.
- **Next.js 16**: middleware is `proxy.js` exporting `proxy()` (not `middleware()`). All request APIs (`cookies()`, `params`, `searchParams`) are fully async — always await them.
- **Supabase SSR**: use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not ANON_KEY). Server: always `supabase.auth.getUser()`, never `getSession()`. Wrap `setAll` in try-catch.

---

## What This Is

SaaS platform for Nigerian photography studios — public website, client gallery portal, booking, Paystack payments. Live at `https://photostudio.ng`. Basically Pixieset for Nigeria with Paystack instead of Stripe.

**Stack:** Next.js 16 (App Router), React 19, Tailwind v4, Supabase, Cloudflare R2, Paystack, Nodemailer/Gmail, Vercel.

**Pricing:** Free (website + subdomain) + Pro (₦10k/month or ₦100k/year, 14-day trial). Free gallery cap: 20 photos each.

**Contact:** email `photostudios@gmail.com` · WhatsApp `+2349133105749` — use these whenever adding contact info anywhere on the site. Privacy page at `/privacy`; no Terms page.

---

## Architecture Gotchas

- **Webhook → always `supabaseAdmin`** — session-based client silently fails in webhook context (no user session = RLS blocks everything).
- **`charge.success` fires for both bookings and subscriptions** — distinguish by `metadata.studio_id && metadata.billing`. No metadata = booking payment.
- **`subscription_customer_email` on studios row** — the only way to match `invoice.payment_succeeded` / `subscription.disabled` back to a studio (those events carry no studio_id).
- **Lightbox image positioning** — use `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`, NOT flex centering. iOS Safari flex container height is unreliable.
- **Mobile tap delay** — `touch-action: manipulation` on tappable photo elements eliminates 300ms delay.
- **Vercel subdomains** — wildcard `*.vercel.app` is NOT supported. Subdomain routing only works on `photostudio.ng`.
- **Paystack subaccount model** — platform takes 0% cut; Paystack settles to photographer's bank T+1. Pass `bearer: "subaccount"` in initializePayment.
- **Duplicate Paystack reference** — `/api/paystack/initialize` verifies with Paystack before reusing a reference; prevents 400 if payment already completed.
- **Image storage** — always two versions: compressed thumbnail (800px, ~100KB) for display; original in R2, served only on download.
- **PDF currency symbol** — `₦` (Naira sign U+20A6) is not in Helvetica's embedded glyph set; use `NGN ` as a text prefix instead or it renders as a box/blank.
- **`@react-pdf/renderer`** — must be in `serverExternalPackages` in `next.config.mjs`; Next.js webpack cannot bundle it and will error if it tries.

---

## Routing (`src/proxy.js`)

- Exports `proxy()` — not `middleware()`.
- `slug.photostudio.ng` → rewrites to `/studio-site/slug`
- `slug.localhost:3000` → rewrites to `/studio-site/slug` (local dev)
- Any other host → `/studio-site/custom/host` (custom domain path)
- Sets `x-is-studio-site: 1` header; root layout reads this to suppress platform nav/footer/WhatsApp widget.
- Direct path `/studio-site/*` also sets the header (Vercel testing workaround).

---

## Key Data Notes

- `studios.website_config` JSONB — stores theme, hero_style, portfolio_layout, section toggles, `hero_photo_id` (banner photo).
- `src/lib/themes.js` exports `THEMES`, `DEFAULT_CONFIG`, `resolveConfig(raw)` — merges saved config with defaults, safe for null.
- `subscription_billing` — `monthly` or `yearly`; set on first subscribe, drives admin billing display.
- `plan_expires_at` — set on renewal events only, not on initial subscription.
- Booking status flow: Pending → Confirmed (deposit paid) → Completed (balance paid). Manual buttons exist for cash/bank transfer payments; `status_updated_at` stamped on every change.
- Settlement timing: webhook fires instantly, bank receives T+1. UI shows "paid" immediately.
- Bio: 300 char hard limit (`maxLength`). Counter: amber at 280, red at 300.
- Client gallery role field: free-text `maxLength={10}`, optional. Was a dropdown — changed because role names vary too much across shoots.
- `PlanBadge` component is exported from `admin/page.jsx` (not its own file). Accepts `plan` + `billing` props.

---

## Webhook Event Map (`/api/paystack/webhook`)

| Event | Condition | Action |
|---|---|---|
| `charge.success` | metadata has `studio_id + billing` | Subscription → upgrade plan, log to `subscription_payments` |
| `charge.success` | no metadata | Booking payment → mark paid, unlock gallery if balance, send gallery-ready email |
| `invoice.payment_succeeded` | — | Renewal → extend `plan_expires_at`, log to `subscription_payments` |
| `subscription.disabled` | — | Downgrade to free |

---

## Deferred (do not build yet)

Custom domain support · Calendar availability · Automated payment reminders · Per-studio analytics · Electron desktop uploader · Watermarking
