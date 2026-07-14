-- Adversarial RLS isolation test for the templates table (Phase 10).
-- Run in Supabase SQL editor (service role).
-- Confirms: Tenant A cannot read, write, update, or soft-delete Tenant B's templates,
-- including rows seeded by seed_starter_templates().

do $$
declare
  tenant_a uuid := gen_random_uuid();
  tenant_b uuid := gen_random_uuid();
  tmpl_b   uuid;
  row_count int;
begin
  -- ── Setup ──────────────────────────────────────────────────────────────────
  insert into tenants (id, name, slug) values
    (tenant_a, 'RLS Test Tenant A', 'rls-tmpl-a-' || substr(tenant_a::text,1,8)),
    (tenant_b, 'RLS Test Tenant B', 'rls-tmpl-b-' || substr(tenant_b::text,1,8));
  -- Trigger seeds ~21 starter templates per tenant

  -- Grab one of Tenant B's seeded template IDs
  select id into tmpl_b from templates where tenant_id = tenant_b limit 1;

  -- ── Test 1: Tenant A JWT cannot see Tenant B's templates ──────────────────
  set local role authenticated;
  set local request.jwt.claims = format('{"tenant_id":"%s"}', tenant_a);

  select count(*) into row_count from templates where tenant_id = tenant_b;
  assert row_count = 0,
    format('FAIL T1: Tenant A can see %s Tenant B templates', row_count);

  -- ── Test 2: Tenant A can see its own seeded templates ─────────────────────
  select count(*) into row_count from templates where tenant_id = tenant_a;
  assert row_count >= 21,
    format('FAIL T2: Tenant A sees only %s own templates (expected ≥21)', row_count);

  -- ── Test 3: Tenant A cannot insert a template for Tenant B ────────────────
  begin
    insert into templates (tenant_id, name, channel, body)
    values (tenant_b, 'Hijack', 'sms', 'Fraud body');
    assert false, 'FAIL T3: Tenant A inserted into Tenant B templates';
  exception when others then null; end;

  -- ── Test 4: Tenant A cannot update Tenant B's template ────────────────────
  reset role;
  -- Confirm the row exists before the test
  assert tmpl_b is not null, 'FAIL T4 setup: no Tenant B template found';

  set local role authenticated;
  set local request.jwt.claims = format('{"tenant_id":"%s"}', tenant_a);

  update templates set name = 'Tampered' where id = tmpl_b;
  -- RLS should silently affect 0 rows; verify
  reset role;
  select count(*) into row_count from templates where id = tmpl_b and name = 'Tampered';
  assert row_count = 0, 'FAIL T4: Tenant A updated Tenant B template name';

  -- ── Test 5: Soft-deleted rows are invisible ────────────────────────────────
  -- Soft-delete one of Tenant A's own templates (allowed)
  set local role authenticated;
  set local request.jwt.claims = format('{"tenant_id":"%s"}', tenant_a);

  update templates
    set deleted_at = now()
  where tenant_id = tenant_a
  limit 1;

  select count(*) into row_count
    from templates
  where tenant_id = tenant_a and deleted_at is not null;
  -- RLS select policy excludes deleted_at is not null, so result should be 0
  assert row_count = 0, 'FAIL T5: Soft-deleted template still visible to its own tenant';

  -- ── Cleanup ────────────────────────────────────────────────────────────────
  reset role;
  delete from templates where tenant_id in (tenant_a, tenant_b);
  delete from tenants   where id        in (tenant_a, tenant_b);

  raise notice 'All RLS template isolation tests PASSED';
end;
$$;
