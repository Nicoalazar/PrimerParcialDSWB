# Roles del equipo — LosBuleanos

| Integrante | GitHub | Responsabilidad | Sprints liderados |
|---|---|---|---|
| Nicolás Zalazar | @Nicoalazar | Estructura base del proyecto: `app.js`, configuración de Express y Pug, estructura MVC de carpetas y seed `choferes.json` | Sprint 1 (estructura base) |
| Laura Olivera | @laura108814 | `JsonRepository` genérico, Backend Clientes (model, controller, router) y vistas web de Clientes | Sprint 2 (CRUD Clientes + JsonRepository) · Sprint 6 (vistas Clientes) |
| Christian Albornoz | @albor77 | Backend Pedidos (model, controller, router) + `GET /api/choferes` de solo lectura, y vistas web de Pedidos con `routes/web/pedidosRoutes.js` | Sprint 3 (CRUD Pedidos) · Sprint 7 (vistas Pedidos) |
| Belén Lau | @LauBelen | `PedidoService` (existencia de cliente/chofer, transiciones de estado) y middlewares: `logger`, `validate` (body de POST/PUT) y `errorHandler` (404 + errores centralizados) | Sprint 4 (PedidoService + merge) · Sprint 5 (middlewares) |
| Fernando Guevara | @Fer-505 | QA: code review cruzado, bug bash end-to-end, `docs/smoke-test.js` y fixes de las rutas web · documentación y evidencia | Sprint 8 (code review + bug bash) · Sprint 9 (documentación + evidencia) |

El sprint asignado indica quién lidera y es responsable del DoD de ese sprint. El resto del equipo participa en los sprints que dependen de su módulo (ver `RELEASE_PLAN.md`).

## Tareas de cierre (Sprint 9 y 10)

| Tarea | Responsable |
|---|---|
| Post en la "oficina del grupo" del campus (texto en `docs/post-oficina-grupo.md`) | <<COMPLETAR: un integrante>> |
| Generar el PDF desde `docs/DOCUMENTACION_Parte1.md` y subir la carpeta a Drive | <<COMPLETAR>> |
| Video de presentación (5 partes, una por integrante) | Todos |
| Subida individual del PDF en el campus | Cada integrante con su usuario |
