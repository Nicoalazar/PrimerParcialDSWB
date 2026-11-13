// Sesión en las vistas web (cookie con el token) y manejo de errores
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, ID_INEXISTENTE, iniciarBase, cerrarBase, cargarDatos } = require("./helpers");

// hace el login por el formulario y devuelve la cookie que setea el server
const loginWeb = async (email, password) => {
    const res = await request(app).post("/login").type("form").send({ email, password });
    return res.headers["set-cookie"];
};

describe("Vistas web", () => {
    let datos;

    before(async () => {
        await iniciarBase();
        datos = await cargarDatos();
    });

    after(cerrarBase);

    it("sin sesión, /clientes y /pedidos redirigen a /login", async () => {
        for (const ruta of ["/clientes", "/pedidos"]) {
            const res = await request(app).get(ruta);
            assert.equal(res.status, 302);
            assert.equal(res.headers.location, "/login");
        }
    });

    it("el login web con credenciales correctas setea una cookie httpOnly", async () => {
        const res = await request(app)
            .post("/login")
            .type("form")
            .send({ email: "operador@test.com", password: "operador123" });

        assert.equal(res.status, 302);
        assert.equal(res.headers.location, "/pedidos");
        assert.match(res.headers["set-cookie"][0], /token=.+HttpOnly/);
    });

    it("el login web con contraseña incorrecta vuelve al form con 401", async () => {
        const res = await request(app)
            .post("/login")
            .type("form")
            .send({ email: "operador@test.com", password: "mal" });

        assert.equal(res.status, 401);
        assert.match(res.text, /Email o contraseña incorrectos/);
    });

    it("con la cookie se puede entrar al listado de pedidos", async () => {
        const cookie = await loginWeb("operador@test.com", "operador123");
        const res = await request(app).get("/pedidos").set("Cookie", cookie);

        assert.equal(res.status, 200);
        assert.match(res.text, /Operador \(operador\)/);
    });

    it("el operador no ve el botón Eliminar y el admin sí", async () => {
        const cookieOperador = await loginWeb("operador@test.com", "operador123");
        const cookieAdmin = await loginWeb("admin@test.com", "admin123");

        const comoOperador = await request(app).get("/clientes").set("Cookie", cookieOperador);
        const comoAdmin = await request(app).get("/clientes").set("Cookie", cookieAdmin);

        assert.doesNotMatch(comoOperador.text, /Eliminar/);
        assert.match(comoAdmin.text, /Eliminar/);
    });

    it("si el operador fuerza el POST de eliminar, recibe 403 en una página de error", async () => {
        const cookie = await loginWeb("operador@test.com", "operador123");
        const res = await request(app).post(`/clientes/${datos.idCliente}/eliminar`).set("Cookie", cookie);

        assert.equal(res.status, 403);
        assert.match(res.headers["content-type"], /html/);
    });

    it("logout borra la cookie", async () => {
        const res = await request(app).post("/logout");

        assert.equal(res.status, 302);
        assert.match(res.headers["set-cookie"][0], /token=;/);
    });

    it("una ruta web inexistente responde 404 en HTML y una de la API en JSON", async () => {
        const web = await request(app).get("/loquesea");
        const api = await request(app).get("/api/loquesea");

        assert.equal(web.status, 404);
        assert.match(web.headers["content-type"], /html/);
        assert.equal(api.status, 404);
        assert.deepEqual(api.body, { mensaje: "Ruta no encontrada" });
    });

    it("un id con formato inválido en la API responde 400", async () => {
        const res = await request(app)
            .get("/api/clientes/abc")
            .set("Authorization", `Bearer ${datos.tokenOperador}`);

        assert.equal(res.status, 400);
        assert.match(res.body.mensaje, /Id inválido/);
    });

    it("GET de un cliente inexistente responde 404", async () => {
        const res = await request(app)
            .get(`/api/clientes/${ID_INEXISTENTE}`)
            .set("Authorization", `Bearer ${datos.tokenOperador}`);

        assert.equal(res.status, 404);
    });

    it("un formulario web con datos inválidos muestra la página de error 400 (no JSON)", async () => {
        const cookie = await loginWeb("operador@test.com", "operador123");
        const web = await request(app).post("/clientes").type("form").set("Cookie", cookie).send({});

        assert.equal(web.status, 400);
        assert.match(web.headers["content-type"], /html/);
        assert.match(web.text, /Datos de cliente inválidos/);
        assert.match(web.text, /nombre es obligatorio/);

        // la API sigue respondiendo JSON con { mensaje, errores }
        const api = await request(app)
            .post("/api/clientes")
            .set("Authorization", `Bearer ${datos.tokenOperador}`)
            .send({});

        assert.equal(api.status, 400);
        assert.equal(api.body.mensaje, "Datos de cliente inválidos");
        assert.ok(Array.isArray(api.body.errores));
    });
});
