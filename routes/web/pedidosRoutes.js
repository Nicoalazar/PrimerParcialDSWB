const express = require("express");
const router = express.Router();

const JsonRepository = require("../../repositories/JsonRepository");
const pedidoService = require("../../services/PedidoService");

const pedidosRepo = new JsonRepository("pedidos.json");
const clientesRepo = new JsonRepository("clientes.json");
const choferesRepo = new JsonRepository("choferes.json");

const ESTADOS = ["pendiente", "asignado", "en tránsito", "entregado"];

// GET / - Listado de pedidos
router.get("/", (req, res) => {
    const pedidos = pedidosRepo.getAll();
    const clientes = clientesRepo.getAll();
    const choferes = choferesRepo.getAll();

    // Mapeamos nombres para facilitar la lectura en la tabla
    const pedidosConDatos = pedidos.map((p) => {
        const cliente = clientes.find((c) => c.id === p.clienteId);
        const chofer = choferes.find((ch) => ch.id === p.choferId);
        return {
            ...p,
            clienteNombre: cliente ? cliente.nombre : `ID ${p.clienteId}`,
            choferNombre: chofer ? chofer.nombre : `ID ${p.choferId}`
        };
    });

    res.render("pedidos/lista", { titulo: "Pedidos", pedidos: pedidosConDatos });
});

// GET /nuevo - Formulario de creación
router.get("/nuevo", (req, res) => {
    const clientes = clientesRepo.getAll();
    const choferes = choferesRepo.getAll();
    res.render("pedidos/form", { titulo: "Nuevo pedido", clientes, choferes });
});

// POST / - Crear pedido
router.post("/", (req, res, next) => {
    try {
        const { clienteId, choferId, items, fechaHoraProgramada } = req.body;

        // Si items viene en formato texto separado por comas o saltos, normalizamos a array
        const itemsArray = typeof items === "string"
            ? items.split(",").map((i) => i.trim()).filter(Boolean)
            : items;

        pedidoService.crearPedido({
            clienteId,
            choferId,
            items: itemsArray,
            fechaHoraProgramada
        });

        res.redirect("/pedidos");
    } catch (error) {
        next(error);
    }
});

// GET /:id - Detalle del pedido
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const pedido = pedidosRepo.getById(id);

    if (!pedido) {
        return res.redirect("/pedidos");
    }

    const cliente = clientesRepo.getById(pedido.clienteId);
    const chofer = choferesRepo.getById(pedido.choferId);

    const indiceActual = ESTADOS.indexOf(pedido.estado);
    const proximoEstado = indiceActual < ESTADOS.length - 1 ? ESTADOS[indiceActual + 1] : null;

    res.render("pedidos/detalle", {
        titulo: `Pedido #${pedido.id}`,
        pedido,
        cliente,
        chofer,
        proximoEstado
    });
});

// POST /:id/estado - Avanzar estado vía PedidoService
router.post("/:id/estado", (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const pedido = pedidosRepo.getById(id);

        if (!pedido) {
            return res.redirect("/pedidos");
        }

        const indiceActual = ESTADOS.indexOf(pedido.estado);
        if (indiceActual < ESTADOS.length - 1) {
            const siguienteEstado = ESTADOS[indiceActual + 1];
            pedidoService.cambiarEstado(id, siguienteEstado);
        }

        res.redirect(`/pedidos/${id}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;




