# Evidencia de pruebas (Postman)

Capturas de request/response de cada endpoint de la API, tomadas desde Postman con la colección `docs/api-collection.postman.json`.

## Nomenclatura

`<modulo>_<operacion>.png` — en minúsculas, sin espacios. Si la captura muestra un caso de error, se agrega el status al final: `<modulo>_<operacion>_<status>.png`.

## Capturas disponibles

| Archivo | Request | Status esperado |
|---|---|---|
| `clientes_get.png` | `GET /api/clientes` | 200 |
| `clientes_get_id.png` | `GET /api/clientes/:id` | 200 |
| `clientes_get_404.png` | `GET /api/clientes/99` (id inexistente) | 404 |
| `clientes_post.png` | `POST /api/clientes` | 201 |
| `clientes_put.png` | `PUT /api/clientes/:id` | 200 |
| `clientes_delete.png` | `DELETE /api/clientes/:id` | 200 |
| `pedidos_get.png` | `GET /api/pedidos` | 200 |
| `pedidos_get_id.png` | `GET /api/pedidos/:id` | 200 |
| `pedidos_get_404.png` | `GET /api/pedidos/99` (id inexistente) | 404 |
| `pedidos_post.png` | `POST /api/pedidos` | 201 |
| `pedidos_put.png` | `PUT /api/pedidos/:id` | 200 |
| `pedidos_delete.png` | `DELETE /api/pedidos/:id` | 200 |
| `pedidos_patch_estado.png` | `PATCH /api/pedidos/:id/estado` (transición válida) | 200 |
| `pedidos_patch_estado_400.png` | `PATCH /api/pedidos/:id/estado` (transición inválida) | 400 |
| `choferes_get.png` | `GET /api/choferes` | 200 |
| `clientes_post_400.png` | `POST /api/clientes` con body vacío → `{ mensaje, errores }` | 400 |
| `pedidos_post_400.png` | `POST /api/pedidos` sin items → `{ mensaje, errores }` | 400 |
| `ruta_404.png` | `GET /api/loquesea` → `{ mensaje: "Ruta no encontrada" }` | 404 |

Estas capturas son del **primer parcial** (persistencia JSON, ids numéricos).

## Segundo parcial (MongoDB)

Las capturas contra MongoDB van en `parte2/` con la **misma nomenclatura** (en los 404 se usa el id `000000000000000000000000`, y se agrega `clientes_get_400.png` para `GET /api/clientes/abc` → "Id inválido"). Antes de capturar: `npm run seed` y correr la colección en orden.

Salidas de las pruebas automáticas contra MongoDB:

- [`parte2/newman-run.txt`](parte2/newman-run.txt) — la colección Postman completa corrida con newman (22 requests, 22 asserts).
- [`parte2/smoke-test.txt`](parte2/smoke-test.txt) — `node docs/smoke-test.js` (API + vistas web).
