# Piloto en Microsoft Azure

## Recomendacion

Para probar desde telefonos con una URL publica, usar **Azure Static Web Apps**.

Esta app actual es estatica: `index.html`, `sw.js` y `manifest.webmanifest`. Por eso Static Web Apps es mas simple que App Service para el piloto.

## Archivos preparados

- `staticwebapp.config.json`: configuracion de Azure Static Web Apps.
- `.github/workflows/azure-static-web-apps.yml`: workflow para despliegue desde GitHub.

## Opcion A: desde Azure Portal + GitHub

1. Subir este proyecto a un repositorio de GitHub.
2. En Azure Portal crear:
   - Servicio: Static Web App
   - Plan: Free o Standard para piloto
   - Source: GitHub
   - Build preset: Custom
   - App location: `/`
   - Api location: dejar vacio
   - Output location: dejar vacio
3. Azure creara o usara el workflow de GitHub.
4. Al terminar, Azure dara una URL publica tipo:

```text
https://nombre-random.azurestaticapps.net
```

5. Abrir esa URL desde el telefono.

## Opcion B: despliegue manual con SWA CLI

Instalar herramientas:

```powershell
npm install -g @azure/static-web-apps-cli
```

Crear la Static Web App en Azure Portal y obtener el deployment token.

Luego ejecutar desde esta carpeta:

```powershell
swa deploy . --deployment-token TU_TOKEN
```

## Importante para el piloto

La URL publica funcionara desde cualquier telefono. Pero esta version todavia guarda datos en el navegador del dispositivo. Para operacion real se debe conectar a una base central como Azure SQL, PostgreSQL o Supabase.

## Usuarios de prueba

- Admin: `admin` / `admin123`
- Tecnico 1: `tecnico1` / `tecnico123`
- Tecnico 2: `tecnico2` / `tecnico123`

## Checklist en telefono

- Entrar como tecnico.
- Crear reporte.
- Cargar fotos.
- Buscar repuestos.
- Finalizar reporte.
- Entrar como admin.
- Revisar reporte, fotos, inventario y auditoria.
