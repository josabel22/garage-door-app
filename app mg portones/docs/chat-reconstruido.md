# Chat reconstruido del proyecto MG Portones

Este documento reemplaza la memoria del chat anterior y resume el estado actual del proyecto a partir de los archivos existentes.

## Objetivo del proyecto

Construir un sistema profesional para MG Portones que permita administrar la operacion diaria de una empresa de instalacion, reparacion y mantenimiento de portones/puertas de garaje.

El sistema esta pensado para tres roles:

- Administrador: controla usuarios, tecnicos, clientes, moviles, inventario, citas, garantias, mantenimientos, reportes y metricas.
- Tecnico: ve sus trabajos asignados, crea reportes desde movil, registra materiales, firma, fotos, GPS y sincronizacion offline.
- Cliente: consulta historial, garantias, citas y PDFs de servicio.

## Estado actual

La version funcional inmediata es el archivo raiz `index.html`.

Esta version:

- Funciona sin servidor.
- Guarda datos en `localStorage`.
- Esta preparada como prototipo PWA/offline.
- Incluye datos demo y pantallas reales para probar el flujo.
- Puede abrirse directamente en el navegador.

Credenciales demo:

- Administrador: `admin` / `admin123`
- Tecnico: `tecnico1` / `tecnico123`
- Cliente: `cliente1` / `cliente123`

## Funcionalidades ya presentes en el prototipo

- Login por rol.
- Dashboard con trabajos recientes, alertas, inventario bajo y garantias.
- Reportes de trabajo con boleta, cliente, tecnico, movil, prioridad, estado, garantia y firma.
- Creacion de reportes por administrador o tecnico.
- Filtros de reportes para administrador.
- Acciones de PDF/imprimir y compartir por WhatsApp.
- Inventario por movil.
- Ajustes y transferencias de inventario.
- Registro de movimientos de inventario.
- Moviles/unidades con tecnico asignado.
- Citas.
- Garantias y aprobacion/asignacion de casos.
- Mantenimientos programados.
- Clientes con historial de trabajos y garantias.
- Usuarios del sistema con activar/desactivar, editar, resetear clave y borrar.
- Busqueda avanzada por cliente, boleta, tecnico, material, movil, fecha y estado.
- Cola de sincronizacion offline simulada.
- Notificaciones por asignacion, stock bajo, garantias y mantenimientos.

## Estructura del proyecto

- `index.html`: aplicacion standalone funcional.
- `manifest.webmanifest`: manifiesto PWA.
- `sw.js`: service worker basico para cache offline.
- `screenshots/`: capturas del estado visual del prototipo.
- `client/`: base React + Vite + Tailwind para migrar el frontend.
- `server/`: base Express para API.
- `database/schema.sql`: esquema PostgreSQL/Supabase.
- `docs/architecture.md`: arquitectura prevista.

## Frontend preparado

La carpeta `client/` contiene una base React muy inicial. Por ahora solo muestra una pantalla de bienvenida que indica que el frontend React esta preparado para conectarse al API Express.

Dependencias previstas:

- React 19
- Vite
- TailwindCSS
- lucide-react

Siguiente trabajo natural: migrar la experiencia de `index.html` a componentes React.

## Backend preparado

La carpeta `server/` contiene una base Node.js + Express con:

- `GET /health`
- `POST /api/auth/login`
- `GET /api/dashboard/admin`
- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/inventory`
- Middleware JWT `requireAuth`
- Middleware de roles `requireRole`
- Conexion PostgreSQL preparada en `db.js`

El backend todavia usa datos demo o respuestas vacias en varias rutas. La logica real debe conectarse al esquema SQL.

## Base de datos preparada

`database/schema.sql` define tablas para:

- Sucursales
- Usuarios
- Moviles
- Clientes
- Repuestos
- Inventario por movil
- Trabajos/reportes
- Materiales usados en trabajos
- Archivos/fotos/firma/PDF
- Garantias
- Citas
- Mantenimientos programados
- Movimientos de inventario
- Auditoria

Tambien incluye enums e indices principales.

## Decisiones ya tomadas

- El prototipo debe poder usarse inmediatamente sin instalar dependencias.
- La version productiva deberia ser React + Express + PostgreSQL/Supabase.
- Los tecnicos deben tener modo offline.
- Los reportes firmados quedan bloqueados para tecnicos.
- Administracion puede ver todo; tecnicos solo su alcance.
- En produccion, el backend debe limitar reportes de tecnicos a los ultimos 7 dias.
- Cada reporte finalizado debe generar PDF con datos, fotos, firma, materiales, garantia y QR.
- El inventario debe manejarse por movil y descontarse por materiales usados.

## Pendientes importantes

- Instalar Node.js/npm correctamente en la maquina o usar un entorno donde esten disponibles.
- Migrar el `index.html` standalone a React por modulos.
- Conectar backend Express a PostgreSQL/Supabase.
- Reemplazar passwords demo por bcrypt y usuarios reales.
- Implementar CRUD real para clientes, usuarios, moviles, reportes, inventario, citas, garantias y mantenimientos.
- Implementar subida de fotos/firma y almacenamiento.
- Implementar generacion real de PDF.
- Implementar sincronizacion offline con IndexedDB y cola persistente.
- Agregar validaciones Zod a payloads.
- Agregar auditoria administrativa.
- Agregar pruebas basicas de rutas y flujos criticos.

## Proximo paso recomendado

Si se quiere avanzar rapido sin romper lo existente:

1. Mantener `index.html` como demo usable.
2. Crear componentes React equivalentes para login, shell, dashboard, reportes e inventario.
3. Extraer los datos demo a un modulo compartido.
4. Levantar el API con rutas reales empezando por auth, reportes e inventario.
5. Conectar React al API con fallback local/offline.

