# Checklist V59 - Conocimiento Tecnico

## Antes de subir
- Descargar respaldo actual desde Administrador.
- Confirmar que la carpeta a subir es `client/public/conocimiento`.
- Confirmar que no se reemplaza `client/index.html`.
- Confirmar que no se modifican reportes, fotos, clientes ni inventario.

## Prueba local minima
- Abrir `/conocimiento/index.html`.
- Login con usuario admin existente o importar respaldo de prueba.
- Ver caso ejemplo publicado.
- Buscar por `Beninca`.
- Buscar por `aislamiento`.
- Crear un caso nuevo como admin.
- Publicar o validar un caso desde Revision.
- Exportar conocimiento.
- Revisar que la app principal siga abriendo normal.

## Prueba de permisos
- Entrar como admin.
- Habilitar un tecnico para aportar.
- Entrar como tecnico habilitado.
- Crear caso y verificar que queda pendiente de revision.
- Entrar como tecnico no habilitado y verificar que solo pueda consultar.

## Criterio de aprobacion
- El modulo abre separado.
- No modifica datos productivos.
- Se puede exportar la caja negra del modulo.
- Un usuario no autorizado no puede crear casos.
- Admin puede publicar casos.
