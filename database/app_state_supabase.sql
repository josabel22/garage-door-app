-- Tabla central para operar MG Portones sin backend propio.
-- Ejecutar en Supabase SQL Editor despues de schema.sql y seed_4_tecnicos.sql.

create table if not exists app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

grant usage on schema public to anon;
grant select, insert, update on app_state to anon;
grant usage on schema public to authenticated;
grant select, insert, update on app_state to authenticated;

drop policy if exists "app_state_public_select" on app_state;
drop policy if exists "app_state_public_insert" on app_state;
drop policy if exists "app_state_public_update" on app_state;

create policy "app_state_public_select"
on app_state
for select
to anon
using (true);

create policy "app_state_public_insert"
on app_state
for insert
to anon
with check (true);

create policy "app_state_public_update"
on app_state
for update
to anon
using (true)
with check (true);
