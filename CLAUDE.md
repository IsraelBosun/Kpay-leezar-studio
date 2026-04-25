# Lumis Studio Platform — Project Bible

## Rules for Claude

- **Always check the latest documentation** before writing code for any library or framework. Do not rely solely on training data — use WebFetch or WebSearch to verify current API patterns, especially for Next.js, Supabase, Paystack, and Cloudflare R2. My knowledge cutoff is August 2025; this project uses libraries that may have changed since then.
- **Next.js 16 specifics**: middleware is now `proxy.js` exporting `proxy()`, not `middleware()`. All request APIs (`cookies()`, `params`, `searchParams`) are fully async — always await them.
- **Supabase SSR**: use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not ANON_KEY). Always use `supabase.auth.getUser()` on the server — never `getSession()`. Wrap `setAll` in try-catch in server components.

---

## What We Are Building

A SaaS platform that gives Nigerian photography studios their **entire digital presence and business infrastructure in one subscription** — professional website, client gallery portal, online booking, and Paystack payments.

Most Nigerian photography studios have no website, send galleries via WhatsApp or Google Drive, chase clients manually for photo selections, and collect payments via bank transfer with no tracking. This platform solves all of that in one place.

**Core pitch:**
> "Sign up, fill in your details, upload your photos — your studio is live in 10 minutes. No web designer needed, no developer needed, no separate software."

---

## Target Market

- Nigerian photography studios (Lagos, Abuja, Port Harcourt primarily)
- Studios with no existing website — this is their first digital presence
- Photographers doing weddings, portraits, events, commercial work
- Distributed via Instagram content + direct DM outreach

---

## Product Planes

### Plane 1 — Public Studio Website
Each studio gets a fully branded public-facing website automatically on signup.

**Features:**
- Portfolio gallery with category filters (Weddings, Portraits, Events, Commercial)
- Services and pricing page
- About / bio page
- Contact form that feeds into their dashboard
- Online booking with calendar availability
- Hosted at `studioslug.photostudio.ng` (free) or custom domain (pro)

**Subdomain + Custom Domain routing:**
- Free plan: `lumis.photostudio.ng`
- Pro plan: custom domain e.g. `lumisstudio.com`
- Next.js middleware reads the subdomain or custom domain, looks up the studio in Supabase, renders their branded site
- Studio A never sees Studio B's data (Supabase row-level security)

### Plane 2 — Client Gallery Portal
After a shoot the photographer uploads photos and the client gets a private link.

**Features:**
- Password-protected private gallery per client e.g. `photostudio.ng/gallery/sarah-john-wedding`
- Fast-loading compressed thumbnails (optimised for mobile data — ~100KB per image)
- Photo selection with heart/favourite icon
- Multiple people (bride + family) can open same link and submit their picks independently
- Photographer sees all selections consolidated in one view
- One-tap share of selection list to WhatsApp
- Notes/comments on selected photos
- Gallery unlocks for full-resolution download only after payment is complete

**Image handling:**
- Every uploaded photo automatically generates two versions:
  - Compressed thumbnail (800px wide, ~100KB) — shown in gallery
  - Original full resolution — stored in R2, only served on download request
- Blur-up loading for perceived performance on slow mobile data

### Plane 3 — Paystack Payments
Full payment flow in Naira, no manual bank transfer chasing.

**Features:**
- Photographer sets deposit amount when creating a booking
- Client pays deposit online → session confirmed
- Balance collected after shoot, before gallery is unlocked
- Auto-generated invoice sent via email (Resend)
- Dashboard shows paid / pending / overdue at a glance
- Payment reminders sent automatically

---

## Full Feature Set (Complete Product Vision)

### Photographer Admin Dashboard
- Manage and view all bookings
- Upload and organise client galleries
- View client photo selections consolidated per gallery
- Track payment status (paid / deposit paid / unpaid / overdue)
- Calendar view of upcoming sessions
- Notifications when client completes photo selection

### Desktop Uploader App (Electron — later phase)
- Folder picker pointing directly to Lightroom export folder
- Bulk upload with progress tracking per photo
- Chunked upload handling for heavy DSLR files (20–50MB each)
- Runs in background while photographer works on other things
- Auto-creates client gallery on upload completion
- 5 parallel uploads at a time for speed

### Storage & Performance
- Cloudflare R2 for image storage (cheap, fast CDN globally)
- Auto-generated compressed thumbnails on upload
- Full resolution only downloaded on client request
- Watermarking support (optional per studio)
- Chunked + resumable uploads — if connection drops it resumes, not restarts

### Multi-Studio SaaS Layer
- Each studio has isolated data (Supabase row-level security)
- Each studio gets their own subdomain
- Pro plan unlocks custom domain
- Studio onboarding flow completes in under 10 minutes

---

## Studio Onboarding Flow (10 minutes to live)

```
Step 1 — Studio name + city/location
Step 2 — Upload logo + choose accent colour
Step 3 — Write bio (template provided if needed)
Step 4 — Add services + pricing
Step 5 — Upload 6–10 portfolio photos (drag and drop)
     ↓
"Your website is live at lumis.photostudio.ng 🎉"
     ↓
Studio shares link on Instagram immediately
```

---

## Pricing Plans

Two tiers only — Free and Pro. Pro has two billing options.

| Feature | Free | Pro |
|---|---|---|
| Studio website | ✅ | ✅ |
| Subdomain (`yourstudio.photostudio.ng`) | ✅ | ✅ |
| Custom domain | ❌ | ✅ |
| Client galleries | Unlimited (20 photos each) | Unlimited |
| Online booking | ❌ | ✅ |
| Paystack payments | ❌ | ✅ |
| Email notifications to clients | ✅ | ✅ |

**Pro pricing:**
- Monthly: ₦10,000/month
- Yearly: ₦100,000/year (₦8,333/mo — saves ₦20,000)

**14-day free trial** included on signup — full Pro access, no card required. After trial ends, must upgrade to keep booking and payments.

Free plan is the hook — studio gets a real website instantly, upgrades when they want booking and payments.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend + API | Next.js (App Router) | Already using it, handles both UI and API routes |
| Database | Supabase (PostgreSQL) | Auth, row-level security, real-time, generous free tier |
| Image storage | Cloudflare R2 | Cheapest object storage, global CDN, no egress fees |
| Payments | Paystack | Naira payments, widely used in Nigeria, clean API |
| Email | Resend | Transactional emails — booking confirmed, gallery ready, payment reminders |
| Hosting | Vercel | Handles subdomain wildcard routing, scales automatically |
| Desktop app | Electron (later phase) | Cross-platform, accesses local file system for Lightroom exports |
| Image processing | Cloudflare Images or Sharp | Auto-resize + compress on upload |

---

## Database Schema (Core Tables)

```sql
-- Studios (one row per photography business)
studios
  id, name, slug, custom_domain, plan (free/pro),
  logo_url, accent_color, bio,
  location, email, phone, instagram_url,
  website_config JSONB,
  paystack_subaccount_code, paystack_bank_name,
  paystack_bank_code, paystack_account_number, paystack_account_name,
  subscription_status (active/disabled),
  subscription_customer_email,   ← used to match renewal/cancellation webhooks
  subscription_billing (monthly/yearly),
  plan_expires_at,               ← populated on renewal events
  created_at

-- Studio services
services
  id, studio_id, title, description, price, currency

-- Bookings
bookings
  id, studio_id, client_name, client_email, client_phone,
  service_id, session_date, status (pending/confirmed/completed/cancelled),
  notes, deposit_amount, deposit_paid, balance_amount, balance_paid,
  status_updated_at, created_at

-- Client galleries
galleries
  id, studio_id, booking_id, title, slug,
  password_hash, is_locked (true until balance paid),
  created_at

-- Photos
photos
  id, gallery_id, studio_id,
  original_url, thumbnail_url,
  file_name, file_size,
  uploaded_at

-- Portfolio photos (public website, separate from gallery photos)
portfolio_photos
  id, studio_id, src, thumbnail_url, category, sort_order, created_at

-- Photo selections (per person per gallery)
selections
  id, gallery_id, photo_id,
  selector_name, selector_role (bride/groom/family),
  note, created_at

-- Booking payments (deposit + balance from clients)
payments
  id, booking_id, studio_id,
  amount, currency, type (deposit/balance),
  paystack_reference, status (pending/paid/failed),
  paid_at

-- Subscription payments (platform revenue — studio → platform)
subscription_payments
  id, studio_id, amount (Naira), billing (monthly/yearly),
  paystack_reference, paid_at

-- Studio users (photographer accounts)
users
  id, studio_id, email, role (owner/editor)
```

---

## Project Folder Structure (Scaffolded)

```
src/
  app/
    (marketing)/              ← public studio website (dynamic per studio)
      page.js                 ← homepage
      gallery/page.jsx        ← portfolio gallery
      contact/page.jsx        ← contact + booking form
      pricing/page.jsx        ← services and pricing

    (studio)/                 ← photographer admin dashboard (auth required)
      dashboard/page.jsx      ← overview + stats
      bookings/page.jsx       ← all bookings list
      bookings/[id]/page.jsx  ← single booking detail
      galleries/page.jsx      ← all galleries
      galleries/[id]/page.jsx ← manage single gallery + view selections
      payments/page.jsx       ← payment tracking
      settings/page.jsx       ← studio profile, domain, branding
      upload/page.jsx         ← web uploader (before desktop app)

    (client)/                 ← client gallery portal (password protected)
      gallery/[slug]/page.jsx ← client views and selects photos

    auth/
      login/page.jsx
      signup/page.jsx
      onboarding/page.jsx     ← 5-step studio setup flow

    api/
      paystack/
        webhook/route.js      ← receives Paystack payment events
        initialize/route.js   ← creates payment link
      galleries/
        upload/route.js       ← handles photo uploads to R2
        thumbnail/route.js    ← triggers thumbnail generation
      bookings/
        route.js

  components/
    marketing/                ← existing public site components
      HeroSection.jsx
      AboutSection.jsx
      ServicesSection.jsx
      PortfolioPreview.jsx
      StatsSection.jsx
      TestimonialsSection.jsx
      CTASection.jsx
      MarqueeStrip.jsx
      Navbar.jsx
      Footer.jsx

    studio/                   ← dashboard UI
      Sidebar.jsx
      BookingCard.jsx
      GalleryGrid.jsx
      UploadZone.jsx
      PaymentBadge.jsx
      CalendarView.jsx

    client/                   ← gallery portal UI
      PhotoGrid.jsx
      PhotoCard.jsx
      SelectionSummary.jsx
      WhatsAppShareButton.jsx
      DownloadModal.jsx

    ui/                       ← shared primitives
      Button.jsx
      Input.jsx
      Modal.jsx
      Badge.jsx
      Spinner.jsx

  lib/
    supabase.js               ← Supabase client (server + browser)
    paystack.js               ← payment helpers
    r2.js                     ← Cloudflare R2 upload/download helpers
    thumbnail.js              ← image compression helpers
    middleware.js             ← subdomain + custom domain routing

  middleware.js               ← Next.js edge middleware (root level)
```

---

## Subdomain Routing Logic (Middleware)

```
Request arrives at photostudio.ng
     ↓
middleware.js checks the hostname
     ↓
Is it a subdomain? (lumis.photostudio.ng)
  → extract "lumis" → query Supabase for studio where slug = "lumis"
  → rewrite to /(marketing) routes with studio context

Is it a custom domain? (lumisstudio.com)
  → query Supabase for studio where custom_domain = "lumisstudio.com"
  → rewrite to /(marketing) routes with studio context

Is it the root domain? (photostudio.ng)
  → render the SaaS landing page (signup / pricing / about the platform)
```

---

## Build Phases

### Phase 1 — Foundation (Build first)
1. Scaffold full project structure
2. Supabase setup — tables, auth, row-level security
3. Studio onboarding flow (5 steps, studio goes live)
4. Subdomain routing middleware
5. Dynamic public studio website (pulled from database)
6. Basic admin dashboard (view bookings, manage gallery)

### Phase 2 — Client Gallery + Payments
1. Photo upload to R2 with chunked handling
2. Auto thumbnail generation on upload
3. Client gallery portal (password protected)
4. Photo selection with hearts + multi-person support
5. WhatsApp share of selection list
6. Paystack deposit + balance collection
7. Gallery unlock on payment
8. Invoice emails via Resend

### Phase 3 — Polish + Scale
1. Custom domain support
2. Calendar availability for bookings
3. Payment reminders (automated)
4. Analytics per studio (views, bookings, revenue)
5. Desktop uploader app (Electron)
6. Watermarking support

---

## Marketing Strategy

**Primary channel: Instagram**
- Screen recordings of animated studio websites (marquee, Ken Burns hero, stats)
- "What your photography business could look like" content
- Behind the scenes of building
- Before/after — WhatsApp chaos vs organised platform

**Direct outreach:**
- DM 10 Nigerian photographers per day on Instagram
- Offer free 3-month beta trial in exchange for feedback
- First 5 studios are free forever (founding members)

**Growth:**
- Nigerian photographers talk to each other at weddings and events
- One happy studio recommending to five others compounds fast
- Word of mouth is the primary growth engine

**Timeline:**
- Now → Start Instagram, post the Lumis demo
- Month 1–2 → Build Phase 1, onboard 3–5 free beta studios
- Month 3 → Launch SaaS landing page, start charging
- Month 4+ → Word of mouth + Instagram compounds

---

## Current State of Codebase

Full platform is live and functional at `https://photostudio.ng`. The product is essentially what Pixieset does, built specifically for the Nigerian market with Paystack instead of Stripe.

---

### ✅ SaaS Landing Page (`/`)
- Light theme: white bg, amber accents (`#F0940A`), clean editorial feel
- Sections: Hero (dashboard mockup) → Photo strip (3 scrollable photography images) → Problem (dark) → Features 2×2 → How It Works (bordered cards) → Pricing → Early Access → CTA
- Framer Motion scroll animations throughout
- 3 pricing tiers (Starter ₦15k / Studio ₦35k most popular / Pro ₦65k)
- Fully responsive, mobile-first
- Navbar: Blog removed, separate **Sign In** (text) + **Create Account** (amber button) — mobile overlay fixed so hamburger is always tappable (header z-[110] above overlay z-[100])

### ✅ Auth Flow
- Signup (`/auth/signup`) — studio name, email, password with show/hide toggle
- Login (`/auth/login`) — password show/hide toggle
- Onboarding (`/auth/onboarding`) — 3-step flow: basics → bio + accent colour → services
- Demo mode — one click fills all fields with realistic Lagos Lens Studio data
- Onboarding shows correct studio URL based on environment

### ✅ Middleware + Routing (`src/proxy.js`)
- Subdomain routing: `slug.photostudio.ng` → `/studio-site/slug`
- Local dev: `slug.localhost:3000` → `/studio-site/slug`
- Custom domain: any other host → `/studio-site/custom/host`
- All studio-site rewrites set `x-is-studio-site: 1` header
- Direct path access `/studio-site/*` also sets header (Vercel testing workaround)
- Root layout reads header and suppresses platform nav/footer/WhatsApp on studio sites
- Route protection: unauthenticated → login, authenticated on auth pages → dashboard

### ✅ Public Studio Website (`/studio-site/[slug]`)
- **`StudioSiteClient.jsx`** — fully theme-aware, reads `website_config` from DB:
  - **6 themes**: Classic (dark), Light (white — default), Ivory (cream), Midnight (blue-black), Sand (warm earth), Noir (pure black)
  - All colours (bg, text, borders, inputs, nav) driven by theme variables via inline styles
  - **Hero styles**: Fullscreen (Ken Burns photo + dark overlay, always white text) or Minimal (bold typography on theme background)
  - **Portfolio layouts**: Masonry (tight 4-col) or Clean Grid (spacious 3-col with rounded corners)
  - **Section toggles**: show/hide Services, About, Booking independently
  - Mobile: full-screen overlay nav with large serif links, staggered reveal animation, Book CTA at bottom, contact info shown
  - Marquee strip with accent-colored dividers
  - Footer: email, phone, Instagram icon link
  - Fullscreen lightbox (ESC, arrow keys)

### ✅ Studio Gallery Page (`/studio-site/[slug]/gallery`)
- True masonry layout (2→4 columns responsive)
- Category filter tabs: horizontally scrollable strip on mobile (no wrapping), active tab auto-scrolls into view
- Photo tap effects: `active:scale-[0.96]`, `touch-action: manipulation` (no 300ms delay), white flash on tap, accent gradient overlay
- Lightbox: swipe left/right to navigate on mobile, circular icon buttons for prev/next/close, "swipe to navigate" hint shown on mobile
- Back button: circular icon with hover/active states
- "Powered by photostudio.ng" footer

### ✅ Website Builder (`/studio/website`) — THREE tabs
**Photos tab:**
- Drag-and-drop upload zone → `POST /api/portfolio/upload` → R2 storage
- **"Use sample photos" button** — inserts 8 Picsum photos (4 categories, mixed portrait/landscape/square ratios) directly into DB for testing
- Grid of uploaded photos with delete (× button on hover) and category dropdowns
- Save Categories button → `savePhotoCategories` server action

**Design tab:**
- 6 theme swatches with colour previews and accent colour dot
- Hero style picker: Fullscreen vs Minimal (with visual mini-previews)
- Portfolio layout picker: Masonry vs Clean Grid (with visual mini-previews, overflow-hidden fixed)
- Section toggles: Services, About, Booking (toggle switches)
- Save Design → `saveWebsiteConfig` → updates `studios.website_config` JSONB

**Content tab:**
- Bio textarea: **300 character limit** enforced via `maxLength`, live counter shows remaining chars, turns amber at 280, red at 300
- Email + Phone/WhatsApp in grid
- Instagram URL with icon
- Accent colour swatches (16 colours, same set as Settings)
- Save Content → `saveStudioContent` → updates bio, email, phone, instagram_url, accent_color on studios table

### ✅ Portfolio Photo APIs
- `POST /api/portfolio/upload` — validates file type, uploads to R2 at `studios/{id}/portfolio/{uuid}.{ext}`, auto-assigns sort_order, inserts into `portfolio_photos`
- `DELETE /api/portfolio/delete` — extracts R2 key from public URL, deletes from R2 + DB (continues even if R2 delete fails)

### ✅ Theme System (`src/lib/themes.js`)
- 6 themes exported as `THEMES` object, each with: bg, surface, surfaceAlt, text, textMuted, border, cardBg, navScrolled, inputBorder, inputText, inputPlaceholder, selectBg, dark (bool), swatch, name, description
- `DEFAULT_CONFIG`: theme `light`, hero_style `fullscreen`, portfolio_layout `masonry`, all sections shown
- `resolveConfig(raw)` merges saved config with defaults — safe for null/missing values

### ✅ Paystack Payments (`src/lib/paystack.js`)
- **Subaccount model**: photographer provides Nigerian bank account → platform creates Paystack subaccount → Paystack settles directly to photographer's bank within 24h. Platform takes 0% cut.
- `createSubaccount`, `updateSubaccount`, `initializePayment` (with subaccount + bearer: "subaccount"), `resolveBankAccount`, `verifyWebhookSignature`
- `GET /api/paystack/resolve-account` — verifies account number + bank code, returns account name
- `POST /api/paystack/initialize` — creates payment link for a booking's deposit or balance. Verifies with Paystack before reusing an existing reference (prevents duplicate reference error if payment already went through)
- `POST /api/paystack/webhook` — uses `supabaseAdmin` throughout (CRITICAL: session-based client silently fails in webhook context due to RLS). Handles:
  - `charge.success` + metadata has `studio_id + billing` → subscription payment → upgrade to pro, store `subscription_billing`, log to `subscription_payments`
  - `charge.success` + no metadata → booking payment → mark paid, update deposit/balance, unlock gallery if balance, send gallery-ready email
  - `invoice.payment_succeeded` → subscription renewal → extend `plan_expires_at`, log to `subscription_payments`
  - `subscription.disabled` → downgrade to free
- `POST /api/paystack/subscribe` — creates Paystack transaction with plan code, sends `billing` (monthly/yearly) in metadata so webhook can identify it
- Settings → Payouts section: 22 Nigerian banks dropdown, account number input, Verify button, read-only view when set up (Edit button to change)

### ✅ Booking Detail Page (`/studio/bookings/[id]`)
- **`BookingInfo.jsx`** — view mode with Edit button; edit mode with all fields inline (client name, email, phone, service, session date, deposit amount, balance amount, notes). Local `display` state updates immediately on save without page reload.
- **`BookingDetail.jsx`** — "How Booking Status Works" explanation box (Pending → Confirmed → Completed flow). Manual status buttons: Mark Confirmed, Mark Completed, Cancel, Reopen. Optimistic status update via `useState`. `status_updated_at` stamped on every status change.
- Payment rows: warning banner if no subaccount, deposit + balance with paid status and date, "Get payment link" → authorization_url, copy + WhatsApp share. Balance locked until deposit paid.
- Status flow: Pending (new booking) → Confirmed (deposit paid) → Completed (balance paid). Paystack updates automatically; manual buttons for cash/bank transfer payments.

### ✅ Studio Admin Dashboard (`/studio/*`)
- Sidebar: Dashboard, Bookings, Galleries, Payments, **Website** (globe icon), Settings
- Mobile: fixed top bar + slide-in drawer, fully responsive across all pages
- **Dashboard** (`/studio/dashboard`) — stats cards, recent bookings table (mobile card layout), studio URL banner. Shows `?upgraded=1` success banner after Pro subscription. Shows trial banner (days remaining) or expired trial banner with upgrade CTA.
- **Bookings** (`/studio/bookings`) — filter tabs (scrollable on mobile), card/table layout, status badges
- **New Booking** (`/studio/bookings/new`) — full form, sends confirmation email
- **Galleries** (`/studio/galleries`) — list of all galleries
- **New Gallery** (`/studio/galleries/new`) — create gallery with title, slug, password
- **Gallery Manager** (`/studio/galleries/[id]`) — Photos tab + Selections tab
- **Payments** (`/studio/payments`) — payment tracking for all bookings
- **Website** (`/studio/website`) — Photos / Design / Content tabs (see above)
- **Settings** (`/studio/settings`) — three independent sections:
  - **Studio Details** — name, location, phone, email, Instagram (separate Save button)
  - **Your Plan** — Free: side-by-side Monthly (₦10k) and Yearly (₦100k) upgrade cards. Pro: green active badge + renewal date (amber warning within 7 days)
  - **Payouts** — read-only bank details with Edit button gate; form only opens on first setup or after Edit clicked

### ✅ Client Gallery Portal (`/(client)/gallery/[slug]`)
- Password gate → name/role step → photo grid
- Heart button on every thumbnail — tap to select without opening lightbox
- Click photo → fullscreen lightbox; heart selectable inside lightbox too
- Selected photos: filled accent-colored heart + accent outline border
- Multi-person support (each person submits independently)
- Submit → confirmation screen → WhatsApp share

### ✅ Admin Panel (`/admin/*`)
- Protected by `ADMIN_EMAIL` env var — redirects anyone else to studio dashboard
- Dark/light mode toggle (persisted via `AdminThemeContext`)
- **Overview** — total studios, revenue, bookings, galleries, new this week, plans breakdown bar chart (Free vs Pro), recent signups list with `PlanBadge`
- **Studios** — full list with bookings count, galleries count, revenue per studio, plan badge. Selects `subscription_billing` to show "Pro Monthly" / "Pro Yearly" / "Pro" / "Free"
- **Studio Revenue** (`/admin/revenue`) — all booking payments (deposits + balances) across every studio. Client name, studio, amount, type, status.
- **Subscriptions** (`/admin/subscriptions`) — platform owner revenue from Pro subscriptions. Shows: total earned, MRR estimate, monthly vs yearly plan counts, full payment history from `subscription_payments` table.
- `PlanBadge` component exported from `admin/page.jsx` — accepts `plan` and `billing` props, renders "Pro Monthly" / "Pro Yearly" / "Pro" / "Free"

### ✅ APIs
- `POST /api/bookings` — client booking form → saved as `pending` → confirmation email
- `POST /api/galleries/upload` — uploads to R2, returns thumbnail_url + original_url
- `POST /api/galleries/selections` — saves client photo selections
- `POST /api/portfolio/upload` — portfolio photos for public website
- `DELETE /api/portfolio/delete` — removes portfolio photo
- `GET /api/paystack/resolve-account` — verifies Nigerian bank account
- `POST /api/paystack/initialize` — creates Paystack payment link (with duplicate reference protection)
- `POST /api/paystack/subscribe` — initiates Pro subscription via Paystack plan code
- `POST /api/paystack/webhook` — handles all Paystack events (booking payments, subscription payments, renewals, cancellations)
- `GET /api/pay/success` — post-payment confirmation page

### ✅ Email (`src/lib/email.js`)
- Nodemailer + Gmail (`bluehydra001@gmail.com`)
- `sendBookingConfirmation`, `sendGalleryReady`, `sendPaymentReminder`
- HTML templates with studio name, accent colour, booking details

### ✅ Stack
- Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
- Supabase (auth + PostgreSQL + RLS)
- Cloudflare R2 (image storage)
- Nodemailer / Gmail (email)
- Paystack (subaccounts + webhooks — fully implemented)
- Vercel (hosting)

---

## Required DB Migrations (run in Supabase SQL editor)

All migrations are safe to re-run (`IF NOT EXISTS` / `IF NOT EXISTS`).

```sql
-- Paystack payout columns
ALTER TABLE studios
  ADD COLUMN IF NOT EXISTS paystack_subaccount_code text,
  ADD COLUMN IF NOT EXISTS paystack_bank_name text,
  ADD COLUMN IF NOT EXISTS paystack_bank_code text,
  ADD COLUMN IF NOT EXISTS paystack_account_number text,
  ADD COLUMN IF NOT EXISTS paystack_account_name text;

-- Website builder
ALTER TABLE studios ADD COLUMN IF NOT EXISTS website_config JSONB DEFAULT '{}';

-- Instagram / social
ALTER TABLE studios ADD COLUMN IF NOT EXISTS instagram_url text;

-- Subscription tracking
ALTER TABLE studios
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS subscription_customer_email text,
  ADD COLUMN IF NOT EXISTS subscription_billing text,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- Booking status timestamp
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status_updated_at timestamptz;

-- Portfolio photos for public website (separate from gallery photos)
CREATE TABLE IF NOT EXISTS portfolio_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES studios(id) ON DELETE CASCADE,
  src text NOT NULL,
  thumbnail_url text,
  category text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Platform subscription revenue log
CREATE TABLE IF NOT EXISTS subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES studios(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  billing text NOT NULL,
  paystack_reference text,
  paid_at timestamptz DEFAULT now()
);
```

**Backfill for existing Pro studios** (run once if studio subscribed before migrations):
```sql
-- Set billing type for existing Pro studios
UPDATE studios SET subscription_billing = 'monthly'
WHERE plan = 'pro' AND subscription_status = 'active' AND subscription_billing IS NULL;

-- Insert their initial payment into the log
INSERT INTO subscription_payments (studio_id, amount, billing, paid_at)
SELECT id, 10000, 'monthly', now()
FROM studios
WHERE plan = 'pro' AND subscription_status = 'active';
```

---

## Domain — Current Status

**photostudio.ng is LIVE.** Wildcard DNS `*.photostudio.ng → cname.vercel-dns.com` is set. `NEXT_PUBLIC_ROOT_DOMAIN=photostudio.ng` is set in Vercel env vars.

Studio sites are accessible at:
```
https://[slug].photostudio.ng          ← subdomain routing (live)
https://photostudio.ng/studio-site/[slug]  ← direct path fallback
```

**Vercel subdomain limitation:** Wildcard subdomains (`*.teststudios.vercel.app`) are NOT supported on `.vercel.app` domains. Subdomain routing only works on photostudio.ng.

---

## Key Decisions Made

- **Option A subdomain routing** chosen as default (free plan), custom domain as pro plan upgrade hook
- **Cloudflare R2** over Cloudinary — cheaper at scale, no egress fees
- **Paystack** only — Stripe doesn't work reliably in Nigeria
- **Supabase** row-level security for studio data isolation — studio A can never see studio B's data
- **Chunked uploads** for DSLR files — resumable if connection drops
- **Two image versions** always — compressed thumbnail served to clients, original only on download
- **Free plan** includes a real working website — this is the hook that drives signups
- **Desktop uploader** deferred to Phase 3 — validate with web uploader first
- **Two-tier pricing** — Free + Pro only (dropped Starter/Studio tiers). Pro has monthly (₦10k) and yearly (₦100k) billing options. Simpler to sell and understand.
- **Webhook must use `supabaseAdmin`** — session-based client silently fails in webhook context because there is no user session. All webhook DB writes use service role client.
- **Subscription vs booking payments distinguished by metadata** — `charge.success` fires for both. Check `metadata.studio_id && metadata.billing` to identify subscription payments. No metadata = booking payment.
- **`subscription_customer_email` stored on studio** — used to match future renewal (`invoice.payment_succeeded`) and cancellation (`subscription.disabled`) events back to the correct studio row.
- **Settlement timing (important for FAQ)** — app updates instantly via webhook when payment is confirmed. Bank receives money T+1 (next business day). Client-facing status shows "paid" immediately; bank account reflects it next day.
- **Payouts section read-only by default** — Edit button gate prevents accidental bank detail changes.

---

## Deferred Features (implement later)

- Custom domain support (Pro plan upgrade hook)
- Calendar availability for bookings
- Payment reminders (automated)
- Analytics per studio (page views, booking conversion rate)
- Desktop uploader app (Electron) — for bulk Lightroom export uploads
- Watermarking support
