-- backend/src/db/migrations/001_create_images.sql
--
-- WHAT  The one table this app needs: metadata about each uploaded image. The image
--       bytes live in object storage; this row stores where to find them + their state.
-- HOW   Run once against DATABASE_URL before first boot (command in NEXT_STEPS.md).
--       Add later schema changes as new numbered files (002_..., 003_...), never edit
--       a migration that has already run somewhere.
-- WHY   Postgres stores tiny rows we query fast; object storage holds the large blobs
--       cheaply and CDN-cacheably (see ARCHITECTURE §3.7). Keeping bytes OUT of the DB
--       is what keeps queries quick as the image count grows large.
-- ALTERNATIVES
--   - Store bytes as BYTEA here: transactional + one system, but bloats the DB, wrecks
--     backup/restore times, and can't be CDN-cached. Wrong choice for an image host.

CREATE TABLE IF NOT EXISTS images (
  id           TEXT PRIMARY KEY,              -- nanoid, used in the public URL
  filename     TEXT NOT NULL,                 -- original filename from upload
  public_url   TEXT NOT NULL,                 -- full URL served to the client (CDN in prod)
  storage_key  TEXT NOT NULL,                 -- key/path inside R2 bucket or local disk
  size         INTEGER NOT NULL,              -- file size in bytes
  mime_type    TEXT NOT NULL,                 -- e.g. image/jpeg, image/png, image/webp
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | processing | ready (async pipeline)
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()      -- when the upload was created
);

-- Listing is ordered newest-first and uses keyset pagination (WHERE uploaded_at < cursor).
-- This index makes both the ORDER BY and the cursor comparison cheap at any depth.
CREATE INDEX IF NOT EXISTS images_uploaded_at_idx ON images (uploaded_at DESC, id DESC);
