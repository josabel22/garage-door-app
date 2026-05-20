# MG Portones - Sistema de gestion

Aplicacion profesional para administrar tecnicos, clientes, reportes de trabajo, inventario por movil, citas, garantias, PDFs e historial de servicios.

## Ejecutar ahora

Abre `index.html` en el navegador. Esta version funciona sin servidor, guarda datos en `localStorage`, permite operar en escritorio y movil, y esta preparada como prototipo funcional PWA/offline.

Credenciales demo:

- Administrador: `admin` / `admin123`
- Tecnico: `tecnico1` / `tecnico123`
- Cliente: `cliente1` / `cliente123`

## Estructura preparada para produccion

- `client/`: frontend React + TailwindCSS previsto.
- `server/`: backend Node.js + Express previsto.
- `database/schema.sql`: modelo PostgreSQL/Supabase escalable.
- `docs/architecture.md`: arquitectura, seguridad, offline sync y ruta de implementacion.

## Siguiente paso recomendado

Instalar Node.js con permisos correctos y ejecutar:

```bash
npm install
npm run dev
```

Actualmente esta maquina no permite ejecutar `node.exe` y no tiene `npm` disponible en el PATH, por eso la version inmediata es estatica y autocontenida.
