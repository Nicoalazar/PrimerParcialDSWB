# Release Plan — Tercer Parcial DSWB (entrega final)
## Caso: FreshRoute B2B · Equipo LosBuleanos

> **Borrador.** Faltan fechas (cierre de la cátedra y deadline interno) y la confirmación del equipo sobre las decisiones técnicas de la sección 2.

**Punto de partida:** `v2.0-segundo-parcial` (Express 5 + Mongoose, módulos Clientes y Pedidos, Choferes de solo lectura, API JSON + vistas Pug).
**Versión a entregar:** `v3.0-tercer-parcial`.

---

## 1. Qué pide la consigna y cómo se cubre

| Requisito | Estado en v2.0 | Qué hay que hacer |
|---|---|---|
| Node + Express, MVC, ruteo y controllers ordenados | ✅ | Separar `app.js` (exporta la app) de `server.js` (conecta y escucha) para poder testear |
| MongoDB, modelo coherente (entidades, relaciones, validaciones) | ✅ | Agregar `Usuario`; índices y validaciones extra donde sumen |
| **Autenticación y autorización** | ❌ | Login con JWT, contraseñas con bcrypt, roles |
| Manejo de errores y middlewares propios | ✅ | Sumar `autenticar` y `autorizar(...roles)`; errores 401/403 con el mismo formato `{ mensaje }` |
| Variables de entorno y configuración separada | 🟡 (`PORT`, `MONGO_URI`) | Sumar `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`; centralizar en `config/` |
| **Despliegue + Mongo Atlas** | ❌ | Atlas (cluster free) + Render (web service free) |
| README completo | 🟡 | Instalación, `.env`, seed, login, endpoints protegidos, link al deploy |
| Pruebas de lo crítico | 🟡 (smoke test + Postman) | Tests automáticos con `node:test` + `supertest` sobre una base de test |
| Documentación PDF | — | `DOCUMENTACION_Parte3.md` → PDF (ver sección 5) |
| Entrega ZIP + RAR con versión anterior y actual | — | Carpetas `Version 2.0` (tag v2.0) y `Version 3.0` (tag v3.0) |

---

## 2. Decisiones técnicas propuestas (a confirmar)

1. **JWT** (`jsonwebtoken`) + **bcryptjs** para el hash. Un solo middleware `autenticar` lee el token del header `Authorization: Bearer …` (API/Postman) **o** de una cookie `httpOnly` (vistas Pug, con `cookie-parser`). Así la API y la web comparten la misma lógica, igual que hoy comparten validadores y service.
2. **Roles:** `admin` y `operador`.
   - `operador`: ver todo, crear/editar clientes y pedidos, avanzar estados.
   - `admin`: además eliminar, gestionar choferes y usuarios.
   - Sin token → 401; token válido sin rol suficiente → 403.
3. **Registro:** `POST /api/auth/login` público; el alta de usuarios la hace un `admin` (no hay registro abierto — es un sistema B2B interno). El seed crea un admin y un operador de prueba.
4. **Seguridad básica:** `helmet` y límite de intentos en el login (`express-rate-limit`). Ambos son librerías no vistas en clase → justificarlas en la documentación o descartarlas.
5. **Tests:** `node:test` (viene con Node, no suma framework) + `supertest`. Corren contra `MONGO_URI_TEST`, nunca contra la base de desarrollo ni Atlas.
6. **Deploy:** Render + Atlas. La IP de Render no es fija → en Atlas habilitar `0.0.0.0/0` con usuario de permisos mínimos (documentarlo como limitación).

---

## 3. Alcance

**Obligatorio (P1):** autenticación + autorización, `Usuario`, protección de rutas API y web, config centralizada, tests, deploy, README, documentación.

**Mejoras (P2, ya anunciadas como "próximos módulos" en la Parte 2):**
- CRUD completo de **Choferes** (hoy solo lectura).
- **Historial de estados** del pedido (quién y cuándo cambió cada estado; se apoya en el usuario autenticado).

**Fuera de alcance:** tiempo real, telemetría, mapas, frontend con framework, OAuth/terceros.

---

## 4. Tareas por integrante

Se mantiene la propiedad de cada parte de los parciales anteriores.

| Integrante | Responsabilidad | Archivos principales |
|---|---|---|
| Nicolás Zalazar | Config y arranque: `config/` centralizado, separar `app.js` / `server.js`, nuevas variables en `.env.example`, seed de usuarios, deploy en Render + Atlas | `config/`, `app.js`, `server.js`, `seed.js`, `.env.example`, `package.json` |
| Laura Olivera | Autenticación: modelo `Usuario` (hash en `pre('save')`), `authController` (login, logout, alta por admin), rutas `/api/auth` y vista de login | `models/Usuario.js`, `controllers/authController.js`, `routes/api/authRoutes.js`, `routes/web/authRoutes.js`, `views/auth/` |
| Laura Belén Blanco | Autorización y seguridad: middlewares `autenticar` / `autorizar`, aplicarlos a las rutas, 401/403 en `errorHandler`, helmet y rate limit | `middlewares/auth.js`, `middlewares/errorHandler.js`, `routes/**` |
| Christian Albornoz | Mejoras P2: CRUD de Choferes (API + web) e historial de estados en `Pedido` | `controllers/choferesController.js`, `routes/*/choferesRoutes.js`, `views/choferes/`, `models/Pedido.js`, `services/PedidoService.js` |
| Fernando Guevara | QA y documentación: tests automáticos, smoke test y Postman con login, evidencia, README, `DOCUMENTACION_Parte3.md` y PDF | `tests/`, `docs/` , `README.md` |

**Compartido:** diagramas (cada uno el de su parte), conclusión individual, video.

---

## 5. Documentación (PDF final)

Estructura según la consigna:

1. Links: video, GitHub, app desplegada (dentro del PDF, no sueltos)
2. Introducción y objetivos
3. Requerimientos funcionales y no funcionales (performance, seguridad, usabilidad)
4. Historias de usuario priorizadas y estimadas + captura del tablero (GitHub Projects)
5. Diagramas: casos de uso, clases, secuencia (login + cambio de estado), ER
6. Funcionamiento: módulos, interacción entre ellos, flujo de autenticación; lo que no se usó y por qué
7. Mantenimiento y evolución: qué se corrigió/cambió desde la v2.0 (seguridad, rendimiento, escalabilidad)
8. Pruebas: objetivo, procedimiento, resultados (tests automáticos + Postman + casos de error)
9. Roles y responsabilidades
10. Uso de IA (qué se generó y cómo se adaptó)
11. Bibliografía
12. Conclusión: qué aprendimos, dificultades y cómo se resolvieron, qué nos interesó más, qué reforzar

---

## 6. Orden de trabajo

| Etapa | Contenido | Depende de |
|---|---|---|
| 1 | Config centralizada + split `app.js`/`server.js` · modelo `Usuario` | — |
| 2 | Login/JWT · middlewares `autenticar`/`autorizar` | 1 |
| 3 | Proteger rutas API y web · vista de login · seed de usuarios | 2 |
| 4 | Tests automáticos · Postman/smoke test con token | 3 |
| 5 | Mejoras P2 (Choferes, historial) | 3 (en paralelo con 4) |
| 6 | Deploy Render + Atlas · README | 3 |
| 7 | Documentación, diagramas, evidencia, PDF | 4, 5, 6 |
| 8 | Tag `v3.0-tercer-parcial`, ZIP + RAR, video | 7 |

## 7. Definition of Done

- Funciona local y en el deploy; `npm test` y el smoke test en verde.
- Toda ruta nueva figura en el README y en la colección Postman.
- Sin credenciales en el repo; `.env.example` al día.
- Cada cambio respecto de la v2.0 está registrado en la documentación.
- PR revisado por otro integrante antes de mergear a `main`.
