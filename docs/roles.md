# Roles del equipo — LosBuleanos

| Integrante | GitHub | Responsabilidad | Sprints liderados |
|---|---|---|---|
| Nicolás Zalazar | @Nicoalazar | Estructura base del proyecto, Backend Clientes (model, controller, router) + `JsonRepository` genérico, vistas web de Clientes, documentación y evidencia | Sprint 1 (estructura base) · Sprint 2 (CRUD Clientes + JsonRepository) · Sprint 6 (vistas Clientes) · Sprint 9 (documentación + evidencia) |
| Laura Olivera | @laura108814 | Backend Pedidos (model, controller, router) + seed `choferes.json` expuesto en `GET /api/choferes` | Sprint 3 (CRUD Pedidos) |
| Christian Albornoz | @albor77 | `PedidoService` (existencia de cliente/chofer, transiciones de estado) y vistas web de Pedidos + `routes/web/pedidosRoutes.js` | Sprint 4 (PedidoService + merge) · Sprint 7 (vistas Pedidos) |
| Belén Lau | @LauBelen | Middlewares: `logger`, `validate` (body de POST/PUT) y `errorHandler` (404 + errores centralizados) | Sprint 5 (middlewares) |
| Fernando Guevara | @Fer-505 | QA: code review cruzado, bug bash end-to-end, `docs/smoke-test.js` y fixes de las rutas web | Sprint 8 (code review + bug bash) |

El sprint asignado indica quién lidera y es responsable del DoD de ese sprint. El resto del equipo participa en los sprints que dependen de su módulo (ver `RELEASE_PLAN.md`).

## Tareas de cierre (Sprint 9 y 10)

| Tarea | Responsable |
|---|---|
| Post en la "oficina del grupo" del campus (texto en `docs/post-oficina-grupo.md`) | <<COMPLETAR: un integrante>> |
| Generar el PDF desde `docs/DOCUMENTACION_Parte1.md` y subir la carpeta a Drive | <<COMPLETAR>> |
| Video de presentación (5 partes, una por integrante) | Todos |
| Subida individual del PDF en el campus | Cada integrante con su usuario |
