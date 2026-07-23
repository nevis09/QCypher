-- Phase 13: Job Photos
-- Stores before/after photos attached to a job (order/transaction).
-- Uses Supabase Storage for files; this table holds metadata + soft-delete.

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES orders(id)  ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,          -- e.g. {tenant_id}/{order_id}/{uuid}.jpg
  label           TEXT,                   -- 'before' | 'after' | 'other' | custom
  uploaded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ             -- soft delete
);

CREATE INDEX IF NOT EXISTS job_photos_tenant_id_idx ON job_photos(tenant_id);
CREATE INDEX IF NOT EXISTS job_photos_order_id_idx  ON job_photos(order_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- Tenant can only see their own non-deleted photos
CREATE POLICY "job_photos_select" ON job_photos
  FOR SELECT USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    AND deleted_at IS NULL
  );

CREATE POLICY "job_photos_insert" ON job_photos
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Soft delete only — no hard deletes via RLS
CREATE POLICY "job_photos_update" ON job_photos
  FOR UPDATE USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Prevent hard deletes through the client
CREATE POLICY "job_photos_delete" ON job_photos
  FOR DELETE USING (false);

-- ── Supabase Storage bucket ───────────────────────────────────────────────────
-- Creates the bucket if it does not exist. `public = false` means no anonymous
-- access — all reads go through signed URLs gated by storage policies below.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos',
  'job-photos',
  false,
  5242880,   -- 5 MB hard limit per file (compressed before upload)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ──────────────────────────────────────────────────────
-- Path convention: {tenant_id}/{order_id}/{filename}
-- The first folder segment IS the tenant_id — we enforce that here.

-- SELECT: signed-URL generation (supabase.storage.from().createSignedUrl)
CREATE POLICY "job_photos_storage_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'job-photos'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')
  );

-- INSERT: upload
CREATE POLICY "job_photos_storage_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'job-photos'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')
  );

-- DELETE: remove from storage (row is soft-deleted in the table; file is hard-deleted)
CREATE POLICY "job_photos_storage_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'job-photos'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')
  );
