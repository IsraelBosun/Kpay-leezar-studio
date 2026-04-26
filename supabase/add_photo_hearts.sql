create table photo_hearts (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid references galleries(id) on delete cascade not null,
  photo_id uuid references photos(id) on delete cascade not null,
  selector_name text not null,
  created_at timestamptz default now(),
  unique(gallery_id, photo_id, selector_name)
);

alter table photo_hearts enable row level security;
create policy "Public read photo_hearts"   on photo_hearts for select using (true);
create policy "Public insert photo_hearts" on photo_hearts for insert with check (true);
create policy "Public delete photo_hearts" on photo_hearts for delete using (true);
