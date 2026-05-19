# Frontend (Panel Administrativo) - ServiCopias.net

Aplicación web del panel interno de ServiCopias.net, construida con Vue 3 + Vuetify.
Este frontend consume la API del backend (`/api/*`) para gestionar órdenes, caja, inventario, POS, configuración y reportes.

## Tecnologías

- Vue 3
- Vue Router 4
- Vuetify 3
- PWA con `@vue/cli-plugin-pwa`
- Fetch API (servicio HTTP centralizado)

## Requisitos

- Node.js 18+ recomendado
- npm 9+ recomendado

## Instalación

Desde la carpeta `Frontend`:

```bash
npm install
```

## Variables de entorno

Este proyecto usa variables de entorno con prefijo `VUE_APP_`.

### Desarrollo (`.env`)

```env
VUE_APP_API_URL=http://localhost:3000/api
```

### Producción (`.env.production`)

```env
VUE_APP_PRINTER_SERVER_URL=http://192.168.1.15:3005
```

Notas:
- `VUE_APP_API_URL` define la URL base para todas las solicitudes del panel.
- El servidor de impresión puede configurarse también desde los componentes/servicios de impresión.

## Scripts disponibles

```bash
npm run serve   # entorno local (Vue CLI dev server)
npm run build   # build de producción
```

## Ejecución local

1. Levanta el backend de ServiCopias (por defecto en puerto `3000`).
2. Configura `VUE_APP_API_URL` en `.env`.
3. Ejecuta:

```bash
npm run serve
```

Vue CLI mostrará la URL local (usualmente `http://localhost:8080`).

## Autenticación

- El login se realiza contra `POST /empleados/login`.
- El token se almacena como `auth_token` (localStorage/sessionStorage).
- El router protege las rutas privadas y redirige a `/auth/login` si no hay sesión.

## Estructura principal

```text
Frontend/
  src/
    components/        # UI y módulos del panel
    composables/       # lógica reutilizable con Composition API
    layouts/           # layouts principal y auth
    router/            # definición y guards de rutas
    services/          # capa de acceso a API y servicios de dominio
    styles/            # sistema de diseño y estilos globales
    utils/             # utilidades (incluye impresión)
    views/             # pantallas principales
```

## Módulos funcionales

El panel incluye, entre otros:

- Dashboard
- Registros
- Inventario
- Recepción de mercadería
- Caja
- Órdenes
- POS
- Configuración

## Impresión térmica

El sistema de impresión está modularizado y documentado en:

- `IMPRESION_README.md`

Incluye comandos ESC/POS, plantillas de ticket y servicio de impresión.

## Build y despliegue

Generar artefactos de producción:

```bash
npm run build
```

La salida se genera en `dist/`.

## Recomendaciones de desarrollo

- Centraliza nuevas llamadas HTTP en `src/services/` para mantener consistencia.
- Evita llamadas directas desde componentes cuando ya exista un servicio.
- Mantén las validaciones de acceso en rutas con `meta.requiresAuth`.
- Si agregas nuevos módulos, registra rutas y permisos de navegación de forma explícita.
