-- ─────────────────────────────────────────
-- Lumis Platform — Supabase Schema
-- Run this in the Supabase SQL editor
-- ─────────────────────────────────────────

-- Studios
create table studios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  custom_domain text unique,
  plan text not null default 'free', -- free | pro | studio
  logo_url text,
  accent_color text default '#D30E15',
  bio text,
  location text,
  email text,
  phone text,
  instagram_url text,
  twitter_url text,
  website_live boolean default true,
  created_at timestamptz default now()
);

-- Services offered by each studio
create table services (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric(10,2),
  currency text default 'NGN',
  sort_order int default 0
);

-- Portfolio photos shown on the public studio website
create table portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade not null,
  src text not null,
  thumbnail_url text,
  category text, -- Portraits | Events | Weddings | Commercial
  sort_order int default 0,
  uploaded_at timestamptz default now()
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade not null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  service_id uuid references services(id),
  session_date date,
  status text default 'pending', -- pending | confirmed | completed | cancelled
  notes text,
  deposit_amount numeric(10,2) default 0,
  deposit_paid boolean default false,
  balance_amount numeric(10,2) default 0,
  balance_paid boolean default false,
  created_at timestamptz default now()
);

-- Client galleries
create table galleries (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade not null,
  booking_id uuid references bookings(id),
  title text not null,
  slug text not null,
  password_hash text,
  is_locked boolean default true, -- unlocked when balance paid
  created_at timestamptz default now(),
  unique(studio_id, slug)
);

-- Photos inside a client gallery
create table photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid references galleries(id) on delete cascade not null,
  studio_id uuid references studios(id) on delete cascade not null,
  original_url text not null,
  thumbnail_url text not null,
  file_name text,
  file_size int,
  uploaded_at timestamptz default now()
);

-- Client photo selections (hearts/favourites)
create table selections (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid references galleries(id) on delete cascade not null,
  photo_id uuid references photos(id) on delete cascade not null,
  selector_name text not null,
  selector_role text, -- bride | groom | family | other
  note text,
  created_at timestamptz default now(),
  unique(gallery_id, photo_id, selector_name)
);

-- Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade not null,
  studio_id uuid references studios(id) on delete cascade not null,
  amount numeric(10,2) not null,
  currency text default 'NGN',
  type text not null, -- deposit | balance
  paystack_reference text unique,
  status text default 'pending', -- pending | paid | failed
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────

alter table studios enable row level security;
alter table services enable row level security;
alter table portfolio_photos enable row level security;
alter table bookings enable row level security;
alter table galleries enable row level security;
alter table photos enable row level security;
alter table selections enable row level security;
alter table payments enable row level security;

-- Studios: owner can do everything, public can read live studios
create policy "Owner full access" on studios
  for all using (auth.uid() = owner_id);

create policy "Public can read live studios" on studios
  for select using (website_live = true);

-- Services: owner manages, public reads
create policy "Owner manages services" on services
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );
create policy "Public reads services" on services
  for select using (true);

-- Portfolio photos: owner manages, public reads
create policy "Owner manages portfolio" on portfolio_photos
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );
create policy "Public reads portfolio" on portfolio_photos
  for select using (true);

-- Bookings: only studio owner sees their bookings
create policy "Owner manages bookings" on bookings
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );

-- Galleries: owner manages, clients can read (password check done in app)
create policy "Owner manages galleries" on galleries
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );
create policy "Anyone can read galleries" on galleries
  for select using (true);

-- Photos: owner manages, anyone can read thumbnails
create policy "Owner manages photos" on photos
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );
create policy "Anyone can read photos" on photos
  for select using (true);

-- Selections: anyone can insert (clients select), owner can read all
create policy "Anyone can select photos" on selections
  for insert with check (true);
create policy "Owner reads selections" on selections
  for select using (
    gallery_id in (
      select id from galleries where studio_id in (
        select id from studios where owner_id = auth.uid()
      )
    )
  );

-- Payments: owner only
create policy "Owner manages payments" on payments
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );

-- ─────────────────────────────────────────
-- Indexes for performance
-- ─────────────────────────────────────────
create index on studios(slug);
create index on studios(custom_domain);
create index on galleries(studio_id, slug);
create index on photos(gallery_id);
create index on selections(gallery_id);
create index on bookings(studio_id);
create index on payments(booking_id);
