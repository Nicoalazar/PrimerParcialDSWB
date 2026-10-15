# FreshRoute B2B — Segundo Parcial DSWB

**Empresa de Desarrollo:** LosBuleanos

Backend en Node.js + Express con arquitectura MVC y persistencia en **MongoDB** usando **Mongoose**.
Caso de negocio: logística de distribución refrigerada para restaurantes, comedores y cocinas industriales.

> La versión del primer parcial (persistencia en archivos JSON) quedó en el tag/rama `v1.0-primer-parcial`.

## Requisitos

- Node.js 18+
- npm
- MongoDB: local (MongoDB Community Server, puerto 27017) o un cluster gratuito de MongoDB Atlas

## Instalación y ejecución

```bash
git clone https://github.com/Nicoalazar/PrimerParcialDSWB.git
cd PrimerParcialDSWB
npm install
cp .env.example .env   # y completar MONGO_URI si no se usa Mongo local
npm run seed           # carga en Mongo los datos de ejemplo de /data
npm run dev            # desarrollo con nodemon
npm start              # producción
```

Servidor en `http://localhost:3000`. El servidor solo empieza a escuchar una vez que se conectó a MongoDB; si no puede conectarse, muestra el error y termina.

### Variables de entorno (`.env`)

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/freshroute` | Cadena de conexión a MongoDB (local o Atlas) |

`.env` está en `.gitignore`: nunca se sube al repo (puede tener el usuario y la contraseña de Atlas). En el repo solo va `.env.example`.

## Estructura del proyecto

```
app.js              → punto de entrada: configura Express, monta rutas y conecta a Mongo antes de escuchar
seed.js             → script de carga inicial (npm run seed): vacía las colecciones y carga /data
config/
  db.js             → conexión a MongoDB con mongoose.connect (async/await)
routes/
  api/              → rutas JSON (se prueban con Postman)         → /api/clientes, /api/pedidos, /api/choferes
  web/              → rutas que renderizan vistas Pug             → /clientes, /pedidos
controllers/        → lógica de cada endpoint de la API (async/await)
models/             → schemas y modelos de Mongoose: Cliente, Pedido, Chofer
services/           → reglas de negocio (PedidoService: existencia de cliente/chofer, transiciones de estado)
middlewares/        → logger, validación de body, manejo de errores y 404
views/              → vistas Pug (layout, index, clientes/, pedidos/)
public/             → archivos estáticos (CSS)
data/               → datos de ejemplo en JSON que usa el seed (ya no es la persistencia)
docs/               → documentación de entrega, roles, bibliografía, colección Postman, evidencia, smoke test
```

### Flujo de un request

`logger` → `express.json / urlencoded / static` → `routes` → (`validate`) → `controller` → (`service`) → `model` (Mongoose) → MongoDB

Los controllers, el service y las rutas web son funciones `async` y no llevan `try/catch`: Express 5 pasa solo al `errorHandler` cualquier promesa rechazada (un error lanzado por el service con `statusCode`, un id con formato inválido, una validación del schema, etc.). Cualquier ruta no montada cae en el 404 de `notFound`.

## Modelos (Mongoose)

| Modelo | Colección | Campos |
|---|---|---|
| `Cliente` | `clientes` | `nombre`, `direccion`, `zona`, `contacto`, `horarioEntrega` (todos `String`, `required`) |
| `Chofer` | `choferes` | `nombre`, `apellido`, `vehiculo`, `zona` (todos `String`, `required`) — solo lectura |
| `Pedido` | `pedidos` | `clienteId` (`ObjectId`, `ref: "Cliente"`), `choferId` (`ObjectId`, `ref: "Chofer"`), `items` (`[{ descripcion: String, cantidad: Number ≥ 1 }]`, al menos uno), `estado` (`enum`, default `pendiente`), `fechaHoraProgramada` (`String`) |

Cada documento tiene el `_id` (ObjectId) que genera MongoDB; nunca se toma del body. Las vistas web usan `populate("clienteId")` / `populate("choferId")` para mostrar los nombres del cliente y el chofer de cada pedido.

## Módulos

- **Clientes**: CRUD completo (`/api/clientes` y vistas en `/clientes`)
- **Pedidos**: CRUD completo + cambio de estado (`/api/pedidos`, `PATCH /api/pedidos/:id/estado` y vistas en `/pedidos`)
- **Choferes**: colección cargada por el seed y expuesta en `GET /api/choferes` (solo lectura, no es un módulo)

## API — Endpoints por módulo

Base: `http://localhost:3000`. Todos los bodies son JSON (`Content-Type: application/json`). Los ids son ObjectId de MongoDB (24 caracteres hexadecimales, ej. `6ad029668749ce12be7a7f5e`); en los ejemplos se abrevian como `<id>`.

### Módulo Clientes — `/api/clientes`

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/clientes` | — | `200` `[ { "_id": "<id>", "nombre": "Restaurante La Esquina", "direccion": "Av. Corrientes 1234, CABA", "zona": "Centro", "contacto": "Marcela Ruiz - 11 5555 1234", "horarioEntrega": "08:00 a 10:00" }, … ]` |
| `GET` | `/api/clientes/:id` | — | `200` `{ "_id": "<id>", "nombre": "Restaurante La Esquina", … }` · `404` `{ "mensaje": "Cliente no encontrado" }` · `400` `{ "mensaje": "Id inválido: abc" }` |
| `POST` | `/api/clientes` | `{ "nombre": "Bar Nuevo", "direccion": "Calle 1 N° 100, Morón", "zona": "Oeste", "contacto": "Pedro Díaz - 11 0000 0000", "horarioEntrega": "09:00 a 11:00" }` | `201` `{ "mensaje": "Cliente creado", "cliente": { "_id": "<id>", "nombre": "Bar Nuevo", … } }` · `400` `{ "mensaje": "Datos de cliente inválidos", "errores": [ … ] }` |
| `PUT` | `/api/clientes/:id` | `{ "zona": "Centro", "horarioEntrega": "10:00 a 12:00" }` (parcial: solo se pisan los campos enviados) | `200` `{ "mensaje": "Cliente actualizado", "cliente": { … } }` · `400` si no viene ningún campo o un tipo es incorrecto · `404` `{ "mensaje": "Cliente no encontrado" }` |
| `DELETE` | `/api/clientes/:id` | — | `200` `{ "mensaje": "Cliente eliminado" }` · `404` `{ "mensaje": "Cliente no encontrado" }` |

Campos de `Cliente` (todos texto, obligatorios en `POST`): `nombre`, `direccion`, `zona`, `contacto`, `horarioEntrega`.

### Módulo Pedidos — `/api/pedidos`

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/pedidos` | — | `200` `[ { "_id": "<id>", "clienteId": "<id>", "choferId": "<id>", "items": [ { "descripcion": "Cajón de verduras frescas", "cantidad": 10 } ], "estado": "pendiente", "fechaHoraProgramada": "2026-09-16T08:00:00" }, … ]` |
| `GET` | `/api/pedidos/:id` | — | `200` `{ "_id": "<id>", "clienteId": "<id>", … }` · `404` `{ "mensaje": "Pedido no encontrado" }` |
| `POST` | `/api/pedidos` | `{ "clienteId": "<id de cliente>", "choferId": "<id de chofer>", "items": [ { "descripcion": "Cajón de frutas", "cantidad": 8 } ], "fechaHoraProgramada": "2026-09-17T07:00:00" }` | `201` `{ "mensaje": "Pedido creado", "pedido": { "_id": "<id>", …, "estado": "pendiente" } }` (siempre nace en `pendiente`) · `400` `{ "mensaje": "Datos de pedido inválidos", "errores": [ … ] }` · `400` `{ "mensaje": "El cliente con id <id> no existe" }` / `"El chofer con id <id> no existe"` |
| `PUT` | `/api/pedidos/:id` | `{ "fechaHoraProgramada": "2026-09-16T07:00:00" }` (parcial; el `estado` no se cambia por acá) | `200` `{ "mensaje": "Pedido actualizado", "pedido": { … } }` · `400` validación o cliente/chofer inexistente · `404` `{ "mensaje": "Pedido no encontrado" }` |
| `PATCH` | `/api/pedidos/:id/estado` | `{ "estado": "asignado" }` | `200` `{ "mensaje": "Estado actualizado", "pedido": { …, "estado": "asignado" } }` · `400` `{ "mensaje": "Transición inválida: no se puede pasar de \"pendiente\" a \"entregado\"" }` · `400` `{ "mensaje": "Estado inválido. Valores permitidos: pendiente, asignado, en tránsito, entregado" }` · `404` |
| `DELETE` | `/api/pedidos/:id` | — | `200` `{ "mensaje": "Pedido eliminado" }` · `404` `{ "mensaje": "Pedido no encontrado" }` |

Campos de `Pedido`: `clienteId` (ObjectId de un cliente existente), `choferId` (ObjectId de un chofer existente), `items` (arreglo no vacío de `{ descripcion: texto, cantidad: número ≥ 1 }`), `fechaHoraProgramada` (texto ISO), `estado` (lo maneja el servidor).

**Estados:** el único camino es `pendiente → asignado → en tránsito → entregado`, de a un paso. No se permiten saltos ni retrocesos (`PedidoService.cambiarEstado`).

### Choferes — `/api/choferes` (solo lectura)

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/choferes` | — | `200` `[ { "_id": "<id>", "nombre": "Carlos", "apellido": "Gómez", "vehiculo": "Camioneta refrigerada - AB 123 CD", "zona": "Norte" }, … ]` |

`POST`, `PUT` y `DELETE` sobre `/api/choferes` responden `404 { "mensaje": "Ruta no encontrada" }`: no es un módulo, es una colección de referencia (cargada por el seed) para asignar choferes a pedidos.

### Respuestas de error

| Status | Origen | Forma |
|---|---|---|
| `400` | `middlewares/validate.js` (body incompleto, tipos incorrectos o `clienteId`/`choferId` sin formato de ObjectId) | `{ "mensaje": "Datos de … inválidos", "errores": [ "nombre es obligatorio y debe ser texto", … ] }` |
| `400` | `services/PedidoService.js` (cliente/chofer inexistente, transición de estado inválida) | `{ "mensaje": "…" }` |
| `400` | `middlewares/errorHandler.js` — `CastError` de Mongoose (id con formato inválido en la URL) | `{ "mensaje": "Id inválido: abc" }` |
| `400` | `middlewares/errorHandler.js` — `ValidationError` de Mongoose (el schema rechaza el documento, ej. `cantidad: 0`) | `{ "mensaje": "Datos inválidos: …" }` |
| `404` | controller / service (id con formato válido que no existe) | `{ "mensaje": "Cliente no encontrado" }` / `{ "mensaje": "Pedido no encontrado" }` |
| `404` | `middlewares/errorHandler.js` → `notFound` (ruta no montada) | `{ "mensaje": "Ruta no encontrada" }` |
| `500` | `middlewares/errorHandler.js` (error no previsto, ej. se cae la conexión a Mongo) | `{ "mensaje": "…" }` |

## Vistas web (Pug)

Los formularios HTML solo pueden enviar `GET` y `POST`, por eso cada módulo tiene un router web aparte que usa los mismos validadores, modelos y `PedidoService` que la API.

| Módulo | Ruta | Descripción |
|---|---|---|
| Inicio | `GET /` | Home con links a los módulos |
| Clientes | `GET /clientes` | Listado |
| | `GET /clientes/nuevo` · `POST /clientes` | Formulario y alta |
| | `GET /clientes/:id/editar` · `POST /clientes/:id/editar` | Formulario y edición |
| | `POST /clientes/:id/eliminar` | Baja |
| Pedidos | `GET /pedidos` | Listado con nombre de cliente y chofer (`populate`) |
| | `GET /pedidos/:id` | Detalle con botón "Avanzar estado" |
| | `GET /pedidos/nuevo` · `POST /pedidos` | Formulario (select de cliente y chofer) y alta |
| | `GET /pedidos/:id/editar` · `POST /pedidos/:id/editar` | Formulario precargado y edición |
| | `POST /pedidos/:id/estado` | Avanza al siguiente estado |
| | `POST /pedidos/:id/eliminar` | Baja |

Después de cada `POST` se redirige al listado (o al detalle, en el caso del estado).

## Persistencia — MongoDB

| Colección | Documentos del seed | Origen del seed | CRUD |
|---|---|---|---|
| `clientes` | 5 | `data/clientes.json` | Sí (Módulo Clientes) |
| `pedidos` | 3 | `data/pedidos.json` | Sí (Módulo Pedidos) |
| `choferes` | 4 | `data/choferes.json` | No (solo lectura) |

`npm run seed` borra las tres colecciones y las vuelve a cargar desde los JSON de `/data`. Como en los JSON los pedidos referencian ids numéricos (`clienteId: 1`), el seed guarda la equivalencia "id numérico → `_id` de Mongo" de los clientes y choferes que inserta y la usa para armar las referencias de los pedidos. Sirve también para dejar la base como al principio después de probar.

## Pruebas

### Colección Postman

1. `npm run seed` y levantar el servidor.
2. Abrir Postman → *File > Import* → elegir `docs/api-collection.postman.json`.
3. La colección trae la variable `baseUrl = http://localhost:3000`. Los ids **no se copian a mano**: el script de test de cada `GET` de listado y de cada `POST` guarda el `_id` en una variable de la colección (`clienteId`, `choferId`, `pedidoId`, `clienteNuevoId`, `pedidoNuevoId`).
4. Correrla en orden con *Run collection*. Carpetas: **Clientes** (9 requests), **Choferes** (1), **Pedidos** (11), **Errores** (1). Cada request verifica su status esperado.

### Smoke test automático

Con el servidor levantado en otra terminal:

```bash
node docs/smoke-test.js
```

Recorre los dos módulos (altas, ediciones, bajas, validaciones, ids inexistentes e inválidos, transiciones de estado, 404) y las vistas web, y termina con `N OK · 0 FALLA(S)`. Toma los ids de la base con los `GET` de listado, crea y borra sus propios registros.

### Evidencia

Capturas de cada request/response en [`docs/evidencia/`](docs/evidencia/), con nomenclatura `<modulo>_<operacion>.png` (ver el README de esa carpeta).

## Equipo y planificación

| Integrante | Responsabilidad |
|---|---|
| Nicolás Zalazar | Estructura base del proyecto y seed de choferes |
| Laura Olivera | Backend Clientes y vistas web de Clientes |
| Christian Albornoz | Backend Pedidos + `GET /api/choferes` y vistas web de Pedidos |
| Laura Belén Blanco | `PedidoService` y middlewares: logger, validación, manejo de errores |
| Fernando Guevara | QA: code review cruzado, bug bash, smoke test y documentación |

- Roles (primer y segundo parcial): [`docs/roles.md`](docs/roles.md)
- Release plan del primer parcial: [`docs/RELEASE_PLAN.md`](docs/RELEASE_PLAN.md)
- Bibliografía: [`docs/bibliografia.md`](docs/bibliografia.md)
- Documentación de entrega (fuente del PDF): [`docs/DOCUMENTACION_Parte2.md`](docs/DOCUMENTACION_Parte2.md) · primer parcial: [`docs/DOCUMENTACION_Parte1.md`](docs/DOCUMENTACION_Parte1.md)
