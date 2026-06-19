# Checklist publicacion MG Portones

Version: v58.0

Respaldo usado:

`C:\Users\Usuario\Downloads\respaldo-mg-portones-2026-06-19T03-25-27-215Z.json`

## Antes de subir

- [ ] Descargar respaldo desde la app.
- [ ] Confirmar que la app actual funciona.
- [ ] Confirmar copia de codigo anterior.
- [ ] Ejecutar `npm run release-check`.
- [ ] Confirmar que el build no falla.

## Pruebas funcionales

- [ ] Login administrador.
- [ ] Login tecnico.
- [ ] Dashboard carga.
- [ ] Reportes cargan.
- [ ] Crear reporte sin fotos.
- [ ] Crear reporte con fotos.
- [ ] Editar reporte existente.
- [ ] Guardar edicion sin error de boleta duplicada.
- [ ] Eliminar foto desde editar.
- [ ] Vista PDF abre.
- [ ] Descargar PDF funciona.
- [ ] Sincronizar no deja pendientes inesperados.
- [ ] Descargar respaldo despues de probar.

## Archivos a subir

- `client/index.html`
- `client/public/sw.js`
- `client/package.json` si se quieren conservar los comandos de validacion en GitHub.

## Resultado

- [ ] Aprobada
- [ ] Requiere correccion

Notas:

