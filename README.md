# FreshRoute B2B — Primer Parcial DSWB

**Empresa de Desarrollo:** LosBuleanos

Backend en Node.js + Express con arquitectura MVC y persistencia en archivos JSON.
Caso de negocio: logística de distribución refrigerada para restaurantes, comedores y cocinas industriales.

## Requisitos

- Node.js 18+
- npm

## Instalación y ejecución

```bash
npm install
npm run dev     # desarrollo con nodemon
npm start       # producción
```

Servidor en `http://localhost:3000`.

## Estructura del proyecto

```
app.js              → punto de entrada, configuración de Express y montaje de rutas
routes/
  api/              → rutas JSON (se prueban con Postman)         → /api/clientes, /api/pedidos
  web/              → rutas que renderizan vistas Pug             → /clientes, /pedidos
controllers/        → lógica de cada endpoint (compartida por routes/api y routes/web)
models/             → clases del dominio (POO)
repositories/       → acceso genérico a los archivos JSON (JsonRepository)
services/           → reglas de negocio (asignación de chofer, transiciones de estado)
middlewares/        → logger, validación de body, manejo de errores y 404
views/              → vistas Pug
public/             → archivos estáticos (CSS)
data/               → persistencia JSON (clientes, pedidos, choferes seed)
docs/               → release plan, bibliografía, roles, evidencia de pruebas
```

## Convenciones del equipo

### API vs. vistas web

Los formularios HTML solo pueden enviar `GET` y `POST`, por eso cada módulo tiene dos routers que usan el mismo controller:

| Capa | Montaje | Operaciones |
|---|---|---|
| `routes/api` | `/api/<modulo>` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (JSON) |
| `routes/web` | `/<modulo>` | `GET /`, `GET /nuevo`, `POST /`, `GET /:id/editar`, `POST /:id/editar`, `POST /:id/eliminar` (Pug) |

La API es la que se evalúa con Postman (colección en `docs/api-collection.postman.json`). Las vistas son una capa adicional que no debe romperla.

### Datos en `/data`

Los archivos `clientes.json` y `pedidos.json` se commitean **una sola vez** con su seed inicial. Después de eso no se commitean cambios en `/data`: las pruebas los modifican localmente y se descartan antes de cada commit con:

```bash
git checkout data/
```

`choferes.json` es un seed fijo de solo lectura, sin CRUD.

## Módulos

- **Clientes**: CRUD completo (`/api/clientes`, `/clientes`)
- **Pedidos**: CRUD completo + cambio de estado (`/api/pedidos`, `PATCH /api/pedidos/:id/estado`, `/pedidos`)
- **Choferes**: seed fijo expuesto en `GET /api/choferes` (solo lectura, no es un módulo)

La tabla completa de endpoints con bodies de ejemplo se completa en el Sprint 9 (ver `docs/RELEASE_PLAN.md`).

## Equipo y planificación

- Roles: `docs/roles.md`
- Release plan con sprints, DoD y riesgos: `docs/RELEASE_PLAN.md`
- Bibliografía: `docs/bibliografia.md`
