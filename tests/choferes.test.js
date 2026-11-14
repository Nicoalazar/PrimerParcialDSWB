// Módulo Choferes: CRUD por la API, permisos y regla de baja con pedidos asignados
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, ID_INEXISTENTE, iniciarBase, cerrarBase, cargarDatos } = require("./helpers");

describe("Choferes", () => {
    let datos;
    let authOperador;
    let authAdmin;

    const choferValido = () => ({
        nombre: "Carlos",
        apellido: "Gómez",
        vehiculo: "Utilitario",
        zona: "Norte"
    });

    const crearChofer = async () => {
        const res = await request(app).post("/api/choferes").set(authOperador).send(choferValido());
        return res.body.chofer._id;
    };

    before(async () => {
        await iniciarBase();
        datos = await cargarDatos();
        authOperador = { Authorization: `Bearer ${datos.tokenOperador}` };
        authAdmin = { Authorization: `Bearer ${datos.tokenAdmin}` };
    });

    after(cerrarBase);

    describe("consulta", () => {
        it("lista los choferes", async () => {
            const res = await request(app).get("/api/choferes").set(authOperador);

            assert.equal(res.status, 200);
            assert.ok(Array.isArray(res.body));
        });

        it("obtiene un chofer por id", async () => {
            const res = await request(app).get(`/api/choferes/${datos.idChofer}`).set(authOperador);

            assert.equal(res.status, 200);
            assert.equal(res.body.nombre, "Juan");
        });

        it("responde 404 para un chofer inexistente y 400 para un id mal formado", async () => {
            const inexistente = await request(app).get(`/api/choferes/${ID_INEXISTENTE}`).set(authOperador);
            const malFormado = await request(app).get("/api/choferes/abc").set(authOperador);

            assert.equal(inexistente.status, 404);
            assert.equal(inexistente.body.mensaje, "Chofer no encontrado");
            assert.equal(malFormado.status, 400);
            assert.match(malFormado.body.mensaje, /Id inválido/);
        });
    });

    describe("alta", () => {
        it("crea un chofer y responde { mensaje, chofer }", async () => {
            const res = await request(app).post("/api/choferes").set(authOperador).send(choferValido());

            assert.equal(res.status, 201);
            assert.equal(res.body.mensaje, "Chofer creado");
            assert.equal(res.body.chofer.nombre, "Carlos");
        });

        it("ignora el _id que venga en el body", async () => {
            const res = await request(app)
                .post("/api/choferes")
                .set(authOperador)
                .send({ ...choferValido(), _id: "aaaaaaaaaaaaaaaaaaaaaaaa" });

            assert.equal(res.status, 201);
            assert.notEqual(res.body.chofer._id, "aaaaaaaaaaaaaaaaaaaaaaaa");
        });

        it("rechaza un chofer si faltan campos obligatorios (400)", async () => {
            const res = await request(app).post("/api/choferes").set(authOperador).send({ nombre: "Solo Nombre" });

            assert.equal(res.status, 400);
            assert.equal(res.body.mensaje, "Datos de chofer inválidos");
            assert.equal(res.body.errores.length, 3);
        });
    });

    describe("edición", () => {
        it("PUT parcial solo pisa los campos enviados", async () => {
            const id = await crearChofer();
            const res = await request(app).put(`/api/choferes/${id}`).set(authOperador).send({ zona: "Sur" });

            assert.equal(res.status, 200);
            assert.equal(res.body.mensaje, "Chofer actualizado");
            assert.equal(res.body.chofer.zona, "Sur");
            assert.equal(res.body.chofer.nombre, "Carlos");
        });

        it("PUT sin campos responde 400 y PUT de inexistente 404", async () => {
            const id = await crearChofer();
            const sinCampos = await request(app).put(`/api/choferes/${id}`).set(authOperador).send({});
            const inexistente = await request(app)
                .put(`/api/choferes/${ID_INEXISTENTE}`)
                .set(authOperador)
                .send({ zona: "Sur" });

            assert.equal(sinCampos.status, 400);
            assert.equal(inexistente.status, 404);
        });
    });

    describe("baja", () => {
        it("un operador no puede eliminar un chofer (403)", async () => {
            const id = await crearChofer();
            const res = await request(app).delete(`/api/choferes/${id}`).set(authOperador);

            assert.equal(res.status, 403);
        });

        it("rechaza eliminar un chofer que tiene pedidos asignados (400)", async () => {
            const id = await crearChofer();

            await request(app).post("/api/pedidos").set(authAdmin).send({
                clienteId: datos.idCliente,
                choferId: id,
                items: [{ descripcion: "Caja", cantidad: 1 }],
                fechaHoraProgramada: "2026-12-01T10:00:00"
            });

            const res = await request(app).delete(`/api/choferes/${id}`).set(authAdmin);

            assert.equal(res.status, 400);
            assert.match(res.body.mensaje, /tiene pedidos asignados/);
        });

        it("un admin puede eliminar un chofer sin pedidos", async () => {
            const id = await crearChofer();
            const res = await request(app).delete(`/api/choferes/${id}`).set(authAdmin);

            assert.equal(res.status, 200);
            assert.equal(res.body.mensaje, "Chofer eliminado");
        });

        it("responde 404 al eliminar un chofer inexistente", async () => {
            const res = await request(app).delete(`/api/choferes/${ID_INEXISTENTE}`).set(authAdmin);

            assert.equal(res.status, 404);
        });
    });
});
