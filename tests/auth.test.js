// Autenticación (login / token) y autorización (roles)
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { app, request, iniciarBase, cerrarBase, cargarDatos } = require("./helpers");

describe("Autenticación y autorización", () => {
    let datos;

    before(async () => {
        await iniciarBase();
        datos = await cargarDatos();
    });

    after(cerrarBase);

    describe("POST /api/auth/login", () => {
        it("con credenciales correctas devuelve un token y el usuario sin contraseña", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "admin@test.com", password: "admin123" });

            assert.equal(res.status, 200);
            assert.ok(res.body.token);
            assert.equal(res.body.usuario.rol, "admin");
            assert.equal(res.body.usuario.password, undefined);
        });

        it("acepta el email en mayúsculas", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "ADMIN@test.com", password: "admin123" });

            assert.equal(res.status, 200);
        });

        it("con contraseña incorrecta responde 401", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "admin@test.com", password: "otra" });

            assert.equal(res.status, 401);
            assert.equal(res.body.mensaje, "Email o contraseña incorrectos");
        });

        it("con email inexistente responde el mismo 401 (no revela qué emails existen)", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "nadie@test.com", password: "admin123" });

            assert.equal(res.status, 401);
            assert.equal(res.body.mensaje, "Email o contraseña incorrectos");
        });

        it("sin campos responde 400 de validación", async () => {
            const res = await request(app).post("/api/auth/login").send({});

            assert.equal(res.status, 400);
            assert.equal(res.body.errores.length, 2);
        });
    });

    describe("rutas protegidas", () => {
        it("sin token responden 401", async () => {
            const res = await request(app).get("/api/clientes");

            assert.equal(res.status, 401);
            assert.equal(res.body.mensaje, "Se requiere iniciar sesión");
        });

        it("con un token adulterado responden 401", async () => {
            const res = await request(app)
                .get("/api/clientes")
                .set("Authorization", `Bearer ${datos.tokenAdmin}x`);

            assert.equal(res.status, 401);
            assert.equal(res.body.mensaje, "Token inválido o vencido");
        });

        it("con un token vencido responden 401", async () => {
            const vencido = jwt.sign({ id: "x", rol: "admin" }, process.env.JWT_SECRET, { expiresIn: -10 });
            const res = await request(app)
                .get("/api/clientes")
                .set("Authorization", `Bearer ${vencido}`);

            assert.equal(res.status, 401);
        });

        it("con token válido dejan pasar", async () => {
            const res = await request(app)
                .get("/api/clientes")
                .set("Authorization", `Bearer ${datos.tokenOperador}`);

            assert.equal(res.status, 200);
        });

        it("GET /api/auth/perfil devuelve al dueño del token", async () => {
            const res = await request(app)
                .get("/api/auth/perfil")
                .set("Authorization", `Bearer ${datos.tokenOperador}`);

            assert.equal(res.status, 200);
            assert.equal(res.body.email, "operador@test.com");
        });
    });

    describe("roles", () => {
        it("un operador no puede listar usuarios (403)", async () => {
            const res = await request(app)
                .get("/api/usuarios")
                .set("Authorization", `Bearer ${datos.tokenOperador}`);

            assert.equal(res.status, 403);
        });

        it("un operador no puede borrar clientes (403)", async () => {
            const res = await request(app)
                .delete(`/api/clientes/${datos.idCliente}`)
                .set("Authorization", `Bearer ${datos.tokenOperador}`);

            assert.equal(res.status, 403);
        });

        it("el admin crea un usuario y la contraseña queda hasheada", async () => {
            const res = await request(app)
                .post("/api/usuarios")
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ nombre: "Nuevo", email: "nuevo@test.com", password: "nuevo123" });

            assert.equal(res.status, 201);
            assert.equal(res.body.usuario.rol, "operador");
            assert.equal(res.body.usuario.password, undefined);

            // el usuario nuevo puede iniciar sesión con la contraseña original
            const login = await request(app)
                .post("/api/auth/login")
                .send({ email: "nuevo@test.com", password: "nuevo123" });
            assert.equal(login.status, 200);
        });

        it("no se puede crear un usuario con un email repetido", async () => {
            const res = await request(app)
                .post("/api/usuarios")
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ nombre: "Otro", email: "operador@test.com", password: "otro1234" });

            assert.equal(res.status, 400);
        });

        it("alta de usuario con datos inválidos responde 400", async () => {
            const res = await request(app)
                .post("/api/usuarios")
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ nombre: "X", email: "no-es-email", password: "123", rol: "jefe" });

            assert.equal(res.status, 400);
            assert.equal(res.body.errores.length, 3);
        });
    });
});
