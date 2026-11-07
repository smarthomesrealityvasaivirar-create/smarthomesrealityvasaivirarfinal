-- 003: Row Level Security. Anonymous visitors can read public listings and INSERT leads. Nothing else.
-- Admins are listed in public.admins (by email). Keep it in sync with the ADMIN_EMAILS env var.

create table public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security; -- no policies: invisible to the API

-- security definer so policies can read admins without exposing the table
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.properties      enable row level security;
alter table public.property_images enable row level security;
alter table public.enquiries       enable row level security;
alter table public.sell_requests   enable row level security;

-- Public read: published, sold and rented listings (sold/rented show a ribbon, drafts never leak)
create policy "public read listed properties" on public.properties
  for select to anon, authenticated
  using (status in ('published', 'sold', 'rented') or public.is_admin());

create policy "public read listed images" on public.property_images
  for select to anon, authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.properties p
      where p.id = property_id and p.status in ('published', 'sold', 'rented')
    )
  );

-- Admin write
create policy "admin insert properties" on public.properties for insert to authenticated with check (public.is_admin());
create policy "admin update properties" on public.properties for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete properties" on public.properties for delete to authenticated using (public.is_admin());

create policy "admin insert images" on public.property_images for insert to authenticated with check (public.is_admin());
create policy "admin update images" on public.property_images for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete images" on public.property_images for delete to authenticated using (public.is_admin());

-- Leads: anyone may INSERT a new lead (status forced to 'new'); only admins can read/update/delete
create policy "public insert enquiries" on public.enquiries
  for insert to anon, authenticated
  with check (status = 'new' and notes is null);
create policy "admin read enquiries"   on public.enquiries for select to authenticated using (public.is_admin());
create policy "admin update enquiries" on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete enquiries" on public.enquiries for delete to authenticated using (public.is_admin());

create policy "public insert sell_requests" on public.sell_requests
  for insert to anon, authenticated
  with check (status = 'new' and notes is null and property_id is null);
create policy "admin read sell_requests"   on public.sell_requests for select to authenticated using (public.is_admin());
create policy "admin update sell_requests" on public.sell_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete sell_requests" on public.sell_requests for delete to authenticated using (public.is_admin());

-- >>> EDIT THIS: the email(s) of the broker who logs into /admin (lower case)
insert into public.admins (email) values ('owner@example.com') on conflict do nothing;
