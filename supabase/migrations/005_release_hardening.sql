-- 005: release candidate hardening. Run once after 001-004 (also safe to rerun).
-- Service key is SERVER ONLY. Anonymous API clients can no longer bypass the website's lead handler.
drop policy if exists "public insert enquiries" on public.enquiries;
drop policy if exists "public insert sell_requests" on public.sell_requests;
revoke insert on public.enquiries, public.sell_requests from anon, authenticated;
grant all on public.enquiries, public.sell_requests to service_role;
-- Explicit privileges rather than relying on project-specific default grants.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.properties, public.property_images to anon, authenticated;
grant insert, update, delete on public.properties, public.property_images to authenticated;
grant select, update, delete on public.enquiries, public.sell_requests to authenticated;
grant usage, select on sequence public.property_ref_seq to authenticated;

-- SECURITY INVOKER: caller must pass both the app allowlist and existing database RLS.
-- One SQL statement = one transaction. Any image error rolls back the property edit too.
create or replace function public.save_property(p_id uuid, p_fields jsonb, p_images jsonb)
returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  target_id uuid := coalesce(p_id, gen_random_uuid());
  row_data public.properties;
  image jsonb;
  position integer := 0;
  cover_position integer := 0;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if jsonb_typeof(p_images) <> 'array' or jsonb_array_length(p_images) > 15 then
    raise exception 'Expected at most 15 photos';
  end if;
  row_data := jsonb_populate_record(null::public.properties, p_fields);
  if row_data.status = 'published' and (jsonb_array_length(p_images) = 0 or row_data.price <= 0 or char_length(row_data.description) < 30) then
    raise exception 'Add photos, a positive price and description before publishing';
  end if;
  select coalesce(min((ordinality - 1)::integer), 0) into cover_position
    from jsonb_array_elements(p_images) with ordinality
    where (value->>'is_cover')::boolean is true;
  row_data.cover_image_url := p_images->cover_position->>'url';
  if p_id is null then
    insert into public.properties (id, reference_number, slug, title, purpose, category, bhk_type, price, price_unit, price_negotiable, area_sqft, area_type, locality, city, full_address, floor, total_floors, bedrooms, bathrooms, balconies, parking, furnishing, tenant_preference, direct_owner, age_years, available_from, description, highlights, amenities, status, featured, cover_image_url)
    values (target_id, '', row_data.slug, row_data.title, row_data.purpose, row_data.category, row_data.bhk_type, row_data.price, row_data.price_unit, row_data.price_negotiable, row_data.area_sqft, row_data.area_type, row_data.locality, row_data.city, row_data.full_address, row_data.floor, row_data.total_floors, row_data.bedrooms, row_data.bathrooms, row_data.balconies, row_data.parking, row_data.furnishing, row_data.tenant_preference, row_data.direct_owner, row_data.age_years, row_data.available_from, row_data.description, row_data.highlights, row_data.amenities, row_data.status, row_data.featured, row_data.cover_image_url);
  else
    perform 1 from public.properties where id = target_id for update;
    if not found then raise exception 'Property not found'; end if;
    update public.properties set slug = row_data.slug, title = row_data.title, purpose = row_data.purpose, category = row_data.category, bhk_type = row_data.bhk_type, price = row_data.price, price_unit = row_data.price_unit, price_negotiable = row_data.price_negotiable, area_sqft = row_data.area_sqft, area_type = row_data.area_type, locality = row_data.locality, city = row_data.city, full_address = row_data.full_address, floor = row_data.floor, total_floors = row_data.total_floors, bedrooms = row_data.bedrooms, bathrooms = row_data.bathrooms, balconies = row_data.balconies, parking = row_data.parking, furnishing = row_data.furnishing, tenant_preference = row_data.tenant_preference, direct_owner = row_data.direct_owner, age_years = row_data.age_years, available_from = row_data.available_from, description = row_data.description, highlights = row_data.highlights, amenities = row_data.amenities, status = row_data.status, featured = row_data.featured, cover_image_url = row_data.cover_image_url where id = target_id;
  end if;
  delete from public.property_images where property_id = target_id;
  for image in select value from jsonb_array_elements(p_images) loop
    insert into public.property_images (property_id, url, storage_path, alt_text, display_order, is_cover)
    values (target_id, image->>'url', image->>'storage_path', image->>'alt_text', position, position = cover_position);
    position := position + 1;
  end loop;
  return target_id;
end;
$$;
revoke all on function public.save_property(uuid,jsonb,jsonb) from public, anon;
grant execute on function public.save_property(uuid,jsonb,jsonb) to authenticated;

-- Serialize approvals using a row lock. Do NOT copy free-text owner requests or PII into public listings.
create or replace function public.draft_from_request(request_id uuid)
returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare r public.sell_requests; draft_id uuid; heading text; is_rent boolean;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into r from public.sell_requests where id = request_id for update;
  if not found then raise exception 'Request not found'; end if;
  if r.property_id is not null then return r.property_id; end if;
  is_rent := r.intention = 'rent_out';
  heading := left(r.property_type || ' ' || case when is_rent then 'for rent' else 'for sale' end || ' in ' || r.locality, 140);
  insert into public.properties (reference_number, slug, title, purpose, category, price, price_unit, locality, city, description, status)
  values ('', 'owner-request-' || replace(gen_random_uuid()::text, '-', ''), heading,
    case when is_rent then 'rent'::public.property_purpose else 'buy'::public.property_purpose end,
    case when r.property_type ~* 'shop|office|commercial' then 'commercial'::public.property_category
      when r.property_type ~* 'plot|land' then 'plot'::public.property_category else 'apartment'::public.property_category end,
    0, case when is_rent then 'per_month'::public.price_unit else 'lacs'::public.price_unit end,
    r.locality, r.city, '', 'draft') returning id into draft_id;
  update public.sell_requests set status = 'approved', property_id = draft_id where id = request_id;
  return draft_id;
end;
$$;
revoke all on function public.draft_from_request(uuid) from public, anon;
grant execute on function public.draft_from_request(uuid) to authenticated;

create or replace function public.duplicate_property(source_id uuid)
returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare source public.properties; duplicate public.properties;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into source from public.properties where id = source_id for share;
  if not found then raise exception 'Property not found'; end if;
  duplicate := source;
  duplicate.id := gen_random_uuid();
  duplicate.reference_number := '';
  duplicate.slug := source.slug || '-copy-' || left(replace(duplicate.id::text, '-', ''), 12);
  duplicate.title := left(source.title || ' (copy)', 140);
  duplicate.status := 'draft'; duplicate.featured := false;
  duplicate.created_at := now(); duplicate.updated_at := now();
  select public.save_property(null, to_jsonb(duplicate),
    coalesce((select jsonb_agg(to_jsonb(i) order by i.display_order)
      from public.property_images i where i.property_id = source_id), '[]'::jsonb))
    into duplicate.id;
  return duplicate.id;
end;
$$;
revoke all on function public.duplicate_property(uuid) from public, anon;
grant execute on function public.duplicate_property(uuid) to authenticated;

-- Blocks quick-status publication of incomplete owner drafts too.
create or replace function public.check_publication() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if new.status = 'published' and (new.price <= 0 or char_length(trim(new.description)) < 30 or nullif(new.cover_image_url, '') is null) then
    raise exception 'A published listing needs a positive price, a description and cover photo';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_check_publication on public.properties;
create trigger trg_check_publication before insert or update on public.properties
for each row execute function public.check_publication();

-- Normalize mixed lacs/crores/per-square-foot values before sorting/filtering.
-- NOT VALID avoids breaking an upgrade on historical bad data, but enforces future writes.
-- Inspect and correct older invalid rows, then VALIDATE CONSTRAINT before launch.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'valid_listing_price_unit' and conrelid = 'public.properties'::regclass) then
    alter table public.properties add constraint valid_listing_price_unit check (
      (purpose = 'buy' and price_unit in ('lacs','crores','per_sqft')) or
      (purpose = 'rent' and (price_unit = 'per_month' or (category = 'commercial' and price_unit = 'per_sqft')))
    ) not valid;
  end if;
end $$;

alter table public.properties add column if not exists normalized_price numeric
generated always as (
  case price_unit when 'lacs' then price * 100000 when 'crores' then price * 10000000
    when 'per_sqft' then price * area_sqft else price end
) stored;

-- lpad(text,3) truncates 1000 to 100. Preserve the full reference after 999.
create or replace function public.generate_property_reference() returns trigger
language plpgsql set search_path = public, pg_temp as $$
declare sequence_text text;
begin
  if new.reference_number is null or new.reference_number = '' then
    sequence_text := nextval('public.property_ref_seq')::text;
    new.reference_number := 'SHR-' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY') || '-' ||
      lpad(sequence_text, greatest(3, length(sequence_text)), '0');
  end if;
  return new;
end;
$$;
