# Piloto en telefono

## Recomendacion

Para una prueba piloto pequena, usar primero red local. Es rapido, no cuesta dinero y permite probar con tecnicos reales antes de subir a internet.

## Opcion 1: prueba local inmediata

1. Conectar la computadora y los telefonos a la misma red Wi-Fi.
2. En la computadora, abrir PowerShell en la carpeta del proyecto.
3. Ejecutar:

```powershell
npm run pilot
```

4. En el telefono abrir:

```text
http://192.168.1.104:8090
```

Si esa IP cambia, ejecutar `ipconfig` en la computadora y usar la IPv4 del adaptador conectado a internet.

## Usuarios de prueba

- Administrador: `admin` / `admin123`
- Tecnico 1: `tecnico1` / `tecnico123`
- Tecnico 2: `tecnico2` / `tecnico123`
- Cliente: `cliente1` / `cliente123`

## Checklist del piloto

- Crear reporte desde telefono.
- Buscar y agregar repuestos.
- Verificar que se rebaje inventario.
- Cargar fotos antes/despues.
- Finalizar reporte y confirmar bloqueo.
- Revisar notificaciones del administrador.
- Agregar producto al inventario del tecnico.
- Probar garantia vigente y vencida.

## Limitaciones de esta etapa

Esta version guarda datos en el navegador del dispositivo. Para piloto interno sirve, pero para operacion real se debe migrar a Supabase/PostgreSQL para que todos compartan la misma informacion.

## Paso recomendado despues del piloto

Cuando el flujo este aprobado, pasar a:

- Supabase para usuarios, base de datos, fotos y backups.
- Netlify o Vercel Pro para alojar la aplicacion.
- Dominio propio, por ejemplo `app.mgportones.com`.
