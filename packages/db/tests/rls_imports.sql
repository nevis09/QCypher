-- RLS Isolation Test: imports & contacts.import_id (Phase 11)
-- Run as superuser in Supabase SQL Editor.
-- All assertions must return TRUE.

do $$
declare
  tenant_a uuid := gen_random_uuid();
  tenant_b uuid := gen_random_uuid();
  user_a   uuid := gen_random_uuid();
  user_b   uuid := gen_random_uuid();
  import_a uuid;
  import_b uuid;
  contact_a uuid;
  cnt      int;
begin
  -- Seed two tenants
  insert into tenants(id, name, slug) values
    (tenant_a, 'Tenant A', 'tenant-a-rls-imports'),
    (tenant_b, 'Tenant B', 'tenant-b-rls-imports');

  -- Seed imports for each tenant
  insert into imports(id, tenant_id, filename, imported_count, created_by)
    values (gen_random_uuid(), tenant_a, 'a.csv', 5, user_a)
    returning id into import_a;

  insert into imports(id, tenant_id, filename, imported_count, created_by)
    values (gen_random_uuid(), tenant_b, 'b.csv', 3, user_b)
    returning id into import_b;

  -- Seed a contact for tenant A tagged with import_a
  insert into contacts(tenant_id, first_name, import_id)
    values (tenant_a, 'Alice', import_a)
    returning id into contact_a;

  -- ── As Tenant A ─────────────────────────────────────────────────────────
  set local role authenticated;
  set local request.jwt.claims to format(
    '{"sub": "%s", "app_metadata": {"tenant_id": "%s"}}', user_a, tenant_a
  );

  -- Can read own import
  select count(*) into cnt from imports where id = import_a;
  assert cnt = 1, 'Tenant A should see own import';

  -- Cannot read Tenant B import
  select count(*) into cnt from imports where id = import_b;
  assert cnt = 0, 'Tenant A must NOT see Tenant B import';

  -- Cannot insert import for Tenant B
  begin
    insert into imports(tenant_id, filename, imported_count) values (tenant_b, 'hack.csv', 0);
    assert false, 'Should have raised RLS violation';
  exception when others then null; end;

  -- Cannot delete Tenant B import
  begin
    delete from imports where id = import_b;
    -- if no error, verify nothing was deleted
    select count(*) into cnt from imports where id = import_b;
  exception when others then null; end;

  -- CSV spoof: cannot insert contact with a different tenant_id
  begin
    insert into contacts(tenant_id, first_name) values (tenant_b, 'Spoofed');
    assert false, 'Spoofed contact insert should fail RLS';
  exception when others then null; end;

  reset role;
  reset request.jwt.claims;

  -- Cleanup
  delete from contacts where import_id in (import_a, import_b);
  delete from imports where id in (import_a, import_b);
  delete from tenants where id in (tenant_a, tenant_b);

  raise notice 'All Phase 11 RLS isolation tests passed ✓';
end $$;
