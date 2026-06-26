# V59 - Conocimiento Tecnico MG Portones

## Objetivo
Crear una base de conocimiento separada de la app principal para guardar casos tecnicos validados: sintomas, mediciones, diagnostico, solucion recomendada y errores que se deben evitar.

## Principio de seguridad operativa
Esta version no modifica reportes, clientes, fotos, inventario ni sincronizacion de Supabase. El modulo usa su propio almacenamiento local:

- `mg_knowledge_v59`: casos, permisos y caja negra del modulo.
- `mg_knowledge_source_v59`: respaldo importado solo para pruebas del modulo.
- `mg_knowledge_session_v59`: sesion local del modulo.

No escribe en `mg_data`.

## Ruta publicada esperada
Al subir los archivos dentro de `client/public/conocimiento`, Azure Static Web Apps debe publicar el modulo en:

`https://TU-SITIO.azurestaticapps.net/conocimiento/index.html`

## Flujo recomendado
1. Admin entra al modulo.
2. Admin habilita en Permisos a los tecnicos expertos que pueden aportar casos.
3. Tecnico habilitado crea un caso.
4. Admin revisa y publica.
5. Tecnicos normales solo consultan casos publicados.

## Archivos incluidos
- `client/public/conocimiento/index.html`
- `client/public/conocimiento/conocimiento.css`
- `client/public/conocimiento/conocimiento.js`
- `client/public/conocimiento/casos-ejemplo.json`
- `database/knowledge-schema.sql`
- `docs/*`

## No subir como reemplazo del index principal
No reemplazar `client/index.html` con estos archivos. Este modulo se sube como carpeta adicional dentro de `client/public/conocimiento`.
