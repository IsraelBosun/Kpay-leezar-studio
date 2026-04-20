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

| Feature | Free | Pro (₦15,000/mo) | Studio (₦35,000/mo) |
|---|---|---|---|
| Studio website | ✅ | ✅ | ✅ |
| Subdomain | ✅ | ✅ | ✅ |
| Custom domain | ❌ | ✅ | ✅ |
| Client galleries | 1 | Unlimited | Unlimited |
| Photos per gallery | 50 | Unlimited | Unlimited |
| Online booking | ❌ | ✅ | ✅ |
| Paystack payments | ❌ | ✅ | ✅ |
| Desktop uploader | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ |

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
  id, name, slug, custom_domain, plan,
  logo_url, accent_color, bio,
  location, email, phone,
  created_at

-- Studio services
services
  id, studio_id, title, description, price, currency

-- Bookings
bookings
  id, studio_id, client_name, client_email, client_phone,
  service_id, session_date, status, notes,
  deposit_amount, deposit_paid, balance_amount, balance_paid,
  created_at

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

-- Photo selections (per person per gallery)
selections
  id, gallery_id, photo_id,
  selector_name, selector_role (bride/groom/family),
  note, created_at

-- Payments
payments
  id, booking_id, studio_id,
  amount, currency, type (deposit/balance),
  paystack_reference, status (pending/paid/failed),
  paid_at

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

The `Lumis Studio` demo site is fully built and serves as:
1. A marketing demo to show photographers what their site would look like
2. The actual template that powers every studio's public website on the platform

**Already built:**
- Hero section with Ken Burns background animation
- Auto-scrolling photo marquee strip
- Portfolio gallery with category filters + lightbox
- Masonry grid (desktop) + horizontal carousel (mobile)
- About section with photographer portrait
- Services section with pricing block
- Stats section with animated count-up on scroll
- Testimonials section (dark cinematic)
- CTA section with editorial background
- Contact page — split layout (dark panel + form)
- Paystack-ready contact form with validation
- WhatsApp floating button
- Typography logo (LUMIS / Studio)
- Fully responsive, mobile-first
- Blur-up image loading
- Framer Motion animations throughout
- All data centralised in `src/lib/data.js`

**Stack already in place:**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion

**To add next:**
- Supabase (database + auth)
- Cloudflare R2 (image storage)
- Paystack (payments)
- Resend (email)
- Middleware for subdomain routing

---

## Domain Suggestion

Register `photostudio.ng` — available, Nigerian-specific, immediately communicates the product.
Name the SaaS product something like **Framr** or **Shootr** — studios live at `lumis.photostudio.ng`.

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

---

## Deferred Features (implement later)

### Paystack Gallery Auto-Unlock
When a client pays the balance for their booking, the gallery should automatically unlock (set `is_locked = false`).

**Implementation plan:**
1. Paystack webhook at `/api/paystack/webhook` receives `charge.success` event
2. Match `paystack_reference` to a payment row in the `payments` table
3. Mark payment as `paid`, set `paid_at = now()`
4. If `payment.type = 'balance'`, find the linked gallery (`galleries` where `booking_id = payment.booking_id`) and set `is_locked = false`
5. Send gallery-ready email to client via Resend (`sendGalleryReady`)
6. Also update `bookings.balance_paid = true`

**Files to touch:** `src/app/api/paystack/webhook/route.js`, `src/lib/email.js`

**Note:** Paystack sends webhook events — must verify the `x-paystack-signature` header using HMAC SHA-512 with `PAYSTACK_SECRET_KEY` before processing.
