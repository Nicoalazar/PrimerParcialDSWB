# Roles del equipo — LosBuleanos

| Integrante | GitHub | Responsabilidad | Sprints liderados |
|---|---|---|---|
| Nicolás Zalazar | @Nicoalazar | Estructura base del proyecto: `app.js`, configuración de Express y Pug, estructura MVC de carpetas y seed `choferes.json` | Sprint 1 (estructura base) |
| Laura Olivera | @laura108814 | `JsonRepository` genérico, Backend Clientes (model, controller, router) y vistas web de Clientes | Sprint 2 (CRUD Clientes + JsonRepository) · Sprint 6 (vistas Clientes) |
| Christian Albornoz | @albor77 | Backend Pedidos (model, controller, router) + `GET /api/choferes` de solo lectura, y vistas web de Pedidos con `routes/web/pedidosRoutes.js` | Sprint 3 (CRUD Pedidos) · Sprint 7 (vistas Pedidos) |
| Laura Belén Blanco | @LauBelen | `PedidoService` (existencia de cliente/chofer, transiciones de estado) y middlewares: `logger`, `validate` (body de POST/PUT) y `errorHandler` (404 + errores centralizados) | Sprint 4 (PedidoService + merge) · Sprint 5 (middlewares) |
| Fernando Guevara | @Fer-505 | QA: code review cruzado, bug bash end-to-end, `docs/smoke-test.js` y fixes de las rutas web · documentación y evidencia | Sprint 8 (code review + bug bash) · Sprint 9 (documentación + evidencia) |

El sprint asignado indica quién lidera y es responsable del DoD de ese sprint. El resto del equipo participa en los sprints que dependen de su módulo (ver `RELEASE_PLAN.md`).

## Tareas de cierre (Sprint 9 y 10)

| Tarea | Responsable |
|---|---|
| Post en la "oficina del grupo" del campus (texto en `docs/post-oficina-grupo.md`) | <<COMPLETAR: un integrante>> |
| Generar el PDF desde `docs/DOCUMENTACION_Parte1.md` y subir la carpeta a Drive | <<COMPLETAR>> |
| Video de presentación (5 partes, una por integrante) | Todos |
| Subida individual del PDF en el campus | Cada integrante con su usuario |

---

# Segundo parcial — Migración a MongoDB

> Propuesta de reparto: cada integrante migra la parte que ya era suya en el primer parcial, así cada uno explica en el video el código que conoce. **Confirmar o corregir antes de exportar el PDF.**

| Integrante | Responsabilidad en la migración | Archivos |
|---|---|---|
| Nicolás Zalazar | Conexión a MongoDB y arranque: `config/db.js`, `.env` / `.env.example` con `dotenv`, `app.js` que conecta antes de escuchar, modelo `Chofer` y script `seed.js` | `config/db.js`, `app.js`, `.env.example`, `models/Chofer.js`, `seed.js`, `package.json` |
| Laura Olivera | Módulo Clientes en Mongoose: schema/modelo `Cliente`, controller con `async/await` (`find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`) y rutas web de Clientes | `models/Cliente.js`, `controllers/clientesController.js`, `routes/web/clientesRoutes.js` |
| Christian Albornoz | Módulo Pedidos en Mongoose: schema `Pedido` con referencias (`ref`) a Cliente y Chofer, subdocumento de ítems, controller `async`, rutas web con `populate` y formulario de edición precargado | `models/Pedido.js`, `controllers/pedidosController.js`, `routes/web/pedidosRoutes.js`, `views/pedidos/` |
| Laura Belén Blanco | `PedidoService` asincrónico (existencia de cliente/chofer con `exists`, transiciones con `save`) y middlewares: validación de ObjectId en `validate.js` y traducción de `CastError` / `ValidationError` de Mongoose en `errorHandler.js` | `services/PedidoService.js`, `middlewares/validate.js`, `middlewares/errorHandler.js` |
| Fernando Guevara | QA y documentación: smoke test y colección Postman adaptados a ObjectId (variables automáticas), evidencia, README y documento de entrega Parte 2 | `docs/smoke-test.js`, `docs/api-collection.postman.json`, `docs/evidencia/`, `README.md`, `docs/DOCUMENTACION_Parte2.md` |

## Tareas de cierre (segundo parcial)

| Tarea | Responsable |
|---|---|
| Capturas de Postman contra MongoDB en `docs/evidencia/parte2/` | <<COMPLETAR>> |
| Video explicando el código con Mongo (una parte por integrante) | Todos |
| Generar el PDF desde `docs/DOCUMENTACION_Parte2.md` y subirlo a la carpeta de Drive | <<COMPLETAR>> |
| Subida individual del link al Drive en el campus | Cada integrante con su usuario |
