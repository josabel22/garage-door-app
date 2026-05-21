# Fallo GitHub Actions Azure Static Web Apps

## Que paso

El deploy fallo en GitHub Actions, no en la app.

La captura muestra:

```text
Failed to remove 'http.https://github.com/.extraheader' from the git config
```

Ese error viene del paso `actions/checkout` cuando intenta limpiar credenciales temporales de Git al finalizar el job.

Tambien aparece una advertencia de Node.js porque el workflow generado por Azure esta usando acciones antiguas como `actions/checkout@v3`.

## Correccion aplicada localmente

El workflow local `.github/workflows/azure-static-web-apps.yml` fue actualizado a:

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    persist-credentials: false
```

Esto evita que `checkout` escriba ese `extraheader` en Git y por eso ya no necesita removerlo.

## Importante

En la captura GitHub esta corriendo este archivo:

```text
azure-static-web-apps-calm-dune-0d55f9410.yml
```

Ese parece ser un workflow generado automaticamente por Azure.

Debes hacer una de estas dos cosas:

1. Reemplazar ese archivo en GitHub por el workflow corregido.
2. O desactivar/eliminar el workflow generado y usar solo:

```text
.github/workflows/azure-static-web-apps.yml
```

## Configuracion correcta para esta app

```yaml
app_location: "/client"
api_location: ""
output_location: "dist"
```

La app real esta en `client/index.html`, no en el placeholder React anterior.
