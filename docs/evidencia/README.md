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

Después de probar, recordar `git checkout data/` para dejar el seed como estaba.
