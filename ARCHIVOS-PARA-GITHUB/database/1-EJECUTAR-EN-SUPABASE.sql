-- V61.6 - Permite registrar traslados desde Bodega General hacia una movil.
-- No elimina ni modifica productos, reportes, fotos, Taller ni historiales existentes.

alter table public.mg_general_inventory_movements
  drop constraint if exists mg_general_inventory_movements_movement_type_check;

alter table public.mg_general_inventory_movements
  add constraint mg_general_inventory_movements_movement_type_check
  check (movement_type in ('entrada', 'salida', 'ajuste', 'traslado'));
