# FreshRoute B2B — Entrega Final DSWB

**Empresa de Desarrollo:** LosBuleanos

Backend en Node.js + Express con arquitectura MVC, persistencia en **MongoDB** usando **Mongoose** y autenticación con **JWT** (roles `admin` y `operador`).
Caso de negocio: logística de distribución refrigerada para restaurantes, comedores y cocinas industriales.

**App en línea:** https://losbuleanos.onrender.com — desplegada en Render (plan gratuito) con la base en MongoDB Atlas. Se entra con los [usuarios de prueba](#usuarios-de-prueba-los-crea-npm-run-seed). El servicio se duerme tras unos minutos sin uso, así que la primera visita puede tardar cerca de un minuto.

> Versiones anteriores: primer parcial (persistencia en archivos JSON) en el tag `v1.0-primer-parcial`; segundo parcial (migración a MongoDB, sin autenticación) en el tag `v2.0-segundo-parcial`.

## Requisitos

- Node.js 20+ (los tests usan `node --test` con patrones glob)
- npm
- MongoDB: local (MongoDB Community Server, puerto 27017) o un cluster gratuito de MongoDB Atlas

## Instalación y ejecución

```bash
git clone https://github.com/Nicoalazar/PrimerParcialDSWB.git
cd PrimerParcialDSWB
npm install
cp .env.example .env   # completar MONGO_URI y JWT_SECRET
npm run seed           # carga en Mongo los datos de ejemplo de /data (incluye los usuarios de prueba)
npm run dev            # desarrollo con nodemon
npm start              # producción
npm test               # tests automáticos (no necesitan Mongo instalado)
```

Servidor en `http://localhost:3000`. El servidor solo empieza a escuchar una vez que se conectó a MongoDB; si no puede conectarse, muestra el error y termina.

### Usuarios de prueba (los crea `npm run seed`)

| Email | Contraseña | Rol | Puede |
|---|---|---|---|
| `admin@freshroute.test` | `admin123` | `admin` | Todo: además de lo del operador, borrar clientes y pedidos, y gestionar usuarios (listar, crear, editar y borrar) |
| `operador@freshroute.test` | `operador123` | `operador` | Ver, crear y editar clientes y pedidos, y avanzar estados |

Son credenciales de prueba para desarrollo y la demo (están en `data/usuarios.json`); en un entorno real se cambian o se borran.

### Variables de entorno (`.env`)

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `NODE_ENV` | `development` | En `production` la cookie de sesión se marca `secure` (solo HTTPS) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/freshroute` | Cadena de conexión a MongoDB (local o Atlas) |
| `JWT_SECRET` | — (**obligatoria**) | Secreto con el que se firman los tokens. Sin ella la app no arranca |
| `JWT_EXPIRES_IN` | `8h` | Duración del token (formato de `jsonwebtoken`: `30m`, `8h`, `1d`…) |

Las variables se leen en un solo lugar, [`config/index.js`](config/index.js); el resto del código importa `config` en vez de usar `process.env`.

`.env` está en `.gitignore`: nunca se sube al repo (tiene el usuario y la contraseña de Atlas y el secreto del JWT). En el repo solo va `.env.example`.

## Estructura del proyecto

```
server.js           → punto de entrada: conecta a Mongo y recién ahí escucha (npm start / npm run dev)
app.js              → arma la app de Express (middlewares y rutas) y la exporta; la usan server.js y los tests
seed.js             → script de carga inicial (npm run seed): vacía las colecciones y carga /data
config/
  index.js          → variables de entorno centralizadas (PORT, MONGO_URI, JWT_SECRET, …)
  db.js             → conexión a MongoDB con mongoose.connect (async/await)
routes/
  api/              → rutas JSON (se prueban con Postman)         → /api/auth, /api/usuarios, /api/clientes, /api/pedidos, /api/choferes
  web/              → rutas que renderizan vistas Pug             → /login, /logout, /clientes, /pedidos, /usuarios
controllers/        → lógica de cada endpoint de la API (async/await)
models/             → schemas y modelos de Mongoose: Usuario, Cliente, Pedido, Chofer
services/           → reglas de negocio: PedidoService (cliente/chofer existentes, transiciones de estado) AuthService (login, firma y verificación del JWT) y UsuarioService (alta, edición y baja de usuarios)
middlewares/        → logger, autenticación/autorización (auth.js), validación de body, manejo de errores y 404
views/              → vistas Pug (layout, index, error, auth/, clientes/, pedidos/, usuarios/)
public/             → archivos estáticos (CSS)
data/               → datos de ejemplo en JSON que usa el seed (ya no es la persistencia)
tests/              → tests automáticos (node:test + supertest + MongoDB en memoria)
docs/               → documentación de entrega, roles, bibliografía, colección Postman, evidencia, smoke test
```

### Flujo de un request

`logger` → `express.json / urlencoded` → `cookieParser` → `static` → `cargarUsuario` → `verificarUsuarioActivo` → `requiereLogin` → `routes` → (`autorizar`) → (`validate`) → `controller` → (`service`) → `model` (Mongoose) → MongoDB

Los controllers, el service y las rutas web son funciones `async` y no llevan `try/catch`: Express 5 pasa solo al `errorHandler` cualquier promesa rechazada (un error lanzado por el service con `statusCode`, un id con formato inválido, una validación del schema, etc.). Cualquier ruta no montada cae en el 404 de `notFound`.

## Autenticación y autorización

- **Login:** `POST /api/auth/login` con `{ email, password }` devuelve un **JWT** firmado con `JWT_SECRET` que incluye `id`, `nombre` y `rol`. Las contraseñas se guardan hasheadas con **bcrypt** (`pre("save")` del modelo `Usuario`) y nunca viajan en las respuestas.
- **API:** el token se manda en el header `Authorization: Bearer <token>`. Todas las rutas de `/api` salvo el login lo exigen.
- **Web:** el formulario de `/login` usa el mismo `AuthService` y guarda el token en una cookie `httpOnly` (el JavaScript del navegador no la puede leer). `POST /logout` la borra. Sin sesión, las vistas redirigen a `/login`.
- **Middlewares** ([`middlewares/auth.js`](middlewares/auth.js)): `cargarUsuario` (global) lee el token del header o de la cookie y deja el usuario en `req.usuario`; `requiereLogin` (API → 401) y `requiereLoginWeb` (web → redirección) cortan si no hay sesión; `autorizar("admin")` responde 403 si el rol no alcanza.
- **Usuario activo** ([`middlewares/usuarioActivo.js`](middlewares/usuarioActivo.js)): después de `cargarUsuario`, `verificarUsuarioActivo` confirma en la base que el dueño del token sigue existiendo. Si el admin lo borró, el token deja de servir en el momento (API → `401`, web → vuelve a `/login`) aunque todavía no haya vencido. Además toma el `nombre` y el `rol` de la base, así un cambio de rol vale enseguida.
- **Permisos:** las bajas (`DELETE` en la API y `POST …/eliminar` en la web) y la gestión de usuarios son solo para `admin`. En las vistas, el operador no ve los botones de eliminar (y si fuerza el request, el backend responde 403).
- No hay registro abierto: es un sistema interno, los usuarios los da de alta un admin (`POST /api/usuarios` o el formulario de `/usuarios`). El admin también puede editarlos y borrarlos, pero no puede borrarse a sí mismo ni quitarse su propio rol de admin, para que el sistema no se quede sin administradores.

## Modelos (Mongoose)

| Modelo | Colección | Campos |
|---|---|---|
| `Usuario` | `usuarios` | `nombre`, `email` (único, en minúsculas), `password` (hash bcrypt, `select: false`, mínimo 6 caracteres), `rol` (`enum`: `admin` / `operador`, default `operador`) |
| `Cliente` | `clientes` | `nombre`, `direccion`, `zona`, `contacto`, `horarioEntrega` (todos `String`, `required`) |
| `Chofer` | `choferes` | `nombre`, `apellido`, `vehiculo`, `zona` (todos `String`, `required`) — solo lectura |
| `Pedido` | `pedidos` | `clienteId` (`ObjectId`, `ref: "Cliente"`), `choferId` (`ObjectId`, `ref: "Chofer"`), `items` (`[{ descripcion: String, cantidad: Number ≥ 1 }]`, al menos uno), `estado` (`enum`, default `pendiente`), `fechaHoraProgramada` (`String`) |

Cada documento tiene el `_id` (ObjectId) que genera MongoDB; nunca se toma del body. Las vistas web usan `populate("clienteId")` / `populate("choferId")` para mostrar los nombres del cliente y el chofer de cada pedido.

## Módulos

- **Clientes**: CRUD completo (`/api/clientes` y vistas en `/clientes`)
- **Pedidos**: CRUD completo + cambio de estado (`/api/pedidos`, `PATCH /api/pedidos/:id/estado` y vistas en `/pedidos`)
- **Usuarios** (solo admin): CRUD completo (`/api/usuarios` y vistas en `/usuarios`)
- **Choferes**: colección cargada por el seed y expuesta en `GET /api/choferes` (solo lectura, no es un módulo)

## API — Endpoints por módulo

Base: `http://localhost:3000`. Todos los bodies son JSON (`Content-Type: application/json`). Los ids son ObjectId de MongoDB (24 caracteres hexadecimales, ej. `6ad029668749ce12be7a7f5e`); en los ejemplos se abrevian como `<id>`.

Salvo `POST /api/auth/login`, **todas las rutas piden** `Authorization: Bearer <token>`: sin token (o con uno vencido/adulterado) responden `401`. Las marcadas **admin** responden `403` a un operador.

### Autenticación — `/api/auth` y `/api/usuarios`

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `POST` | `/api/auth/login` (pública) | `{ "email": "admin@freshroute.test", "password": "admin123" }` | `200` `{ "mensaje": "Sesión iniciada", "token": "<jwt>", "usuario": { "_id": "<id>", "nombre": "Admin FreshRoute", "email": "admin@freshroute.test", "rol": "admin" } }` · `401` `{ "mensaje": "Email o contraseña incorrectos" }` · `400` `{ "mensaje": "Datos de login inválidos", "errores": [ … ] }` |
| `GET` | `/api/auth/perfil` | — | `200` `{ "_id": "<id>", "nombre": …, "email": …, "rol": … }` (el dueño del token) |
| `GET` | `/api/usuarios` (**admin**) | — | `200` `[ { "_id": "<id>", "nombre": …, "email": …, "rol": … }, … ]` |
| `POST` | `/api/usuarios` (**admin**) | `{ "nombre": "Ana López", "email": "ana@freshroute.test", "password": "secreto1", "rol": "operador" }` (`rol` opcional, default `operador`) | `201` `{ "mensaje": "Usuario creado", "usuario": { … } }` · `400` `{ "mensaje": "Datos de usuario inválidos", "errores": [ … ] }` · `400` `{ "mensaje": "Ya existe un usuario con el email …" }` |
| `PUT` | `/api/usuarios/:id` (**admin**) | `{ "nombre": "Ana María López", "rol": "admin", "password": "otraClave1" }` (todos opcionales, al menos uno; el email no se edita; la contraseña se vuelve a hashear) | `200` `{ "mensaje": "Usuario actualizado", "usuario": { … } }` · `400` `{ "mensaje": "Datos de usuario inválidos", "errores": [ … ] }` · `400` `{ "mensaje": "Un administrador no puede quitarse su propio rol de admin" }` · `404` `{ "mensaje": "Usuario no encontrado" }` |
| `DELETE` | `/api/usuarios/:id` (**admin**) | — | `200` `{ "mensaje": "Usuario eliminado" }` · `400` `{ "mensaje": "Un administrador no puede eliminarse a sí mismo" }` · `404` `{ "mensaje": "Usuario no encontrado" }` |

### Módulo Clientes — `/api/clientes`

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/clientes` | — | `200` `[ { "_id": "<id>", "nombre": "Restaurante La Esquina", "direccion": "Av. Corrientes 1234, CABA", "zona": "Centro", "contacto": "Marcela Ruiz - 11 5555 1234", "horarioEntrega": "08:00 a 10:00" }, … ]` |
| `GET` | `/api/clientes/:id` | — | `200` `{ "_id": "<id>", "nombre": "Restaurante La Esquina", … }` · `404` `{ "mensaje": "Cliente no encontrado" }` · `400` `{ "mensaje": "Id inválido: abc" }` |
| `POST` | `/api/clientes` | `{ "nombre": "Bar Nuevo", "direccion": "Calle 1 N° 100, Morón", "zona": "Oeste", "contacto": "Pedro Díaz - 11 0000 0000", "horarioEntrega": "09:00 a 11:00" }` | `201` `{ "mensaje": "Cliente creado", "cliente": { "_id": "<id>", "nombre": "Bar Nuevo", … } }` · `400` `{ "mensaje": "Datos de cliente inválidos", "errores": [ … ] }` |
| `PUT` | `/api/clientes/:id` | `{ "zona": "Centro", "horarioEntrega": "10:00 a 12:00" }` (parcial: solo se pisan los campos enviados) | `200` `{ "mensaje": "Cliente actualizado", "cliente": { … } }` · `400` si no viene ningún campo o un tipo es incorrecto · `404` `{ "mensaje": "Cliente no encontrado" }` |
| `DELETE` | `/api/clientes/:id` (**admin**) | — | `200` `{ "mensaje": "Cliente eliminado" }` · `404` `{ "mensaje": "Cliente no encontrado" }` |

Campos de `Cliente` (todos texto, obligatorios en `POST`): `nombre`, `direccion`, `zona`, `contacto`, `horarioEntrega`.

### Módulo Pedidos — `/api/pedidos`

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/pedidos` | — | `200` `[ { "_id": "<id>", "clienteId": "<id>", "choferId": "<id>", "items": [ { "descripcion": "Cajón de verduras frescas", "cantidad": 10 } ], "estado": "pendiente", "fechaHoraProgramada": "2026-09-16T08:00:00" }, … ]` |
| `GET` | `/api/pedidos/:id` | — | `200` `{ "_id": "<id>", "clienteId": "<id>", … }` · `404` `{ "mensaje": "Pedido no encontrado" }` |
| `POST` | `/api/pedidos` | `{ "clienteId": "<id de cliente>", "choferId": "<id de chofer>", "items": [ { "descripcion": "Cajón de frutas", "cantidad": 8 } ], "fechaHoraProgramada": "2026-09-17T07:00:00" }` | `201` `{ "mensaje": "Pedido creado", "pedido": { "_id": "<id>", …, "estado": "pendiente" } }` (siempre nace en `pendiente`) · `400` `{ "mensaje": "Datos de pedido inválidos", "errores": [ … ] }` · `400` `{ "mensaje": "El cliente con id <id> no existe" }` / `"El chofer con id <id> no existe"` |
| `PUT` | `/api/pedidos/:id` | `{ "fechaHoraProgramada": "2026-09-16T07:00:00" }` (parcial; el `estado` no se cambia por acá) | `200` `{ "mensaje": "Pedido actualizado", "pedido": { … } }` · `400` validación o cliente/chofer inexistente · `404` `{ "mensaje": "Pedido no encontrado" }` |
| `PATCH` | `/api/pedidos/:id/estado` | `{ "estado": "asignado" }` | `200` `{ "mensaje": "Estado actualizado", "pedido": { …, "estado": "asignado" } }` · `400` `{ "mensaje": "Transición inválida: no se puede pasar de \"pendiente\" a \"entregado\"" }` · `400` `{ "mensaje": "Estado inválido. Valores permitidos: pendiente, asignado, en tránsito, entregado" }` · `404` |
| `DELETE` | `/api/pedidos/:id` (**admin**) | — | `200` `{ "mensaje": "Pedido eliminado" }` · `404` `{ "mensaje": "Pedido no encontrado" }` |

Campos de `Pedido`: `clienteId` (ObjectId de un cliente existente), `choferId` (ObjectId de un chofer existente), `items` (arreglo no vacío de `{ descripcion: texto, cantidad: número ≥ 1 }`), `fechaHoraProgramada` (texto ISO), `estado` (lo maneja el servidor).

**Estados:** el único camino es `pendiente → asignado → en tránsito → entregado`, de a un paso. No se permiten saltos ni retrocesos (`PedidoService.cambiarEstado`).

### Choferes — `/api/choferes` (solo lectura)

| Método | Ruta | Body de ejemplo | Respuesta |
|---|---|---|---|
| `GET` | `/api/choferes` | — | `200` `[ { "_id": "<id>", "nombre": "Carlos", "apellido": "Gómez", "vehiculo": "Camioneta refrigerada - AB 123 CD", "zona": "Norte" }, … ]` |

`POST`, `PUT` y `DELETE` sobre `/api/choferes` (con token) responden `404 { "mensaje": "Ruta no encontrada" }`: no es un módulo, es una colección de referencia (cargada por el seed) para asignar choferes a pedidos.

### Respuestas de error

| Status | Origen | Forma |
|---|---|---|
| `400` | `middlewares/validate.js` (body incompleto, tipos incorrectos o `clienteId`/`choferId` sin formato de ObjectId) | `{ "mensaje": "Datos de … inválidos", "errores": [ "nombre es obligatorio y debe ser texto", … ] }` |
| `400` | `services/PedidoService.js` (cliente/chofer inexistente, transición de estado inválida) | `{ "mensaje": "…" }` |
| `400` | `middlewares/errorHandler.js` — `CastError` de Mongoose (id con formato inválido en la URL) | `{ "mensaje": "Id inválido: abc" }` |
| `400` | `middlewares/errorHandler.js` — `ValidationError` de Mongoose (el schema rechaza el documento, ej. `cantidad: 0`) | `{ "mensaje": "Datos inválidos: …" }` |
| `401` | `middlewares/auth.js` → `requiereLogin` (sin token, token vencido o adulterado) · `services/AuthService.js` (login incorrecto) | `{ "mensaje": "Se requiere iniciar sesión" }` / `{ "mensaje": "Token inválido o vencido" }` / `{ "mensaje": "Email o contraseña incorrectos" }` |
| `403` | `middlewares/auth.js` → `autorizar` (el rol no alcanza) | `{ "mensaje": "No tenés permisos para realizar esta acción" }` |
| `404` | controller / service (id con formato válido que no existe) | `{ "mensaje": "Cliente no encontrado" }` / `{ "mensaje": "Pedido no encontrado" }` |
| `404` | `middlewares/errorHandler.js` → `notFound` (ruta no montada) | `{ "mensaje": "Ruta no encontrada" }` |
| `500` | `middlewares/errorHandler.js` (error no previsto, ej. se cae la conexión a Mongo) | `{ "mensaje": "Error interno del servidor" }` (el detalle queda solo en el log del servidor) |

En las vistas web, los errores que pasan por el `errorHandler` (401/403/404/500, transiciones inválidas, etc.) se muestran en una página (`views/error.pug`) en lugar de JSON.
Los `400` de validación de los formularios web (`validate.js`) también muestran `error.pug`, con la lista de errores; la API sigue respondiendo el JSON `{ mensaje, errores }`.

## Vistas web (Pug)

Los formularios HTML solo pueden enviar `GET` y `POST`, por eso cada módulo tiene un router web aparte que usa los mismos validadores, modelos y `PedidoService` que la API.

| Módulo | Ruta | Descripción |
|---|---|---|
| Inicio | `GET /` | Home con links a los módulos (pública) |
| Sesión | `GET /login` · `POST /login` | Formulario de login; guarda el token en una cookie `httpOnly` y redirige a `/pedidos` |
| | `POST /logout` | Cierra la sesión (borra la cookie) |
| Clientes | `GET /clientes` | Listado |
| | `GET /clientes/nuevo` · `POST /clientes` | Formulario y alta |
| | `GET /clientes/:id/editar` · `POST /clientes/:id/editar` | Formulario y edición |
| | `POST /clientes/:id/eliminar` | Baja (solo admin) |
| Pedidos | `GET /pedidos` | Listado con nombre de cliente y chofer (`populate`) |
| | `GET /pedidos/:id` | Detalle con botón "Avanzar estado" |
| | `GET /pedidos/nuevo` · `POST /pedidos` | Formulario (select de cliente y chofer) y alta |
| | `GET /pedidos/:id/editar` · `POST /pedidos/:id/editar` | Formulario precargado y edición |
| | `POST /pedidos/:id/estado` | Avanza al siguiente estado |
| | `POST /pedidos/:id/eliminar` | Baja (solo admin) |
| Usuarios (solo admin) | `GET /usuarios` | Listado (link en el menú solo para el admin; un operador recibe `403`) |
| | `GET /usuarios/nuevo` · `POST /usuarios` | Formulario y alta |
| | `GET /usuarios/:id/editar` · `POST /usuarios/:id/editar` | Formulario y edición (contraseña vacía = no se cambia) |
| | `POST /usuarios/:id/eliminar` | Baja (el admin no ve el botón para borrarse a sí mismo) |

Todas salvo el inicio y el login piden sesión. Después de cada `POST` se redirige al listado (o al detalle, en el caso del estado).

## Persistencia — MongoDB

| Colección | Documentos del seed | Origen del seed | CRUD |
|---|---|---|---|
| `usuarios` | 2 | `data/usuarios.json` | Sí, solo admin (Usuarios) |
| `clientes` | 5 | `data/clientes.json` | Sí (Módulo Clientes) |
| `pedidos` | 3 | `data/pedidos.json` | Sí (Módulo Pedidos) |
| `choferes` | 4 | `data/choferes.json` | No (solo lectura) |

`npm run seed` borra las cuatro colecciones y las vuelve a cargar desde los JSON de `/data` (los usuarios con `create`, para que se hashee la contraseña). Como en los JSON los pedidos referencian ids numéricos (`clienteId: 1`), el seed guarda la equivalencia "id numérico → `_id` de Mongo" de los clientes y choferes que inserta y la usa para armar las referencias de los pedidos. Sirve también para dejar la base como al principio después de probar.

## Pruebas

### Tests automáticos

```bash
npm test
```

Usan el runner que trae Node (`node:test` + `node:assert`) y **supertest** para mandar requests a la app sin abrir un puerto. Cada archivo levanta su propia MongoDB en memoria con **mongodb-memory-server**, así que no hace falta tener Mongo instalado y nunca se toca la base de desarrollo ni la de Atlas (la primera corrida descarga el binario de MongoDB).

| Archivo | Qué cubre |
|---|---|
| `tests/auth.test.js` | Login correcto/incorrecto, token ausente, vencido o adulterado, perfil, permisos por rol, alta de usuarios con hash de contraseña |
| `tests/pedidos.test.js` | Reglas de `PedidoService`: nace en `pendiente`, cliente/chofer inexistentes, ítems inválidos, transiciones (sin saltos ni retrocesos), `PUT` no toca el estado, baja solo admin |
| `tests/usuarios.test.js` | Edición y baja de usuarios por API y web, contraseña rehasheada, el admin no se borra ni se quita el rol, token de un usuario borrado (`401` / redirección) o con el rol cambiado (`403`), link del menú solo para admin |
| `tests/web.test.js` | Redirección al login, cookie `httpOnly`, botones según rol, 403 en la web, logout, 404 HTML vs JSON, ids inválidos |

### Colección Postman

1. `npm run seed` y levantar el servidor.
2. Abrir Postman → *File > Import* → elegir `docs/api-collection.postman.json`.
3. La colección trae la variable `baseUrl = http://localhost:3000` (para probar el deploy, cambiarla por `https://losbuleanos.onrender.com`) y usa autenticación *Bearer* con la variable `token`, que completa sola el request **POST login admin** de la carpeta *Autenticación*. Los ids **no se copian a mano**: el script de test de cada `GET` de listado y de cada `POST` guarda el `_id` en una variable de la colección (`clienteId`, `choferId`, `pedidoId`, `clienteNuevoId`, `pedidoNuevoId`).
4. Correrla en orden con *Run collection*. Carpetas: **Autenticación** (12 requests), **Clientes** (9), **Choferes** (1), **Pedidos** (11), **Errores** (1). Cada request verifica su status esperado.

### Smoke test automático

Con el servidor levantado en otra terminal:

```bash
node docs/smoke-test.js
```

Primero prueba la autenticación (401 sin token, login incorrecto, 403 del operador) y después, logueado como admin, recorre los dos módulos (altas, ediciones, bajas, validaciones, ids inexistentes e inválidos, transiciones de estado, 404) y las vistas web, y termina con `N OK · 0 FALLA(S)`. Toma los ids de la base con los `GET` de listado, crea y borra sus propios registros.

Contra el deploy (no hace falta levantar nada local):

```bash
node docs/smoke-test.js https://losbuleanos.onrender.com
```

### Consultas a la base (playground de MongoDB)

[`docs/consultas.mongodb.js`](docs/consultas.mongodb.js) es un playground de la extensión **MongoDB for VS Code** con consultas de solo lectura sobre la base `freshroute`: conteo de documentos, filtros, pedidos por estado y la relación entre pedidos, clientes y choferes con `$lookup` (lo mismo que hace `populate` en la app).

1. Instalar la extensión *MongoDB for VS Code* y crear una conexión con la misma `MONGO_URI` del `.env`.
2. Abrir `docs/consultas.mongodb.js`, seleccionar un bloque y ejecutarlo con *Run Selected Lines From Playground*.

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
- Release plan: primer parcial [`docs/RELEASE_PLAN.md`](docs/RELEASE_PLAN.md) · entrega final [`docs/RELEASE_PLAN_Parte3.md`](docs/RELEASE_PLAN_Parte3.md)
- Bibliografía: [`docs/bibliografia.md`](docs/bibliografia.md)
- Documentación de entrega (fuente del PDF): [`docs/DOCUMENTACION_Parte2.md`](docs/DOCUMENTACION_Parte2.md) · primer parcial: [`docs/DOCUMENTACION_Parte1.md`](docs/DOCUMENTACION_Parte1.md)
