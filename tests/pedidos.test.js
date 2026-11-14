// Reglas de negocio de Pedidos (PedidoService) a través de la API
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, ID_INEXISTENTE, iniciarBase, cerrarBase, cargarDatos } = require("./helpers");

describe("Pedidos", () => {
    let datos;
    let auth;

    // body válido de alta; cada test pisa lo que necesita
    const pedidoValido = () => ({
        clienteId: datos.idCliente,
        choferId: datos.idChofer,
        items: [{ descripcion: "Cajón de verdura", cantidad: 2 }],
        fechaHoraProgramada: "2026-12-01T08:00:00"
    });

    const crearPedido = async () => {
        const res = await request(app).post("/api/pedidos").set(auth).send(pedidoValido());
        return res.body.pedido._id;
    };

    const cambiarEstado = (id, estado) =>
        request(app).patch(`/api/pedidos/${id}/estado`).set(auth).send({ estado });

    before(async () => {
        await iniciarBase();
        datos = await cargarDatos();
        auth = { Authorization: `Bearer ${datos.tokenOperador}` };
    });

    after(cerrarBase);

    describe("alta", () => {
        it("crea el pedido en estado pendiente aunque el body mande otro", async () => {
            const res = await request(app)
                .post("/api/pedidos")
                .set(auth)
                .send({ ...pedidoValido(), estado: "entregado" });

            assert.equal(res.status, 201);
            assert.equal(res.body.pedido.estado, "pendiente");
        });

        it("rechaza un cliente que no existe (400)", async () => {
            const res = await request(app)
                .post("/api/pedidos")
                .set(auth)
                .send({ ...pedidoValido(), clienteId: ID_INEXISTENTE });

            assert.equal(res.status, 400);
            assert.match(res.body.mensaje, /cliente/);
        });

        it("rechaza un chofer que no existe (400)", async () => {
            const res = await request(app)
                .post("/api/pedidos")
                .set(auth)
                .send({ ...pedidoValido(), choferId: ID_INEXISTENTE });

            assert.equal(res.status, 400);
            assert.match(res.body.mensaje, /chofer/);
        });

        it("rechaza un pedido sin ítems (400)", async () => {
            const res = await request(app)
                .post("/api/pedidos")
                .set(auth)
                .send({ ...pedidoValido(), items: [] });

            assert.equal(res.status, 400);
        });

        it("rechaza cantidad 0 por el schema de Mongoose (400)", async () => {
            const res = await request(app)
                .post("/api/pedidos")
                .set(auth)
                .send({ ...pedidoValido(), items: [{ descripcion: "x", cantidad: 0 }] });

            assert.equal(res.status, 400);
        });
    });

    describe("transiciones de estado", () => {
        it("recorre pendiente → asignado → en tránsito → entregado de a un paso", async () => {
            const id = await crearPedido();

            for (const estado of ["asignado", "en tránsito", "entregado"]) {
                const res = await cambiarEstado(id, estado);
                assert.equal(res.status, 200);
                assert.equal(res.body.pedido.estado, estado);
            }
        });

        it("no permite saltear estados", async () => {
            const id = await crearPedido();
            const res = await cambiarEstado(id, "en tránsito");

            assert.equal(res.status, 400);
            assert.match(res.body.mensaje, /Transición inválida/);
        });

        it("no permite retroceder", async () => {
            const id = await crearPedido();
            await cambiarEstado(id, "asignado");
            const res = await cambiarEstado(id, "pendiente");

            assert.equal(res.status, 400);
        });

        it("no permite avanzar un pedido entregado", async () => {
            const id = await crearPedido();
            for (const estado of ["asignado", "en tránsito", "entregado"]) {
                await cambiarEstado(id, estado);
            }
            const res = await cambiarEstado(id, "entregado");

            assert.equal(res.status, 400);
        });

        it("rechaza un estado que no existe", async () => {
            const id = await crearPedido();
            const res = await cambiarEstado(id, "cancelado");

            assert.equal(res.status, 400);
            assert.match(res.body.mensaje, /Estado inválido/);
        });

        it("PUT no modifica el estado", async () => {
            const id = await crearPedido();
            const res = await request(app)
                .put(`/api/pedidos/${id}`)
                .set(auth)
                .send({ fechaHoraProgramada: "2026-12-02T09:00:00", estado: "entregado" });

            assert.equal(res.status, 200);
            assert.equal(res.body.pedido.estado, "pendiente");
            assert.equal(res.body.pedido.fechaHoraProgramada, "2026-12-02T09:00:00");
        });

        it("responde 404 para un pedido inexistente", async () => {
            const res = await cambiarEstado(ID_INEXISTENTE, "asignado");

            assert.equal(res.status, 404);
        });
    });

    describe("historial de estados", () => {
        it("registra el estado inicial y cada transición con el usuario del token", async () => {
            const id = await crearPedido();
            await cambiarEstado(id, "asignado");

            const res = await request(app).get(`/api/pedidos/${id}`).set(auth);
            const { historial } = res.body;

            assert.equal(res.status, 200);
            assert.deepEqual(historial.map((h) => h.estado), ["pendiente", "asignado"]);
            for (const entrada of historial) {
                assert.equal(entrada.usuarioId.nombre, "Operador");
                assert.ok(entrada.fecha);
            }
        });

        it("no toma el usuario del body", async () => {
            const res = await request(app)
                .post("/api/pedidos")
                .set(auth)
                .send({ ...pedidoValido(), usuarioId: "aaaaaaaaaaaaaaaaaaaaaaaa" });

            assert.equal(res.status, 201);
            assert.notEqual(String(res.body.pedido.historial[0].usuarioId), "aaaaaaaaaaaaaaaaaaaaaaaa");
        });

        it("GET por id devuelve clienteId y choferId como ids, igual que el listado", async () => {
            const id = await crearPedido();
            const res = await request(app).get(`/api/pedidos/${id}`).set(auth);

            assert.equal(res.body.clienteId, datos.idCliente);
            assert.equal(res.body.choferId, datos.idChofer);
        });
    });

    describe("baja", () => {
        it("el operador no puede borrar (403)", async () => {
            const id = await crearPedido();
            const res = await request(app).delete(`/api/pedidos/${id}`).set(auth);

            assert.equal(res.status, 403);
        });

        it("el admin sí puede borrar", async () => {
            const id = await crearPedido();
            const res = await request(app)
                .delete(`/api/pedidos/${id}`)
                .set("Authorization", `Bearer ${datos.tokenAdmin}`);

            assert.equal(res.status, 200);
        });
    });
});
