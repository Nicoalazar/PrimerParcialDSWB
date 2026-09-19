# FreshRoute B2B — Primer Parcial DSWB

**Empresa de Desarrollo:** LosBuleanos

Backend en Node.js + Express con arquitectura MVC y persistencia en archivos JSON.
Caso de negocio: logística de distribución refrigerada para restaurantes, comedores y cocinas industriales.

## Requisitos

- Node.js 18+
- npm

## Instalación y ejecución

```bash
git clone https://github.com/Nicoalazar/PrimerParcialDSWB.git
cd PrimerParcialDSWB
npm install
npm run dev     # desarrollo con nodemon
npm start       # producción
```

Servidor en `http://localhost:3000`. El repo incluye el seed de datos en `/data`, así que desde el primer request ya hay clientes, pedidos y choferes cargados.

## Estructura del proyecto

```
app.js              → punto de entrada, configuración de Express y montaje de rutas
routes/
  api/              → rutas JSON (se prueban con Postman)         → /api/clientes, /api/pedidos, /api/choferes
  web/              → rutas que renderizan vistas Pug             → /clientes, /pedidos
controllers/        → lógica de cada endpoint de la API
models/             → clases del dominio (POO): Cliente, Pedido
repositories/       → acceso genérico a los archivos JSON (JsonRepository)
services/           → reglas de negocio (PedidoService: existencia de cliente/chofer, transiciones de estado)
middlewares/        → logger, validación de body, manejo de errores y 404
views/              → vistas Pug (layout, index, clientes/, pedidos/)
public/             → archivos estáticos (CSS)
data/               → persistencia JSON (clientes, pedidos, choferes seed)
docs/               → release plan, bibliografía, roles, colección Postman, evidencia, documentación de entrega
```

### Flujo de un request

`logger` → `express.json / urlencoded / static` → `routes` → (`validate`) → `controller` → (`service`) → `repository` → `data/*.json`

Los errores lanzados desde un service o un controller (con `statusCode`) los captura `middlewares/errorHandler.js`; cualquier ruta no montada cae en el 404 de `notFound`.

## Módulos

- **Clientes**: CRUD completo (`/api/clientes` y vistas en `/clientes`)
- **Pedidos**: CRUD completo + cambio de estado (`/api/pedidos`, `PATCH /api/pedidos/:id/estado` y vistas en `/pedidos`)
- **Choferes**: seed fijo expuesto en `GET /api/choferes` (solo lectura, no es un módulo)

## API — Endpoints por módulo

Base: `http://localhost:3000`. Todos los bodies son JSON (`Content-Type: application/json`). Los ids los genera el servidor (`max(id) + 1`), nunca se toman del body.

### Módulo Clientes — `/api/clientes`

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/clientes` | — | `200` `[ { "id": 1, "nombre": "Restaurante La Esquina", "direccion": "Av. Corrientes 1234, CABA", "zona": "Centro", "contacto": "Marcela Ruiz - 11 5555 1234", "horarioEntrega": "08:00 a 10:00" }, … ]` |
| `GET` | `/api/clientes/:id` | — | `200` `{ "id": 1, "nombre": "Restaurante La Esquina", … }` · `404` `{ "mensaje": "Cliente no encontrado" }` |
| `POST` | `/api/clientes` | `{ "nombre": "Bar Nuevo", "direccion": "Calle 1 N° 100, Morón", "zona": "Oeste", "contacto": "Pedro Díaz - 11 0000 0000", "horarioEntrega": "09:00 a 11:00" }` | `201` `{ "mensaje": "Cliente creado", "cliente": { "id": 6, "nombre": "Bar Nuevo", … } }` · `400` `{ "mensaje": "Datos de cliente inválidos", "errores": [ … ] }` |
| `PUT` | `/api/clientes/:id` | `{ "zona": "Centro", "horarioEntrega": "10:00 a 12:00" }` (parcial: solo se pisan los campos enviados) | `200` `{ "mensaje": "Cliente actualizado", "cliente": { … } }` · `400` si no viene ningún campo o un tipo es incorrecto · `404` `{ "mensaje": "Cliente no encontrado" }` |
| `DELETE` | `/api/clientes/:id` | — | `200` `{ "mensaje": "Cliente eliminado" }` · `404` `{ "mensaje": "Cliente no encontrado" }` |

Campos de `Cliente` (todos texto, obligatorios en `POST`): `nombre`, `direccion`, `zona`, `contacto`, `horarioEntrega`.

### Módulo Pedidos — `/api/pedidos`

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/pedidos` | — | `200` `[ { "id": 1, "clienteId": 1, "choferId": 1, "items": [ { "descripcion": "Cajón de verduras frescas", "cantidad": 10 } ], "estado": "pendiente", "fechaHoraProgramada": "2026-09-16T08:00:00" }, … ]` |
| `GET` | `/api/pedidos/:id` | — | `200` `{ "id": 1, "clienteId": 1, … }` · `404` `{ "mensaje": "Pedido no encontrado" }` |
| `POST` | `/api/pedidos` | `{ "clienteId": 4, "choferId": 4, "items": [ { "descripcion": "Cajón de frutas", "cantidad": 8 } ], "fechaHoraProgramada": "2026-09-17T07:00:00" }` | `201` `{ "mensaje": "Pedido creado", "pedido": { "id": 4, …, "estado": "pendiente" } }` (siempre nace en `pendiente`) · `400` `{ "mensaje": "Datos de pedido inválidos", "errores": [ … ] }` · `400` `{ "mensaje": "El cliente con id 99 no existe" }` / `"El chofer con id 99 no existe"` |
| `PUT` | `/api/pedidos/:id` | `{ "fechaHoraProgramada": "2026-09-16T07:00:00" }` (parcial; el `estado` no se cambia por acá) | `200` `{ "mensaje": "Pedido actualizado", "pedido": { … } }` · `400` validación o cliente/chofer inexistente · `404` `{ "mensaje": "Pedido no encontrado" }` |
| `PATCH` | `/api/pedidos/:id/estado` | `{ "estado": "asignado" }` | `200` `{ "mensaje": "Estado actualizado", "pedido": { …, "estado": "asignado" } }` · `400` `{ "mensaje": "Transición inválida: no se puede pasar de \"pendiente\" a \"entregado\"" }` · `400` `{ "mensaje": "Estado inválido. Valores permitidos: pendiente, asignado, en tránsito, entregado" }` · `404` |
| `DELETE` | `/api/pedidos/:id` | — | `200` `{ "mensaje": "Pedido eliminado" }` · `404` `{ "mensaje": "Pedido no encontrado" }` |

Campos de `Pedido`: `clienteId` (numérico, debe existir en `clientes.json`), `choferId` (numérico, debe existir en `choferes.json`), `items` (arreglo no vacío de `{ descripcion: texto, cantidad: número }`), `fechaHoraProgramada` (texto ISO), `estado` (lo maneja el servidor).

**Estados:** el único camino es `pendiente → asignado → en tránsito → entregado`, de a un paso. No se permiten saltos ni retrocesos (`PedidoService.cambiarEstado`).

### Choferes — `/api/choferes` (solo lectura)

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/choferes` | — | `200` `[ { "id": 1, "nombre": "Carlos", "apellido": "Gómez", "vehiculo": "Camioneta refrigerada - AB 123 CD", "zona": "Norte" }, … ]` |

`POST`, `PUT` y `DELETE` sobre `/api/choferes` responden `404 { "mensaje": "Ruta no encontrada" }`: no es un módulo, es un seed de referencia para asignar choferes a pedidos.

### Respuestas de error

| Status | Origen | Forma |
|---|---|---|
| `400` | `middlewares/validate.js` (body incompleto o tipos incorrectos en `POST`/`PUT`) | `{ "mensaje": "Datos de … inválidos", "errores": [ "nombre es obligatorio y debe ser texto", … ] }` |
| `400` | `services/PedidoService.js` (cliente/chofer inexistente, transición de estado inválida) | `{ "mensaje": "…" }` |
| `404` | controller (id inexistente) | `{ "mensaje": "Cliente no encontrado" }` / `{ "mensaje": "Pedido no encontrado" }` |
| `404` | `middlewares/errorHandler.js` → `notFound` (ruta no montada) | `{ "mensaje": "Ruta no encontrada" }` |
| `500` | `middlewares/errorHandler.js` (error no previsto) | `{ "mensaje": "…" }` |

## Vistas web (Pug)

Los formularios HTML solo pueden enviar `GET` y `POST`, por eso cada módulo tiene un router web aparte que usa los mismos validadores y `PedidoService` que la API.

| Módulo | Ruta | Descripción |
|---|---|---|
| Inicio | `GET /` | Home con links a los módulos |
| Clientes | `GET /clientes` | Listado |
| | `GET /clientes/nuevo` · `POST /clientes` | Formulario y alta |
| | `GET /clientes/:id/editar` · `POST /clientes/:id/editar` | Formulario y edición |
| | `POST /clientes/:id/eliminar` | Baja |
| Pedidos | `GET /pedidos` | Listado con nombre de cliente y chofer |
| | `GET /pedidos/:id` | Detalle con botón "Avanzar estado" |
| | `GET /pedidos/nuevo` · `POST /pedidos` | Formulario (select de cliente y chofer) y alta |
| | `GET /pedidos/:id/editar` · `POST /pedidos/:id/editar` | Formulario y edición |
| | `POST /pedidos/:id/estado` | Avanza al siguiente estado |
| | `POST /pedidos/:id/eliminar` | Baja |

Después de cada `POST` se redirige al listado (o al detalle, en el caso del estado).

## Persistencia — archivos de `/data`

| Archivo | Registros en el seed | Campos | CRUD |
|---|---|---|---|
| `data/clientes.json` | 5 | `id`, `nombre`, `direccion`, `zona`, `contacto`, `horarioEntrega` | Sí (Módulo Clientes) |
| `data/pedidos.json` | 3 | `id`, `clienteId`, `choferId`, `items[{ descripcion, cantidad }]`, `estado`, `fechaHoraProgramada` | Sí (Módulo Pedidos) |
| `data/choferes.json` | 4 | `id`, `nombre`, `apellido`, `vehiculo`, `zona` | No (solo lectura) |

Los tres archivos se leen y escriben con `fs` a través de `repositories/JsonRepository.js` (`getAll`, `getById`, `create`, `update`, `delete`).

**Regla del equipo:** `clientes.json` y `pedidos.json` se commitearon una sola vez con su seed. Las pruebas los modifican localmente y se descartan antes de cada commit con:

```bash
git checkout data/
```

## Pruebas

### Colección Postman

1. Abrir Postman → *File > Import* → elegir `docs/api-collection.postman.json`.
2. La colección ya trae la variable `baseUrl = http://localhost:3000`.
3. Carpetas: **Clientes** (8 requests), **Pedidos** (11), **Choferes** (1), **Errores** (1). Cada request indica en su descripción el status y la respuesta esperada.

### Smoke test automático

Con el servidor levantado en otra terminal:

```bash
node docs/smoke-test.js
```

Recorre los dos módulos (altas, ediciones, bajas, validaciones, transiciones de estado, 404) y las vistas web, y termina con `N OK · 0 FALLA(S)`. Crea y borra sus propios registros; igual conviene correr `git checkout data/` al terminar.

### Evidencia

Capturas de cada request/response en [`docs/evidencia/`](docs/evidencia/), con nomenclatura `<modulo>_<operacion>.png` (ver el README de esa carpeta).

## Equipo y planificación

| Integrante | Responsabilidad |
|---|---|
| Nicolás Zalazar | Estructura base del proyecto y seed de choferes |
| Laura Olivera | `JsonRepository`, Backend Clientes y vistas web de Clientes |
| Christian Albornoz | Backend Pedidos + `GET /api/choferes` y vistas web de Pedidos |
| Belén Lau | `PedidoService` y middlewares: logger, validación, manejo de errores |
| Fernando Guevara | QA: code review cruzado, bug bash, smoke test y documentación |

- Roles por sprint: [`docs/roles.md`](docs/roles.md)
- Release plan con sprints, DoD y riesgos: [`docs/RELEASE_PLAN.md`](docs/RELEASE_PLAN.md)
- Bibliografía: [`docs/bibliografia.md`](docs/bibliografia.md)
- Documentación de entrega (fuente del PDF): [`docs/DOCUMENTACION_Parte1.md`](docs/DOCUMENTACION_Parte1.md)
