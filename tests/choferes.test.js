// tests/choferes.test.js
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
        vehiculos: "Utilitario", // o vehiculo según tu modelo, revisemos abajo
        vehiculo: "Utilitario",
        zona: "Norte"
    });

    before(async () => {
        await iniciarBase();
        datos = await cargarDatos();
        authOperador = { Authorization: `Bearer ${datos.tokenOperador}` };
        authAdmin = { Authorization: `Bearer ${datos.tokenAdmin}` };
    });

    after(cerrarBase);

    describe("listado", () => {
        it("permite listar los choferes", async () => {
            const res = await request(app).get("/api/choferes").set(authOperador);
            assert.equal(res.status, 200);
            assert(Array.isArray(res.body));
        });
    });

    describe("alta", () => {
        it("crea un chofer exitosamente con datos válidos", async () => {
            const res = await request(app)
                .post("/api/choferes")
                .set(authOperador)
                .send(choferValido());

            assert.equal(res.status, 201);
            assert.equal(res.body.nombre, "Carlos");
        });

        it("rechaza un chofer si faltan campos obligatorios (400)", async () => {
            const res = await request(app)
                .post("/api/choferes")
                .set(authOperador)
                .send({ nombre: "Solo Nombre" });

            assert.equal(res.status, 400);
        });
    });

    describe("baja", () => {
        it("un operador no puede eliminar un chofer (403)", async () => {
            const choferRes = await request(app)
                .post("/api/choferes")
                .set(authOperador)
                .send(choferValido());

            const choferId = choferRes.body._id;

            const res = await request(app)
                .delete(`/api/choferes/${choferId}`)
                .set(authOperador);

            assert.equal(res.status, 403);
        });

        it("rechaza eliminar un chofer que tiene pedidos asignados (400)", async () => {
            // 1. Creamos un chofer nuevo
            const choferRes = await request(app)
                .post("/api/choferes")
                .set(authAdmin)
                .send({ nombre: "Chofer Ocupado", apellido: "Test", vehiculo: "Camión", zona: "Oeste" });

            const choferId = choferRes.body._id;

            // 2. Creamos un pedido asociado a este chofer para asegurarnos de que tenga pedidos
            await request(app)
                .post("/api/pedidos")
                .set(authAdmin)
                .send({
                    clienteId: datos.idCliente,
                    choferId: choferId,
                    items: [{ descripcion: "Caja", cantidad: 1 }],
                    fechaHoraProgramada: "2026-12-01T10:00:00"
                });

            // 3. Intentamos borrarlo (debe fallar con 400)
            const res = await request(app)
                .delete(`/api/choferes/${choferId}`)
                .set(authAdmin);

            assert.equal(res.status, 400);
        });

        it("un admin puede eliminar un chofer sin pedidos", async () => {
            const choferRes = await request(app)
                .post("/api/choferes")
                .set(authAdmin)
                .send({ nombre: "Juan", apellido: "Pérez", vehiculo: "Moto", zona: "Sur" });

            const choferId = choferRes.body._id;

            const res = await request(app)
                .delete(`/api/choferes/${choferId}`)
                .set(authAdmin);

            assert.equal(res.status, 204);
        });
    });
});

