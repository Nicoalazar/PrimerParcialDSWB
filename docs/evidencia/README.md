# Evidencia de pruebas (Postman)

Capturas de request/response de cada endpoint de la API, tomadas desde Postman con la colección `docs/api-collection.postman.json`.

| Carpeta | Entrega | Persistencia |
|---|---|---|
| [`parcial1/`](parcial1/) | Primer parcial | Archivos JSON (ids numéricos) |
| [`parcial2/`](parcial2/) | Segundo parcial | MongoDB con Mongoose (ids ObjectId) |

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
