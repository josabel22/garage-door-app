-- Datos iniciales para MG Portones.
-- Ejecutar despues de database/schema.sql en PostgreSQL o Supabase.
-- IMPORTANTE: cambia nombres, telefonos, correos y contrasenas antes de usar en produccion.

insert into branches (id, name, address, phone)
values (
  '00000000-0000-0000-0000-000000000001',
  'MG Portones',
  'Direccion principal',
  '0000-0000'
)
on conflict do nothing;

-- Las contrasenas de abajo son temporales.
-- El backend final debe guardar hashes bcrypt, no texto plano.
insert into users (id, branch_id, role, name, username, email, phone, password_hash, active)
values
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'Administrador MG Portones',
    'admin',
    'admin@mgportones.com',
    '0000-0000',
    'CAMBIAR_POR_HASH_BCRYPT',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    'technician',
    'Tecnico 1',
    'tecnico1',
    'tecnico1@mgportones.com',
    '0000-0001',
    'CAMBIAR_POR_HASH_BCRYPT',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    'technician',
    'Tecnico 2',
    'tecnico2',
    'tecnico2@mgportones.com',
    '0000-0002',
    'CAMBIAR_POR_HASH_BCRYPT',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    'technician',
    'Tecnico 3',
    'tecnico3',
    'tecnico3@mgportones.com',
    '0000-0003',
    'CAMBIAR_POR_HASH_BCRYPT',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000001',
    'technician',
    'Tecnico 4',
    'tecnico4',
    'tecnico4@mgportones.com',
    '0000-0004',
    'CAMBIAR_POR_HASH_BCRYPT',
    true
  )
on conflict (username) do nothing;

insert into vehicles (id, branch_id, code, name, plate, technician_id, active, notes)
values
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000001',
    'MOV-01',
    'Movil 01',
    '',
    '00000000-0000-0000-0000-000000000201',
    true,
    'Asignado a Tecnico 1'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000001',
    'MOV-02',
    'Movil 02',
    '',
    '00000000-0000-0000-0000-000000000202',
    true,
    'Asignado a Tecnico 2'
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000001',
    'MOV-03',
    'Movil 03',
    '',
    '00000000-0000-0000-0000-000000000203',
    true,
    'Asignado a Tecnico 3'
  ),
  (
    '00000000-0000-0000-0000-000000000304',
    '00000000-0000-0000-0000-000000000001',
    'MOV-04',
    'Movil 04',
    '',
    '00000000-0000-0000-0000-000000000204',
    true,
    'Asignado a Tecnico 4'
  )
on conflict (code) do nothing;

insert into parts (sku, name, category, low_stock_threshold)
values
  ('CONTROL-433', 'Control remoto 433 MHz', 'Controles', 3),
  ('RECEPTOR-433', 'Receptor 433 MHz', 'Electronica', 2),
  ('FOTO-CELDA', 'Fotocelda de seguridad', 'Seguridad', 2),
  ('CREMALLERA', 'Cremallera para porton', 'Mecanica', 5),
  ('TARJETA-MOTOR', 'Tarjeta para motor', 'Electronica', 1),
  ('BATERIA-12V', 'Bateria 12V', 'Energia', 2)
on conflict (sku) do nothing;
