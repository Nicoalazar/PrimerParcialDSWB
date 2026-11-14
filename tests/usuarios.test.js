// Gestión de usuarios (admin): edición y baja por la API y por la web,
// y que un usuario borrado o con el rol cambiado no siga usando su token viejo.
const { describe, it, beforeEach, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, ID_INEXISTENTE, iniciarBase, cerrarBase, cargarDatos } = require("./helpers");
const Usuario = require("../models/Usuario");

const loginWeb = async (email, password) => {
    const res = await request(app).post("/login").type("form").send({ email, password });
    return res.headers["set-cookie"];
};

const login = (email, password) => request(app).post("/api/auth/login").send({ email, password });

describe("Gestión de usuarios", () => {
    let datos;
    let idAdmin;
    let idOperador;

    before(iniciarBase);
    after(cerrarBase);

    // cada test arranca con la base recién cargada, porque estos tests la modifican
    beforeEach(async () => {
        datos = await cargarDatos();
        idAdmin = (await Usuario.findOne({ email: "admin@test.com" })).id;
        idOperador = (await Usuario.findOne({ email: "operador@test.com" })).id;
    });

    describe("PUT /api/usuarios/:id", () => {
        it("el admin edita nombre y rol", async () => {
            const res = await request(app)
                .put(`/api/usuarios/${idOperador}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ nombre: "Operador Editado", rol: "admin" });

            assert.equal(res.status, 200);
            assert.equal(res.body.usuario.nombre, "Operador Editado");
            assert.equal(res.body.usuario.rol, "admin");
            assert.equal(res.body.usuario.password, undefined);
        });

        it("la contraseña nueva se hashea y la vieja deja de funcionar", async () => {
            const res = await request(app)
                .put(`/api/usuarios/${idOperador}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ password: "nueva1234" });

            assert.equal(res.status, 200);

            const guardado = await Usuario.findById(idOperador).select("+password");
            assert.notEqual(guardado.password, "nueva1234");

            assert.equal((await login("operador@test.com", "nueva1234")).status, 200);
            assert.equal((await login("operador@test.com", "operador123")).status, 401);
        });

        it("sin campos o con datos inválidos responde 400", async () => {
            const vacio = await request(app)
                .put(`/api/usuarios/${idOperador}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({});
            assert.equal(vacio.status, 400);

            const invalido = await request(app)
                .put(`/api/usuarios/${idOperador}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ nombre: "", rol: "jefe", password: "123" });
            assert.equal(invalido.status, 400);
            assert.equal(invalido.body.errores.length, 3);
        });

        it("con un id inexistente responde 404 y con uno mal formado 400", async () => {
            const inexistente = await request(app)
                .put(`/api/usuarios/${ID_INEXISTENTE}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ nombre: "X" });
            assert.equal(inexistente.status, 404);

            const malFormado = await request(app)
                .put("/api/usuarios/abc")
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ nombre: "X" });
            assert.equal(malFormado.status, 400);
        });

        it("el admin no puede quitarse su propio rol de admin", async () => {
            const res = await request(app)
                .put(`/api/usuarios/${idAdmin}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`)
                .send({ rol: "operador" });

            assert.equal(res.status, 400);
        });

        it("un operador no puede editar usuarios (403)", async () => {
            const res = await request(app)
                .put(`/api/usuarios/${idOperador}`)
                .set("Authorization", `Bearer ${datos.tokenOperador}`)
                .send({ rol: "admin" });

            assert.equal(res.status, 403);
        });
    });

    describe("DELETE /api/usuarios/:id", () => {
        it("el admin borra un usuario", async () => {
            const res = await request(app)
                .delete(`/api/usuarios/${idOperador}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`);

            assert.equal(res.status, 200);
            assert.equal(await Usuario.exists({ _id: idOperador }), null);
        });

        it("el admin no puede borrarse a sí mismo", async () => {
            const res = await request(app)
                .delete(`/api/usuarios/${idAdmin}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`);

            assert.equal(res.status, 400);
            assert.equal(res.body.mensaje, "Un administrador no puede eliminarse a sí mismo");
        });

        it("con un id inexistente responde 404", async () => {
            const res = await request(app)
                .delete(`/api/usuarios/${ID_INEXISTENTE}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`);

            assert.equal(res.status, 404);
        });

        it("un operador no puede borrar usuarios (403)", async () => {
            const res = await request(app)
                .delete(`/api/usuarios/${idAdmin}`)
                .set("Authorization", `Bearer ${datos.tokenOperador}`);

            assert.equal(res.status, 403);
        });
    });

    describe("token de un usuario borrado o modificado", () => {
        it("un usuario borrado ya no entra con su token (401)", async () => {
            await Usuario.findByIdAndDelete(idOperador);

            const res = await request(app)
                .get("/api/clientes")
                .set("Authorization", `Bearer ${datos.tokenOperador}`);

            assert.equal(res.status, 401);
        });

        it("un usuario borrado es redirigido al login en la web", async () => {
            const cookie = await loginWeb("operador@test.com", "operador123");
            await Usuario.findByIdAndDelete(idOperador);

            const res = await request(app).get("/pedidos").set("Cookie", cookie);

            assert.equal(res.status, 302);
            assert.equal(res.headers.location, "/login");
        });

        it("si le sacan el rol de admin, pierde los permisos en el momento", async () => {
            // su token dice rol "admin", pero en la base ya es operador
            await Usuario.findByIdAndUpdate(idAdmin, { rol: "operador" });

            const res = await request(app)
                .get("/api/usuarios")
                .set("Authorization", `Bearer ${datos.tokenAdmin}`);

            assert.equal(res.status, 403);
        });
    });

    describe("vistas web /usuarios", () => {
        it("solo el admin ve el link Usuarios en el menú", async () => {
            const cookieAdmin = await loginWeb("admin@test.com", "admin123");
            const cookieOperador = await loginWeb("operador@test.com", "operador123");

            const admin = await request(app).get("/pedidos").set("Cookie", cookieAdmin);
            const operador = await request(app).get("/pedidos").set("Cookie", cookieOperador);

            assert.match(admin.text, /href="\/usuarios"/);
            assert.doesNotMatch(operador.text, /href="\/usuarios"/);
        });

        it("el operador recibe 403 en /usuarios y sin sesión se redirige al login", async () => {
            const cookie = await loginWeb("operador@test.com", "operador123");
            const operador = await request(app).get("/usuarios").set("Cookie", cookie);
            assert.equal(operador.status, 403);

            const anonimo = await request(app).get("/usuarios");
            assert.equal(anonimo.status, 302);
            assert.equal(anonimo.headers.location, "/login");
        });

        it("el admin ve el listado sin botón para borrarse a sí mismo", async () => {
            const cookie = await loginWeb("admin@test.com", "admin123");
            const res = await request(app).get("/usuarios").set("Cookie", cookie);

            assert.equal(res.status, 200);
            assert.match(res.text, /operador@test.com/);
            assert.match(res.text, new RegExp(`/usuarios/${idOperador}/eliminar`));
            assert.doesNotMatch(res.text, new RegExp(`/usuarios/${idAdmin}/eliminar`));
        });

        it("alta por el formulario", async () => {
            const cookie = await loginWeb("admin@test.com", "admin123");
            const res = await request(app)
                .post("/usuarios")
                .set("Cookie", cookie)
                .type("form")
                .send({ nombre: "Web", email: "web@test.com", password: "web12345", rol: "operador" });

            assert.equal(res.status, 302);
            assert.equal((await login("web@test.com", "web12345")).status, 200);
        });

        it("alta con email repetido muestra el error 400", async () => {
            const cookie = await loginWeb("admin@test.com", "admin123");
            const res = await request(app)
                .post("/usuarios")
                .set("Cookie", cookie)
                .type("form")
                .send({ nombre: "Otro", email: "operador@test.com", password: "otro1234" });

            assert.equal(res.status, 400);
            assert.match(res.text, /Ya existe un usuario/);
        });

        it("edición con la contraseña vacía no la cambia", async () => {
            const cookie = await loginWeb("admin@test.com", "admin123");
            const res = await request(app)
                .post(`/usuarios/${idOperador}/editar`)
                .set("Cookie", cookie)
                .type("form")
                .send({ nombre: "Renombrado", rol: "operador", password: "" });

            assert.equal(res.status, 302);
            assert.equal((await Usuario.findById(idOperador)).nombre, "Renombrado");
            assert.equal((await login("operador@test.com", "operador123")).status, 200);
        });

        it("baja por el formulario y el admin no puede borrarse a sí mismo", async () => {
            const cookie = await loginWeb("admin@test.com", "admin123");

            const baja = await request(app).post(`/usuarios/${idOperador}/eliminar`).set("Cookie", cookie);
            assert.equal(baja.status, 302);
            assert.equal(await Usuario.exists({ _id: idOperador }), null);

            const propia = await request(app).post(`/usuarios/${idAdmin}/eliminar`).set("Cookie", cookie);
            assert.equal(propia.status, 400);
            assert.ok(await Usuario.exists({ _id: idAdmin }));
        });
    });
});
