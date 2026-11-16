# Bibliografía

## Material de la cátedra

- Código de clases 1 a 4 (Drive del profesor) — https://drive.google.com/drive/folders/18hYfMEMIDmce3HxpmjJRqGdp9KBO9t9j
  Base para la nomenclatura `routes/`, `controllers/`, `models/` y la persistencia JSON con `fs`.

## Documentación oficial

### Node.js y Express

- Express 5 — Guía de routing — https://expressjs.com/en/guide/routing.html
- Express 5 — Uso de middleware — https://expressjs.com/en/guide/using-middleware.html
- Express 5 — Manejo de errores (handlers `async` y middleware de 4 parámetros) — https://expressjs.com/en/guide/error-handling.html
- Express 5 — Guía de migración a v5 — https://expressjs.com/en/guide/migrating-5.html
- Express — `express.Router`, `express.json`, `express.urlencoded`, `express.static` — https://expressjs.com/en/5x/api.html
- Node.js — módulo `fs` (`readFileSync` / `writeFileSync`) — https://nodejs.org/api/fs.html
- Node.js — módulo `path` — https://nodejs.org/api/path.html
- Node.js — `fetch` global (usado en `docs/smoke-test.js`) — https://nodejs.org/api/globals.html#fetch

### MongoDB y Mongoose (segundo parcial)

- Mongoose — Getting Started — https://mongoosejs.com/docs/index.html
- Mongoose — Schemas y SchemaTypes (`required`, `enum`, `min`, `ref`) — https://mongoosejs.com/docs/guide.html · https://mongoosejs.com/docs/schematypes.html
- Mongoose — Models y Queries (`find`, `findById`, `findByIdAndUpdate`, `findByIdAndDelete`, `exists`) — https://mongoosejs.com/docs/models.html · https://mongoosejs.com/docs/queries.html
- Mongoose — Validación (`ValidationError`, `runValidators`) — https://mongoosejs.com/docs/validation.html
- Mongoose — Populate (referencias entre colecciones) — https://mongoosejs.com/docs/populate.html
- Mongoose — Conexiones (`mongoose.connect`) — https://mongoosejs.com/docs/connections.html
- MongoDB — Manual (documentos, colecciones, ObjectId) — https://www.mongodb.com/docs/manual/
- MongoDB Atlas — Crear un cluster gratuito — https://www.mongodb.com/docs/atlas/getting-started/
- dotenv — variables de entorno desde `.env` — https://github.com/motdotla/dotenv#readme
- MDN — async/await — https://developer.mozilla.org/es/docs/Learn/JavaScript/Asynchronous/Promises

### Autenticación y seguridad (entrega final)

- Introducción a JSON Web Tokens — https://jwt.io/introduction
- jsonwebtoken — firmar y verificar tokens (`sign`, `verify`, `expiresIn`) — https://github.com/auth0/node-jsonwebtoken#readme
- bcryptjs — hash y comparación de contraseñas — https://github.com/dcodeIO/bcrypt.js#readme
- Mongoose — Middleware (`pre("save")`, usado para hashear la contraseña) — https://mongoosejs.com/docs/middleware.html
- cookie-parser — https://expressjs.com/en/resources/middleware/cookie-parser.html
- Express — `res.cookie` (`httpOnly`, `secure`, `sameSite`) — https://expressjs.com/en/5x/api.html#res.cookie
- MDN — Cookies HTTP (`HttpOnly`, `Secure`, `SameSite`) — https://developer.mozilla.org/es/docs/Web/HTTP/Cookies
- Express — Buenas prácticas de seguridad en producción — https://expressjs.com/en/advanced/best-practice-security.html
- OWASP — Password Storage Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

### Pruebas automáticas (entrega final)

- Node.js — Test runner (`node:test`) — https://nodejs.org/api/test.html
- Node.js — `node:assert` — https://nodejs.org/api/assert.html
- supertest — https://github.com/ladjs/supertest#readme
- mongodb-memory-server — https://github.com/typegoose/mongodb-memory-server#readme

### Despliegue (entrega final)

- Render — Deploy de una app Node/Express — https://render.com/docs/deploy-node-express-app
- Render — Variables de entorno — https://render.com/docs/configure-environment-variables
- MongoDB Atlas — Seguridad: usuarios de base de datos y acceso de red — https://www.mongodb.com/docs/atlas/security/

### Vistas

- Pug — Referencia del lenguaje (`extends`, `block`, `each`, atributos) — https://pugjs.org/language/attributes.html
- Pug — Integración con Express — https://pugjs.org/api/express.html

### Herramientas

- nodemon — https://github.com/remy/nodemon#readme
- Postman — Importar y exportar colecciones (formato v2.1) — https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-and-exporting-overview/
- GitHub — CODEOWNERS — https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- MDN — Métodos HTTP y códigos de estado — https://developer.mozilla.org/es/docs/Web/HTTP/Status
- GitHub Projects — tableros de planificación — https://docs.github.com/en/issues/planning-and-tracking-with-projects
- Mermaid — diagramas de casos de uso, clases, secuencia y ER de la documentación — https://mermaid.js.org/

