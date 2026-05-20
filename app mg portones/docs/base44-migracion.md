# Migracion a Base44

## Estado actual

La version actual de MG Portones funciona como prototipo local en `index.html` y guarda datos en el navegador. Para Base44 conviene migrarla a una app React/Vite con entidades persistentes.

Base44 usa estructura React/Vite con carpetas como `src/pages`, `src/components`, `src/api`, `src/entities` y `functions`. Tambien permite desplegar el frontend con `base44 deploy`.

## Recomendacion

Usar Base44 para el piloto online con datos centralizados, autenticacion y entidades. No copiar el `index.html` tal cual; reconstruirlo en Base44 como app React para que sea mantenible.

## Entidades sugeridas

Crear estas entidades en Base44:

### UserProfile

- name: string
- username: string
- role: enum admin, technician, client
- phone: string
- email: string
- vehicleCode: string
- active: boolean
- clientId: string

### Vehicle

- code: string
- name: string
- plate: string
- technicianId: string
- technicianName: string
- active: boolean
- notes: string

### Client

- name: string
- phone: string
- email: string
- address: string

### InventoryItem

- vehicleCode: string
- part: string
- quantity: number
- minQuantity: number
- active: boolean

### InventoryMovement

- vehicleCode: string
- part: string
- action: string
- quantity: number
- beforeQuantity: number
- afterQuantity: number
- technicianId: string
- technicianName: string
- ticket: string
- date: string

### JobReport

- ticket: string
- clientId: string
- clientName: string
- technicianId: string
- technicianName: string
- vehicleCode: string
- status: enum Pendiente, Asignado, En camino, Trabajando, Esperando repuesto, Pausado, Garantia, Finalizado, Cancelado
- priority: enum Baja, Media, Alta, Urgente
- date: string
- address: string
- phone: string
- email: string
- description: string
- materials: string
- notes: string
- warranty: enum Pendiente, Activa, Sin garantia, Vencida
- warrantyEnd: string
- signed: boolean
- closedAt: string
- pdfStatus: enum Pendiente, Generado
- gps: string
- arrival: string
- departure: string
- beforePhotos: array
- afterPhotos: array

### Warranty

- ticket: string
- clientId: string
- clientName: string
- technicianId: string
- technicianName: string
- vehicleCode: string
- start: string
- end: string
- status: enum Activa, Proxima a vencer, Vencida
- approval: string

### Appointment

- clientName: string
- technicianName: string
- date: string
- hour: string
- status: string
- notes: string

### Maintenance

- clientId: string
- clientName: string
- nextDate: string
- frequency: string
- technicianId: string
- technicianName: string
- status: string
- notes: string

### Notification

- role: string
- technicianId: string
- text: string
- type: string
- read: boolean

### AuditLog

- userName: string
- role: string
- action: string
- entity: string
- beforeValue: string
- afterValue: string
- date: string

## Prompt listo para Base44

Copiar y pegar en Base44:

```text
Construye una app profesional para MG Portones, empresa de reparacion e instalacion de puertas de garaje.

Debe ser React/Vite, mobile-first, rapida, con roles Administrador, Tecnico y Cliente.

Crear dashboard, reportes, inventario movil, moviles, citas, garantias, mantenimientos, clientes, buscador avanzado, usuarios y auditoria.

Roles:
- Admin ve todo y puede crear/editar/desactivar/eliminar tecnicos, moviles, clientes, inventario, reportes y garantias.
- Tecnico solo ve sus trabajos de maximo 7 dias anteriores, su inventario movil y sus clientes asignados.
- Cliente solo ve sus reportes/citas/garantias.

Reportes:
- Formulario pantalla completa optimizado para telefono.
- Campos: cliente, telefono, direccion, boleta, estado, descripcion, materiales, notas, fotos antes/despues, firma, garantia.
- Sin campo costo.
- Crear cliente automaticamente si no existe.
- Buscador inteligente de repuestos por movil, sin mostrar lista completa al inicio.
- Solo repuestos seleccionados se agregan al reporte.
- Al guardar, rebajar inventario y registrar movimiento.
- Tecnico puede editar estado, descripcion, materiales, fotos y notas solo si no esta Finalizado, Completado o Cerrado.
- Al Finalizar bloquear reporte, guardar cierre y marcar PDF generado.

Inventario:
- Inventario independiente por movil.
- Tecnico puede agregar productos en pantalla completa, ajustar stock y actualizar cantidades.
- Admin puede agregar, editar, eliminar, transferir y ver historial.
- Toda modificacion registra bitacora.

Garantias:
- Fecha inicio, fecha final, calendario visual, dias restantes.
- Estados automaticos: Activa, Proxima a vencer, Vencida.
- Admin abre garantia solo si esta vigente; si esta vencida mostrar "Garantia vencida".
- Asignar garantia con selector de tecnico y movil.

Notificaciones:
- Inventario bajo, garantias proximas a vencer, mantenimientos pendientes, trabajos asignados y citas proximas.

Auditoria:
- Registrar usuario, fecha, accion, entidad, valor anterior y valor nuevo.

Usar entidades persistentes para usuarios, vehiculos, clientes, inventario, movimientos, reportes, garantias, citas, mantenimientos, notificaciones y auditoria.
```

## Pasos tecnicos

1. Crear app nueva en Base44.
2. Pegar el prompt anterior.
3. Crear/validar entidades.
4. Revisar permisos por rol.
5. Importar datos iniciales de prueba.
6. Probar en telefono.
7. Publicar desde Base44.

## CLI opcional

Si se trabaja con codigo local:

```bash
npm install -g base44@latest
base44 create
npm install @base44/sdk
npm run build
base44 deploy
```

## Importante

La app local actual sirve como referencia funcional. Para Base44 se recomienda reconstruirla como React con entidades, no usar `localStorage` como base principal.
