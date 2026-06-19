# Protocolo v58 - Actualizaciones seguras MG Portones

Objetivo: reducir errores al actualizar la app en produccion y proteger reportes, fotos, usuarios e inventario.

## Regla principal

No subir cambios a GitHub si no existe:

- Respaldo de datos descargado desde la app.
- Copia del codigo anterior.
- Prueba local o revision con `release-check`.
- Lista de pruebas manuales completada.

## Flujo obligatorio

1. Descargar respaldo desde la app como administrador.
2. Guardar copia del `index.html` y `sw.js` anterior.
3. Hacer el cambio en la carpeta de trabajo.
4. Ejecutar:

```powershell
cd "C:\Users\Usuario\OneDrive\Documentos\app mg portones\SUBIR-A-GITHUB-ACTUALIZACION-COMPARTIDA\client"
npm run release-check
```

5. Si pasa, copiar archivos a la carpeta `D:\OneDrive\Documentos\app mg portones`.
6. Subir a GitHub.
7. Esperar Azure.
8. Confirmar en la app que abajo salga la version nueva.

## Pruebas manuales antes de dar por buena una version

- Entrar como administrador.
- Entrar como tecnico.
- Crear reporte sin fotos.
- Crear reporte con fotos.
- Editar reporte existente.
- Eliminar una foto desde editar.
- Ver PDF.
- Descargar PDF.
- Sincronizar con Supabase.
- Descargar respaldo nuevo.
- Confirmar que no desaparecieron reportes anteriores.

## Reglas para v58 en adelante

- Una actualizacion debe tocar pocas cosas.
- No mezclar cambios grandes de interfaz con cambios de sincronizacion.
- No cambiar fotos, reportes y usuarios en la misma version si no es necesario.
- Si una prueba falla, no se sube.
- Si ya se subio y falla, volver al respaldo de codigo anterior.

## Copia estable previa

La version estable antes de v58 quedo guardada en:

`C:\Users\Usuario\OneDrive\Documentos\app mg portones\backups-codigo\v57.10-antes-v58`

