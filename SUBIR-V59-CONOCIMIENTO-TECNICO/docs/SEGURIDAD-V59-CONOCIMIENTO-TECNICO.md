# Seguridad V59 - Conocimiento Tecnico

## Aislamiento
El modulo se implementa como una pagina independiente en `client/public/conocimiento`. Esto reduce el riesgo de romper el flujo de reportes.

## Datos
La primera version guarda conocimiento en localStorage propio. No escribe en `mg_data`. Para pruebas puede leer usuarios desde `mg_data` si la app principal ya esta abierta en el mismo navegador.

## Permisos
- Admin, administrador, gerencia o supervisor: puede crear, revisar, publicar y habilitar usuarios.
- Tecnico habilitado: puede crear propuestas que quedan pendientes de revision.
- Tecnico no habilitado: solo consulta casos publicados.

## Riesgos conocidos
- localStorage no es una base centralizada; si se usa en varios equipos, hay que exportar/importar o migrar luego a Supabase.
- Las contrasenas actuales siguen dependiendo del sistema de usuarios existente de la app.
- Este modulo no reemplaza autenticacion robusta ni RLS en Supabase.

## Recomendacion futura
Cuando el flujo sea aprobado, migrar a Supabase con tablas separadas y politicas RLS para evitar depender de localStorage.
