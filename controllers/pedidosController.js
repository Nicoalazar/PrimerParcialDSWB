const PedidoService = require("../services/PedidoService");
const JsonRepository = require("../repositories/JsonRepository");

const pedidosRepo = new JsonRepository("pedidos.json");
const choferesRepo = new JsonRepository("choferes.json");

// GET ALL
const obtenerPedidos = (req, res) => {
    const pedidos = pedidosRepo.getAll();
    res.json(pedidos);
};

// GET BY ID
const obtenerPedidoPorId = (req, res) => {
    const id = parseInt(req.params.id);
    const pedido = pedidosRepo.getById(id);

    if (!pedido) {
        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });
    }

    res.json(pedido);
};

// CREATE (Usa PedidoService)
const crearPedido = (req, res) => {
    try {
        const pedidoCreado = PedidoService.crearPedido(req.body);
        res.status(201).json({
            mensaje: "Pedido creado",
            pedido: pedidoCreado
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            mensaje: error.message
        });
    }
};

// UPDATE
const actualizarPedido = (req, res) => {
    const id = parseInt(req.params.id);
    const { clienteId, choferId, items, fechaHoraProgramada } = req.body;

    const datos = {};
    if (clienteId !== undefined) datos.clienteId = clienteId;
    if (choferId !== undefined) datos.choferId = choferId;
    if (items !== undefined) datos.items = items;
    if (fechaHoraProgramada !== undefined) datos.fechaHoraProgramada = fechaHoraProgramada;

    const pedido = pedidosRepo.update(id, datos);

    if (!pedido) {
        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });
    }

    res.json({
        mensaje: "Pedido actualizado",
        pedido
    });
};

// DELETE
const eliminarPedido = (req, res) => {
    const id = parseInt(req.params.id);
    const eliminado = pedidosRepo.delete(id);

    if (!eliminado) {
        return res.status(404).json({
            mensaje: "Pedido no encontrado"
        });
    }

    res.json({
        mensaje: "Pedido eliminado"
    });
};

// PATCH estado (Usa PedidoService)
const cambiarEstado = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { estado } = req.body;

        const pedidoActualizado = PedidoService.cambiarEstado(id, estado);

        res.json({
            mensaje: "Estado actualizado",
            pedido: pedidoActualizado
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            mensaje: error.message
        });
    }
};

// GET choferes (solo lectura del seed)
const listarChoferes = (req, res) => {
    const choferes = choferesRepo.getAll();
    res.json(choferes);
};

module.exports = {
    obtenerPedidos,
    obtenerPedidoPorId,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    cambiarEstado,
    listarChoferes
};