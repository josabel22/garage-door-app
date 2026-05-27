-- Supabase Storage para fotos de reportes MG Portones
-- Ejecutar en Supabase SQL Editor una sola vez.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mg-report-photos',
  'mg-report-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "mg_report_photos_public_select" on storage.objects;
drop policy if exists "mg_report_photos_public_insert" on storage.objects;
drop policy if exists "mg_report_photos_public_update" on storage.objects;

create policy "mg_report_photos_public_select"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'mg-report-photos');

create policy "mg_report_photos_public_insert"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'mg-report-photos');

create policy "mg_report_photos_public_update"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'mg-report-photos')
with check (bucket_id = 'mg-report-photos');
