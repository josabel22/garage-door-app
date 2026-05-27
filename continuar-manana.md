# Continuar manana - MG Portones

## Estado actual

Proyecto local:

`C:\Users\Usuario\OneDrive\Documentos\app mg portones`

App publicada:

`https://calm-dune-0d55f9410.7.azurestaticapps.net`

Version de cache actual:

`mg-portones-v18`

Para probar despues del despliegue:

`https://calm-dune-0d55f9410.7.azurestaticapps.net/?v=18`

## Arquitectura actual

- Frontend: Azure Static Web Apps.
- Base de datos: Supabase.
- Persistencia principal: tabla `app_state`, registro `production`.
- Despliegue: GitHub Actions.
- Presupuesto objetivo: mantener bajo costo, idealmente dentro de $5 mensuales.

## Supabase

URL del proyecto:

`https://zlalsgwtpcygbhpubdfv.supabase.co`

Configuracion usada en archivos:

- `supabase-config.js`
- `client/public/supabase-config.js`
- `client/supabase-config.js`

SQL usado:

- `database/app_state_supabase.sql`

## Archivos importantes para subir a GitHub

Cuando haya cambios, revisar principalmente:

- `client/index.html`
- `index.html`
- `client/public/sw.js`
- `sw.js`
- `client/public/supabase-config.js`
- `supabase-config.js`
- `mg-logo.jpg`
- `client/public/mg-logo.jpg`

## Cambios recientes hechos

- App conectada a Supabase.
- Logo de MG agregado.
- Menu lateral con scroll para usarlo en telefono.
- Fotos de reporte permiten camara o galeria.
- Reporte/PDF muestra logo, telefono `83124541` y correo `mgportoelectricos@yahoo.es`.
- Telefono de cliente quedo opcional.
- Se corrigio que tecnicos eliminados reaparecieran por datos demo.
- Se corrigieron caracteres raros/mojibake.
- Se agrego boton para eliminar reportes en administrador.
- Se quito el texto de ayuda de login con credenciales demo.
- Se corrigio el problema de campos `NaN` al crear reportes.
- Al abrir nuevo reporte se limpia el borrador anterior.
- Retroalimentacion del 26 de mayo:
  - Se limpiaron borradores viejos del formulario al iniciar.
  - Se desactivo autollenado en campos principales del reporte.
  - Se agrego compresion de fotos antes de guardarlas.
  - Se mejoro la mezcla entre datos locales pendientes y datos de Supabase.
  - La cola offline ya no se borra hasta confirmar subida exitosa a Supabase.
  - Al volver internet, la app intenta sincronizar pendientes automaticamente.
- Restauracion desde PDF:
  - Se restauraron en Supabase los reportes `015213`, `015214`, `015215`, `015216` y `015217`.
  - La base central quedo con 6 reportes: `015215`, `015217`, `015216`, `015214`, `015213` y `B-1492`.
  - Los reportes restaurados quedaron como `Finalizado`, con descripcion `Reporte restaurado desde PDF`.

## Pendiente de prueba manana

Probar con uso real:

1. Login de administrador.
2. Crear reporte desde administrador.
3. Crear reporte desde tecnico en telefono.
4. Verificar que los campos del reporte abran limpios.
5. Verificar que telefono del cliente sea opcional.
6. Subir fotos desde camara y galeria.
7. Generar PDF y revisar logo/datos de empresa.
8. Sincronizar con Supabase.
9. Revisar que los tecnicos eliminados no aparezcan en telefono.
10. Probar eliminar reporte desde administrador.

## Retroalimentacion para aplicar

Cuando haya comentarios de uso real, anotar:

- Que pantalla se sintio dificil.
- Que dato hizo falta en el reporte.
- Que funcion no cargo en telefono.
- Si hubo problemas con internet/sincronizacion.
- Si el PDF necesita cambios.
- Si algun tecnico ve datos que no deberia.
- Si algun campo sigue siendo obligatorio cuando no debe.

## Mejoras futuras documentadas

- `docs/version-2-recomendaciones.md`
- `docs/futuras-actualizaciones.md`

La version 2 debe decidirse despues de probar esta version y recibir retroalimentacion real.
