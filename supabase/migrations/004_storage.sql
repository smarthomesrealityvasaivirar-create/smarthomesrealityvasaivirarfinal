-- 004: Storage bucket for listing photos. Public read, admin-only write. Max 8 MB, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public read property images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'property-images');
create policy "admin upload property images" on storage.objects
  for insert to authenticated with check (bucket_id = 'property-images' and public.is_admin());
create policy "admin update property images" on storage.objects
  for update to authenticated using (bucket_id = 'property-images' and public.is_admin());
create policy "admin delete property images" on storage.objects
  for delete to authenticated using (bucket_id = 'property-images' and public.is_admin());
