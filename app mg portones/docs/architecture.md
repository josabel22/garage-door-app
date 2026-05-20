# Arquitectura del sistema

## Objetivo

Sistema multirol para operar una empresa real de reparacion e instalacion de puertas de garaje, preparado para multiples tecnicos, moviles y sucursales.

## Capas

- Frontend: React, TailwindCSS, PWA mobile-first.
- Backend: Node.js, Express, JWT, control de roles.
- Base de datos: PostgreSQL o Supabase.
- Storage: imagenes optimizadas por reporte y firma digital.
- PDF: generacion automatica desde plantilla profesional.
- Offline: IndexedDB/local queue para tecnicos, sincronizacion por lotes al recuperar internet.

## Roles

- Administrador: acceso completo a usuarios, tecnicos, moviles, inventario, citas, reportes y metricas.
- Tecnico: solo sus trabajos, clientes asignados e inventario de su movil. El backend debe limitar reportes a 7 dias.
- Cliente: historial, PDFs, garantias, citas y estados.

## Seguridad

- JWT con expiracion corta y refresh token seguro.
- Middleware `requireRole`.
- Politicas por tenant/sucursal si se usa Supabase RLS.
- Bitacora de acciones administrativas y cambios de inventario.
- Validacion de payloads en backend.
- Backups automaticos de PostgreSQL/Supabase.

## Offline

Los tecnicos deben poder crear reportes, capturar fotos, firmas, materiales y GPS sin internet. La app guarda cambios en IndexedDB y crea eventos pendientes. Al volver la conexion:

1. Valida sesion.
2. Sube imagenes/firma.
3. Crea o actualiza reporte.
4. Registra consumo de inventario.
5. Genera PDF.
6. Marca el evento como sincronizado.

## PDF

Cada reporte finalizado genera un PDF con logo, datos de empresa, cliente, tecnico, boleta, fotos, firma, materiales, garantia y QR. El QR debe apuntar al portal de cliente o al enlace publico firmado del documento.
