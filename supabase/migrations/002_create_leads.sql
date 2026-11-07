-- 002: enquiries (visit / contact / callback leads) and owner sell/rent-out requests
create type public.enquiry_type   as enum ('general', 'property_visit', 'callback');
create type public.enquiry_status as enum ('new', 'contacted', 'visit_scheduled', 'converted', 'lost');
create type public.sell_status    as enum ('new', 'contacted', 'approved', 'rejected', 'listed');

create table public.enquiries (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 2 and 80),
  phone          text not null check (phone ~ '^[6-9][0-9]{9}$'),
  email          text,
  message        text check (char_length(message) <= 1000),
  visit_date     date,
  enquiry_type   public.enquiry_type not null default 'general',
  property_id    uuid references public.properties(id) on delete set null,
  property_title text,
  property_ref   text,
  status         public.enquiry_status not null default 'new',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_enquiries_status_created on public.enquiries(status, created_at desc);
create trigger trg_enquiries_updated_at before update on public.enquiries
  for each row execute function public.set_updated_at();

create table public.sell_requests (
  id             uuid primary key default gen_random_uuid(),
  owner_name     text not null check (char_length(owner_name) between 2 and 80),
  phone          text not null check (phone ~ '^[6-9][0-9]{9}$'),
  email          text,
  property_type  text not null,
  city           text not null default 'Vasai-Virar',
  locality       text not null,
  intention      text not null check (intention in ('sell', 'rent_out')),
  expected_price text,
  description    text check (char_length(description) <= 2000),
  status         public.sell_status not null default 'new',
  notes          text,
  property_id    uuid references public.properties(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_sell_requests_status_created on public.sell_requests(status, created_at desc);
create trigger trg_sell_requests_updated_at before update on public.sell_requests
  for each row execute function public.set_updated_at();
