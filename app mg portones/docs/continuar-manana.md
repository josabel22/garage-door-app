# Continuar manana - MG Portones

## Estado guardado

El proyecto esta en:

`C:\Users\Usuario\OneDrive\Documentos\app mg portones`

La app funcional actual se ejecuta desde:

`index.html`

Tambien quedo corriendo en el navegador integrado en:

`http://localhost:8091/index.html`

Si manana no abre ese enlace, abrir directamente el archivo:

`C:\Users\Usuario\OneDrive\Documentos\app mg portones\index.html`

## Credenciales demo

- Administrador: `admin` / `admin123`
- Tecnico: `tecnico1` / `tecnico123`
- Cliente: `cliente1` / `cliente123`

## Lo que se hizo en esta sesion

- Se reconstruyo la memoria del proyecto despues de perderse el chat anterior.
- Se guardo la reconstruccion en `docs/chat-reconstruido.md`.
- Se reviso la estructura del proyecto.
- Se confirmo que la version funcional es el `index.html` standalone.
- Se intento abrir `file:///.../index.html` en el navegador integrado, pero la politica del navegador bloqueo archivos locales.
- Se levanto un servidor local temporal y la app cargo correctamente en `http://localhost:8091/index.html`.
- El titulo detectado fue `MG Portones | Gestion Operativa`.

## Resumen del proyecto

MG Portones es una app de gestion operativa para una empresa de instalacion, reparacion y mantenimiento de portones.

Roles principales:

- Administrador: controla usuarios, tecnicos, clientes, moviles, inventario, citas, garantias, mantenimientos, reportes y metricas.
- Tecnico: ve sus trabajos, crea reportes desde movil, registra materiales, firma, fotos, GPS y trabaja offline.
- Cliente: consulta historial, garantias, citas y PDFs.

## Funciones existentes en el prototipo

- Login por rol.
- Dashboard.
- Reportes de trabajo.
- Inventario por movil.
- Ajustes y transferencias de inventario.
- Moviles/unidades.
- Citas.
- Garantias.
- Mantenimientos programados.
- Clientes.
- Usuarios.
- Busqueda avanzada.
- PDF/imprimir.
- Compartir por WhatsApp.
- Sincronizacion offline simulada.
- Notificaciones.

## Archivos clave

- `index.html`: app standalone funcional.
- `docs/chat-reconstruido.md`: memoria reconstruida.
- `docs/architecture.md`: arquitectura prevista.
- `client/`: base React + Vite + Tailwind.
- `server/`: base Express.
- `database/schema.sql`: esquema PostgreSQL/Supabase.

## Siguiente paso recomendado

Mantener `index.html` como demo usable y empezar a migrar la app a React por partes:

1. Login y roles.
2. Layout principal.
3. Dashboard.
4. Reportes.
5. Inventario.
6. Usuarios, clientes, moviles, citas, garantias y mantenimientos.

Despues conectar el backend Express con PostgreSQL/Supabase.

