-- Fix job_photos RLS: tenant_id lives under app_metadata, not at JWT root.
-- Replace all auth.jwt() ->> 'tenant_id' with auth.jwt() -> 'app_metadata' ->> 'tenant_id'

DROP POLICY IF EXISTS "job_photos_select" ON job_photos;
DROP POLICY IF EXISTS "job_photos_insert" ON job_photos;
DROP POLICY IF EXISTS "job_photos_update" ON job_photos;

CREATE POLICY "job_photos_select" ON job_photos
  FOR SELECT USING (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    AND deleted_at IS NULL
  );

CREATE POLICY "job_photos_insert" ON job_photos
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "job_photos_update" ON job_photos
  FOR UPDATE USING (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

-- Fix storage policies too
DROP POLICY IF EXISTS "job_photos_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "job_photos_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "job_photos_storage_delete" ON storage.objects;

CREATE POLICY "job_photos_storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'job-photos'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

CREATE POLICY "job_photos_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'job-photos'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );

CREATE POLICY "job_photos_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'job-photos'
    AND (storage.foldername(name))[1] = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
  );
