-- 001: properties + property_images. Run on a FRESH Supabase project, in order 001 -> 004, then seed.sql.
create extension if not exists "pgcrypto";

create type public.property_purpose  as enum ('buy', 'rent');
create type public.property_category as enum ('apartment', 'commercial', 'plot');
create type public.property_status   as enum ('draft', 'published', 'sold', 'rented', 'archived');
create type public.furnishing_status as enum ('unfurnished', 'semi-furnished', 'furnished');
create type public.area_type         as enum ('carpet', 'built_up', 'plot_area');
create type public.price_unit        as enum ('lacs', 'crores', 'per_month', 'per_sqft');
create type public.tenant_preference as enum ('any', 'family', 'bachelor');

create sequence public.property_ref_seq start 1;

create table public.properties (
  id                uuid primary key default gen_random_uuid(),
  reference_number  text unique not null,
  slug              text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title             text not null check (char_length(title) between 5 and 140),
  purpose           public.property_purpose  not null,
  category          public.property_category not null,
  bhk_type          text,
  price             numeric(12,2) not null check (price >= 0),
  price_unit        public.price_unit not null,
  price_negotiable  boolean not null default false,
  area_sqft         integer check (area_sqft > 0),
  area_type         public.area_type default 'carpet',
  locality          text not null,
  city              text not null default 'Vasai-Virar',
  full_address      text,
  floor             integer,
  total_floors      integer,
  bedrooms          integer check (bedrooms >= 0),
  bathrooms         integer check (bathrooms >= 0),
  balconies         integer check (balconies >= 0),
  parking           integer check (parking >= 0),
  furnishing        public.furnishing_status,
  tenant_preference public.tenant_preference not null default 'any',
  direct_owner      boolean not null default false,
  age_years         integer check (age_years >= 0),
  available_from    date,
  description       text not null,
  highlights        text[] not null default '{}',
  amenities         text[] not null default '{}',
  status            public.property_status not null default 'draft',
  featured          boolean not null default false,
  cover_image_url   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint sold_only_if_buy    check (status <> 'sold'   or purpose = 'buy'),
  constraint rented_only_if_rent check (status <> 'rented' or purpose = 'rent')
);

create table public.property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete cascade,
  url           text not null,
  storage_path  text,
  alt_text      text,
  display_order integer not null default 0,
  is_cover      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_properties_status_purpose on public.properties(status, purpose, created_at desc);
create index idx_properties_featured on public.properties(featured) where featured;
create index idx_property_images_order on public.property_images(property_id, display_order);
create unique index one_cover_per_property on public.property_images(property_id) where is_cover;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

-- Reference number format SHR-YYYY-### (e.g. SHR-2026-009). Generated when left blank.
create or replace function public.generate_property_reference() returns trigger language plpgsql as $$
begin
  if new.reference_number is null or new.reference_number = '' then
    new.reference_number := 'SHR-' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY') || '-' ||
      lpad(nextval('public.property_ref_seq')::text, 3, '0');
  end if;
  return new;
end; $$;

create trigger trg_properties_reference before insert on public.properties
  for each row execute function public.generate_property_reference();
