-- Run in Supabase SQL Editor after 001-005. No data is retained.
-- These are negative anonymous-access checks, not a substitute for a real admin CRUD test.
begin;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  if public.is_admin() then raise exception 'FAIL: anonymous is admin'; end if;
  if exists(select 1 from public.properties where status in ('draft','archived')) then
    raise exception 'FAIL: private properties visible';
  end if;
  begin
    if exists(select 1 from public.enquiries) then raise exception 'FAIL: leads visible'; end if;
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.enquiries(name,phone) values ('Permission Test','9876543210');
    raise exception 'FAIL: anonymous lead insert allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.sell_requests(owner_name,phone,property_type,locality,intention)
      values ('Permission Test','9876543210','2BHK','Test','sell');
    raise exception 'FAIL: anonymous owner insert allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_property(null, '{}'::jsonb, '[]'::jsonb);
    raise exception 'FAIL: anonymous save RPC allowed';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS: anonymous negative access checks';
end $$;
rollback;
