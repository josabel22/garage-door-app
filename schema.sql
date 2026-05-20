create extension if not exists "uuid-ossp";

create type user_role as enum ('admin', 'technician', 'client');
create type job_status as enum ('pending', 'assigned', 'on_route', 'working', 'completed', 'warranty', 'cancelled');
create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type inventory_movement_type as enum ('in', 'out', 'auto_consumption', 'transfer');

create table branches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  phone text,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  role user_role not null,
  name text not null,
  username text unique not null,
  email text,
  phone text,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  code text unique not null,
  name text not null,
  plate text,
  technician_id uuid references users(id),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  user_id uuid references users(id),
  name text not null,
  email text,
  phone text not null,
  address text not null,
  created_at timestamptz not null default now()
);

create table parts (
  id uuid primary key default uuid_generate_v4(),
  sku text unique not null,
  name text not null,
  category text,
  low_stock_threshold integer not null default 3,
  created_at timestamptz not null default now()
);

create table vehicle_inventory (
  vehicle_id uuid references vehicles(id) on delete cascade,
  part_id uuid references parts(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (vehicle_id, part_id)
);

create table jobs (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  client_id uuid references clients(id) not null,
  technician_id uuid references users(id),
  vehicle_id uuid references vehicles(id),
  ticket_number text unique not null,
  status job_status not null default 'pending',
  priority text not null default 'Media',
  description text not null,
  materials text,
  address text not null,
  phone text not null,
  optional_email text,
  signed boolean not null default false,
  started_at timestamptz,
  finished_at timestamptz,
  arrival_lat numeric(10,7),
  arrival_lng numeric(10,7),
  exit_lat numeric(10,7),
  exit_lng numeric(10,7),
  notes text,
  created_at timestamptz not null default now()
);

create table job_materials (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  part_id uuid references parts(id),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table job_assets (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  kind text not null check (kind in ('before_photo', 'after_photo', 'signature', 'pdf')),
  storage_url text not null,
  created_at timestamptz not null default now()
);

create table warranties (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  client_id uuid references clients(id),
  technician_id uuid references users(id),
  vehicle_id uuid references vehicles(id),
  starts_at date not null,
  expires_at date not null,
  status text not null default 'active',
  approval_status text not null default 'pending',
  notes text
);

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  client_id uuid references clients(id) not null,
  technician_id uuid references users(id),
  scheduled_at timestamptz not null,
  status appointment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table scheduled_maintenances (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) not null,
  technician_id uuid references users(id),
  next_date date not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid references vehicles(id),
  part_id uuid references parts(id),
  job_id uuid references jobs(id),
  technician_id uuid references users(id),
  type inventory_movement_type not null,
  action text,
  quantity integer not null,
  before_quantity integer not null,
  after_quantity integer not null,
  notes text,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_jobs_technician_created on jobs (technician_id, created_at desc);
create index idx_jobs_ticket on jobs (ticket_number);
create index idx_jobs_status on jobs (status);
create index idx_inventory_vehicle on vehicle_inventory (vehicle_id);
create index idx_appointments_date on appointments (scheduled_at);
