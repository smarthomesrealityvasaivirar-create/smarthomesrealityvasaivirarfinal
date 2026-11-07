-- Run in the SQL editor AFTER seeding. Every line marked EXPECT must hold.
-- Simulates an anonymous visitor (the browser anon key).
begin;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

-- EXPECT: 0 rows (anon cannot read leads)
select count(*) as anon_can_read_enquiries from public.enquiries;
select count(*) as anon_can_read_sell_requests from public.sell_requests;
-- EXPECT: only published/sold/rented rows
select status, count(*) from public.properties group by status;
-- EXPECT: 0 rows updated (RLS silently filters)
update public.properties set title = 'hacked title here' returning id;
-- EXPECT: insert succeeds
insert into public.enquiries (name, phone, message) values ('RLS Test', '9876543210', 'rls test');
-- EXPECT: ERROR new row violates row-level security policy (anon cannot set status)
-- insert into public.enquiries (name, phone, status) values ('RLS Test', '9876543210', 'converted');
rollback;
