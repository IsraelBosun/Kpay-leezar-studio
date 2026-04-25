-- Run this in the Supabase SQL editor before deploying the delivery feature

ALTER TABLE galleries ADD COLUMN IF NOT EXISTS downloads_enabled boolean DEFAULT false;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS photo_type text DEFAULT 'selection';

-- Index for filtering photos by type
CREATE INDEX IF NOT EXISTS photos_gallery_type ON photos(gallery_id, photo_type);
