# Evidencia de pruebas (Postman)

Capturas de request/response de cada endpoint de la API, tomadas desde Postman con la colección `docs/api-collection.postman.json`.

| Carpeta | Entrega | Persistencia |
|---|---|---|
| [`parcial1/`](parcial1/) | Primer parcial | Archivos JSON (ids numéricos) |
| [`parcial2/`](parcial2/) | Segundo parcial | MongoDB con Mongoose (ids ObjectId) |
| [`parcial3/`](parcial3/) | Entrega final | MongoDB Atlas + autenticación JWT, local y en el deploy |

## Nomenclatura

`<modulo>_<operacion>.png` — en minúsculas, sin espacios. Si la captura muestra un caso de error, se agrega el status al final: `<modulo>_<operacion>_<status>.png`.

## Capturas

| Archivo | Request | Status | `parcial1/` | `parcial2/` |
|---|---|---|---|---|
| `clientes_get.png` | `GET /api/clientes` | 200 | ✓ | ✓ |
| `clientes_get_id.png` | `GET /api/clientes/:id` | 200 | ✓ | ✓ |
| `clientes_get_404.png` | `GET /api/clientes/:id` (id inexistente) | 404 | ✓ | ✓ |
| `clientes_get_400.png` | `GET /api/clientes/abc` (id con formato inválido) | 400 | — | ✓ |
| `clientes_post.png` | `POST /api/clientes` | 201 | ✓ | ✓ |
| `clientes_post_400.png` | `POST /api/clientes` con body vacío → `{ mensaje, errores }` | 400 | ✓ | ✓ |
| `clientes_put.png` | `PUT /api/clientes/:id` | 200 | ✓ | ✓ |
| `clientes_put_400.png` | `PUT /api/clientes/:id` sin campos | 400 | — | ✓ |
| `clientes_delete.png` | `DELETE /api/clientes/:id` | 200 | ✓ | ✓ |
| `pedidos_get.png` | `GET /api/pedidos` | 200 | ✓ | ✓ |
| `pedidos_get_id.png` | `GET /api/pedidos/:id` | 200 | ✓ | ✓ |
| `pedidos_get_404.png` | `GET /api/pedidos/:id` (id inexistente) | 404 | ✓ | ✓ |
| `pedidos_post.png` | `POST /api/pedidos` | 201 | ✓ | ✓ |
| `pedidos_post_400.png` | `POST /api/pedidos` sin items → `{ mensaje, errores }` | 400 | ✓ | ✓ |
| `pedidos_put.png` | `PUT /api/pedidos/:id` | 200 | ✓ | ✓ |
| `pedidos_patch_estado.png` | `PATCH /api/pedidos/:id/estado` (transición válida) | 200 | ✓ | ✓ |
| `pedidos_patch_estado_400.png` | `PATCH /api/pedidos/:id/estado` (transición inválida) | 400 | ✓ | ✓ |
| `pedidos_patch_estado_sinbody_400.png` | `PATCH /api/pedidos/:id/estado` sin estado en el body | 400 | — | ✓ |
| `pedidos_delete.png` | `DELETE /api/pedidos/:id` | 200 | ✓ | ✓ |
| `choferes_get.png` | `GET /api/choferes` | 200 | ✓ | ✓ |
| `ruta_404.png` | `GET /api/loquesea` → `{ mensaje: "Ruta no encontrada" }` | 404 | ✓ | ✓ |

En `parcial2/` los 404 usan el id `000000000000000000000000` (formato válido de ObjectId que no existe en la base). Antes de capturar: `npm run seed` y correr la colección en orden, así los ids se completan solos en las variables.

## Pruebas automáticas (segundo parcial)

- [`parcial2/newman-run.txt`](parcial2/newman-run.txt) — la colección Postman completa corrida con newman (22 requests, 22 asserts).
- [`parcial2/smoke-test.txt`](parcial2/smoke-test.txt) — `node docs/smoke-test.js` (API + vistas web).

## Entrega final (`parcial3/`)

Pruebas de la v3.0 (autenticación JWT y roles), tanto en local contra MongoDB Atlas como contra el deploy en Render (`https://losbuleanos.onrender.com`). Las capturas de una misma corrida se numeran en orden (`_1`, `_2`, …).

| Archivo | Qué muestra | Resultado |
|---|---|---|
| `tests_locales_1.png`, `tests_locales_2.png` | `npm test` (node:test + supertest con MongoDB en memoria) | 39/39 OK |
| `smoke_local_1.png`, `smoke_local_2.png` | `node docs/smoke-test.js http://localhost:3000` contra la base de Atlas `freshroute_fernando` | 55 OK · 0 FALLA(S) |
| `smoke_deploy_1.png`, `smoke_deploy_2.png` | `node docs/smoke-test.js https://losbuleanos.onrender.com` | 55 OK · 0 FALLA(S) |
| `postman_deploy_1.png` … `postman_deploy_4.png` | Colección Postman completa con *Run collection* contra el deploy (detalle de cada request) | 31/31 asserts OK |
| `postman_deploy_resumen.png` | Resumen de esa corrida | 31 tests, 0 errores |
| `clientes_get_401.png` | `GET /api/clientes` sin token → `{ mensaje: "Se requiere iniciar sesión" }` | 401 |
| `clientes_delete_403.png` | `DELETE /api/clientes/:id` con el token del operador → `{ mensaje: "No tenés permisos para realizar esta acción" }` | 403 |

Los tests se capturaron antes del PR #46, que sumó un test (los 400 de los formularios web): hoy `npm test` da 40/40.
