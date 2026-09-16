# Release Plan — Primer Parcial DSWB (Backend Node/Express)
## Caso de negocio: FreshRoute B2B (logística de distribución refrigerada)

**Cierre real de la cátedra:** domingo 20/09/2026 23:59
**Deadline interno del equipo (video grabado):** viernes 18/09/2026
**Inicio:** lunes 14/09/2026 → **5 días de desarrollo (14 al 18) + finde como buffer de entrega, no de código**
**Equipo:** LosBuleanos · 5 integrantes · cadencia: hasta 2 sprints por día (AM/PM)

> ⚠️ **Riesgo de scope:** el documento de FreshRoute vende "telemetría en tiempo real" y "ruteo dinámico" como diferencial. **No se construye nada de eso** — es marketing de la empresa ficticia, no un requisito. El profesor además confirmó: **mínimo 2 módulos funcionales, no todo el proyecto**, y cualquier módulo de más hoy es trabajo de migración a Mongo de más en la segunda entrega. Se construyen exactamente 2.

---

## 0. Novedades del profesor (14/9) que cambian el plan

1. Mínimo **2 módulos funcionales** con persistencia JSON, MVC, correctamente organizados en router/controller. No hace falta el proyecto completo. Extender de más = trabajo doble cuando migren a Mongo.
2. Documento de entrega tiene **estructura fija** (ver sección 7).
3. En el área de entrega del campus, **cada integrante sube solo el PDF** con sus links — no el paquete completo.
4. **Nueva entrega obligatoria y calificada:** un solo integrante postea en la "oficina del grupo": nombre de la empresa de desarrollo, caso asignado, comentario de 1-2 párrafos, link al Drive, lista de integrantes. Ahí el profesor deja la devolución.
5. Link con código de clase como base: `https://drive.google.com/drive/folders/18hYfMEMIDmce3HxpmjJRqGdp9KBO9t9j`. Revisado: el código de clase 4 usa `routes/`, `controllers/`, `models/` con persistencia JSON vía `fs`. Este proyecto sigue esa misma nomenclatura.

---

## 1. Alcance mínimo (MVP) — 2 módulos, no 3

| Criterio de la cátedra | Cómo se cubre |
|---|---|
| Node.js + Express, esquema MVC | `routes` → `controllers` → `models` → `views` (Pug) |
| Persistencia en JSON (no Mongo) | `JsonRepository` que lee/escribe `.json` en `/data` |
| Mínimo 2 módulos funcionales | **Módulo Clientes** + **Módulo Pedidos**, CRUD completo en ambos |
| Rutas dinámicas | `/api/clientes/:id`, `/api/pedidos/:id`, `PATCH /api/pedidos/:id/estado` |
| Middleware | Logger, validación de body, manejo centralizado de errores |
| POO | Clases `Cliente`, `Pedido`, `JsonRepository`, `PedidoService` |
| Pruebas con Thunder Client/Postman | Colección exportada + capturas por módulo en `/docs` |

### Entidades

- **Cliente** (módulo CRUD completo): restaurante/comedor/cocina industrial → nombre, dirección, zona, contacto, horario de entrega
- **Pedido** (módulo CRUD completo, el más representativo del caso): cliente asociado, chofer asignado (desde seed), ítems (descripción + cantidad), estado (`pendiente → asignado → en tránsito → entregado`), fecha/hora programada
- **Chofer** (**seed, NO es módulo**): `choferes.json` con 4 registros fijos, usados solo como referencia/dropdown dentro de Pedidos. Se expone un `GET /api/choferes` de solo lectura. Va en "Próximos Módulos" del documento, no se construye CRUD.

**No entra en el MVP:** telemetría, ruteo dinámico, mapas, autenticación, tiempo real, Mongo, frontend con framework, CRUD de Choferes.

---

## 2. Estructura de repo (MVC explícito)

```
app.js                        → punto de entrada, configuración de Express y montaje de rutas
package.json
README.md
.gitignore
/routes
  /api                        → JSON puro (lo que se prueba con Postman)
    clientesRoutes.js         → montado en /api/clientes
    pedidosRoutes.js          → montado en /api/pedidos (incluye GET /api/choferes de solo lectura)
  /web                        → renderiza Pug (GET lista/form + POST alta/editar/eliminar)
    clientesRoutes.js         → montado en /clientes
    pedidosRoutes.js          → montado en /pedidos
/controllers
  clientesController.js       → usado por routes/api y routes/web
  pedidosController.js
/models
  Cliente.js
  Pedido.js
/repositories
  JsonRepository.js           → genérico: getAll / getById / create / update / delete sobre un .json
/services
  PedidoService.js            → valida cliente, asigna chofer del seed, transiciones de estado
/middlewares
  logger.js
  validate.js
  errorHandler.js             → errores lanzados + 404 de rutas inexistentes
/views
  layout.pug
  index.pug
  /clientes                   → lista.pug, form.pug
  /pedidos                    → lista.pug, detalle.pug, form.pug
/public
  /css/styles.css
/data
  clientes.json               → seed fijo (2-3 registros), congelado después del Sprint 4
  pedidos.json                → seed fijo (2-3 registros), congelado después del Sprint 4
  choferes.json               → seed fijo (4 registros), sin CRUD
/docs
  RELEASE_PLAN.md             → este documento
  bibliografia.md
  roles.md
  api-collection.postman.json → colección Postman (v2.1) con los requests de cada módulo
  /evidencia                  → capturas por módulo
  DOCUMENTACION_Parte1.md     → fuente del PDF de entrega
```

**Regla de datos:** los archivos de `/data` se commitean una sola vez con su seed final (Sprint 2 para clientes, Sprint 3 para pedidos). Después del Sprint 4 **nadie commitea cambios en `/data`** — las pruebas los modifican localmente y se descartan con `git checkout data/`.

**Regla de rutas:** los formularios HTML solo pueden hacer `GET` y `POST`. Por eso `routes/web` expone `POST /clientes/:id/editar` y `POST /clientes/:id/eliminar`, mientras que `routes/api` expone `PUT` y `DELETE` reales. Ambos llaman al mismo controller.

**GitHub Project:** columnas `Backlog / En progreso / Review / Done`, un Milestone por día.

---

## 3. Roles (5 integrantes, 2 módulos → más profundidad, no más módulos)

- **Integrante 1 — Backend Clientes:** model, repository, controller, router (CRUD completo)
- **Integrante 2 — Backend Pedidos:** model, repository, controller, router (CRUD completo) + carga del seed `choferes.json`
- **Integrante 3 — Vistas Pug:** layout base + vistas de Clientes y Pedidos (lista, detalle, form) + `routes/web`
- **Integrante 4 — Middleware + Service:** logger, validación, manejo de errores, `PedidoService` (asignación de chofer, cambio de estado)
- **Integrante 5 — QA + Documentación:** colección Postman/Thunder, evidencia, arma el documento con el template exacto (sección 7), coordina el video, hace el post en la "oficina del grupo"

---

## 4. Sprints (2 por día, lunes a viernes)

### Día 1 — Lunes 14/9

**Sprint 1 (mañana):**
- [x] Revisar el código base de clase en el Drive del profesor antes de definir estructura
- [x] Definir nombre de la "Empresa de Desarrollo": **LosBuleanos** (va en la portada del PDF)
- [ ] Confirmar con el equipo: 2 módulos (Clientes, Pedidos), Choferes como seed — no se negocia
- [ ] Crear repo, ramas por integrante, GitHub Project con columnas y Milestones
- [x] `npm init`, instalar `express`, `pug`, `nodemon`, estructura MVC de la sección 2
- [x] `app.js` mínimo levantando el servidor + vista Pug de prueba
- [x] Cargar `choferes.json` con 4 registros fijos (seed, no se toca más)

**Sprint 2 (tarde):**
- [x] `JsonRepository` genérico en `/repositories`: `getAll()`, `getById(id)`, `create(obj)`, `update(id, obj)`, `delete(id)`. **Genera el `id` internamente** (`max(id) + 1`), nunca lo toma del body.
- [x] Clase `Cliente` en `/models` (nombre, dirección, zona, contacto, horario de entrega)
- [x] `clientesController.js` con las 5 operaciones, respondiendo con la forma `{ mensaje, cliente }` (misma convención que el código de clase)
- [x] `routes/api/clientesRoutes.js`: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` → montado en `/api/clientes`
- [x] Crear carpeta `routes/web/` vacía con un `.gitkeep` (las rutas web se hacen en Sprint 6)
- [x] `data/clientes.json` con 2-3 registros de ejemplo → **este es el seed final, no se vuelve a commitear**
- [ ] Probar los 5 endpoints con Postman importando `docs/api-collection.postman.json` (Thunder Client free ya no soporta colecciones)

**DoD del día:** servidor levanta, `GET/POST/PUT/DELETE /api/clientes` funcionando desde Postman, `data/clientes.json` con seed commiteado.

---

### Día 2 — Martes 15/9

**Sprint 3 (mañana):**
- [ ] Clase `Pedido` en `/models` (clienteId, choferId, ítems `[{ descripcion, cantidad }]`, estado, fechaHoraProgramada)
- [ ] `data/pedidos.json` con 2-3 registros de ejemplo que referencien ids reales de `clientes.json` y `choferes.json` → **seed final, no se vuelve a commitear**
- [ ] `pedidosController.js` con las 5 operaciones + `cambiarEstado` + `listarChoferes` (solo lectura del seed)
- [ ] `routes/api/pedidosRoutes.js`: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/estado` → montado en `/api/pedidos`
- [ ] `GET /api/choferes` de solo lectura (va en el router de pedidos, **no es un módulo**: sin POST/PUT/DELETE)
- [ ] Probar todos los endpoints con Postman y agregarlos a `docs/api-collection.postman.json` (carpeta "Pedidos")

**Sprint 4 (tarde):**
- [ ] `PedidoService` en `/services`:
  - alta de pedido: valida que `clienteId` exista en `clientes.json` y `choferId` exista en `choferes.json`; si no, error 400 (lo captura el `errorHandler` del Sprint 5)
  - `cambiarEstado(id, nuevoEstado)`: solo permite la transición al estado siguiente en el orden `pendiente → asignado → en tránsito → entregado`. Sin saltos ni retrocesos. Transición inválida → error 400.
- [ ] `pedidosController.js` pasa a usar `PedidoService` en `crear` y `cambiarEstado`
- [ ] Merge de Clientes + Pedidos a `development`
- [ ] **Congelar `/data`**: a partir de acá ningún commit incluye cambios en `clientes.json` ni `pedidos.json`

**DoD del día:** los 2 CRUD completos con reglas de negocio, probados con Postman, `/data` congelado.

---

### Día 3 — Miércoles 16/9

**Sprint 5 (mañana):**
- [ ] `middlewares/logger.js`: método + url + timestamp por request, montado global en `app.js`
- [ ] `middlewares/validate.js`: validación de body para `POST/PUT` de Clientes y Pedidos (campos obligatorios, tipos). Devuelve 400 con `{ mensaje, errores }`.
- [ ] `middlewares/errorHandler.js`:
  - handler de rutas inexistentes → 404 `{ mensaje: "Ruta no encontrada" }`
  - handler de errores (4 parámetros) → status del error o 500, `{ mensaje }`
  - Los controllers **no** llevan `try/catch`: Express 5 pasa los errores de handlers `async` solos al `errorHandler`
- [ ] Montar en `app.js` en este orden: `logger` → `express.json/urlencoded/static` → rutas → 404 → `errorHandler`
- [ ] Verificar desde Postman: body inválido → 400, id inexistente → 404, ruta inexistente → 404

**Sprint 6 (tarde):**
- [x] `routes/web/clientesRoutes.js` montado en `/clientes`:
  - `GET /` lista · `GET /nuevo` form alta · `POST /` alta
  - `GET /:id/editar` form edición · `POST /:id/editar` guardar · `POST /:id/eliminar` borrar
- [x] Vistas `views/clientes/lista.pug` y `views/clientes/form.pug` (form reutilizado para alta y edición)
- [x] Las rutas web usan el mismo `clientesController` que la API (o llaman al repository directo); **no duplicar lógica**

**DoD del día:** middlewares activos en los 2 módulos, Clientes navegable completo desde el browser, la API sigue intacta.

---

### Día 4 — Jueves 17/9

**Sprint 7 (mañana):**
- [ ] `routes/web/pedidosRoutes.js` montado en `/pedidos`, mismo esquema que clientes + `POST /:id/estado`
- [ ] Vistas `views/pedidos/lista.pug`, `detalle.pug`, `form.pug`
  - form: `select` de cliente (desde `clientes.json`) y `select` de chofer (desde `choferes.json`)
  - detalle: botón "Avanzar estado" que hace `POST /pedidos/:id/estado` y pasa por `PedidoService`
- [ ] Si a las 13:00 las vistas de Pedidos no están completas → se entrega solo `lista.pug` + `detalle.pug` y se documenta el form como "próximo". **La API no se toca.**

**Sprint 8 (tarde):**
- [ ] Code review cruzado (cada uno revisa una rama que no es la suya)
- [ ] Bug bash: todos prueban el flujo completo end-to-end
- [ ] **Congelar funcionalidad** — nada nuevo después de este sprint, no se negocia

**DoD del día:** flujo completo usable desde el navegador, sin bugs bloqueantes, funcionalidad cerrada.

---

### Día 5 — Viernes 18/9 (deadline del video)

**Sprint 9 (mañana):**
- [ ] Exportar la colección Postman a `docs/api-collection.postman.json` (al menos un request por endpoint de cada módulo)
- [ ] Capturas de cada request/response en `docs/evidencia/` con nombre `<modulo>_<operacion>.png` (ej. `clientes_post.png`)
- [ ] `README.md`: instalación, estructura, **tabla de endpoints por módulo (método · ruta · body de ejemplo · respuesta)**, listado de archivos de `/data`
- [ ] `docs/bibliografia.md` y `docs/roles.md` con nombres reales
- [ ] `docs/DOCUMENTACION_Parte1.md` con la estructura exacta de la sección 7 (portada con `DSWB_2#_#################_2C26`, empresa de desarrollo, integrantes). Este archivo es la fuente del PDF.
- [ ] Un integrante postea en la "oficina del grupo": empresa de desarrollo, caso, comentario 1-2 párrafos, link Drive, integrantes
- [ ] `git checkout data/` antes del último commit para asegurar que `/data` sigue con el seed original

**Sprint 10 (tarde):**
- [ ] Grabar video (Meet/Zoom/YouTube), 5 partes, una por integrante
- [ ] Verificar que el link tenga permisos de visualización abiertos
- [ ] **Checkpoint duro: video grabado y verificado antes de terminar el día**

**DoD del día:** repo clonable que corre con `npm install && npm run dev` y muestra datos desde el primer request, documentación completa en el repo, video grabado.

---

## 5. Sábado 19 y domingo 20 — Buffer de entrega (no de código)

- [ ] Generar el PDF desde `docs/DOCUMENTACION_Parte1.md` con nomenclatura `DSWB_2#_#################_2C26`
- [ ] Carpeta en Drive `Primera Entrega`, subir código + PDF, compartir al mail de la cátedra
- [ ] Cada integrante sube **únicamente el PDF** en el área de entrega del campus, con su propio usuario
- [ ] Doble-check: el post en "oficina del grupo" ya está hecho (Sprint 9, no dejarlo para ahora)
- [ ] Tag/release final en GitHub (ej. `v1.0-primer-parcial`)
- [ ] Confirmar antes del domingo 23:59 que los 5 integrantes completaron su entrega individual

---

## 6. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Construir un tercer módulo (Choferes) "porque ya que estamos" | El profesor lo dijo explícito: menos módulos ahora = menos migración a Mongo después |
| Meter telemetría/ruteo porque "está en el caso de negocio" | Releer sección 1 antes de cualquier tarea que no esté en la lista |
| Vistas Pug rompen la API porque comparten router | Rutas `api/` y `web/` separadas desde el Sprint 2; la API es la que se evalúa con Postman |
| Conflictos de merge en `clientes.json` / `pedidos.json` | `/data` congelado después del Sprint 4; `git checkout data/` antes de cada commit |
| El docente clona y no ve datos | Seeds commiteados en S2/S3 como estado final del repo |
| Olvidar el post en "oficina del grupo" (es nuevo y no es código) | Asignado a Integrante 5, con deadline dentro del Sprint 9 del viernes, no del finde |
| No decidir el nombre de "Empresa de Desarrollo" a tiempo | Se resuelve en el Sprint 1, no se pospone |
| Llegar al viernes sin video por falta de tiempo real | El "congelar funcionalidad" del jueves tarde es innegociable |
| Confundir el deadline interno (18/9) con el real (20/9) y relajarse | El finde es solo para subir/entregar, no para seguir programando |

---

## 7. Estructura exacta del documento de entrega (PDF)

Portada: **"DOCUMENTACIÓN - Parte 1"** · Caso # · **Empresa de Desarrollo LosBuleanos** · lista de integrantes · nombre de documento/carpeta Drive: `DSWB_2#_#################_2C26`

1. **Links:** carpeta Drive, GitHub, link al video
2. **Bibliografía:** videos (YouTube) y documentos usados como referencia
3. **Introducción:** qué desarrollaron en esta instancia
4. **Integrantes y responsabilidades**
5. **Descripción funcional de la aplicación**
   - 5.1 Objetivo general
   - 5.2 Funcionalidades principales actuales
6. **Módulos del proyecto**
   - Módulo de Clientes: listar, crear, editar y eliminar clientes
   - Módulo de Pedidos: listar, crear, editar y eliminar pedidos; ver y cambiar estado
   - **Próximos Módulos:** Choferes (CRUD completo), migración a Mongo (segunda entrega)
7. **Persistencia de Datos:** datos en JSON dentro de `/data/` (listar los archivos) + capturas de Postman
