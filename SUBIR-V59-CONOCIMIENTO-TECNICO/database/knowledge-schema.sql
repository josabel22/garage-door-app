-- MG Portones - esquema futuro para conocimiento tecnico
-- Este archivo NO es necesario para el piloto local V59.
-- Usarlo solo cuando se decida migrar el modulo a Supabase.

create table if not exists public.knowledge_cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text,
  model text,
  equipment_type text,
  symptoms text not null,
  measurements text,
  diagnosis text not null,
  solution text not null,
  avoid text,
  risk_level text not null default 'medio',
  confidence_level text not null default 'media',
  status text not null default 'pending_review',
  created_by text,
  reviewed_by text,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.knowledge_permissions (
  user_id text primary key,
  can_contribute_knowledge boolean not null default false,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_audit (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  detail text,
  actor text,
  created_at timestamptz not null default now()
);

alter table public.knowledge_cases enable row level security;
alter table public.knowledge_permissions enable row level security;
alter table public.knowledge_audit enable row level security;

-- Politicas recomendadas para una fase con Supabase Auth real:
-- 1. Todos los usuarios autenticados pueden leer casos status = 'published'.
-- 2. Solo usuarios habilitados pueden insertar casos pending_review.
-- 3. Solo admin/supervisor puede cambiar status a validated/published/rejected.
-- 4. Solo admin/supervisor puede modificar permisos.
