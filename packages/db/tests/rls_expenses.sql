-- Adversarial RLS isolation test for the expenses table.
-- Run in Supabase SQL editor (service role, not anon).
-- Verifies Tenant A cannot read or write Tenant B's expenses.

do $$
declare
  tenant_a   uuid := gen_random_uuid();
  tenant_b   uuid := gen_random_uuid();
  user_a     uuid := gen_random_uuid();
  user_b     uuid := gen_random_uuid();
  exp_a_id   uuid;
  exp_b_id   uuid;
  row_count  int;
begin
  -- ── setup ──────────────────────────────────────────────────────────────────
  insert into tenants (id, name, slug) values
    (tenant_a, 'Test Tenant A', 'rls-test-a-' || substr(tenant_a::text,1,8)),
    (tenant_b, 'Test Tenant B', 'rls-test-b-' || substr(tenant_b::text,1,8));

  -- Insert expense directly (service role bypasses RLS)
  insert into expenses (id, tenant_id, date, category, amount)
  values
    (gen_random_uuid(), tenant_a, current_date, 'Office', 100.00),
    (gen_random_uuid(), tenant_b, current_date, 'Travel', 200.00)
  returning id into exp_a_id;

  -- ── test 1: Tenant A JWT cannot see Tenant B's expenses ────────────────────
  set local role authenticated;
  set local request.jwt.claims = format('{"tenant_id":"%s"}', tenant_a);

  select count(*) into row_count
  from expenses
  where tenant_id = tenant_b;

  assert row_count = 0,
    format('FAIL: Tenant A can see %s Tenant B expense rows', row_count);

  -- ── test 2: Tenant A JWT cannot insert expense for Tenant B ────────────────
  begin
    insert into expenses (tenant_id, date, category, amount)
    values (tenant_b, current_date, 'Fraud', 9999.00);
    assert false, 'FAIL: Tenant A was able to insert into Tenant B';
  exception when others then
    -- expected — RLS check prevented the insert
    null;
  end;

  -- ── test 3: Tenant A can see own expenses ──────────────────────────────────
  select count(*) into row_count
  from expenses
  where tenant_id = tenant_a;

  assert row_count >= 1,
    'FAIL: Tenant A cannot see its own expenses';

  -- ── cleanup ────────────────────────────────────────────────────────────────
  reset role;
  delete from expenses where tenant_id in (tenant_a, tenant_b);
  delete from tenants   where id        in (tenant_a, tenant_b);

  raise notice 'All RLS expense isolation tests PASSED';
end;
$$;
